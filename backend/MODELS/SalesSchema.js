const mongoose = require('mongoose');
const salesSchema = new mongoose.Schema({
    OrganisationCode:{
        type:String,
    },
    BuisnessCode:{
        type:String,
    },
    productCode:{
        type:String,
    },
    quantity:{
        type:Number,
    },
    totalCost:{
        type:Number
    },
    date:{
        type:String
    },
    time:{
        type:String
    },
    profitMade:{
        type:Number
    }

})
module.exports = mongoose.model('Sale',salesSchema);
