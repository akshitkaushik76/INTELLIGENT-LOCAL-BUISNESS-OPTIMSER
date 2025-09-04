const mongoose = require('mongoose');
const BuisnessSchema = new mongoose.Schema({
    OrganisationCode:{
        type:String,
    },
    Owner:{
        type:String,
    },
    phoneNumber:{
        type:Number
    },
    email:{
        type:String,
    },
    CreationCode:{
        type:String
    }
})
module.exports = mongoose.model('Buisness',BuisnessSchema);