// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
//var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var HashStrategy = require('passport-hash').Strategy;
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var FacebookTokenStrategy = require('passport-facebook-token').Strategy;

var configAuth = require('./auth.local'); // use this one for testing

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

    passport.use('local-hash', new HashStrategy(
        function (hash, done) {
            // asynchronous
            process.nextTick(function () {
                User.findOne({}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        var newUser = new User();
                        newUser.hash = hash;
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            console.log('local-hash');
                            return done(null, newUser);
                        });
                    } else {
                        if (user.hash === hash) {
                            return done(null, user);
                        }
                        return done(null, false, "no user");
                    }
                });
            });
        }
    ));

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
            process.nextTick(function () {
                console.log('passport : local-login');
                User.findOne({'local.username': username}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    // all is well, return user
                    else
                        return done(null, user);
                });
            });
        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            // asynchronous
            process.nextTick(function () {
                console.log('username', username);
                User.findOne({'local.username': username}, function (err, existingUser) {

                    if (err)
                        return done(err);

                    if (existingUser)
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                    console.log(req.user);
                    if (req.user) {
                        var user = req.user;
                        user.local.username = username;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }

                    // We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        var newUser = new User();
                        newUser.local.username = username;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

//    // =========================================================================
//    // TWITTER =================================================================
//    // =========================================================================
//    passport.use(new TwitterStrategy({
//            consumerKey: configAuth.twitterAuth.consumerKey,
//            consumerSecret: configAuth.twitterAuth.consumerSecret,
//            callbackURL: configAuth.twitterAuth.callbackURL
//        },
//        function (req, token, tokenSecret, profile, done) {
//            // asynchronous
//            process.nextTick(function () {
//                // check if the user is already logged in
//                console.log(profile.id);
//                if (!req.user) {
//                    User.findOne({'twitter.id': profile.id}, function (err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            // if there is a user id already but no token (user was linked at one point and then removed)
//                            if (!user.twitter.token) {
//                                user.twitter.token = token;
//                                user.twitter.username = profile.username;
//                                user.twitter.displayName = profile.displayName;
//                                user.save(function (err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//                            return done(null, user); // user found, return that user
//                        } else {
//                            // if there is no user, create them
//                            var newUser = new User();
//                            newUser.twitter.id = profile.id;
//                            newUser.twitter.token = token;
//                            newUser.twitter.username = profile.username;
//                            newUser.twitter.displayName = profile.displayName;
//                            newUser.save(function (err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    // user already exists and is logged in, we have to link accounts
//                    var user = req.user; // pull the user out of the session
//                    user.twitter.id = profile.id;
//                    user.twitter.token = token;
//                    user.twitter.username = profile.username;
//                    user.twitter.displayName = profile.displayName;
//                    user.save(function (err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//        }));
//
//
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function () {
                // check if the user is already logged in
                if (!req.user) {
                    User.findOne({'facebook.id': profile.id}, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = profile.emails[0].value;
                                user.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();
                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = profile.emails[0].value;
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session
                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = profile.emails[0].value;
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }));
//
//
//    // =========================================================================
//    // GOOGLE ==================================================================
//    // =========================================================================
//    passport.use(new GoogleStrategy({
//            clientID: configAuth.googleAuth.clientID,
//            clientSecret: configAuth.googleAuth.clientSecret,
//            callbackURL: configAuth.googleAuth.callbackURL,
//            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//        },
//        function (req, token, refreshToken, profile, done) {
//            // asynchronous
//            process.nextTick(function () {
//                // check if the user is already logged in
//                if (!req.user) {
//                    User.findOne({'google.id': profile.id}, function (err, user) {
//                        if (err)
//                            return done(err);
//                        if (user) {
//                            // if there is a user id already but no token (user was linked at one point and then removed)
//                            if (!user.google.token) {
//                                user.google.token = token;
//                                user.google.name = profile.displayName;
//                                user.google.email = profile.emails[0].value; // pull the first email
//                                user.save(function (err) {
//                                    if (err)
//                                        throw err;
//                                    return done(null, user);
//                                });
//                            }
//                            return done(null, user);
//                        } else {
//                            var newUser = new User();
//                            newUser.google.id = profile.id;
//                            newUser.google.token = token;
//                            newUser.google.name = profile.displayName;
//                            newUser.google.email = profile.emails[0].value; // pull the first email
//                            newUser.save(function (err) {
//                                if (err)
//                                    throw err;
//                                return done(null, newUser);
//                            });
//                        }
//                    });
//                } else {
//                    // user already exists and is logged in, we have to link accounts
//                    var user = req.user; // pull the user out of the session
//                    user.google.id = profile.id;
//                    user.google.token = token;
//                    user.google.name = profile.displayName;
//                    user.google.email = profile.emails[0].value; // pull the first email
//                    user.save(function (err) {
//                        if (err)
//                            throw err;
//                        return done(null, user);
//                    });
//                }
//            });
//        }));
//
//    // =========================================================================
//    // Passport-Facebook-Token =================================================
//    // =========================================================================
//    passport.use(new FacebookTokenStrategy({
//            clientID: configAuth.facebookAuth.clientID,
//            clientSecret: configAuth.facebookAuth.clientSecret
//        },
//        function (accessToken, refreshToken, profile, done) {
//            Customer.findOne({fbid: profile.id}, function (err, user) {
//                if (err)
//                    return done(err);
//
//                if (user) {
//                    user.accessToken = null;
//                    return done(null, user);
//                } else {
//                    console.log(profile._raw);
//                    var newUser = new Customer();
//                    newUser.fbid = profile.id;
//                    newUser.email = profile.emails[0].value;
//                    newUser.profileUrl = profile.profileUrl;
//                    newUser.first_name = profile.name.givenName;
//                    newUser.gender = profile.gender;
//                    newUser.last_name = profile.name.familyName;
////                    newUser.locale = profile._raw.locale;
//                    newUser.name = profile.displayName;
//                    newUser.accessToken = accessToken;
////                    newUser.timezone = profile._raw.timezone;
////                    newUser.updated_time = profile._raw.updated_time;
//                    newUser.save(function (err) {
//                        if (err)
//                            throw err;
//
//                        newUser.accessToken = null;
//                        return done(null, newUser);
//                    });
//                }
//
//            });
//            //Customer.findOrCreate({id: profile.id}, function (err, user) {
//            //    return done(err, user);
//            //});
//        }
//    ));
};

