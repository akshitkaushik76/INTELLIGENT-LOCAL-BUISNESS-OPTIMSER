const express = require('express');
const Product = require('./../MODELS/Products');
// const Customer = require('./../MODELS/Customer');
const Owner = require('./../MODELS/Owner');
const transporter = require('./../Utils/email');
function TimeFunction() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    const seconds = now.getSeconds().toString().padStart(2,'0');

    const day = now.getDay().toString().padStart(2,'0');
    const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear().toString().padStart(2,'0');
   
    return `${hours}:${minutes}:${seconds}  Date:${day}/${month}/${year}`;
}

exports.addProduct = async(req,res,next)=>{
    try{
        // const data = await Product.create(req.body);
       const {OrganizationCode,productName,costPrice,sellingPrice,quantity} = req.body;
        const totalCostSpent = costPrice*quantity;
        const dateofPurchase = TimeFunction();
        const data = await Product.create({
            OrganisationCode:OrganizationCode,
            productName,
            costPrice,
            sellingPrice,
            quantity,
            totalCostSpent:totalCostSpent,
            dateofPurchase:dateofPurchase
        })
        res.status(200).json({
            status:'success',
            data
        })
    }catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    }
}

exports.patchProduct = async(req,res,next)=>{
    try{
         const name = req.params.Name;
         const code = req.params.code;
        const productdata = await Product.findOne({productName:name,OrganisationCode:code});
        console.log(productdata);
        if(!productdata) {
           return res.status(404).json({
            status:'failure',
            message:'Please add this product as this product is not registered'
           })
        }
        const OrganizationCode = productdata.OrganisationCode;
        const Ownerdata = await Owner.findOne({OrganisationCode:OrganizationCode});
        if(!Ownerdata) {
            return res.status(404).json({
                status:'failure',
                message:'the owner for the product is not registered'
            })
        }
        let newproductName = req.body.productName??productdata.productName;
        let newCostPrice = req.body.CostPrice??productdata.costPrice;;
        let newSellingPrice = req.body.SellingPrice??productdata.sellingPrice;
        let newQuantity = req.body.quantity;
        if(newQuantity) {
            newQuantity = productdata.quantity+newQuantity;
        }
        let updatedQuantity = newCostPrice*(newQuantity-productdata.quantity);
        const newtotalCostSpent = productdata.totalCostSpent+updatedQuantity;
        const updatedData = {
            ...req.body,
            OrganizationCode,
            productName:newproductName,
            costPrice:newCostPrice,
            sellingPrice:newSellingPrice,
            quantity:newQuantity,
            totalCostSpent:newtotalCostSpent,
            dateofPurchase:productdata.dateofPurchase,
            updationChanges:TimeFunction()
        }
       
        const prod = await Product.findOneAndUpdate({
            productName:name,OrganisationCode:code
        },
    {$set:updatedData},
     {new:true,runValidators:true}     
     );
     if(Ownerdata.email) {
        transporter.sendMail({
            from:process.env.email_user,
            to:Ownerdata.email,
            subject:'PRODUCT UPDATED',
            text:`DEAR OWNER \n\n The product ${productdata.productName} is updated. \n\n Thanks for your attention. \n\n If it was not you then contact the support at: devsaccuflow@gmail.com. \n\n THANKS (:`
        })
     }
     res.status(200).json({
        status:'success',
        prod
     })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    }
}
exports.getProduct = async(req,res,next)=>{
    try{
        const name = req.params.Name;
        const code = req.params.code;
        const product = await Product.findOne({productName:name, OrganisationCode:code});
        if(!product) {
            return res.status(404).json({
                status:'failure',
                message:'the product is not registered'
            })
        }
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