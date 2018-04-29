const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const moment = require('moment');

const PetSchema = new Schema({

  name: { type: String, required: true },
  available_from: { type: Date },
  age: { type: Number, required: true },
  species: { type: String, enum: ['cat', 'dog', 'rabbit'] },
  breed: { type: String, enum: ['labrador', 'poodle', 'spaniel', 'terrier'] },
  customer: { type: Schema.ObjectId, ref: 'Customer', default: null },

});


// Virtual for author's formatted available_from

PetSchema
  .virtual('available_from_formatted')
  .get(function () {
    return this.available_from ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
  });

PetSchema.set('available_from_formatted', { getters: true });
// Export model
module.exports = mongoose.model('Pet', PetSchema);
