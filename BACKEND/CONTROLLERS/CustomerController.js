const express = require('express');
const Customer = require('./../MODELS/Customer');
const Owner = require('./../MODELS/Owner');
const transporter = require('./../Utils/email')
exports.registerCustomer = async(req,res,next)=>{
    try{
        const {OrganisationCode} = req.body;
        const BuisnessOwner = await Owner.findOne({OrganisationCode});
        if(!BuisnessOwner) {
            return res.status(404).json({
                status:'fail',
                message:`the organisation with code ${OrganisationCode} does not exist`
            })
        }
        const newCustomer = await Customer.create(req.body);
        res.status(200).json({
            status:'success',
            data:newCustomer
        })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            message:error.message
        })
    }
}

exports.getCustomers = async(req,res,next)=>{
    try{
        const phoneNumber = req.params.phoneNumber;
        const CustomerData = await Customer.findOne({phoneNumber});
        if(!CustomerData) {
            return res.status(404).json({
                status:'failure',
                message:'the user does not exist or try a valid phone number'
            })
        }
        res.status(200).json({
            status:'success',
            CustomerData
        })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            message:error.message
        }
        )
    }
}

exports.patchCustomer = async(req,res,next)=>{
    try{
        const phoneNumber = req.params.phoneNumber;
        const CustomerData = await Customer.findOne({phoneNumber});
        if(!CustomerData) {
            return res.status(404).json({
                status:'failure',
                message:'the Customer with the given phone Number does not exist'
            })
        }
        let updatedName = req.body.Name??CustomerData.Name;
        const updatedData = {
            ...req.body,
            Name:updatedName,
            email:CustomerData.emailid,
        }
        const data = await Customer.findOneAndUpdate(
            {phoneNumber},
            {$set:updatedData},
            {new:true,runValidators:true}
        );
        if(data.emailid) {
            await transporter.sendMail({
                from:process.env.email_user,
                to:data.emailid,
                subject:'INFORMATION UPDATED',
                text:'Dear User. \n\n Your information was recently changed upon your request.\n\n If it was not you please contact on devsaccuflow@gmail.com . '
            })
        }
        res.status(200).json({
            status:'success',
            data
        })
    } 
    catch(error) {
       res.status(500).json({
        status:'fail',
        message:error.message
       })
    } 
}