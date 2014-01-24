var app = {
    controllers: {},
    models: {},
    init: function(cb) {

        var timer = new Date().getTime();
        var express = require('express');
        var http = require('http');
        var path = require('path');
        var config = require('./config');
        var router = require('./router');
        var fs = require('fs')
        var ECT = require('ect');

        require('colors');
        console.log(('  Debug - Loading dependencies took ' + (new Date().getTime() - timer) + ' ms').cyan);
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

        var ectRenderer = ECT({
            watch: true,
            root: __dirname + '/views'
        });

        server.engine('.ect', ectRenderer.render);


        server.use(server.router);
        server.use(require('less-middleware')({
            src: path.join(__dirname, 'public')
        }));
        server.use(express.static(path.join(__dirname, 'public')));

        // development only
        if ('development' == server.get('env')) {
            server.use(express.errorHandler());
        }
        
        var timer2 = new Date().getTime();
        // Bootstrap models
        var models_path = __dirname + '/models'
        fs.readdirSync(models_path).forEach(function(file) {
            if (~file.indexOf('.js')) require(models_path + '/' + file)
        })
        // Bootstrap models
        var controllers_path = __dirname + '/controllers'
        fs.readdirSync(controllers_path).forEach(function(file) {
            if (~file.indexOf('.js')){
              //  console.log(file.slice(0,-3));
            app.controllers[file.slice(0,-3)] = require(controllers_path + '/' + file)
            }
        })

        console.log(('  Debug - Bootstraping took ' + (new Date().getTime() - timer2) + ' ms').cyan);

        router(app);

        http.createServer(server).listen(server.get('port'), function() {
            console.log(('  Debug - Express server listening on port ' + server.get('port') + ' in ' + (new Date().getTime() - timer) + ' ms').green);
            cb();
        });

    },


};

module.exports = app;