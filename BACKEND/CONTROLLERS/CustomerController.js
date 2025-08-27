const express = require('express');
const Customer = require('./../MODELS/Customer');
const Owner = require('./../MODELS/Owner');
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

