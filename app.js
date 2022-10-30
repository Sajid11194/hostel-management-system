const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const MongoDBStore = require('connect-mongodb-session')(session);
const LocalStrategy = require("passport-local");
const slashes = require("connect-slashes");
const db = require("./schema/schema.js");
const flash = require('connect-flash');
//Database Schema
const Admin = db.Admin
const User = db.User
const Application = db.Application
const Hostel = db.Hostel
const Room = db.Room
const Seat = db.Seat

//Database Connection
mongoose.connect("mongodb://localhost:27017/hostelDB");
const sessionStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/hostelDB',
    collection: 'session'
});


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'test gg',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));


app.use(passport.initialize());
app.use(passport.session());


passport.use('admin', new LocalStrategy((username, password, callback) => {
    Admin.findOne({username: username, password: password}, (err, user) => {
        if (err || !user) {
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
        if (err || !user) {
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
    console.log(user)
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

app.use(flash());

app.use((req, res, next) => {
    app.locals.global = {
        role: req.session.passport?.user.role,
        user: req?.user,
        path: req.path,
        success:req.flash('success'),
        error:req.flash('error')
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


//Functions
Seat.findById("635d9b5da4c49d5394d8b168",(err,res)=>{
    console.log(res)
    res.resident=null
    res.save((er,rs)=>{
        console.log("SAved")
        console.log(rs)
    })
})
function bookSeat(userid,seatid){
    console.log("BOOKSEAT")
    console.log(userid)
    console.log(seatid)
    Seat.findById(seatid, (seatError, seat) => {
        if (seat.onService) {
            if (!seat.resident) {
                User.findById(userid, (errUser, user) => {
                    if (errUser || !user) {
                        return {status:"error",message: "Could not update user"};
                    } else {
                        if(user.seat){
                            return {status:"error",message: "User already assigned to a seat"};
                        } else {
                            user.seat=seatid
                            user.save((errUserSave,savedUser)=>{
                                if(errUserSave){
                                    return {status:"error",message: "Could not save user info,try again."};
                                } else {
                                    seat.resident=savedUser._id
                                    seat.save((errSeatSave,savedSeat)=>{
                                        if(errSeatSave){
                                            return {status:"error",message: "Could not save seat info,try again."};
                                        } else {
                                            return {status:"success",message: "Seat booked."};
                                        }
                                    })
                                }
                            })
                        }
                    }
                })

            } else {
                return {status:"error",message: "Seat already occupied"};
            }
        } else {
            return {status:"error",message: "Seat is not on Service"};

        }
    })

}




app.get('/', (req, res) => {
    req.flash('success',"XD")
    req.flash('success',"GG")
    res.redirect('/a')
})

app.get('/a', (req, res) => {
    res.send(req.path)
})

app.get("/user/login", (req, res) => {
    console.log(req.isAuthenticated())
    if (!isUser(req)) {
        res.render('user/login');
    } else {
        res.redirect("/");
    }
});

app.post('/user/login', passport.authenticate('user', {failureRedirect: '/user/login'}), (err, req, res, next) => {
    if (err) next(err);
    if(!req.isAuthenticated())
    {
        req.flash("error","Invalid username/password")
    }
    res.redirect("/user");
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

    Promise.all([Application.find({status: "pending"}).sort({_1: 1}).limit(5).populate('user'), Application.count(), User.count(), Seat.count(), Seat.count({resident: null})]).then(([applications, appCount, userCount, seatCount, emptySeatCount]) => {
        const values = {applications, stats: {appCount, userCount, seatCount, emptySeatCount}}
        res.render('admin/dashboard', values);
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

// app.post('/admin/login', function(req, res, next) {
//     passport.authenticate('admin', function(err, user, info) {
//         if (err) { return next(err); }
//         if (!user) {
//             req.flash("error","Username or password invalid");
//             return res.redirect('/admin/login'); }
//         req.flash("success","Logged In");
//
//         req.login(user, next);
//     })(req, res, next);
// });

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

app.get("/admin/hostel", (req, res) => {
    res.render('hostel')
})

app.get("/admin/hostel/add", (req, res) => {
    Hostel.find({},(err,result)=>{
        res.render('admin/hostel-add',{hostels:result,success:req.flash('success'),error:req.flash('error')})
    })
})

app.post("/admin/hostel/add/hostel", (req, res) => {
    const hostelName = req.body.hostelName;
    const floors = req.body.floors;
    const address = req.body.address;
    const gender = req.body.gender;
    const hostel = new Hostel({
        hostelName,
        floors,
        address,
        gender
    })
    hostel.save((err,rs)=>{
        if(!err){
            req.flash("success","Successfully added new hostel")
        } else {
            req.flash("error","Failed to add new hostel")

        }
        res.redirect("/admin/hostel/add");
    })
})
app.post("/admin/hostel/add/room", (req, res) => {
    const roomName = req.body.roomName;
    const floor = req.body.floor;
    const hostelId = req.body.hostelName;
    Hostel.findById(hostelId, (err, hostel) => {
        if (!err) {
            const room = new Room({
                roomName,
                floor,
                hostelName: hostel.hostelName
            })
            room.save((roomerr, roomres) => {
                if (!err) {
                    hostel.rooms.push(roomres._id)
                    hostel.save((hostelUpdateErr, hostelUpdate) => {
                        if (!hostelUpdateErr) {
                            res.redirect("/admin/hostel/add");
                        }
                    })
                }
            })
        }
    })

})

app.post("/admin/hostel/add/seat", (req, res) => {
    const seatName = req.body.seatName;
    const roomId = req.body.roomName;
    Room.findById(roomId, (err, room) => {
        if (!err) {
            const seat = new Seat({
                seatName,
                roomName: room.roomName,
                hostelName: room.hostelName
            })
            seat.save((seaterr, seatres) => {
                if (!err) {
                    console.log(seatres)
                    room.seats.push(seatres._id)
                    room.save((roomUpdateErr, roomUpdate) => {
                        if (!roomUpdateErr) {
                            res.redirect("/admin/hostel/add");
                        }
                    })
                } else {
                    console.log("Error Save Seat")
                }
            })
        }
    })

})
app.post("/admin/hostel/query", (req, res) => {
    console.log(req.query)
    if(req.query.getHostels){
        Hostel.find({},(err,hostel)=>{
            res.json(hostel)
        })
    }
    else if(req.query.getRooms){
    Hostel.findById(req.query.getRooms).populate("rooms").exec((err, rs) => {
        if (err) {
            res.json({error: err})
        } else if(rs) {
            res.json(rs.rooms)
        }
    })
     } else if(req.query.getSeats){
         Room.findById(req.query.getSeats).populate("seats").exec((err, rs) => {
             if (err || !rs) {
                 res.json({error: err})
             } else if(rs) {
                 res.json(rs.seats)
             }
         })
     } else {
         res.json({error: "bad request"});
     }

})
app.get("/admin/hostel/query/room", (req, res) => {
    console.log(req.query.id)

    if(req.query.id){
        Room.findById(req.query.id, (err, rs) => {
            if (err) {
                res.json({error: err})
            } else {
                res.json(rs.seats)
            }
        })
    }
})
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

app.get("/admin/user",(req,res)=>{
    let page = req.query.p;
    if (page < 1 || page == undefined) { //defaults to page 1
        page = 1;
    }
    const limit = 9;
    const find = {}

    //get only 10 results and | if page 2 then skips first (2*10-10)=10 results
    User.find(find).skip(page * limit - limit).limit(limit).populate('seat').exec((err, users) => {
        if (err) {
            console.log(err)
        } else {
            User.count(find).exec((err, total) => {
                const totalPage = Math.round(Number(total) / Number(limit));
                res.render('admin/user-list', {
                    users,
                    stats: {total: Number(total), page: Number(page), limit: limit, totalPage: totalPage}
                });
            })

        }
    })
    ;
});

app.get("/admin/user/review/:userid",(req,res)=>{
    User.findById(req.params.userid).populate('seat').exec((err, user) => {
        if(err || !user){
            req.flash('error','User not found')
        } else {
            Hostel.find({},(er,result)=>{
                res.render('admin/review-user',{user,hostels:result})
            })
        }
    })

})

app.post("/admin/book",(req,res)=>{
    console.log(req.path);
    const result=bookSeat(req.body.user,req.body.seat);
    console.log(result)
    res.redirect("/admin/user")
})