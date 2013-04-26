jQuery Unobtrusive Background Image Switcher
===========

jQuery plugin that switches background images of a website - can be used as an image slider or a full screen background image switcher as well as image preloader.

Infos and Demo http://www.bcat.eu/blog/jquery-unobtrusive-background-image-switcher/

How to use
----------

Use any element as the container for the images and call the plugin from this element as jQuery object. Everything including the array with image urls is passed as an options object.

var srcBgArray = [
  "/path/to/image1.jpg",
  "/path/to/image2.jpg",
  "/path/to/image3.jpg"
];
 
$(document).ready(function() {
  $('#bg-body').bcatBGSwitcher({
    urls: srcBgArray,
    alt: 'Alt text'
  });
});

Full screen functionality is handled entirely by the CSS, so if you want the full screen feature to work, download the whole package and take a look at the bare bones style.css. The CSS part is based on Perfect Full Page Background Image / CSS-Only Technique #2 from css-tricks - http://css-tricks.com/perfect-full-page-background-image/.