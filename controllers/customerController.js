const Customer = require('../models/customer');
const async = require('async');
const Preference = require('../models/customerpreference');
const Pet = require('../models/pet');
const {
  body, validationResult, query, param,
} = require('express-validator/check');
const { sanitizeBody, sanitizeQuery } = require('express-validator/filter');
const MatchingService = require('../services/matcheservice');

exports.list = [
  (req, res, next) => {
    Customer.find({}).populate('preference').exec((err, data) => {
      if (err) { res.send(err); } else {
        // find matched pets for each customer
        let itemProcessed = 0;
        data.forEach((value, index) => {
          MatchingService.find_matched_pet(value._id, (err, pets) => {
            if (err) { res.send(err); } else {
              data[index].matchedPets = pets;
              itemProcessed++;
            }
            if (itemProcessed == data.length) {
              res.render('customer_list', { data });
            }
          });
        });
      }
    });
  },
];


exports.customer_list = [
  (req, res, next) => {
    Customer.find({}).populate('preference').exec((err, data) => {
      if (err) { res.send(err); } else {
        res.json(data);
      }
    });
  },
];

exports.customer_post = [
  // Validate fields.
  body('name').isLength({ min: 1 }).trim().withMessage('name must be specified.'),

  // Sanitize fields.
  sanitizeBody('name').trim().escape(),


  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.json({ errors: errors.array() });
    } else {
      // Data from form is valid.
      // Create an customer object with escaped and trimmed data.
      const customer = new Customer({
        name: 'Ben ',
        preference: new Preference({
          age: req.body.preference.age,
          species: req.body.preference.species,
          breed: req.body.preference.breed,
        }),
      });
      customer.save((err, result) => {
        if (err) {
          res.send(err);
        }
        // Successful - redirect to new author record.
        res.json({ status: 'ok', customer: result });
      });
    }
  },
];

/**
 * Get the customer by id
 * @param req
 * @param res
 * @param next
 */
exports.customer_get = function (req, res, next) {
  Customer.findById(req.params.id).exec((err, customer) => {
    if (err) res.send(err);
    res.json(customer);
  });
};

/**
 * Get matched pets based on customer's preference
 * @param req
 * @param res
 * @param next
 */
exports.get_match_pets = function (req, res, next) {
  Customer.findById(req.params.id).populate('preference').exec((err, c) => {
    if (err) res.send(err);
    else {
      // Assuming one customer allows one adoption
      if (c.pet !== null) { res.json([]); } else {
        // get the age, species and breed
        const ageOfPreference = c.preference.age;
        const speciesOfPreference = c.preference.species;
        const breedOfPreference = c.preference.breed;

        // find the match from pets db
        Pet.find({
          age: { $gte: ageOfPreference.minimum, $lte: ageOfPreference.maximum },
          species: {
            $in: speciesOfPreference,
          },
          breed: {
            $in: breedOfPreference,
          },
          customer: null,
        }).exec((error, result) => {
          if (error) { res.send(error); } else {
            res.json(result);
          }
        });
      }
    }
  });
};

exports.adopt_pet = [
  // Validate fields.
  param('id').isLength({ min: 1 }).trim().withMessage('id must be specified.'),
  query('pet_id').isLength({ min: 1 }).trim().withMessage('pet_id must be specified.'),

  // Sanitize fields.
  sanitizeBody('id').trim().escape(),
  sanitizeQuery('pet_id').trim().escape(),
  (req, res, next) => {
    const id = req.params.id;
    const pet_id = req.query.pet_id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.json({ errors: errors.array() });
    } else {
      async.parallel({
        pet(callback) {
          Pet.find({
            _id: pet_id,
            customer: null,
          }).exec(callback);
        },
        customer(callback) {
          Customer.find({
            _id: id,
            pet: null,
          }).exec(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }
        if (results.pet && results.customer) {
          // because mongodb does not accept transactions yet(will be released soon), we have do more things here
          Customer.update({ _id: id }, { pet: pet_id }, (err) => {
            if (err) {
              res.send(err);
            } else {
              Pet.update({ _id: pet_id }, { customer: id }, (error, number, response) => {
                if (error) {
                  // roll back customer data
                  Customer.update({ _id: id }, { pet: null }, () => {});
                  // log error
                  res.send(error);
                } else {
                  res.json({ status: 'ok', number_affected: number });
                }
              });
            }
          });
        }
      });
    }
  },

];
