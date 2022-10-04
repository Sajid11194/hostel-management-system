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
    console.log("Stat : ")
    console.log(username);
    Admin.findOne({username: username, password: password}, (err, admin) => {
        if (err) {
            callback(err);
        } else {
            console.log("Stat find: ")
            console.log(admin);
            callback(null, admin);
        }
    });
}));
passport.use('user', new LocalStrategy((username, password, callback) => {
    console.log("Stat : ")
    console.log(username);
    User.findOne({username: username, password: password}, (err, user) => {
        if (err) {
            callback(err);
        } else {
            console.log("Stat find: ")
            console.log(user);
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
            console.log(user);
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
    resident: {
        id: {
            type: String,
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date
        }
    }
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
    profile: {
        firstName: String,
        lastName: String,
        dob: String,
        contact: {
            phoneNumber: String,
            permanentAddress: String
        },
    },
    seat: {type: mongoose.Schema.Types.ObjectId, ref: 'Seat'},
    subscriptionInfo:
        {
            bookingDate: Date,
            expiryDate: Date,
        }
})

const User = mongoose.model("User", userSchema);

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
    console.log('You are logged in!');
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
            console.log(result)
            res.send("Success");
        }
    });

});


app.get("/user/login", (req, res) => {
    console.log("RESULKT " + isUser(req))
    if (!isUser(req)) {
        res.render('user/login');
    } else {
        res.redirect("/");
    }
});

app.post('/user/login', passport.authenticate('user', {failureRedirect: '/user/login'}), (err, req, res, next) => {
    if (err) next(err);
    console.log('You are logged in!');
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
            console.log(result)
            res.send("Success");
        }
    });
});

app.get("/user/profile", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {

    res.render('user/profile',{user:req.user});
    }
});

app.post("/user/profile", (req, res) => {
    if (!isUser(req)) {
        res.redirect("/user/login")
    } else {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const dob = req.body.dob;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;
        const permanentAddress = req.body.permanentAddress;
        User.findByIdAndUpdate(req.user._id, {
            profile: {
                firstName,
                lastName,
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


app.listen(80, () => {
    console.log("Server Started");
});