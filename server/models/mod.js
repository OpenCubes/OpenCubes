var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var slug = require('mongoose-slug');
var timestamps = require('mongoose-times');
var ModSchema = mongoose.Schema({

    name: String,
    version: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    summary: String,
    body: String,
    logo: String,
    dl_id: String,
    creation_date: Date,
    lmodified_date: Date,
    category: String,
    // voters: [starSchema],
    vote_count: Number,

    versions: [{
        name: String
    }],

});
ModSchema.path('name').required(true, 'Mod title cannot be blank');
ModSchema.path('body').required(true, 'Mod body cannot be blank');
ModSchema.plugin(slug('name'));
ModSchema.plugin(timestamps);
ModSchema.methods = {

    addVersion: function(data, cb) {
        var v = this.versions.push(data);
        var self = this;
        this.save(function(err, doc) {
            if (err) return cb(err);
            self.getVersion(data, cb);
        });

    },
    getVersion: function(data, cb) {
        var v = this.versions.findIn(data);
        console.log(v);
        return cb(undefined, v);
    },
    /**
     * Create the version by name if it does not exists
     * 
     */
    getOrCreateVersion: function(name, cb) {
        var self = this;
        this.getVersion({
            name: name
        }, function(err, doc) {
            if (!doc || err || doc === -1) return self.addVersion({
                name: name
            }, cb);
            cb(err, doc);

        });
    },
    addFile: function(uid, path, version, cb) {
        mongoose.model('File').createFile(uid, path, this, version, cb);
    },
    deleteFile: function(uid, cb){
        mongoose.model('File').remove({uid: uid}, cb);
    },

    /**
     * 
     * Output:
     * 
     *     {
     *          "version1": {
     *            "path": "uid"
     *          }...
     *      }
     * 
     */
    listVersion: function(cb) {
        var File = mongoose.model('File');
        var list = function(versions, i, data) {
            if (i === versions.length) return cb(data);
            File.find({
                version: versions[i]._id
            }).sort('path').exec(function(err, doc) {
                if (err) return console.log(err);
                var verName = versions[i].name;

                var files = {}
                doc.forEach(function(file) {
                    files[file.path] = file.uid;
                })
                data[verName] = files;
                i++;
                list(versions, i, data);
            });
        };
        list(this.versions, 0, {});

    }
};
ModSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function(data, cb) {
        var query = this.findOne(data);
        // query.populate('category_id').populate('author', 'username _id').select('name summary category_id creation_date _id slug');
        query.exec(cb);
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function(options, cb) {
        var criteria = options.criteria || {};

        this.find(criteria).sort(options.sort).limit(options.perPage).populate('author', 'username').skip(options.perPage * options.page).exec(cb);
    }

};

mongoose.model('Mod', ModSchema);