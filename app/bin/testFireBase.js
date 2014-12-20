#!/usr/bin/env node
var express = require('express')
var Firebase = require('firebase')
var app = express()

app.set('port', process.env.LISTEN_PORT || 80);

var myFirebaseRef = new Firebase("https://torid-fire-9018.firebaseio.com/");

myFirebaseRef.child("chat").on("value", function(snapshot) {
	console.log(snapshot.val());
});

app.get('/', function (req, res) {
		var chatRef = myFirebaseRef.child("chat");
    var row = chatRef.set({
    	"jskfjlsdjflsd":{
				author: "Nodejs",
				message: "Hellow"
			}
    });
    res.json(row);
});

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})