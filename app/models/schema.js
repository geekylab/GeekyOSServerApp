var mongoose = require('mongoose');
mongoose.connect('mongodb://GEEKY_MONGO/myapp');
// 定義フェーズ
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    name:  String,
    point: Number
});
exports.User = mongoose.model('User', UserSchema);