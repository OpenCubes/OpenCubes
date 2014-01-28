/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    utils = require('./utils');
//  , utils = require('../../lib/utils');

var login = function(req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
};

exports.signin = function(req, res) {};

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function(req, res) {
    console.log(req.query);
    res.render('users/login.ect', {
        title: 'Login',
        target: req.query.target || ''
        //message: req.flash('error')
    });
};

/**
 * Show sign up form
 */

exports.signup = function(req, res) {
    res.render('users/signup.ect', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

/**
 * Create user
 */

exports.create = function(req, res, next) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            console.log(err);
            return res.render('users/signup.ect', {
                //  error: utils.errors(err.errors),
                user: user,
                title: 'Sign up'
            });
        }

        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/**
 * Show profile
 */

exports.show = function(req, res) {
    User.findOne({
        username: req.params.name
    }).exec(function(err, user) {
        if (err) return utils.notfound(req, res, function() {});
        if (!user) {
            req.reason = 'No user is called like that'
            return utils.notfound(req, res, function() {});
        }
        res.render('users/user.ect', {
            title: user.name,
            user: user
        });
    })

};

/**
 * Find user by id
 */

exports.user = function(req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
    });
};