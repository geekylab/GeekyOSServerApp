var io = require('socket.io-client');
var request = require('request');
var async = require('async');
var on = require('./on');
var bind = require('component-bind');
var config = require('../config/auth.local');
var EventEmitter = require('events').EventEmitter;
var socketio = require('socket.io');


var Users = require('./schema').Users;
var Orders = require('./schema').Orders;
var Tables = require('./schema').Tables;
var Customer = require('./schema').Customer;
var CheckInRequest = require('./schema').CheckInRequest;


var cloudServerUrl = config.cloud_api_host;


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
        self.socketIoServer.of("/admin")
            .on('connection', function (socket) {
                console.log("connect in admin", socket.id);
                socket.join("admin");
                socket.on('disconnect', function () {
                    console.log("disconnect", this.id);
                });
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
        on(socket, 'check_table_hash', bind(this, 'on_check_table_hash')),
        on(socket, 'request_check_in', bind(this, 'request_check_in')),
        on(socket, 'neworder', bind(this, 'neworder')),
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

GeekySocket.prototype.request_check_in = function (data, fn) {
    var self = this;
    async.waterfall([
        function(callback) { //find or create customer
            Customer.findById(data.customer.id)
                .exec(function (err, customer) {

                    if (!customer) {
                        //create new customer
                        customer = new Customer();
                        customer._id = data.customer.id;
                    }

                    if (data.customer.name && (data.customer.name.family_name || data.customer.name.family_name))
                                    customer.name = data.customer.name;

                    if (data.customer.image_url)
                        customer.image_url = data.customer.image_url;

                    //save this!
                    customer.save(function (err, customer) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, customer);
                        }
                    });
            });
        }, function (customer, callback) { //search table
                Tables.findById(data.table_id)
                        .exec(function (err, table) {
                            if (!table) {
                                callback("table is not found");
                            } else {
                                if (table.table_status == 1) {
                                    console.log("table is busy")
                                    callback("table is busy");
                                } else {
                                    callback(null, customer, table);
                                }
                            }
                        });

        }, function (customer, table, callback) { //save new request
                console.log("func3");
                ;
                CheckInRequest
                .findById(data.checkInRequest._id)
                .exec(function(err, checkInRequest) {
                    if (err) {
                        console.log("err findOne");
                        return callback(err)
                    }


                    if (!checkInRequest) {
                        checkInRequest = new CheckInRequest();
                        checkInRequest._id           = data.checkInRequest._id;
                        checkInRequest.table         = data.checkInRequest.table;
                        checkInRequest.customer      = data.checkInRequest.customer;
                    }

                    checkInRequest.request_count = data.checkInRequest.request_count;
                    checkInRequest.status = 1;
                    checkInRequest.request_token = data.checkInRequest.request_token;

                    checkInRequest.save(function (err, obj) {
                        if (err) {
                            console.log("err save");
                            return callback(err);
                        }
                        CheckInRequest.findById(obj._id)
                        .populate("table")
                        .populate("customer")
                        .exec(function(err, obj){
                            if (err)
                                return callback(err);
                            callback(null, customer, table, obj);
                        });
                    });
                });
        }
        ],function(err, customer, table, checkInRequest) {

            if (err) {
                console.log("request_check_in : err", err);
                if (fn) {
                    return fn({status:false, err: err});
                }
                return;
            } else {
                self.socketIoServer.of('admin').emit('request_check_in', checkInRequest);
                if (fn)
                    fn({status: true, checkInRequest: checkInRequest});

                }
        }
    );


};

GeekySocket.prototype.on_check_table_hash = function (data, fn) {
    if (data.table_id) {
        var self = this;
        async.waterfall([
                function (callback) {
                    Tables.findById(data.table_id)
                        .exec(function (err, table) {
                            if (!table) {
                                console.log("table is not found");
                                callback("table is not found");
                            } else {
                                if (table.table_status == 0) {
                                    table.table_status = 1;
                                    table.save(function (err, table) {
                                        if (err)
                                            callback(err)
                                        else
                                            callback(null, table);
                                    });
                                } else {
                                    callback(null, table);
                                }
                            }
                        });

                },
                function (table, callback) {
                    if (table) {
                        Orders.findOne({table: table._id})
                            .populate({
                                path: 'tables'
                            }).exec(function (err, order) {
                                if (err) {
                                    callback(err);
                                } else {
                                    if (!order) {
                                        var newOrder = new Orders();
                                        newOrder.order_number = 1234;
                                        newOrder.order_token = newOrder.generateOrderTokenHash();
                                        newOrder.status = 2;
                                        newOrder.table = table._id;
                                        newOrder.save(function (err, obj) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                Orders.findById(obj._id)
                                                    .populate("table", "table_number")
                                                    .exec(function (err, obj) {
                                                        if (err)
                                                            callback(err)
                                                        else
                                                            callback(null, {is_new: true, order: obj}, table);
                                                    });
                                            }
                                        });
                                    } else {
                                        order.request_count++;
                                        order.save(function (err, order) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                callback(null, {is_new: false, order: order}, table);
                                            }
                                        });

                                    }
                                }
                            });
                    } else {
                        callback("parameter errors");
                    }
                },
                function (orderObj, table, callback) { //find customer and save
                    if (orderObj && table && data.customer) {
                        Customer.findById(data.customer.id)
                            .exec(function (err, customer) {
                                if (!customer) {
                                    //create new customer
                                    customer = new Customer();
                                    customer._id = data.customer.id;
                                }

                                if (data.customer.name && (data.customer.name.family_name || data.customer.name.family_name))
                                    customer.name = data.customer.name;

                                if (data.customer.image_url)
                                    customer.image_url = data.customer.image_url;

                                //save this!
                                customer.save(function (err, customer) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null, orderObj, table, customer);
                                    }
                                });

                            });
                    } else {
                        callback("parameter errors");
                    }
                }, function (orderObj, table, customer, callback) { //link customer to order.

                    if (orderObj && orderObj.order && customer) {
                        var order = orderObj.order;
                        Orders.findByIdAndUpdate(order._id, {$addToSet: {customers: customer._id}}, function (err, order) {
                            if (err) {
                                //fuck error!?
                                //TODO: What do I do now?
                                callback(err);

                            } else {
                                orderObj.order = order;
                                callback(null, orderObj, table, customer);
                            }
                        });
                    } else {
                        callback("parameter errors");
                    }
                }, function (orderObj, table, customer, callback) {//link table to order.
                    if (orderObj.is_new && table) {
                        Tables.findByIdAndUpdate(table._id, {$addToSet: {orders: orderObj.order._id}},
                            function (err, table) {
                                if (err) {
                                    //meu deus quantos erros!
                                    callback(err);
                                } else {
                                    callback(null, orderObj, table, customer)
                                }
                            });
                    } else {
                        callback(null, orderObj, table, customer)
                    }
                }
            ],
            function (err, orderObj, table) {
                if (err) {
                    console.log("error !!!!", err);
                }

                if (fn)
                    fn(orderObj);

                if (self.socketIoServer) {

                    if (table) {
                        data.table_number = table.table_number;
                    }

                    if (orderObj) {
                        data.orderObj = orderObj;
                    }

                    console.log("emit : check_table_hash");
                    self.socketIoServer.of('admin').emit('check_table_hash', data);
                }
            });
    } else {
        if (fn)
            fn("johna");
    }
};

GeekySocket.prototype.neworder = function (data, fn) {
    console.log("neworder");
    this.socketIoServer.of('admin').emit('neworder', data);

};


module.exports = exports = socket;