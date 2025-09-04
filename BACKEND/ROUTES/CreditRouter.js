const express = require('express');
const CreditController = require('../CONTROLLERS/CreditController');
const router = express.Router();
router.route('/addCredit').post(CreditController.createCredits);

module.exports = router;