(function($){
	// regex, that checks whether link points to a local or remote URL
	var isLocal = new RegExp('^(' + location.protocol + '\/\/' + location.host + '|\\.|\\/|[A-Z0-9_#])', 'i');
	
	// adding :local selector to jQuery
	// to fetch only links that point to a local URL
	$.expr[':'].local = function(el) {
		if(! el.attributes.href) return false;

		return isLocal.test(el.attributes.href.value);
	};
	
	var Joconut = {
		initialize: function() {
			this.bindLinks();
			
			History.Adapter.bind(window, 'statechange', function(){
				var state = History.getState();

				Joconut.fetch({
					url: state.url,
					history: false
				});
			});
			
			$('script').each(function(){
				Joconut._loaded.scripts.push($(this).attr('src'));
			});

			$('link[rel="stylesheet"]').each(function(){
				Joconut._loaded.stylesheets.push($(this).attr('href'));
			});
		},
		
		bindLinks: function() {
			var links = $('a:local');
			links.off('click', this._linkHandler);
			links.on('click', this._linkHandler);
		},
		
		_linkHandler: function(e) {
			Joconut.fetch({
				url: $(this).attr('href'),
				history: true
			});
			
			return false;
		},
		
		listeners: {},
		
		trigger: function(event, args) {
			var listeners = this.listeners[event];
			
			if (! listeners) return;
			
			var length = listeners.length;
			
			for (var i = 0; i < length; i++) {
				listeners[i].apply(null, args);
			}
		},
		
		on: function(event, listener) {
			var listeners = this.listeners[event] || (this.listeners[event] = []);
			
			listeners.push(listener);
		},
		
		_loaded: {
			scripts: [],
			stylesheets: []
		},
		
		container: 'body',
		
		replaceContent: function(response, callback) {
			var $container = $(this.container),
				body;
			
			if (this.container !== 'body') {
				try {
					body = $(response).filter($.joconut.container).html();
					$container.html(body);
				} catch(err) {
					return this.trigger('error', [err]);
				}
			} else {
				body = /<body[^>]*>((.|[\n\r])*)<\/body>/im.exec(response);
				$container.html(body ? body[1] : response);
			}
			
			if (body) {
				var $head, tag, src, href;
				
				while (true) {
					tag = /<script\b[^>]*><\/script>/gm.exec(response);

					if (! tag) break;

					src = /src\=.?([A-Za-z0-9-_.\/]+).?/.exec(tag[0]);

					if(! src) break;

					src = src[1]

					if (-1 == this._loaded.scripts.indexOf(src)) {
						this._loaded.scripts.push(src);
						if (! $head) $head = $('head');
						$head.append(tag[0]);
					}

					response = response.replace(tag[0], '');
				}

				while (true) {
					tag = /<link\b[^>]*\/?>/gm.exec(response);

					if (! tag) break;

					if (/rel\=.?stylesheet.?/.test(tag[0])) {
						href = /href\=.?([A-Za-z0-9\-_.\/:]+).?/.exec(tag[0]);

						if (! href) break;

						if (-1 == this._loaded.stylesheets.indexOf(href)) {
							this._loaded.stylesheets.push(href);

							if (! $head) $head = $('head');
							$head.append(tag[0]);
						}
					}

					response = response.replace(tag[0], '');
				}
				
				$('html, body').animate({ scrollTop: 0 }, 'fast');
			}
			
			setTimeout(function(){
				if (callback) callback();
				Joconut.bindLinks();
			}, 100);
		},
		
		fetch: function(options, callback) {
			this.trigger('before:fetch');
			
			$.ajax({
				url: options.url,
				type: 'GET',
				data: options.data,
				timeout: 5000,
				error: function(xhr, status) {
					if(callback) callback(xhr, status);
					Joconut.trigger('error', [xhr, status]);
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-PJAX', 'true');
				},
				success: function(response) {
					Joconut.replaceContent(response, function(){
						if(options.history) {
						    var regex = /<title>((.|\n\r])*)<\/title>/im;
						    console.log(response)
						    var executed = regex.exec(response);
						    console.log(executed)
							history.pushState({
								url: options.url
							}, executed[1], options.url);
						}

						if(callback) callback(null, response);
						Joconut.trigger('fetch');
					});
				}
			});
		}
	};
	
	$.joconut = Joconut;
	
	$(function(){
		Joconut.initialize();
	});
})(jQuery);