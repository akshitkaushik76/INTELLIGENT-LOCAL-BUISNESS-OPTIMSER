const Customers = require('./../MODELS/Customer');
const Owners = require('./../MODELS/Owner');
const jwt = require('jsonwebtoken');
const authtoken = (data)=>{
  const token  = jwt.sign({id:data._id},process.env.SECRET_STRING,{
    expiresIn:process.env.EXPIRES_IN
  })
  return token;
}

const login = (model)=> async(req,res,next)=>{
   try{
    const {email,password} = req.body;
    if(!email || password) {
      return res.status(400).json({
        status:'failure',
        message:'please provide email and password to continue'
      })
    }
    const user = await model.findOne({emailid}).select('+password');
    if(!user) {
      return res.status(404).json({
        status:'failure',
        message:'email  is wrong ,please enter correct credentials to continue'
      })
    }
    const isMatch = await comparePasswordinDb(password,user.password);
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
exports.loginOwner = login(Owners);
exports.loginCustomer = login(Customers);
