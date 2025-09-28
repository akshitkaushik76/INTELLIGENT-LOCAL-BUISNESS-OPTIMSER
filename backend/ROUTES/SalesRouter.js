const express = require('express');
const salesController = require('../CONTROLLERS/SalesController');
const router = express.Router();

router.route('/addSales/:OrganisationCode/:BuisnessCode').post(salesController.CreateSale);
router.route('/profitThisDay/:OrganisationCode/:BuisnessCode').get(salesController.findProfitperday);
module.exports = router;