/*
Router for the pet app
 */
const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const customerController = require('../controllers/customerController');
const homeController = require('../controllers/homeController')
//routes for api
router.post('/api/pets', petController.pet_post);
router.get('/api/pets/:id', petController.pet_get);
router.get('/api/pets/:id/matches', petController.get_match_customers);

router.get('/api/customer/:id', customerController.customer_get);
router.post('/api/customer', customerController.customer_post);
router.get('/api/customer/:id/matches', customerController.get_match_pets)

router.post('/api/customer/:id/adopt', customerController.adopt_pet)

//routes for applications
router.get('/app/pets/:id', petController.pet_get);
router.get('/app/pets', petController.list);
router.get('/app/pets/:id/matches', petController.get_match_customers)

router.get('/app/customers/:id', customerController.customer_get);
router.get('/app/customers', customerController.list);
router.get('/app/customers/:id/matches', customerController.get_match_pets)

//home page
router.get('/', homeController.index)




module.exports = router;
