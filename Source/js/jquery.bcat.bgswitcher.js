/**
 * bcat BG Switcher - unobtrusive background image switcher
 * @version 1.4.3
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
                autoplay: true, // change image every [timeout] ms
                timeout: 12000, // time between image changes
                alt: 'Picture', // alt for consistency
                speed: 1000, // animation speed        
                links: false, // generate a link for each image
                prevnext: false, // generate previous and next links
                onFirstImageLoad: function() {
                }, // callback after first image is loaded, "this" variable contains the image element
                onInitComplete: function(options, instance) {
                }, 
                /** 
                 * Callback after init function is done 
                 * 
                 * "this" variable contains plugin element
                 * @param options - plugin options object
                 * @param instance - plugin instance object
                 */                
                onGenerateEachLink: function($link, index, url) {
                }
                /** 
                 * Callback on generation of each navigation link 
                 * 
                 * "this" variable contains plugin instance object
                 * @param $link - jQuery object with the current link
                 * @param index - current urls array index
                 * @param url - the url of the specific image
                 */
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

                // trigger onFirstImageLoad event
                options.onFirstImageLoad.call(this);

                if (options.urls[instance.currentIndex]) {

                    if ((options.links) || (options.prevnext)) {
                        var loaderDiv = $('<div />').attr({
                            'id': element.id + '-loader',
                            'style': 'display: none;'
                        });
                        loaderDiv.appendTo(element);
                    }

                    if (options.links) {
                        that.generateLinks(element, options, instance);
                    }
                    if (options.prevnext) {
                        that.generatePrevNext(element, options, instance);
                    }

                    if (options.autoplay) {
                        that.runSlideShow(element, options, instance);
                    }
                }
                
                // trigger onInitComplete event
                options.onInitComplete.call(element, options, instance);
            });
                        
        },
        runSlideShow: function(element, options, instance) {
            // fix scope
            var that = this;
            // update image periodically
            instance.intervalId = setInterval(function() {
                that.updateImage(element, options, instance);
            }, options.timeout);
        },
        updateImage: function(element, options, instance) {
            // load an image and add it to DOM or show the new one and hide the previous one

            // set index to 0 at the end of array
            if (!options.urls[instance.currentIndex]) {
                instance.currentIndex = 0;
            }

            var nextImage = $('#' + element.id + instance.currentIndex);
            if (nextImage.length) {
                // image found in DOM, changing visibility                
                instance.currentImage.fadeOut(options.speed);
                nextImage.fadeIn(options.speed);
            } else {
                // image was not loaded yet, loading and showing it                
                nextImage = this.preloadImage(element, options, instance.currentIndex);
                this.swapPreloadedImages(instance.currentImage, nextImage, element, options);
            }
            if (options.links) {
                this.setActiveLink(element, options, instance);
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
        swapPreloadedImages: function(currentImage, nextImage, element, options, showLoader) {
            // swap images on load

            if (showLoader) {
                // show loader
                $(element).addClass('loading');
            }

            nextImage.load(function() {
                if (showLoader) {
                    // hide loader
                    $(element).removeClass('loading');
                }
                nextImage.appendTo(element);
                currentImage.fadeOut(options.speed);
                nextImage.fadeIn(options.speed);
            });
        },
        generateLinks: function(element, options, instance) {
            // generate image links on load
            instance.linkParent = $('<div />');
            instance.linkParent.attr({
                'id': element.id + '-navigation',
                'style': 'display: none;'
            });

            // fix scope
            var that = this;

            $.each(options.urls, function(index, value) {
                var link = $('<a />');
                var linkClass = '';
                if (index === options.startIndex) {
                    linkClass = 'active';
                }
                link.attr({
                    'id': element.id + '-link' + index,
                    'href': '#',
                    'class': linkClass
                });
                link.click(function(event) {
                    event.preventDefault();
                    that.switchImageTo(element, options, instance, index);
                });
                // trigger onGenerateEachLink event
                options.onGenerateEachLink.call(instance, link, index, value);
                instance.linkParent.append(link);
            });

            instance.linkParent.appendTo(element);
            instance.linkParent.fadeIn(options.speed);

        },
        generatePrevNext: function(element, options, instance) {
            // generate previous / next links on load
            instance.prevnextParent = $('<div />');
            instance.prevnextParent.attr({
                'id': element.id + '-prevnext-wrapper',
                'style': 'display: none;'
            });

            // fix scope
            var that = this;

            var linkPrevious = $('<a />');
            linkPrevious.attr({
                'id': element.id + '-previous-link',
                'href': '#',
                'class': element.id + '-prevnext-link'
            });
            linkPrevious.click(function(event) {
                event.preventDefault();
                var index = instance.currentIndex - 2;
                // set index to last one at the beginning of array
                if (!options.urls[index]) {
                    index = options.urls.length - 1;
                }
                that.switchImageTo(element, options, instance, index);
            });
            instance.prevnextParent.append(linkPrevious);

            var linkNext = $('<a />');
            linkNext.attr({
                'id': element.id + '-next-link',
                'href': '#',
                'class': element.id + '-prevnext-link'
            });
            linkNext.click(function(event) {
                event.preventDefault();
                var index = instance.currentIndex;
                // set index to last element at the beginning of array
                if (!options.urls[index]) {
                    index = 0;
                }
                that.switchImageTo(element, options, instance, index);
            });
            instance.prevnextParent.append(linkNext);


            instance.prevnextParent.appendTo(element);
            instance.prevnextParent.fadeIn(options.speed);

        },
        switchImageTo: function(element, options, instance, index) {
            // switch to the given image using array index and reset slideshow

            if (!options.urls[index]) {
                console.log('can not switch to a non-existent element');
                return;
            }

            var nextImage = $('#' + element.id + index);

            // prevent action on active image
            if (nextImage.attr('id') !== instance.currentImage.attr('id')) {

                instance.currentIndex = index;

                // stop slide show
                if (options.autoplay) {
                    clearInterval(instance.intervalId);
                }

                if (nextImage.length) {
                    // image found in DOM, changing visibility                
                    instance.currentImage.fadeOut(options.speed);
                    nextImage.fadeIn(options.speed);
                } else {
                    // image was not loaded yet, loading and showing it                
                    nextImage = this.preloadImage(element, options, instance.currentIndex);
                    this.swapPreloadedImages(instance.currentImage, nextImage, element, options, true);
                }

                if (options.links) {
                    this.setActiveLink(element, options, instance);
                }

                instance.currentImage = nextImage;
                instance.currentIndex++;

                // fix scope
                var that = this;
                // run slideshow again
                if (options.autoplay) {
                    instance.intervalId = setInterval(function() {
                        that.updateImage(element, options, instance);
                    }, options.timeout);
                }

            }

        },
        setActiveLink: function(element, options, instance) {
            // set active class to the currently active link
            if (instance.linkParent.length) {
                instance.linkParent.find('a').removeClass('active');
                instance.linkParent.find('a#' + element.id + '-link' + instance.currentIndex).addClass('active');
            }
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