const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/hostelDB");


const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    package: String,
    hostel: {
        hostelName: String,
        roomName: String
    },
    payment: {
        method: String,
        amount: Number,
        trxId: String
    },
    applicationDate: Date,
    note: String,
    status: {
        type: String,
        enum: ["draft", "pending", "accepted", "rejected", "revision"],
        default: "pending"
    },
    lastSubmitDate: Date,
    noteFromAdmin: String

})
const Application = mongoose.model("Application", applicationSchema);
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0
    },
    profile: {
        firstName: String,
        lastName: String,
        gender: {
            type: String,
            enum: ["male", "female"]
        },
        dob: String,
        contact: {
            phoneNumber: String,
            permanentAddress: String
        },
    },
    seat: {type: mongoose.Schema.Types.ObjectId, ref: 'Seat'},
    applications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Application'}],
    package: String
});

const User = mongoose.model("User", userSchema);

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        uppercase: true
    },
    floor: Number,
    seats: [{type: mongoose.Schema.Types.ObjectId, ref: 'Seat'}]
});
const Room = mongoose.model('Room', roomSchema);

const seatSchema = new mongoose.Schema({
    seatName: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    roomName: {
        type: String,
        required:true,
        uppercase: true
    },
    hostelName: {
        type: String,
        required: true,
        uppercase: true
    },
    onService: {
        type: Boolean,
        default: true
    },
    resident: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const Seat = mongoose.model("Seat", seatSchema);
const room = new Room({
    roomName: "100",
    floor: 1,
})



const hostelSchema = new mongoose.Schema({
    hostelName: {
        type:String,
        unique:true
    },
    address: String,
    floors: Number,
    rooms:[roomSchema]
});
const Hostel = mongoose.model('hostellist', hostelSchema);

const hostel = new Hostel({
    hostelName: "Test Hostel",
    address: "Dhaka",
    floors: 420
});

//hostel.save()

// Hostel.findById("635afb879d2aa660a509b62c",(err,res)=>{
//     res.rooms.push(room)
//     res.save()
// })
Hostel.findById("635afb879d2aa660a509b62c",(err,res)=>{
    if(res){
    res.rooms.forEach((room)=>{
        if(room.roomName=="100"){
            const seat=new Seat({
                seatName: "D",
                roomName:room.roomName,
                hostelName:res.hostelName+"B"
            })
            seat.save((err2,res2)=>{
                if (!err2){
                room.seats.push(res2._id)
                res.save((err3,res3)=>{
                    console.log(err3)
                    console.log(res3)
                })
                }
                else{
                    console.log(err2)
                }
            })

        } else {
            console.log("room not found")
        }
    })}
})

// Hostel.findOne({},(err,res)=>{
//     console.log(err)
//     console.log(res)
//     res.rooms.push(room)
//     res.save((er,rs)=>{
//         console.log(er)
//         console.log(rs)
//     })
// })
// Hostel.findOne({hostelName:"Laal Boys Ashulia"},(err,res)=>{
//
//     res.rooms.push(room);
//     res.save((e,r)=>{
//         console.log("saved");
//     })
// })

// Hostel.findOne({hostelName:"Laal Boys Ashulia"},(err,res)=>{
//
//     res.rooms.push(room);
//     res.save((e,r)=>{
//         console.log("saved");
//     })
// })
//
//
// const info=(xd)=>{
//     return {
//         user: "6359a04fd4b07197b6570b74", hostel:{hostelName:xd+"  GG", roomName:"GG1A"}, package:"Luxury", payment: {
//         method:"Bkash", amount:"100", trxId:"HH"
//     }, applicationDate:new Date(), lastSubmitDate:new Date(), note:xd,status:"rejected"
//     }
// };
// for(let i=0;i<100;i++){
// Application.create(info(i), (err, application) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(application);
//
//     }
// });
// }
