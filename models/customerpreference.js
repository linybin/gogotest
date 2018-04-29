const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const moment = require('moment');

const CustomerPreferenceSchema = new Schema({
  age: {type: {minimum: Number, maximum: Number}}, // [minAge, maxAge]
  species: [String],
  breed: [String],

});


// Export model
module.exports = mongoose.model('CustomerPreference', CustomerPreferenceSchema);
