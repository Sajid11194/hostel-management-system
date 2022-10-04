const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const MongoDBStore = require('connect-mongodb-session')(session);
const LocalStrategy = require("passport-local");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/hostelDB");
const sessionStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/hostelDB',
    collection: 'session'
});
app.use(session({
    secret: 'test gg',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
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
app.use(passport.initialize());
app.use(passport.session());


passport.use('admin',new LocalStrategy((username,password,callback)=>{
    console.log("Stat : ")
    console.log(username);
    Admin.findOne({username:username,password:password},(err,admin)=>{
        if(err){
            callback(err);
        } else {
            console.log("Stat find: ")
            console.log(admin);
            callback(null,admin);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, {_id: user._id});
});

passport.deserializeUser(function(id, callback) {
    console.log("DEerialized : ")
    console.log(id);
    process.nextTick(function () {
        console.log("Now Deserial nextTick")
        Admin.findById(id.xd, function (err, user) {
            console.log(user);
            let newuser={
                gg:"DD",
                xd:"GG"
            }
            callback(null, newuser);
        });
    });

});

const seatSchema=new mongoose.Schema({
    seatName:{
        type:String,
        required:true,
        unique: true,
        uppercase:true
    },
    roomName:{
        type:String,
        required:true,
        uppercase:true
    },
    hostelName:{
        type:String,
        required:true,
        unique: true,
        uppercase:true
    },
    onService:{
        type:Boolean,
        default:true
    },
    resident:{
        id:{
            type:String,
        },
        bookingDate:{
            type:Date,
            default:Date.now
        },
        expiryDate:{
            type:Date
        }
    }
})

app.get("/", (req, res) => {
    res.send(req.user);
});

app.get("/admin/login", (req, res) => {
    res.render('admin/login');
});

app.post('/admin/login', passport.authenticate('admin', { failureRedirect: '/admin/login' }), (err, req, res, next) => {
    if (err) next(err);
    console.log('You are logged in!');
    res.redirect("/");

});


app.get("/admin/register", (req, res) => {
    res.render('admin/register');
});

app.post("/admin/register", (req, res) => {
    const username=req.body.username.toLowerCase();
    const password=req.body.password;
    Admin.register({username: username,test:"XDD"}, password, (err, admin) => {
        if (err) {
            console.log(err);
        } else {
            console.log("NOW AUTH")
            Admin.authenticate(username, password, (err, result) => {
                if (err) {
                    console.log("auth : ");
                    console.log(err);
                } else {
                    console.log(req.session)
                }
            });
        }
    })
});

app.listen(80, () => {
    console.log("Server Started");
});