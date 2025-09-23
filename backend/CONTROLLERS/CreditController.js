const express = require('express');
const credits = require('./../MODELS/CreditSchema');
const products = require('./../MODELS/Products');
const Products = require('./../MODELS/Products');
const Customers = require('./../MODELS/Customer');
const Transporter = require('./../Utils/email');
const Owner = require('../MODELS/Owner');
const Customer = require('./../MODELS/Customer');



const CreateCode = async (OrganisationCode) => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // last two digits

  const dateString = `${day}${month}${year}`;

  // Count only credits issued today for this Organisation
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const countToday = await credits.countDocuments({
    OrganisationCode,
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  
  return `${dateString}-${countToday + 1}`;
};
const computeSettletime = ()=>{
  
          const now = new Date();
          const hour = now.getHours().toString().padStart(2,'0');
          const min = now.getMinutes().toString().padStart(2,'0');
          return `${hour}:${min}`;
        
}
const time = async ()=>{
  const now = new Date();
   const hour = now.getHours().toString().padStart(2,'0');
   const min = now.getMinutes().toString().padStart(2,'0');
   const date = now.getDate().toString().padStart(2,'0');
   const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear().toString().padStart(2,'0');
    return `${date}/${month}/${year} time=${hour}:${min}`
}
exports.createCredits = async(req,res,next)=>{  
    try{
      const OrganizationCode = req.params.OrganisationCode;
      const BuisnessCode = req.params.BuisnessCode
      const {phoneNumber,productCode,quantity} = req.body;
      const product_data = await Products.findOne({productcode:productCode});
      if(!product_data) {
        return res.status(404).json({
          status:'failure',
          message:'the given product code is not registered to any product'
        })
      }
      const Cust = await Customers.findOne({phoneNumber});
        if(!Cust) {
        return res.status(404).json({
          status:'fail',
          message:`the Customer with the phone number ${phoneNumber} does not exist`
        })
      }
      const credit =  await credits.create({
        phoneNumber,
        OrganisationCode:OrganizationCode,
        BuisnessCode,
        productcode:productCode,
        product:product_data.productName,
        quantity,
        uniqueCode:await CreateCode(),
        totalCost:quantity*product_data.sellingPrice,
      })
      if(Cust.emailid) {
        await Transporter.sendMail({
           subject:'CREDIT ISSUED SUCCESSFULLY',
           from:process.env.email_user,
           to:Cust.emailid,
           text:`Dear ${Cust.Name}\n\n
           Your Credit is issued Successfully\n\nThe Credit id is ${credit.uniqueCode}\n\nPlease note that the Credit id is the date/month/year + your credit number on this day\n\nYou can access your credit from the dashboard too!!\n\nTHANKS FOR TRADING. JUST REMEMBER WE ARE ALWAYS HERE FOR YOU AT\n\ndevsaccuflow@gmail.com  :))`
        })
      }
    res.status(201).json({
      status:'success',
      credit
    })
    }catch(error) {
      res.status(500).json({
        status:'failure',
        error:error.message
      })
    }
}



exports.updateCredit = async(req,res,next)=>{
  try{
    const creditcode = req.params.code;
    const OrganizationCode = req.params.OrganisationCode;
    const BuisnessCode = req.params.BuisnessCode;
    const credit = await credits.findOne({uniqueCode:creditcode, BuisnessCode:BuisnessCode });
    if(!credit) {
      return res.status(404).json({
        status:'fail',
        message:`the credit with the credit id : ${creditcode} does not exists`
      })
    }
    let isnewCustomer = 0;
    
    let newphonenumber = req.body.phoneNumber??credit.phoneNumber;
    if(newphonenumber === req.body.phoneNumber) {
      isnewCustomer = 1;
      const Cust = await Customers.findOne({phoneNumber:newphonenumber});
      if(!Cust) {
        return res.status(404).json({
          status:'failure',
          message:'the phone number provided is wrong'
        })
      }
     if(Cust.emailid) {
      await Transporter.sendMail({
        subject:'CREDIT ISSUED!!!',
        from:process.env.email_user,
        to:Cust.emailid,
        text:`Dear ${Cust.Name}\n\n
           Your Credit is issued Successfully\n\nThe Credit id is ${credit.uniqueCode}\n\nPlease note that the Credit id is the date/month/year + your credit number on this day\n\nYou can access your credit from the dashboard too!!\n\nTHANKS FOR TRADING. JUST REMEMBER WE ARE ALWAYS HERE FOR YOU AT\n\n
           devsaccuflow@gmail.com  we are here for you !! :))`
      })
     }
    }
    let newproductcode = req.body.productcode??credit.productcode;
    let sellingPrice = credit.totalCost/credit.quantity;
    let productname = credit.product;
    if(newproductcode === req.body.productcode) {
      const products = await Products.findOne({productcode:newproductcode});
      if(!products) {
        return res.status(404).json({
          status:'failure',
          message:`the product with code ${newproductcode} does not exists`
        })
      }
      sellingPrice = products.sellingPrice; 
      productname = products.product;

    }
    
    let newQuantity = req.body.quantity??credit.quantity;
    let newtotalCost = sellingPrice*newQuantity;
    const newcredit = {
      ...req.body,
       productcode:newproductcode,
       product:productname,
       quantity:newQuantity,
       totalCost:newtotalCost,
       updatedAt:time()
  }
  const updatedcredit = await credits.findOneAndUpdate(
    {uniqueCode:creditcode},
    {
      $set:newcredit
    },
    {
      new:true,runValidators:true
    }
  )
 const owner = await Owner.findOne({OrganisationCode:OrganizationCode});
 if(owner.email) {
  await Transporter.sendMail({
    subject:'CREDIT UPDATED SUCCESSFULLY',
    from:process.env.email_user,
    to:owner.email,
    text: `Dear ${owner.Name}\n\n
    Your request for updation of credit code with id:${creditcode} is processed successfully\n\n,
    IF IT WAS NOT YOU please mail us at devsaccuflow@gmail.com`
  })
 }
 if(!isnewCustomer) {
   const Cust = await Customer.findOne({phoneNumber:credit.phoneNumber});
   if(Cust.emailid) {
    await Transporter.sendMail({
      subject:'CREDIT UPDATED',
      from:process.env.email_user,
      to:Cust.emailid,
      text:`Dear ${Cust.Name}\n\n. Your credit with credit id ${updatedcredit.uniqueCode} is updated\n\nSorry for inconvinience!!`
    })
   }
 }
 res.status(200).json({
  status:'success',
  updatedcredit
 })
}catch(error) {
  res.status(500).json({
    status:'fail',
    error:error.message
  })
}
}

// exports.settleCredit = async(req,res,next)=>{
//   try{
//     const creditcode = req.params.uniqueCode;
//     const Buisnesscode = req.params.BuisnessCode;
//     const OrganisationCode = req.params.OrganisationCode;
//     const amount = req.body.amount;

//     let creditinfo = await credits.findOne({uniqueCode:creditcode});
//     if(!creditinfo) {
//       return res.status(404).json({
//         status:'failure',
//         message:`no credit exists with id : ${creditcode} `
//       })
//     }
//    let sum = Number(amount);
//    credits = credits.sort((a,b)=>{
//     const dateA = toISO
//    })
//   }catch(error) {

//   }
// }

// exports.updateCredit = async(req,res,next)=>{
//   try{
//     const creditCode = req.params.code;
//     const credit = await credits.findOne({uniqueCode:creditCode});
//     if(!credit) {
//       return res.status(404).json({
//         status:'fail',
//         message:'the credit code is wrong, enter a valid unique credit code'
//       })
//     }
//     let product = req.body.product;
//     let newProduct_data;
//     if(product) {
//       newProduct_data = await Products.findOne({productName:product});
//     }
//     else{
//       newProduct_data = await Products.findOne({productName:credit.product});
//     }
//     let newQuantity = req.body.quantity??credit.quantity;
//     let sellingPrice = req.body.sellingPrice??newProduct_data.sellingPrice;
//     let totalCost = newQuantity*sellingPrice;
//     const updatedData = {
//       ...req.body,
//       product:newProduct_data,
//       quantity:newQuantity,
//       totalCost:totalCost
//     }
//     const newCreditData = await credits.findOneAndUpdate({
//       uniqueCode:creditCode
//     },
//   {$set:updatedData},
//   {new:true,runValidators:true});
   
//   const OrganisationCode = newCreditData.OrganizationCode;
//   const phoneNumber = newCreditData.phoneNumber;
//   const Cust = await Customers.findOne({phoneNumber});
//   const Owner = await Owner.findOne({OrganisationCode});
//   if(Cust.emailid) {
//     await Transporter.sendMail({
//       from:process.env.email_user,
//       to:Cust.emailid,
//       subject:'CREDIT UPDATION',
//       text:`DEAR ${Cust.Name}\n\n. Your credit with credit id ${newCreditData.uniqueCode} is updated\n\nSorry for inconvinience!!`
//     })
//   }
//   if(Owner.email) {
//     await Transporter.sendMail({
//       from:process.env.email_user,
//       to:Owner.email,
//       subject:'CREDIT UPDATION SUCCESSFULL',
//       text:`Dear ${Owner.Name}\n\nOn the basis of your request the credit with the credit code :${newCreditData.uniqueCode}.\n\n.THANKS FOR YOUR COOPERATION :))`
//     })
//   }
//   res.status(200).json({
//     status:'success',
//     newCreditData,
//   })

//   }catch(error){
//     res.status(500).json({
//       status:'fail',
//       error:error.message
//     })
//   }
// }