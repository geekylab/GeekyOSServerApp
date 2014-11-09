var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var appEvent = new EventEmitter();

app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));

//readPlugin
var allPlugins = [];
var pluginDir = __dirname + '/plugins';
fs.readdir(pluginDir, function (err, files) {
    console.log(files);
    if (fs.existsSync(pluginDir + '/' + files + '/package.json')) {
        var packageDir = pluginDir + '/' + files;
        var config = require(packageDir + '/package.json');
        if (config.routes != undefined) {
            if (config.enabled) {
                if (fs.existsSync(packageDir + config.routes + '.js')) {
                    require(packageDir + config.routes)(app, appEvent);
                } else {
                    console.log(packageDir + config.routes + '.js', 'not found');
                }
            }
        }
        allPlugins.push(config);
    }
});

require('./routes/api')(app, allPlugins, mongoose, appEvent);


app.listen(3000);