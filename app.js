const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const MongoDBStore = require('connect-mongodb-session')(session);
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();


app.use(bodyParser.urlencoded({extended: true}));

const sessionStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017/hostelDB',
    collection: 'session'
});
app.use(session({
    secret: 'test gg',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));
app.use(passport.session());




app.listen(80, () => {
    console.log("Server Started");
});