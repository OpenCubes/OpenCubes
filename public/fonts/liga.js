/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
	'use strict';
	function supportsProperty(p) {
		var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
			i,
			div = document.createElement('div'),
			ret = p in div.style;
		if (!ret) {
			p = p.charAt(0).toUpperCase() + p.substr(1);
			for (i = 0; i < prefixes.length; i += 1) {
				ret = prefixes[i] + p in div.style;
				if (ret) {
					break;
				}
			}
		}
		return ret;
	}
	var icons;
	if (!supportsProperty('fontFeatureSettings')) {
		icons = {
			'bubble': '&#x62;',
			'bubbles': '&#x42;',
			'user': '&#x75;',
			'search': '&#x51;',
			'zoomin': '&#x2b;',
			'zoomout': '&#x2d;',
			'expand': '&#x58;',
			'contract': '&#x78;',
			'key': '&#x6b;',
			'lock': '&#x6c;',
			'equalizer': '&#x65;',
			'eye': '&#x35;',
			'eyeblocked': '&#x38;',
			'stare': '&#x73;',
			'starf': '&#x53;',
			'play': '&#x70;',
			'info': '&#x69;',
			'warning': '&#x21;',
			'enter': '&#x36;',
			'code': '&#x63;',
			'share': '&#x26;',
			'mail': '&#x6d;',
			'googleplus': '&#x67;',
			'facebook': '&#x66;',
			'twitter': '&#x74;',
			'feed': '&#x46;',
			'youtube': '&#x79;',
			'github': '&#x6f;',
			'wordpress': '&#x77;',
			'linux': '&#x24;',
			'apple': '&#x61;',
			'android': '&#x72;',
			'windows': '&#x57;',
			'stackoverflow': '&#x3d;',
			'chrome': '&#x2a;',
			'firefox': '&#xf9;',
			'css': '&#xb5;',
			'html': '&#x68;',
			'ie': '&#x2f;',
			'opera': '&#x4f;',
			'safari': '&#x23;',
			'icomoon': '&#x32;',
			'zip': '&#x7a;',
			'xml': '&#x3a;',
			'image': '&#x64;',
			'bullhorn': '&#xa7;',
			'home': '&#xa3;',
			'pencil': '&#x50;',
			'tag': '&#xe9;',
			'folder': '&#xa8;',
			'history': '&#xe8;',
			'download': '&#x76;',
			'upload': '&#x5e;',
			'back': '&#x3c;',
			'forward': '&#x37;',
			'check': '&#x56;',
			'blocked': '&#x7b;',
			'cartfill': '&#xe0;',
			'cartempty': '&#x20ac;',
			'trash': '&#x7e;',
			'fork': '&#xa4;',
			'0': 0
		};
		delete icons['0'];
		window.icomoonLiga = function (els) {
			var classes,
				el,
				i,
				innerHTML,
				key;
			els = els || document.getElementsByTagName('*');
			if (!els.length) {
				els = [els];
			}
			for (i = 0; ; i += 1) {
				el = els[i];
				if (!el) {
					break;
				}
				classes = el.className;
				if (/icon-/.test(classes)) {
					innerHTML = el.innerHTML;
					if (innerHTML && innerHTML.length > 1) {
						for (key in icons) {
							if (icons.hasOwnProperty(key)) {
								innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
							}
						}
						el.innerHTML = innerHTML;
					}
				}
			}
		};
		window.icomoonLiga();
	}
}());