module.exports = function (app) {
    app.get('/demo', function (req, res) {
        res.render(__dirname + '/../views/index.ejs');
    });
};