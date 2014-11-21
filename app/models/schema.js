var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var db = mongoose.connect('mongodb://GEEKY_MONGO/geekymenu');

// 定義フェーズ
var Schema = mongoose.Schema;

var Orders = new mongoose.Schema({
    order_number: {
        type: String,
        required: true,
        index: true
    },
    table_number: {
        type: String,
        required: true,
        index: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stores'
    },
    order_status: {
        type: Number
    },
    secret_number: {
        type: Number
    },
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }],
    items: [{
        item: {
            item_id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true,
                index: true
            },
            price: {
                type: Number,
                default: 0,
                index: true
            }
        }
    }],
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
    'tables': [Tables],
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
    fbid: String,
    email: String,
    first_name: String,
    gender: String,
    last_name: String,
    profileUrl: String,
    locale: String,
    name: String,
    timezone: String,
    updated_time: Date,
    accessToken: String
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
exports.ImageStorage = db.model('ImageStorage', ImageStorage);
exports.Items = db.model('Items', Items);
exports.Categories = db.model('Categories', Categories);
exports.Tables = db.model('Tables', Tables);
exports.Users = db.model('Users', Users);
exports.Stores = db.model('Stores', Store);
exports.Ingredients = db.model('Ingredients', Ingredients);
exports.Customer = db.model('Customer', Customer);