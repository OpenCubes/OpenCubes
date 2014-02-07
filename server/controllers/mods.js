var mongoose = require('mongoose'),
    Mod = mongoose.model('Mod'),
    marked = require('marked'),
    utils = require('./utils'),
    paginator = require('../paginator.js');
var url = require('url');
var URI = require('URIjs');
var check = require('check-types');


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
            mod: mod,
            canEdit: req.user ? mod.author.equals(req.user.id) : false
        });
    });
};

exports.edit = function(req, res) {
    Mod.load({
        slug: req.params.id,
        author: req.user._id
    }, function(err, mod) {
        if (err || !mod) {
            return res.send(403, 'You are not the author');
        }
        // Check the section exists
        var section = ['general', 'description', 'files']. in (req.params.section, 'general');
        mod.listVersion(function(v) {
            console.log(v);
            res.render('../views/edit/' + section + '.ect', {
                mod: mod,
                title: 'Editing ' + mod.name,
                url: '/mod/' + mod.slug + '/edit',
                versions: v
            });
        })
    });
};
exports.doEdit = function(req, res) {
    Mod.load({
        slug: req.params.id,
        author: req.user._id
    }, function(err, mod) {
        if (err || !mod) {
            return res.send(403, 'You are not the author');
        }
        var data = req.body;
        // Check the section exists
        var section = ['general', 'description', 'files']. in (req.params.section, 'general');
        var map = check.map({
            name: data.name,
            category: data.category,
            summary: data.summary
        }, {
            name: check.unemptyString,
            category: check.unemptyString,
            summary: check.unemptyString
        });
        if (!check.every(map)) {
            req.flash('error', 'Something is missing...');
            return res.render('../views/edit/' + section + '.ect', {
                mod: mod
            });

        }
        switch (section) {
        case 'general':
            mod.name = data.name;
            mod.category = data.category;
            mod.summary = data.summary;
            mod.save(function(err, doc) {
                if (err) {
                    req.flash('error', 'Something is missing...');
                    return res.render('../views/edit/' + section + '.ect', {
                        mod: mod,
                        title: 'Editing ' + mod.name,
                        url: '/mod/' + mod.slug + '/edit'
                    });
                }
                req.flash('success', 'Succesfully edited!');
                return res.redirect('/mod/' + mod.slug + '/edit')

            });
        }

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

            res.render('../views/index.ect', utils.ectHelpers(req, {
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
            }));
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