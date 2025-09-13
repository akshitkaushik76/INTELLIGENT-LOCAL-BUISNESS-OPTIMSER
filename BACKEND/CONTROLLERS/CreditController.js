const express = require('express');
const credits = require('./../MODELS/CreditSchema');
const products = require('./../MODELS/Products');
const Products = require('./../MODELS/Products');
const Customers = require('./../MODELS/Customer');
const Transporter = require('./../Utils/email');
const Owner = require('../MODELS/Owner');

function generateCreditid(OrganizationCode) {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth()+1).padStart(2,'0');
    const day = String(now.getDay()).padStart(2,'0');
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    const daytime = `${day}${month}${year}`;
    const time = `${hours}${minutes}${seconds}`;
    return daytime+time+OrganizationCode;
}

exports.createCredits = async(req,res,next)=>{
    try{
      const {phoneNumber,product,quantity,OrganizationCode} = req.body;
      const Cust = await Customers.findOne({phoneNumber});
      if(!Cust) {
        return res.status(404).json({
            status:'failure',
            message:'the customer is not registered,please register the customer first'
        })
      }
      const creditid = generateCreditid(OrganizationCode);
      const Product = await Products.findOne({product});
      if(!product) {
        return res.status(404).json({
            status:'failure',
            message:'the product is not added , please add the product to continue this operation'
        })
      }
      const Total = Product.sellingPrice*quantity;
      const credit = await credits.create({...req.body,
        phoneNumber,
        OrganizationCode,
        product,
        quantity,
        uniqueCode:creditid,
        totalCost:Total,
    });
      if(Cust.emailid) {
        await Transporter.sendMail({
            from:process.env.email_user,
            to:Cust.emailid,
            subject:'CREDIT ISSUED',
            text:` DEAR ${Cust.Name}! \n\n Your Credit is issued successfully. \n\n Please note that your credit id is ${creditid}. \n\n Please note that credit id is useful to retrieve the credit information. \n\n If you miss your credit token please contact the mail support at devsaccuflow@gmail.com\n\n Please provide your phone number for the support`
        })
      }
    }
    catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    }
}
exports.updateCredit = async(req,res,next)=>{
  try{
    const creditCode = req.params.code;
    const credit = await credits.findOne({uniqueCode:creditCode});
    if(!credit) {
      return res.status(404).json({
        status:'fail',
        message:'the credit code is wrong, enter a valid unique credit code'
      })
    }
    let product = req.body.product;
    let newProduct_data;
    if(product) {
      newProduct_data = await Products.findOne({productName:product});
    }
    else{
      newProduct_data = await Products.findOne({productName:credit.product});
    }
    let newQuantity = req.body.quantity??credit.quantity;
    let sellingPrice = req.body.sellingPrice??newProduct_data.sellingPrice;
    let totalCost = newQuantity*sellingPrice;
    const updatedData = {
      ...req.body,
      product:newProduct_data,
      quantity:newQuantity,
      totalCost:totalCost
    }
    const newCreditData = await credits.findOneAndUpdate({
      uniqueCode:creditCode
    },
  {$set:updatedData},
  {new:true,runValidators:true});
   
  const OrganisationCode = newCreditData.OrganizationCode;
  const phoneNumber = newCreditData.phoneNumber;
  const Cust = await Customers.findOne({phoneNumber});
  const Owner = await Owner.findOne({OrganisationCode});
  if(Cust.emailid) {
    await Transporter.sendMail({
      from:process.env.email_user,
      to:Cust.emailid,
      subject:'CREDIT UPDATION',
      text:`DEAR ${Cust.Name}\n\n. Your credit with credit id ${newCreditData.uniqueCode} is updated\n\nSorry for inconvinience!!`
    })
  }
  if(Owner.email) {
    await Transporter.sendMail({
      from:process.env.email_user,
      to:Owner.email,
      subject:'CREDIT UPDATION SUCCESSFULL',
      text:`Dear ${Owner.Name}\n\nOn the basis of your request the credit with the credit code :${newCreditData.uniqueCode}.\n\n.THANKS FOR YOUR COOPERATION :))`
    })
  }
  res.status(200).json({
    status:'success',
    newCreditData,
  })

  }catch(error){
    res.status(500).json({
      status:'fail',
      error:error.message
    })
  }
}