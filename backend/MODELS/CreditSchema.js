const mongoose = require('mongoose');

const credit = new mongoose.Schema({
    phoneNumber:{
        type:Number,
        required:[true,'please enter the phone number of the customer'],
    },
    OrganisationCode:{
        type:String,
        required:[true,'please enter the organisation code'],
    },
    BuisnessCode:{
        type:String,
    },
    productcode:{
        type:String,
    },
    product:{
        type:String,
        required:[true,'please enter the product name'],
    },
    quantity:{
        type:Number,
        required:[true,'please enter the quantity']
    },
    uniqueCode:{
      type:String
    },
    totalCost:{
        type:Number,
    },
    status:{
        type:String,
        enum:['unpaid','partially-paid','settled'],
        default:'unpaid'
    },
    issued:{
        type:String,
        default:function() {
           const now = new Date();
           const day = now.getDate().toString().padStart(2,'0');
           const month = (now.getMonth()+1).toString().padStart(2,'0');
           const year = now.getFullYear();
           return `${day}-${month}-${year}`;
        }
    },
    time:{
        type:String,
        default:function() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2,'0');
            const minutes = now.getMinutes().toString().padStart(2,'0');
            return `${hours}:${minutes}`;
        }
    },
    settleDate:{
        type:String,
    },
    settleTime:{
        type:String,
        // default:function() {
        //   const now = new Date();
        //   const hour = now.getHours().toString().padStart(2,'0');
        //   const min = now.getMinutes().toString().padStart(2,'0');
        //   return `${hour}:${min}`;
        // }
    },
    updatedAt:{
        type:String,
    }
})

module.exports = mongoose.model('Credit',credit);