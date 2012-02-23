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

Slide.Show = Class.extend({

	init: function(_target, _options) {
		this.options = {};

		this.target = _target;
		this.items = [];
		this.current = -1;

		var SLIDE = this;
		Slide.Util.addEventListener(window, 'resize', function() {
			SLIDE.items[SLIDE.current].invalidate(SLIDE.target);
		});
	},

	addItem: function(_item) {
		this.items.push(_item);
	},

	addItems: function(_items) {
		for (var i = 0; i < _items.length; i++) {
			this.addItem(_items[i]);
		}
	},

	start: function(_start) {
		var start = _start || 1;
		this.current = (start - 1);
		this.items[this.current].attach(this.target);
	},

	stop: function() {
		this.items[this.current].detach(this.target);
	},

	play: function() {
		var SLIDE_SHOW = this;
		this.playInterval = setInterval(function() {
			SLIDE_SHOW.next();
		}, 2000);
	},

	pause: function() {
		clearInterval(this.playInterval);
	},

	to: function(_slide) {
		this.items[this.current].detach(this.target);
		this.current = _slide - 1;
		this.items[this.current].attach(this.target);
	},

	first: function() {
		this.to(1);
	},

	last: function() {
		this.to(this.items.length);
	},

	next: function() {
		this.items[this.current].detach(this.target);
		this.current++;
		if (this.current == this.items.length) {
			this.current = 0;
		}
		this.items[this.current].attach(this.target);
	},

	previous: function() {
		this.items[this.current].detach(this.target);
		this.current--;
		if (this.current == -1) {
			this.current = (this.items.length - 1);
		}
		this.items[this.current].attach(this.target);
	}

});

Slide.Item = Class.extend({

	init: function(_el) {
		this.el = _el || {};
		this._loading = false;
		this._detached = true;
	},

	attach: function(target) {
		this._detached = false;
		this._attach(target);
	},

	_attach: function(target) {
		if (this._detached) {
			return;
		} else if (this._loading) {
			var SLIDE_ITEM = this;
			setTimeout(function() {
				SLIDE_ITEM._attach(target);
			}, 50);
		} else {
			if (Slide.Util.isElement(this.el)) {
				target.appendChild(this.el);
			} else if (typeof this.el === 'string') {
				target.innerHTML = this.el;
			} else {
				target.innerHTML = '';
			}
			this.invalidate(target);
		}
	},

	detach: function(target) {
		this._detached = true;
		target.innerHTML = '';
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
		};
		this.el.src = _src;
		this.el.style.display = 'none';
	},

	invalidate: function(target) {
		this._super(target);

		var size = Slide.Util.constrain(
						this.el.offsetWidth,
						this.el.offsetHeight,
						target.offsetWidth,
						target.offsetHeight);

		this.el.style.width = size.width + 'px';
		this.el.style.height = size.height + 'px';
	}

});

Slide.HTML = Slide.Item;

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

		if ( maxWidth > 0 && currentWidth > 0) {// && $current_width > $max_width ) {
			widthRatio = maxWidth / currentWidth;
			didWidth = true;
		}

		if ( maxHeight > 0 && currentHeight > 0) {// && $current_height > $max_height ) {
			heightRatio = maxHeight / currentHeight;
			didHeight = true;
		}

		// Calculate the larger/smaller ratios
		var smallerRatio = Math.min( widthRatio, heightRatio );
		var largerRatio  = Math.max( widthRatio, heightRatio );

		var ratio = 1.0;
		if ((currentWidth * largerRatio) > maxWidth || (currentHeight * largerRatio) > maxHeight) {
			// The larger ratio is too big. It would result in an overflow.
			ratio = smallerRatio;
		} else {
			// The larger ratio fits, and is likely to be a more "snug" fit.
			ratio = largerRatio;
		}

		var w = currentWidth * ratio;
		var h = currentHeight * ratio;

		// Sometimes, due to rounding, we'll end up with a result like this: 465x700 in a 177x177 box is 117x176... a pixel short
		// We also have issues with recursive calls resulting in an ever-changing result. Constraining to the result of a constraint should yield the original result.
		// Thus we look for dimensions that are one pixel shy of the max value and bump them up
		if (didWidth && (w == maxWidth - 1)) {
			w = maxWidth; // Round it up
		}
		if (didHeight && (h == maxHeight - 1)) {
			h = maxHeight; // Round it up
		}

		return {
			'width': w,
			'height': h
		};
	}

};
