const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const customer = new mongoose.Schema({
    OrganisationCode:[{
        type:String,
        required:[true,'please enter the buisness code']
    }],
    EnrolledBusinesses:[{
        type:String,
    }],
    Name:{
        type:String,
        required:[true,'please enter the name to continue']
    },
    emailid:{
        type:String,
        required:[true,'please enter an email id'],
        validate:[validator.isEmail,'please enter a correct email id'],
        unique:[true,'the email is already registered'],
        
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
            return value == this.password
        },
        message:'the password and confirm password does not match'
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date
})

customer.pre('save',async function(next){
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    this.confirmpassword = undefined;
    next();
})

customer.methods.comparePasswordinDb = async function(pswd,pswdDB) {
    return await bcrypt.compare(pswd,pswdDB);
}
customer.methods.isPasswordChanged = async function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        console.log("this password changed at",JWTTimestamp);
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}
customer.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now()+10*60*1000;
    console.log(resetToken,this.passwordResetToken);
    return resetToken;
}
module.exports = mongoose.model('Customer',customer);