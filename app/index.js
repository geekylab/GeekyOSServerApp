var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var appEvent = new EventEmitter();
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var authConfig = require('./config/auth.local.js');
require('./config/passport')(passport);

app.prototype.__proto__ = EventEmitter.prototype;
EventEmitter.call(app);

//app settings
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));

var myMongoStore = new MongoStore({
    db: mongoose.connection.db
});

// required for passport
app.use(expressSession({
        secret: authConfig.secret_key,
        resave: true,
        saveUninitialized: true,
//        cookie: {},
        store: myMongoStore
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//readPlugin
var allPlugins = [];
var pluginDir = __dirname + '/plugins';
fs.readdir(pluginDir, function (err, files) {
    files.forEach(function (file) {
        if (fs.existsSync(pluginDir + '/' + file + '/package.json')) {
            var packageDir = pluginDir + '/' + file;
            var config = require(packageDir + '/package.json');
            if (config.routes != undefined) {
                if (config.enabled) {
                    if (fs.existsSync(packageDir + config.routes + '.js')) {
                        require(packageDir + config.routes)(app, appEvent, mongoose, isLoggedIn);
                    } else {
                        console.log(packageDir + config.routes + '.js', 'not found');
                    }
                }
            }
            allPlugins.push(config);
        } else {
            console.log("Not found " + pluginDir + '/' + file + '/package.json');
        }
    });
});

require('./routes/login')(app, allPlugins, mongoose, appEvent, passport);
require('./routes/api')(app, allPlugins, mongoose, appEvent);


var geekySocket = require('./models/cio')(app);

////Connect to server
//var Users = require('./models/schema').Users;
//Users.findOne({}, function (err, user) {
//    if (user) {
//
//    }
//});

appEvent.on('userLogin', function (hash) {
    require('./models/cio')(hash, app);
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(401);
    res.json({error: 'Authenticate error'});
}

module.exports = app;