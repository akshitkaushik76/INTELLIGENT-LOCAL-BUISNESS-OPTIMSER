const express  = require('express');
const Owner = require('./../MODELS/Owner');
const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SPECIAL = "!@#$%^&*";
const CHARSET = LETTERS+NUMBERS+SPECIAL;

async function generateOrganisationCode(Name) {
    const prefix = Name.slice(0,3).toUpperCase();

    const count = await Owner.countDocuments({
        OrganisationCode:{$regex:`^${prefix}`}
    })

    return `${prefix}${count+1}`;
}
exports.OwnerRegistration  = async(req,res,next)=>{
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