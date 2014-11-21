var model = require('../models/schema');
var config = require('../config/auth.local.js');
var nodeFs = require('node-fs');
var multiparty = require('multiparty');
var request = require('request');
var Items = model.Items;
var Orders = model.Orders;
var Categories = model.Categories;
var Tables = model.Tables;
var Stores = model.Stores;
var Ingredients = model.Ingredients;
var ImageStorage = model.ImageStorage;

module.exports = function (app, plugins, mongoose, appEvent) {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.status(401);
        res.json({error: 'Authenticate error'});
    }

    app.get('/plugins', function (req, res) {
        res.json(plugins);
    });

    app.get('/api/dashboard/index', isLoggedIn, function (req, res) {
        Tables.count({table_status: 1}, function (err, count) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            var response = {
                busy_tables: count
            };
            console.log(response);
            res.json(response);
        });
    });

    /**
     * Store
     */
    app.get('/api/store', isLoggedIn, function (req, res) {
        var user = req.user;
        Stores.findOne()
            .populate('users')
            .exec(function (err, rows) {
                if (err)
                    return res.json(err);
                res.json(rows);
            });
    });


    app.get('/api/store/:id/:lang?', isLoggedIn, function (req, res) {
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

    app.put('/api/store/:id', isLoggedIn, function (req, res) {
        var user = req.user;
        var updateData = {};
        updateData.syncFlg = false;
        getStoreObjectFromReq(req, updateData);
        Stores.findOneAndUpdate({'_id': req.params.id}, {
                $set: updateData
            },
            function (err, obj) {
                if (err) {
                    return res.json(err);
                }
                appEvent.emit("update:store", obj);
                res.json(obj);
            });
    });

    app.post('/api/store', isLoggedIn, function (req, res) {
        var user = req.user;
        var store = new Stores();
        store.syncFlg = false;
        getStoreObjectFromReq(req, store);
        store.save(function (err) {
            if (err) {
                res.json(err);
            }
            appEvent.emit("save:store", store);
            res.json(store);
        });
    });

    app.delete('/api/store/:id', isLoggedIn, function (req, res) {
        var user = req.user;
        Stores.findByIdAndRemove(req.params.id, function (err, response) {
            if (err) {
                res.json(err);
            }
            appEvent.emit("delete:store", req.params.id);
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

    /**
     * Category
     */

    app.get('/api/category', isLoggedIn, function (req, res) {
        Categories.find({}, function (err, rows) {
            if (err)
                res.json(err);
            res.json(rows);
        });
    });

    app.get('/api/category/:id', isLoggedIn, function (req, res) {
        Categories.findOne({_id: req.params.id}, function (err, item) {
            if (err)
                res.json(err);


            console.info("get item :" + req.params.id, item);
            res.json(item);

        });
    });

    app.put('/api/category/:id', isLoggedIn, function (req, res) {
        Categories.findByIdAndUpdate(req.params.id, {
                $set: {
                    name: req.body.name
                }
            },
            {upsert: true},
            function (err, obj) {
                if (err) {
                    console.log(err);
                    res.json(err);
                }
                res.json(obj);
            });
    });


    app.post('/api/category', isLoggedIn, function (req, res) {

        console.info("post data", req.body);

        var category = new Categories();
        if (req.body.name != undefined)
            category.name = req.body.name;
        category.save(function (err) {
            if (err) {
                res.json(err);
            }
            console.info("insert item", category);
            res.json(category);
        });
    });

    app.delete('/api/category/:id', isLoggedIn, function (req, res) {
        Categories.findByIdAndRemove(req.params.id, function (err, response) {
            if (err) {
                res.json(err);
            }
            res.json({message: 'Deleted!'});
        });
    });


    /**
     * Item
     */

    app.get('/api/item', isLoggedIn, function (req, res) {
        Items.find({})
            .populate('images')
            .exec(function (err, rows) {
                if (err)
                    res.json(err);
                res.json(rows);
            });
    });

    app.get('/api/item/:id', isLoggedIn, function (req, res) {
        Items.findOne({_id: req.params.id})
            .populate('images')
            .exec(function (err, item) {
                if (err) {
                    return res.json(err);
                }
                res.json(item);

            });
    });

    app.put('/api/item/:id', isLoggedIn, function (req, res) {

        var doUpdateItem = function (updateItem) {
            Items.findByIdAndUpdate(req.params.id, {
                    $set: updateItem
                },
                {upsert: true},
                function (err, obj) {
                    if (err) {
                        console.log(err);
                        return res.json(err);
                    }
                    appEvent.emit("update:item", obj);
                    res.json(obj);
                });
        };

        var updateItem = {};
        updateItem.name = req.body.name;
        updateItem.desc = req.body.desc;
        updateItem.price = req.body.price;
        updateItem.time = req.body.time;
        updateItem.images = req.body.images;
        updateItem.categories = req.body.categories;
        updateItem.stores = req.body.stores;
        updateItem.ingredients = [];
        updateItem.syncFlg = false;

        if (req.body.ingredients != null) {
            req.body.ingredients.forEach(function (ingredient) {
                updateItem.ingredients.push(ingredient);
            });
        }

        Stores.findOne({}, function (err, store) {
            if (store) {
                updateItem.store = store._id;
                doUpdateItem(updateItem);
            }
        });

    });


    app.post('/api/item', isLoggedIn, function (req, res) {

        var doSaveItem = function (item) {
            item.syncFlg = false;
            item.save(function (err) {
                if (err) {
                    return res.json(err);
                }
                appEvent.emit("save:item", item);
                res.json(item);
            });
        };

        var user = req.user;

        var item = new Items();
        if (req.body.name != undefined)
            item.name = req.body.name;

        if (req.body.desc != undefined)
            item.desc = req.body.desc;

        if (req.body.price != undefined)
            item.price = req.body.price;

        if (req.body.time != undefined)
            item.time = req.body.time;

        if (req.body.images != undefined)
            item.images = req.body.images;

        if (req.body.categories != undefined)
            item.categories = req.body.categories;

        item.ingredients = [];
        if (req.body.ingredients != undefined) {
            req.body.ingredients.forEach(function (ingredient) {
                item.ingredients.push(ingredient);
            });
        }

        Stores.findOne({}, function (err, store) {
            item.store = store;
            doSaveItem(item);
        });
    });

    app.delete('/api/item/:id', isLoggedIn, function (req, res) {
        Items.findByIdAndRemove(req.params.id, function (err, response) {
            if (err) {
                return res.json(err);
            }
            appEvent.emit("delete:item", req.params.id);
            res.json({message: 'Deleted!'});
        });
    });

    /*
     Ingredients
     */
    app.get('/api/ingredients', isLoggedIn, function (req, res) {
        if (req.query.name != undefined && req.query.lang != undefined) {
            var conditions = {};
            conditions['text.' + req.query.lang] = new RegExp(req.query.name, 'i');
            Ingredients.find(conditions, function (err, rows) {
                if (err)
                    res.json([err]);
                res.json(rows);
            });
        } else {
            res.json([]);
        }
    });

    app.post('/api/ingredients', isLoggedIn, function (req, res) {
        var user = req.user;
        var ingredient = new Ingredients();

        if (req.body.text != null)
            ingredient.text = req.body.text;

        if (req.body.desc != null)
            ingredient.desc = req.body.desc;

        if (req.body.is_okay != null)
            ingredient.is_okay = false;

        if (req.body.user_id != null)
            ingredient.user_id = user._id;

        ingredient.save(function (err) {
            if (err) {
                res.json(err);
            }
            console.info("insert ingredient", ingredient);
            res.json(ingredient);
        });

    });

    app.put('/api/ingredients/:id', isLoggedIn, function (req, res) {
        var user = req.user;
        var ingredient = {};

        if (req.body.text != null)
            ingredient.text = req.body.text;

        if (req.body.desc != null)
            ingredient.desc = req.body.desc;

        if (req.body.is_okay != null)
            ingredient.is_okay = false;

        if (req.body.user_id != null)
            ingredient.user_id = user._id;

        Ingredients.findOneAndUpdate({'_id': req.params.id}, {
                $set: ingredient
            },
            function (err, obj) {
                if (err) {
                    res.json(err);
                } else {
                    console.log(obj, err);
                    res.json(obj);
                }
            });
    });


    /**
     * Image upload
     */
    app.post('/api/upload', function (req, res, next) {
        // create a form to begin parsing
        var user = req.user;
        var form = new multiparty.Form();
        var image;
        var image2 = new ImageStorage();
        var title = "test";
        form.on('error', next);
        form.on('close', function () {
            if (image2.filename != undefined) {
                image2.path = '/api/image/' + image2._id;
                res.json(image2);
            }
//            res.send(format('\nuploaded %s (%d Kb) as %s', image.filename, image.size / 1024 | 0, title));
        });

        // listen on field event for title
        form.on('field', function (name, val) {
            if (name !== 'title') return;
            title = val;
        });

        // listen on part event for image file
        form.on('part', function (part) {
            if (!part.filename) return;
            if (part.name !== 'file') return part.resume();
            image2.contentType = part.headers['content-type'] || 'image/png';
            image2.filename = part.filename;
            image2.user = user._id;
            image2.data = "";
            var bufs = [];
            part.on('data', function (buf) {
                bufs.push(buf);
            });

            part.on('end', function (imageBinary) {
                image2.data = Buffer.concat(bufs);
                image2.save(function (err, a) {
                    if (err) throw err;
                    console.log('saved img to mongo');
                });
            });
        });

        // parse the form
        form.parse(req);
    });


    app.get('/api/image/:id', function (req, res, next) {
        var user = req.user;
        ImageStorage.findById(req.params.id, function (err, doc) {
            if (err) return next(err);
            res.contentType(doc.contentType);
            res.write(doc.data);
            res.end();
        });
    });

    /**
     * Sync cloud
     */
    app.post('/api/sync/store/:store_id?', function (req, res, next) {
        var user = req.user;
        var store_id = req.params.store_id;
        var cloudUrl = config.cloud_api_host + '/sync/store';
        if (store_id) {
            Stores.findOne({_id: store_id})
                .populate('images')
                .exec(function (err, store) {
                    console.log('store', err, store);
                    var options = {
                        url: cloudUrl + '/' + store._id,
                        method: 'POST',
                        body: {
                            store: store
                        },
                        json: true,
                        'auth': {
                            'user': user.username,
                            'pass': user.rawpassword,
                            'sendImmediately': false
                        }
                    };
                    request(options, function (error, response, body) {
                        if (response.statusCode == 200) {
                            store.syncFlg = true;
                            store.save(function (err, store) {
                                console.log('save');
                                return res.json(body);
                            });
                        } else {
                            var statusCode = response.statusCode || 500;
                            return res.status(statusCode).json({status: false});
                        }
                    });
                });
        } else {
            return res.status(400).json({status: false, message: 'invalid'});
        }
    });

    app.post('/api/sync/item/:item_id?', function (req, res, next) {
        var user = req.user;
        var store_id = req.params.item_id;
        var cloudUrl = config.cloud_api_host + '/sync/item';
        if (store_id) {
            Items.findOne({_id: store_id})
                .populate('images images.image')
                .exec(function (err, item) {
                    console.log(item.images);
                    var options = {
                        url: cloudUrl + '/' + item._id,
                        method: 'POST',
                        body: {item: item},
                        json: true,
                        'auth': {
                            'user': user.username,
                            'pass': user.rawpassword,
                            'sendImmediately': false
                        }
                    };
                    request(options, function (error, response, body) {
                        if (response.statusCode == 200) {
                            item.syncFlg = true;
                            item.save(function (err, store) {
                                return res.json(body);
                            });
                        } else {
                            var statusCode = response.statusCode || 500;
                            return res.status(statusCode).json({status: false});
                        }
                    });
                });
        } else {
            return res.status(500).json({status: false, message: 'invalid'});
        }
    });


};
