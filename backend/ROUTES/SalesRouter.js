const express = require('express');
const salesController = require('../CONTROLLERS/SalesController');
const router = express.Router();

router.route('/addSales/:OrganisationCode/:BuisnessCode').patch(salesController.CreateSale);