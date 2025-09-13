const mongoose = require('mongoose');
// const validator = require('validator');

const product  = new mongoose.Schema({
    creationCode:{
        type:String,
        required:[true,'please provide the organisation code to continue']
    },
    productName:{
        type:String,
        unique:[true,'please enter a unique name for the product'],
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
    }
})

module.exports = mongoose.model('Product',product);