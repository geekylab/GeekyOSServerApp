module.exports = function (app, appEvent, mongoose) {

    var schema = require('../models/schema')(mongoose);
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
        res.render(__dirname + '/../views/index.ejs');
    });
};