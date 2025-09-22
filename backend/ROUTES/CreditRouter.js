const express = require('express');
const CreditController = require('../CONTROLLERS/CreditController');
const router = express.Router();
// router.route('/addCredit').post(CreditController.createCredits);
router.route('/addCredit/:OrganisationCode/:BuisnessCode').post(CreditController.createCredits);
router.route('/updateCredit/:code/:OrganisationCode').patch(CreditController.updateCredit);
module.exports = router;