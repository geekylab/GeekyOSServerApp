module.exports = function (app, appEvent) {

    //appEvent.on('save:store', function (store) {
    //    console.log("save store");
    //    console.log(store);
    //});


    app.get('/demo', function (req, res) {
        res.render(__dirname + '/../views/index.ejs');
    });
};