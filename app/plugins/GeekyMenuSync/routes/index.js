module.exports = function (app, appEvent, mongoose, isLoggedIn) {

    var schema = require('../models/schema')(mongoose);
    var globalSchema = require('../../../models/schema');

    var schemasObjs = {
        'store': globalSchema.Stores,
        'item': globalSchema.Items
    };


    var SyncSchema = schema.SyncSchema;
    var request = require('request');
    var syncServer = 'http://GEEKY_MENU_CLOUD_APP:8080';

    appEvent.on('save:store', function (store) {
        //var url = syncServer + '/sync/store';
        //var options = {
        //    url: url,
        //    method: 'POST',
        //    body: {store: store},
        //    json: true
        //};
        //
        //request(options, function (error, response, body) {
        //    console.log(error);
        //    console.log(response);
        //});
        var syncName = 'save:store';
        updateSyncData(syncName, 'save', store._id);
    });

    appEvent.on('update:store', function (store) {
        var syncName = 'update:store';
        updateSyncData(syncName, 'update', store._id);
    });

    appEvent.on('delete:store', function (storeId) {
        var syncName = 'delete:store';
        updateSyncData(syncName, 'delete', storeId);
    });

    //item
    appEvent.on('save:item', function (store) {
        var syncName = 'save:item';
        updateSyncData(syncName, 'save', store._id);
    });

    appEvent.on('update:item', function (store) {
        var syncName = 'update:item';
        updateSyncData(syncName, 'update', store._id);
    });

    appEvent.on('delete:item', function (storeId) {
        var syncName = 'delete:item';
        updateSyncData(syncName, 'delete', storeId);
    });


    function updateSyncData(syncName, syncType, dataId) {
        SyncSchema.findOne({'name': syncName}, function (err, row) {
            if (err) {
                return console.log('err', err);
            }

            if (row) {
                row.syncFlg = false;
                var idx = row.dataIds.indexOf(dataId);
                if (idx === -1) {
                    row.dataIds.push(dataId);
                }
                row.save(function (err) {
                    if (err)
                        throw err;
                    console.log('save sync');
                });


            } else {
                var Sync = new SyncSchema();
                Sync.name = syncName;
                Sync.syncFlg = false;
                Sync.syncType = syncType;
                Sync.dataIds = [];
                Sync.dataIds.push(dataId);
                Sync.save(function (err) {
                    if (err)
                        throw err;

                    console.log("success", Sync);
                });
            }
        });
    };


    app.get('/sync', function (req, res) {
        //todo: do sync to cloud
        var user = req.user;
        SyncSchema.find({syncFlg: false}).exec(function (err, rows) {
            var postDatas = {
                userHash: user.hash,
                datas: []
            };
            var line = 0;
            rows.forEach(function (row) {
                var names = row.name.split(':');
                if (names.length == 2) {
                    var postData = {};
                    postData.name = names[1];
                    postData.type = names[0];
                    postData.datas = [];
                    var lineIds = 0;
                    row.dataIds.forEach(function (rowId) {
                        getCurrentRow(names[1], rowId, function (currentRow) {
                            if (names[0] == 'delete') {
                                postData.datas.push(rowId);
                            } else {
                                postData.datas.push(currentRow);
                            }
                            postDatas.datas.push(postData);
                            lineIds++;

                            if (lineIds === row.dataIds.length) {
                                line++;
                            }

                            if (line === rows.length) {
                                finalPostData(postDatas, req, res);
                            }
                        });
                    });
                }
            });
        });
    });

    function getCurrentRow(name, id, cb) {
        if (schemasObjs[name] != undefined) {
            var schemaObj = schemasObjs[name];
            schemaObj.findOne({_id: id}, function (err, row) {
                if (!err) {
                    cb(row);
                }
            });
        }
    }

    function finalPostData(postData, req, res) {

        res.json({status: true, datas: postData});

        var url = syncServer + '/sync/all';
        var options = {
            url: url,
            method: 'POST',
            body: {datas: postData},
            json: true
        };

        request(options, function (error, response, body) {
            console.log(error);
            console.log(response);
        });


        console.log(postData);
    }

    //app.get('/sync', function (req, res) {
    //    res.render(__dirname + '/../views/index.ejs');
    //});

};