const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const moment = require('moment');

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  preference: { type: Schema.ObjectId, ref: 'CustomerPreference', required: true },
  pet: { type: Schema.ObjectId, ref: 'Pet' , default:null},
});


// Export model
module.exports = mongoose.model('Customer', CustomerSchema);
