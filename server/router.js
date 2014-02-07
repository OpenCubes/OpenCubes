var auth = require('./middlewares/auth.js');
module.exports = function(app) {
    var timer = new Date().getTime();
    app.server.get('/(page/:page)?', app.controllers.mods.index);
    app.server.get('/mod/:id', app.controllers.mods.view);
    app.server.get('/mod/:id/edit/(:section)?', auth.requiresLogin, app.controllers.mods.edit);
    app.server.post('/mod/:id/edit/files', auth.requiresLogin, app.controllers.files.upload);
    app.server.post('/mod/:id/edit/(/:section)?', auth.requiresLogin, app.controllers.mods.doEdit);

    app.server.get('/upload', auth.requiresLogin, app.controllers.mods.upload);
    app.server.get('/login', app.controllers.users.login);
    app.server.post('/login', function(req, res, next) {
        app.passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/login' + (req.body.target ? '?target=' + req.body.target : ''));
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.redirect(req.body.target || '/');
            });
        })(req, res, next);
    });
    app.server.get('/signup', app.controllers.users.signup);
    app.server.get('/user/:name', app.controllers.users.show);
    app.server.post('/signup', app.controllers.users.create);
    app.server.post('/upload', auth.requiresLogin, app.controllers.mods.doUpload);
    app.server.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    console.log(('  Info - Loading routes took ' + (new Date().getTime() - timer + '').bold + ' ms').cyan);

};