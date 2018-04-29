const Pet = require('../models/pet');
const Customer = require('../models/customer');

const async = require('async');
const mongoose = require('mongoose');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

mongoose.set('debug', true);


exports.list = [
  (req, res, next) => {
    Pet.find({}).exec((error, data) => {
      if (error) { res.send(error); } else {
        res.render('pet_list', { data });
      }
    });
  },
];


exports.pet_list = [
  (req, res, next) => {
    Pet.find({}).exec((error, data) => {
      if (error) { res.send(error); } else {
        res.json(data);
      }
    });
  },
];
// Handle Pet create on POST.
exports.pet_post = [
  // Validate fields.
  body('name').isLength({ min: 1 }).trim().withMessage('name must be specified.'),
  body('available_from', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
  body('age').isLength({ min: 1 }).trim().withMessage('age must be specified.'),
  body('species').isLength({ min: 1 }).trim().withMessage('species must be specified.')
    .isIn(['cat', 'dog', 'rabbit'])
    .withMessage('must be in \'cat\', \'dog\', \'rabbit\' '),

  body('breed').isLength({ min: 1 }).trim().withMessage('breed needs to be specified')
    .isIn(['labrador', 'poodle', 'spaniel', 'terrier'])
    .withMessage('must be in labrador,poodle,spaniel, terrier  '),
  // Sanitize fields.
  sanitizeBody('name').trim().escape(),
  sanitizeBody('available_from').toDate(),
  sanitizeBody('age').escape(),
  sanitizeBody('species').escape(),
  sanitizeBody('breed').escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.json({ errors: errors.array() });
    } else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      const pet = new Pet({
        name: req.body.name,
        available_from: req.body.available_from,
        age: req.body.age,
        species: req.body.species,
        breed: req.body.breed,
      });
      pet.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        res.json({ status: 'ok', pet });
      });
    }
  },
];

/**
 * Return the pet object given by the id
 * @param req
 * @param res
 * @param next
 */
exports.pet_get = function (req, res, next) {
  Pet.findById(req.params.id).exec((err, pet) => {
    if (err) res.send(err);
    res.json(pet);
  });
};

exports.get_match_customers = function (req, res, next) {
  Pet.findById(req.params.id).exec((err, pet) => {
    if (err) res.send(err);
    if (pet.customer !== null) {
      res.json([]);
    }
    // get the age, species and breed
    const age = pet.age;
    const species = pet.species;
    const breed = pet.breed;
    // find the match from customer db
    if (species === 'dog') {
      // search for customers with preference with dog, species and age preference
      Customer.find({
        pet: null,


      }).populate({
        path: 'preference',
        match: {
          species,
          'age.minimum': { $lte: age },
          'age.maximum': { $gte: age },
          breed,
        },
        select: 'breed species age',
      }).exec((error, customers) => {
        if (error) { res.send(error); } else {
          // do a filter because of how mongodb works https://stackoverflow.com/questions/11303294/querying-after-populate-in-mongoose
          const customers_filtered = customers.filter(c => c.preference !== null);
          res.json(customers_filtered);
        }
      });
    } else {
      // search for customers with preference with other pets
      Customer.find({
        'preference.species': species,
        'preference.age.minimum': { $lte: age },
        'preference.age.maximum': { $gte: age },

      }).populate({
        path: 'preference',
        match: {
          species,
          'age.minimum': { $lte: age },
          'age.maximum': { $gte: age },
          breed,

        },
        select: 'breed species age',
      }).exec((error, customers) => {
        if (error) { res.send(error); } else {
          // do a filter because of how mongodb works https://stackoverflow.com/questions/11303294/querying-after-populate-in-mongoose
          const customers_filtered = customers.filter(c => c.preference !== null);
          res.json(customers_filtered);
        }
      });
    }
  });
};

