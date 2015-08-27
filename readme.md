jQuery Unobtrusive Background Image Switcher
===========

jQuery plugin that switches background images of a website - can be used as an image slider or a full screen background image switcher as well as image preloader.

Infos and Demo http://www.bcat.eu/blog/jquery-unobtrusive-background-image-switcher/

How to use
----------

Use any element as the container for the images and call the plugin from this element as jQuery object. Everything including the array with image urls is passed as an options object.

```javascript
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
```

Starting from version 2.0 an array of objects each with mandatory `src` and optional `alt` properties can be passed and used to generate extra content for each image (also see index_content.html)

```javascript
  var srcBgArray = [
    {
      'src': '/path/to/image1.jpg',
      'alt': 'Image 1',
      'html': '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>'
    },
    {
      'src': '/path/to/image2.jpg',
      'alt': 'Image 2',
      'html': '<p>Donec pede justo, fringilla vel.</p>'
    },
    {
      'src': '/path/to/image3.jpg',
      'alt': 'Image 3',
      'html': '<p>Nullam dictum felis eu pede mollis pretium.</p>'
    }
  ];

  $(document).ready(function() {
    $('#bg-body').bcatBGSwitcher({
      urls: srcBgArray,
      links: true,
      prevnext: true,
      onGenerateEachImage: function ($html, data) {
        var $content = $('<div />');
        $content.addClass("extra-content");
        $content.append(data.html);
        return $html.append($content);
      }
    });
  });
```

Full screen functionality is handled entirely by the CSS, so if you want the full screen feature to work, download the whole package and take a look at the bare bones style.css. The CSS part is based on Perfect Full Page Background Image / CSS-Only Technique #2 from css-tricks - http://css-tricks.com/perfect-full-page-background-image/.