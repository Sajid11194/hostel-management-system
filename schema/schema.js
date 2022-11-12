const mongoose = require('mongoose');

const xd="GG";


//Admin Schema
const adminSchema = new mongoose.Schema({
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
        lowercase: true,
    }
})
const Admin = new mongoose.model("Admin", adminSchema);

//Application Schema
const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    package: String,
    hostel: String,
    payment: {
        method: String,
        amount: Number,
        trxId: String
    },
    applicationDate: {
        type:Date,
        default:Date.now
    },
    note: String,
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "queued"],
        default: "pending"
    },
    lastSubmitDate: Date,
    noteFromAdmin: String

})
const Application = mongoose.model("Application", applicationSchema);

//User Schema
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

        lowercase: true
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

//Hostel Related Schema
const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        uppercase: true
    },
    floor: Number,
    hostelName:{
        type:String,
        required:true,
        uppercase:true
    },
    seats: [{type: mongoose.Schema.Types.ObjectId, ref: 'Seat'}]
});
const Room = mongoose.model('Room', roomSchema);


const hostelSchema = new mongoose.Schema({
    hostelName: {
        type:String,
        unique:true
    },
    floors: Number,
    address: String,
    gender: {
        type:String,
        enum:["MALE","FEMALE"],
        uppercase:true
    },
    rooms:[{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}]
});
const Hostel = mongoose.model('hostellist', hostelSchema);


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


module.exports={
    adminSchema,
    Admin,
    userSchema,
    User,
    applicationSchema,
    Application,
    hostelSchema,
    Hostel,
    roomSchema,
    Room,
    seatSchema,
    Seat,
    xd
}

