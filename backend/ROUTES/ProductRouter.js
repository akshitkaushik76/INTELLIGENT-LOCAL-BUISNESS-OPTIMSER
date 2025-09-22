const express = require('express');
const ProductController = require('./../CONTROLLERS/ProductsController');
const router = express.Router();
router.route('/addProduct/:BuisnessCode').post(ProductController.addProduct);
// router.route('/updateProduct/:Name/:code').patch(ProductController.patchProduct);
router.route('/updateProduct/:productcode/:OrganisationCode').patch(ProductController.updateProduct);
router.route('/getProduct/:productcode').get(ProductController.getProduct);
router.route('/getAllProduct/:BuisnessCode').get(ProductController.getAllProduct);
module.exports = router;