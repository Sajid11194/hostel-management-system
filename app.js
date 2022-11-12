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
        success: req.flash('success'),
        error: req.flash('error')
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
// Seat.findById("635d9b5da4c49d5394d8b168", (err, res) => {
//     console.log(res)
//     res.resident = null
//     res.save((er, rs) => {
//         console.log("SAved")
//         console.log(rs)
//     })
// })


function bookSeat(userId, seatId) {
    const query=new Promise((result,error)=>{
    Seat.findById(seatId, (seatError, seat) => {
        if (seat.onService) {
            if (!seat.resident) {
                User.findById(userId, (errUser, user) => {
                    if (errUser || !user) {
                        result({status: "error", message: "Could not update user"});
                    } else {
                        if (user.seat) {
                            result({status: "error", message: "User already assigned to a seat"});
                        } else {
                            user.seat = seatId
                            user.save((errUserSave, savedUser) => {
                                if (errUserSave) {
                                    result({status: "error", message: "Could not save user info,try again."});
                                } else {
                                    seat.resident = savedUser._id
                                    seat.save((errSeatSave, savedSeat) => {
                                        if (errSeatSave) {
                                            result({status: "error", message: "Could not save seat info,try again."});
                                        } else {
                                            result({status: "success", message: "Seat booked."});
                                        }
                                    })
                                }
                            })
                        }
                    }
                })

            } else {
                result({status: "error", message: "Seat already occupied"});
            }
        } else {
            result({status: "error", message: "Seat is not on Service"});

        }
    })
    })
    return query;
}


function cancelSeat(userId, seatId) {
    const query=new Promise((result,fail)=>{
        if (userId == undefined && seatId == undefined) {
            result({status: "error", message: "Invalid user or seat"})
        } else if (userId) {
            User.findById(userId, (errFindUser, user) => {
                if (errFindUser || !user) {
                    result({status: "error", message: "Could not find user"})
                } else {
                    Seat.findById(user.seat, (errFindSeat, seat) => {
                        if (errFindSeat || !seat) {
                            result({status: "error", message: "Could not find seat"})
                        } else {
                            seat.resident = null;
                            seat.save((errSaveSeat, savedSeat) => {
                                if (errSaveSeat) {
                                    result({status: "error", message: "Error Updating Seat"})
                                } else {
                                    user.seat = null;
                                    user.save((errSaveUser, savedUser) => {
                                        if (errSaveUser) {
                                            console.log(errSaveUser)
                                            result({status: "error", message: "Error Updating User"})
                                        } else {
                                            console.log("HH")
                                            result({status: "success", message: "Successfully Canceled Seat"})
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } else if (seatId) {
            Seat.findById(seatId, (errFindSeat, seat) => {
                if (err || !seat) {
                    result({status: "error", message: "Could not find seat"})
                } else (seat)
                {
                    User.findById(seat.resident, (errFindUser, user) => {
                        if (errFindUser || !user) {
                            result({status: "error", message: "Could not find user"})
                        } else {
                            user.seat = null;
                            user.save((errSaveUser, savedUser) => {
                                if (errSaveUser) {
                                    result({status: "error", message: "Error Updating User"})
                                } else {
                                    seat.resident = null
                                    seat.save((errSaveSeat, savedSeat) => {
                                        if (errSaveSeat) {
                                            result({status: "error", message: "Error Updating Seat"})
                                        } else {
                                            result({status: "success", message: "Successfully Canceled User"})
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } else {
            result({status: "error", message: "Invalid user or seat"})
        }})
    return query;
}

app.get('/', (req, res) => {
    req.flash('success', "XD")
    res.redirect('/a')
})

app.get("/user", (req, res) => {
    //testing if running query in parallel will reduce time or not
    User.findById(req.user._id).populate('seat').exec((err, user) => {
        res.render('user/dashboard', {user});

    })
});
app.get("/user/login", (req, res) => {
    if (!isUser(req)) {
        res.render('user/login');
    } else {
        res.redirect("/user");
    }
});

app.post('/user/login', passport.authenticate('user', {
    successRedirect: '/user',
    failureRedirect: '/user/login'
}), (err, req, res, next) => {
    if (err) next(err);
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
            contact: {
                phoneNumber,
                permanentAddress
            }
        },
        email

    }, (err, user) => {
        if (err) {
            req.flash("error",error)
        } else {
            req.flash("success","Profile Saved")
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
        hostel: hostelName,
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
app.get("/user/applications", (req, res) => {
    const status = req.query.status;
    let page = req.query.p;
    if (page < 1 || page == undefined) { //defaults to page 1
        page = 1;
    }
    const limit = 9;
    const find = {_id: req.user._id}
    if (status != undefined) {
        find.status = status; // building query, filter by status only if users wants
    }

    //get only 10 results and | if page 2 then skips first (2*10-10)=10 results
    User.findById(find).populate('applications').exec((err, user) => {
        if (err) {
            console.log(err)
        } else {
            const total = user.applications.length;
            const totalPage = Math.round(Number(total) / Number(limit));
            const start = page * limit - limit;
            const end = start + limit;
            res.render('user/applications', {
                applications: user.applications.slice(start - end),
                stats: {total: Number(total), page: Number(page), limit: limit, totalPage: totalPage}
            });

        }
    })
    ;
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
    Hostel.find({}, (err, result) => {
        res.render('admin/hostel-add', {hostels: result, success: req.flash('success'), error: req.flash('error')})
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
    hostel.save((err, rs) => {
        if (!err) {
            req.flash("success", "Successfully added new hostel")
        } else {
            req.flash("error", "Failed to add new hostel")

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
    if (req.query.getHostels) {
        Hostel.find({}, (err, hostel) => {
            res.json(hostel)
        })
    } else if (req.query.getRooms) {
        Hostel.findById(req.query.getRooms).populate("rooms").exec((err, rs) => {
            if (err) {
                res.json({error: err})
            } else if (rs) {
                res.json(rs.rooms)
            }
        })
    } else if (req.query.getSeats) {
        Room.findById(req.query.getSeats).populate("seats").exec((err, rs) => {
            if (err || !rs) {
                res.json({error: err})
            } else if (rs) {
                let seats = rs.seats.filter(seat => !seat.resident); //filtering already booked rooms
                res.json(seats)
            }
        })
    } else {
        res.json({error: "bad request"});
    }

})

app.get("/admin/applications", (req, res) => {
    const status = req.query.status;
    let page = req.query.p;
    if (page < 1 || page == undefined) { //defaults to page 1
        page = 1;
    }
    const limit = 9;
    const find = {}
    if (status != undefined) {
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
        res.render('admin/review-application', {application, path: req.path})
    })

});

app.post("/admin/applications/review/:id", (req, res) => {
    console.log(req.body)
    const applicationId = req.params.id;
    const applicationAction = req.body.applicationStatus;
    const message = req.body.message;
    const seatName = req.body.seatName;
    const package = req.body.package;

//here comes nested callback cancer :p
    if (applicationAction == "accepted") {
        const updateSeatResult = bookSeat(userid, seatid);
        if (updateSeatResult.status == "success") {
            Application.findByIdAndUpdate(applicationId, {
                    status: applicationAction,
                    lastSubmitDate: new Date(),
                    noteFromAdmin: message
                }
                , (err, application) => {
                    if (err || !application) {
                        req.flash("error", "Could not update application")
                    } else {
                        req.flash("success", "Application Accepted")
                    }

                })
        } else {
            req.flash(updateSeatResult.status, updateSeatResult.message);
        }
    } else {
        Application.findByIdAndUpdate(applicationId, {
            status: applicationAction,
            noteFromAdmin: message
        }, (err, application) => {
            if (err) {
                req.flash("error", "Could not update application")
            } else {
                req.flash("success", `Application Status Set to ${applicationAction}`)
            }
        })
    }
    res.redirect(req.headers.referer)
});

app.get("/admin/user", (req, res) => {
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

app.get("/admin/user/review/:userid", (req, res) => {
    User.findById(req.params.userid).populate('seat').exec((err, user) => {
        if (err || !user) {
            req.flash('error', 'User not found')
        } else {
            Hostel.find({}, (er, result) => {
                res.render('admin/review-user', {user, hostels: result})
            })
        }
    })

})

app.post("/admin/book-seat", (req, res) => {
    console.log(req.path);
    bookSeat(req.body.user, req.body.seat).then((result)=>{
        req.flash(result.status,result.message)
        res.redirect(req.headers.referer)
    });
})
app.post("/admin/cancel-seat", async (req, res) => {
    console.log(req.body);
    cancelSeat(req.body.userId, req.body.seatId).then((result)=>{
        req.flash(result.status,result.message)
        res.redirect(req.headers.referer)
    });

})
app.get("/admin/logout", (req, res) => {
    req.logout({}, () => {
        res.redirect("/admin")
    })

})