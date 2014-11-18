module.exports = function (app, allPlugins, mongoose, appEvent, passport) {
    var VERSION = '0.0.1';

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.status(401);
        res.json({error: 'Authenticate error'});
    }

    app.get('/version', function (req, res) {
        return res.json({
            version: VERSION
        });
    });

    app.get('/me', isLoggedIn, function (req, res) {
        return res.json(
            req.user
        )
    });

    app.post('/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            console.log('call vm login', err, user, info);
            if (err) {
                return next(err);
            }

            if (!user) {
                console.log('user not found');
                return res.status(401).json({status: false, message: 'user is not found'});
            }

            console.log('user OK');
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.json({status: true, message: 'OK'});
            });

        })(req, res, next);
    });


    //app.get('/login/:hash', passport.authenticate('local-hash', {
    //        failureRedirect: 'http://menu.geekylab.net:8080/app/login',
    //        failureFlash: true
    //    }),
    //    function (req, res) {
    //        var user = req.user;
    //        appEvent.emit("userLogin", user.hash);
    //        res.redirect('http://menu.geekylab.net:8080/app/index');
    //    });


};