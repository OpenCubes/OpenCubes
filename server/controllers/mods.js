var mongoose = require('mongoose'),
    Mod = mongoose.model('Mod'),
    marked = require('marked'),
    utils = require('./utils'),
    paginator = require('../paginator.js');

exports.view = function(req, res) {
    Mod.load({
        slug: req.params.id
    }, function(err, mod) {
        if (err || !mod) {
            res.reason = 'Mod not found';
            return utils.notfound(req, res, function() {});
        }
        mod.htmlbody = marked(mod.body);
        res.render('../views/view.ect', {
            mod: mod
        });
    });
};
exports.index = function(req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 2;
    var options = {
        perPage: perPage,
        page: page
    };

    Mod.list(options, function(err, mods) {
        if (err) return res.render('500');
        Mod.count().exec(function(err, count) {

            res.render('../views/index.ect', {
                title: 'Mods - OpenCubes',
                mods: mods,
                page: page + 1,
                pages: Math.ceil(count / perPage),
                pagination: paginator.create('search', {prelink:'/', current: page + 1, rowsPerPage: perPage, totalResult: count/*, translator: function () {
                    return {
                        'PREVIOUS': '&laquo;',
                        'NEXT': '&raquo;'
                    }
                }*/}).render()
            });
        });
    });
};
exports.upload = function(req, res) {
    res.render('../views/upload.ect');
};
exports.doUpload = function(req, res) {
    
    var mod = new Mod({
        name: req.body.name,
        summary: req.body.summary,
        body: req.body.description,
        author: req.user._id
    });
    mod.save(function(err, doc) {

        if (err) {
            res.render('../views/upload.ect', {
                hasError: true
            });

        }
        else res.redirect('/');
    });

};