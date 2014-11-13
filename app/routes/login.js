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

    app.get('/login/:hash', passport.authenticate('local-hash', {
            failureRedirect: 'http://menu.geekylab.net:8080/app/login',
            failureFlash: true
        }),
        function (req, res) {
            res.redirect('http://menu.geekylab.net:8080/app/index');
        });


};