var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var FileSchema = mongoose.Schema({

    uid: String,
    path: String,
    version: Schema.Types.ObjectId,
});
FileSchema.methods = {

};
FileSchema.statics = {



    createFile: function(uid, path, mod, version, cb) {
        var self = this;
        var func = function(v) {
            var file = new self({
                uid: uid,
                version: v._id,
                path: path
            });
            file.save(cb);
        };
        if (typeof version === 'string') {
            return mod.getOrCreateVersion(version, function(err, doc) {
                if (err) return cb(err);
                if (!doc) return cb();
                console.log('doc:', doc)
                func(doc);
            });
        }
        func(version);

    },



};

mongoose.model('File', FileSchema);