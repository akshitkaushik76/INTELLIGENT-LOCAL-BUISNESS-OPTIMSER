const express  = require('express');
const Owner = require('./../MODELS/Owner');
const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SPECIAL = "!@#$%^&*";
const CHARSET = LETTERS+NUMBERS+SPECIAL;
const transporter = require('./../Utils/email');
async function generateOrganisationCode(Name) {
    const prefix = Name.slice(0,3).toUpperCase();

    const count = await Owner.countDocuments({
        OrganisationCode:{$regex:`^${prefix}`}
    })

    return `${prefix}${count+1}`;
}
exports.OwnerRegistration  = async(req,res,next)=>{//to do-> to add multiple buisnesses on same email address. Need an authorisation issued to the owner
   try{
     const { Name, email, phoneNumber, password, confirmpassword } = req.body;
    const code = await generateOrganisationCode(Name);
    const newOwner = await Owner.create({
        OrganisationCode:code,
        Name,
        email,
        phoneNumber,
        password,
        confirmpassword
    })
    if(newOwner.email) {
        await transporter.sendMail({
            from:process.env.email_user,
            to:newOwner.email,
            subject:'REGISTRATION SUCCESSFULL',
            text:`Dear Owner your Buisness have been set successfully. \n\n Please Note Your Buisness Code is ${newOwner.OrganisationCode}. \n\n HAPPY TRADING!! (: `
        })
    }
    res.status(201).json({
        status:'success',
        Details:newOwner
    })
   } catch(error) {
     res.status(500).json({
        status:'failure',
        message:error.message
     })
   }
}

exports.getAllOwners = async(req,res,next)=>{
    try{
        const data = await Owner.find();
        res.status(200).json({
            status:'successful',
            data
        })
    } catch(error) {
        res.status(500).json({
           status:'fail',
           error:error.message
        })
    }
}

exports.patchOwner = async(req,res,next)=>{
    try{
        const phoneNumber = req.params;
        const Owner = await Owner.findOne({phoneNumber});
        if(!Owner) {
            return res.status(404).json({
                status:'fail',
                message:'the Owner does not exists'
            })
        }
        let updatedName = req.body.Name??Owner.Name;
        let updatedNumber = req.body.phoneNumber??Owner.phoneNumber;//need an authorization issue
        const updatedData = {
            ...req.body,
            Name:updatedName,
            email,
            phoneNumber:updatedNumber,
        }
        const data = await Owner.findOneAndUpdate({
            {
                
            }
        })
    }
}
