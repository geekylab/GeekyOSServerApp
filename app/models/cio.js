var io = require('socket.io-client');
var request = require('request');
var async = require('async');
var on = require('./on');
var bind = require('component-bind');
var Users = require('./schema').Users;
var config = require('../config/auth.local');
var EventEmitter = require('events').EventEmitter;
var socketio = require('socket.io');


var cloudServerUrl = 'http://GEEKY_MENU_CLOUD_APP:8080';


function socket(app, user) {
    return new GeekySocket(app);
}
//EventEmitter(GeekySocket.prototype);

function GeekySocket(app) {
    //EventEmitter.call(this);
    this.socketIoServer = null;
    var self = this;

    app.on('listen', function (server) {
        self.socketIoServer = socketio.listen(server);
        self.socketIoServer.on('connection', function () {
            console.log('connect on vm socket');
        });
    });


    async.waterfall([
        function (callback) {
            Users.findOne({}, function (err, user) {
                if (user) {
                    callback(null, user);
                } else {
                    callback('not user');
                }
            });
        },
        function (user, callback) {
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

//GeekySocket.prototype.__proto__ = EventEmitter.prototype;

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


module.exports = exports = socket;