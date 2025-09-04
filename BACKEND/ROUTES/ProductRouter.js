const express = require('express');
const ProductController = require('./../CONTROLLERS/ProductsController');
const router = express.Router();
router.route('/addProduct').post(ProductController.addProduct);
router.route('/updateProduct/:Name/:code').patch(ProductController.patchProduct);
router.route('/getProduct/:Name/:code').get(ProductController.getProduct);
module.exports = router;