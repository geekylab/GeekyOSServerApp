

var io = require('socket.io-client');
var request = require('request');

var j = request.jar();

// function Collection(url) {
//   this.url = url
// }

// Collection.prototype.request = function (options, fn) {
//   var url = this.url;
//   options.url = url + (options.url || '');
//   request(options, function (err, res, body) {
//     if(res.statusCode >= 400) {
//       err = body || {message: 'an unknown error occurred'};
//       return fn(err);
//     }

//     fn(null, body);
//   });
// }

// var c = new Collection('http://localhost:2403/store');
// c.request({}, function(err, todos) {
//   console.log(todos); // [...]
// });

request({url: 'http://localhost:2403/', jar: j}, function () {
  var cookie_string = j.getCookieString('http://localhost:2403/'); // "key1=value1; key2=value2; ..."
  console.log("johna", cookie_string);
  var io = require('socket.io-client');
  var socket = io.connect('http://localhost:2403/socket.io',{query:cookie_string});

  socket.on('connect', function(){
    console.log('connect');
  });

  socket.on('connect_error', function(o){
    console.log("connect_error", o);
  });

  socket.on('disconnect', function(){
    console.log('disconnect');
  });

  socket.on('stores:chaged', function (data) {
    console.log("OK"); // emit()ed from the server
    console.log(data); // emit()ed from the server
  });
})

