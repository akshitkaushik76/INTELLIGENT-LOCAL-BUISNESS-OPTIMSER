const express = require('express');
const AuthController = require('../AUTHCONTROLLERS/Authcontroller')
const router = express.Router();
router.route('/loginCustomer').post(AuthController.loginCustomer);
router.route('/loginOwner').post(AuthController.loginOwner);


module.exports = router;