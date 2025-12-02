const { isMACAddress } = require('validator');
const Customers = require('./../MODELS/Customer');
const Owners = require('./../MODELS/Owner');
const jwt = require('jsonwebtoken');
const util = require('util');
const authtoken = (data)=>{
  const token  = jwt.sign({id:data._id},process.env.SECRET_STRING,{
    expiresIn:process.env.EXPIRES_IN
  })
  return token;
}

exports.loginCustomer =   async(req,res,next)=>{
   try{
    const {emailid,password} = req.body;
    if(!emailid || !password) {
      return res.status(400).json({
        status:'failure',
        message:'please provide email and password to continue'
      })
    }
    const user = await Customers.findOne({emailid}).select('+password');
    console.log(user);
    if(!user) {
      return res.status(404).json({
        status:'failure',
        message:'email  is wrong ,please enter correct credentials to continue'
      })
    }
    const isMatch = await user.comparePasswordinDb(password,user.password);
    if(!isMatch) {
      return res.status(400).json({
        status:'failure',
        message:'please provide a correct password'
      })
    }
    const token = authtoken(user);
    res.status(200).json({
      status:'success',
      message:'logged in successfully',
      
      token
    })
   }catch(error) {
    res.status(500).json({
      status:'failure',
      message:error.message
    })
   }

}
exports.loginOwner = async(req,res,next)=>{
  try{
    const {email,password} = req.body;
    if(!email || !password) {
      return res.status(400).json({
        status:"failure",
        message:"please provide all the credentials to continue"
      })
    }
    const user = await Owners.findOne({email}).select('+password');
    if(!user) {
      return res.status(404).json({
        status:'fail',
        message:"please provide the correct email address to continue"
      })
    }
    const isMatch = await user.comparePasswordinDb(password,user.password);
    if(!isMatch) {
      return res.status(400).json({
        status:'failure',
        message:"please provide correct password to continue"
      })
    }
    const token = authtoken(user);
    res.status(200).json({
      status:'success',
      message:"loggedin successfully",
      OrganisationCode:user.OrganisationCode,
      token
    })
  }catch(error) {
    res.status(500).json({
      status:'fail',
      error:error.message
    })
  }
}
const protect = (Model)=> async(req,res,next)=>{
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }
    console.log(token);
    if(!token) {
        return res.status(400).json({
          status:'fail',
          message:"login for access information"
        })
    }
    const decodedToken = await util.promisify(jwt.verify)(token,process.env.SECRET_STRING);
    console.log(decodedToken);
    //if the user does not exists//
    const user = await Model.findById(decodedToken.id);
    console.log(user);
    if(!user) {
       return res.status(404).json({
        status:'fail',
        message:"unauthorised access!! the user with the token does not exits"
       })
    }
    if(await user.isPasswordChanged(decodedToken.iat)) {
       return res.status(400).json({
          status:'failure',
          message:"password changed recently , please login again"
       })
    } 
    req.user = user;
    next();
 }


exports.protectOwner = protect(Owners);
exports.protectCustomer = protect(Customers);

