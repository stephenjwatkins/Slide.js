# Slide.js
## JavaScript Slideshow

Slide.js is a simple, lightweight slideshow written in JavaScript. It's focus is on the behavior of the slideshow, not the presentation. This will result in a powerful API for developers/designers to simply and quickly plug into any existing application. At the same time, leaving them with the flexibility of how they want to present the slideshow.

Slide.js is a media-centric slideshow, not a presentation tool. It's focused on being able to easily provide support for different media formats. Although it's a work in progress, Slide.js currently supports images and HTML.

## Features

- Simple
- Lightweight (8 kb minified)
- Extensive API
- Keyboard Navigation
- jQuery Independent
- Presentation Agnostic
- No CSS Required

## Getting Started

### Include Slide.js

	<script src="Slide.min.js" type="text/javascript"></script>

### Create Show Element

This can be any element. All slideshow items will be directly attached to this element.

	<div id="slideshow"></div>

### Construct the Show

	// Grab the target element
	var target = document.getElementById('slideshow');

	// Construct a new slideshow, giving it the target element and options.
	// The target element is where the slideshow will be placed when rendered.
	var slideShow = new Slide.Show(target, options);

### Add Slides

Slide.js supports images and HTML. Items can be added to the slideshow at any time.

	slideShow.addItem([
		new Slide.Image("img/Chrysanthemum.jpg"),
		new Slide.Image("img/Desert.jpg"),
		new Slide.Image("img/Hydrangeas.jpg"),
		new Slide.HTML("<div>Slide</div>"), // HTML string. Needs to contain only one root node.
		new Slide.Image("img/Jellyfish.jpg"),
		new Slide.HTML(document.getElementById('slide')), // HTML element
		new Slide.Image("img/Koala.jpg", 'mammal'), // Give the item a class
		new Slide.Image("img/Lighthouse.jpg", ['landmark', 'america']) // Give the item multiple classes
	]);

Later, at any time, another item can be added.

	slideShow.addItem(new Slide.Image("img/Tulips.jpg");

### Start the Show

Starting the show will attach the first item to the show.

	slideShow.start();

## Options

    var defaults = {
		playbackSpeed: 5000, // Speed in milliseconds to playback items.
		repeat: true,        // Whether or not to allow repeating through the slide cycle
		responsive: true     // Whether or not to make the inner slide item the same size as the target
	};

## Keyboard Navigation

- Left Arrow - Previous Slide
- Right Arrow - Next Slide
- Space Bar - Play / Pause

## API

Slide.js has a very powerful, flexible API that gives the developer full control.

	slideShow.addItem(item | itemArray);  // Add an item or array of items to the slideshow
	slideShow.start(slideNumber);         // Start the slideshow. Optionally, specify a starting slide number (1 - slide count)
	slideShow.stop();                     // Stop the slideshow. Detaches any slide items
	slideShow.play();                     // Play the slideshow. This will cycle through the items
	slideShow.pause();                    // Pause the slideshow
	slideShow.to(slideNumber);            // Go to specificied slide number
	slideShow.first();                    // Go to first slide
	slideShow.last();                     // Go to last slide
	slideShow.next();                     // Go to next slide
	slideShow.previous();                 // Go to previous slide

## Hooks

### Usage

Slide.js allows for a number of slideshow hooks to enable custom functionality at certain slideshow events. To add _any_ hook, use the following code.

	slideShow.on('hook', function(event) {
		// Execute custom code on hook
	});

### Slide hooks

	addItem      // Called when an item is added
	previous     // Called when the previous slide is triggered
	next         // Called when the next slide is triggered
	first        // Called when the first slide is triggered
	last         // Called when the last slide is triggered
	to           // Called when the specified slide is triggered

Slide hooks are passed the following event object.

	event.index  // Slideshow index of the item
	event.item   // Actual slide object in the slideshow

### Slideshow hooks

	start        // Called when the slideshow is started
	stop         // Called when the slideshow is stopped
	play         // Called when the slideshow is played
	pause        // Called when the slideshow is paused

Slideshow hooks are passed _no_ event object.

### Transitional hooks

The following hooks are transitional, meaning that they are intermediate steps for attachment/detachment of slides. Obviously, these are perfect for adding transitions (you can see an example in the fullscreen.html demo).

#### After Attachment/Detachment

	postattach   // Called after a slide is attached
	postdetach   // Called after a slide is detached

Synchronous hooks are passed the following event object.

	event.item   // Actual slide object in the slideshow

#### Before Attachment/Detachment

To operate properly, the preattachment/predetachment hooks are asynchronous. There can only be one of each hook and they must call the detachment/attachment method once they are finished.

	slideShow.on('predetach', function(event) {
		// Perform action
		// When done, call event.detach()
		event.detach();
	});

	slideShow.on('preattach', function(event) {
		// Perform action
		// When done, call event.attach()
		event.attach();
	});

	preattach   // Called before a slide is attached
	predetach   // Called before a slide is detached

Synchronous hooks are passed the following event object.

	event.item               // Actual slide object in the slideshow
	event[.attach | detach]  // Method to actually call attach/detach

## Styling the Slideshow

Styling the slideshow is simple. When items are attached to the slideshow, they are simply put in the target's slideshow element.

### Image

Adding an image would produce the following.

	new Slide.Image("img/Chrysanthemum.jpg")

	<div id="slideshow">
		<img src="img/Chrysanthemum.jpg" />
	</div>

### HTML

Adding HTML would produce the following.

	new Slide.HTML("<div class='test'>This is a test slide.</div>")

	<div id="slideshow">
		<div class='test'>This is a test slide.</div>
	</div>

## Browser Support

Slide.js has been tested to work in IE7+, Chrome, Firefox, Safari, and Opera