(function() {
	var initializing = false, fnTest = /xyz/.test(function(){
		xyz;
	}) ? /\b_super\b/ : /.*/;

	this.Class = function(){};

	Class.extend = function(prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn){
				return function() {
					var tmp = this._super;
					this._super = _super[name];
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) :
			prop[name];
		}

		function Class() {
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;

		return Class;
	};

	this.Slide = {};

	Slide.EventAware = Class.extend({
		init: function() {
			this.handlers = {};
		},
		on: function(event, func) {
			this.handlers[event] = this.handlers[event] || [];
			this.handlers[event].push(func);
		},
		off: function(event, func) {
			if (typeof func === 'undefined') {
				this.handlers[event] = [];
			} else {
				for (var i = 0; i < this.handlers[event].length; i++) {
					if (this.handlers[event][i] == func) {
						this.handlers[event].splice(i, 1);
						break;
					}
				}
			}
		},
		hasHandler: function(event) {
			return this.handlers[event].length > 0;
		},
		fire: function(event, _args) {
			var args = _args || {};
			for (var i = 0; i < this.handlers[event].length; i++) {
				this.handlers[event][i].call(this, args);
			}
		}
	});

	Slide.Show = Slide.EventAware.extend({
		init: function(_target, _options) {
			this.options = Slide.Util.mergeObjects({
					playbackSpeed: 5000,
					repeat: true,
					responsive: true
				}, _options);

			this.target = _target;
			this.items = [];
			this.current = -1;
			this.playing = false;
			this.handlers = {
				'previous': [],
				'next': [],
				'first': [],
				'last': [],
				'start': [],
				'stop': [],
				'play': [],
				'pause': [],
				'to': [],
				'addItem': [],
				'preattach': [],
				'postattach': [],
				'predetach': [],
				'postdetach': []
			};
		},
		addItem: function(_item) {
			Slide.Util.isArray(_item) ? this._addItems(_item) : this._addItem(_item);
		},
		_addItem: function(_item) {
			this.items.push(_item);
			_item.index = this.items.length - 1;
			_item.slideshow = this;
			this.fire('addItem', {
				index: _item.index,
				item: _item
			});
		},
		_addItems: function(_items) {
			for (var i = 0; i < _items.length; i++) {
				this.addItem(_items[i]);
			}
		},
		start: function(_start) {
			var start = _start || 1;
			this.current = (start - 1);
			this.items[this.current].attach();
			Slide.Util.addEventListener(window, 'resize', Slide.Util.bind(this._onWindowResize, this));
			Slide.Util.addEventListener(document, 'keydown', Slide.Util.bind(this._onKeyDown, this));

			this.fire('start');
		},
		stop: function() {
			this.items[this.current].detach();
			Slide.Util.removeEventListener(window, 'resize', Slide.Util.bind(this._onWindowResize, this));
			Slide.Util.removeEventListener(document, 'keydown', Slide.Util.bind(this._onKeyDown, this));

			this.fire('stop');
		},
		play: function() {
			if (!this.playing) {
				if (this.options['repeat']
						|| (this.current < (this.items.length - 1))) {
					this.playing = true;
					this._play();
					this.fire('play');
				}
			}
		},
		_play: function() {
			var SHOW = this;
			this.playInterval = setInterval(function() {
				SHOW._next();
			}, this.options['playbackSpeed']);
		},
		_resetPlay: function() {
			if (this.playing) {
				clearInterval(this.playInterval);
				this._play();
			}
		},
		pause: function() {
			if (this.playing) {
				this.playing = false;
				clearInterval(this.playInterval);
				this.fire('pause');
			}
		},
		to: function(_slide) {
			this._resetPlay();
			this._to(_slide);
		},
		_to: function(_slide) {
			var SHOW = this;
			this.items[this.current].detach(function() {
				var tempCur = _slide - 1;
				if (tempCur > (SHOW.items.length - 1)) {
					tempCur = SHOW.options['repeat'] ? 0 : (SHOW.items.length - 1);
				} else if (tempCur < 0) {
					tempCur = SHOW.options['repeat'] ? (SHOW.items.length - 1) : 0;
				}
				SHOW.current = tempCur;
				SHOW.items[SHOW.current].attach();
				if (SHOW.current == (SHOW.items.length - 1)) SHOW.fire('last', SHOW._currentObject());
				if (SHOW.current == 0) SHOW.fire('first', SHOW._currentObject());
				if (SHOW.playing && !SHOW.options['repeat'] && (SHOW.current >= (SHOW.items.length - 1))) {
					SHOW.pause();
				}
				SHOW.fire('to', SHOW._currentObject());
			});
		},
		first: function() {
			this.to(1);
		},
		last: function() {
			this.to(this.items.length);
		},
		next: function() {
			this.to(this.current + 2);
			this.fire('next', this._currentObject());
		},
		_next: function() {
			this._to(this.current + 2);
		},
		previous: function() {
			this.to(this.current);
			this.fire('previous', this._currentObject());
		},
		_previous: function() {
			this._to(this.current);
		},
		_currentObject: function() {
			return {
				index: this.current,
				item: this.items[this.current]
			};
		},
		_onWindowResize: function() {
			if (this.current > -1 && this.current < this.items.length) {
				this.items[this.current].invalidate();
			}
		},
		_onKeyDown: function(_event) {
			var event = (_event) ? _event : window.event;
			var keyCode = -1;
			if (keyCode && (event.keyCode > 0)) {
				keyCode = event.keyCode;
			} else if (event.which == null) {
				keyCode = event.keyCode;
			} else if (event.which != 0 && event.charCode != 0) {
				keyCode = event.which;
			}
			switch (keyCode) {
				case 32:
					(this.playing) ? this.pause() : this.play();
					break;
				case 39:
					this.next();
					break;
				case 37:
					this.previous();
					break;
			}
		}
	});

	Slide.Item = Slide.EventAware.extend({
		init: function(_el, _class) {
			this.el = _el || {};
			this.classes = Slide.Util.isArray(_class) ? _class : ((Slide.Util.isString(_class)) ? [_class] : []);
			this.slideshow = {};
			this.index = -1;
			this.handlers = {
				'load': [],
				'invalidate': []
			};
			this._loading = false;
			this._detached = true;
			this._detaching = false;
			for (var i = 0; i < this.classes.length; i++) {
				Slide.Util.addClass(this.el, this.classes[i]);
			}
		},
		attach: function(cb) {
			var SLIDE_ITEM = this;
			this._detached = false;
			this.slideshow.fire('preattach', {
				'item': this,
				'attach': function() {
					SLIDE_ITEM._attach.call(SLIDE_ITEM, cb);
				}
			});
			if (!this.slideshow.hasHandler('preattach')) {
				this._attach(cb);
			}
		},
		_attach: function(cb) {
			if (this._detached) {
				return;
			} else if (this._loading) {
				var SLIDE_ITEM = this;
				setTimeout(function() {
					SLIDE_ITEM._attach(cb);
				}, 50);
			} else {
				if (typeof this.el === 'string') {
					var div = document.createElement('div');
					div.innerHTML = this.el;
					this.el = div.firstChild;
				} else if (!Slide.Util.isElement(this.el)) {
					this.el = document.createElement('div');
				}
				this.slideshow.target.appendChild(this.el);
				this.invalidate();
			}
			this.slideshow.fire('postattach', {
				item: this
			});
			if (cb) cb.call(null);
		},
		detach: function(cb) {
			var SLIDE_ITEM = this;
			this._detached = true;
			this.slideshow.fire('predetach', {
				'item': this,
				'detach': function() {
					SLIDE_ITEM._detach.call(SLIDE_ITEM, cb);
				}
			});
			if (!this.slideshow.hasHandler('predetach')) {
				this._detach(cb);
			}
		},
		_detach: function(cb) {
			this.slideshow.target.innerHTML = '';
			this.slideshow.fire('postdetach', {
				item: this
			});
			if (cb) cb.call(null);
		},
		invalidate: function() {
			if (this.slideshow.options['responsive']) {
				var size = Slide.Util.constrain(
								this.el.offsetWidth,
								this.el.offsetHeight,
								this.slideshow.target.offsetWidth,
								this.slideshow.target.offsetHeight);

				this.el.style.width = size.width + 'px';
				this.el.style.height = size.height + 'px';
			}
			this.fire('invalidate', this);
		}
	});

	Slide.Image = Slide.Item.extend({
		init: function(_src, _class) {
			var el = new Image();
			var SLIDE = this;
			el.onload = function() {
				SLIDE._loading = false;
				SLIDE.el.style.display = '';
				SLIDE.fire('load', SLIDE);
			};
			el.src = _src;
			el.style.display = 'none';

			this._super(el, _class);
			this._loading = true;
		}
	});

	Slide.HTML = Slide.Item,

	Slide.Util = {
		bind: function(fn, scope) {
			return function () {
				fn.apply(scope, arguments);
			};
		},
		addClass: function(el, classStr) {
			el.className += " " + classStr;
		},
		removeClass: function(el, classStr) {
			var re = new RegExp("(?:^|\\s)" + classStr + "(?!\\S)", "g");
			el.className = el.className.replace(re, "");
		},
		isString: function(obj) {
			return typeof obj === 'string';
		},
		isArray: function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		},
		mergeObjects: function(obj1, obj2) {
			if (typeof obj1 == 'undefined') {
				return {};
			}
			if (typeof obj2 == 'undefined') {
				return obj1;
			}
			var obj3 = {};
			for (var attrname in obj1) {
				obj3[attrname] = obj1[attrname];
			}
			for (attrname in obj2) {
				obj3[attrname] = obj2[attrname];
			}
			return obj3;
		},
		addEventListener: function(el, ev, fn) {
			if (el.addEventListener) {
				el.addEventListener(ev, fn, false);
			} else if (el.attachEvent) {
				el.attachEvent('on' + ev, fn);
			} else {
				el['on' + ev] = fn;
			}
		},
		removeEventListener: function(el, ev, fn) {
			if (el.removeEventListener) {
				el.removeEventListener(ev, fn, false);
			} else if (el.detachEvent) {
				el.detachEvent('on' + ev, fn);
			} else {
				el['on' + ev] = null;
			}
		},
		isNode: function(o){
			return (
				typeof Node === "object" ? o instanceof Node :
					o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
			);
		},
		isElement: function(o){
			return (
				typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
				o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
			);
		},
		getStyle: function(el,styleProp) {
			var x = document.getElementById(el);
			var y = {};
			if (x.currentStyle) {
				y = x.currentStyle[styleProp];
			} else if (window.getComputedStyle) {
				y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
			}
			return y;
		},
		constrain: function (currentWidth, currentHeight, maxWidth, maxHeight) {
			if (!maxWidth && !maxHeight) {
				return {
					'width': currentWidth,
					'height': currentHeight
				};
			}

			var widthRatio = heightRatio = 1.0;
			var didWidth = didHeight = false;

			if ( maxWidth > 0 && currentWidth > 0) {
				widthRatio = maxWidth / currentWidth;
				didWidth = true;
			}

			if ( maxHeight > 0 && currentHeight > 0) {
				heightRatio = maxHeight / currentHeight;
				didHeight = true;
			}

			var smallerRatio = Math.min( widthRatio, heightRatio );
			var largerRatio  = Math.max( widthRatio, heightRatio );

			var ratio = 1.0;
			if ((currentWidth * largerRatio) > maxWidth || (currentHeight * largerRatio) > maxHeight) {
				ratio = smallerRatio;
			} else {
				ratio = largerRatio;
			}

			var w = currentWidth * ratio;
			var h = currentHeight * ratio;

			if (didWidth && (w == maxWidth - 1)) {
				w = maxWidth;
			}
			if (didHeight && (h == maxHeight - 1)) {
				h = maxHeight;
			}

			return {
				'width': w,
				'height': h
			};
		}
	};
})();
