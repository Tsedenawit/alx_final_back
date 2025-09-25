 import mongoose from "mongoose";

 const connectdb = async () => {
    try{
        const connect = await mongoose.connect("mongodb+srv://tsedi:hkKdBxrtuxuX1GBW@cluster0.rabowcl.mongodb.net/?retryWrites=true&w=majority")
        console.log("database connected: ", 
        connect.connection.host,
        connect.connection.name
        );
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}
export { connectdb };

// const mongoose=require("mongoose")

// mongoose.connect("mongodb://localhost:27017/LoginFormPractice")
// .then(()=>{
//     console.log('mongoose connected');
// })
// .catch((e)=>{
//     console.log('failed');
// })

// const logInSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     }
// })

// const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

// module.exports=LogInCollection