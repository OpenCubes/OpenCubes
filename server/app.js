String.prototype.getParent = function() {
    return this.toString().substring(0, this.toString().lastIndexOf('/'));
};
var app = {
    controllers: {},
    models: {},
    init: function(cb) {

        var timer = new Date().getTime();
        var express = require('express');
        var http = require('http');
        var path = require('path');
        var router = require('./router');
        var config = require('./config');
        var fs = require('fs');
        var ECT = require('ect');
        var lessMiddleware = require('less-middleware');
        var utils = require('./controllers/utils.js');
        var flash = require('express-flash');
        var passport = require('passport');

        require('colors');
        console.log(('  Debug - Loading dependencies took ' + (new Date().getTime() - timer) + ' ms').cyan);

        var mongoose = require('mongoose');
        mongoose.connect(config.db_uri, config.db_opt, function(err) {
            if (err) return console.log(('  Error - Can\'t connect to mongodb').red);
                        var timer2 = new Date().getTime();
            // Bootstrap models
            var models_path = __dirname + '/models';
            fs.readdirSync(models_path).forEach(function(file) {
                if (~file.indexOf('.js')) require(models_path + '/' + file);
            });
            // Bootstrap models
            var controllers_path = __dirname + '/controllers';
            fs.readdirSync(controllers_path).forEach(function(file) {
                if (~file.indexOf('.js')) {
                    //  console.log(file.slice(0,-3));
                    app.controllers[file.slice(0, - 3)] = require(controllers_path + '/' + file);
                }
            });

            console.log(('  Debug - Bootstraping took ' + (new Date().getTime() - timer2) + ' ms').cyan);

            var server;
            app.server = server = express();

            server.set('port', process.env.PORT || 3000);
            server.set('views', path.join(__dirname, 'views'));
            server.set('view engine', 'html');
            server.use(express.favicon());
            server.use(express.logger('dev'));
            server.use(express.json());
            server.use(express.urlencoded());
            server.use(express.methodOverride());
            server.use(express.cookieParser(config.securitySalt));
            server.use(express.session());
            server.use(flash());
            require('./passport')(passport, config);
            // use passport session
            server.use(passport.initialize());
            server.use(passport.session());
           server.use(function(req, res, next) {
                res.locals.user = req.user;
                next();
            })
            app.passport = passport;

            var ectRenderer = ECT({
                watch: true,
                root: __dirname + '/views',
            });
            server.engine('.ect', ectRenderer.render);
            server.use(lessMiddleware({
                src: __dirname + "/less",
                dest: __dirname.getParent() + "/public/css",
                // if you're using a different src/dest directory, you
                // MUST include the prefex, which matches the dest
                // public directory
                prefix: "/css",
                // force true recompiles on every request... not the
                // best for production, but fine in debug while working
                // through changes
                force: config.env === 'dev'
            }));

            server.use(express.static(path.join(__dirname.getParent(), 'public')));
            server.use(server.router);
            server.use(utils.notfound);

            // development only
            if ('development' == server.get('env')) {
                server.use(express.errorHandler());
            }

            router(app);


            http.createServer(server).listen(server.get('port'), function() {
                console.log(('  Debug - Express server listening on port ' + server.get('port') + ' in ' + (new Date().getTime() - timer) + ' ms').green);
                cb();
            });
        });

    }


};

module.exports = app;