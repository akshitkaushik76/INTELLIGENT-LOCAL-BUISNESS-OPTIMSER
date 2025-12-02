const express = require('express');
const credits = require('./../MODELS/CreditSchema');

const Products = require('./../MODELS/Products');
const Customers = require('./../MODELS/Customer');
const Transporter = require('./../Utils/email');
const Owner = require('../MODELS/Owner');
const Customer = require('./../MODELS/Customer');
const updateCustomerCreditAnalysis = require('./../ETL_controllers/CustomerCredit');
const CreditSchema = require('./../MODELS/CreditSchema');


const CreateCode = async (OrganisationCode) => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // last two digits

  const dateString = `${day}${month}${year}`;

  // Count only credits issued today for this Organisation
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);

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
const computeSettleDate = ()=>{
  const now = new Date();
  const date = now.getDate().toString().padStart(2,'0');
  const month = (now.getMonth()+1).toString().padStart(2,'0');
  const year = now.getFullYear().toString().padStart(2,'0');
  return `${date}/${month}/${year}`;
}
const time = ()=>{
  const now = new Date();
   const hour = now.getHours().toString().padStart(2,'0');
   const min = now.getMinutes().toString().padStart(2,'0');
   const date = now.getDate().toString().padStart(2,'0');
   const month = (now.getMonth()+1).toString().padStart(2,'0');
    const year = now.getFullYear().toString().padStart(2,'0');
    return `${date}/${month}/${year} time=${hour}:${min}`
}

async function getTotalCreditsSofar(BuisnessCode,phoneNumber) {
  const result = await credits.aggregate([
    {$match:{phoneNumber:phoneNumber,BuisnessCode:BuisnessCode,status: { $in: ["unpaid", "partially-paid"] }}},
    {$group:{
      _id:null,
      totalCredits:{$sum:"$totalCost"},
      totaltransactions:{$sum:1}
    }},
    {
      $project:{
        _id:0,
        totalCredits:1,
        totaltransactions:1
      }
    }
  ])
  return result[0];
}

exports.createCredits = async(req,res,next)=>{  
    try{
      const OrganizationCode = req.params.OrganisationCode;
      const BuisnessCode = req.params.BuisnessCode
      const {phoneNumber,productCode,quantity} = req.body;
      console.log(req.body);
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
      const totalCredits = await getTotalCreditsSofar(BuisnessCode,phoneNumber);
      const totalCreditsValue = totalCredits ? totalCredits.totalCredits : 0;
      const credit =  await credits.create({
        phoneNumber,
        OrganisationCode:OrganizationCode,
        BuisnessCode,
        productcode:productCode,
        product:product_data.productName,
        quantity,
        uniqueCode:await CreateCode(OrganizationCode),
        totalCost:quantity*product_data.sellingPrice,
      })
      updateCustomerCreditAnalysis(phoneNumber, BuisnessCode)
  .then(() => console.log(`✅ Credit analytics updated for ${phoneNumber}`))
  .catch(err => console.error(`❌ Credit ETL failed: ${err.message}`));

      if(Cust.emailid) {
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; border-radius: 8px; color: #333;">
          <h2 style="color: #4CAF50; text-align: center;">💳 Credit Issued Successfully!</h2>

          <p>Dear <b>${Cust.Name}</b>,</p>
          <p>We are thrilled to inform you that your new credit has been <b style="color:#4CAF50;">successfully issued</b>!</p>

          <div style="margin: 20px 0; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 6px;">
            <p><b>📌 Credit ID:</b> ${credit.uniqueCode}</p>
            <p><b>🛍️ Product:</b> ${product_data.productName}</p>
            <p><b>🔢 Quantity:</b> ${quantity}</p>
            <p><b>💰 Total Cost:</b> ₹${quantity * product_data.sellingPrice}</p>
          </div>

          <div style="margin: 20px 0; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 6px;">
            <p><b>💳 Total Credits So Far:</b> ₹${totalCreditsValue + (quantity * product_data.sellingPrice)}</p>
            
          </div>

          <p>You can access all your credits and transactions anytime from your dashboard.</p>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://your-frontend-app.com/dashboard"
               style="background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Dashboard
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 13px; color: #777;">
            Thank you for trading with us! 💙<br>
            We’re always here for you at <a href="mailto:devsaccuflow@gmail.com">devsaccuflow@gmail.com</a>
          </p>
        </div>
      `;

        await Transporter.sendMail({
           subject:'CREDIT ISSUED SUCCESSFULLY',
           from:process.env.email_user,
           to:Cust.emailid,
           html:emailHtml
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
    const OrganisationCode = req.params.OrganisationCode;
    const BuisnessCode = req.params.BuisnessCode;
    const uniqueCode = req.params.uniqueCode;
    const credit = await credits.findOne({OrganisationCode:OrganisationCode,BuisnessCode:BuisnessCode,uniqueCode:uniqueCode});
    if(!credit) {
       return res.status(404).json({
          status:'failure',
          message:`the credit with code ${uniqueCode} with this buisness does not exists`
        })
    }
     let isnewCustomer = 0;
    let phoneNumber = req.body.phoneNumber??credit.phoneNumber;
    if(phoneNumber === req.body.phoneNumber) {
      isnewCustomer = 1;
      const Customerdetail = await Customer.findOne({phoneNumber});
      if(!Customerdetail) {
        return res.status(404).json({
          status:'failure',
          message:'entered phone number is not registered, please register first'
        })
      }
      if(Customerdetail.emailid) {
        await Transporter.sendMail({
          from:process.env.email_user,
          to:Customerdetail.emailid,
          subject:'NEW CREDIT IS ALLOTED',
          text:`DEAR CUSTOMER\n\n. Mistakenly we have alloted your credit to someone else\n\nUpon your request the credit is alloted to now\n\nRemember WE ARE ALWAYS HERE FOR U :))\n\n.We will provide u the credit code soon`
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
      productname = products.productname;

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
    {uniqueCode:uniqueCode},
    {
      $set:newcredit
    },
    {
      new:true,runValidators:true
    }
  )
     updateCustomerCreditAnalysis(phoneNumber, BuisnessCode)
  .then(() => console.log(`✅ Credit analytics updated for ${phoneNumber}`))
  .catch(err => console.error(`❌ Credit ETL failed: ${err.message}`));
 const owner = await Owner.findOne({OrganisationCode:OrganisationCode});
 if(owner.email) {
  
  await Transporter.sendMail({
    subject:'CREDIT UPDATED SUCCESSFULLY',
    from:process.env.email_user,
    to:owner.email,
    text: `Dear ${owner.Name}\n\n
    Your request for updation of credit code with id:${uniqueCode} is processed successfully\n\n,
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

exports.settleCreditChunk = async(req,res,next)=>{
  try{
    const BuisnessCode = req.params.BuisnessCode;
    const phoneNumber = req.body.phoneNumber;
    const amount = req.body.amount;
    let remainingamount = Number(amount);
    const customerdata = await Customer.findOne({phoneNumber});
    if(!customerdata) {
      return res.status(404).json({
        status:'failure',
        message:`the phone number ${phoneNumber} is not registered.`
      })
    }
    const creditinfo = await credits.find({
      phoneNumber,
      BuisnessCode,
      status:{$in:['unpaid','partially-paid']}
    }).sort({issued:1,time:1});
    if(!creditinfo.length) {
      return res.status(404).json({status:'fail',message:'no unpaid or partially paid credits left'})
    }
    const updatedcredit = [];
      const emailSummary = {
      fullyPaid: [],
      partiallyPaid: [],
    };
    for (let c of creditinfo) {
      if (remainingamount <= 0) break;

      if (remainingamount >= c.totalCost) {
        remainingamount -= c.totalCost;
        emailSummary.fullyPaid.push({
          product: c.product, // assuming you store product name
          amount: c.totalCost,
        });
        c.totalCost = 0;
        c.status = "settled";
      } else {
        emailSummary.partiallyPaid.push({
          product: c.product,
          paid: remainingamount,
          remaining: c.totalCost - remainingamount,
        });
        c.totalCost -= remainingamount;
        remainingamount = 0;
        c.status = "partially-paid";
      }

      c.settleDate = computeSettleDate();
      c.settleTime =  computeSettletime(); 
      await c.save();
      updatedcredit.push(c);
    }
   const emailHtml = `
      <h2>Payment Update</h2>
      <p>Dear Customer (${phoneNumber}),</p>
      <p>Your payment of <b>₹${amount}</b> has been applied successfully.</p>
      
      <h3>✅ Fully Paid Products:</h3>
      <ul>
        ${emailSummary.fullyPaid.length ? emailSummary.fullyPaid.map(p => `<li>${p.product} - ₹${p.amount}</li>`).join("") : "<li>None</li>"}
      </ul>

      <h3>🟡 Partially Paid Products:</h3>
      <ul>
        ${emailSummary.partiallyPaid.length ? emailSummary.partiallyPaid.map(p => `<li>${p.product} - Paid: ₹${p.paid}, Remaining: ₹${p.remaining}</li>`).join("") : "<li>None</li>"}
      </ul>

      <p>Thank you for your payment.</p>
    `;
   if(customerdata.emailid) {
     await Transporter.sendMail({
      from:process.env.email_user,
      to:customerdata.emailid,
      subject:'CREDIT SETTLEMENT SUCCESSFULL',
      html:emailHtml
     })
   }

    res.status(200).json({
      status:'success',
      message:`the payment of ${amount} applied successfully`,
      updatedcredit
    })
  } catch(error) {
    res.status(500).json({
      status:'fail',
      error:error.message
    })
  }
}

exports.getCreditinfo = async(req,res,next)=>{
  try{
    const OrganisationCode = req.params.OrganisationCode;
    const BuisnessCode = req.params.BuisnessCode;
    const uniqueCode = req.body.uniqueCode
    const creditinfo = await CreditSchema.findOne({OrganisationCode,BuisnessCode,uniqueCode});
    console.log(creditinfo);
    if(!creditinfo) {
      return res.status(400).json({
        status:"failure",
        message:"the credit credentials was incorrect ,please enter correct credentials"
      })
    }
    res.status(200).json({
      status:"success",
      creditinfo
    })
  }catch(error) {
    res.status(500).json({
      status:'failure',
      error:error.message
    })
  }
}
exports.getAllCredit = async(req,res,next)=>{
  try{
    const phoneNumber = req.body.phoneNumber;
    const OrganisationCode = req.params.OrganisationCode;
    const BuisnessCode = req.params.BuisnessCode;
    const creditinfo = await CreditSchema.find({phoneNumber,OrganisationCode,BuisnessCode});
    console.log(creditinfo);
    if(!creditinfo) {
      return res.status(400).json({
        status:'failure',
        message:"the credit credentials are wrong, please provide correct credentials"
      })
    }
    res.status(200).json({
      status:'success',
      creditinfo
    })
  }catch(error) {
    res.status(500).json({
      status:"failure",
      error:error.message
    })
  }
}

// async function getTotalCredits(email) {
//     const name = await Customers.findOne({emailid:email});
//     if(!name) {
//         return res.status(404).json({
//             status:'fail',
//             message:'customer not found'
//         })
//     }
//     const result  =  await CreditModel.aggregate([
//         {$match:{recipient_name:name.name}},
//         {$group:{
//             _id:null,
//             totalCredits:{$sum:"$totalCost"},
//             totalTransactions:{$sum:1}
//         }},
//         { $project:{
//             _id:0,
//             totalCredits:1,
//             totalTransactions:1,
            
//         }}
         
//     ])
//   return result[0];
// }
// exports.settleCreditChunk = async (req, res, next) => {
//   try {
//     const BuisnessCode = req.params.BuisnessCode;
//     const phoneNumber = req.body.phoneNumber;
//     const amount = req.body.amount;
//     let remainingamount = Number(amount);

//     const creditinfo = await credits.find({
//       phoneNumber,
//       BuisnessCode,
//       status: { $in: ["unpaid", "partially-paid"] },
//     }).sort({ issued: 1, time: 1 });

//     if (!creditinfo.length) {
//       return res.status(404).json({
//         status: "fail",
//         message: "no unpaid or partially paid credits left",
//       });
//     }

//     const updatedcredit = [];
//     const emailSummary = {
//       fullyPaid: [],
//       partiallyPaid: [],
//     };

//     for (let c of creditinfo) {
//       if (remainingamount <= 0) break;

//       if (remainingamount >= c.totalCost) {
//         remainingamount -= c.totalCost;
//         emailSummary.fullyPaid.push({
//           product: c.product, // assuming you store product name
//           amount: c.totalCost,
//         });
//         c.totalCost = 0;
//         c.status = "settled";
//       } else {
//         emailSummary.partiallyPaid.push({
//           product: c.product,
//           paid: remainingamount,
//           remaining: c.totalCost - remainingamount,
//         });
//         c.totalCost -= remainingamount;
//         remainingamount = 0;
//         c.status = "partially-paid";
//       }

//       c.settleDate = computeSettletime();
//       c.settleTime = computeSettleDate();
//       await c.save();
//       updatedcredit.push(c);
//     }

   

//     const emailHtml = `
//       <h2>Payment Update</h2>
//       <p>Dear Customer (${phoneNumber}),</p>
//       <p>Your payment of <b>₹${amount}</b> has been applied successfully.</p>
      
//       <h3>✅ Fully Paid Products:</h3>
//       <ul>
//         ${emailSummary.fullyPaid.length ? emailSummary.fullyPaid.map(p => `<li>${p.product} - ₹${p.amount}</li>`).join("") : "<li>None</li>"}
//       </ul>

//       <h3>🟡 Partially Paid Products:</h3>
//       <ul>
//         ${emailSummary.partiallyPaid.length ? emailSummary.partiallyPaid.map(p => `<li>${p.product} - Paid: ₹${p.paid}, Remaining: ₹${p.remaining}</li>`).join("") : "<li>None</li>"}
//       </ul>

//       <p>Thank you for your payment.</p>
//     `;

//     await Transporter.sendMail({
//       from: `"Business" <${process.env.EMAIL_USER}>`,
//       to: req.body.email, // customer email
//       subject: "Payment Confirmation",
//       html: emailHtml,
//     });

//     res.status(200).json({
//       status: "success",
//       message: `The payment of ${amount} applied successfully and email sent.`,
//       updatedcredit,
//       emailSummary,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "fail",
//       error: error.message,
//     });
//   }
// };
// exports.updateCredit = async(req,res,next)=>{
//   try{
//     const creditcode = req.params.uniqueCode;
//     const OrganizationCode = req.params.OrganisationCode;
//     const BuisnessCode = req.params.BuisnessCode;
//     const credit = await credits.findOne({uniqueCode:creditcode, BuisnessCode:BuisnessCode });
//     if(!credit) {
//       return res.status(404).json({
//         status:'fail',
//         message:`the credit with the credit id : ${creditcode} does not exists`
//       })
//     }
//     let isnewCustomer = 0;
    
//     let newphonenumber = req.body.phoneNumber??credit.phoneNumber;
//     if(newphonenumber === req.body.phoneNumber) {
//       isnewCustomer = 1;
//       const Cust = await Customers.findOne({phoneNumber:newphonenumber});
//       if(!Cust) {
//         return res.status(404).json({
//           status:'failure',
//           message:'the phone number provided is wrong'
//         })
//       }
//      if(Cust.emailid) {
//       await Transporter.sendMail({
//         subject:'CREDIT ISSUED!!!',
//         from:process.env.email_user,
//         to:Cust.emailid,
//         text:`Dear ${Cust.Name}\n\n
//            Your Credit is issued Successfully\n\nThe Credit id is ${credit.uniqueCode}\n\nPlease note that the Credit id is the date/month/year + your credit number on this day\n\nYou can access your credit from the dashboard too!!\n\nTHANKS FOR TRADING. JUST REMEMBER WE ARE ALWAYS HERE FOR YOU AT\n\n
//            devsaccuflow@gmail.com  we are here for you !! :))`
//       })
//      }
//     }
//     let newproductcode = req.body.productcode??credit.productcode;
//     let sellingPrice = credit.totalCost/credit.quantity;
//     let productname = credit.product;
//     if(newproductcode === req.body.productcode) {
//       const products = await Products.findOne({productcode:newproductcode});
//       if(!products) {
//         return res.status(404).json({
//           status:'failure',
//           message:`the product with code ${newproductcode} does not exists`
//         })
//       }
//       sellingPrice = products.sellingPrice; 
//       productname = products.product;

//     }
    
//     let newQuantity = req.body.quantity??credit.quantity;
//     let newtotalCost = sellingPrice*newQuantity;
//     const newcredit = {
//       ...req.body,
//        productcode:newproductcode,
//        product:productname,
//        quantity:newQuantity,
//        totalCost:newtotalCost,
//        updatedAt:time()
//   }
//   const updatedcredit = await credits.findOneAndUpdate(
//     {uniqueCode:creditcode},
//     {
//       $set:newcredit
//     },
//     {
//       new:true,runValidators:true
//     }
//   )
//  const owner = await Owner.findOne({OrganisationCode:OrganizationCode});
//  if(owner.email) {
//   await Transporter.sendMail({
//     subject:'CREDIT UPDATED SUCCESSFULLY',
//     from:process.env.email_user,
//     to:owner.email,
//     text: `Dear ${owner.Name}\n\n
//     Your request for updation of credit code with id:${creditcode} is processed successfully\n\n,
//     IF IT WAS NOT YOU please mail us at devsaccuflow@gmail.com`
//   })
//  }
//  if(!isnewCustomer) {
//    const Cust = await Customer.findOne({phoneNumber:credit.phoneNumber});
//    if(Cust.emailid) {
//     await Transporter.sendMail({
//       subject:'CREDIT UPDATED',
//       from:process.env.email_user,
//       to:Cust.emailid,
//       text:`Dear ${Cust.Name}\n\n. Your credit with credit id ${updatedcredit.uniqueCode} is updated\n\nSorry for inconvinience!!`
//     })
//    }
//  }
//  res.status(200).json({
//   status:'success',
//   updatedcredit
//  })
// }catch(error) {
//   res.status(500).json({
//     status:'fail',
//     error:error.message
//   })
// }
// }

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