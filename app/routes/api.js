module.exports = function (app, plugins) {
    app.get('/plugins', function (req, res) {
        res.json(plugins);
    });
};
