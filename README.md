# Slide.js
## Slideshow written in JavaScript.

_Important: This project has just started. It is very much a work in progress._

Slide.js is a simple, lightweight slideshow written in JavaScript. It's focus is on the behavior of the slideshow, not the presentation. This will result in a powerful API for developers/designers to simply and quickly plug into any existing application. At the same time, leaving them with the flexibility of how they want to present the slideshow.

Slide.js will support image and video format.

__Slide.js does not require jQuery.__

## Using Slide.js

### Include Slide.js

	<script src="Slide.js" type="text/javascript"></script>

### Create Slideshow element

This can be any element. All slideshow items will be appended to this element.

	<div id="slideshow"></div>

### Construct a new slideshow

	// Grab the target element
	var target = document.getElementById('slideshow');

	// Construct a new slideshow, giving it the target element.
	// The target element is where the slideshow will be placed when rendered.
	var slideShow = new Slide.Show(target);

### Add items

Currently, Slide.js only supports images. Items can be added at any time during the phase of the slideshow.

	slideShow.addItems([
		"img/Chrysanthemum.jpg",
		"img/Desert.jpg",
		"img/Hydrangeas.jpg",
		"img/Jellyfish.jpg",
		"img/Koala.jpg",
		"img/Lighthouse.jpg"
	]);

### Render the slideshow

It's important to render the slideshow after constructing the slideshow. This gives the developer flexibility in adding images and performing other manipulations before displaying the slideshow.

	slideShow.render();

### Slideshow hooks

Hook into Slide.js methods to control the slideshow. Currently, Slide.js supports previous and next.

	var previous = document.getElementById('previous');
	var next = document.getElementById('next');

	Slide.Util.addEventListener(previous, 'click', function() {
		slideShow.previous();
	});

	Slide.Util.addEventListener(next, 'click', function() {
		slideShow.next();
	});