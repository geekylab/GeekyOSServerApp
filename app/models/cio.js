var io = require('socket.io-client');

module.exports = cio;

function cio(hash, app) {
    var socket = app.get('socket');
    /**
     * (socket && socket.query.hash !== hash)
     */

    var old_hash = null;
    if (socket && socket.io.opts && socket.io.opts.query)
        old_hash = socket.io.opts.query.slice("hash=".length);

    if (socket && old_hash && socket.query && socket.query.hash !== hash) {
        socket.disconnect();
        socket = null;
    }

    if (!socket) {
        var syncServer = 'http://GEEKY_MENU_CLOUD_APP:8080';
        socket = io.connect(syncServer, {'forceNew': true, reconnect: true, query: "hash=" + hash});
        app.set('socket', socket);

        // Add a connect listener
        socket.on('connect', function () {
            console.log('Connected in Cloud server!');
        });
        console.log('con end');
    }
    return socket;
}


function wait() {
    var time1 = new Date().getTime();
    var time2 = new Date().getTime();

    while ((time2 - time1) < 5000) {
        time2 = new Date().getTime();
    }
}