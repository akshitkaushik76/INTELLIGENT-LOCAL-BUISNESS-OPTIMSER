const express = require('express');
const OwnerController = require('./../CONTROLLERS/OwnerController');
const router = express.Router();

router.route('/RegisterOwner').post(OwnerController.OwnerRegistration);
module.exports = router;
