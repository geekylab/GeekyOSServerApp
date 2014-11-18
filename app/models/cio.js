var io = require('socket.io-client');
var request = require('request');
var async = require('async');
var on = require('./on');
var bind = require('component-bind');
var Users = require('./schema').Users;
var config = require('../config/auth.local');
var EventEmitter = require('events').EventEmitter;

var cloudServerUrl = 'http://GEEKY_MENU_CLOUD_APP:8080';


function socket(app, user) {
    return new GeekySocket(app, user);
}
//EventEmitter(GeekySocket.prototype);

function GeekySocket(app, user) {
    EventEmitter.call(this);
    var self = this;
    async.waterfall([function (callback) {
        if (user) {
            if (config.cloud_api_host) {
                var options = {
                    url: config.cloud_api_host + '/auth/token',
                    method: 'GET',
                    'auth': {
                        'user': user.username,
                        'pass': user.rawpassword,
                        'sendImmediately': false
                    },
                    json: true
                };
                request(options, function (error, response, body) {
                    console.log('error', error);
                    if (response.statusCode == 200) {
                        callback(null, response.body.token);
                    } else {
                        callback('cant get token');
                        self.emit("token_error");
                    }
                });
            }
        } else {
            callback("user not found 1");
        }
    }], function (err, arg1, arg2) {
        if (err) {
            return;
        }

        self.socket = io.connect(cloudServerUrl, {reconnection: true, query: "hash=" + arg1});
        self.subEvents();
    });
}

GeekySocket.prototype.__proto__ = EventEmitter.prototype;

GeekySocket.prototype.subEvents = function () {
    if (this.subs) return;

    var socket = this.socket;
    this.subs = [
        on(socket, 'connect', bind(this, 'onconnect')),
        on(socket, 'error', bind(this, 'error')),
        on(socket, 'event', bind(this, 'onevent')),
        on(socket, 'disconnect', bind(this, 'ondisconnect')),
        on(socket, 'token_error', bind(this, 'ontoken_error')),
        on(socket, 'notice', bind(this, 'onnotice')),

    ];
};

GeekySocket.prototype.onconnect = function () {
    console.log('onconnect');
};

GeekySocket.prototype.ontoken_error = function () {
    console.log('ontoken_error');
};

GeekySocket.prototype.error = function (data) {
    console.log('onconnect_error', data);
};

GeekySocket.prototype.onevent = function (data) {
    console.log('onevent', data);
};

GeekySocket.prototype.ondisconnect = function () {
    console.log('ondisconnect');
};

GeekySocket.prototype.onnotice = function (data) {
    console.log('onnotice', data);
};


//function cio(app) {
//    var socket = app.get('socket');
//
//    async.waterfall([function (callback) {
//        Users.findOne({}, function (err, user) {
//            if (user) {
//                callback(null, user);
//                //if (config.cloud_api_host) {
//                //    var options = {
//                //        url: config.cloud_api_host + '/auth/login',
//                //        method: 'POST',
//                //        body: {username: user.username, password: user.password},
//                //        json: true
//                //    };
//                //    request(options, function (error, response, body) {
//                //        console.log('error', error);
//                //        if (response.statusCode == 200) {
//                //            console.log('OK socket pre login');
//                //            console.log(response.headers['set-cookie']);
//                //        } else {
//                //            console.log('OK socket pre login error');
//                //        }
//                //    });
//                //}
//            } else {
//                callback("user not found");
//            }
//        });
//    }, function (arg1, callback) {
//        console.log(arg1);
//        callback(null, arg1, 2);
//    }], function (err, arg1, arg2) {
//        if (err) {
//            throw err;
//        }
//
//        console.log('all done.');
//        console.log(arg1, arg2);
//    });
//
//
//    /**
//     * (socket && socket.query.hash !== hash)
//     */
//
//    //var old_hash = null;
//    //if (socket && socket.io.opts && socket.io.opts.query)
//    //    old_hash = socket.io.opts.query.slice("hash=".length);
//    //
//    //if (socket && old_hash && socket.query && socket.query.hash !== hash) {
//    //    socket.disconnect();
//    //    socket = null;
//    //}
//    //
//    //if (!socket) {
//    //    var syncServer = 'http://GEEKY_MENU_CLOUD_APP:8080';
//    //    socket = io.connect(syncServer, {'forceNew': true, reconnect: true, query: "hash=" + hash});
//    //    app.set('socket', socket);
//    //
//    //    // Add a connect listener
//    //    socket.on('connect', function () {
//    //        console.log('Connected in Cloud server!');
//    //    });
//    //    console.log('con end');
//    //}
//    //return socket;
//}


module.exports = exports = socket;