var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var db = mongoose.connect('mongodb://GEEKY_MONGO/geekymenu');

// 定義フェーズ
var OrderItems = new mongoose.Schema({
    items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Items'
    },
    name: {
        type: String
    },
    price: {
        type: String
    },
    qnt: {
        type: Number
    },
    status: {
        type: Number
    }
});

var Orders = new mongoose.Schema({
    order_token: {
        type: String,
        required: true,
        index: true
    },
    table_token: {
        type: Number
    },
    order_number: {
        type: Number,
        required: true,
        index: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tables'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItems'
    }],
    status: {
        type: Number
    },
    request_count: {
        type: Number,
        default: 1
    },
    created: {
        type: Date,
        default: Date.now
    }
});

Orders.methods.generateOrderTokenHash = function () {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
};

var CheckInRequest = new mongoose.Schema({
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tables'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    status: {
        type: Number
    },
    request_token: {
        type: String,
        index: true
    },
    request_count: {
        type: Number,
        default: 1
    },
    created: {
        type: Date,
        default: Date.now
    }
});


var Categories = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    syncFlg: Boolean,
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var Image = new mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageStorage'
    },
    filename: {
        type: mongoose.Schema.Types.Mixed
    },
    sort_order: {
        type: Number,
        default: 0
    },
    image_type: {
        type: Number,
        default: 0
    }
});


var ImageStorage = new mongoose.Schema({
    data: Buffer,
    contentType: String,
    filename: String,
    syncFlg: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
});


var Ingredients = mongoose.Schema({
    text: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    image: {
        type: String
    },
    desc: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    is_okay: {
        type: Boolean,
        index: true
    },
    user_id: {
        type: String,
        index: true
    }
});

var Items = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    desc: {
        type: mongoose.Schema.Types.Mixed,
        index: true,
        required: true
    },
    price: {
        type: Number,
        default: 0,
        index: true
    },
    'time': {
        type: Number,
        default: 0
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    'ingredients': [Ingredients],
    'images': [Image],
    'categories': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    syncFlg: Boolean
});

var Tables = new mongoose.Schema({
    'table_number': {
        type: String,
        required: true,
        index: true
    },
    'table_status': {
        type: Number,
        default: 0
    },
    'limited_number': {
        type: Number,
        default: 0
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders'
    }],
    'created': {
        type: Date,
        default: Date.now
    }
});

var Store = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    'cloud_id': {
        type: String,
        index: true
    },
    'store_name': {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    'desc': {
        type: mongoose.Schema.Types.Mixed
    },
    'logo': {
        type: String
    },
    'tel': {
        type: String
    },
    'country': {
        type: String
    },
    'zip_code': {
        type: String
    },
    'state': {
        type: String
    },
    'city': {
        type: String
    },
    'address': {
        type: String
    },
    'address2': {
        type: String
    },
    location: [Number, Number],
    seat_count: {
        type: Number
    },
    'opening_hour': {
        start: {
            type: String
        },
        end: {
            type: String
        },
        last_order: {
            type: String
        }
    },
    'seat_type': [{
        type: String
    }],
    'images': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageStorage'
    }],
    'opts': [{
        type: String,
        index: true
    }],
    'tables': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tables'
    }],
    'created': {
        type: Date,
        default: Date.now
    },
    syncFlg: Boolean
});

Store.index({location: "2dsphere"});

var Users = mongoose.Schema({
    hash: String,
    full_name: String,
    username: String,
    password: String,
    rawpassword: String
    //local: {
    //    username: String,
    //    password: String
    //},
    //facebook: {
    //    id: String,
    //    token: String,
    //    email: String,
    //    name: String
    //},
    //twitter: {
    //    id: String,
    //    token: String,
    //    displayName: String,
    //    username: String
    //},
    //google: {
    //    id: String,
    //    token: String,
    //    email: String,
    //    name: String
    //}
});

var Customer = mongoose.Schema({
    name: {
        family_name: String,
        given_name: String
    },
    image_url: String

});


// methods ======================
// generating a hash
Users.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
Users.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

exports.Orders = db.model('Orders', Orders);
exports.OrderItems = db.model('OrderItems', OrderItems);
exports.ImageStorage = db.model('ImageStorage', ImageStorage);
exports.Items = db.model('Items', Items);
exports.Categories = db.model('Categories', Categories);
exports.Tables = db.model('Tables', Tables);
exports.Users = db.model('Users', Users);
exports.Stores = db.model('Stores', Store);
exports.Ingredients = db.model('Ingredients', Ingredients);
exports.Customer = db.model('Customer', Customer);
exports.CheckInRequest = db.model('CheckInRequest', CheckInRequest);
