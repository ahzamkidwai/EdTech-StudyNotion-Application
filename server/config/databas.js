const mongoose = require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{
        console.log("Database Connection is Successfull.");
    })
    .catch((err)=>{
        console.log("Database Connection Failed.");
        console.error(err);
        process.exit(1);
    })
}