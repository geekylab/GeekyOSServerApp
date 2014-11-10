module.exports = function (app, appEvent) {

    appEvent.on('save:store', function (store) {
        console.log("save store");
        console.log(store);

        request.post('http://service.com/upload', {form:{key:'value'}})

    });


    app.get('/sync', function (req, res) {
        res.render(__dirname + '/../views/index.ejs');
    });
};