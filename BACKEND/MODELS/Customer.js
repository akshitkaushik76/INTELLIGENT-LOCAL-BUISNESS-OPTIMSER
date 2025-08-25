const mongoose  = require('mongoose');
const validator = require('validator');

const customer = new mongoose.Schema({
    OrganisationCode:{
        type:String,
    },
    name:{
        type:String,
        required:[true,'please enter the name to continue']
    },
    emailid:{
        type:String,
        required:[true,'please enter an email id'],
        validate:[validator.isEmail,'please enter a correct email id']
    },
    phoneNumber:{
        type:Number,
        required:[true,'please enter a phone number'],
        minlength:[10,'please enter a correct phone number'],
        maxlength:[10,'please enter a correct phone number']
    },
    password:{
        type:String,
        required:[true,'please provide a password']
    },
    confirmpassword:{
        type:String,
        required:[true,'please re-enter the password for confirmation'],
        validate:function(value) {
            value == this.password
        },
        message:'the password and confirm password does not match'
    }
})
module.exports = mongoose.model('Customer',customer);