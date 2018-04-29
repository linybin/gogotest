// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const Customer = require('../models/customer');
const Preference = require('../models/customerpreference');
const Pet = require('../models/pet');
const app = require('../app');

mongoose.set('debug', true);
chai.use(chaiHttp);


describe('Customers', () => {
  beforeEach((done) => { // Before each test we empty the database
    Pet.remove({}, () => {
      Preference.remove({}, () => {
        Customer.remove({}, () => {
          done();
        });
      });
    });
  });

  describe('GET /customers/{id} ', () => {
    it('it should GET a customer by the given id', (done) => {
      const customer = new Customer({
        name: 'Ben ',
        preference: new Preference({
          age: 22,
          species: ['cat', 'dog'],
          breed: ['laberador, terrier'],
        }),
      });
      customer.save((err, result) => {
        chai.request(app)
          .get(`/api/customer/${result.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name').eq(result.name);
            done();
          });
      });
    });
  });

  describe('POST /customers', () => {
    it('it should post a customer', (done) => {
      const customer = {
        name: 'Ben ',
        preference: {
          age: 22,
          species: ['cat', 'dog'],
          breed: ['laberador', 'terrier'],
        },
      };
      chai.request(app)
        .post('/api/customer')
        .send(customer)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('ok');
          res.body.customer.should.have.property('name').eq(customer.name);
          done();
        });
    });
  });

  describe(' /customers/{id}/matches', () => {
    it('it should get the lists of dogs that match ', (done) => {
      const pet1 = new Pet({
        name: 'cat A',
        available_from: new Date('01.02.2019'),
        age: 5,
        species: 'cat',
      });
      const pet2 = new Pet({
        name: 'dogLabrador',
        available_from: new Date('01.02.2019'),
        age: 3,
        species: 'dog',
        breed: 'labrador',
      });
      const pet3 = new Pet({
        name: 'dogTerrier',
        available_from: new Date('01.02.2019'),
        age: 5,
        species: 'dog',
        breed: 'terrier',
        customer: mongoose.Types.ObjectId()
      });
      const pet4 = new Pet({
        name: 'anotherDogLabrador',
        available_from: new Date('01.02.2019'),
        age: 2,
        species: 'dog',
        breed: 'poodle'


      });
      Pet.collection.insert([pet1, pet2, pet3, pet4], () => {
        const preferenceOfCustomer = Preference({
          species: ['dog'],
          breed: ['labrador', 'terrier'],
          age: {
            minimum: 3,
            maximum: 7,
          },
        });
        preferenceOfCustomer.save(() => {
          const customer = new Customer({
            name: 'Ben',
            preference: preferenceOfCustomer._id,
          });
          customer.save(() => {
            chai.request(app)
              .get(`/api/customer/${customer._id}/matches`)

              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(1);
                res.body[0].age.should.be.within(3, 7);
                preferenceOfCustomer.species.should.includes(res.body[0].species);
                preferenceOfCustomer.breed.should.includes(res.body[0].breed);
                done();
              });
          });
        });
      });
    });

    it('customer should disappear in matches if it has adopted dogs ', (done) => {
      const pet1 = new Pet({
        name: 'cat A',
        available_from: new Date('01.02.2019'),
        age: 5,
        species: 'cat',
      });
      const pet2 = new Pet({
        name: 'dogLabrador',
        available_from: new Date('01.02.2019'),
        age: 3,
        species: 'dog',
        breed: 'labrador',
      });
      const pet3 = new Pet({
        name: 'dogTerrier',
        available_from: new Date('01.02.2019'),
        age: 5,
        species: 'dog',
        breed: 'terrier',
      });
      const pet4 = new Pet({
        name: 'anotherDogLabrador',
        available_from: new Date('01.02.2019'),
        age: 2,
        species: 'dog',
        breed: 'poodle',
      });
      Pet.collection.insert([pet1, pet2, pet3, pet4], () => {
        const preferenceOfCustomer = Preference({
          species: ['dog'],
          breed: ['labrador', 'terrier'],
          age: {
            minimum: 3,
            maximum: 7,
          },
        });
        preferenceOfCustomer.save(() => {
          const customer = new Customer({
            name: 'Ben',
            pet: pet4._id,
            preference: preferenceOfCustomer._id,
          });
          customer.save(() => {
            chai.request(app)
                .get(`/api/customer/${customer._id}/matches`)

                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  res.body.length.should.be.eql(0);

                  done();
                });
          });
        });
      });
    });





  });
  describe('POST /customers/{id}/adopt?pet_id={pet_id}', () => {
    it('customer can adopt the pet if both are available', (done) => {
      // create a pet
      const pet = new Pet({
        name: 'cat A',
        available_from: new Date('01.02.2019'),
        age: 5,
        species: 'cat',
      });

      pet.save(() => {
        const preferenceOfCustomer = Preference({
          species: ['dog'],
          breed: ['labrador', 'terrier'],
          age: {
            minimum: 3,
            maximum: 7,
          },
        });

        preferenceOfCustomer.save(() => {
          const customer = new Customer({
            name: 'Ben',
            preference: preferenceOfCustomer._id,
          });
          customer.save(() => {
            chai.request(app)
              .post(`/api/customer/${customer._id}/adopt?pet_id=${pet._id}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('status').eq('ok');
                done();
              });
          });
        });
      });
    });






  });
});
