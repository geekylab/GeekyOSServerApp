var model = require('../models/schema');
var Items = model.Items;
var Orders = model.Orders;
var Categories = model.Categories;
var Tables = model.Tables;
var Stores = model.Stores;
var Ingredients = model.Ingredients;

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
        getStoreObjectFromReq(req, updateData);
        Stores.findOneAndUpdate({'_id': req.params.id}, {
                $set: updateData
            },
            function (err, obj) {
                if (err) {
                    res.json(err);
                }
                appEvent.emit("update:store", obj);
                res.json(obj);
            });
    });

    app.post('/api/store', isLoggedIn, function (req, res) {
        var user = req.user;
        var store = new Stores();
//        store.users.push(user);
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
        Items.find({}, function (err, rows) {
            if (err)
                res.json(err);
            res.json(rows);
        });
    });

    app.get('/api/item/:id', isLoggedIn, function (req, res) {
        Items.findOne({_id: req.params.id})
            .populate("ingredients")
            .exec(function (err, item) {
                if (err) {
                    return res.json(err);
                }
                res.json(item);

            });
    });

    app.put('/api/item/:id', isLoggedIn, function (req, res) {

        var updateItem = {};
        updateItem.name = req.body.name;
        updateItem.desc = req.body.desc;
        updateItem.price = req.body.price;
        updateItem.time = req.body.time;
        updateItem.images = req.body.images;
        updateItem.categories = req.body.categories;
        updateItem.stores = req.body.stores;
        updateItem.ingredients = [];

        if (req.body.ingredients != null) {
            req.body.ingredients.forEach(function (ingredient) {
                updateItem.ingredients.push(ingredient._id);
            });
        }


        Items.findByIdAndUpdate(req.params.id, {
                $set: updateItem
                //{
                //    name: req.body.name,
                //    desc: req.body.desc,
                //    price: req.body.price,
                //    time: req.body.time,
                //    images: req.body.images,
                //    categories: req.body.categories,
                //    ingredients: req.body.ingredients
                //}
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
    });


    app.post('/api/item', isLoggedIn, function (req, res) {

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

        if (req.body.stores != undefined)
            item.stores = req.body.stores;

        item.ingredients = [];
        if (req.body.ingredients != undefined) {
            req.body.ingredients.forEach(function (ingredient) {
                item.ingredients.push(ingredient._id);
            });
        }

        item.save(function (err) {
            if (err) {
                return res.json(err);
            }
            appEvent.emit("save:item", item);
            res.json(item);
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


};
