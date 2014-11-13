module.exports = function (mongoose) {
// 定義フェーズ
    var Schema = mongoose.Schema;

    var SyncSchema = Schema({
        name: String,
        dataIds: [{
            type: Schema.ObjectId
        }],
        syncType: String,
        syncFlg: Boolean
    });

    return {
        SyncSchema: mongoose.model('SyncSchema', SyncSchema)
    }
};