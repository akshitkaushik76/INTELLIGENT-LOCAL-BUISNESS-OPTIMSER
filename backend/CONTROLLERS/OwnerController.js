const express  = require('express');
const Owner = require('./../MODELS/Owner');
const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SPECIAL = "!@#$%^&*";
const CHARSET = LETTERS+NUMBERS+SPECIAL;
const transporter = require('./../Utils/email');
const Buisness = require('./../MODELS/BusinessSchema');
const BusinessSchema = require('./../MODELS/BusinessSchema');
const jwt = require('jsonwebtoken');

function CreateCreationCode(OrganisationCode) {
   const now = new Date();
   const hours = now.getHours().toString().padStart(2,'0');
   const minutes = now.getMinutes().toString().padStart(2,'0');
   const seconds = now.getSeconds().toString().padStart(2,'0');

   const day = now.getDate().toString().padStart(2,'0');
   const month = (now.getMonth()+1).toString().padStart(2,'0');
   const year = now.getFullYear().toString().padStart(2,'0');
   console.log("day :",day);
   console.log("month :",month);
   console.log("year: ",year);
   return `${OrganisationCode}${hours}${minutes}${seconds}${day}${month}${year}`;
}
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
    const newcreationCode = CreateCreationCode(code);
    const buisnessData = await Buisness.create({
        OrganisationCode:code,
        Owner:Name,
        phoneNumber:phoneNumber,
        email:email,
        CreationCode:newcreationCode
    })
    const newOwner = await Owner.create({
        OrganisationCode:code,
        Name,
        email,
        phoneNumber,
        password,
        confirmpassword
    })
    const token = jwt.sign({id:newOwner._id},process.env.SECRET_STRING,{
        expiresIn:process.env.EXPIRES_IN
    })
    if(newOwner.email) {
        await transporter.sendMail({
            from:process.env.email_user,
            to:newOwner.email,
            subject:'REGISTRATION SUCCESSFULL',
            text:`Dear Owner your Buisness have been set successfully. \n\n Please Note Your OrganisationCode is ${newOwner.OrganisationCode}. \n\n. Your Buisness Code is ${newcreationCode}. \n\n  HAPPY TRADING!! :) `
        })
    }
    res.status(201).json({
        status:'success',
        token,
        Details:newOwner,
        Buisness:buisnessData
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
        const phoneNumber = req.params.phoneNumber;
        const Ownerdata = await Owner.findOne({phoneNumber});
        if(!Ownerdata) {
            return res.status(404).json({
                status:'fail',
                message:'the Owner does not exists'
            })
        }
        let updatedName = req.body.Name??Ownerdata.Name;
        // let updatedNumber = req.body.phoneNumber??Owner.phoneNumberneed an authorization issue//
        const updatedData = {
            ...req.body,
            Name:updatedName,
            email:Ownerdata.email
            // phoneNumber:updatedNumber,
        }
        const data = await Owner.findOneAndUpdate(
            {
            
                phoneNumber
            },
            {
                $set:updatedData
            },
            {
                new:true,runValidators:true
            }
        )
        console.log(data.email)
        if(data.email) {
            await transporter.sendMail({
                from:process.env.email_user,
                to:data.email,
                subject:'INFORMATION UPDATED',
                text:'Dear User. \n\n Your information was updated on your request \n\n \n\n \n\n if it was not you please contact on devaccuflow@gmail.com '
            })
        }
        res.status(200).json({
            status:'success',
            newData:data
        })
    } catch(error) {
        res.status(500).json({
            status:'fail',
            message:error.message
        })
    }
    
}

exports.createNewBuisness = async(req,res,next)=>{
    try{
        const code = req.params.code;
        const record = await Owner.findOne({OrganisationCode:code});
        if(!record) {
            return res.status(403).json({
                status:'fail',
                message:'the action is not permitted',
            })
        }
        const BusinessCode = CreateCreationCode(code);
        const newBusiness = await Buisness.create({
            OrganisationCode:code,
            Owner:record.Name,
            phoneNumber:record.phoneNumber,
            email:record.email,
            CreationCode:BusinessCode
        })
        if(record.email) {
            await transporter.sendMail({
                from:process.env.email_user,
                to:record.email,
                subject:'NEW BUISNESS CREATION SUCCESSFULL',
                text:`Dear ${record.Name}\n\n You have successfully created a new Business.\n\nThe Organisation code is same as ${record.OrganisationCode}.\n\nThe new Buisness code is ${BusinessCode}`
            })
        }
        res.status(201).json({
           status:'success',
           newBusiness
        })
    }
    catch(error) {
        res.status(500).json({
            status:'fail',
            error:error.message
        })
    }
}
exports.BuisnessInfo = async(req,res,next)=>{
    try{
        const email = req.body.email;
        const owner = await Owner.findOne({email});
        if(!owner) {
            return res.status(404).json({
                status:'failure',
                message:'owner with the email is not registered'
            })
        }
        const buisness = await Buisness.find({OrganisationCode:owner.OrganisationCode});
        let buisnessarr = [];
        for(bui in buisness) {
            buisnessarr.push(buisness[bui].CreationCode);
        }
        if(!buisness) {
            return res.status(404).json({
                status:'failure',
                message:'buisness is not registered for this organisation code'
            })
        }
        res.status(200).json({
            status:'success',
            name:owner.Name,
            Organisation:owner.OrganisationCode,
            Buisness:buisnessarr
       })

    }catch(error) {
         res.status(400).json({
            status:'failure',
            message:error.message
        })
    }
}
