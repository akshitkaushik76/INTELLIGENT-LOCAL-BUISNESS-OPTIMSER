const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
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
        },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date
    
})
owner.pre('save',async function(next){
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    this.confirmpassword = undefined
})
owner.methods.comparePasswordinDb = async function(pswd,pswdDB) {
    return await bcrypt.compare(pswd,pswdDB);
}

owner.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt) {
        console.log("this password changed at",JWTTimestamp);
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}
owner.methods.createResetPasswordToken  = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now()+ 10*60*1000;
    console.log(resetToken,this.passwordResetToken);
    return resetToken;
}
module.exports = mongoose.model('Owner',owner);

