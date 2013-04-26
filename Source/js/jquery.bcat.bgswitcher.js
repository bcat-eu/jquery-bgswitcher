/**
 * bcat BG Switcher - unobtrusive background image switcher
 * @version 1.0.0
 * @jQuery version 1.2+
 * @author Yuriy Davats http://www.bcat.eu
 * @copyright Yuriy Davats
 */

;
(function($, window, document, undefined) {

    // Default options
    var pluginName = "bcatBGSwitcher",
            defaults = {
        urls: [], // urls array, should contain at least one image url       
        startIndex: 0, // first image loaded
        timeout: 12000, // time between image changes
        alt: 'Picture', // alt for consistency
        speed: 1000 // animation speed        
    };

    // Plugin constructor
    function Plugin(element, options) {
        this.element = element;

        // set default options
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function() {
            this.currentIndex = this.options.startIndex;
            this.currentImage = this.preloadImage(this.options, this.currentIndex);
            // fix scope
            var that = this;
            // append image on load and start the slide show
            this.currentImage.load(function() {
                that.currentImage.appendTo(that.element);
                that.currentImage.fadeIn(that.options.speed);
                that.currentIndex++;
                if (that.options.urls[that.currentIndex]) {
                    that.runSlideShow();
                }                
            });
        },
        runSlideShow: function() {
            // fix scope
            var that = this;
            // update image periodically
            setInterval(function() {
                that.updateImage();
            }, this.options.timeout);
        },
        updateImage: function() {
            // load an image and add it to DOM or show the new one and hide the previous one

            // set index to 0 at the end of array
            if (!this.options.urls[this.currentIndex]) {
                this.currentIndex = 0;
            }
            var nextImage = $('#bg-image-' + this.currentIndex);
            if (nextImage.length) {
                // image found in DOM, changing visibility                
                this.currentImage.fadeOut(this.options.speed);
                nextImage.fadeIn(this.options.speed);
            } else {
                // image was not loaded yet, loading and showing it                
                nextImage = this.preloadImage(this.options, this.currentIndex);
                this.swapPreloadedImages(this.currentImage, nextImage);
            }
            this.currentImage = nextImage;
            this.currentIndex++;
        },
        preloadImage: function(options, index, style) {
            // preload image and return it as a jQuery object
            if (!style) {
                style = 'display: none;';
            }
            var img = $('<img />');
            img.attr({
                'id': 'bg-image-' + index,
                'src': options.urls[index],
                'alt': options.alt,
                'style': style
            });
            return img;
        },
        swapPreloadedImages: function(currentImage, nextImage) {
            // fix scope
            var that = this;
            // swap images on load
            nextImage.load(function() {
                nextImage.appendTo(that.element);
                currentImage.fadeOut(that.options.speed);
                nextImage.fadeIn(that.options.speed);
            });
        }
    };

    // Plugin wrapper preventing against multiple instantiations
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);