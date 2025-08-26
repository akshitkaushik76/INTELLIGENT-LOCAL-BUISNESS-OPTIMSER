const mongoose = require('mongoose');
const validator = require('validator');
const owner = new mongoose.Schema({
    OrganisationCode:{
        type:String,
    },
    Name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:[true,'please enter email id to continue'],
        validare:[validator.isEmail,'please enter a valid email id to proceed'],
        
    },
    phoneNumber:{
        type:Number,
        required:[true,'please enter a phone number'],
        minlength:[10,'enter a correct phone number'],
        maxlength:[10,'enter a correct phone number']
    },
    password:{
        type:String,
        required:true,
        minlength:[8,'password should be 8 characters long'],

    },
    confirmpassword:{
        type:String,
        required:[true,'please reenter the password for confirmation'],
        validate:function(value) {
            return value == this.password
        },
        message:'the password and confirm password does not match'
        }
    
})

module.exports = mongoose.model('Owner',owner);

