var express = require('express');
//var mongoose = require('mongoose');
//var api = require('./routes/api');
var app = express();
var fs = require('fs');

app.set('view engine', 'ejs');

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
                    require(packageDir + config.routes)(app);
                } else {
                    console.log(packageDir + config.routes + '.js', 'not found');
                }
            }
        }
        allPlugins.push(config);
    }
});

require('./routes/api')(app, allPlugins);


app.listen(3000);