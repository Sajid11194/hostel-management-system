const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const MongoDBStore = require('connect-mongodb-session')(session);
const LocalStrategy = require("passport-local");
const app = express();
const slashes = require("connect-slashes");
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
const roomSchema= new mongoose.Schema({
    roomName:String,
    seats:[{type: mongoose.Schema.Types.ObjectId, ref: 'Seat'}]
})
const hostelSchema = new mongoose.Schema({
    hostelName:String,
    address:String,
    floors:Number,
    rooms:[roomSchema]
})
app.use(passport.initialize());
app.use(passport.session());


passport.use('admin', new LocalStrategy((username, password, callback) => {
    Admin.findOne({username: username, password: password}, (err, user) => {
        if (err) {
            callback(err);
        } else {
            newAdmin = {
                role: "admin",
                user: user
            }
            callback(null, newAdmin);
        }
    });
}));
passport.use('user', new LocalStrategy((username, password, callback) => {
    User.findOne({username: username, password: password}, (err, user) => {
        if (err) {
            callback(err);
        } else {
            newUser = {
                role: "user",
                user
            }
            callback(null, newUser);
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, {_id: user.user._id, role: user.role});
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
    return req.isAuthenticated() && (req.session.passport.user.role == "user");
}

function isAdmin(req) {
    return req.isAuthenticated() && (req.session.passport.user.role == "admin");
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

const Seat = mongoose.model("Seat", seatSchema);

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
        enum: ["draft", "pending", "accepted", "rejected", "queue"],
        default: "pending"
    },
    lastSubmitDate: Date,
    noteFromAdmin: String

})
const Application = mongoose.model("Application", applicationSchema);
app.use((req, res, next) => {
    app.locals.global = {
        role: req.session.passport?.user.role,
        user: req?.user,
        path:req.path
    };

    next()
})
app.use(/^[\/]admin($|\/)(?!login)(?!register).*/, (req, res, next) => {
    if (isAdmin(req)) {
        next();
    } else {
        res.redirect("/admin/login")
    }
})

app.use(/^[\/]user($|\/)(?!login)(?!register).*/, (req, res, next) => {
    if (isUser(req)) {
        next();
    } else {
        res.redirect("/user/login")
    }
})

app.use(slashes(false));

app.get("/", (req, res) => {

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
    res.render('user/profile', {user: req.user});
});

app.post("/user/profile", (req, res) => {

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

});

app.get("/user/apply", (req, res) => {

    res.render('user/apply', {user: req.user});

});

app.post("/user/apply", (req, res) => {
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
        hostel: {
            hostelName,
            roomName
        },
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

});

app.listen(80, () => {
    console.log("Server Started");
});

app.get("/admin", (req, res) => {
    //testing if running query in parallel will reduce time or not

    Promise.all([Application.find({status:"pending"}).sort({_1:1}).limit(5).populate('user'),Application.count(),User.count(),Seat.count(),Seat.count({resident:null})]).then(([applications,appCount,userCount,seatCount,emptySeatCount])=>{
        const values={applications,stats:{appCount,userCount,seatCount,emptySeatCount}}
        res.render('admin/dashboard',values);
    });
});

app.get("/admin/login", (req, res) => {

    if (!isAdmin(req)) {
        res.render('admin/login');
    } else {
        res.redirect("/admin");
    }
});

app.post('/admin/login', passport.authenticate('admin', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
}), (err, req, res, next) => {
    if (err) next(err);
    res.redirect("/admin");
});


app.get("/admin/register", (req, res) => {
    if (!isAdmin(req)) {
        res.render('admin/register');
    } else {
        res.redirect("/");
    }
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


app.get(["/admin/applications/:status", "/admin/applications"], (req, res) => {
    const status = req.params.status;
    let page = req.query.p;
    if (page < 1 || page == undefined) { //defaults to page 1
        page = 1;
    }
    const limit = 9;
    const find = {}
    if (status != "all" && status != undefined) {
        find.status = status; // building query, filter by status only if users wants
    }

    //get only 10 results and | if page 2 then skips first (2*10-10)=10 results
    Application.find(find).skip(page * limit - limit).limit(limit).populate('user').exec((err, applications) => {
        if (err) {
            console.log(err)
        } else {
            Application.count(find).exec((err, total) => {
                const totalPage = Math.round(Number(total) / Number(limit));
                res.render('admin/applications', {
                    applications,
                    stats: {total: Number(total), page: Number(page), limit: limit, totalPage: totalPage}
                });
            })

        }
    })
    ;
});


app.get("/admin/applications/review/:id", (req, res) => {
    const id = req.params.id;
    if (id == undefined) {
        res.redirect("/admin/applications");
    }
    Application.findById(id).populate('user').exec((err, application) => {
        res.render('admin/review', {application, path: req.path})
    })

});
app.get("/admin/applications/review/:id/:action", (req, res) => {
    console.log("++++++++++++++++++++++++")
});
app.post("/admin/applications/review/:id/:action", (req, res) => {
    console.log(req.body)
    const applicationId = req.params.id;
    const applicationAction = req.params.action;
    const message = req.body.message;
    const seatName = req.body.seatName;
    const package = req.body.package;

//here comes nested callback cancer :p
    if (applicationAction == "accepted") {
        Application.findById(applicationId).populate('user').exec((errApp, application) => {
            Seat.findOne({seatName}, (seatError, seat) => {
                if (seat.onService) {
                    if (seat.resident) {
                        seat.update({resident: application.user._id}, (seatUpdateError, updatedSeat) => {
                            if (seatUpdateError) {
                                console.log("//seat update error");
                            } else {
                                User.findByIdAndUpdate(application.user._id, {
                                    seat: seat._id,
                                    package: package
                                }, (errUser, user) => {
                                    if (errUser) {
                                        console.log("//user update error");
                                    } else {
                                        application.update({
                                            status: applicationAction,
                                            lastSubmitDate: new Date(),
                                            noteFromAdmin: message
                                        }, (appUpdateError, updatedApp) => {
                                            if (appUpdateError) {
                                                console.log("//app update error");
                                            } else {
                                                res.redirect("/admin/applications")
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        console.log("//seat occupied");
                    }
                } else {
                    console.log("//seat not on service");
                }
            })
        });
    } else {
        Application.findByIdAndUpdate(applicationId, {
            status: applicationAction,
            noteFromAdmin: message
        }, (err, application) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/admin/applications");
            }
        })
    }

});

