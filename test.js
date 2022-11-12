const delay = ms => new Promise(res => setTimeout(res, ms));

async function timeFunction() {
    await delay(3000)
    console.log("HI")

    return "HIxx"
}
const x=timeFunction()
console.log(x)
// const x=false
// if(x){
//     console.log("HI")
// }
// else {
//     console.log("XD")
// }
// // const express = require("express");
// // const bodyParser = require("body-parser");
// // const ejs = require("ejs");
// // const mongoose = require('mongoose');
// // const session = require("express-session");
// // const passport = require("passport");
// // const LocalStrategy = require("passport-local");
// // const app = express();
// // app.set('view engine', 'ejs');
// // app.use(bodyParser.urlencoded({extended: true}));
// //
// // mongoose.connect("mongodb://localhost:27017/hostelDB");
// //
// // const adminSchema = new mongoose.Schema({
// //     username: {
// //         type: String,
// //         required: true,
// //         unique: true,
// //         lowercase: true
// //     },
// //     password: {
// //         type: String,
// //         required: true,
// //     },
// //     email: {
// //         type: String,
// //         lowercase: true,
// //     }
// // })
// //
// // const Admin = new mongoose.model("Admin", adminSchema);
// //
// // const seatSchema = new mongoose.Schema({
// //     seatName: {
// //         type: String,
// //         required: true,
// //         unique: true,
// //         uppercase: true
// //     },
// //     roomName: {
// //         type: String,
// //         required: true,
// //         uppercase: true
// //     },
// //     hostelName: {
// //         type: String,
// //         required: true,
// //     },
// //     inService: {
// //         type: Boolean,
// //         default: true
// //     },
// //     resident: {
// //         type: String,
// //         default: null
// //     }
// // })
// // console.log("Started")
// //
// // const Seat = mongoose.model('Seat', seatSchema);
// // Seat.create({seatName:"X1",roomName:"X",hostelName:"XD"},(err,res)=>{
// //     cnew("XDXXX",res._id);
// //
// // })
// // const userSchema = new mongoose.Schema({
// //     username: {
// //         type: String,
// //         required: true,
// //         unique: true,
// //         lowercase: true
// //     },
// //     password: {
// //         type: String,
// //         required: true,
// //     },
// //     email: {
// //         type: String,
// //         required: true,
// //     },
// //     profile: {
// //         firstName: String,
// //         lastName: String,
// //         dob: String,
// //         contact: {
// //             phoneNumber: String,
// //             permanentAddress: String
// //         },
// //     },
// //     seat: {type: mongoose.Schema.Types.ObjectId, ref: 'Seat'},
// //     subscriptionInfo:
// //         {
// //             bookingDate: Date,
// //             expiryDate: Date,
// //         }
// // })
// //
// // const User = mongoose.model("User", userSchema);
// //
// // function cnew(x, id) {
// //     let today = new Date();
// //     let password="Newp";
// //     today.setDate(today.getDate() + 30);
// //     const user = new User({
// //         username: "sajid" + x,
// //         password,
// //         email: "sajid@gmail.com",
// //         profile: {
// //             firstName: "Farhan",
// //             lastName: "Sajid",
// //             dob: "GGXD",
// //             contact: {
// //                 phoneNumber: "01320349350",
// //                 permanentAddress: "Dhaka"
// //             }
// //         },
// //         seat: id,
// //         subscriptionInfo:
// //             {
// //                 bookingDate: Date.now(),
// //                 expiryDate: today,
// //             }
// //     })
// //
// //     user.save((err, res) => {
// //         console.log(err);
// //         console.log(res)
// //     })
// // }
// //
// // const applicationSchema=new mongoose.Schema({
// //     user:{
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: 'User'
// //     },
// //     package:String,
// //     requestedRoom:String,
// //     validity:String,
// //     payment:{
// //         method:String,
// //         amount:Number,
// //         trxId:String
// //     },
// //     applicationDate:Date,
// //     note:String,
// //     status:{
// //         type:String,
// //         enum:["draft","pending","accepted","rejected","revision"],
// //         default:"pending"
// //     },
// //     lastSubmitDate:Date,
// //     noteFromAdmin:String
// //
// // })
// // const Application = mongoose.model("Application",applicationSchema);
// //
// //
// //
// // //
// // // User.findOne({username: "sajidxd"}).populate('Seat').exec((err, res) => {
// // //     console.log(err);
// // //
// // //     console.log("NOW FIND");
// // //     console.log(res);
// // //     console.log("NOW Room");
// // //     console.log(res.seat);
// // //
// // // });
// // User.findOne({title: 'sajidxd'}).populate('seat').exec(function (err, user) {
// //     console.log(err);
// //     console.log(user);
// // });
// //
// //
// // // seat.save((error,result)=>{
// // //     console.log("NOW ERROR ")
// // //     console.log(error);
// // //     console.log("NOW Result ")
// // //     console.log(result);
// // // })
// //
// // // Seat.findById("633bf11597e20c5c408f645b", (err, result) => {
// // //     console.log("Found")
// // //     let today = new Date();
// // //     today.setDate(today.getDate() + 30);
// // //     const resident = {
// // //         id: "123",
// // //         bookingDate: undefined,
// // //         expiryDate: today
// // //     }
// // //     result.resident = resident;
// // //     result.save((er, res) => {
// // //         console.log("Saved")
// // //         console.log(er);
// // //         console.log(res)
// // //     })
// // // });
// //
// // // Admin.findById("633b5316a72de46b27d08d0C",(err,admin)=>{
// // //     if(err)console.log(err)
// // //     else{
// // //         console.log(admin);
// // //     }
// // // })