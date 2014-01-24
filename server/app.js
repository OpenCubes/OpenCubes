var app = {
	init: function(cb) {

		var timer = new Date().getTime();
		var express = require('express');
		var http = require('http');
		var path = require('path');
		var config = require('./config');
		require('colors');
		console.log(('  Debug - Loading dependencies took ' + (new Date().getTime() - timer) + ' ms').cyan);

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
		server.use(server.router);
		server.use(require('less-middleware')({
			src: path.join(__dirname, 'public')
		}));
		server.use(express.static(path.join(__dirname, 'public')));

		// development only
		if ('development' == server.get('env')) {
			server.use(express.errorHandler());
		}



		http.createServer(server).listen(server.get('port'), function() {
			console.log(('  Debug - Express server listening on port ' + server.get('port') + ' in ' + (new Date().getTime() - timer) + ' ms').green);
			cb();
		});

	},


};

module.exports = app;