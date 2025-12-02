const express = require('express');
const CustomerController = require('./../CONTROLLERS/CustomerController');
const AuthController = require('./../AUTHCONTROLLERS/Authcontroller');
const router = express.Router();
router.route('/CustomerRegister').post(CustomerController.registerCustomer);
router.route('/getCustomer/:phoneNumber').get(AuthController.protectOwner,CustomerController.getCustomers);
router.route('/updateCustomer/:phoneNumber').patch(AuthController.protectCustomer,CustomerController.patchCustomer);
router.route('/newSubscription/:phoneNumber').patch(AuthController.protectCustomer,CustomerController.SubscribetonewOrganisation);


module.exports = router;
