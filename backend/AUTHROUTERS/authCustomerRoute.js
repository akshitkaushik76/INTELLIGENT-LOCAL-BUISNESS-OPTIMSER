const express = require('express');
const AuthController = require('./../AUTHCONTROLLERS/Authcontroller')
const router = express.Router();
router.route('/loginOwner').post(AuthController.loginCustomer);

module.exports = router;