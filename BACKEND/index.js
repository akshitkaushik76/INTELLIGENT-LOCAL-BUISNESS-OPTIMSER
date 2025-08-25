require('dotenv').config({path:'./config.env'});
const express = require('express');
const app = express();
const mongoose = require('mongoose');
console.log(process.env.PORT);


mongoose.connect(process.env.CONNECTION_STRING,{
}).then(()=>{
    console.log('connected to the database through port ',process.env.PORT);
}).catch((err)=>{
    console.log('error occurred ',err.message);
})

app.listen(process.env.PORT,()=>console.log('server running at port ',process.env.CONNECTION_STRING))

