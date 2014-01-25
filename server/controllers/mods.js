var mongoose = require('mongoose'),
    Mod = mongoose.model('Mod');

exports.load = function(req, res, next, id) {

    Mod.load(id, function(err, mod) {
        if (err) return next(err);
        if (!mod) return next(new Error('not found'));
        req.mod = mod;
        next();
    });
};
exports.index = function(req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };

    Mod.list(options, function(err, articles) {
        if (err) return res.render('500');
        Mod.count().exec(function(err, count) {
            res.render('articles/index', {
                title: 'Articles',
                articles: articles,
                page: page + 1,
                pages: Math.ceil(count / perPage)
            });
        });
    });
};
exports.upload = function(req, res) {
    res.render('../views/upload.ect');
};
exports.doUpload = function(req, res) {
    console.log('Received');
    var mod = new Mod({
        name: req.body.name,
        summary: req.body.summary,
        body: req.body.description
    });
    console.log('Saving');
    mod.save(function(err, doc) {

        console.log('Saved (or not)');
        if (err) {
            res.render('../views/upload.ect', {
                hasError: true
            });

        }
        else res.redirect('/');
    });

};