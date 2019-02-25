window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(
      function(index, container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  }
});

window.slate = window.slate || {};

/**
 * iFrames
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace iframes
 */

slate.rte = {
  wrapTable: function() {
    $('.rte table').wrap('<div class="rte__table-wrapper"></div>');
  },

  iframeReset: function() {
    var $iframeVideo = $('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
    var $iframeReset = $iframeVideo.add('.rte iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="video-wrapper"></div>');
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

window.slate = window.slate || {};

/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element.first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).off('focusin');

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    if(src.indexOf('@') != -1){
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)?\@\d{1,2}x|\d{1,4}x\d{0,4}?@\d{1,2}x|x\d{1,4}?\@\d{1,2}x)[_\.@]/);
    }else{
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
    }
    if (match !== null) {
      return match[1];
    } else {
      return null;
    }
  }
  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size == null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match != null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function() {
  var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision || 2;
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();
    this.template = this.originalSelectorId.replace('#ProductSelect-','');

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = _.assignIn({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {

      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      if($('.color_sw.selected .swatch').length != 0){
        var firstVariantImage = $('.color_sw.selected .swatch').css( 'background-image' ).replace('_small_crop_center','').replace(/(url\(|\)|'|")/gi, '');
      }
      var variantImage = variant.featured_image || {};
      var currentVariantImage = $('.product-single__photos-'+this.template + '.SlickPhotoswipGallery .slick-current').attr('data-src') || {};
      if (!variant.featured_image && firstVariantImage == undefined || variantImage.src === currentVariantImage && firstVariantImage == undefined) {
        return;
      }
      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
      
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }
      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant sku changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantSKUChange
     */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }

      this.$container.trigger({
        type: 'variantSKUChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);
    }
  });

  return Variants;
})();


/* ================ GLOBAL ================ */

window.theme = theme || {}; 

theme.getScrollbarWidth = (function(){
  var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
      $outer = jQuery('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
      inner = $inner[0],
      outer = $outer[0];
  $('body').append(outer);
  var width1 = inner.offsetWidth;
  $outer.css('overflow', 'scroll');
  var width2 = outer.clientWidth;
  $outer.remove();
  return (width1 - width2);
});

/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.MenuReposive = (function() {
  var selectors = {
    body: 'body',
    navigation: '#AccessibleNav',
    siteNavHasDropdown: '.site-nav--has-dropdown',
    siteNavChildLinks: '.site-nav__child-link',
    siteNavActiveDropdown: '.show-submenu',
    siteNavLinkMain: '.site-nav__link--main'
  };

  var config = {
    activeClass: 'show-submenu',
    childLinkClass: 'site-nav__child-link'
  };
  
  function is_mobile(){
    var isMobile = (Modernizr.touch) ? true : false;
    return isMobile;
  }
  function init(){
    if(Modernizr.touch === true){
      $('.boutique-nav').addClass('isMobile').removeClass('notMobile');
      $(document).on('click', '.boutique-nav '+selectors.siteNavHasDropdown+' .expand', function(e){
        var licurrent = $(this).closest('li');
        var liItem = $('.boutique-nav '+selectors.siteNavHasDropdown);
        if ( !licurrent.hasClass(config.activeClass) ) {
          liItem.removeClass(config.activeClass);
          licurrent.parents().each(function (){
            if($(this).hasClass(selectors.siteNavHasDropdown)){
              $(this).addClass(config.activeClass);            }
            if($(this).hasClass('main-menu')){
              return false;
            }
          })
          licurrent.addClass(config.activeClass);
          // Close all child submenu if parent submenu is closed
          if ( !licurrent.hasClass(config.activeClass) ) {
            licurrent.find('li').removeClass(config.activeClass);
          }
          return false;
          e.preventDefault();
        }else{
          var href = $(this).attr('href');
          if ( $.trim( href ) == '' || $.trim( href ) == '#' ) {
            licurrent.toggleClass(config.activeClass);
          }
          else{
            window.location = href;
          } 
        }
        // Close all child submenu if parent submenu is closed
        if ( !licurrent.hasClass(config.activeClass) ) {
          licurrent.find('li').removeClass('show-submenu');
        }
        e.stopPropagation();
      });
      $(document).on('click', function(e){
        var target = $( e.target );
        if ( !target.closest(config.activeClass).length || !target.closest('.boutique-nav').length ) {
          $('.'+config.activeClass).removeClass(config.activeClass);
        }
      }); 
      // On Desktop
    }else{
      $('.boutique-nav').removeClass('isMobile').addClass('notMobile');
      $(document).on('mouseenter','.boutique-nav '+selectors.siteNavHasDropdown,function(){
        if($(this).hasClass(config.activeClass) == false ){$(this).addClass(config.activeClass);}
      })
      $(document).on('mouseleave','.boutique-nav '+selectors.siteNavHasDropdown,function(){
        if($(this).hasClass(config.activeClass)){$(this).removeClass(config.activeClass);}
      })
    }
  }
  
  function unload() {
    $(window).off(selectors.siteNavHasDropdown+' a');
    $(selectors.siteNavHasDropdown).off(selectors.siteNavHasDropdown+' a');
    $(selectors.body).off(selectors.siteNavHasDropdown+' a');
  }
  
  /* ---------------------------------------------
   Height Full
   --------------------------------------------- */
  function js_height_full(){
    var height = $(window).outerHeight();
    $(".full-height").css("height",height);
  }
  function js_width_full(){
    var width = $(window).outerWidth();
    $(".full-width").css("width",width);
  }

  /* ---------------------------------------------
   POSITION SIDEBAR FOOTER
   --------------------------------------------- */
  function heightheader_categoy_menu(){
    var height2 = $('.header-categoy-menu').outerHeight(),
        height1 = (height2 -140);
    $('.header-categoy-menu .inner').css('height',height1+'px');
  }

  /* ---------------------------------------------
   POSITION SIDEBAR FOOTER
   --------------------------------------------- */
  function positionFootersidebar(){
    var height2 = $('.header.sidebar').outerHeight(),
        height1 = (height2 - 45);
    $('.header.sidebar .sidebar-menu').css('height',height1+'px');
  }

  function clone_main_menu(){
    if( $('.clone-main-menu').length > 0 && $('#box-mobile-menu').length >0){
      $( ".clone-main-menu" ).clone().appendTo( "#box-mobile-menu .box-inner" );
    }
  }
  function clone_header_ontop(){
    var width = $(window).width();
    if(width > 991){
      if( $('#header').length > 0 && $('#header-ontop').length > 0 && $('#header-ontop').hasClass('is-sticky') && $('#header-ontop .header').length <= 0){
        var content = $( "#header" ).clone();
        content.removeAttr('id');
        content.appendTo( "#header-ontop" );
      }
      setTimeout(function(){
        $('.megaMaxscroll').each(function(){
          $(this).mThumbnailScroller({
            axis:"y", //change to "y" for vertical scroller
            type:"hover-precise"
          });
        });
      },500);
    }else if($('.megaMaxscroll').hasClass('mThumbnailScroller')){
      $('.megaMaxscroll').each(function(){
        $(this).mThumbnailScroller("destroy");
      });
    }
  }
  return {
    init: init,
    is_mobile: is_mobile,
    js_height_full: js_height_full,
    js_width_full: js_width_full,
    heightheader_categoy_menu: heightheader_categoy_menu,
    positionFootersidebar: positionFootersidebar,
    clone_main_menu: clone_main_menu,
    clone_header_ontop: clone_header_ontop,
    unload: unload
  };
})();

window.theme = window.theme || {};

theme.StickMenu = (function() {
  var selectors = {
    headerId: '#header',
    headerClassProp: '.header',
    mainMenu: '.main-menu',
    stickyHeaderTop: '#header-ontop'
  };
  var stickyHeaderTop =0;
  if( $(selectors.headerClassProp+' '+selectors.mainMenu).length > 0){
    stickyHeaderTop = $(selectors.headerClassProp+' '+selectors.mainMenu).offset().top;
  }
  if (Modernizr.touch){stickyHeaderTop == 0}
  function init(){
    if($(selectors.headerId+' '+selectors.mainMenu).length >0){
      var h = $(window).scrollTop();
      var width = $(window).width();
      if(width > 991){
        if((h > stickyHeaderTop) ){
          $(selectors.stickyHeaderTop).addClass('on-sticky');
          $(selectors.stickyHeaderTop).find(selectors.headerClassProp).addClass('ontop');
          setTimeout(function(){
            if($('#header-ontop.on-sticky').length > 0 && $('#header-ontop .ResizedNavMegaScroll').length <= 0){
              theme.ResizeNavMega.init('scroll');
            }
          },200);
        }else{
          $(selectors.stickyHeaderTop).removeClass('on-sticky');
          $(selectors.stickyHeaderTop).find(selectors.headerClassProp).removeClass('ontop');
        }
      }else{
        $(selectors.stickyHeaderTop).find(selectors.headerClassProp).removeClass('ontop');
        $(selectors.stickyHeaderTop).removeClass('on-sticky');
      }
    }
  }
  return {
    init: init
  };
})(jQuery);

window.theme = window.theme || {};

theme.ResizeNavMega = (function() {
  var selectors = {
    headerIsVisible: '#header .main-menu-wapper',
    itemMega: '.main-menu .item-megamenu',
    contentItemMega: '.megamenu'
  };
  function init(scroll){
    var window_size = jQuery('body').innerWidth();
    window_size += theme.getScrollbarWidth();
    if(scroll !== undefined && scroll === 'scroll'){
      selectors.headerIsVisible = '#header-ontop .main-menu-wapper';
      $('#header-ontop .main-menu-wapper').addClass('ResizedNavMegaScroll')
    }
    if( window_size > 767 ){
      if( $(selectors.headerIsVisible).length >0){
        var container = $(selectors.headerIsVisible);
        if( container!= 'undefined'){
          var container_width = 0;
          container_width = container.innerWidth();
          var container_offset = container.offset();
          setTimeout(function(){
            $(selectors.headerIsVisible+' '+selectors.itemMega).each(function(index,element){
              $(element).children(selectors.contentItemMega).css({'max-width':container_width+'px'});
              var sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
              var item_width = $(element).outerWidth();
              $(element).children(selectors.contentItemMega).css({'left':'-'+(sub_menu_width/2 - item_width/2)+'px'});
              var container_left = container_offset.left;
              var container_right = (container_left + container_width);
              var item_left = $(element).offset().left;
              var overflow_left = (sub_menu_width/2 > (item_left - container_left));
              var overflow_right = ((sub_menu_width/2 + item_left) > container_right);
              if( overflow_left ){
                var left = (item_left - container_left);
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
              if( overflow_right && !overflow_left ){
                var left = (item_left - container_left);
                left = left - ( container_width - sub_menu_width );
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
            })
          },100);
        }
      }
    }
  }
  
  return {
    init: init
  };
})(jQuery);

window.theme = window.theme || {};

theme.DropdownReposive = (function() {
  function init(window,item,box){
    var selectors = {
      headerIsVisibleDesktop: '.kiti-DropWindowDesktop',
      headerIsVisible: window,
      itemMega: item,
      contentItemMega: box
    };
    var window_size = jQuery('body').innerWidth();
    window_size += theme.getScrollbarWidth();
    if(theme.MenuReposive.is_mobile() === true){
      $(selectors.itemMega).addClass('kiti-DropisMobile').removeClass('kiti-DropisDesktop');
    }
    else{
      $(selectors.itemMega).addClass('kiti-DropisDesktop').removeClass('kiti-DropisMobile');
    }
    if( window_size <= 480 || $(selectors.headerIsVisible).innerWidth() <= 480 ){
      if( $(selectors.headerIsVisible).length >0){
        var container = $(selectors.headerIsVisible);
        if( container!= 'undefined'){
          var container_width = 0;
          container_width = container.innerWidth();
          var container_offset = container.offset();
          setTimeout(function(){
            $(selectors.itemMega).each(function(index,element){
              $(element).children(selectors.contentItemMega).css({'max-width':container_width+'px'});
              var sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
              var item_width = $(element).outerWidth();
              $(element).children(selectors.contentItemMega).css({'left':'-'+(sub_menu_width/2 - item_width/2)+'px'});
              var container_left = container_offset.left;
              var container_right = (container_left + container_width);
              var item_left = $(element).offset().left;
              var overflow_left = (sub_menu_width/2 > (item_left - container_left));
              var overflow_right = ((sub_menu_width/2 + item_left) > container_right);
              if( overflow_left ){
                var left = (item_left - container_left);
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
              if( overflow_right && !overflow_left ){
                var left = (item_left - container_left);
                left = left - ( container_width - sub_menu_width );
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
            })
          },100);
        }
      }
    }
    else{
      $(selectors.contentItemMega).css({'max-width':window_size+'px','left':'auto'});
      if( $(selectors.headerIsVisibleDesktop).length >0){
          setTimeout(function(){
            $(selectors.itemMega).each(function(index,element){
              var container = $(element).closest(selectors.headerIsVisibleDesktop);
              var container_width = 0;
              container_width = container.innerWidth() < 350 ? 350 : container.innerWidth();
              var container_offset = container.offset();
              $(element).children(selectors.contentItemMega).css({'max-width':container_width+'px'});
              var sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
              var item_width = $(element).outerWidth();
              $(element).children(selectors.contentItemMega).css({'left':'-'+(sub_menu_width/2 - item_width/2)+'px'});
              var container_left = container.innerWidth() < 350 ? container_offset.left - 350 + container.innerWidth() : container_offset.left;
              var container_right = (container_left + container_width);
              var item_left = $(element).offset().left;
              var overflow_left = (sub_menu_width/2 > (item_left - container_left));
              var overflow_right = ((sub_menu_width/2 + item_left) > container_right);
              if( overflow_left ){
                var left = (item_left - container_left);
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
              if( overflow_right && !overflow_left ){
                var left = (item_left - container_left);
                left = left - ( container_width - sub_menu_width );
                $(element).children(selectors.contentItemMega).css({'left':-left+'px'});
              }
            })
          },100);
      }
    }
  }
  return {
    init: init
  };
})();

(function() {
  var selectors = {
    backButton: '.return-link'
  };

  var $backButton = $(selectors.backButton);

  if (!document.referrer || !$backButton.length || !window.history.length) {
    return;
  }

  $backButton.one('click', function(evt) {
    evt.preventDefault();

    var referrerDomain = urlDomain(document.referrer);
    var shopDomain = urlDomain(window.location.href);

    if (shopDomain === referrerDomain) {
      history.back();
    }

    return false;
  });

  function urlDomain(url) {
    var anchor = document.createElement('a');
    anchor.ref = url;

    return anchor.hostname;
  }
})();


theme.Slideshow = (function() {
  this.$slideshow = null;
  var classes = {
    wrapper: 'slideshow-wrapper',
    slideshow: 'slideshow',
    currentSlide: 'slick-current',
    video: 'slideshow__video',
    videoBackground: 'slideshow__video--background',
    closeVideoBtn: 'slideshow__video-control--close',
    pauseButton: 'slideshow__pause',
    isPaused: 'is-paused'
  };

  function slideshow(el) {
    this.$slideshow = $(el);
    this.$wrapper = this.$slideshow.closest('.' + classes.wrapper);
    this.$pause = this.$wrapper.find('.' + classes.pauseButton);

    this.settings = {
      accessibility: true,
      arrows: true,
      dots: true,
      fade: true,
      draggable: true,
      touchThreshold: 20,
      autoplay: this.$slideshow.data('autoplay'),
      autoplaySpeed: this.$slideshow.data('speed')
    };

    this.$slideshow.on('beforeChange', beforeChange.bind(this));
    this.$slideshow.on('init', slideshowA11y.bind(this));
    this.$slideshow.slick(this.settings);

    this.$pause.on('click', this.togglePause.bind(this));
  }

  function slideshowA11y(event, obj) {
    var $slider = obj.$slider;
    var $list = obj.$list;
    var $wrapper = this.$wrapper;
    var autoplay = this.settings.autoplay;

    // Remove default Slick aria-live attr until slider is focused
    $list.removeAttr('aria-live');

    // When an element in the slider is focused
    // pause slideshow and set aria-live.
    $wrapper.on('focusin', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.attr('aria-live', 'polite');

      if (autoplay) {
        $slider.slick('slickPause');
      }
    });

    // Resume autoplay
    $wrapper.on('focusout', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.removeAttr('aria-live');

      if (autoplay) {
        // Manual check if the focused element was the video close button
        // to ensure autoplay does not resume when focus goes inside YouTube iframe
        if ($(evt.target).hasClass(classes.closeVideoBtn)) {
          return;
        }

        $slider.slick('slickPlay');
      }
    });

    // Add arrow key support when focused
    if (obj.$dots) {
      obj.$dots.on('keydown', function(evt) {
        if (evt.which === 37) {
          $slider.slick('slickPrev');
        }

        if (evt.which === 39) {
          $slider.slick('slickNext');
        }

        // Update focus on newly selected tab
        if ((evt.which === 37) || (evt.which === 39)) {
          obj.$dots.find('.slick-active button').focus();
        }
      });
    }
  }

  function beforeChange(event, slick, currentSlide, nextSlide) {
    var $slider = slick.$slider;
    var $currentSlide = $slider.find('.' + classes.currentSlide);
    var $nextSlide = $slider.find('.slideshow__slide[data-slick-index="' + nextSlide + '"]');

    if (isVideoInSlide($currentSlide)) {
      var $currentVideo = $currentSlide.find('.' + classes.video);
      var currentVideoId = $currentVideo.attr('id');
      theme.SlideshowVideo.pauseVideo(currentVideoId);
      $currentVideo.attr('tabindex', '-1');
    }

    if (isVideoInSlide($nextSlide)) {
      var $video = $nextSlide.find('.' + classes.video);
      var videoId = $video.attr('id');
      var isBackground = $video.hasClass(classes.videoBackground);
      if (isBackground) {
        theme.SlideshowVideo.playVideo(videoId);
      } else {
        $video.attr('tabindex', '0');
      }
    }
  }

  function isVideoInSlide($slide) {
    return $slide.find('.' + classes.video).length;
  }

  slideshow.prototype.togglePause = function() {
    var slideshowSelector = getSlideshowId(this.$pause);
    if (this.$pause.hasClass(classes.isPaused)) {
      this.$pause.removeClass(classes.isPaused);
      $(slideshowSelector).slick('slickPlay');
    } else {
      this.$pause.addClass(classes.isPaused);
      $(slideshowSelector).slick('slickPause');
    }
  };

  function getSlideshowId($el) {
    return '#Slideshow-' + $el.data('id');
  }

  return slideshow;
})();

// Youtube API callback
// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  theme.SlideshowVideo.loadVideos();
}

theme.SlideshowVideo = (function() {
  var autoplayCheckComplete = false;
  var autoplayAvailable = false;
  var playOnClickChecked = false;
  var playOnClick = false;
  var youtubeLoaded = false;
  var videos = {};
  var videoPlayers = [];
  var videoOptions = {
    ratio: 16 / 9,
    playerVars: {
      // eslint-disable-next-line camelcase
      iv_load_policy: 3,
      modestbranding: 1,
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      wmode: 'opaque',
      branding: 0,
      autohide: 0,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerChange
    }
  };
  var classes = {
    playing: 'video-is-playing',
    paused: 'video-is-paused',
    loading: 'video-is-loading',
    loaded: 'video-is-loaded',
    slideshowWrapper: 'slideshow-wrapper',
    slide: 'slideshow__slide',
    slideBackgroundVideo: 'slideshow__slide--background-video',
    slideDots: 'slick-dots',
    videoChrome: 'slideshow__video--chrome',
    videoBackground: 'slideshow__video--background',
    playVideoBtn: 'slideshow__video-control--play',
    closeVideoBtn: 'slideshow__video-control--close',
    currentSlide: 'slick-current',
    slickClone: 'slick-cloned',
    supportsAutoplay: 'autoplay',
    supportsNoAutoplay: 'no-autoplay'
  };

  /**
    * Public functions
   */
  function init($video) {
    if (!$video.length) {
      return;
    }

    videos[$video.attr('id')] = {
      id: $video.attr('id'),
      videoId: $video.data('id'),
      type: $video.data('type'),
      status: $video.data('type') === 'chrome' ? 'closed' : 'background', // closed, open, background
      videoSelector: $video.attr('id'),
      $parentSlide: $video.closest('.' + classes.slide),
      $parentSlideshowWrapper: $video.closest('.' + classes.slideshowWrapper),
      controls: $video.data('type') === 'background' ? 0 : 1,
      slideshow: $video.data('slideshow')
    };

    if (!youtubeLoaded) {
      // This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function customPlayVideo(playerId) {
    // Do not autoplay just because the slideshow asked you to.
    // If the slideshow asks to play a video, make sure
    // we have done the playOnClick check first
    if (!playOnClickChecked && !playOnClick) {
      return;
    }

    if (playerId && typeof videoPlayers[playerId].playVideo === 'function') {
      privatePlayVideo(playerId);
    }
  }

  function pauseVideo(playerId) {
    if (videoPlayers[playerId] && typeof videoPlayers[playerId].pauseVideo === 'function') {
      videoPlayers[playerId].pauseVideo();
    }
  }

  function loadVideos() {
    for (var key in videos) {
      if (videos.hasOwnProperty(key)) {
        var args = $.extend({}, videoOptions, videos[key]);
        args.playerVars.controls = args.controls;
        videoPlayers[key] = new YT.Player(key, args);
      }
    }

    initEvents();
    youtubeLoaded = true;
  }

  function loadVideo(key) {
    if (!youtubeLoaded) {
      return;
    }
    var args = $.extend({}, videoOptions, videos[key]);
    args.playerVars.controls = args.controls;
    videoPlayers[key] = new YT.Player(key, args);

    initEvents();
  }

  /**
    * Private functions
   */

  function privatePlayVideo(id, clicked) {
    var videoData = videos[id];
    var player = videoPlayers[id];
    var $slide = videos[id].$parentSlide;

    if (playOnClick) {
      // playOnClick means we are probably on mobile (no autoplay).
      // setAsPlaying will show the iframe, requiring another click
      // to play the video.
      setAsPlaying(videoData);
    } else if (clicked || (autoplayCheckComplete && autoplayAvailable)) {
      // Play if autoplay is available or clicked to play
      $slide.removeClass(classes.loading);
      setAsPlaying(videoData);
      player.playVideo();
      return;
    }

    // Check for autoplay if not already done
    if (!autoplayCheckComplete) {
      autoplayCheckFunction(player, $slide);
    }
  }

  function setAutoplaySupport(supported) {
    var supportClass = supported ? classes.supportsAutoplay : classes.supportsNoAutoplay;
    $(document.documentElement).addClass(supportClass);

    if (!supported) {
      playOnClick = true;
    }

    autoplayCheckComplete = true;
  }

  function autoplayCheckFunction(player, $slide) {
    // attempt to play video
    player.playVideo();

    autoplayTest(player)
      .then(function() {
        setAutoplaySupport(true);
      })
      .fail(function() {
        // No autoplay available (or took too long to start playing).
        // Show fallback image. Stop video for safety.
        setAutoplaySupport(false);
        player.stopVideo();
      })
      .always(function() {
        autoplayCheckComplete = true;
        $slide.removeClass(classes.loading);
      });
  }

  function autoplayTest(player) {
    var deferred = $.Deferred();
    var wait;
    var timeout;

    wait = setInterval(function() {
      if (player.getCurrentTime() <= 0) {
        return;
      }

      autoplayAvailable = true;
      clearInterval(wait);
      clearTimeout(timeout);
      deferred.resolve();
    }, 500);

    timeout = setTimeout(function() {
      clearInterval(wait);
      deferred.reject();
    }, 4000); // subjective. test up to 8 times over 4 seconds

    return deferred;
  }

  function playOnClickCheck() {
    // Bail early for a few instances:
    // - small screen
    // - device sniff mobile browser

    if (playOnClickChecked) {
      return;
    }

    if ($(window).width() < 750) {
      playOnClick = true;
    } else if (theme.MenuReposive.is_mobile()) {
      playOnClick = true;
    }

    if (playOnClick) {
      // No need to also do the autoplay check
      setAutoplaySupport(false);
    }

    playOnClickChecked = true;
  }

  // The API will call this function when each video player is ready
  function onPlayerReady(evt) {
    evt.target.setPlaybackQuality('hd1080');
    var videoData = getVideoOptions(evt);

    playOnClickCheck();

    // Prevent tabbing through YouTube player controls until visible
    $('#' + videoData.id).attr('tabindex', '-1');

    sizeBackgroundVideos();

    // Customize based on options from the video ID
    switch (videoData.type) {
      case 'background-chrome':
      case 'background':
        evt.target.mute();
        // Only play the video if it is in the active slide
        if (videoData.$parentSlide.hasClass(classes.currentSlide)) {
          privatePlayVideo(videoData.id);
        }
        break;
    }

    videoData.$parentSlide.addClass(classes.loaded);
  }

  function onPlayerChange(evt) {
    var videoData = getVideoOptions(evt);

    switch (evt.data) {
      case 0: // ended
        setAsFinished(videoData);
        break;
      case 1: // playing
        setAsPlaying(videoData);
        break;
      case 2: // paused
        setAsPaused(videoData);
        break;
    }
  }

  function setAsFinished(videoData) {
    switch (videoData.type) {
      case 'background':
        videoPlayers[videoData.id].seekTo(0);
        break;
      case 'background-chrome':
        videoPlayers[videoData.id].seekTo(0);
        closeVideo(videoData.id);
        break;
      case 'chrome':
        closeVideo(videoData.id);
        break;
    }
  }

  function setAsPlaying(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    $slide.removeClass(classes.loading);

    // Do not change element visibility if it is a background video
    if (videoData.status === 'background') {
      return;
    }

    $('#' + videoData.id).attr('tabindex', '0');

    switch (videoData.type) {
      case 'chrome':
      case 'background-chrome':
        $slideshow
          .removeClass(classes.paused)
          .addClass(classes.playing);
        $slide
          .removeClass(classes.paused)
          .addClass(classes.playing);
        break;
    }

    // Update focus to the close button so we stay within the slide
    $slide.find('.' + classes.closeVideoBtn).focus();
  }

  function setAsPaused(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    if (videoData.type === 'background-chrome') {
      closeVideo(videoData.id);
      return;
    }

    // YT's events fire after our click event. This status flag ensures
    // we don't interact with a closed or background video.
    if (videoData.status !== 'closed' && videoData.type !== 'background') {
      $slideshow.addClass(classes.paused);
      $slide.addClass(classes.paused);
    }

    if (videoData.type === 'chrome' && videoData.status === 'closed') {
      $slideshow.removeClass(classes.paused);
      $slide.removeClass(classes.paused);
    }

    $slideshow.removeClass(classes.playing);
    $slide.removeClass(classes.playing);
  }

  function closeVideo(playerId) {
    var videoData = videos[playerId];
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;
    var classesToRemove = [classes.pause, classes.playing].join(' ');

    $('#' + videoData.id).attr('tabindex', '-1');

    videoData.status = 'closed';

    switch (videoData.type) {
      case 'background-chrome':
        videoPlayers[playerId].mute();
        setBackgroundVideo(playerId);
        break;
      case 'chrome':
        videoPlayers[playerId].stopVideo();
        setAsPaused(videoData); // in case the video is already paused
        break;
    }

    $slideshow.removeClass(classesToRemove);
    $slide.removeClass(classesToRemove);
  }

  function getVideoOptions(evt) {
    return videos[evt.target.h.id];
  }

  function startVideoOnClick(playerId) {
    var videoData = videos[playerId];
    // add loading class to slide
    videoData.$parentSlide.addClass(classes.loading);

    videoData.status = 'open';

    switch (videoData.type) {
      case 'background-chrome':
        unsetBackgroundVideo(playerId, videoData);
        videoPlayers[playerId].unMute();
        privatePlayVideo(playerId, true);
        break;
      case 'chrome':
        privatePlayVideo(playerId, true);
        break;
    }

    // esc to close video player
    $(document).on('keydown.videoPlayer', function(evt) {
      if (evt.keyCode === 27) {
        closeVideo(playerId);
      }
    });
  }

  function sizeBackgroundVideos() {
    $('.' + classes.videoBackground).each(function(index, el) {
      sizeBackgroundVideo($(el));
    });
  }

  function sizeBackgroundVideo($player) {
    var $slide = $player.closest('.' + classes.slide);
    // Ignore cloned slides
    if ($slide.hasClass(classes.slickClone)) {
      return;
    }
    var slideWidth = $slide.width();
    var playerWidth = $player.width();
    var playerHeight = $player.height();

    // when screen aspect ratio differs from video, video must center and underlay one dimension
    if (slideWidth / videoOptions.ratio < playerHeight) {
      playerWidth = Math.ceil(playerHeight * videoOptions.ratio); // get new player width
      $player.width(playerWidth).height(playerHeight).css({
        left: (slideWidth - playerWidth) / 2,
        top: 0
      }); // player width is greater, offset left; reset top
    } else { // new video width < window width (gap to right)
      playerHeight = Math.ceil(slideWidth / videoOptions.ratio); // get new player height
      $player.width(slideWidth).height(playerHeight).css({
        left: 0,
        top: (playerHeight - playerHeight) / 2
      }); // player height is greater, offset top; reset left
    }

    $player
      .prepareTransition()
      .addClass(classes.loaded);
  }

  function unsetBackgroundVideo(playerId) {
    // Switch the background-chrome to a chrome-only player once played
    $('#' + playerId)
      .removeAttr('style')
      .removeClass(classes.videoBackground)
      .addClass(classes.videoChrome);

    videos[playerId].$parentSlideshowWrapper
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].$parentSlide
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].status = 'open';
  }

  function setBackgroundVideo(playerId) {
    // Switch back to background-chrome when closed
    var $player = $('#' + playerId)
      .addClass(classes.videoBackground)
      .removeClass(classes.videoChrome);

    videos[playerId].$parentSlide
      .addClass(classes.slideBackgroundVideo);

    videos[playerId].status = 'background';
    sizeBackgroundVideo($player);
  }

  function initEvents() {
    $(document).on('click.videoPlayer', '.' + classes.playVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      startVideoOnClick(playerId);
    });

    $(document).on('click.videoPlayer', '.' + classes.closeVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      closeVideo(playerId);
    });

    // Listen to resize to keep a background-size:cover-like layout
    $(window).on('resize.videoPlayer', $.debounce(250, function() {
      if (youtubeLoaded) {
        sizeBackgroundVideos();
      }
    }));
  }

  function removeEvents() {
    $(document).off('.videoPlayer');
    $(window).off('.videoPlayer');
  }

  return {
    init: init,
    loadVideos: loadVideos,
    loadVideo: loadVideo,
    playVideo: customPlayVideo,
    pauseVideo: pauseVideo,
    removeEvents: removeEvents
  };
})();

/* ================ TEMPLATES ================ */

window.theme = theme || {};

theme.customerTemplates = (function() {

  function initEventListeners() {
    // Show reset password form
    $('#RecoverPassword').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    $('#HideRecoverPasswordLink').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('hide');
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('hide');
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  return {
    init: function() {
      checkUrlHash();
      initEventListeners();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();

/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Cart = (function() {
  var selectors = {
    edit: '.js-edit-toggle'
  };
  var config = {
    showClass: 'cart__update--show',
    showEditClass: 'cart__edit--active',
    cartNoCookies: 'cart--no-cookies'
  };

  function Cart(container) {
    this.$container = $(container);
    this.$edit = $(selectors.edit, this.$container);

    if (!this.cookiesEnabled()) {
      this.$container.addClass(config.cartNoCookies);
    }
    this.$edit.on('click', this._onEditClick.bind(this));
    $.ajax({
      type: 'get',
      url: '/cart.json',
      beforeSend: function() {
      },
      success: function(cart) {
        if (cart.item_count > 0 && theme.function.cartAutoShippingEnable == true) {
          if(cart.items.length === 1 && cart.items[0].requires_shipping == false ){
            return false;
          }
          Shopify.KT_getAddress()
        }
      }
    });
  }

  Cart.prototype = _.assignIn({}, Cart.prototype, {
    onUnload: function() {
      this.$edit.off('click', this._onEditClick);
    },

    _onEditClick: function(evt) {
      var $evtTarget = $(evt.target);
      var $updateLine = $('.' + $evtTarget.data('target'));

      $evtTarget.toggleClass(config.showEditClass);
      $updateLine.toggleClass(config.showClass);
    },

    cookiesEnabled: function() {
      var cookieEnabled = navigator.cookieEnabled;

      if (!cookieEnabled){
        document.cookie = 'testcookie';
        cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
      }
      return cookieEnabled;
    }
  });

  return Cart;
})();
window.theme = window.theme || {};

theme.Filters = (function() {
  var constants = {
    SORT_BY: 'sort_by'
  };
  var selectors = {
    filterGroup: '.kt_layerfilterGroups',
    filterGroupDesktop: '.kt_layerfilterGroupsDesktop',
    filterGroupMobile: '.kt_layerfilterGroupsMobile',
    filterLink: 'a[data-pjax-filter]',
    catShowing: '.child_collection li.current-cat'
  };
  function Filters(container) {
    var $container = (this.$container = $(container));
    this._createFilter();
    this._checkCatShowing();
  }

  Filters.prototype = _.assignIn({}, Filters.prototype, {
    _createFilter: function() {
      var filterContent = '';
      var currSearch = window.location.search;
      var currSort = ($('.orderby-wapper li.selected a').attr('href')).replace('?','');
      var currShow = ($('.show-grid-list a.active').attr('href')).replace('?','');
      if(currSearch.indexOf('?sort_by=') >= 0 || currSearch.indexOf('?page=') >= 0 || currSearch.indexOf('?view=') >= 0 || currSearch.indexOf('?q=') >= 0){
        currSearch = '?'+currSearch.split('?')[1];
      }
      else{
        currSearch = '';
      }
      _.forEach(groupsFilter, function(item,idx0) {
        var filterGroupItem  = "";
        if(item.key == 'kt_rencent'){
          filterGroupItem += '<div class="kt_filterGroupItem kt_filterGroupItem'+idx0+' widget widget_recent_product" style="display:none;"><h2 class="widget-title">Recent products</h2><ul class="product-categories">';
          // if($(window).width() < 768){
            filterGroupItem += '<li class="_"></li>';
          // }
          filterGroupItem += '</ul></div>';
        }
        else{
          filterGroupItem += '<div class="kt_filterGroupItem kt_filterGroupItem'+idx0+' blockStyle_'+item.blockStyle+' split_'+item.useSplit+'">';
          filterGroupItem += '<div class="layered_subtitle_heading"><span class="layered_subtitle">'+item.title+'<span></span></span><span class="ico"></span></div>';
          filterGroupItem += '<ul class="kt_filterGroupItem_ul">';
          _.find(collectionTags, function(itemTag) {
            if(itemTag.indexOf(item.key+" ") === 0 && item.tags_import.length === 0){
            if(filterGroupItem.indexOf('_'+_snakeCase(itemTag.replace(item.key+" ",""))) === -1){
                filterGroupItem += '<li class="_'+_handleize(itemTag.replace(item.key+" ",""));
                if(_.indexOf(currTags_handleize, _handleize(itemTag)) >= 0){
                  filterGroupItem += ' tagSelected';
                }
                filterGroupItem += '">';
                filterGroupItem += '<a data-pjax-filter="" href="';
                if(currTags_handleize.length == 0){
                  filterGroupItem += '/collections/'+collection.Crr+'/'+_handleize(itemTag)+currSearch;
                }
                else if(_.indexOf(currTags_handleize, _handleize(itemTag)) >= 0){
                  filterGroupItem += '/collections/'+collection.Crr+'/';
                  _.forEach(currTags_handleize, function(itemCurrentTags) {
                    if(_handleize(itemTag) !== itemCurrentTags){
                      filterGroupItem += itemCurrentTags+'+';
                    }
                  })
                  filterGroupItem += currSearch;
                }else{
                  filterGroupItem += '/collections/'+collection.Crr+'/';
                  _.forEach(currTags_handleize, function(itemCurrentTags) {
                    if(_handleize(itemTag) !== itemCurrentTags){
                      filterGroupItem += itemCurrentTags+'+'
                    }
                  })
                  filterGroupItem += _handleize(itemTag)+currSearch;
                }
                filterGroupItem += '" title="'+itemTag+'">';
                if(colorGroupFilter.indexOf(item.key) !== -1){
                  filterGroupItem += '<span class="color_pick swatch" data-color="'+_handleize(itemTag.replace(item.key+" ",""))+'"></span>';
                }
                if(item.blockStyle === '6'){
                  _.forEach(brands_icon, function(itemBrandIcon) {
                    if(itemBrandIcon.indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1 || _snakeCase(itemBrandIcon).indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1){
                      filterGroupItem += '<span class="brand_icon"><img src="';
                      filterGroupItem += itemBrandIcon;
                      filterGroupItem += '"></span>';
                    }
                  });
                }
                filterGroupItem += '<span class="titleFilterItem">'+_.capitalize(itemTag.replace(item.key+" ",""))+'</span>';
                filterGroupItem += '</a>';
                filterGroupItem += '</li>';
              }
            }
            else if(item.tags_import.length > 0){
              _.forEach(item.tags_import, function(item_,idx0) {
                if(_.snakeCase(itemTag) === _.snakeCase(item_) && filterGroupItem.indexOf('_'+_snakeCase(itemTag.replace(item.key+" ",""))) === -1){
                  filterGroupItem += '<li class="_'+_handleize(itemTag);
                  if(_.indexOf(currTags_handleize, _handleize(itemTag)) >= 0){
                    filterGroupItem += ' tagSelected';
                  }
                  filterGroupItem += '">';
                  filterGroupItem += '<a data-pjax-filter="" href="';
                  if(currTags_handleize.length == 0){
                    filterGroupItem += '/collections/'+collection.Crr+'/'+_handleize(itemTag)+currSearch;
                  }
                  else if(_.indexOf(currTags_handleize, _handleize(itemTag)) >= 0){
                    filterGroupItem += '/collections/'+collection.Crr+'/';
                    _.forEach(currTags_handleize, function(itemCurrentTags) {
                      if(_handleize(itemTag) !== itemCurrentTags){
                        filterGroupItem += itemCurrentTags+'+'
                      }
                    })
                    filterGroupItem += currSearch;
                  }
                  else{
                    filterGroupItem += '/collections/'+collection.Crr+'/';
                    _.forEach(currTags_handleize, function(itemCurrentTags) {
                      if(itemTag !== itemCurrentTags){
                        filterGroupItem += itemCurrentTags+'+'
                      }
                    })
                    filterGroupItem += _handleize(itemTag)+currSearch;
                  }
                  filterGroupItem += '" title="'+itemTag+'">';                
                  if(colorGroupFilter.indexOf(item.key) !== -1){
                    filterGroupItem += '<span class="color_pick swatch" data-color="'+_handleize(itemTag)+'"></span>';
                  }
                  if(item.blockStyle === '6'){
                    _.forEach(brands_icon, function(itemBrandIcon) {
                      if(itemBrandIcon.indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1 || _snakeCase(itemBrandIcon).indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1){
                        filterGroupItem += '<span class="brand_icon"><img src="';
                        filterGroupItem += itemBrandIcon;
                        filterGroupItem += '"></span>';
                      }
                    });
                  }
                  filterGroupItem += '<span class="titleFilterItem">'+_.capitalize(itemTag)+'</span>';
                  filterGroupItem += '</a>';
                  filterGroupItem += '</li>';
                }
              });
            }
          })
          filterGroupItem += '</ul>';
          filterGroupItem += '</div>';
        }
        if(filterGroupItem.indexOf('<li class="_') !== -1){
          filterContent += filterGroupItem;
        }
      })
      $(selectors.filterGroupDesktop).addClass('colFilter-'+$(filterContent).length);
      if($(window).width() >= 768){
        $(selectors.filterGroupDesktop).html(filterContent);
      }
      else{
        $(selectors.filterGroupMobile).html(filterContent);
        // if($(selectors.filterGroupMobile).find('.kt_filterGroupItem0').length > 0){
        //   $('.kt_filterGroupItem0').addClass('show');
        // }
        if($('.kt_filterGroupItem').last().hasClass('blockStyle_3') || $('.kt_filterGroupItem').last().hasClass('blockStyle_6') || $('.kt_filterGroupItem').last().hasClass('blockStyle_7')){
          $('.kt_filterGroupItem').last().addClass('showAny')
        }
      }
      recentlyViewedListSidebar();
      if($('.orderby-wapper a').length > 0){
        _.forEach($('.orderby-wapper a'), function(itemOrderby,idx0) {
          var newSort = ($(itemOrderby).attr('href')).replace('?','');
          if(currSearch !== '' && currSearch.indexOf('sort_by=') === -1 && currSearch.indexOf(($(itemOrderby).attr('href')).replace('?','')) === -1){
            $(itemOrderby).attr('href',currSearch+($(itemOrderby).attr('href')).replace('?','&'))
          }
          else if(currSearch !== '' && currSearch.indexOf('sort_by=') !== -1 && currSearch.indexOf(($(itemOrderby).attr('href')).replace('?','')) === -1){
            $(itemOrderby).attr('href',currSearch.replace(currSort,newSort));
          }else if(currSort == newSort){
            $(itemOrderby).attr('href',currSearch);
          }
        });
      }

      if($('.show-grid-list a').length > 0){
        _.forEach($('.show-grid-list a'), function(itemShow,idx0) {
          var newShow = ($(itemShow).attr('href')).replace('?','');
          if(currSearch !== '' && currSearch.indexOf('view=') === -1 && currSearch.indexOf(($(itemShow).attr('href')).replace('?','')) === -1){
            $(itemShow).attr('href',currSearch+($(itemShow).attr('href')).replace('?','&'));
          }
          else if(currSearch !== '' && currSearch.indexOf('view=') !== -1 && currSearch.indexOf(($(itemShow).attr('href')).replace('?','')) === -1){
            $(itemShow).attr('href',currSearch.replace(currShow,newShow));
          }else if(currShow == newShow){
            $(itemShow).attr('href',currSearch);
          }
        });
      }
      $('#filterApply').html($('.woocommerce-result-count').html());
      $('#filterSelected').html($('.filter-container__selected-filter').html());
      if($(selectors.filterGroup).find('.tagSelected').length > 0){
        $('#filterClear').show();
      }
      else{
        $('#filterClear').hide();
      }
    },
    _checkCatShowing: function() {
      if($(selectors.catShowing).length > 0){
        $(selectors.catShowing).parents('li.level-1').addClass('showAny');
      }
    },
    onUnload: function() {}
  });

  return Filters;
})();

theme.clickOnScrollButton = (function(){
  var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var element = $('.kt_layerFilterJS a[data-action="infinity"]').not('.loading')[0];
  if(element !== undefined && getComputedStyle($('.kt_layerFilterJS').find('.loadMore')[0]).display !== "none" && element.getBoundingClientRect().top <= viewportHeight - 100){
    disableScroll();
    $('.kt_layerFilterJS').find('a[data-action="infinity"]').trigger('click');
  }
});

theme.FiltersPjax = (function(){
  var loadmore = false;
  var scrollTop = null;
  $(document).on('click', 'a[data-pjax-filter]', function(event) {
    if ($.support.pjax) {
      if($(this).attr('data-action') === 'loadmore' || $(this).attr('data-action') === 'infinity' ){
        $.pjax.click(event, {
          container: '.product-listing-loadmore',
          fragment: '.product-listing',
          timeout: 4000,
          scrollTo: false,
          replace: false,
          push: false
        });
        $(this).addClass('loading').text($(this).attr('data-text-loading'));
        if($(this).attr('data-action') === 'infinity'){
          $('.loadingFilter .card.hidden').addClass('bottom').removeClass('hidden');
        }
        loadmore = true;
      }
      else{
        $('.loadingFilter .hidden').removeClass('hidden');
        $.pjax.click(event, {
          container: '.kt_layerFilterJS',
          fragment: '.kt_layerFilterJS',
          timeout: 4000,
          scrollTo: false
        });
      }
      if($(this).attr('data-scroll-top') !== undefined){
        scrollTop = true;
        $('div[data-section-id="kt_collection_banner"]').find('img').css('opacity',0.5)
      }
    }
  });
  $(document).on('pjax:success', function() {
    if(loadmore){
      $('.product-listing').find('.product-listing-loadmore').first().addClass('removeElement');
      $('.product-listing').append($('.product-listing').find('.product-listing-loadmore').first().html());
      $('.product-listing').find('.product-listing-loadmore.removeElement').first().remove();
      $('.CountEnd').text($('.product-listing').find('.grid-item').length);
      var CountEnd = $('.CountEnd').text(), AllCount = $('.AllCount').text(), $aMore = $('.pagination_ [data-action]');
      if(+CountEnd < +AllCount){
        var curPage = $aMore.attr('data-page').replace('page_','')
        $aMore.attr('href',$aMore.attr('href').replace('page='+curPage,'page='+(+curPage+1))).attr('data-page','page_'+(+curPage+1));
      }
      else{
        $('.pagination_ .loadMore').hide();
      }
      $aMore.removeClass('loading').text($aMore.attr('data-text-button'));
      $('#filterApply').html($('.woocommerce-result-count').html());      
      if($('.loadingFilter .card.bottom').length > 0){$('.loadingFilter .card.bottom').addClass('hidden').removeClass('bottom')};
      enableScroll();
    }
    else if(scrollTop == true){
      $('html').animate({scrollTop:0}, 'slow');
      scrollTop = false;
    }
    else{
      var offsetTop = $('.header.ontop').length !== 0 ? $('#PageContainer').offset().top - ($('.header.ontop').height()) * 2 : $('#PageContainer').offset().top - 100;
      $('html').animate({scrollTop:offsetTop}, 'slow');
    }
    if($('.ly__ms').length > 0){
      var loadedImgNum = 0;
      $('.product-listing').imagesLoaded()
      .progress( function( instance, image ) {
        var $this = $(image.img.offsetParent).closest('.grid-item');
        if ($this.attr('style') == undefined){
          $('.product-listing').isotope()
          .append($this)
          .isotope( 'appended', $this);
        }
      })
      .done( function() {
        $('.product-listing').isotope('layout');
      });
    }
    else if($('.ly__lis').length > 0 || $('.ly__leftlis').length > 0 || $('.ly__leftlis').length > 0){
      var grid_item = '.grid-item.list';
      $('li'+grid_item+' .listThumbScroll').each(function(){
        var $this = $(this);
        var images = $(this).parents('li'+grid_item).find('.product-thumb .front-image img');
        images.on('load', function(){
          $this.css('height',$(this).height()+'px');
          $this.find('.ab').removeClass('ab');
          $this.mThumbnailScroller({
            axis:"y", //change to "y" for vertical scroller
            type:"hover-precise"
          });
        });
      });
    }
    loadmore = false;
    theme.checkProductGrid_Width();
    theme.scrollbarVariantGridProduct();
  })
  $(document).on('pjax:complete', function() {
    var sections = new theme.Sections();
    sections.register('collection-template', theme.Filters);
    sections.register('banner-page-section',theme.BannerByPage);
    sections.register('masory-section', theme.ProductsMasorySection);
    if($('.loadingFilter .card').length > 0){$('.loadingFilter .card').addClass('hidden').removeClass('bottom')};
  });
});

window.theme = window.theme || {};

theme.HeaderSection = (function() {

  function Header() {
    theme.MenuReposive.init();
    theme.StickMenu.init();
    theme.ResizeNavMega.init();
    // theme.MobileNav.init();
    // theme.Search.init();
  }

  Header.prototype = _.assignIn({}, Header.prototype, {
    onUnload: function() {
      theme.MenuReposive.unload();
    }
  });

  return Header;
})();

theme.Maps = (function() {
  var config = {
    zoom: 14
  };
  var apiStatus = null;
  var mapsToLoad = [];
  var key = theme.mapKey ? theme.mapKey : '';

  function Map(container) {
    this.$container = $(container);

    if (apiStatus === 'loaded') {
      this.createMap();
    } else {
      mapsToLoad.push(this);

      if (apiStatus !== 'loading') {
        apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + key)
            .then(function() {
              apiStatus = 'loaded';
              initAllMaps();
            });
        }
      }
    }
  }

  function initAllMaps() {
    // API has loaded, load all Map instances in queue
    $.each(mapsToLoad, function(index, instance) {
      instance.createMap();
    });
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({address: address}, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  Map.prototype = _.assignIn({}, Map.prototype, {
    createMap: function() {
      var $map = this.$container.find('.map-section__container');

      return geolocate($map)
        .then(function(results) {
          var mapOptions = {
            zoom: config.zoom,
            center: results[0].geometry.location,
            disableDefaultUI: true
          };

          var map = this.map = new google.maps.Map($map[0], mapOptions);
          var center = this.center = map.getCenter();

          //eslint-disable-next-line no-unused-vars
          var marker = new google.maps.Marker({
            map: map,
            position: map.getCenter()
          });

          google.maps.event.addDomListener(window, 'resize', $.debounce(250, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          }));
        }.bind(this))
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = theme.strings.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = theme.strings.addressQueryLimit;
              break;
            default:
              errorMessage = theme.strings.addressError;
              break;
          }

          $map
            .parent()
            .addClass('page-width map-section--load-error')
            .html('<div class="errors text-center">' + errorMessage + '</div>');
        });
    },

    onUnload: function() {
      google.maps.event.clearListeners(this.map, 'resize');
    }
  });

  return Map;
})();

// Global function called by Google on auth errors.
// Show an auto error message on all map instances.
// eslint-disable-next-line camelcase, no-unused-vars
function gm_authFailure() {
  $('.map-section').addClass('map-section--load-error');
  $('.map-section__container').remove();
  $('.map-section__link').remove();
  $('.map-section__overlay').after('<div class="errors text-center">' + theme.strings.authError + '</div>');
}

/* eslint-disable no-new */
theme.Product = (function() {
  function Product(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var productsectionId = $container.attr('data-product-id');

    this.settings = {
      // Breakpoints from src/stylesheets/global/variables.scss.liquid
      mediaQueryMediumUp: 'screen and (min-width: 750px)',
      mediaQuerySmall: 'screen and (max-width: 749px)',
      bpSmall: false,
      enableHistoryState: $container.data('enable-history-state') || false,
      imageSize: "530x@2x",
      imageZoomSize: null,
      namespace: '.slideshow-' + sectionId,
      sectionId: sectionId,
      sliderActive: false,
      zoomEnabled: false
    };

    this.selectors = {
      template: '#ProductSection-' + sectionId,
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      addToCartMore: '#AddToCartMore-'+ sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      variesPrice: '#ProductVaries-' + sectionId,
      SKU: '.variant-sku',
      originalPriceWrapper: '.product-price__price-' + sectionId,
      originalSelectorId: '#ProductSelect-' + sectionId,
      variantSelectorId: '#ProductVariantSelect-' + sectionId,
      productFeaturedImage: '.product-single__photos-' + sectionId + ' .product-single__photo.active-photo',
      productThumbSlick: '.productThumbSlide--' + sectionId,
      productPrices: '.product-single__price-' + sectionId,
      productPhotoImages: '.product-single__photo--' + sectionId,
      productPhotos: '.product-single__photos-' + sectionId,
      productThumbImages: '.product-single__thumbnail--' + sectionId,
      productThumbs: '.product-single__thumbnails-' + sectionId,
      saleClasses: '#ProductSection-' + sectionId + 'product-price__sale product-price__sale--single',
      saleLabel: '.product-price__sale-label-' + sectionId,
      singleOptionSelector: '.single-option-selector-' + sectionId,
      dataSettings: '.datasettings--' + sectionId,
      dataJs: '.datajs--' + sectionId
    }

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);
    this.dataSettings = $(this.selectors.dataSettings).data();
    this.dataJs = $(this.selectors.dataJs).data();
    this._initBreakpoints();
    this._stringOverrides();
    this._initVariants();
    this._initImageSwitch();
    this._create360();
    this._checkVariantVideo();
    if(this.dataSettings.layoutSection == 3){
      this._initStickySummary();
      this._initPhotoSwipeFromDOM();
    }
    this._initAddMore();
    // Pre-loading product images to avoid a lag when a thumbnail is clicked, or
    // when a variant is selected that has a variant image
    if(this.settings.sectionId !== _.toString(this.productSingleObject.id)){
      theme.Images.preload(this.productSingleObject.images[0], this.settings.imageSize);
      theme.Images.preload(this.productSingleObject.images[0], '110x110@2x');
    }
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initBreakpoints: function() {
      var self = this;
      // initialize thumbnail slider on mobile if more than three thumbnails
      if ($(self.selectors.productThumbImages).length >= 1) {
        $(this.selectors.template).addClass('loading_thumb');
        self._initThumbnailSlider();
      }
      // initialize photo slider
      if ($(self.selectors.productPhotoImages).length >= 1) {
        $(this.selectors.template).addClass('loading_photo');
        self._initPhotoSlider();
      }
    },

    _initVariants: function() {
      var self = this;
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };
      if(options.product.variants[0].requires_shipping == false){$(this.selectors.template+' .freeShipping').removeClass('hidden')}
      this.variants = new slate.Variants(options);
      this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
      if(this.dataSettings.layoutSection !== 3){
        this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
      }
      this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
      this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
      if(options.product.options.length >= 1 && options.product.options[0] !== "Title"){
        var option = this.variants.currentVariant.option1, check_option = 0;
        var optitonSelector1 = 'SingleOptionSelector-0--'+self.settings.sectionId;
        var optitonSelector2 = 'SingleOptionSelector-1--'+self.settings.sectionId;
        var optitonSelector3 = 'SingleOptionSelector-2--'+self.settings.sectionId;
        _.forEach(self.productSingleObject.variants, function(value) {
          $.each($('#'+optitonSelector1+' option'), function(index,el) {
            if(value.option1 !== option){
              check_option = 0;option = value.option1;
            }
            if(check_option == 0 && $(this).val() == value.option1){
              var firstVariant = _handleize(value.option1);
              if(value.option2){firstVariant = firstVariant +' / '+ _handleize(value.option2)}
              if(value.option3){firstVariant = firstVariant +' / '+ _handleize(value.option3)}
              $(this).attr({
                'data-first-variant': firstVariant,
                'data-first-variant-title': value.title
              });
              if(value.featured_image){
                $(this).attr('data-featured-image', value.featured_image.src);
              }
              check_option++;
            }
          });
        });
        $.each($(self.selectors.template+' .fake_select'), function(index, el) {
          // console.log(index,$(this).data('name-option'))
          var settings_op = _.find(theme.function.productOptionStyle, { 'name': $(this).data('name-option')});
          // console.log(settings_op)
          if(settings_op !== undefined){
            if (settings_op.style === "combobox") {

            }
            else if(settings_op.style === "combobox with_out_variant_image") {
              $(this).addClass(settings_op.style);
              var build_vrs_img = '';
              $.each($(this).find('li'), function(idx, el) {
                var featuredImage = $(this).closest('.selector-wrapper.js').find('.single-option-selector option[value="'+$(this).attr('data-value')+'"]').attr('data-featured-image');
                if (featuredImage !== undefined) {           
                  var fileExt = _.last(featuredImage.split('.')), featuredImage = _.replace(featuredImage, '.'+fileExt, '_150x150_crop_center.'+fileExt);
                  build_vrs_img += $(this)[0].outerHTML.replace($(this)[0].innerHTML,'<img src="'+featuredImage+'"/>');
                }
              });
              if (build_vrs_img !== ''){
                $(this).closest('.selector-wrapper.js').addClass('sw_large');
                $(this).closest('.selector-wrapper.js').append('<ul class="fake_select variant_image">'+build_vrs_img+'</ul>')
              }
            }
            else if (settings_op.style === "not_select radio_button" || settings_op.style === "not_select radio_button inline") {
              $(this).removeClass('combobox').addClass(settings_op.style);
              $(this).find("label[data-change-label]").addClass('not_combobox');
              $(this).closest('.selector-wrapper.js').addClass('sw_large');
              $.each($(this).find('li'), function(idx, el) {
                var swatch  ='<span class="check_btn"></span>';
                $(this).removeClass('sw').addClass('check_btn_style').prepend(swatch);
              });
            }
            else{
              $(this).removeClass('combobox').addClass(settings_op.style);
              $(this).closest('.selector-wrapper.js').addClass('sw_large');
              $(this).find("label[data-change-label]").addClass('not_combobox');
              if(settings_op.color_watched){
                // $(this).addClass('small_swatch');
                $.each($(this).find('li'), function(idx, el) {
                  var featuredImage = $(this).closest('.selector-wrapper.js').find('.single-option-selector option[value="'+$(this).attr('data-value')+'"]').attr('data-featured-image');
                  if (featuredImage !== undefined) {           
                    var fileExt = _.last(featuredImage.split('.')), featuredImage = _.replace(featuredImage, '.'+fileExt, '_100x100_crop_center.'+fileExt);
                  }
                  var swatch = '<span class="swatch" data-color="'+_handleize($(this).data('value'))+'"';
                  swatch += featuredImage !== undefined ? ' style="background-image:url('+featuredImage+')"' : '';
                  swatch += '></span>';
                  $(this).removeClass('sw').addClass('color_sw').prepend(swatch);
                });
              }
            }
          }
        });
        this._changeVariants(this.variants.currentVariant);
      }
    },

    _initAddMore: function() {
      var self = this;
      $(document).on('click', self.selectors.addToCartMore, function(e) {
        $('#addMoreModal select.single-option-selector').on('change', function() {
          var select = '';
          for (var i = 0; i < $('#addMoreModal select.single-option-selector').length; i++) {
            var val = $('#addMoreModal #SingleOptionSelector-'+i+'--addmore-template').val();
            if (val !== 'all') {
              select += '.'+val;
            }
            if (i == $('#addMoreModal select.single-option-selector').length - 1) {
              select !== '' ? select+=', .selected' : select;
              $('#addMoreModal .full-list-variants').isotope({ filter: select })
            }
          }
        });
        $('#addMoreModal').modal();
        $('#addMoreModal .full-list-variants').isotope({
          itemSelector: '.item-variant',
          layoutMode: 'fitRows'
        })
        $('#kt_addmore input[type="checkbox"],#kt_addmore input[type="number"]').on('change', function() {
          var price = 0;
          $.each($('#kt_addmore input[type="checkbox"]'), function(index, val) {
            if ($(this).is(':checked')) {
              var vrId = $(this).attr('data-vr-id');
              price = price + (_.toNumber($('.variant--'+vrId+' .price').attr('data-price-default')) * _.toNumber($('[name="quantity__'+vrId+'"]').val()));
            }
          });
          var line_total = _.toNumber($('#addMoreModal').find('[data-total]').data('total'));
          var progress_bar = $('#addMoreModal').find('.progress-bar');
          $('#addMoreModal').find('.subtotal .subtotal-number').html(theme.Currency.formatMoney(price, theme.moneyFormat));
          if (line_total > price){
            $('#addMoreModal').find('.content_threshold strong.spend_price').html(theme.Currency.formatMoney(line_total - price, theme.moneyFormat))
            progress_bar.attr('aria-valuenow', line_total - price).css('width',price / line_total * 100 + '%').text(Math.round(price / line_total * 100) + '%');
            $('#addMoreModal').find('.content_threshold:not(.threshold_congrats)').removeClass('hidden');
            $('#addMoreModal').find('.threshold_congrats').addClass('hidden');
          }else{
            progress_bar.attr('aria-valuenow', line_total).css('width','100%').text('100%');
            $('#addMoreModal').find('.content_threshold:not(.threshold_congrats)').addClass('hidden');
            $('#addMoreModal').find('.threshold_congrats').removeClass('hidden');
          }
          if(theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency){
            Currency.convertAll(shopCurrency,cookieCurrency,'#addMoreModal span.money');
          }
        });
        $('#addMoreModal').find('#checkbox--'+self.variants.currentVariant.id).prop("checked" ,true).trigger('change');
        $('#addMoreModal').find('.variant--'+self.variants.currentVariant.id).addClass('selected');
      });
    },

    _changeVariants: function(currentVariant) {
      var self = this;
      var options2 = new Array, options3 = new Array;
      var option = currentVariant.option1, check_option = 0;
      var optitonSelector1 = 'SingleOptionSelector-0--'+self.settings.sectionId;
      var optitonSelector2 = 'SingleOptionSelector-1--'+self.settings.sectionId;
      var optitonSelector3 = 'SingleOptionSelector-2--'+self.settings.sectionId;
      $.each($('.single-option-selector-'+self.settings.sectionId+' option'), function(index,el) {
        $(this).text($(this).val());
        $(this).prop('disabled', false);
        if( ($(this).parent().is('span')) ) $(this).unwrap();
      });
      $('._soulout').removeClass('_soulout');
      $('._unavailable').removeClass('_unavailable');
      $('.kt_flash_lable').text('');
      _.forEach(self.productSingleObject.variants, function(value) {
        if(value.option1 === currentVariant.option1){
          options2.push(value.option2)
          options3.push(value.option3)
        }
        if(value.title === currentVariant.title){
          // console.log(value)
        }
        if(value.option2 == currentVariant.option2 && value.option3 == currentVariant.option3){
          // console.log(value)          
          $.each($('#'+optitonSelector1+' option'), function(index,el) {
            if(value.option1 == $(this).attr('value')){
              $('._'+_handleize($(this).val())+'[data-change-option="'+optitonSelector1+'"]').find('.kt_price_lable').html(theme.Currency.formatMoney(value.price, theme.moneyFormat));
              if(theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency){
                Currency.convertAll(shopCurrency,cookieCurrency,self.selectors.template+' .kt_price_lable span.money');
              }
            }
          });
        }
        if(value.available == false){
          // console.log(value)
          if (value.option1 == currentVariant.option1 && value.option2 == currentVariant.option2) {
            $.each($('#'+optitonSelector3+' option'), function(index,el) {
              if(value.option3 == $(this).attr('value')){
                $(this).text($(this).text()+' - Soldout');
                $('._'+_handleize(value.option3)+'[data-change-option="'+optitonSelector3+'"]').addClass('_soulout').find('.kt_flash_lable').text(' - Soldout');
              }
            });
          } else if(value.option1 == currentVariant.option1 && value.option3 == currentVariant.option3) {
            $.each($('#'+optitonSelector2+' option'), function(index,el) {
              if(value.option2 == $(this).attr('value')){
                $(this).text($(this).text()+' - Soldout');
                $('._'+_handleize(value.option2)+'[data-change-option="'+optitonSelector2+'"]').addClass('_soulout').find('.kt_flash_lable').text(' - Soldout');
              }
            });
          }
          // else if(value.option2 == currentVariant.option2 && value.option3 == currentVariant.option3 && value.option1 !== currentVariant.option1) {
          //   $.each($('#'+optitonSelector1+' option'), function(index,el) {
          //     if(value.option1 == $(this).attr('value')){
          //       $(this).text($(this).text()+' - Soldout');
          //       $('._'+_handleize(value.option1)+'[data-change-option="'+optitonSelector1+'"]').addClass('_soulout').find('.kt_flash_lable').text(' - Soldout');
          //     }
          //   });
          // }
        }
      });
      options2 = _.uniq(options2);
      options3 = _.uniq(options3);
      $.each($('#'+optitonSelector2+' option'), function(index,el) {
        if(_.indexOf(options2,$(this).attr('value')) == -1){
          $(this).prop('disabled', true);
          if( !($(this).parent().is('span')) ) $(this).wrap('<span>');
          $('._'+_handleize($(this).val())+'[data-change-option="'+optitonSelector2+'"]').addClass('_unavailable').find('.kt_flash_lable').text(' - Unavailable');
        }
      });
      $.each($('#'+optitonSelector3+' option'), function(index,el) {
        if(_.indexOf(options3,$(this).attr('value')) == -1){
          $(this).prop('disabled', true);
          if( !($(this).parent().is('span')) ) $(this).wrap('<span>');
          $('._'+_handleize($(this).val())+'[data-change-option="'+optitonSelector3+'"]').addClass('_unavailable').find('.kt_flash_lable').text(' - Unavailable');
        }
      });
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;
      }

      var self = this;
      var $originalSelectorId = $(this.selectors.originalSelectorId);
      var $variantSelectorId = this.selectors.variantSelectorId;
      $(document).on('click',this.selectors.productThumbImages, function(evt) {
        evt.preventDefault();
        var $el = $(this);
        var template = self.selectors.template;
        if(typeof $el.attr('data-id') !== "undefined" && $el.attr('data-id') !== '' && $el.attr('title') !== self.productSingleObject.title ){
          $($variantSelectorId+ ' span').text($el.attr('title')).animate({"font-size": "14px"}, 400).animate({"font-size": "13px"}, 500);
          goto = false;
          var opitons = $el.attr('title').split(' / ');
          $(template +' .fake_select li').removeClass('selected');
          $(opitons).each(function(index, opiton) {
            var opitons_change = $(template +' option[value="'+opiton+'"]').val();
            var $opitons_change_ = $(template +' option[value="'+opiton+'"]').parent();
            $(template +' .fake_select li._'+_handleize(opiton)).addClass('selected');
            if(opiton != self.productSingleObject.title){
              $(template +' label[data-change-label="SingleOptionSelector-'+index+'--'+self.settings.sectionId+'"] .text').text(opiton);
              $(template +" .swatches-selected-name[data-change-label='SingleOptionSelector-"+index+"--"+self.settings.sectionId+"] .name").html(opiton);
            }
            if(opitons_change != $opitons_change_.val() ){
              $opitons_change_.val(opitons_change).change();
            }
          });
          var val_id = $el.attr('data-id');
          $originalSelectorId.val(val_id).change();
          if(($(this).parents("div.product-page").data('enable-history-state')) == true){
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + val_id;
            window.history.replaceState({path: newurl}, '', newurl);
          }
        }
        var imageSrc = $el.attr('href');
        self._setActiveThumbnail(imageSrc);
      });
    },

    _setActiveThumbnail: function(src) {
      var activeClass = 'active-thumb';
      // If there is no element passed, find it by the current product image
      if (typeof src === 'undefined') {
        src = $(this.selectors.productFeaturedImage).attr('href');
      }
      // Set active thumbnails (incl. slick cloned thumbs) with matching 'href'
      var $thumbnail = $(this.selectors.productThumbImages + '[href="' + src + '"]');
      $(this.selectors.productThumbImages).removeClass(activeClass).parent().find('.placeholder').removeClass(activeClass);
      $thumbnail.addClass(activeClass).parent().find('.placeholder').addClass(activeClass);
      
      var clone_length = ($(this.selectors.productThumbs+' .slick-cloned').length / 2) || 0;
      slideIndex = $thumbnail.parent().not('.slick-cloned').index() - clone_length;
      if($(this.selectors.productPhotos+' .slick-list').length !== 0){$(this.selectors.productPhotos).slick('slickGoTo', slideIndex);}
      $(this.selectors.productThumbImages).removeClass('active-thumb');
      $thumbnail.addClass('active-thumb');      
    },

    _switchImage: function(image, zoomImage) {
      // $(this.selectors.productFeaturedImage).attr('src', image);
      // $(this.selectors.productFeaturedImage).parent().attr('href', image);
    },

    _initThumbnailSlider: function() {
      var infinite = true,
          items = 4,
          self = this;
      if(this.dataSettings.imageSize == 'full'){
        items = this.dataSettings.widthSection ? 5 : 6;
      }
      if(this.dataSettings.imageSize == 'medium' || this.dataSettings.imageSize == 'small'){
        items = this.dataSettings.widthSection ? 4 : 5;
      }
      if(this.dataSettings.useThumbVertical){
        items = 5;
        if(this.dataSettings.imageSize == 'small'){
          items = 4;
        }
        var mirror = $(self.selectors.productPhotos).closest('.main-image-wapper');
        var height = self.settings.sectionId === 'quickview-template' ?  mirror.height() - 35 : mirror.height();
        $(self.selectors.productThumbs).css('max-height',height+'px');
        mirror.on("mresize",function(){
          var height_ = self.settings.sectionId === 'quickview-template' ? $(this).height() - 35 : $(this).height();
          $(self.selectors.productThumbs).css('max-height',height_+'px');
        });
        $(self.selectors.productThumbs).scroll(function(event) {
          $(self.selectors.productThumbs).find('.slick-arrow').animate({'bottom': $(this).scrollTop() * -1},0);
        });
      }
      if(this.dataSettings.useThumbVertical == false && $('.productThumbSlide--' + this.settings.sectionId + ' .product-single__thumbnails-item').length <= items){
        infinite: false;
      }
      var options = {
        slidesToShow: items,
        infinite: infinite,
        vertical: this.dataSettings.imageSize == 'small' ? false : this.dataSettings.useThumbVertical,
        verticalSwiping: this.dataSettings.imageSize == 'small' ? false : this.dataSettings.useThumbVertical,
        adaptiveHeight: true,
        initialSlide: initialSlide || 0,
        asNavFor: this.selectors.productPhotos,
        arrows: this.dataSettings.useThumbVertical ? true : false,
        prevArrow: '<button type="button" class="slick-prev"><i class="pe-7s-angle-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="pe-7s-angle-right"></i></button>',
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              vertical: false,
              verticalSwiping: false,
              arrows:false
            }
          }
        ]
      };
      $(this.selectors.productThumbs+':not(.first) li:not(.slick-cloned)').eq(options.slidesToShow-1).addClass('last');
      if(this.dataSettings.useThumb === true && this.dataSettings.imageSize !== 'full'){
        var imgLarge = new Image();
        imgLarge.src = $(self.selectors.productThumbs+':not(.first)').find('img').first().attr('src'); 
        imgLarge.onload = function () {
          $(self.selectors.productThumbs+':not(.first)').attr('data-items',options.slidesToShow).slick(options);

          // On after slide change
          $(self.selectors.productThumbs+':not(.first)').on('beforeChange', function(event, slick, currentSlide, nextSlide){
            var options_ = $(self.selectors.productThumbs+':not(.first)').slick('getSlick');
            var lastSlickActive = options_.currentSlide + options_.options.slidesToShow;
            $(self.selectors.productThumbs+':not(.first)').find('li.last').removeClass('last');
            $(self.selectors.productThumbs+':not(.first) li:not(.slick-cloned)').eq(lastSlickActive).addClass('last');
          });
        }
      }
    },

    _destroyThumbnailSlider: function() {
      $(this.selectors.productThumbs).slick('unslick');
      this.settings.sliderActive = false;
    },
    
    _initPhotoSlider: function() {
      var slidesToShow = 1,
          slidesToScroll = 1,
          fade = true,
          self = this;
      if(this.dataSettings.imageSize == 'full'){
        fade = false;
        slidesToShow = this.dataSettings.widthSection ? 2 : 3,
        slidesToScroll = this.dataSettings.widthSection ? 2 : 3;
      }
      if(this.dataSettings.useThumb && this.dataSettings.imageSize !== 'full'){
        var options = {
          dots: false,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows:true,
          prevArrow: '<button type="button" class="slick-prev"><i class="pe-7s-angle-left"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="pe-7s-angle-right"></i></button>',
          adaptiveHeight: true,
          fade: true,
          initialSlide: initialSlide || 0,
          cssEase: 'linear',
          asNavFor: this.selectors.productThumbs
        };
      }else{
        var options = {
          dots: true,
          speed: 300,
          slidesToShow: slidesToShow,
          slidesToScroll: slidesToScroll,
          arrows:true,
          prevArrow: '<button type="button" class="slick-prev"><i class="pe-7s-angle-left"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="pe-7s-angle-right"></i></button>',
          adaptiveHeight: true,
          fade: fade,
          initialSlide: initialSlide || 0,
          cssEase: 'linear'
        };
      }
      var imgLarge = new Image();
      imgLarge.src = $(this.selectors.productPhotos+':not(.first)').find('img').first().attr('data-src'); 
      imgLarge.onload = function () {
        $(self.selectors.productPhotos+':not(.first)').slick(options);
        self._initPhotoSwipeFromDOM();
        // self._getColorsImage();
        if (Modernizr.touch == false && theme.function.photoZoom){
          $(self.selectors.template+' .SlickPhotoswipGallery').zoom({url: $(self.selectors.template+' .SlickPhotoswipGallery .product-single__photos-item.slick-current a').attr('href')});
          $(self.selectors.template+' .SlickPhotoswipGallery').on('afterChange', function(event, slick, currentSlide, nextSlide){
            $(self.selectors.template+' .SlickPhotoswipGallery').trigger('zoom.destroy'); // remove zoom
            $(self.selectors.template+' .SlickPhotoswipGallery').zoom({url: $(self.selectors.template+' .SlickPhotoswipGallery .product-single__photos-item.slick-current a').attr('href')});
          });
          $(document).on('click', 'img.zoomImg', function(event) {
            event.preventDefault();
            $(self.selectors.template+' .product-single__photos-item.slick-slide.slick-current.slick-active img').trigger('click');
          });
        }
      }
    },

    _getColorsImage: function() {
      var self = this;
      var img = document.createElement('img');
      console.log($('.slick-active '+self.selectors.productThumbImages+ ' img'))
      img.setAttribute('src', $('.slick-active '+self.selectors.productThumbImages+ ' img').attr('src').replace('110x110@2x','200x1_crop_center'))
      $(img).chameleon("getImageColors", {
        "onGetColorsSuccess": function(colors, $container, s) {
          $('.product-details-full').css('background-color','#'+colors[1].hex); 
        },
        "onGetColorsError": function(colors, $container, s, img_src) {
          console.log('Error occurred on getImageColors!'); 
        }
      });
    },

    _destroyPhotoSlider: function() {
      $(this.selectors.productPhotos).slick('unslick');
    },

    _initPhotoSwipeFromDOM: function() {
      var self = this;
      theme.initPhotoSwipeFromDOM(this.selectors.template+' .SlickPhotoswipGallery','.grid__item:not(.slick-cloned)','IMG', function(currentIndex, currentItem){
        if($(self.selectors.template+' .SlickPhotoswipGallery .slick-list').length !== 0){
          var itemSlick = $(self.selectors.template+' .SlickPhotoswipGallery').find('.slick-slide:not(.slick-cloned)[data-src="'+currentItem.src+'"]');
          if($(itemSlick).length !== 0){
            var clone_length = ($(self.selectors.template+' .SlickPhotoswipGallery .slick-slide.slick-cloned').length / 2) || 0;
            var slideIndex = $(itemSlick).index() - clone_length;
            $(self.selectors.template+' .SlickPhotoswipGallery').slick('slickGoTo', slideIndex);
          }
        }
      });
    },

    _initStickySummary: function() {
      var thissummary = $('.summary.entry-summary');
      var thissummaryw = thissummary.width();
      var thissummaryo = thissummary.offset();
      var thisposition = $(window).scrollTop() + thissummary[0].getBoundingClientRect().top;
      $(window).scroll(function() {
        // console.log(thissummary[0].getBoundingClientRect().top + thissummary.height())
        var thissummaryh = thissummary.height() + 50;
        if (thissummary !== undefined && $(window).width() >= 768) {
          if ($('.product-page').height() - 30 > $(window).scrollTop() + thissummaryh - thisposition) {
            if ($(window).scrollTop() >= thisposition){
              var transalte = $('.header-position.fixed:not(.hide-header)').length > 0 ? 100 : 20;
              thissummary.not('.fixed').addClass('fixed').removeClass('maxscroll').css({'top': transalte+'px','width': thissummaryw+'px','transform': 'none'});
            }else if($(window).scrollTop() < thisposition){
              thissummary.removeClass('fixed maxscroll').removeAttr('style');
            }
          } else if (thissummary.hasClass('maxscroll') == false && $('.product-page').height() - 30 <= thissummaryh + thissummary.offset().top) {
            var transalte = $('.header-position.fixed:not(.hide-header)').length > 0 ? $('.product-page').height() - thissummaryh + 100 : $('.product-page').height() - thissummaryh + 20;
            thissummary
            .addClass('maxscroll')
            .removeClass('fixed')
            .removeAttr('style')
            .css({'transform': 'translate3d(0px,'+transalte+'px,0px)','-webkit-transform': 'translate3d(0px,'+transalte+'px,0px)','moz-transform': 'translate3d(0px,'+transalte+'px,0px)','-ms-transform': 'translate3d(0px,'+transalte+'px,0px)','-o-transform': 'translate3d(0px,'+transalte+'px,0px)'});
          }
        }
      });
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;
      var self = this;
      var template = self.selectors.template;
      var sectionId = self.settings.sectionId;
      if($('#SingleOptionSelector-0--'+sectionId+'').val() !== undefined ){
        $('#callBackVariant--'+sectionId).attr('class','_'+_handleize($('#SingleOptionSelector-0--'+sectionId).val()));
        if($('#SingleOptionSelector-2--'+sectionId+'').val() !== undefined ){
          $('#callBackVariant--'+sectionId).addClass('_'+_handleize($('#SingleOptionSelector-2--'+sectionId).val()));
        }
        if($('#SingleOptionSelector-1--'+sectionId+'').val() !== undefined ){
          $('#callBackVariant--'+sectionId).addClass('_'+_handleize($('#SingleOptionSelector-1--'+sectionId).val()));
        }
      }
      if (variant) {
        this._changeVariants(variant);
        if ($(self.selectors.productThumbImages).length >= 1) {
          this._updateGallery(variant);
        }
        $(this.selectors.variantSelectorId+ ' span').text(variant.title).animate({"font-size": "14px"}, 400).animate({"font-size": "13px"}, 500);
        $(this.selectors.productPrices).removeClass('visibility-hidden').attr('aria-hidden', 'true');   
        if (variant.available) {
          $(template).find('.kt_progress_bar').removeClass('hidden');
          $(template).find('.out-of-stock').addClass('hidden');
          $(template).find('.availalbe.text-primary').text(theme.strings.inStock);
          $(template).find('.product-form__item--quantity').removeClass('hidden');
          if (variant.inventory_quantity > 0 && variant.inventory_management !== null) {
            $(template).find('.meta .show-iq').removeClass('hidden').find('span').text(variant.inventory_quantity);
            $(template).find('.meta .show-iq_').removeClass('min');
          }else{
            $(template).find('.meta .show-iq').addClass('hidden');
            $(template).find('.meta .show-iq_').addClass('min');
          }
          if($(template).find('.summary .discount-code').length > 0){
            var btn = $(template).find('.summary .discount-code a.discount-btn'), hrefcrr = btn.attr('href'), vridcrr = btn.attr('href').split('/')[2].split(':')[0];
            btn.attr('href', _.replace(hrefcrr, vridcrr, variant.id));
          }
        } else {
          $(template).find('.kt_progress_bar').addClass('hidden');
          $(template).find('.out-of-stock').removeClass('hidden');
          $(template).find('.availalbe.text-primary').text(theme.strings.outOfStock);
          $(template).find('.product-form__item--quantity,.meta .show-iq').addClass('hidden');
          $(template).find('.meta .show-iq_').addClass('min');
        }
        if (variant.available || variant.available && variant.inventory_quantity <= 0 && variant.inventory_policy != 'deny') {
          $(this.selectors.addToCart).prop('disabled', false);
          if (variant.inventory_quantity <= 0 && variant.inventory_policy != 'deny'){
            $(this.selectors.addToCartText).text(theme.strings.preOrder);
          }else{
            $(this.selectors.addToCartText).text(theme.strings.addToCart);
          }
          $(template).find('.shopifyPaymentButton').show()
        } else {
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.soldOut);
          $(template).find('.shopifyPaymentButton').hide()
        }
      }
      else {
        if(goto == true){
          var option1 = $('#SingleOptionSelector-0--'+sectionId).val();
          var option1_cr = _handleize(option1);
          var options = $('#SingleOptionSelector-0--'+sectionId+' option[value="'+option1+'"]').attr('data-first-variant').split(' / ');
          var options_title = $('#SingleOptionSelector-0--'+sectionId+' option[value="'+option1+'"]').attr('data-first-variant-title').split(' / ');
          $(template +' .fake_select li').removeClass('selected');
          $(options).each(function(index, option) {
            console.log(option)
            if(index === 0 && option !== option1_cr ){
              $(template +' .fake_select li._'+option1_cr).addClass('selected');
            }
            else{
              var options_change = $("option[value='"+options_title[index]+"']").val();
              var $options_change_ = $("option[value='"+options_title[index]+"']").parent();
              $(template +' .fake_select li._'+option).addClass('selected');
              $('label[data-change-label="SingleOptionSelector-'+index+'--'+sectionId+'"] .text').text(options_title[index]);
              if(options_change != $options_change_.val()){
                $options_change_.val(options_change).change();
              }
            }
          });
        }
      }
    },

    _updateImages: function(evt) {
      var variant = evt.variant;
      if (variant.featured_image == undefined) {return false}
      variantImage = variant.featured_image.src;
      var sizedImgUrl = theme.Images.getSizedImageUrl(variantImage, this.settings.imageSize);
      
      if($(this.selectors.template).data('use-thumb') === true){
        if(variantImage != undefined && goto == true ){
          var $thumbnail = $(this.selectors.productThumbs+' '+this.selectors.productThumbImages + '[href="' + variantImage.replace('https:', '') + '"]');
          var clone_length = $(this.selectors.productThumbs+' .slick-cloned').length / 2;
          slideIndex = $thumbnail.parent().not('.slick-cloned').index() - clone_length;
          if($(this.selectors.productPhotos+' .slick-list').length !== 0){$(this.selectors.productPhotos).slick('slickGoTo', slideIndex);}
          if($(this.selectors.productThumbs+' .slick-list').length !== 0){
            $(this.selectors.productThumbs).slick('slickGoTo', slideIndex);
            $(this.selectors.productThumbImages).removeClass('active-thumb');
            $thumbnail.addClass('active-thumb');
          }else{
            $(this.selectors.productThumbImages).removeClass('active-thumb');
            $thumbnail.addClass('active-thumb');
          }
        }
      }else{
        if(variantImage != undefined && goto == true ){
          var $photo = $(this.selectors.productPhotos+' '+this.selectors.productPhotoImages + '[href="' + variantImage.replace('https:', '') + '"]');
          slideIndex = $photo.parent().not('.slick-cloned').index() >= 0 ? $photo.parent().not('.slick-cloned').index() : 0;
          if($(this.selectors.productPhotos+' .slick-list').length !== 0){$(this.selectors.productPhotos).slick('slickGoTo', slideIndex);}
        }
      }
    },
    
    _updateGallery: function(variant) {
      var self = this;
      var dataJs = this.dataJs;
      var imgPos = variant.featured_image ? variant.featured_image.position : _.toInteger($(this.selectors.dataJs).attr('data-vrimgpos'));
      var imgspr = _.words(dataJs.imgspos, /[^, ]+/g), imgsArray = _.words(dataJs.primgs, /[^, ]+/g), templateSlick = self.settings.sectionId;
      var htmlPhotoImages = '<div class="photos-wrapper pr"><ul class="grid grid--uniform SlickPhotoswipGallery product-single__photos product-single__photos-'+templateSlick+'">';
      var htmlThumbImages = '<div class="thumbnails-wrapper pr" style="display:none;"><ul class="grid grid--uniform product-single__thumbnails product-single__thumbnails-'+templateSlick+'">';   
      var last_imgPos = $(this.selectors.dataJs).attr('data-vrimgpos');
      if(_.indexOf(imgspr,_.toString(imgPos)) !== -1 && last_imgPos !== _.toString(imgPos) && this.dataSettings.gallery){
        var imgsPos = [];
        _.forEach(imgspr, function(value,idx0) {
          if(_.toInteger(value) >= imgPos){
            if (_.toInteger(value) == imgsArray.length) {
              imgsPos.push(_.toInteger(imgspr[idx0-1]));
              imgsPos.push(_.toInteger(value));
              return false;
            }
            else{
              imgsPos.push(_.toInteger(value));
              imgsPos.push(_.toInteger(imgspr[idx0+1]));
              return false;
            }
          }
        });
        if(dataJs.vrsvideo !== '""' && dataJs.vrsvideo !== "undefined"){
          var vrsVideoArr = [];
          _.forEach(_.words(dataJs.vrsvideo, /[^, ]+/g), function(value, idx) {
            var item = new Object();
            item['position'] = value.split(':')[0];
            item['thumb'] = value.split('|http')[0].split(':')[2];
            item['url'] =  value.split('|http')[1].split(':')[1];
            vrsVideoArr.push(item)
          });
        }
        if(imgspr.length > 1 && _.union(JSON.parse($(this.selectors.dataJs).attr('data-curpos')),imgsPos).length > 2){
          $(this.selectors.template +' .loadingChangeImage').css('display','block');
          var containerImagesW = $(this.selectors.template +' .images').width();
          var containerImagesH = $(this.selectors.template +' .product-images').height();
          $(this.selectors.template +' .images').css({'width':containerImagesW,'height':containerImagesH,'display': 'block'});
          $(this.selectors.dataJs).attr('data-curpos','['+imgsPos[0]+","+imgsPos[1]+']');
          variant.featured_image ? $(this.selectors.dataJs).attr('data-vrimgpos',variant.featured_image.position) : $(this.selectors.dataJs).attr('data-vrimgpos',imgsPos[0]);
          var imgsprw = _.words(dataJs.primgswidth, /[^, ]+/g), imgsprh = _.words(dataJs.primgsheight, /[^, ]+/g);
          if( $(this.selectors.productThumbs).length > 0){
            var image_size = theme.Images.imageSize($(this.selectors.productThumbs+" .product-single__thumbnail-image:first").attr('src'));
          }
          var image_size_ = theme.Images.imageSize($(this.selectors.productPhotos+" .product-single__photo-image:first").attr('src'));
          var count_img = 0;
          var kt_visible = false;
          _.forEach(imgsArray, function(value, idx) {
            kt_visible = false;
            // console.log(_.toInteger(imgsPos[0]), idx+1, _.toInteger(imgsPos[1]))
            if(_.toInteger(imgsPos[0]) <= idx+1 && _.toInteger(imgsPos[1]) > idx+1){
              // console.log(1)
              kt_visible = true;
            }
            if(_.toInteger(imgsPos[0]) == _.toInteger(imgsPos[1]) && _.toInteger(imgsPos[0] == idx+1)){
              // console.log(2)
              kt_visible = true;
            }
            if(_.toInteger(imgsPos[0]) <= idx+1 && _.toInteger(imgsPos[1]) == imgsArray.length){
              // console.log(3)
              kt_visible = true;
            }
            if(kt_visible == true){
              var fileExt = _.last(value.split('.')), img_url_thumb = _.replace(value, '.'+fileExt, '_'+image_size+'.'+fileExt), img_url_photo = _.replace(value, '.'+fileExt, '_'+image_size_+'.'+fileExt);
              var altobj = _.find(self.productSingleObject.variants, function(o) { return o.id == dataJs.vrsFeaturedImg[idx].id});
              var alt = altobj !== undefined ? altobj.featured_image.alt : self.productSingleObject.title;              
              htmlPhotoImages += '<li class="grid__item product-single__photos-item">';
              htmlPhotoImages += '<a href="'+_.replace(dataJs.imgurl, 'kiti', img_url_photo)+'" class="gallery-image product-single__photo product-single__photo--'+templateSlick+'">';
              htmlPhotoImages += '<img class="product-single__photo-image img-responsive lazyload" data-src="'+ _.replace(dataJs.imgurl, 'kiti', img_url_photo) +'" data-srcfix="'+_.replace(dataJs.imgurl, 'kiti', value)+'" data-size="'+imgsprw[idx]+'x'+imgsprh[idx]+'" alt="'+alt+'">';
              htmlPhotoImages += '</a></li>';
              if( $(self.selectors.productThumbs).length > 0){
                htmlThumbImages += '<li class="grid__item product-single__thumbnails-item">';
                htmlThumbImages += '<a href="'+_.replace(dataJs.imgurl, 'kiti', value)+'" class="text-link product-single__thumbnail product-single__thumbnail--'+templateSlick+'"';
                htmlThumbImages += ' title="'+dataJs.vrsFeaturedImg[idx].title+'"';
                htmlThumbImages += ' data-src="'+_.replace(dataJs.imgurl, 'kiti', value)+'"';
                htmlThumbImages += ' data-id="'+dataJs.vrsFeaturedImg[idx].id+'">';
                htmlThumbImages += '<img class="product-single__thumbnail-image img-responsive" src="'+ _.replace(dataJs.imgurl, 'kiti', img_url_thumb) +'" alt="'+self.productSingleObject.title+'">';
                htmlThumbImages += '</a></li>';
              }
              count_img++
            }
          });
          htmlPhotoImages += '</ul></div>';
          htmlThumbImages += '</ul></div>';
          var templateImages = self.selectors.template;
          if( count_img > 1){
            $(templateImages +' .main-image').removeAttr('style');
            $(templateImages +' .thumbnails-wrapper').removeAttr('style');
          }else{
            $(templateImages +' .main-image').css({'padding': '0','width': '100%'});
            $(templateImages +' .thumbnails-wrapper').css('display','none');
          }
          $(this.selectors.template).find('.photos-wrapper').addClass('first');
          $(this.selectors.template).find('.thumbnails-wrapper').addClass('first');
          $(this.selectors.productPhotos).first().addClass('first');
          $(this.selectors.productThumbs).first().addClass('first');
          if($(self.selectors.productThumbs+' .slick-list').length !== 0){
            this._destroyThumbnailSlider();
          }
          if($(self.selectors.template+' .SlickPhotoswipGallery .slick-list').length !== 0){
            this._destroyPhotoSlider();
            $(this.selectors.template).find('.main-image-wapper .resize').remove();
          }
          if( $(this.selectors.productThumbs).length > 0){
            $(this.selectors.template).find('#product-thumb-slide').append(count_img > 1 ? _.replace(htmlThumbImages,' style="display:none;"','') : htmlThumbImages)
            .animate({'opacity': 1},'0', function() {
              var imgLarge = new Image();
              imgLarge.src = $(htmlThumbImages).find('img').first().attr('src'); 
              imgLarge.onload = function () {
                $(self.selectors.template +' .loadingChangeImage').css('display','none');
                self._initThumbnailSlider();
                $(self.selectors.template).find('.thumbnails-wrapper.first').animate({'opacity': 0},'100', function() {
                  $(this).remove();
                });
                if($(self.dataSettings.useThumb)){
                  self._setActiveThumbnail();
                }
              }
            })
          }
          $(this.selectors.template).find('.main-image-wapper').append(htmlPhotoImages).animate({'opacity': 1},'0', function() {
            var imgLarge = new Image();
            imgLarge.src = $(htmlPhotoImages).find('img').first().attr('data-src'); 
            imgLarge.onload = function () {
              $(self.selectors.template +' .loadingChangeImage').css('display','none');
              if(self.dataSettings.layoutSection !== 3){
                self._initPhotoSlider();
                $(self.selectors.template +' .images').removeAttr('style')
              }else if(self.dataSettings.layoutSection == 3){
                self._initPhotoSwipeFromDOM();
              }
              $(self.selectors.template).find('.photos-wrapper.first').animate({'opacity': 0},'100', function() {
                $(this).remove();
              })
            }
          })

          var vrvideo = _.find(vrsVideoArr, function(o) { return o.position == imgsPos[0] });
          if(vrvideo !== undefined){
            $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id).removeClass('hidden');
            if((vrvideo.url).indexOf('.mp4') !== -1){
              $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id)
              .magnificPopup({
                items: [
                  {
                    src: '<div class="white-popup"><div class="white-popupcontent"><video class="amp-page amp-video-element" id="myVideo_product" controls="controls" autoplay><source type="video/mp4" src="'+vrvideo.url+'"></video></div></div>',
                    type: 'inline'
                  }
                ],
                type: 'image'
              });
            }else if((vrvideo.url).indexOf('youtube.com') !== -1 || (vrvideo.url).indexOf('vimeo.com') !== -1){
              $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id)
              .magnificPopup({
                items: [
                  {
                    src: vrvideo.url,
                    type: 'iframe'
                  }
                ],
                type: 'image'
              });
            }
          }else{
            $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id).addClass('hidden');
          }
        }
      }
    },

    _checkVariantVideo: function() {
      var dataJs = this.dataJs;
      var imgspr = _.words(dataJs.imgspos, /[^, ]+/g);
      var imgPos = this.variants.currentVariant.featured_image ? this.variants.currentVariant.featured_image.position : _.toInteger($(this.selectors.dataJs).attr('data-vrimgpos'));
      var imgsPos = [];
      _.forEach(imgspr, function(value,idx0) {
        if(_.toInteger(value) >= imgPos){
          imgsPos.push(_.toInteger(value));
          imgsPos.push(_.toInteger(imgspr[idx0+1]));
          return false;
        }
      });
      if(dataJs.vrsvideo !== '""' && dataJs.vrsvideo !== "undefined"){
        var vrsVideoArr = [];
        _.forEach(_.words(dataJs.vrsvideo, /[^, ]+/g), function(value, idx) {
          var item = new Object();
          item['position'] = value.split(':')[0];
          item['thumb'] = value.split('|http')[0].split(':')[2];
          item['url'] =  value.split('|http')[1].split(':')[1];
          vrsVideoArr.push(item)
        });
      }
      var vrvideo = _.find(vrsVideoArr, function(o) { return o.position == imgsPos[0] });
      if(vrvideo !== undefined){
        $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id).removeClass('hidden');
        if((vrvideo.url).indexOf('.mp4') !== -1){
          $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id)
          .magnificPopup({
            items: [
              {
                src: '<div class="white-popup"><div class="white-popupcontent"><video class="amp-page amp-video-element" id="myVideo_product" controls="controls" autoplay><source type="video/mp4" src="'+vrvideo.url+'"></video></div></div>',
                type: 'inline'
              }
            ],
            type: 'image'
          });
        }else if((vrvideo.url).indexOf('youtube.com') !== -1 || (vrvideo.url).indexOf('vimeo.com') !== -1){
          $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id)
          .magnificPopup({
            items: [
              {
                src: vrvideo.url,
                type: 'iframe'
              }
            ],
            type: 'image'
          });
        }
      }else{
        $('.pe-7s-play.kt_openvd_'+this.productSingleObject.id).addClass('hidden');
      }
    },

    _create360: function(variant) {
      var dataJs = this.dataJs
          self = this;
      // Check 360 available
      var imgsPos360 = _.words(dataJs.imgspos360, /[^, ]+/g), primgs = _.words(dataJs.primgs, /[^, ]+/g), imgsprw = _.words(dataJs.primgswidth, /[^, ]+/g), imgsprh = _.words(dataJs.primgsheight, /[^, ]+/g);
      if(imgsPos360 !== '""' && imgsPos360 !== "undefined" && imgsPos360.length > 0){
        var files = [];
        _.forEach(primgs, function(value, idx) {
          if(_.toInteger(imgsPos360[0]) <= idx+1 && idx+1 < _.toInteger(imgsPos360[1])){
            var file = _.replace(dataJs.imgurl, 'kiti', value);
            files.push(file)
          }
        });
        theme.imgs360(files,imgsPos360,imgsprw[imgsPos360[0]],imgsprh[imgsPos360[0]],this.productSingleObject.id);
        $('.pe-360-degrees.kt_open_'+this.productSingleObject.id).removeClass('hidden')
      }
      if(self.settings.sectionId == 'quickview-template'){
        $(document).on('click','#myModal button.close', function () {
          $('.myModalThreeSixty.kt_'+self.productSingleObject.id).modal('hide').remove();
          $('#sizeGuide_and_shipping').remove();
        });
        $('#myModal').on('hidden.bs.modal', function () {
          $('.myModalThreeSixty.kt_'+self.productSingleObject.id).modal('hide').remove();
          $('#sizeGuide_and_shipping').remove();
        })
      }
    },
    
    _updatePrice: function(evt) {
      var variant = evt.variant;
      var self = this;
      var template = self.selectors.template;
      // Update the product price
      $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      $(this.selectors.originalPrice.replace('#','.')).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice)
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('hide');
        $(this.selectors.comparePrice.replace('#','.'))
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('hide');
        $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);
        $(this.selectors.saleLabel).removeClass('hide');
      } else {
        $(this.selectors.comparePrice).addClass('hide');
        $(this.selectors.comparePrice.replace('#','.')).addClass('hide');
        $(this.selectors.saleLabel).addClass('hide');
        $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
      }
      if(theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency){
        Currency.convertAll(shopCurrency,cookieCurrency,template+' .entry-summary span.money');
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;

      // Update the sku
      $(this.selectors.SKU).html(variant.sku);
    },

    onUnload: function() {
      this.$container.off(this.settings.namespace);
    }
  });

  return Product;
})();

theme.Quotes = (function() {
  var config = {
    mediaQuerySmall: 'screen and (max-width: 749px)',
    mediaQueryMediumUp: 'screen and (min-width: 750px)',
    slideCount: 0
  };
  var defaults = {
    accessibility: true,
    arrows: false,
    dots: true,
    autoplay: false,
    touchThreshold: 20,
    slidesToShow: 3,
    slidesToScroll: 3
  };

  function Quotes(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var wrapper = this.wrapper = '.quotes-wrapper';
    var slider = this.slider = '#Quotes-' + sectionId;
    var $slider = $(slider, wrapper);

    var sliderActive = false;
    var mobileOptions = $.extend({}, defaults, {
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true
    });

    config.slideCount = $slider.data('count');

    // Override slidesToShow/Scroll if there are not enough blocks
    if (config.slideCount < defaults.slidesToShow) {
      defaults.slidesToShow = config.slideCount;
      defaults.slidesToScroll = config.slideCount;
    }

    $slider.on('init', this.a11y.bind(this));

    enquire.register(config.mediaQuerySmall, {
      match: function() {
        initSlider($slider, mobileOptions);
      }
    });

    enquire.register(config.mediaQueryMediumUp, {
      match: function() {
        initSlider($slider, defaults);
      }
    });

    function initSlider(sliderObj, args) {
      if (sliderActive) {
        sliderObj.slick('unslick');
        sliderActive = false;
      }

      sliderObj.slick(args);
      sliderActive = true;
    }
  }

  Quotes.prototype = _.assignIn({}, Quotes.prototype, {
    onUnload: function() {
      enquire.unregister(config.mediaQuerySmall);
      enquire.unregister(config.mediaQueryMediumUp);

      $(this.slider, this.wrapper).slick('unslick');
    },

    onBlockSelect: function(evt) {
      // Ignore the cloned version
      var $slide = $('.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
      var slideIndex = $slide.data('slick-index');

      // Go to selected slide, pause autoplay
      $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
    },

    a11y: function(event, obj) {
      var $list = obj.$list;
      var $wrapper = $(this.wrapper, this.$container);

      // Remove default Slick aria-live attr until slider is focused
      $list.removeAttr('aria-live');

      // When an element in the slider is focused set aria-live
      $wrapper.on('focusin', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.attr('aria-live', 'polite');
        }
      });

      // Remove aria-live
      $wrapper.on('focusout', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.removeAttr('aria-live');
        }
      });
    }
  });

  return Quotes;
})();

theme.slideshows = {};

theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var slideshow = this.slideshow = '#Slideshow-' + sectionId;

    $('.slideshow__video', slideshow).each(function() {
      var $el = $(this);
      theme.SlideshowVideo.init($el);
      theme.SlideshowVideo.loadVideo($el.attr('id'));
    });

    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }

  return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
  onUnload: function() {
    delete theme.slideshows[this.slideshow];
  },

  onBlockSelect: function(evt) {
    var $slideshow = $(this.slideshow);

    // Ignore the cloned version
    var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
    var slideIndex = $slide.data('slick-index');

    // Go to selected slide, pause autoplay
    $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
  },

  onBlockDeselect: function() {
    // Resume autoplay
    $(this.slideshow).slick('slickPlay');
  }
});

window.theme = theme || {};

theme.Carousel = (function() {
  /* ---------------------------------------------
   Owl carousel
   --------------------------------------------- */
   function init(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var carousel = this.carousel = '#Carousel-' + sectionId;
    $('#shopify-section-'+sectionId+' .owl-carousel').not('.kt-carousel').each(function() {
      var config = $(this).data();
      var navText = $(this).data('nav-text');
      var animateOut = $(this).data('animateout');
      var animateIn = $(this).data('animatein');
      if(typeof animateOut != 'undefined' ){
        config.animateOut = animateOut;
      }
      if(typeof animateIn != 'undefined' ){
        config.animateIn = animateIn;
      }
      if(typeof (navText) != 'undefined' ){
        config.navText = ['prev','next'];
      }
      config.lazyLoad = true;
      var owl = $(this);
      
      if(owl.hasClass('testimonial-owl')){
        config.navText = ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'];
      }
      $('.kt_home_slide .item__').css({'float':'none','width':'auto'});
      owl.on('initialized.owl.carousel', function(event) {
        $('.carouselLoading').not('.kt-carousel').removeClass('carouselLoading');
      });
      owl.owlCarousel(config);
            
      if(owl.hasClass('testimonial-owl')){
        owl.trigger('next.owl.carousel');
      }
      owl.on('changed.owl.carousel', function(event) {
        if(owl.hasClass('testimonial-owl')){
          owl.find('.owl-item.active').removeClass('item-center');
          var caption = owl.find('.owl-item.active').first().next().find('.inner').html();

          var t = owl.closest('.testimonials-owl-3').find('.testimonial-info');
          var animated = t.data('animated');
          t.html(caption).addClass('animated '+animated).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).removeClass('animated '+animated);
          });
          setTimeout(function(){
            owl.find('.owl-item.active').first().next().addClass('item-center');
          }, 100);
        }
      })
    });
   }
  /* ---------------------------------------------
   Owl carousel mobile
   --------------------------------------------- */
  function initCarouselMobile(){
    var window_size = jQuery('body').innerWidth();
    window_size += theme.getScrollbarWidth();
    if( window_size < 768 ){
      $('.owl-carousel-mobile').each(function(){
        $(this).addClass('owl-carousel')
        var config = $(this).data();
        var animateOut = $(this).data('animateout');
        var animateIn = $(this).data('animatein');
        if(typeof animateOut != 'undefined' ){
          config.animateOut = animateOut;
        }
        if(typeof animateIn != 'undefined' ){
          config.animateIn = animateIn;
        }
        var owl = $(this);
        owl.owlCarousel(config);
      });
    }else{
      $('.owl-carousel-mobile').each(function(){
        var owl = $(this);
        owl.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
        owl.find('.owl-stage-outer').children().unwrap();
      })
    }
  }
  return{
    init: init,
    initCarouselMobile: initCarouselMobile
  };
})();

window.theme = window.theme || {};

theme.CarouselSection = (function() {
  function Carousel(container) {
    var $container = this.$container = $(container);
    theme.Carousel.init(container);
    theme.Carousel.initCarouselMobile(container);
  }
  return Carousel;
})();

window.theme = theme || {};

theme.TabOwlFadeEffect = (function() {
  // effect first tab
  var sleep = 0;
  $('.tab-owl-fade-effect .nav-tab>li.active a[data-toggle="tab"]').each(function(){
    var tabElement = $(this);
    setTimeout(function() {
      tabElement.trigger('click');
    }, sleep);
    sleep += 10000
  })
  // effect click
  $(document).on('click','.tab-owl-fade-effect a[data-toggle="tab"]',function(){
    var tab_id = $(this).attr('href');
    var tab_animated = $(this).data('animated');
    tab_animated = ( tab_animated == undefined || tab_animated =="" ) ? 'fadeInUp' : tab_animated;
    $(tab_id).find('.owl-item.active').each(function(i){
      var t = $(this);
      var style = t.attr("style");
      style = ( style == undefined ) ? '' : style;
      var delay  = i * 400;
      t.attr("style", style +
             ";-webkit-animation-delay:" + delay + "ms;"
             + "-moz-animation-delay:" + delay + "ms;"
             + "-o-animation-delay:" + delay + "ms;"
             + "animation-delay:" + delay + "ms;"
            ).addClass(tab_animated+' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        t.removeClass(tab_animated+' animated');
        t.attr("style", style);
      });
    })
  })
});
  
window.theme = theme || {};

theme.TabProductFadeEffect = (function() {
  // effect first tab
  var sleep = 0;
  $('.tab-product-fade-effect .nav-tab>li.active a[data-toggle="tab"]').each(function(){
    var tabElement = $(this);
    setTimeout(function() {
      tabElement.trigger('click');
    }, sleep);
    sleep += 10000
  })
  // effect click
  $(document).on('click','.tab-product-fade-effect a[data-toggle="tab"]',function(){
    var tab_id = $(this).attr('href');
    var tab_animated = $(this).data('animated');
    tab_animated = ( tab_animated == undefined || tab_animated =="" ) ? 'fadeInUp' : tab_animated;
    $(tab_id).find('.grid-item').each(function(y){
      var t = $(this);
      var style = t.attr("style");
      style = ( style == undefined ) ? '' : style;
      var delay  = y * 400;
      t.attr("style", style +
             ";-webkit-animation-delay:" + delay + "ms;"
             + "-moz-animation-delay:" + delay + "ms;"
             + "-o-animation-delay:" + delay + "ms;"
             + "animation-delay:" + delay + "ms;"
            ).addClass(tab_animated+' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        t.removeClass(tab_animated+' animated');
        t.attr("style", style);
      });
    })
  })
});

window.theme = theme || {};
theme.ProductsMasorySection = (function() {  
  function MasorySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var masory = this.masonry = '#Masory-' + sectionId;
    var $grid = $(masory+ '.ly__ms_items').isotope({
      itemSelector: '.grid-item',
      masonry: {
        horizontalOrder: true,
        percentPosition: true
      },
      transitionDuration: '.8s'
    });
    $grid.imagesLoaded().progress( function() {
      $grid.isotope('layout');      
      theme.checkProductGrid_Width();
    });
  }
  return MasorySection;
})();

window.theme = theme || {};
theme.ContentMasorySection = (function() {  
  function MasorySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var masory = this.masonry = '#MasoryBlock-' + sectionId;
    var $grid = $(masory+ ' .block_masonry').isotope({
      itemSelector: '.block-kt-banner',
      layoutMode: 'packery',
      masonry: {
        horizontalOrder: true,
        percentPosition: true
      },
      transitionDuration: '.8s'
    });
  }
  return MasorySection;
})();

window.theme = theme || {};
theme.BannerByPage = (function() {  
  function BannerSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    
    // headerBannerByPage
    var headerBBP = '';
    var sectionBanner = $('div[data-section-id="'+sectionId+'"]')
    var bannerCrr = sectionBanner.attr('data-collection');
    if(headerBanner !== undefined && headerBanner !== null){
      _.forEach(headerBanner, function(block,idx0) {
        var headerBBPItem = "";
        if(block.settings.image_1 == null && block.settings.image_2 == null && block.settings.image_3 == null){
          sectionBanner.slideUp('slow');
        }
        else{
          if(block.settings.use_parallax ==  false){
          headerBBPItem += '<div class="';
          if(block.settings.width_section == true){
            headerBBPItem += 'container';
          }
          headerBBPItem += '">';
          }
          if(block.type == 'collection_banner'){
            var listHandle = _.split(block.settings.by_collections_11, ',');
          }
          else if(block.type == 'product_banner'){
            var listHandle = _.split(block.settings.by_product_11, ',');
          }
          else if(block.type == 'blog_banner'){
            var listHandle = _.split(block.settings.by_blog_11, ',');
          }
          else if(block.type == 'article_banner'){
            var listHandle = _.split(block.settings.by_article_11, ',');
          }
          else if(block.type == 'page_banner'){
            var listHandle = _.split(block.settings.by_page_11, ',');
          }
          _.find(block.settings, function(itemCll,itemName) {
            if(page.Han == itemCll && bannerCrr !== itemCll || _.indexOf(listHandle,page.Han) >= 0 && listHandle.length > 0 && itemName == 'by_collections_11' && bannerCrr !== itemCll){
              var imgCount = 0;
              if(block.settings.image_1 != null){imgCount++}
              if(block.settings.image_2 != null){imgCount++}
              if(block.settings.image_3 != null){imgCount++}
              var data_loop = imgCount == 1 ? 'false' : 'true';
              headerBBPItem += '<div class="shop-banner" style="margin-bottom:'+block.settings.margin_bt+'px">';
              if(block.settings.use_parallax){
                headerBBPItem += '<div class="parallax-section page-banner bg-parallax" style="background-image: url('+block.settings.image_1+')" data-parallax-speed="0.1">';
                  headerBBPItem += '<div class="parallax_page_content">';
                    headerBBPItem += '<div class="container">';
                      headerBBPItem += '<div class="banner-content text-center"> <span class="subtitle">'+block.settings.text_parallax+'</span>';
                        headerBBPItem += '<h2 class="title">'+block.settings.title_parallax+'</h2>';
                      headerBBPItem += '</div>';
                    headerBBPItem += '</div>';
                  headerBBPItem += '</div>';
                  headerBBPItem += '<div class="overlay"></div>';
                headerBBPItem += '</div>';
              }
              else{
                headerBBPItem += '<div class="kt-carousel nav-center-center nav-style7 carouselLoading" data-autoplay="true" data-loop="'+data_loop+'" data-items="1" data-dots="false" data-nav="true" data-auto-height="true" data-animateout="fadeOut" data-animatein="fadeIn">';
                if(block.settings.image_1 != null){
                  headerBBPItem += '<img class="grid-view-item__image key_image lazyload" src="'+(block.settings.image_1).replace('.jpg?','_50x.jpg?')+'" data-src="'+block.settings.image_1+'" alt="">';
                }
                if(block.settings.image_2 != null){
                  headerBBPItem += '<img class="grid-view-item__image lazyload" src="'+(block.settings.image_2).replace('.jpg?','_50x.jpg?')+'" data-src="'+block.settings.image_2+'" alt="">';
                }
                if(block.settings.image_3 != null){
                  headerBBPItem += '<img class="grid-view-item__image lazyload" src="'+(block.settings.image_3).replace('.jpg?','_50x.jpg?')+'" data-src="'+block.settings.image_3+'" alt="">';
                }
                headerBBPItem += '</div>';
              }
              headerBBPItem += '</div>';
              if(sectionBanner.hasClass('default')){
                sectionBanner.removeClass('default').attr('data-collection',itemCll);
              }
              // console.log(block.settings)
            }
            else if(page.Han == itemCll && bannerCrr === itemCll || _.indexOf(listHandle,page.Han) >= 0 && listHandle.length > 0 && itemName == 'by_collections_11' && bannerCrr === itemCll){
              headerBBP = 'showing';
            }
          });
          if(block.settings.use_parallax ==  false){
          headerBBPItem += '</div>';
          }
        }
        if(headerBBPItem.indexOf('//cdn.') !== -1){
          headerBBP += headerBBPItem;
        }
      });
      if(headerBBP === 'showing'){
        sectionBanner.slideDown('slow');
        sectionBanner.find('img').css('opacity',1)
      }
      else if(headerBBP !== ''){
        var headerBBPowl = sectionBanner;
        headerBBPowl.html(headerBBP).slideDown('slow',function(){
          if(headerBBPowl.find('img').length > 1){
            headerBBPowl.find('.carouselLoading').addClass('owl-carousel');
            var config = headerBBPowl.find('.kt-carousel').data();
            headerBBPowl.find('.kt-carousel').on('initialized.owl.carousel', function(event) {
              headerBBPowl.find('.carouselLoading').removeClass('carouselLoading');
            });
            sectionBanner.find('img.key_image').imagesLoaded().done( function() {
              headerBBPowl.find('.kt-carousel').owlCarousel(config);
            });
          }
          else{
            sectionBanner.find('img.key_image').imagesLoaded().done( function() {
              kt_parallax();
            });
          }
        });
        sectionBanner.addClass('default');
      }
      else{
        sectionBanner.slideUp('slow');
      }
    }
  }
  return BannerSection;
})();

window.theme = theme || {};
theme.BannerMasorySection = (function() {  
  function MasorySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var $grid = $('#shopify-section-'+sectionId+' .banner_masonry').isotope({
      itemSelector: '.banner--grid-item',layoutMode: 'packery',
      masonry: {
        horizontalOrder: true,
        percentPosition: true
      },
      transitionDuration: '.8s'
    });
    $grid.imagesLoaded().progress( function() {
      $grid.isotope('layout');
    });
  }
  function carouselBanner(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    $('#shopify-section-'+sectionId+' .owl-carousel').each(function() {
      var config = $(this).data();
      var navText = $(this).data('nav-text');
      var animateOut = $(this).data('animateout');
      var animateIn = $(this).data('animatein');
      if(typeof animateOut != 'undefined' ){
        config.animateOut = animateOut;
      }
      if(typeof animateIn != 'undefined' ){
        config.animateIn = animateIn;
      }
      if(typeof (navText) != 'undefined' ){
        config.navText = ['prev','next'];
      }
      config.lazyLoad = true;
      var owl = $(this);
      owl.on('initialized.owl.carousel', function(event) {
        $('.carouselLoading').not('.kt-carousel').removeClass('carouselLoading');
      });
      owl.owlCarousel(config);
    });
  }
  return{
    MasorySection:MasorySection,
    carouselBanner: carouselBanner
  }
})();

window.theme = theme || {};

theme.Instagram = (function() {  
  function Instagram(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    $('#shopify-section-'+sectionId+' .instagramWrapper').each(function() {
      var ul_ins = $(this),
        user_name = ul_ins.data('username'),
        limit = ul_ins.data('limit');
      if("" == user_name) return;
      $.ajax({
        url: 'https://api.teathemes.net/instagram?username='+user_name,
        dataType: 'json',
        type: 'GET',
        success: function(responsive) {
          // console.log(responsive.entry_data.ProfilePage[0].user.media.nodes);
          var html = '',
            img_url = null,
            data = responsive.entry_data.ProfilePage[0].user.media.nodes;
          $.each(data, function(index, element) {
            if(index >= limit) return 0;
            var img_url_150 = element.thumbnail_resources[0].src,
              img_url_240 = element.thumbnail_resources[1].src,
              img_url_320 = element.thumbnail_resources[2].src,
              img_url_480 = element.thumbnail_resources[3].src,
              img_url_640 = element.thumbnail_resources[4].src;
            html += '<div class="item pr padding-0 col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2"><a class="db pr oh banner-opacity" href="//instagram.com/p/' + element.code + '"><img src="' + img_url_150 + '" data-src="' + img_url_150 + '" data-sizes="auto" data-srcset="' + img_url_150 + ' 150w,' + img_url_240 + ' 240w,' + img_url_320 + ' 320w,' + img_url_480 + ' 480w,' + img_url_640 + ' 640w" class="w__100 lazyload img-responsive" alt="'+user_name+'"><div class="info pa text-center"><span class="pr cw mgr10"><i class="fa fa-heart-o mr__5"></i>' + element.likes.count + '</span><span class="pr cw"><i class="fa fa-comments-o mr__5"></i>' + element.comments.count + '</span></div></a></div>';
          });
          ul_ins.html(html);
        },
        error: function(data) {
          console.log('ajax error');
        },
        complete: function() {
          // if(typeof ul_ins_slider !== 'undefined') {
          //   ul_ins_slider.not('.slick-initialized').slick();
          // }
        }
      });
    });
  }
  return Instagram;
})();

theme.variantImage = (function(){
  $('.product-list-color-swatch .swatch-on-grid').on('mouseenter',function(event){
    event.preventDefault();
    var image = $(this).find('.swatch').css('background-image').replace(/(url\(|\)|'|")/gi, '');
    if(image != 'none'){
      $(this).parents('.item-wrap').find('.item-thumb').addClass('loading_vaimg');
      $(this).parents('.item-wrap').find('.item-thumb img').attr({'src':image.replace('_icon','_480x')})
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(1)').attr('srcset',image.replace('_icon','_510x'));
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(2)').attr('srcset',image.replace('_icon','_476x'));
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(3)').attr('srcset',image.replace('_icon','_256x'));
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(4)').attr('srcset',image.replace('_icon','_570x'));
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(5)').attr('srcset',image.replace('_icon','_384x'));
      $(this).parents('.item-wrap').find('.item-thumb picture source:nth-child(6)').attr('srcset',image.replace('_icon','_480x'));
      var images = $(this).parents('.item-wrap').find('img');
      var loadedImgNum = 0;
      images.on('load', function(){
        loadedImgNum += 1;
        if (loadedImgNum == images.length) {
          $(this).parents('.item-wrap').find('.item-thumb').removeClass('loading_vaimg');
        }
      });
      setTimeout(function(){
        $('.item-thumb').removeClass('loading_vaimg');
      },1200);
    }
  })
})

theme.menuBgChange = (function(){
  $(document).on('mouseenter','a.bgChange',function(event){
    event.preventDefault();
    var image = $(this).attr('data-hover-image');
    var content = $(this).attr('data-hover-banner');
    if(image !== undefined || content !== undefined ){
      $(this).parents('.sub-menu.megamenu').addClass('hiddenBg');    
      if($(this).parents('.sub-menu.megamenu').find('.imgByCollection').length == 0){
        if(image !== undefined){
          $(this).parents('.sub-menu.megamenu').append('<img class="imgByCollection" src="'+image+'" >');
        }else{
          $('.imgByCollection').remove();
          $(this).parents('.sub-menu.megamenu').append(content);
        }
      }else{
        $('.sub-menu.megamenu a.img-cate').remove();
        if(image !== undefined){
          $('.imgByCollection').show();
          $(this).parents('.sub-menu.megamenu').find('.imgByCollection').attr('src',image);
        }else{
          $('.imgByCollection').hide();
          $(this).parents('.sub-menu.megamenu').append(content);
        }
      }
    }
  })
  .on('mouseleave','a.bgChange',function(event){
    $(this).parents('.sub-menu.megamenu').removeClass('hiddenBg');
    $('.imgByCollection').hide();
    $('.sub-menu.megamenu a.img-cate').hide();
  });
});

theme.checkProductGrid_Width = (function(){
  $('.quickshopForm').each(function(){
    var parentHeight = $(this).parents('.product-item').find('.product-thumb').height();
    $(this).parents('.product-item').addClass('normalQuickshop');
    $(this).css('max-height',parentHeight);
  });
  $('li.grid-item .product-item').each(function(){
    var parentWidth = $(this).width();
    if(parentWidth < 230){
      $(this).addClass('smallCard').removeClass('normalCard');
    }
    else{
      $(this).addClass('normalCard').removeClass('smallCard');
    }
  });
});

theme.Quantity = (function(){  
  $('.quantity-inner').each(function() {
    if($(this).hasClass('checked') == false){      
      var spinner = $(this),
          input = spinner.find('input[type="number"]'),
          btnUp = spinner.find('.quantity-up'),
          btnDown = spinner.find('.quantity-down'),
          min = input.attr('min'),
          max = input.attr('max');

      btnUp.click(function() {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
          var newVal = oldValue;
        } else {
          var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
      });

      btnDown.click(function() {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
          var newVal = oldValue;
        } else {
          var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
      });
    spinner.addClass('checked');
    }
  });
});

theme.initPhotoSwipeFromDOM = (function(gallerySelector, elcloned, tgName, callback){
    // loop through all gallery elements and bind events
    var galleryElements = $( gallerySelector );
    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
      // build items array
      var itemsArray = $(el).find(elcloned+' [data-size]');
      var items = [];
      _.forEach(itemsArray, function(elItem, idx) {
        var item = new Object();
        item['src'] = $(elItem).attr('data-srcfix');
        item['w'] = $(elItem).attr('data-size').split('x')[0];
        item['h'] = $(elItem).attr('data-size').split('x')[1];
        items.push(item)
      });
      return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
      return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;

      var eTarget = e.target || e.srcElement;

      // find root element of slide
      var clickedListItem = closest(eTarget, function(el) {
        return (el.tagName && el.tagName.toUpperCase() === tgName);
      });
      if(!clickedListItem) {
        return;
      }

      // find index of clicked item by looping through all child nodes
      // alternatively, you may define index via data- attribute
      var clickedGallery = $(clickedListItem).parents(gallerySelector),
          childNodes = clickedGallery.find(elcloned+' [data-size]'),
          numChildNodes = childNodes.length,
          nodeIndex = 0,
          index;
      for (var i = 0; i < numChildNodes; i++) {
        if(childNodes[i] === clickedListItem) {
          index = nodeIndex;
          break;
        }
        nodeIndex++;
      }
      if(index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe( index, clickedGallery );
      }
      return false;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
      var pswpElement = $('.pswp')[0],
          gallery,
          options,
          items;

      items = parseThumbnailElements(galleryElement);

      // define options (if needed)
      options = {
        // history & focus options are disabled
        history: false,
        focus: false,

        // define gallery index (for URL)
        galleryUID: $(galleryElement).attr('data-pswp-uid'),

        getThumbBoundsFn: function(index) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          var thumbnail = $(galleryElement).find(elcloned+' [data-size]')[index], // find thumbnail
              pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect(); 

          return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        },
        shareButtons: [
          {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
          {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
          {id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'}
        ]

      };

      // PhotoSwipe opened from URL
      if(fromURL) {
        if(options.galleryPIDs) {
          // parse real index when custom PIDs are used 
          // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
          for(var j = 0; j < items.length; j++) {
            if(items[j].pid == index) {
              options.index = j;
              break;
            }
          }
        } else {
          // in URL indexes start from 1
          options.index = parseInt(index, 10) - 1;
        }
      } else {
        options.index = parseInt(index, 10);
      }

      // exit if index not found
      if( isNaN(options.index) ) {
        return;
      }

      if(disableAnimation) {
        options.showAnimationDuration = 0;
      }
      
      // Pass data to PhotoSwipe and initialize it
      gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
      gallery.init();
      gallery.listen('afterChange', function() {
        callback(gallery.getCurrentIndex(),gallery.currItem)
      });
    };

    for(var i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i+1);
      galleryElements[i].onclick = onThumbnailsClick;
    }
})

theme.imgs360 = (function(files,position,width,height,vrId) {
  var totalFrames = position[1] - position[0];
  var myModalThreeSixty = '<section class="modal animated fadeIn myModalThreeSixty kt_'+vrId+'" data-vr-id="'+vrId+'" data-total-frames="'+totalFrames+'" data-end-frames="'+totalFrames+'" data-files="'+files+'" data-width="'+width+'" data-height="'+height+'" aria-hidden="false" role="dialog" tabindex="-1"> <div class="modal-dialog modal-lg"> <div class="modal-content"> <button class="close animate"> <span aria-hidden="true">×</span> </button> <div class="content-item row"> <div class="threesixty productThreeSixty"> <div class="spinner"> <span>0%</span> </div><ol class="threesixty_images"></ol> </div></div></div></div></section>';
  $('body').append(myModalThreeSixty);
  $(document).on('click','button.pe-360-degrees.kt_open_'+vrId,function(e){
    $('.myModalThreeSixty.kt_'+vrId).modal();
    var dataJs = $('.myModalThreeSixty.kt_'+vrId);
    var options = {
      totalFrames: dataJs.attr('data-total-frames'),
      endFrame: dataJs.attr('data-end-frames'), 
      currentFrame: 1, 
      imgList: '.threesixty_images', 
      progress: '.spinner',
      imgArray: _.split(dataJs.attr('data-files'),','),
      width: dataJs.attr('data-width'),
      height: dataJs.attr('data-height'),
      responsive: true,
      navigation: true
    }
    $('.myModalThreeSixty.kt_'+dataJs.attr('data-vr-id')+' .productThreeSixty').ThreeSixty(options);
  });
  $(document).on('click','button.close.animate',function(e){
    $(this).closest('.myModalThreeSixty').addClass('fadeOut').animate({opacity: 0}, 400, function(){
      $('.myModalThreeSixty.kt_'+vrId).removeClass('fadeOut').modal('hide')
    });
  });
  $('.myModalThreeSixty.kt_'+vrId).on('hidden.bs.modal', function () {
    $('.productThreeSixty').find('.nav_bar_stop').trigger('click')
  })
})

theme.scrollbarVariantGridProduct = (function(){
  $('.grid-item .product-info .attributes').each(function(){
    $(this).mCustomScrollbar({
      axis:"x",
      theme:"dark-thin",
      autoExpandScrollbar:false,
      autoHideScrollbar:true,
      scrollbarPosition: "outside",
      scrollInertia: 400,
      advanced:{autoExpandHorizontalScroll:true}
    });
  });
})

$(document).ready(function() {
  var sections = new theme.Sections();
  sections.register('banner-page-section',theme.BannerByPage);
  sections.register('cart-template', theme.Cart);
  sections.register('product', theme.Product);
  sections.register('collection-template', theme.Filters);
  sections.register('header-section', theme.HeaderSection);
  sections.register('map', theme.Maps);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('carousel-section', theme.CarouselSection);
  sections.register('bt_block_masonry', theme.ContentMasorySection);
  sections.register('instagram-section', theme.Instagram);
  sections.register('bt_banner_group-section', theme.BannerMasorySection.carouselBanner);
  sections.register('quotes', theme.Quotes);
  theme.variantImage();
  theme.menuBgChange();  
  theme.TabOwlFadeEffect();
  theme.TabProductFadeEffect();
  theme.Quantity();
  theme.clickOnScrollButton();
  theme.FiltersPjax();
  theme.scrollbarVariantGridProduct();
});

$(window).load(function() {
  theme.MenuReposive.clone_main_menu();
  theme.MenuReposive.clone_header_ontop();
  theme.MenuReposive.positionFootersidebar();
  theme.MenuReposive.js_height_full();
  theme.MenuReposive.js_width_full();
  theme.MenuReposive.heightheader_categoy_menu();
  theme.DropdownReposive.init('.kiti--DropWindow','.kiti--DropItem','.kiti--DropInner');
  theme.DropdownReposive.init('#ProductSection-product-template .fake_select>ul','.color_sw','.title');
});

$(window).on("resize", function() {
  if($('#header-ontop .ResizedNavMegaScroll').length > 0){
    $('#header-ontop .ResizedNavMegaScroll').removeClass('#header-ontop ResizedNavMegaScroll')
  }
  if($('.kt_layerfilterGroupsMobile').length > 0){
    if ($(window).width() >= 768 && $('.kt_layerfilterGroupsMobile').html() != ''){
      $('.kt_layerfilterGroupsDesktop').html($('.kt_layerfilterGroupsMobile').html())
    }
    else if($(window).width() < 768 && $('.kt_layerfilterGroupsDesktop').html() != ''){
      $('.kt_layerfilterGroupsMobile').html($('.kt_layerfilterGroupsDesktop').html())
    }
  }
  theme.Carousel.initCarouselMobile();
  theme.ResizeNavMega.init();
  theme.MenuReposive.clone_header_ontop();
  theme.MenuReposive.positionFootersidebar();
  theme.MenuReposive.js_height_full();
  theme.MenuReposive.js_width_full();
  theme.MenuReposive.heightheader_categoy_menu();
  theme.DropdownReposive.init('.kiti--DropWindow','.kiti--DropItem','.kiti--DropInner');
  theme.DropdownReposive.init('#ProductSection-product-template .fake_select>ul','.color_sw','.title');
  theme.checkProductGrid_Width();
});

$(window).scroll(function(){
  theme.StickMenu.init()  
  theme.clickOnScrollButton();
});
document.addEventListener("DOMContentLoaded", function(event) {
  theme.checkProductGrid_Width();
  var sections = new theme.Sections();
  sections.register('masory-section', theme.ProductsMasorySection);
  sections.register('bt_banner_masonry',theme.BannerMasorySection.MasorySection);
});
theme.init = function() {
  theme.customerTemplates.init();

  slate.rte.wrapTable();
  slate.rte.iframeReset();

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  $('a[href="#"]').on('click', function(evt) {
    evt.preventDefault();
  });

  $(document).on('click','.box-search.show-icon .icon,.box-search.show-icon .close-box',function(){
    $(this).closest('.box-search').find('.inner').toggle(600);
    $(this).closest('.box-search').toggleClass('open');
  })
  // BOX MOBILE MENU
  $(document).on('click','.mobile-navigation',function(){
    $('#box-mobile-menu').addClass('open');
  });
  // Close box menu
  $(document).on('click','#box-mobile-menu .close-menu',function(){
    $('#box-mobile-menu').removeClass('open');
  });
  //  Box mobile menu
  if($('#box-mobile-menu').length >0 ){
    $("#box-mobile-menu").mCustomScrollbar();
  }

  if(theme.MenuReposive.is_mobile() === true){
    // Box Setting
    $(document).on('click','.box-settings .icon',function(){
      $(this).closest('.box-settings').toggleClass('open');
    })
    // Minicart Setting
    $(document).on('click','.mini-cart .icon__count',function(){
      $(this).closest('.mini-cart').toggleClass('open');
    })
  }
  else{
    $(document).on('mousemove','.mini-cart,.box-settings',function(){
      $(this).addClass('open');
    })
    .on('mouseout','.mini-cart,.box-settings',function(){
      $(this).removeClass('open');
    })
  }
  $(document).on('click','.home-top-category-slide .block-toggle',function(){
    $(this).closest('.home-top-category-slide').find('.block-category-carousel').toggleClass('open');
    $(this).toggleClass('closed');
  })

};

$(theme.init);