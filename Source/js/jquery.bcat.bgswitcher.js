/**
 * bcat BG Switcher - unobtrusive background image switcher
 * @version 2.1.0
 * @jQuery version 1.2+
 * @author Yuriy Davats http://www.bcat.eu
 * @copyright Yuriy Davats
 * @modified by Frank Lamozik (LDSign)
 */

;
(function($, window, document, undefined) {

    // Default options
    var pluginName = "bcatBGSwitcher",
            defaults = {
                urls: [], // urls array, should contain at least one image url
                // Instead of strings this array can also contain objects with custom data,
                // in this case each object must contain an src property with image url
                startIndex: 0, // first image loaded
                autoplay: true, // change image every [timeout] ms
                timeout: 12000, // time between image changes
                alt: 'Picture', // alt for consistency
                speed: 1000, // animation speed        
                links: false, // generate a link for each image
                prevnext: false, // generate previous and next links
                fadeFirst: true, // fade in first image
                preserveState: false, // save state to cookie, requires jQuery Cookie Plugin (https://github.com/carhartl/jquery-cookie)
                cookie: 'bcatBGSwitcher', // name of the cookie if state saving is enabled

                // callback after first image is loaded, "this" variable contains the image element
                onFirstImageLoad: function() {
                },

                /**
                 * Callback after init function is done
                 *
                 * "this" variable contains plugin element
                 * @param options - plugin options object
                 * @param instance - plugin instance object
                 */
                onInitComplete: function(options, instance) {
                },
                /**
                 * Callback on generation of each navigation link
                 *
                 * "this" variable contains plugin instance object
                 * @param $link - jQuery object with the current link
                 * @param index - current urls array index
                 * @param url - the url of the specific image
                 */
                onGenerateEachLink: function($link, index, url) {
                },

                /**
                 * Callback on generation of each image
                 * only called if objects instead of strings passed in urls array
                 *
                 * "this" variable contains plugin instance object
                 * @param $html - jQuery object with the generated image html
                 * @param data - data object for the current image (passed in urls array)
                 *
                 * @returns desired custom HTML to show instead of plain image
                 */
                onGenerateEachImage: function($html, data) {
                    return $html;
                },
                /**
                 * Callback to call instead of using standard logic when changing between old and new elements.
                 * Must remain null if default logic to be used.
                 *
                 * JS default "this" variable
                 * @param options - plugin options object
                 * @param $current - jQuery instance for the current element
                 * @param $next - jQuery instance for the current element
                 */
                overrideChangeElement: null,

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
				
            if (options.preserveState && $.cookie == undefined) {
                console.log('Preserve state option requires cookie plugin (https://github.com/carhartl/jquery-cookie)');
                options.preserveState = false;
            }

            if (options.preserveState) {
                if ($.cookie(options.cookie) != undefined) {
                    options.startIndex = $.cookie(options.cookie);
                }
            }
				
            instance.currentIndex = options.startIndex;
            instance.currentImage = this.preloadImage(element, options, instance.currentIndex);
            // fix scope
            var that = this;
            // append image on load and start the slide show

            var domElement = this.getDomElement(instance.currentImage);

            instance.currentImage.img.load(function() {

                domElement.appendTo(element);

                if (options.fadeFirst) {
                    domElement.fadeIn(options.speed);
                } else {
                    domElement.show();
                }

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
                var currentDomElement = this.getDomElement(instance.currentImage);
                this.changeElement(options, currentDomElement, nextImage);
            } else {
                // image was not loaded yet, loading and showing it                
                nextImage = this.preloadImage(element, options, instance.currentIndex);
                this.swapPreloadedImages(instance.currentImage, nextImage, element, options);
            }
            if (options.links) {
                this.setActiveLink(element, options, instance);
            }

            if (options.preserveState) {
                $.cookie(options.cookie, instance.currentIndex);
            }

            instance.currentImage = nextImage;
            instance.currentIndex++;
        },
        preloadImage: function(element, options, index, style) {
            // preload image and return it as a jQuery object
            // optionally process provided data object and generate custom html
            if (!style) {
                style = 'display: none;';
            }

            var imageUrl = options.urls[index], imageAlt = options.alt, html = '';

            if (typeof imageUrl === 'object') {

                var generateCustomHTML = true;

                // overwrite alt variable if alt property passed
                if(imageUrl.alt) {
                    imageAlt = imageUrl.alt;
                }

                // overwrite image url variable
                if(imageUrl.src) {
                    imageUrl = imageUrl.src;
                } else {
                    console.log('Please provide an src property for every object in urls array.');
                    generateCustomHTML = false;
                }
            }

            var img = $('<img />');
            img.attr({
                'id': element.id + index,
                'src': imageUrl,
                'alt': imageAlt,
                'style': style
            });

            if (generateCustomHTML) {
                html = this.processCustomHTML(element, options, index, img);
            }

            return { 'img': img, 'html': html };
        },
        swapPreloadedImages: function(currentImage, nextImage, element, options, showLoader) {

            // swap images on load

            var currentDomElement = this.getDomElement(currentImage);
            var nextDomElement = this.getDomElement(nextImage);
            var that = this;

            if (showLoader) {
                // show loader
                $(element).addClass('loading');
            }

            nextImage.img.load(function() {
                if (showLoader) {
                    // hide loader
                    $(element).removeClass('loading');
                }

                nextDomElement.appendTo(element);
                that.changeElement(options, currentDomElement, nextDomElement);
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
            var currentDomElement = this.getDomElement(instance.currentImage);

            // prevent action on active image
            if (nextImage.attr('id') !== currentDomElement.attr('id')) {

                instance.currentIndex = index;

                // stop slide show
                if (options.autoplay) {
                    clearInterval(instance.intervalId);
                }

                if (nextImage.length) {
                    // image found in DOM, changing visibility
                    this.changeElement(options, currentDomElement, nextImage);
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
        },
        processCustomHTML: function(element, options, index, img) {

            var html = $('<div />'),
                data = options.urls[index];

            // swap id for image and parent html element for other methods to use it
            html.attr('id', img.attr('id'));
            img.attr('id', element.id + "-image-" + index);

            // move default inline styles as well
            html.attr('style', img.attr('style'));
            img.removeAttr('style');

            // add a class to the container element
            html.addClass(element.id + "-html");

            html.append(img);

            html = options.onGenerateEachImage.call(this, html, data);

            return html;
        },
        changeElement: function(options, current, next) {

            // switch from current element to the next one

            if(options.overrideChangeElement === null) {
                current.fadeOut(options.speed);
                next.fadeIn(options.speed);
                return;
            }

            // there is an overrideChangeElement - trigger the callback
            options.overrideChangeElement(options, current, next);

        },
        getDomElement: function(imageObject) {

            // get dom element for the current image instance with fallback for BC
            // needed to isolate consistency issues between image only and custom html states

            if (imageObject instanceof jQuery) {
                // fallback to existing dom element found by id
                return imageObject;
            }

            // check for preloaded images attributes
            var returnObject = (imageObject.html.length) ? imageObject.html : imageObject.img;

            return returnObject;
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
