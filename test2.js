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
const Test = mongoose.model("Test", applicationSchema);

const info=(xd)=>{
    return {
        user: "633c455ddfe915efc9cf44d0", hostel:{hostelName:xd+"  GG", roomName:"GG1A"}, package:"Luxury", payment: {
        method:"Bkash", amount:"100", trxId:"HH"
    }, applicationDate:new Date(), lastSubmitDate:new Date(), note:xd,status:"rejected"
    }
};
for(let i=0;i<100;i++){
Application.create(info(i), (err, application) => {
    if (err) {
        console.log(err)
    } else {
        console.log(application);

    }
});
}
