const mongoose = require('mongoose');
// const validator = require('validator');

const product  = new mongoose.Schema({
    OrganisationCode:{
        type:String,
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
    }
})

module.exports = mongoose.model('Product',product);