module.exports = function (app, appEvent) {

    var request = require('request');
    var syncServer = 'http://GEEKY_MENU_CLOUD_APP:8080';
    appEvent.on('save:store', function (store) {
        var url = syncServer + '/sync/store';
        var options = {
            url: url,
            method: 'POST',
            body: {store: store},
            json: true
        };

        request(options, function (error, response, body) {
            console.log(error);
            console.log(response);
        });

    });

    appEvent.on('update:store', function (store) {
        console.log("update store");
        var url = syncServer + '/sync/store';

        var options = {
            url: url,
            method: 'PUT',
            body: {store: store},
            json: true
        };

        request(options, function (error, response, body) {
            console.log(error);
            console.log(response);
        });

    });


    app.get('/sync', function (req, res) {
        res.render(__dirname + '/../views/index.ejs');
    });
};