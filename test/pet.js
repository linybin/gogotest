// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const Pet = require('../models/pet');
const Customer = require('../models/customer');
const Preference = require('../models/customerpreference');

const app = require('../app');

chai.use(chaiHttp);

// Our parent block
describe('Pets', () => {
  beforeEach((done) => { // Before each test we empty the database
    Pet.remove({}, (err) => {
      Preference.remove({}, () => {
        Customer.remove({}, (error) => {
          done();
        });
      });
    });
  });

  describe('GET /pets/{id} ', () => {
    it('it should GET a pet by the given id', (done) => {
      const pet = new Pet({
        name: 'Ter',
        available_from: new Date('01.02.2019'),
        age: 2,
        species: 'dog',
        breed: 'labrador',
      });
      pet.save((err, result) => {
        chai.request(app)
          .get(`/api/pets/${result.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name').eq(result.name);
            res.body.should.have.property('age').eq(result.age);
            res.body.should.have.property('species').eq(result.species);
            res.body.should.have.property('breed').eq(result.breed);
            done();
          });
      });
    });
  });

  describe('POST /pets', () => {
    it('it should Post a pet', (done) => {
      const pet = new Pet({
        name: 'Ter',
        available_from: new Date('01.02.2019'),
        age: 2,
        species: 'dog',
        breed: 'labrador',
      });
      chai.request(app)
        .post('/api/pets')
        .send(pet)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('ok');
          res.body.pet.should.have.property('name').eq(pet.name);
          res.body.pet.should.have.property('age').eq(pet.age);
          res.body.pet.should.have.property('species').eq(pet.species);
          res.body.pet.should.have.property('breed').eq(pet.breed);
          done();
        });
    });
  });

  describe(' /pets/{id}/matches', () => {
    it('it should get the lists of customers that match ', (done) => {
      const pet = new Pet({
        name: 'Ter',
        available_from: new Date('01.02.2019'),
        age: 2,
        species: 'dog',
        breed: 'labrador',
      });
      const customerOnePreference = new Preference({
        age: { minimum: 0, maximum: 1 },
        species: ['dog'],
        breed: ['labrador', 'terrier'],
      });

      const customerTwoPreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat'],
        breed: [],
      });

      const customerThreePreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat', 'dog'],
        breed: ['labrador', 'terrier'],
      });

      const customerFourPreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat', 'dog'],
        breed: ['labrador', 'terrier'],
      });
      Preference.collection.insert([customerOnePreference, customerTwoPreference, customerThreePreference, customerFourPreference], (err, docs) => {
        const customerOne = {
          name: 'Ben ',
          preference: customerOnePreference._id,
        };
        const customerTwo = {
          name: 'Ken ',
          preference: customerTwoPreference._id,
        };
        const customerThree = {
          name: 'Den ',
          preference: customerThreePreference._id,
        };
        const customerFour = {
          name: 'Ian ',
          pet: mongoose.Types.ObjectId(),
          preference: customerFourPreference._id,
        };
        Customer.collection.insert([customerOne, customerTwo, customerThree, customerFour], (err, docs) => {
          const pet = new Pet({
            name: 'Ter',
            available_from: new Date('01.02.2019'),
            age: 2,
            species: 'dog',
            breed: 'labrador',
          });
          pet.save((err, result) => {
            chai.request(app)
              .get(`/api/pets/${result.id}/matches`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(1);
                done();
              });
          });
        });
      });
    });
    it('it should no customers if it is adpoted  ', (done) => {
      const customerOnePreference = new Preference({
        age: { minimum: 0, maximum: 1 },
        species: ['dog'],
        breed: ['labrador', 'terrier'],
      });

      const customerTwoPreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat'],
        breed: [],
      });

      const customerThreePreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat', 'dog'],
        breed: ['labrador', 'terrier'],
      });

      const customerFourPreference = new Preference({
        age: { minimum: 0, maximum: 2 },
        species: ['cat', 'dog'],
        breed: ['labrador', 'terrier'],
      });
      Preference.collection.insert([customerOnePreference, customerTwoPreference, customerThreePreference, customerFourPreference], (err, docs) => {
        const customerOne = {
          name: 'Ben ',
          preference: customerOnePreference._id,
        };
        const customerTwo = {
          name: 'Ken ',
          preference: customerTwoPreference._id,
        };
        const customerThree = {
          name: 'Den ',
          preference: customerThreePreference._id,
        };
        const customerFour = {
          name: 'Ian ',
          pet: mongoose.Types.ObjectId(),
          preference: customerFourPreference._id,
        };
        Customer.collection.insert([customerOne, customerTwo, customerThree, customerFour], (err, docs) => {
          const pet = new Pet({
            name: 'Ter',
            available_from: new Date('01.02.2019'),
            age: 2,
            species: 'dog',
            breed: 'labrador',
            customer: mongoose.Types.ObjectId(),
          });
          pet.save((err, result) => {
            chai.request(app)
              .get(`/api/pets/${result.id}/matches`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Array');
                res.body.length.should.be.eql(0);
                done();
              });
          });
        });
      });
    });
  });
});
