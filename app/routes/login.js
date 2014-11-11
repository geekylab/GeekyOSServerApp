module.exports = function (app, allPlugins, mongoose, appEvent, passport) {
    var VERSION = '0.0.1';
    app.get('/version', function (req, res) {
        return res.json({
            version: VERSION
        });
    });

// process the login form
//    app.post('/login', passport.authenticate('local-login', {failureFlash: true}),
//        function (req, res) {
//            console.log(req);
//            res.json({status: false});
//        });

    app.post('/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }

            if (!user) {
                return res.status(401).json({stauts: false, messages: req.flash('loginMessage')});
            }
            return res.json({success: true, messages: 'authentication succeeded'});
        })(req, res, next);
    });

    app.post('/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            console.log('signup');
            if (err) {
                return next(err); // will generate a 500 error
            }

            console.log(user, err);

            if (!user) {
                return res.status(500).json({stauts: false, messages: "maybe error"});
            }
            return res.json({success: true, messages: 'authentication succeeded'});
        })(req, res, next);
    });

};