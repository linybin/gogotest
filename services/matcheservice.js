
Customer = require('../models/customer')
Pet = require('../models/pet')
exports.find_matched_pet = (id, call) =>{
  Customer.findById(id).populate('preference').exec((err, c) => {
    if (err) {call(err,c)}
    else {
      // Assuming one customer allows one adoption
      if (c.pet !== null) { call(err, []) } else {
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
          call(error, result)
        });
      }
    }
  });

}

