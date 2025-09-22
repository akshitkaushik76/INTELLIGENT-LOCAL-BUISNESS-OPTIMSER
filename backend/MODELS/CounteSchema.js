const mongoose = require('mongoose');
const code = new mongoose.Schema({
    key:{
        type:String,
        unique:true
    },
    value:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('Code',code);