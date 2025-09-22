const express = require('express');
const Product = require('./../MODELS/Products');
const Business = require('./../MODELS/BusinessSchema');
// const Customer = require('./../MODELS/Customer');
const Owner = require('./../MODELS/Owner');
const transporter = require('./../Utils/email');
//productname+sellingprice--->productcode
function Productcode(name,sellingPrice) {
  const cp = sellingPrice.toString();
  const code = name+cp;
  return code;
}
function TimeFunction() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    const seconds = now.getSeconds().toString().padStart(2,'0');

    const day = now.getDate().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear().toString().padStart(2,'0');
   
    return `${hours}:${minutes}:${seconds}  Date:${day}/${month}/${year}`;
}

exports.addProduct = async(req,res,next)=>{
    try{
        const BuisnessCreationCode = req.params.BuisnessCode;
        const {productName,costPrice,sellingPrice,quantity} = req.body;
        const Businessdata = await Business.findOne({CreationCode:BuisnessCreationCode});
        if(!Businessdata) {
           return res.status(404).json({
            status:'failure',
            message:'the Buisness id is not valid'
           })
        }
        const product = await Product.create({
            BuisnessCode:Businessdata.CreationCode,
            OrganisationCode:Businessdata.OrganisationCode,
            productName,
            costPrice,
            sellingPrice,
            quantity,
            totalCostSpent:costPrice*quantity,
            dateofPurchase:TimeFunction(),
            productcode:Productcode(productName,sellingPrice)
        })
        res.status(201).json({
            status:'success',
            product
        })
    }catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    }
}

exports.updateProduct = async(req,res,next)=>{
    try{
        const productCode = req.params.productcode;
        const OrganisationCode = req.params.OrganisationCode;
        const owner = await Owner.findOne({OrganisationCode});
        if(!owner) {
            return res.status(404).json({
                status:'failure',
                message:'invalid owner code'
            })
        } 
        const updatedFields = {};
        let newCostPrice;
        
        if(req.body.sellingPrice!== undefined) updatedFields.sellingPrice = req.body.sellingPrice;
        if(req.body.costPrice !== undefined) {
            updatedFields.costPrice = req.body.costPrice;
            newCostPrice = req.body.costPrice;
        }
        if(req.body.quantity !== undefined) {
            updatedFields.quantity = req.body.quantity;
            const prod = await Product.findOne({productcode:productCode});
            if(newCostPrice !== undefined) {
                updatedFields.totalCostSpent = prod.totalCostSpent+req.body.quantity*newCostPrice;
            }
        }
        updatedFields.updationChanges = TimeFunction();

        const product  = await Product.findOneAndUpdate(
            {productcode:productCode},
            {$set:updatedFields},
            {new:true,runValidators:true}
        );
        if(!product) {
            return res.status(404).json({
                status:'failure',
                message:`the product with the id :${productCode} does not exist!`
            })
        }
       if(owner.email) {
        await transporter.sendMail({
            from:process.env.email_user,
            to:owner.email,
            subject:'UPDATED PRODUCT ALERT',
            text:`Dear ${owner.Name}\n\nThe product with product id: ${product.productcode} is updated.n\nIf it was not you then please mail us at devsaccuflow@gmail.com`
        })
       }
       res.status(200).json({
        status:'success',
        product
       })
    } catch(error) {
        res.status(500).json({
            status:'failure',
            error:error.message
        })
    }
}
exports.getProduct = async(req,res,next)=>{
    try{
        const code = req.params.productcode;
        const product  = await Product.findOne({productcode:code});
        if(!product) {
            return res.status(404).json({
                status:'failure',
                message:'the product is not added'
            })
        }
        res.status(200).json({
            status:'success',
            product
        })
    }catch(error) {
        res.status(500).json({
            status:'failure',
            error:error.message
        })
    }
}
exports.getAllProduct = async(req,res,next)=>{
    try{
        const BusinessCode = req.params.BuisnessCode;
        const products = await Product.find({BuisnessCode:BusinessCode});
        if(!products || products.length === 0) {
            return res.status(404).json({
                status:'failure',
                message:'this product is not registered for this business code'
            })
        }
        res.status(200).json({
            status:'success',
            products
        })
    }catch(error) {
        res.status(500).json({
            status:'failure',
            error:error.message
        })
    }
}