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

var Slide = {};

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
		var args = _args || [];
		for (var i = 0; i < this.handlers[event].length; i++) {
			this.handlers[event][i].apply(this, args);
		}
	}
});

Slide.Show = Slide.EventAware.extend({
	init: function(_target, _options) {

		this.options = Slide.Util.mergeObjects({
				'playbackSpeed': 5000
			}, _options);

		this.target = _target;
		this.items = [];
		this.current = -1;
		this.handlers = {
			'previous': [],
			'next': [],
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

		var SLIDE = this;
		Slide.Util.addEventListener(window, 'resize', function() {
			if (SLIDE.current > -1) {
				SLIDE.items[SLIDE.current].invalidate();
			}
		});
	},
	addItem: function(_item) {
		this.items.push(_item);
		_item.index = this.items.length - 1;
		_item.slideshow = this;
		this.fire('addItem', [_item]);
	},
	addItems: function(_items) {
		for (var i = 0; i < _items.length; i++) {
			this.addItem(_items[i]);
		}
	},
	start: function(_start) {
		var start = _start || 1;
		this.current = (start - 1);
		this.items[this.current].attach();
		this.fire('start');
	},
	stop: function() {
		this.items[this.current].detach();
		this.fire('stop');
	},
	play: function() {
		var SLIDE_SHOW = this;
		this.playInterval = setInterval(function() {
			SLIDE_SHOW.next();
		}, this.options['playbackSpeed']);
		this.fire('play');
	},
	pause: function() {
		clearInterval(this.playInterval);
		this.fire('pause');
	},
	to: function(_slide) {
		var SLIDE_SHOW = this;
		this.items[this.current].detach(function() {
			SLIDE_SHOW.current = ((_slide - 1) >= SLIDE_SHOW.items.length) ? 0 : (((_slide - 1) < 0) ? (SLIDE_SHOW.items.length - 1) : (_slide - 1));
			SLIDE_SHOW.items[SLIDE_SHOW.current].attach();
			SLIDE_SHOW.fire('to', [SLIDE_SHOW._currentObject()]);
		});
	},
	first: function() {
		this.to(1);
		this.fire('first', [this._currentObject()]);
	},
	last: function() {
		this.to(this.items.length);
		this.fire('last', [this._currentObject()]);
	},
	next: function() {
		this.to(this.current + 2);
		this.fire('next', [this._currentObject()]);
	},
	previous: function() {
		this.to(this.current);
		this.fire('previous', [this._currentObject()]);
	},
	_currentObject: function() {
		return {
			index: this.current,
			item: this.items[this.current]
		};
	}
});

Slide.Item = Slide.EventAware.extend({
	init: function(_el) {
		this.el = _el || {};
		this.slideshow = {};
		this.index = -1;
		this.handlers = {
			'load': [],
			'invalidate': []
		};
		this._loading = false;
		this._detached = true;
		this._detaching = false;
	},
	attach: function(func) {
		this._detached = false;
		this.slideshow.fire('preattach', [this, {
			'func': this._attach,
			'param': func
		}]);
		if (!this.slideshow.hasHandler('preattach')) {
			this._attach(func);
		}
	},
	_attach: function(func) {
		if (this._detached) {
			return;
		} else if (this._loading) {
			var SLIDE_ITEM = this;
			setTimeout(function() {
				SLIDE_ITEM._attach();
			}, 50);
		} else {
			if (Slide.Util.isElement(this.el)) {
				this.slideshow.target.appendChild(this.el);
			} else if (typeof this.el === 'string') {
				this.slideshow.target.innerHTML = this.el;
			} else {
				this.slideshow.target.innerHTML = '';
			}
			this.invalidate();
		}
		this.slideshow.fire('postattach', [this]);
		if (func) func.call(this);
	},
	detach: function(func) {
		this._detached = true;
		this.slideshow.fire('predetach', [this, {
			'func': this._detach,
			'param': func
		}]);
		if (!this.slideshow.hasHandler('predetach')) {
			this._detach(func);
		}
	},
	_detach: function(func) {
		this.slideshow.target.innerHTML = '';
		this.slideshow.fire('postdetach', [this]);
		if (func) func.call(this);
	},
	invalidate: function() { }
});

Slide.Image = Slide.Item.extend({
	init: function(_src) {
		this._super();
		this._loading = true;

		var SLIDE_ITEM = this;
		this.el = new Image();
		this.el.onload = function() {
			SLIDE_ITEM._loading = false;
			SLIDE_ITEM.el.style.display = '';
			SLIDE_ITEM.fire('load', SLIDE_ITEM);
		};
		this.el.src = _src;
		this.el.style.display = 'none';
	},
	invalidate: function() {
		this._super();

		var size = Slide.Util.constrain(
						this.el.offsetWidth,
						this.el.offsetHeight,
						this.slideshow.target.offsetWidth,
						this.slideshow.target.offsetHeight);

		this.el.style.width = size.width + 'px';
		this.el.style.height = size.height + 'px';

		this.fire('invalidate', this);
	}
});

Slide.HTML = Slide.Item,

Slide.Util = {
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
