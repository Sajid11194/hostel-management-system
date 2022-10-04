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


passport.use('admin', new LocalStrategy((username, password, callback) => {
    Admin.findOne({username: username, password: password}, (err, admin) => {
        if (err) {
            callback(err);
        } else {
            callback(null, admin);
        }
    });
}));
passport.use('user', new LocalStrategy((username, password, callback) => {
    User.findOne({username: username, password: password}, (err, user) => {
        if (err) {
            callback(err);
        } else {
            callback(null, user);
        }
    });
}));

passport.serializeUser(function (user, done) {
    let role = "user";
    // if(user.isAdmin){
    //     isAdmin=true;
    // }
    done(null, {_id: user._id, role: role});
});

passport.deserializeUser(function (serializedUser, callback) {
    process.nextTick(function () {
        let target = User;
        if (serializedUser.role == "admin") {
            target = Admin;
        }
        target.findById(serializedUser._id, function (err, user) {
            callback(null, user);
        });
    });

});

function isUser(req) {
    return req.session.passport.user.role == "user";
}

function isAdmin(req) {
    return req.session.passport.user.role == "admin";
}

const seatSchema = new mongoose.Schema({
    seatName: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    roomName: {
        type: String,
        required: true,
        uppercase: true
    },
    hostelName: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    onService: {
        type: Boolean,
        default: true
    },
    resident: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})
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
    applications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Application'}]
});

const User = mongoose.model("User", userSchema);
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

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.session);
    } else {
        res.redirect("/user/login");
    }
});

app.get("/admin/login", (req, res) => {
    res.render('admin/login');
});

app.post('/admin/login', passport.authenticate('admin', {failureRedirect: '/admin/login'}), (err, req, res, next) => {
    if (err) next(err);
    res.redirect("/");
});


app.get("/admin/register", (req, res) => {
    res.render('admin/register');
});

app.post("/admin/register", (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const admin = new Admin({
        username,
        password
    });
    admin.save((err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/admin/login");
        }
    });

});


app.get("/user/login", (req, res) => {
    if (!isUser(req)) {
        res.render('user/login');
    } else {
        res.redirect("/");
    }
});

app.post('/user/login', passport.authenticate('user', {failureRedirect: '/user/login'}), (err, req, res, next) => {
    if (err) next(err);
    res.redirect("/");
});


app.get("/user/register", (req, res) => {
    if (!isUser(req)) {
        res.render('user/register');
    } else {
        res.redirect("/");
    }
});

app.post("/user/register", (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const user = new User({
        username,
        password
    });
    user.save((err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/user/login");
        }
    });
});

app.get("/user/profile", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {
        console.log(req.user);
        res.render('user/profile', {user: req.user});
    }
});

app.post("/user/profile", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const gender = req.body.gender;
        const dob = req.body.dob;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;
        const permanentAddress = req.body.permanentAddress;
        User.findByIdAndUpdate(req.user._id, {
            profile: {
                firstName,
                lastName,
                gender,
                dob,
                email,
                contact: {
                    phoneNumber,
                    permanentAddress
                }
            }
        }, (err, user) => {
            if (err) {
                console.log(err)
            } else {
                res.redirect("/user/profile")
            }
        });
    }
});

app.get("/user/apply", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {
        res.render('user/apply', {user: req.user});
    }
});

app.post("/user/apply", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {
        const hostelName = req.body.hostelName;
        const roomName = req.body.roomName;
        const package = req.body.package;
        const method = req.body.paymentMethod;
        const amount = req.body.paymentAmount;
        const trxId = req.body.trxId;
        const note = req.body.note;
        const applicationDate = new Date();
        const lastSubmitDate = new Date();

        Application.create({
            user: req.user._id,
            hostelName,
            roomName,
            package,
            payment: {
                method,
                amount,
                trxId
            },
            applicationDate,
            lastSubmitDate,
            note
        }, (err, application) => {
            if (err) {
                console.log(err)
            } else {
                console.log(application)
                User.findByIdAndUpdate(req.user._id, {$push: {applications: application._id}}, (err, updatedUserApplications) => {
                    console.log(err)
                    console.log("updatedUserApplications")
                    console.log(updatedUserApplications)
                    res.redirect("/")
                })

            }
        });
    }
});

app.listen(80, () => {
    console.log("Server Started");
});