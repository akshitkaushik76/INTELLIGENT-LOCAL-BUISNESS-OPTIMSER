const express = require('express');
const CustomerController = require('./../CONTROLLERS/CustomerController');
const router = express.Router();
router.route('/CustomerRegister').post(CustomerController.registerCustomer);
router.route('/getCustomer/:phoneNumber').get(CustomerController.getCustomers);
router.route('/updateCustomer/:phoneNumber').patch(CustomerController.patchCustomer);
router.route('/newSubscription/:phoneNumber').patch(CustomerController.SubscribetonewOrganisation);

module.exports = router;
