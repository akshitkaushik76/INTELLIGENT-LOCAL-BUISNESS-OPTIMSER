const express = require('express');
const OwnerController = require('./../CONTROLLERS/OwnerController');
const router = express.Router();

router.route('/RegisterOwner').post(OwnerController.OwnerRegistration);
router.route('/getAllOwner').get(OwnerController.getAllOwners);
router.route('/updateOwner/:phoneNumber').patch(OwnerController.patchOwner);
router.route('/newBuisness/:code').post(OwnerController.createNewBuisness);
module.exports = router;
