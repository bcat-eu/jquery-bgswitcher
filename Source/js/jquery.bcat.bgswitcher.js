/**
 * bcat BG Switcher - unobtrusive background image switcher
 * @version 1.1.0
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
                
        this._defaults = defaults;
        this._name = pluginName;

        this.init(element, options);
    }

    Plugin.prototype = {
        init: function(element, options) {  
            var instance = {};
            instance.currentIndex = options.startIndex;
            instance.currentImage = this.preloadImage(element, options, instance.currentIndex);
            // fix scope
            var that = this;
            // append image on load and start the slide show
            instance.currentImage.load(function() {
                instance.currentImage.appendTo(element);
                instance.currentImage.fadeIn(options.speed);
                instance.currentIndex++;
                if (options.urls[instance.currentIndex]) {
                    that.runSlideShow(element, options, instance);
                }                
            });
        },
        runSlideShow: function(element, options, instance) {
            // fix scope
            var that = this;
            // update image periodically
            setInterval(function() {
                that.updateImage(element, options, instance);
            }, options.timeout);
        },
        updateImage: function(element, options, instance) {
            // load an image and add it to DOM or show the new one and hide the previous one

            // set index to 0 at the end of array
            if (!options.urls[instance.currentIndex]) {
                instance.currentIndex = 0;
            }
                        
            var nextImage = $('#'+ element.id + instance.currentIndex);
            if (nextImage.length) {
                // image found in DOM, changing visibility                
                instance.currentImage.fadeOut(options.speed);
                nextImage.fadeIn(options.speed);
            } else {
                // image was not loaded yet, loading and showing it                
                nextImage = this.preloadImage(element, options, instance.currentIndex);
                this.swapPreloadedImages(instance.currentImage, nextImage, element, options);
            }
            instance.currentImage = nextImage;
            instance.currentIndex++;
        },
        preloadImage: function(element, options, index, style) {
            // preload image and return it as a jQuery object
            if (!style) {
                style = 'display: none;';
            }
                                                
            var img = $('<img />');
            img.attr({
                'id': element.id + index,
                'src': options.urls[index],
                'alt': options.alt,
                'style': style
            });
            return img;
        },
        swapPreloadedImages: function(currentImage, nextImage, element, options) {            
            // swap images on load
            nextImage.load(function() {
                nextImage.appendTo(element);
                currentImage.fadeOut(options.speed);
                nextImage.fadeIn(options.speed);
            });
        }
    };

    // Plugin wrapper preventing against multiple instantiations
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {                
                var localOptions = $.extend({}, defaults, options);                
                $.data(this, "plugin_" + pluginName, new Plugin(this, localOptions));                
                
            }
        });
    };

})(jQuery, window, document);