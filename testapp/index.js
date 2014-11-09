var express = require('express');
var app = express();


app.get('/', function (req, res) {
    res.send('Test ok test!');
});

app.listen(3001);