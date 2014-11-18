// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');

// load up the user model
var User = require('../models/schema').Users;
//var Customer = require('../models/mongo').Customer;

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, username, password, done) {
            // asynchronous
            var api_url = {
                host: '127.0.0.1',
                port: '8080',
                protocol: 'http://',
                getUrl: function (path) {
                    return this.protocol + this.host + ':' + this.port + path;
                },
                getUrlWithDomain: function (path) {
                    return this.protocol + 'GEEKY_MENU_CLOUD_APP' + ':' + this.port + path;
                }
            };
            var CLOUD_URL = 'GEEKY_MENU_CLOUD_APP:8080';
            process.nextTick(function () {
                //check cloud is available
                var authenticadCloud = false;
                require('dns').resolve(api_url.host, function (err) {
                    if (err) {
                        checkLocalUser(false);
                    } else {
                        var url = api_url.getUrlWithDomain('/auth/login');
                        var options = {
                            url: url,
                            method: 'POST',
                            body: {username: username, password: password},
                            json: true
                        };
                        request(options, function (error, response, body) {
                            console.log('clound login response');
                            console.log(body.status);
                            if (body.status) {
                                checkLocalUser(true);
                            } else {
                                checkLocalUser(false);
                            }
                        });
                    }
                });

                function checkLocalUser(authenticadCloud) {
                    User.findOne({'username': username}, function (err, user) {
                        if (err) {
                            console.log('err', err);
                            return done(err);
                        }

                        if (!user) {
                            if (!authenticadCloud) {
                                return done(null, false, req.flash('loginMessage', 'No user found.'));
                            } else {
                                var newUser = new User();
                                newUser.username = username;
                                newUser.password = newUser.generateHash(password);
                                newUser.rawpassword = password;
                                newUser.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                });
                            }
                        } else {
                            if (!user.validPassword(password)) {
                                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                                // all is well, return user
                            } else {
                                return done(null, user);
                            }
                        }
                    });
                }

            });
        }));
};

