var model = require('../models/schema');
var Items = model.Items;
var Orders = model.Orders;
var Categories = model.Categories;
var Tables = model.Tables;
var Stores = model.Stores;
var Ingredients = model.Ingredients;

module.exports = function (app, plugins, mongoose) {
    app.get('/plugins', function (req, res) {
        res.json(plugins);
    });


    /**
     * Store
     */
    app.get('/api/store', function (req, res) {
//        var user = req.user;
        Stores.find()
            .populate('users')
            .exec(function (err, rows) {
                if (err)
                    return res.json(err);
                res.json(rows);
            });
    });


    app.get('/api/store/:id/:lang?', function (req, res) {
        var user = req.user;
        var lang = req.params.lang;

        if (lang == undefined) {
            lang = 'en';
        }


        Stores.findOne({_id: req.params.id})
            .populate('users')
            .exec(function (err, store) {
                //if (err) return handleError(err);
                //console.log(person);
                if (err)
                    return res.json(err);

                res.json(store);

            });
    });

    app.put('/api/store/:id', function (req, res) {
        var user = req.user;
        var updateData = {};
        getStoreObjectFromReq(req, updateData);
        Stores.findOneAndUpdate({'_id': req.params.id}, {
                $set: updateData
            },
            function (err, obj) {
                if (err) {
                    res.json(err);
                }
                res.json(obj);
            });
    });

    app.post('/api/store', function (req, res) {
        var user = req.user;
        var store = new Stores();
//        store.users.push(user);
        getStoreObjectFromReq(req, store);
        store.save(function (err) {
            if (err) {
                res.json(err);
            }
            res.json(store);
        });
    });

    app.delete('/api/store/:id', function (req, res) {
        var user = req.user;
        Stores.findByIdAndRemove(req.params.id, function (err, response) {
            if (err) {
                res.json(err);
            }
            res.json({message: 'Deleted!'});
        });
    });

    function getStoreObjectFromReq(req, updateData) {
        if (req.body.store_name != undefined)
            updateData.store_name = req.body.store_name;

        if (req.body.desc != undefined)
            updateData.desc = req.body.desc;

        if (req.body.tel != undefined)
            updateData.tel = req.body.tel;

        if (req.body.country != undefined)
            updateData.country = req.body.country;

        if (req.body.zip_code != undefined)
            updateData.zip_code = req.body.zip_code;

        if (req.body.state != undefined)
            updateData.state = req.body.state;

        if (req.body.city != undefined)
            updateData.city = req.body.city;

        if (req.body.address != undefined)
            updateData.address = req.body.address;

        if (req.body.address2 != undefined)
            updateData.address2 = req.body.address2;

        if (req.body.location != undefined)
            updateData.location = req.body.location;

        if (req.body.seat_count != undefined)
            updateData.seat_count = req.body.seat_count;

        if (req.body.images != undefined)
            updateData.images = req.body.images;

        if (req.body.opening_hour != undefined) {
            updateData.opening_hour = {};
            if (req.body.opening_hour.start != undefined)
                updateData.opening_hour.start = req.body.opening_hour.start;

            if (req.body.opening_hour.end != undefined)
                updateData.opening_hour.end = req.body.opening_hour.end;

            if (req.body.opening_hour.last_order != undefined)
                updateData.opening_hour.last_order = req.body.opening_hour.last_order;
        }

        if (req.body.seat_type != undefined)
            updateData.seat_type = req.body.seat_type;

        if (req.body.opts != undefined)
            updateData.opts = req.body.opts;

        if (req.body.tables != undefined)
            updateData.tables = req.body.tables;

        return updateData;
    }



};
