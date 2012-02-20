# Slide.js
## Slideshow written in JavaScript.

_Important: This project has just started. It is very much a work in progress._

Slide.js is a simple, lightweight slideshow written in JavaScript. It's focus is on the behavior of the slideshow, not the presentation. This will result in a powerful API for developers/designers to simply and quickly plug into any existing application. At the same time, leaving them with the flexibility of how they want to present the slideshow.

Slide.js will support image and video format.

__Slide.js does not require jQuery.__

## Using Slide.js

	var target = document.getElementById('slideshow');

	// Construct a new slideshow, giving it the element to place the slideshow in when initialized.
	var slideShow = new Slide.Show(target);

	// Add items to the slideshow. These can be added at any time and changes will be seen immediately.
	slideShow.addItems([
		"img/Chrysanthemum.jpg",
		"img/Desert.jpg",
		"img/Hydrangeas.jpg",
		"img/Jellyfish.jpg",
		"img/Koala.jpg",
		"img/Lighthouse.jpg"
	]);

	// Initialize the slideshow. This method will actually render the slideshow, displaying the first image.
	// On purpose, there is a separation for constructing and rendering the slideshow.
	slideShow.initialize();

	// Hooks for previous/next slideshow items
	var previous = document.getElementById('previous');
	var next = document.getElementById('next');

	Slide.Util.addEventListener(previous, 'click', function() {
		slideShow.previous();
		return false;
	});

	Slide.Util.addEventListener(next, 'click', function() {
		slideShow.next();
		return false;
	});