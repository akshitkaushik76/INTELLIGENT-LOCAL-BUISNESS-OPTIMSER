const express = require('express');
const CreditController = require('../CONTROLLERS/CreditController');
const router = express.Router();
// router.route('/addCredit').post(CreditController.createCredits);
router.route('/addCredit/:OrganisationCode/:BuisnessCode').post(CreditController.createCredits);
router.route('/updateCredit/:OrganisationCode/:BuisnessCode/:uniqueCode').patch(CreditController.updateCredit);
router.route('/SettleCreditChunk/:BuisnessCode').post(CreditController.settleCreditChunk);
module.exports = router;

// async function getTotalCredits(email) {
//     const name = await Customers.findOne({emailid:email});
//     if(!name) {
//         return res.status(404).json({
//             status:'fail',
//             message:'customer not found'
//         })
//     }
//     const result  =  await CreditModel.aggregate([
//         {$match:{recipient_name:name.name}},
//         {$group:{
//             _id:null,
//             totalCredits:{$sum:"$totalCost"},
//             totalTransactions:{$sum:1}
//         }},
//         { $project:{
//             _id:0,
//             totalCredits:1,
//             totalTransactions:1,
            
//         }}
         
//     ])
//   return result[0];
// }