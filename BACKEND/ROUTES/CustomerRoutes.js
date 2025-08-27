const express = require('express');
const CustomerController = require('./../CONTROLLERS/CustomerController');
const router = express.Router();
router.route('/CustomerRegister').post(CustomerController.registerCustomer);

module.exports = router;
