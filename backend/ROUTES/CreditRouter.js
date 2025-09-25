const express = require('express');
const CreditController = require('../CONTROLLERS/CreditController');
const router = express.Router();
// router.route('/addCredit').post(CreditController.createCredits);
router.route('/addCredit/:OrganisationCode/:BuisnessCode').post(CreditController.createCredits);
router.route('/updateCredit/:OrganisationCode/:BuisnessCode/:uniqueCode').patch(CreditController.updateCredit);
router.route('/SettleCreditChunk/:BuisnessCode').post(CreditController.settleCreditChunk);
module.exports = router;