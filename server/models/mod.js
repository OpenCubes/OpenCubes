var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ModSchema = mongoose.Schema({

    name: String,
    version: String,
    /*author: {
        type: Schema.Types.ObjectId,
        ref: 'userauths'
    },*/
    summary: String,
    body: String,
    logo: String,
    dl_id: String,
    creation_date: Date,
    lmodified_date: Date,
    /*category_id: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },*/
   // voters: [starSchema],
    vote_count: Number,
    //versions: [versionSchema],
    slug: String

});
ModSchema.path('name').required(true, 'Article title cannot be blank');
ModSchema.path('body').required(true, 'Article body cannot be blank');


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

        this.find(criteria).sort(options.sort).limit(options.perPage).skip(options.perPage * options.page).exec(cb);
    }

};

mongoose.model('Mod', ModSchema);