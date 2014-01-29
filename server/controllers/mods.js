var mongoose = require('mongoose'),
    Mod = mongoose.model('Mod'),
    marked = require('marked'),
    utils = require('./utils'),
    paginator = require('../paginator.js');
var url = require('url');
var URI = require('URIjs');

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
    var page = (req.params.page > 0 ? req.param('page') : 1) - 1;
    var sort = (req.param('sort')) || 'date';
    var filter = (req.param('filter')) || 'all';
    var perPage = 10;
    var options = {
        perPage: perPage,
        page: page,
        sort: sort,
        filter: filter,
        criteria: (filter !== 'all' ? {
            category: filter
        } : {})
    };
    // We get the params in the url -> Preserve the params in the links
    var url_parts = url.parse(req.url, true);
    var query = url_parts.search;
    var listing = new Date().getTime();

    Mod.list(options, function(err, mods) {
        if (err) return res.render('500');
        Mod.count().exec(function(err, count) {
            console.log(('  Loading mods took ' + (new Date().getTime() - listing + ' ms')).cyan);

            res.render('../views/index.ect', {
                title: 'Mods - OpenCubes',
                mods: mods,
                page: page + 1,
                pages: Math.ceil(count / perPage),
                pagination: paginator.create('search', {
                    prelink: '',
                    current: page + 1,
                    rowsPerPage: perPage,
                    totalResult: count,
                    postlink: query
                }).render(),
                urlHelper: function (key, value) {
                    return (new URI(req.url)).setQuery(key, value);
                },
                isQueried: function (key, value) {
                    return (new URI(req.url)).hasQuery(key, value);
                }
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
        author: req.user._id,
        category: req.body.category || 'misc'
    });
    mod.save(function(err, doc) {
        console.log(doc)
        if (err) {
            res.render('../views/upload.ect', {
                hasError: true
            });

        }
        else res.redirect('/');
    });

};