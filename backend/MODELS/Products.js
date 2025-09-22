const mongoose = require('mongoose');
// const validator = require('validator');

const product  = new mongoose.Schema({
    BuisnessCode:{
        type:String,
     
    },
    OrganisationCode:{
       type:String,
    },
    
    productName:{
        type:String,
        // unique:[true,'please enter a unique name for the product'],
         required:[true,'please enter a product name ']
    },
    costPrice:{
        type:Number,
        required:[true,'enter cost price of the product'],
    },
    sellingPrice:{
        type:Number,
        required:[true,'please enter a selling price']
    },
    quantity:{
        type:Number,
        required:[true,'please enter the quantity of the product which u bought ']
    },
    totalCostSpent:{
        type:Number
    },
    dateofPurchase:{
        type:String,
    },
    updationChanges:{
        type:String
    },
    productcode:{
        type:String
    }
})
product.index({productName:1,BuisnessCode:1,OrganisationCode:1},{unique:true})
module.exports = mongoose.model('Product',product);