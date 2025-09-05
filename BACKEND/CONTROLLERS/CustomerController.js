const express = require('express');
const Customer = require('./../MODELS/Customer');
const Owner = require('./../MODELS/Owner');
const transporter = require('./../Utils/email')
const Business = require('./../MODELS/BusinessSchema');
exports.registerCustomer = async(req,res,next)=>{
    try{
        let {OrganisationCode} = req.body;
        const BuisnessOwner = await Owner.findOne({OrganisationCode});
        if(!BuisnessOwner) {
            return res.status(404).json({
                status:'fail',
                message:`the organisation with code ${OrganisationCode} does not exist`
            })
        }
        const newCustomer = await Customer.create({
            ...req.body,
            OrganisationCode:[OrganisationCode]
        });
        if(newCustomer.emailid) {
           await transporter.sendMail({
            from:process.env.email_user,
            to:newCustomer.emailid,
            subject:'WELCOME TO BUISNESS Mr. CUSTOMER!!',
            text:`Dear ${newCustomer.Name} \n\n Welcome to the buisness\n\nYour subscribed organization code is ${OrganisationCode} `
           })
        }
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
exports.SubscribetonewOrganisation = async(req,res,next)=>{
   try{
    const phoneNumber = req.params.phoneNumber;
    const CustomerData = await Customer.findOne({phoneNumber});
    if(!CustomerData.OrganisationCode) {
        return res.status(404).json({
            status:'fail',
            message:'this is a invalid operation, register yourself as a customer to a buisness service first :('
        })
    }
    const {OrganisationCode} = req.body;
    const newdata = await Customer.findOneAndUpdate(
        {phoneNumber},
        {$addToSet:{OrganisationCode:OrganisationCode}},
        {new:true,runValidators:true}
    );
    if(newdata.emailid) {
        await transporter.sendMail({
            from:process.env.email_user,
            to:newdata.emailid,
            subject:'SUBSCRIPTION TO NEW SERVICE',
            text:`Dear ${newdata.Name}\n\nYour are now registered to new service\n\nOrganisation code ${OrganisationCode}\n\n.If it was not you then contact the support at devsaccuflow@gmail.com`,
        })
    }
    res.status(201).json({
        status:'success',
        details:newdata
    })
   }catch(error) {
    res.status(500).json({
        status:'fail',
        message:error.message
    })
   }
}