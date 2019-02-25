(function($) {
  "use strict";
  /* ---------------------------------------------
    Instagram
   --------------------------------------------- */
  function instagram(){
    if(typeof accessToken !== 'undefined'){
      $.ajax({
        url: 'https://api.instagram.com/v1/users/self/media/recent',
        type: 'GET',
        dataType: 'jsonp',
        contentType: 'application/json',
        cache: false,
        data: {
          access_token: accessToken
        },
        success: function(responsive) {
          var is_json = false;
          try {
            if (responsive.meta.code == 200)
              is_json = true;
          } catch (ex) {
            is_json = false;
          }
          if (is_json) {
            var html = '';
            var data = responsive.data;
            $.each(data,function(index,element){
              if(index >= insta_limit ) return 0;
              html += '<a class="banner-effect1" href="'+element.link+'"><img src="'+(element.images.thumbnail.url).replace('s150x150',insta_size)+'" alt=""></a>';

            });
            $("#list-image").html(html);
          }
        }
      });
    }
  }
  
  /* ---------------------------------------------
  Scrollbar header sidebar
   --------------------------------------------- */
  function scrollbar_header_sidebar(){
    //  Scrollbar
    if($('.sidebar-menu').length >0 ){
      $(".sidebar-menu").mCustomScrollbar();
    }
    if($('.header-categoy-menu .inner').length >0 ){
      $(".header-categoy-menu .inner").mCustomScrollbar();
    }
    if($('.header .categorys-menu').length >0){
      if($(window).width() <= 768){
        $(".header .categorys-menu").mCustomScrollbar({
          axis:"x",
          theme:"dark-thin",
          autoExpandScrollbar:false,
          advanced:{autoExpandHorizontalScroll:true}
        });
      }
      else{
        $(".header .categorys-menu").mCustomScrollbar("destroy")
      }
    }
    if($('.searchDrop .isGroup ul').length >0){
      if($(window).height() > 230){
        $('.searchDrop .isGroup ul').mCustomScrollbar({
          axis:"y",
          theme:"dark-thin",
          autoExpandScrollbar:false,
          autoHideScrollbar:true,
          scrollbarPosition: "inside",
          scrollInertia: 400,
          advanced:{autoExpandHorizontalScroll:true}
        });
      }
    }
    if($('.show-shopping-cart').length >0){
      if($(window).height() > 500){
        $('.cart_list').mCustomScrollbar({
          axis:"y",
          theme:"dark-thin",
          autoExpandScrollbar:false,
          autoHideScrollbar:true,
          scrollbarPosition: "outside",
          scrollInertia: 400,
          advanced:{autoExpandHorizontalScroll:true}
        });
      }
    }
  }

  /* ---------------------------------------------
  SEARCH
   --------------------------------------------- */
  var $current_search = null,
      $val = '',
      $typeSearch = '',
      $url = '',
      scrollDropSearch = function(){
        if($('.livesearchDrop').length > 0){
          $('.livesearchDrop').mCustomScrollbar({
            axis:"y",
            theme:"dark-thin",
            autoExpandScrollbar:false,
            autoHideScrollbar:true,
            scrollbarPosition: "inside",
            scrollInertia: 400,
            advanced:{autoExpandHorizontalScroll:true}
          });
        }
      },
      ajaxSearch = function(element){
        $val = element.val();
        var $this = element.parents('form.box-search');
        $this.find('.livesearchDrop').mCustomScrollbar("disable",true);
        clearTimeout($current_search);
        if (theme.function.searchByCollection) {
          if($this.find($("li span.selected")).attr("data-value") === "all"){
            $(".iconSearchDrop").removeClass('isFilter');
            $typeSearch = '';
          }
          else if($this.find($("li span.selected")).attr("data-value") === "article"){
            $(".iconSearchDrop").addClass('isFilter');
            $typeSearch = 'type=article';
          }
          else if($this.find($("li span.selected")).attr("data-value") === "page"){
            $(".iconSearchDrop").addClass('isFilter');
            $typeSearch = 'type=page';
          }
          else if($this.find($("li span.selected")).attr("data-value") === "product"){
            $(".iconSearchDrop").addClass('isFilter');
            $typeSearch = 'type=product';
          }
          else{
            $typeSearch = 'type=product';
            $(".iconSearchDrop").addClass('isFilter');
            if($this.find($("li span.selected")).attr("data-value") !== ''){
              $val = $this.find($("ul ul li span.selected")).attr('data-cll') + $this.find($("input.search")).val();
            }
          }
        }
        if($val.trim() == '') {
          $this.removeClass('loading bar-loading bounce loaded');
          $this.find(".livesearch").html('');
          return false;
        }else{
          $this.find(".livesearch").html('');
          $url = $typeSearch.length > 0 ? encodeURI("/search?q="+$val+"&"+$typeSearch+"&view=ajax".replace(/\s/g,'+')) : encodeURI("/search?q="+$val+"&view=ajax".replace(/\s/g,'+'));
          if (theme.function.searchByCollection) {
            $this.addClass('loading').removeClass('loaded');
          }
          else{
            $this.addClass('bar-loading bounce').removeClass('loaded');
          }
          $current_search = setTimeout(function(){
            $.get($url, function(data) {
            // console.log(data)
              if($(data).find('.thumb').length === 0 ){
                if (theme.function.searchByCollection) {
                  $this.removeClass('loading').addClass('loaded');
                }
                else{
                  $this.removeClass('bar-loading bounce').addClass('loaded');
                }
                $this.find(".livesearch").html(data);
              }
              else{
                $this.find(".livesearch").html(data);
                $this.find(".item-search").each(function(i) {
                  var t = $(this);
                  var style = $(this).attr("style");
                  style = (style == undefined) ? '' : style+";";
                  var delay = i * 20 + 1 * 50;
                  var animate = t.data('animate');
                  t.attr("style", style +
                         "-webkit-animation-delay:" + delay + "ms;" + "-moz-animation-delay:" + delay + "ms;" + "-o-animation-delay:" + delay + "ms;" + "animation-delay:" + delay + "ms;"
                        ).addClass('animated ' + animate).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(this).removeClass('animated ' + animate);
                  });
                  if(i == $this.find(".item-search").length - 1){
                    if (theme.function.searchByCollection) {
                      $this.removeClass('loading').addClass('loaded');
                    }
                    else{
                      $this.removeClass('bar-loading bounce').addClass('loaded');
                    }
                    if ($this.find(".livesearch .shopify-product-reviews-badge").length > 0 && typeof window.SPR == 'function') {
                      return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                    }
                  }
                })
              }
              if (theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency) {
                Currency.convertAll(shopCurrency,cookieCurrency,".livesearch span.money");
              }
              if($this.find('.livesearchDrop .mCustomScrollBox').length <= 0){
                scrollDropSearch();
              }
              else{
                $this.find('.livesearchDrop').mCustomScrollbar("update");
              }
            });
          },700);
        }
      };
  
  /* ---------------------------------------------
    Search By cattegories
  kitisummus@gmail.com
   --------------------------------------------- */
  function kt_search(){
    //Search Box
    $(document).on('submit', "form.box-search", function(event){
      var $this = $(this);
      if($this.find($("li span.selected")).attr("data-value") === "all"){
        $("input.inputType").removeAttr('name');
        return;
      }
      else if($this.find($("li span.selected")).attr("data-value") === "article"){
        $("input.inputType").attr({'name':'type','value':'article'});
        return;
      }
      else if($this.find($("li span.selected")).attr("data-value") === "page"){
        $("input.inputType").attr({'name':'type','value':'page'});
        return;
      }
      else if($this.find($("li span.selected")).attr("data-value") === "product"){
        $("input.inputType").attr({'name':'type','value':'product'});
        return;
      }
      else{
        $("input.inputType").attr({'name':'type','value':'product'});
        if($this.find($("li span.selected")).attr("data-value") !== ''){
          var inputValue = $this.find($("ul ul li span.selected")).attr('data-cll') + $this.find($("input.search")).val();
          $("input.search").val(inputValue);
        }
        return;
      }
      event.preventDefault();
    });

    $(document).on("keyup","input.search", function(event){
      event.preventDefault();
      $("input.search").not($(this)).val($(this).val());
    });

    $(document).on("click", "form.box-search .searchDrop li span", function(event){
      event.preventDefault();
      if($(this).hasClass(".titleGroup") == false){
        $("form.box-search").find(".selected").removeClass("selected");
        $(this).addClass("selected");
        var inputName = $(this).attr('data-value');
        var inputValue = $(this).parents('form.box-search').find('input.search');
        $("input.inputType").attr('value',inputName);
        if( inputValue.val().trim() != '' ){
          $(this).parents('form.box-search').removeClass('showCatt');
          ajaxSearch(inputValue);
        }
      }
    });

    //Search By cattegories
    $(".box-search input.search").bind('focus',function(e) {
      if (theme.function.searchByCollection) {
        $(this).parents('.box-search').addClass('focus');
      }
    });

    $('body').on('click', '.iconSearchDrop', function(event) {
      if (theme.function.searchByCollection) {
        event.preventDefault();
        $(this).parents('.box-search').toggleClass('showCatt');
      }
    });

    $('body').on('click', 'input.search', function(event) {
      if (theme.function.searchByCollection) {
        event.preventDefault();
        $(this).parents('.box-search').removeClass('showCatt');
      }
    });
    
    $('input.search').keypress(function(evt){
      if(evt.which == 13) {
        jQuery('.iconSearchDrop').trigger('click');
        $(this).closest('form').submit();
      }
    });

    $(document).on('click', function(e){ 
      if ($(e.target).is('.box-search') === false && $(e.target).is('.box-search input') === false && $(e.target).is('.iconSearchDrop svg') === false && $(e.target).is('.box-search *') === false) {
        $('.box-search').removeClass('focus').removeClass('showCatt').removeClass('loaded');
      }
    });
  }
  
  $(document)
  .on('shopify:section:load', kt_search)
  .on('shopify:section:unload', kt_search)
  .on('shopify:section:select', kt_search)
  .on('shopify:section:deselect', kt_search)
  .on('shopify:block:select', kt_search)
  .on('shopify:block:deselect', kt_search);
  
  /* ---------------------------------------------
   QUICKVIEW
   --------------------------------------------- */
  function kt_quickView(){
    $('body').on('click', '.quick-view', function(event) {
      event.preventDefault();
      var url = $(this).attr('data-view');
      var $this = $(this);
      $('.test-loading').show();TweenLite.to('.line-loading', 6, {ease: Expo.easeOut,width: '90%'});
      $.ajax({
        url: url+'?view=quickView',
        type: 'GET',
        beforeSend:function(){
          $('.product-quickview-content').addClass('loading');
        },
        success: function(data){
          $('.product-quickview-content').html(data.split('<!-- sizeGuide_and_shipping -->')[2]);
          var sizeGuide_and_shipping = data.split('<!-- sizeGuide_and_shipping -->')[1];
          $('body').append('<div id="sizeGuide_and_shipping">'+sizeGuide_and_shipping+'</div>');
          var imgLarge = new Image();
              imgLarge.src = $('.product-quickview-content .SlickPhotoswipGallery').find('img').first().attr('src'); 
          imgLarge.onload = function () {
            $("#myModal").modal();
            $('.product-quickview-content').removeClass('loading');
            if ($(window).width() > 767 ) {
              var height = $('.product-quickview-content .product-images').height();
              if(height <= 600){height = 600;}
              $('.product-quickview-content .product-details-right').css('height',height+'px');
              $('.product-quickview-content .product-images:not(.notChangeResize)').on("mresize",function(){
                if ($(this).hasClass('notChangeResize')) {return false}
                var height_ = $('.product-quickview-content .product-images').height();
                if(height_ <= 600){height_ = 600;}
                $('.product-quickview-content .product-details-right').addClass('notChangeResize').css('height',height_+'px');
              });
              $('.product-quickview-content .product-details-right').mCustomScrollbar({
                axis:"y",
                theme:"dark-thin",
                autoExpandScrollbar:false,
                autoHideScrollbar:true,
                scrollbarPosition: "outside",
                scrollInertia: 200,
                advanced:{autoExpandHorizontalScroll:true}
              });
            }
            $('.product-quickview-content .fake_select.combobox ul').each(function() {
              if($(this).find('li').length > 6){
                $(this).mCustomScrollbar({
                  axis:"y",
                  theme:"dark-thin",
                  autoExpandScrollbar:false,
                  autoHideScrollbar:true,
                  scrollbarPosition: "inside",
                  scrollInertia: 200,
                  advanced:{autoExpandHorizontalScroll:true}
                });
              }
            });
            var sections = new theme.Sections();
            sections.register('productQuickview', theme.Product);
            theme.Quantity();
            theme.DropdownReposive.init('#ProductSection-quickview-template .fake_select>ul','.color_sw','.title');
            if (theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency) {
              Currency.convertAll(shopCurrency,cookieCurrency,'.product-quickview-content .product-details-right span.money');
            }
            TweenLite.to('.line-loading', .5,{width: '100%',onComplete: function (e) {$('.test-loading').hide();TweenLite.to('.line-loading', 0, {width: 0});}});
            if ($(".product-quickview-content .shopify-product-reviews-badge").length > 0 && typeof window.SPR == 'function') {
              return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
            }
          }
        }
      });
    });
  }
  if($('.quick-view').length > 0 && theme.function.quickview){
    $(document)
    .on('shopify:section:load', kt_quickView)
    .on('shopify:section:unload', kt_quickView)
    .on('shopify:section:select', kt_quickView)
    .on('shopify:section:deselect', kt_quickView)
    .on('shopify:block:select', kt_quickView)
    .on('shopify:block:deselect', kt_quickView);
  }

  /* ---------------------------------------------
   QUICKSHOP
   --------------------------------------------- */
  function kt_quickShop(){    
    $('body').on('click', '.product-item .quick-shop', function(event) {
      event.preventDefault();
      var url = $(this).attr('data-href');
      var $this = $(this);
      var addButton = $this.attr('class').replace(' quick-shop','').replace(/ /g, ".");
      $this.addClass('loading');
      if($this.parents('.product-item').find('.product-page').length > 0){
        if($this.parents('.product-item').hasClass('smallQuickshop')){
          $('#quickShopModal').modal();
          $this.removeClass('loading');
        }
        else{
          $this.parents('.product-item').addClass('showQuickShop');
          $this.addClass('hidden');
          $this.parents('.product-item').find('button.close').attr('data-button',$this.attr('class').replace(' quick-shop loading hidden',''));
          $this.parents('.product-item').find('.'+addButton).not(".quick-shop").removeClass('hidden');
          $this.removeClass('loading');
        }
      }
      else{
        $.ajax({
          url: url+'?view=variantQuickShop',
          type: 'GET',
          dataType: 'html'
        })
        .done(function(data) {
          var json = data.split('<!--ENDHTML-->')[1];
          var html = data.split('<!--ENDHTML-->')[0] + '<script type="application/json" id="ProductJson-'+$this.attr('data-pid')+'">' + json + '</script>';
          if($this.parents('.product-item').hasClass('smallCard')){
            $('#quickShopModal .product-quickshop-content').html(html);
            $('#quickShopModal').modal();
            $this.removeClass('loading');
          }
          else{
            $this.parents('.product-item').addClass('showQuickShop');
            $this.parents('.product-item').find('.'+addButton).not(".quick-shop").removeClass('hidden');
            $this.addClass('hidden');
            $this.parents('.product-item').find('.quickshopForm').html(html);
            $this.parents('.product-item').find('button.close').attr('data-button',$this.attr('class').replace(' quick-shop loading hidden',''));
            $this.removeClass('loading');
            $this.parents('.product-item').find('.product-page .selectorWrapper').mCustomScrollbar({
              axis:"y",
              theme:"dark-thin",
              autoExpandScrollbar:false,
              autoHideScrollbar:true,
              scrollbarPosition: "outside",
              scrollInertia: 100,
              advanced:{autoExpandHorizontalScroll:true}
            });
          }
          var sections = new theme.Sections();
          sections.register('product-'+$this.attr('data-pid'), theme.Product);
          theme.DropdownReposive.init('#ProductSection-'+$this.attr('data-pid')+' .fake_select>ul','#ProductSection-'+$this.attr('data-pid')+' .fake_select>ul .color_sw','#ProductSection-'+$this.attr('data-pid')+' .fake_select>ul .title');
          theme.Quantity();
          if (theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency) {
            Currency.convertAll(shopCurrency,cookieCurrency,'#ProductSection-'+$this.attr('data-pid')+' span.money');
          }
        })
      }
    })
    $('body').on('click', '.quickshopForm button.close', function(event) {
      var button = $(this).attr('data-button').replace(/ /g, ".");
      $(this).parents('.product-item').removeClass('showQuickShop')
      $(this).parents('.product-item').find('.'+button).not(".quick-shop").addClass('hidden');
      $(this).parents('.product-item').find('.quick-shop.'+button).removeClass('hidden');
      var parentWidth = $(this).parents('.product-item').width();
      if(parentWidth < 230){
        $(this).parents('.product-item').find('.quickshopForm').html('');
        $(this).parents('.product-item').find('.variantQuickShop').remove();
      }
    });
  }
  
  /* ---------------------------------------------
   COUNTDOWN
   --------------------------------------------- */
  window.kt_countdown = function(){
    if($('.kt-countdown').length >0){
      $('.kt-countdown').each(function() {
        var $this = $(this);
        $(this).countdown($(this).data('y')+'/'+$(this).data('m')+'/'+$(this).data('d'),{elapse:true}).on('update.countdown', function(event) {
          if (event.elapsed) { // Either true or false
            // Counting up...
            $this.parent('.product-count-down').hide();
          } else {
            // Countdown...
            $this.html(
              event.strftime(''
                             + '<span class="box-count day"><span class="number">%-D</span> <span class="text">'+theme.strings.cdday+'%!D</span></span><span class="dot">:</span>'
                             + '<span class="box-count hrs"><span class="number">%H</span> <span class="text">'+theme.strings.cdhrs+'%!H</span></span><span class="dot">:</span>'
                             + '<span class="box-count min"><span class="number">%M</span> <span class="text">'+theme.strings.cdmin+'%!M</span></span><span class="dot">:</span>'
                             + '<span class="box-count secs"><span class="number">%S</span> <span class="text">'+theme.strings.cdsecs+'%!S</span></span>')
            );
          }
        });
      });
    }
    if($('.kt_countdow_page').length >0){
      $('.kt_countdow_page').each(function() {
        if ($(this).hasClass('kt_loop_bar')) {
          var days = parseInt($(this).data('d')),
             hours = parseInt($(this).data('h')),
             minutes = parseInt($(this).data('i')),
             seconds = parseInt($(this).data('s'));
          // many days from now!
          if(days > 0 ){
            var get1dayFromNow = function(){
              var clac_minutes =  Math.floor(seconds/60)%60,
                  clac_date = (hours + ((minutes+clac_minutes)/60)) * 60 * 60 * 1000;
              return new Date( (new Date().valueOf() + (days * 24 * 60 * 60 * 1000)) + clac_date);
            }
            $(this).countdown(get1dayFromNow()).on('update.countdown', function(event) {
              var $this = $(this);
                $(this).html(event.strftime(''
                  + '<div class="block"><span class="flip-top">%-D</span><br><span class="label">'+theme.strings.cdday+'</span></div>'
                  + '<div class="block"><span class="flip-top">%H</span><br><span class="label">'+theme.strings.cdhrs+'</span></div>'
                  + '<div class="block"><span class="flip-top">%M</span><br><span class="label">'+theme.strings.cdmin+'</span></div>'
                  + '<div class="block"><span class="flip-top">%S</span><br><span class="label">'+theme.strings.cdsecs+'</span></div>'));
             });
          }
          else{
            var get1dayFromNow = function(){
              var clac_minutes =  Math.floor(seconds/60)%60; 
              return new Date(new Date().valueOf() + (hours + ((minutes+clac_minutes)/60)) * 60 * 60 * 1000);
            }
            $(this).countdown(get1dayFromNow()).on('update.countdown', function(event) {
              var $this = $(this);
              $(this).html(event.strftime(''
                + '<div class="block"><span class="flip-top">%-D</span><br><span class="label">'+theme.strings.cdday+'</span></div>'
                + '<div class="block"><span class="flip-top">%H</span><br><span class="label">'+theme.strings.cdhrs+'</span></div>'
                + '<div class="block"><span class="flip-top">%M</span><br><span class="label">'+theme.strings.cdmin+'</span></div>'
                + '<div class="block"><span class="flip-top">%S</span><br><span class="label">'+theme.strings.cdsecs+'</span></div>'));
            });
          }
        }
        else{
          $(this).countdown($(this).data('time'), {elapse: true})
          .on('update.countdown', function(event) {
            var $this = $(this);
            if (event.elapsed) {
              $this.html('');
            } else {
              $(this).html(event.strftime(''
                + '<div class="block"><span class="flip-top">%-D</span><br><span class="label">'+theme.strings.cdday+'</span></div>'
                + '<div class="block"><span class="flip-top">%H</span><br><span class="label">'+theme.strings.cdhrs+'</span></div>'
                + '<div class="block"><span class="flip-top">%M</span><br><span class="label">'+theme.strings.cdmin+'</span></div>'
                + '<div class="block"><span class="flip-top">%S</span><br><span class="label">'+theme.strings.cdsecs+'</span></div>'));
            }
          });
        }
      });
    }
  }
  $(document)
  .on('shopify:section:load', kt_countdown)
  .on('shopify:section:unload', kt_countdown)
  .on('shopify:section:select', kt_countdown)
  .on('shopify:section:deselect', kt_countdown)
  .on('shopify:block:select', kt_countdown)
  .on('shopify:block:deselect', kt_countdown);

  function getScrollbarWidth() {
    var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
        $outer = jQuery('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
        inner = $inner[0],
        outer = $outer[0];
    jQuery('body').append(outer);
    var width1 = inner.offsetWidth;
    $outer.css('overflow', 'scroll');
    var width2 = outer.clientWidth;
    // $outer.remove();
    return (width1 - width2);
  }
  
  /* ---------------------------------------------
   MASORY FILTER
   --------------------------------------------- */
  window.MasoryFilter = function() {
    if($('#layered_form--slick .masory_layout').length > 0 && $(window).width() >= 768){
      var $grid = $('#layered_form--slick .masory_layout').isotope({
        itemSelector: '.layered_filter',
        horizontalOrder: true,
        layoutMode: 'packery',
        transitionDuration: '.8s'
      }).addClass('initialized');
      $grid.imagesLoaded().progress( function() {
        $grid.isotope('layout');
      });
    }
    if($('.layered_filter_ul').length > 0){      
      $('.layered_filter_ul').not('.ul_layered_id_tags, .ul_layered_availability, .ul_layered_price_0, .layered_filter_sort_by').each(function(){
        $(this).mCustomScrollbar({
          axis:"y",
          theme:"dark-thin",
          autoExpandScrollbar:false,
          autoHideScrollbar:true,
          scrollbarPosition: "outside",
          scrollInertia: 200,
          advanced:{autoExpandHorizontalScroll:true}
        });
      });
    }
  }
  
  /* ---------------------------------------------
   PARALLAX BANNER
   --------------------------------------------- */
  window.kt_parallax = function(){
    //parallax
    var window_size = $(window).width();
    window_size += getScrollbarWidth();
    $('.bg-parallax').each(function(){
      (Modernizr.touch) ? $(this).addClass('isMoblideParallax') : $(this).removeClass('isMoblideParallax'); 
      if( window_size > 991 ){
        $(this).parallax('50%', 0.3);
      }
    });
    if($('.block-paralax3 .bg-parallax_child1').length > 0){
      $('.block-paralax3 .bg-parallax_child1').parallax('10%', 0.2);
    }
  }
  $(document)
  .on('shopify:section:load', kt_parallax)
  .on('shopify:section:unload', kt_parallax)
  .on('shopify:section:select', kt_parallax)
  .on('shopify:section:deselect', kt_parallax)
  .on('shopify:block:select', kt_parallax)
  .on('shopify:block:deselect', kt_parallax);
  
  /* ---------------------------------------------
   PARALLAX BANNER
   --------------------------------------------- */
  function customize_error(){
    $('#error_html .errors').detach().appendTo('.error_html_clone');
  }
  $(document)
  .on('shopify:section:load', customize_error)
  .on('shopify:section:unload', customize_error)
  .on('shopify:section:select', customize_error)
  .on('shopify:section:deselect', customize_error)
  .on('shopify:block:select', customize_error)
  .on('shopify:block:deselect', customize_error);
  
  /* ---------------------------------------------
  BANNER
   --------------------------------------------- */
  function kiti_banner_get_scrollbar_width() {
    var $inner = jQuery('<div style="width: 100%; height:200px;">test</div>'),
        $outer = jQuery('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
        inner = $inner[0],
        outer = $outer[0];
    jQuery('body').append(outer);
    var width1 = inner.offsetWidth;
    $outer.css('overflow', 'scroll');
    var width2 = outer.clientWidth;
    $outer.remove();
    return (width1 - width2);
  }
  function kiti_banner(){
    //Shortcode Banner
    $('.kt-banner').each(function(){
      var window_size = jQuery('body').innerWidth();
      window_size += kiti_banner_get_scrollbar_width();
      var minHeight = $(this).data('height'),
        bgimg = $(this).data('background'),
        bgcolor = $(this).data('bgcolor'),
        positiontop = $(this).data('positiontop'),
        positionleft = $(this).data('positionleft'),
        positionright = $(this).data('positionright'),
        positionbottom = $(this).data('positionbottom'),
        position = $(this).data('position');
      var bgcontainer =  $(this).find('.bg-image');
      var content = $(this).find('.banner-content') || $(this).find('.content');
      var reponsive = $(this).data('reponsive');
      bgcontainer.css({
        'min-height':minHeight+'px',
        'height':minHeight+'px'
      });

      if( typeof (bgimg)!= 'undefined' && bgimg !=""){
        bgcontainer.css({
          'background-image':'url('+bgimg+')'
        });
      }
      
      if( typeof(bgcolor) != "undefined" && bgcolor !=""){
        bgcontainer.css({
         'background-color':bgcolor
        });
      }

      if( typeof( positiontop ) != "undefined" && positiontop !=""){
        content.css({
         'top':positiontop
        });
      }
      if( typeof( positionleft ) != "undefined" && positionleft !=""){
        content.css({
         'left':positionleft
        });
      }
      if( typeof( positionright ) != "undefined" && positionright !=""){
        content.css({
         'right':positionright
        });
      }
      if( typeof( positionbottom ) != "undefined" && positionbottom !=""){
        content.css({
         'bottom':positionbottom
        });
      }
      if( typeof( position ) != "undefined" && position != "" && position =="center" ){
        content.css({
         '-webkit-transform':'translateY(-50%)',
         '-ms-transform': 'translateY(-50%)',
         '-o-transform': 'translateY(-50%)',
         'transform': 'translateY(-50%)',
         'top':'50%'
        });
      }
      if (typeof(reponsive) != 'undefined'){
        //console.log(window_size);
        for (var k in reponsive){
          if (typeof reponsive[k] !== 'function') {
            if( window_size <= k ){
              if( reponsive[k] > 0 ){
                bgcontainer.css({
                  'min-height':reponsive[k]+'px',
                  'height':reponsive[k]+'px'
                });
                break;
              }
            }
          }
        }
      }
    });
  }
  kiti_banner();
  $(document)
  .on('shopify:section:load', kiti_banner)
  .on('shopify:section:unload', kiti_banner)
  .on('shopify:section:select',kiti_banner)
  .on('shopify:section:deselect', kiti_banner)
  .on('shopify:block:select',kiti_banner)
  .on('shopify:block:deselect', kiti_banner);
  
  
  /* ---------------------------------------------
   WISHLIST
   --------------------------------------------- */
  // Add wishlist
  function addwishlist() {
    $("body").on('click', '.add_nitro_wishlist', function(event) {
      event.preventDefault();
      var $this = $(this),
          holder = $this.parent().siblings('.yith-wcwl-add-button'),
          load = $this.parent().find('.load_nitro_wishlist'),
          added = $this.parent().find('.added_nitro_wishlist');
      $this.hide();
      load.show();
      $.ajax({
        url: 'https://nitro-wishlist.teathemes.net?shop='+ Shopify.shop,
        type: 'POST',
        data: $this.data(),
        success: function(data, status) {
          try {
            data = $.parseJSON(data);
          } catch(ex) {
            //console.log(ex);
          }
          if(data.status == 'success' && status == 'success') {
            added.show();
            load.hide();
            $this.hide();
            $('.gl_count_wishlist').html(function(i, val) {
              return val * 1 + 1
            });
          } else {
            load.hide();
            $this.show();
            console.log('ajax error');
          }
        },
        error: function(data) {
          load.hide();
          $this.show();
          console.log('ajax error');
        },
      });
    });
  }
  // Remove wishlist
  function removewishlist() {
    $("body").on('click', '.nitro_wishlist_remove', function(event) {
      event.preventDefault();
      var $this = $(this),
          value = $(this).data('id');
      $('.wishlist-page .card').css('opacity','1');
      $.ajax({
        url: 'https://nitro-wishlist.teathemes.net?shop='+ Shopify.shop,
        type: 'POST',
        data: $this.data(),
        success: function(data, status) {
          try {
            data = $.parseJSON(data);
          } catch(ex) {
            //console.log(ex);
          }
          if(data.status == 'success' && status == 'success') {
            $('.gl_count_wishlist').html(function(i, val) {
              return val * 1 - 1
            });
            $('#WishItem-' + value).fadeOut(300, function(){
              $(this).remove();
              var rowCount = $('.wishlist-page-items .wishlist-page-item').length;
              if(rowCount == 0) {
                $('.wishlist-page-items')
                .html('<div class="col-md-12"><div class="text-center wishlist-empty">' + theme.wishlist.nowishlist + '</div></div>');
              }
            });
            $('.wishlist-page .card').css('opacity','0');
          } else {
            $('.loader').remove();
            console.log('ajax error');
          }
        },
        error: function(data) {
          $('.loader').remove();
          console.log('ajax error');
        },
      });
    });
  }
  
  /* ---------------------------------------------
   RECENTLY VIEWED
   --------------------------------------------- */
  // Add to recently
  function recentlyViewedAdd() {
    var ls = getCookie('tea-recent') || '[]';
    ls = JSON.parse(decodeURIComponent(ls) );
    if(product_handle !== null){
      var c = product_handle;
      if(ls.indexOf(c)< 0 ){
        if(ls.length >= 10){
          ls.pop();
        }
        ls[ls.length]= (c);
        ls = JSON.stringify(ls);
        setCookie('tea-recent',ls,0,0,0);
      }
    }
  }
  // recentlyViewedListSidebar
  window.recentlyViewedListSidebar = function() {
    if($('.widget_recent_product').length > 0){
      var ls = getCookie('tea-recent') || '[]';
      ls = JSON.parse(decodeURIComponent(ls) );
      if(ls.length){ 
        //ls = ls.split(',');
        var ls = ls.reverse();
        if(ls.length >= 1){
          $(".widget_recent_product").show();
          $.ajax({
            url: '/pages/recently-viewed-products/'+ls.join(",")+'?q=list-sidebar',
            dataType: 'html',
            type: 'GET',
            success: function(responsive) {
              //console.log(responsive);
              if(responsive.indexOf('<!-- recently-viewed-products -->') >= 0){
                $('.widget_recent_product .product-categories').html(responsive);
              }
            },
            error: function(data) {
              console.log('ajax error');
            },
            complete: function() {
              //currency            
              if (theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency) {
                Currency.convertAll(shopCurrency,cookieCurrency,'.product-categories li span.money');
              }
              //product review
              if ($(".spr-badge").length > 0 && typeof window.SPR == 'function') {
                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
              }
            }
          });
        }
      }
    }    
  }
  // recentlyViewedProductSingle
  window.recentlyViewedProductSingle = function() {
    if($('.widget_recent_productSg').length > 0){
      var ls = getCookie('tea-recent') || '[]';
      ls = JSON.parse(decodeURIComponent(ls) );
      if(ls.length){ 
        //ls = ls.split(',');
        var ls = ls.reverse();
        if(ls.length >= 1){
          $.ajax({
            url: '/pages/recently-viewed-products/'+ls.join(",")+'?q='+product_id+'+'+collectionRecently,
            dataType: 'html',
            type: 'GET',
            success: function(responsive) {
              // console.log(responsive);
              $('.widget_recent_productSg .owl-carousel').trigger('destroy.owl.carousel');
              if(responsive.length > 43 && responsive.indexOf('<!-- recently-viewed-products -->') >= 0){
                $('.widget_recent_productSg .owl-carousel').html(responsive);
                $(".widget_recent_productSg").show();
              }
            },
            error: function(data) {
              console.log('ajax error');
            },
            complete: function() {
              var $this = $('.widget_recent_productSg .owl-carousel');
              var config = $this.data();
              var owl = $this;
              owl.owlCarousel(config);

              //currency            
              if (theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency) {
                Currency.convertAll(shopCurrency,cookieCurrency,'.widget_recent_productSg li span.money');
              }
              theme.checkProductGrid_Width();
              theme.scrollbarVariantGridProduct();
              //product review
              if ($(".widget_recent_productSg .spr-badge").length > 0 && typeof window.SPR == 'function') {
                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
              }
            }
          });
        }
      }
    }
  }
  $(document)
  .on('shopify:section:load', recentlyViewedProductSingle)
  .on('shopify:section:unload', recentlyViewedProductSingle)
  .on('shopify:section:select',recentlyViewedProductSingle)
  .on('shopify:section:deselect', recentlyViewedProductSingle)
  .on('shopify:block:select',recentlyViewedProductSingle)
  .on('shopify:block:deselect', recentlyViewedProductSingle);
  
  /* ---------------------------------------------
   TOOLBAR
   --------------------------------------------- */
  function stickyToolbar(action) {
    if(action == 'up' && $('#toolbar').hasClass('on-sticky')){
      $('#toolbar').removeClass('on-sticky');
    } else if(action == 'down' && $('#toolbar').not('.on-sticky')){
      $('#toolbar').addClass('on-sticky');
    }
  }
  
  /* ---------------------------------------------
     Category carousel
     --------------------------------------------- */
  function block_category_carousel(){
    $('.function-carousel .owl-carousel').each(function(){
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
  }
  $(document)
  .on('shopify:section:load', block_category_carousel)
  .on('shopify:section:unload', block_category_carousel)
  .on('shopify:section:select',block_category_carousel)
  .on('shopify:section:deselect', block_category_carousel)
  .on('shopify:block:select',block_category_carousel)
  .on('shopify:block:deselect', block_category_carousel);
  
  /* ---------------------------------------------
   Responsive item slide
   --------------------------------------------- */  
  function responsive_item_slide(){
    $('.slideshow__slide[data-slide-blockid]').each(function(){
      var responsive = $.parseJSON($(this).attr('data-responsive').replace(/\s/g,' '));
      var responsiveSubtitle = $.parseJSON($(this).attr('data-responsive-subtitle').replace(/\s/g,' '));
      var responsiveDesc = $.parseJSON($(this).attr('data-responsive-description').replace(/\s/g,' '));
      var blockId = $(this).attr('data-slide-blockid');
      if ($(".css-"+blockId).length <= 0) {
        var responsived = '';
        $.map(responsive, function(e, i) {
          responsived = responsived + '@media only screen and (min-width: '+i+'px){'+ '.slideshow__slide--'+blockId +' .slideshow__title{'+ e +'}}';
        })
        $.map(responsiveSubtitle, function(e, i) {
          responsived = responsived + '@media only screen and (min-width: '+i+'px){'+ '.slideshow__slide--'+blockId +' .slideshow__subtitle{'+ e +'}}';
        })
        $.map(responsiveDesc, function(e, i) {
          responsived = responsived + '@media only screen and (min-width: '+i+'px){'+ '.slideshow__slide--'+blockId +' .slideshow__description{'+ e +'}}';
        })

        $(this).append('<style type="text/css" class="css-'+blockId+'">'+(responsived.replace(/\"/g,''))+'</style>');
      }
    })
  }
  $(document)
  .on('shopify:section:load', responsive_item_slide)
  .on('shopify:section:unload', responsive_item_slide)
  .on('shopify:section:select',responsive_item_slide)
  .on('shopify:section:deselect', responsive_item_slide)
  .on('shopify:block:select',responsive_item_slide)
  .on('shopify:block:deselect', responsive_item_slide);

  function AutoloadCompare(){
    var ls = getCookie('tea-compare');
    if(ls != null){ 
      ls = ls.split(',');
      ls.map(function(index, elem) {
        $(".compare[data-pid='"+index+"']").addClass('added');
          // $(".compare.compare-single[data-pid='"+index+"']").text('Added to compare');
      });
    }
    $('#compare-content .table-responsive').mCustomScrollbar({
      axis:"x",
      theme:"dark-thin",
      autoExpandScrollbar:true,
      scrollbarPosition: "inside",
      scrollInertia: 200,
      advanced:{autoExpandHorizontalScroll:true}
    });
  }
  function AddCompare(){
    $('body').on('click', '.compare', function(event) {
      event.preventDefault();
      /* Act on the event */
      var $this = $(this),
          handle = $this.data('pid'),
          holder = $("#compare-content"),
          ls = getCookie('tea-compare');
      $('.test-loading').show();TweenLite.to('.line-loading', 6, {ease: Expo.easeOut,width: '90%'});
      if(ls != null && ls.length > 1){ 
        ls = ls.split(',');
      }else{
        ls = [];
      }
      if(ls.indexOf(handle)< 0 && $(this).hasClass('added') === false ){
        ls.push(handle);
        if (ls.length > 1) {
          var ls_ = ls.join(',');
          if (ls_.substring(0, 1) == ',') { 
            ls_ = ls_.substring(1);
          }
        }else{
          ls_ = ls.toString();
        }
        setCookie('tea-compare',ls_,0,0,0);
      }
      $("#compare-content td").remove();
      ls.map(function(index, elem) {
        if (index !== '' && index !== null) {
          Shopify.KT_getProduct(index,function(data){
            $("#compare-content .tr-remove").append('<td class="product-remove cp-'+data.handle+'" data-pid="'+data.handle+'" ><a href="#" class="remove">'+theme.compare.remove+'</a></td>');
            var html = '';
            html +='<td class="product-images cp-'+data.handle+'"><img src="'+Shopify.KT_resizeImage(data.featured_image,"250x250_crop_center")+'" alt="'+data.title+'">';
            html +='<h3 class="product-name">'+data.title+'</h3>';
            html +='<span class="price">';
            html +='<ins>'+theme.Currency.formatMoney(data.price, theme.moneyFormat)+'</ins>';
            if(data.compare_at_price > data.price ){
                html +='<del>'+theme.Currency.formatMoney(data.compare_at_price, theme.moneyFormat)+'</del>';
            }
            html +='</span>';
            if(data.variants.length > 1){
                html +='<a class="add-to-cart btn-load button" href="'+data.url+'">'+theme.productStrings.selectOption+'</a>';
            }else{
                if(data.available){
                    html +='<a href="javascript:void(0);" title="'+theme.productStrings.addToCart+'" class="button add_to_cart_button" onclick="Shopify.KT_addItem('+data.variants[0].id+',1)">'+theme.productStrings.addToCart+'</a>';
                }else{
                    html +='<a class="add-to-cart btn-load button" href="'+data.url+'">'+theme.productStrings.soldOut+'</a>';
                }
            }

            html +='</td>';
            $("#compare-content .tr-product-image").append(html);
            $("#compare-content .tr-product-desc").append('<td class="product-description cp-'+data.handle+' text-left"><p>'+(data.description.split('[/short description]')[0].replace('[short description]',''))+'</p></td>');
            $("#compare-content .tr-availability").append('<td class="product-availability cp-'+data.handle+'">'+( data.available ? "<span class=\"in-stock\">"+theme.productStrings.inStock+"</span>" : "<span class=\"in-stock\">"+theme.productStrings.outOfStock+"</span>")+'</td>');
          });
        }
      })
      setTimeout(function() {                
        TweenLite.to('.line-loading', .5,{width: '100%',onComplete: function (e) {$('.test-loading').hide();TweenLite.to('.line-loading', 0, {width: 0});}});
        if(theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency){
          Currency.convertAll(shopCurrency,cookieCurrency,'#compare-content span.money');
        }
        $this.addClass('added');
        $("#compare-modal").modal('show');
        $("#compare-content .table-responsive").mCustomScrollbar("update");
      }, 1000);
    });
  }
  function RemoveCompare(){
    $('body').on('click', '#compare-content .product-remove', function(event) {
      event.preventDefault();
      /* Act on the event */
      var $this = $(this),handle = $this.attr('data-pid');
      $('.compare[data-pid="'+handle+'"]' ).removeClass('added');
      var ls = getCookie('tea-compare');      
      if(ls != null){ 
        ls = ls.split(',');
      }
      ls = jQuery.grep(ls, function(value) {
        return value != handle;
      });
      ls = $.trim(ls);
      setCookie('tea-compare',ls,0,0,0);
      TweenLite.to('.cp-'+handle, .3, {opacity: 0, onComplete: function(){$('.cp-'+handle).remove()}});
      $("#compare-content .table-responsive").mCustomScrollbar("update");
      if(ls.length === 0 ){}
    });
  }

  /* ---------------------------------------------
   SKILL BAR
   --------------------------------------------- */
  function processbar(){
    $('.item-processbar').each(function(){
      var $heightSkill = $(this).attr('data-height'),
          $percentSkill = $(this).attr('data-percent'),
          $bgSkill = $(this).attr('data-bgskill'),
          $bgBar = $(this).attr('data-bgBar');

      $(this).find('.processbar-bg').css({
        "height":$heightSkill,
        "background-color":$bgBar

      });
      $(this).find('.processbar-width').css({
        "height":$heightSkill
      });

      $(this).find('.processbar-width').animate({
        'width':$percentSkill+'%'
      },6000);

      if($bgSkill != ''){
        $(this).find('.processbar-width').css({
          'background-color':$bgSkill
        });
      };
    });
  }
  $(document)
  .on('shopify:section:load', processbar)
  .on('shopify:section:unload', processbar)
  .on('shopify:section:select',processbar)
  .on('shopify:section:deselect', processbar)
  .on('shopify:block:select',processbar)
  .on('shopify:block:deselect', processbar);

  /* ---------------------------------------------
   REAL TIME VISITOR
   --------------------------------------------- */
  function realTimeVisitor(){
    $(function(a){var min = 1,max = $('.counter_real_time').attr('data-counter-max'),t=1,r=max;
       t=Math.ceil(t),
       r=Math.floor(r);
       var o=Math.floor(Math.random()*(r-t+1))+t,
       n=["1","2","4","3","6","10","-1","-3","-2","-4","-6"],
       h="",e="",l=["10","20","15"],h="",e="",M="";
       setInterval(function(){
          if(h=Math.floor(Math.random()*n.length),e=n[h],o=parseInt(o)+parseInt(e),min>=o){
             M=Math.floor(Math.random()*l.length);
             var a=l[M];o+=a
          }
          if(o<1 || o>max ){
             o=Math.floor(Math.random()*(r-t+1))+t;
          }
          $("#number_counter>span").html((parseInt(o)));$('.realTime').show()
       },parseInt($('.counter_real_time').attr('data-interval-time')))
    });
  }
  $(document)
  .on('shopify:section:load', realTimeVisitor)
  .on('shopify:section:unload', realTimeVisitor)
  .on('shopify:section:select',realTimeVisitor)
  .on('shopify:section:deselect', realTimeVisitor)
  .on('shopify:block:select',realTimeVisitor)
  .on('shopify:block:deselect', realTimeVisitor);

  window.setCookie = function(cname, cvalue, exdays, exhours, exminute) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * exhours * exminute * 60 * 1000));
    var expires = (exminute == 0 ? 1 : "expires="+d.toUTCString());
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  window.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  function is_mobile(){
    var isMobile = (Modernizr.touch) ? true : false;
    return isMobile;
  }  

  /* ---------------------------------------------
   NEWSLETTER POPUP
   --------------------------------------------- */
  function checkCookieNewsletterPopup() {
    var display = getCookie("kt_popupNewsletter");
    var delay = $('#newsletterModal').attr('data-pause');
    var mobileDisplay = $('#newsletterModal').attr('data-mobile-display');
    if($('#contact_form p.form--success').length <= 0){
      if(mobileDisplay === 'true' && is_mobile() === true && $(window).width() < 768){
        $('#newsletterModal').remove();
      }else{
        $('#hideforever').change(function(){
          if ($(this).is(':checked')) {
            document.cookie = "kt_popupNewsletter=disable;1;path=/";
          } else {
            document.cookie = "kt_popupNewsletter=;path=/";
          }
        });
        if (display != "disable") {
          setTimeout(function() {
            $('#newsletterModal').modal('show');
            setCookie("kt_popupNewsletter",'disable',1,1,delay);
          }, 500);
        }
      }
    }
  }
  function register($form) {
    $form.find('#mc-embedded-subscribe-kiti').text(theme.strings.nll_send);
    $form.find('.close__').hide();
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      cache: false,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      error: function (err) { alert(theme.strings.nll_error_mesenger) },
      success: function (data) {        
        $form.find('#mc-embedded-subscribe-kiti').text($form.find('#mc-embedded-subscribe-kiti').data('value'));
        if (data.result === 'success') {
          // Yeahhhh Success
          // console.log(data.msg)
          $form.hide();
          $('.kt-popup-newsletter .notice').hide();
          $('.kt-popup-newsletter').append('<p class="msg success" style="color: rgb(53, 114, 210)">'+_.replace(theme.strings.nll_success_mesenger, '<span class=\"code\"></span>', '<span class=\"code\">'+$form.attr('data-kt')+'</span>')+'</p>')
        } else {
          // Something went wrong, do something to notify the user.
          // console.log(data.msg)
          $form.hide();
          $('.kt-popup-newsletter').append('<p class="msg error" style="color: #ff8282;margin-top: 15px;">' + data.msg.substring(4) + '</p>')
        }
      }
    })
  }
  
  /* ---------------------------------------------
   STICKY ADD CART 
   --------------------------------------------- */
  function stickyAddCart(){
    if ($(window).width() > 768 && $("#cart_form_sticky").attr('data-only-variant') == 'true') {
      var $variation_form_sticky = $('#cart_form_sticky');
      $variation_form_sticky.on('click', '.swatch_list_sticky > .swatch_sticky', function(e) {
        e.preventDefault();
        var value = $(this).data('val'),
            inventory = $(this).data('inventory'),
            img_st = $(this).data('img'),
            $sticky_img = $('#pr_img_sticky>img'),
            $quantity_sticky = $('#quantity_sticky');
        $variation_form_sticky.find('select#productselect-sticky').val(value).trigger('change');
        $(this).parent().find('.selected').removeClass('selected');
        $(this).addClass('selected');
        if(typeof inventory !== 'undefined') {
          $quantity_sticky.html(productStrings.onlyLeft.replace('1', inventory)).removeClass('hide');
          $('#number_sticky').attr('max',inventory);
        }else{
          $quantity_sticky.addClass('hide');
          $('#number_sticky').attr('max','1');
        }
        if(typeof img_st !== 'undefined') {
          $sticky_img.attr("src", img_st);
        }
      });
    }
  }
  
  function simpleDropdown() {
    $('.input-dropdown-inner').each(function() {
      var dd = $(this);
      var btn = dd.find('> a');
      var input = dd.find('> input');
      var list = dd.find('> ul'); //.dd-list-wrapper

      $(document).click(function(e) {
        var target = e.target;
        if (dd.hasClass('dd-shown') && !$(target).is('.input-dropdown-inner') && !$(target).parents().is('.input-dropdown-inner')) {
          hideList();
          return false;
        }
      });

      btn.on('click', function(e) {
        e.preventDefault();
        if (dd.hasClass('dd-shown')) {
          hideList();
        } else {
          $('.input-dropdown-inner.dd-shown > ul').show(100);
          $('.input-dropdown-inner.dd-shown').removeClass('dd-shown');
          showList();
        }
        return false;
      });

      function showList() {
        dd.addClass('dd-shown');
        list.slideDown(100);
      }

      function hideList() {
        dd.removeClass('dd-shown');
        list.slideUp(100);
      }
    });

    $('.swatch_sticky').each(function() {
      var btn = $(this);
      btn.on('click', function(e) {
        e.preventDefault();
        $('#idForm').val($(this).attr('data-val'));
        if($(this).attr('data-img') !== undefined ){
          $('#pr_img_sticky img').attr('src',$(this).attr('data-img'));
        }
        $('.swatch_sticky').removeClass('selected');
        $(this).addClass('selected');
        var label = $(this).find('a label').text() + ' - ' + $(this).find('a span').text();
        $('#labelDropdown').text(label);
      });
    });
  }

  /* ---------------------------------------------
   HEIGHT FULL
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
   SCROLL
   --------------------------------------------- */
  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  var keys = {37: 1, 38: 1, 39: 1, 40: 1};

  window.preventDefault = function(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;  
  }

  window.preventDefaultForScrollKeys = function(e) {
    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  }

  window.disableScroll = function(e) {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
  }

  window.enableScroll = function(e) {
      if (window.removeEventListener)
          window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.onmousewheel = document.onmousewheel = null; 
      window.onwheel = null; 
      window.ontouchmove = null;  
      document.onkeydown = null;  
  }

  /* ---------------------------------------------
     Scripts ready
   --------------------------------------------- */
  $(document).ready(function() {
    MasoryFilter();
    kt_quickView();
    kt_quickShop();
    kt_search();
    kt_countdown();
    kt_parallax();
    block_category_carousel();
    customize_error();
    instagram();
    addwishlist();
    removewishlist();
    realTimeVisitor();
    if($('.widget_recent_product').length > 0 || $('#ProductSection-product-template').length > 0){
      recentlyViewedAdd();
    }
    responsive_item_slide();
    processbar();
    simpleDropdown();    
    AutoloadCompare();
    AddCompare();
    RemoveCompare();
    // Scroll top Top
    $(document).on('click','.scrollToTop',function() {
      $('body,html').animate({scrollTop:0},800);
    });

    // MENU SIDEBAR
    $(document).on('click','#header .close-header-sidebar',function(){
      $(this).closest('#header').addClass('closed').removeClass('opened');
    })
    $(document).on('click','#header .open-header-sidebar',function(){
      $(this).closest('#header').removeClass('closed').addClass('opened');
    });

    $(document).on('click','.header-categoy-menu .close-header-sidebar',function(){
      $(this).closest('.header-categoy-menu').addClass('closed').removeClass('opened');
    })
    $(document).on('click','.header-categoy-menu .open-header-sidebar',function(){
      $(this).closest('.header-categoy-menu').removeClass('closed').addClass('opened');
    });

    //Accordion mobile menu
    $('#mobile-menu ul li.has-sub').append('<span class="holder"></span>');
    $(document).on('click','.holder',function(){
      var element = $(this).closest('li');
      if (element.hasClass('open')) {
        element.removeClass('open');
        element.find('li').removeClass('open');
        element.find('ul').slideUp();
      }
      else {
        element.addClass('open');
        element.children('ul').slideDown();
        element.siblings('li').children('ul').slideUp();
        element.siblings('li').removeClass('open');
        element.siblings('li').find('li').removeClass('open');
        element.siblings('li').find('ul').slideUp();
      }
    });

    $('body').on('click','.modal-content .main-image img',function(event){
      event.preventDefault();
    });    
    
    //VIDEO LIGHTBOX
    if ( $('a.link-lightbox').length ){
      $.each($('a.link-lightbox'), function(index, val) {        
        var vrvideo = $(this).data('url');
        if(vrvideo !== undefined){
          if((vrvideo).indexOf('.mp4') !== -1){
            $(this).magnificPopup({
              items: [
                {
                  src: '<div class="white-popup"><div class="white-popupcontent"><video class="amp-page amp-video-element" controls="controls" autoplay><source type="video/mp4" src="'+vrvideo+'"></video></div></div>',
                  type: 'inline'
                }
              ],
              type: 'image'
            });
          }else if((vrvideo).indexOf('youtube.com') !== -1 || (vrvideo).indexOf('vimeo.com') !== -1){
            $(this).magnificPopup({
              items: [
                {
                  src: vrvideo,
                  type: 'iframe'
                }
              ],
              type: 'image'
            });
          }
        }
      });
    }
    
    $(document).on('click', '.fake_select label', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if($(this).parents('.fake_select').hasClass('show')){
        $('.fake_select.show').removeClass('show');
      }else{
        $('.fake_select.show').removeClass('show');
        $(this).parents('.fake_select').addClass('show');
      }
    });
    
    $(document).on("click", function(e) {
      if ($(e.target).is('.fake_select') === false) {
        $('.fake_select').removeClass("show");
      }
    });
    
    $(document).on('click', '.play-lifestyle-video', function(e) {
      e.preventDefault();
      $(this).parents('.photos-slider--active').toggleClass('show-video')
    }); 

    $(document).on('click', '.photos-slider--active .icon-play-video', function(e) {
      e.preventDefault();
      var vid = document.getElementById("myVideo");
      vid.play(); 
    });
    
    $(document).on('click', '.photos-slider--active svg.icon-close', function(e) {
      e.preventDefault();
      var vid = document.getElementById("myVideo");
      vid.pause(); 
    });
    
    $(document).on('change', '.cart__popup-quantity input.qty' ,function(){
      var pid = parseInt($(this).attr('data-pid')),
          quantity = parseInt($(this).val());
      if(quantity == 0){
        Shopify.KT_removeItem(pid,Shopify.KT_updatePopup);
        $(this).val(1);
      }
      else{
        Shopify.KT_changeItem(pid,quantity,Shopify.KT_updatePopup);
      }
    });
    
    $(document).on('focusout', '#CartSpecialInstructions' ,function(){
      $('#cartModal .checkout-button').prop('disabled', true);
      Shopify.KT_updateCartNote($(this).val(),Shopify.KT_updatedCartNote);
    });
    
    var $val_input = null;
    $(".box-search input.search").keyup(function(event) {
      event.preventDefault();
      $val_input = $(this).val();
      ajaxSearch($(this))
    });

    $(document).on('click','.scroll_top',function() {
      $('body,html').animate({scrollTop:0},800);
    });
    
    $(document).on('click', '.kt_filterGroupItem .layered_subtitle_heading', function(e){
      e.preventDefault();
      e.stopPropagation();
      if($(this).parents('.kt_filterGroupItem').hasClass('show')){
        $('.kt_filterGroupItem.show').not('.showAny').removeClass('show');
      }
      else{
        $('.kt_filterGroupItem.show').removeClass('show');
        $(this).parents('.kt_filterGroupItem').addClass('show');
      }
    });
    $(document).on('click', function(e){
      if ($(e.target).is('.kt_filterGroupItem *') === false ) {
        $('.kt_filterGroupItem').removeClass("show");
      }
      if ($(e.target).is('.kt_dropdown .kt_layerfilterGroups') === false) {
        $('.kt_dropdown .kt_layerfilterGroups').slideUp();
      }
      if ($(e.target).is('.showQuickShop *') === false) {
        $('.showQuickShop button.close').trigger('click');
      }
    });
    $(document).on('click', '.filter-by.filterDrop', function(e){
      e.preventDefault();
      e.stopPropagation();
      $(this).toggleClass('opened');
      $('.kt_dropdown .kt_layerfilterGroups').is(':hidden') ? $('.kt_dropdown .kt_layerfilterGroups').slideDown('slow')  : $('.kt_dropdown .kt_layerfilterGroups').slideUp();
    });

    $(document).on('click', '.filter-by.filterMobile, #filterApply, .headFilter .close', function(e){
      e.preventDefault();
      e.stopPropagation();
      if($('.kt_layerFilter.kt_layerMobilde').hasClass('show')){
        $('.kt_layerFilter.kt_layerMobilde.show').removeClass('show');
      }
      else{
        $('.kt_layerFilter.kt_layerMobilde').addClass('show');
      }
    });

    // Select image product
    $(document).on('click','.block-single-product .attributes .item span',function(){
      var image = $(this).data('image');
      var vrid = $(this).data('vrid');
      if( typeof image == undefined || image == ""){
        return false;
      }
      if( typeof vrid == undefined || vrid == ""){
        return false;
      }
      $(this).closest('.block-single-product').find('.product-image img').attr('src',image);
      $(this).closest('.block-single-product').find('.addtocart').attr('onclick',"Shopify.KT_addItem('"+vrid+"',1)");
      return false;
    })

    // Select image product gird
    $(document).on('click','li.grid-item .attributes .item span',function(){
      var image = $(this).data('image'),vrid = $(this).data('vrid'),vrprice = $(this).data('vrprice'),vrcompareprice = $(this).data('vrcompareprice');
      if( typeof image == undefined || image == ""){
        return false;
      }
      if( typeof vrid == undefined || vrid == ""){
        return false;
      }
      $(this).closest('.product-inner').find('.attributes .swatch-on-grid').removeClass('active');      
      $(this).closest('.product-inner').find('.price ins').html(theme.Currency.formatMoney(vrprice, theme.moneyFormat));
      var pr_vrcompareprice = $(this).closest('.product-inner').find('.price del');
      if(vrcompareprice != undefined && vrcompareprice != null && vrcompareprice != ''){
        pr_vrcompareprice.removeClass('hidden').html(theme.Currency.formatMoney(vrcompareprice, theme.moneyFormat));
      }else{
        if(pr_vrcompareprice.hasClass('hidden') === false){pr_vrcompareprice.addClass('hidden')}
      }      
      if(theme.function.multiCurrency == true && cookieCurrency !== null && cookieCurrency !== shopCurrency){
        Currency.convertAll(shopCurrency,cookieCurrency,'.product-inner span.money');
      }
      $(this).parent().addClass('active');
      var width = $(this).closest('.product-inner').find('.front-image').width();
          width = (Modernizr.touch) ? width * 2 : width;
      $(this).closest('.product-inner').find('.front-image').html('<img src="'+image.replace('_480x','_'+width+'x')+'" alt="'+$(this).data('vrtitle')+'">');
      $(this).closest('.product-inner').find('.boutique__add-to-cart').not('.quick-shop').attr('onclick',"Shopify.KT_addItem('"+vrid+"',1);$(this).addClass('loading').removeClass('loaded')");
      return false;
    })
    
    $(document).on('submit', "form#layered_form,form#layered_form_clone", function(event){
      event.preventDefault();
    });
    
    // Create an event listener to set a specific variant option when clicking on swatches.
    $(document).on('click', '[data-change-option]', function(e) {      
      //Single product page    
      var templateSinglePr = 'product-template';
      if($(this).parents('.product-page').length > 0){
        templateSinglePr = $(this).parents('.product-page').attr('data-section-id');
      }
      e.preventDefault();
      goto = true;
      var optionIndex = $(this).data('change-option');
      optionValue = $(this).data('value');
      $(this).parent().find('li').removeClass('selected');
      $(this).addClass('selected');
      $("#ProductSection-"+templateSinglePr+" #"+optionIndex).val(optionValue).trigger('change');
      $("#ProductSection-"+templateSinglePr+" label[data-change-label='"+optionIndex+"'] .text").html(optionValue);
      $("#ProductSection-"+templateSinglePr+" .swatches-selected-name[data-change-label='"+optionIndex+"'] .name").html(optionValue);
      $('#ProductSection-'+templateSinglePr+' .fake_select.show').removeClass('show');
    });
    if (window.Shopify && Shopify.StorefrontExpressButtons) {
      Shopify.StorefrontExpressButtons.initialize();
    }
    var windowScroll = 0;
    $('.modal').on('shown.bs.modal', function () {
      // will only come inside after the modal is shown
      if($('.modal:visible').length == 1){
        windowScroll = $(window).scrollTop();
        $('body').attr('data-scroll-top', windowScroll);
      }else{
        windowScroll = _.toNumber($('body').attr('data-scroll-top'));
      }
      TweenLite.to($('body'), 0,{overflow:'hidden',position:'fixed',marginTop:windowScroll*-1});
    });
    $('.modal').on('hide.bs.modal', function () {
      // will only come inside after the modal is shown
      var padding_right = 0;
      if($('.modal:visible').length > 1){
        windowScroll = _.toNumber($('body').attr('data-scroll-top'));
        padding_right = theme.getScrollbarWidth;        
        TweenLite.to($('body'), 0,{overflow:'hidden',position:'fixed',marginTop:windowScroll*-1,paddingRight:padding_right,onComplete: function () {}});        
        setTimeout(function(){
          $('body').addClass('modal-open');
        }, 401)
      }else{
        TweenLite.to($('body'), 0,{overflow:'visible',position:'static',marginTop:0,onComplete: function () {$(window).scrollTop(windowScroll)}});
      }
    });
  });  
  /* ---------------------------------------------
   Scripts initialization
   --------------------------------------------- */
  $(window).load(function() {
    scrollbar_header_sidebar();    
    if($('#instafeed, #instafeed_1').length > 0){
      $('#instafeed li:empty, #instafeed_1 li:empty').remove();
      $('#instafeed, #instafeed_1').removeClass('hidden');
    }
  });
    
  document.addEventListener("DOMContentLoaded", function(event) {
    // product-card-list nosidebar
    $('.listThumbScroll').each(function(){
      $(this).css('height',$(this).height()+'px');
      $(this).find('.ab').removeClass('ab');
      $(this).mThumbnailScroller({
        axis:"y", //change to "y" for vertical scroller
        type:"hover-precise"
      });
    })
    var dataScrollNewsletterPopup = parseInt($('#newsletterModal').attr('data-scroll'));
    if( dataScrollNewsletterPopup == 0 ){
      checkCookieNewsletterPopup();
    }

    var $form = $('#mc-embedded-subscribe-form-kiti')
    if ($form.length > 0 && theme.function.nll_ajax) {
      $('form button[type="submit"]').bind('click', function (event) {
        if (event) event.preventDefault()
        register($form)
      })
    }
    recentlyViewedProductSingle();
  });

  /* ---------------------------------------------
   Scripts scroll
   --------------------------------------------- */
  $(window).scroll(function() {
    // Show hide scrolltop button
    var windowHeight = $(window).height();
    if($(this).scrollTop() > windowHeight ) {
      $('.scroll_top').fadeIn(500);
    } else {
      $('.scroll_top').fadeOut(800);
    }
    // Show hide newletter
    var dataScrollNewsletterPopup = parseInt($('#newsletterModal').attr('data-scroll'));
    if( $(window).scrollTop() >= dataScrollNewsletterPopup && dataScrollNewsletterPopup != 0 ){
      checkCookieNewsletterPopup();
    }
    // Show hide sticky tool bar
    if($(window).scrollTop() > $('#header').offset().top) {
      stickyToolbar('up');
    } else {
      stickyToolbar('down');
    }
    if($(window).scrollTop() > $('#header').offset().top + 40) {
      stickyToolbar('up');
    } else {
      stickyToolbar('down');
    }
    // Show hide sticky add to card
    if($('#AddToCartText-product-template').length){
      var $this = $('.jas-sticky-atc');
      if ($(window).scrollTop() > $('#AddToCartText-product-template').offset().top + 60 && $('.jas-sticky-atc').not('.fixed')) {
        var headerHeight = $('.header.ontop').outerHeight() || 0;
        $this.addClass('fixed')
        if($this.hasClass('top')){
          $this.css('top',headerHeight+'px');
        }
        $('body').addClass('add_sticky_nt');
        var spaceBottom = $('.jas-sticky-atc.fixed').outerHeight() || $('.claue-cookies-popup.popup-display').outerHeight() || 25;
        spaceBottom != undefined ? spaceBottom + 10 : spaceBottom = 25;
        $('.basel-products-suggest').css('bottom',spaceBottom+'px')
        var spaceBottomScrollTop = $('.jas-sticky-atc.fixed.justify-content-md-end').outerHeight() || $('.claue-cookies-popup.popup-display').outerHeight() || 32;
        spaceBottomScrollTop != undefined ? spaceBottomScrollTop + 10 : spaceBottomScrollTop = 32;
        $('.scroll_top').css('bottom',spaceBottomScrollTop+'px');
      }
      else if($(window).scrollTop() <= $('#AddToCartText-product-template').offset().top){
        $this.removeClass('fixed')
        if($this.hasClass('top')){
          $this.css('top','0px');
        }
        $('body').removeClass('add_sticky_nt');        
        var spaceBottom = $('.jas-sticky-atc.fixed').outerHeight() || $('.claue-cookies-popup.popup-display').outerHeight() || 25;
        spaceBottom != undefined ? spaceBottom + 10 : spaceBottom = 25;
        $('.basel-products-suggest').css('bottom',spaceBottom+'px')
        var spaceBottomScrollTop = $('.jas-sticky-atc.fixed.justify-content-md-end').outerHeight() || $('.claue-cookies-popup.popup-display').outerHeight() || 32;
        spaceBottomScrollTop != undefined ? spaceBottomScrollTop + 10 : spaceBottomScrollTop = 32;
        $('.scroll_top').css('bottom',spaceBottomScrollTop+'px');
      }
    }
  });
  
  /* ---------------------------------------------
   Scripts resize
   --------------------------------------------- */
  $(window).on("resize", function() {    
    kiti_banner();
    scrollbar_header_sidebar();
    // product-card-list nosidebar
    $('.listThumbScroll').each(function(){
      var height = $(this).parent().find('.product-thumb .front-image img').height();
      $(this).css('height',height+'px');
    });
  });
//   var lastScrollTop = 0;
//   $(window).on('scroll', function() {
//     var st = $(this).scrollTop();
//     if(st < lastScrollTop + 40) {
//       stickyToolbar('up');
//     }
//     else if(st > lastScrollTop - 40) {
//       stickyToolbar('down');
//     }
//     lastScrollTop = st;
//   });
  
//   $('body').on('mousewheel', function(e){
//     if(e.originalEvent.wheelDelta > 0) {
//       stickyToolbar('up');
//     }
//     else {
//       stickyToolbar('down');
//     }
//   });
  
  // if ($.support.pjax) {
  //   $(document).on('click', 'a[data-pjax]', function(event) {
  //     $.pjax.click(event, {
  //       container: '#MainContent',
  //       fragment: '#MainContent',
  //       timeout: 4000,
  //       scrollTo: false
  //     })
  //   });
  // }
  
  $(document).on('pjax:send', function() {
//     alert('send');
  })
  
  // $(document).on('pjax:complete', function() {
  //   var sections = new theme.Sections();
  //   sections.register('cart-template', theme.Cart);
  //   sections.register('product', theme.Product);
  //   sections.register('collection-template', theme.Filters);
  //   sections.register('header-section', theme.HeaderSection);
  //   sections.register('map', theme.Maps);
  //   sections.register('slideshow-section', theme.SlideshowSection);
  //   sections.register('carousel-section', theme.CarouselSection);
  //   sections.register('masory-section', theme.MasorySection);
  //   sections.register('quotes', theme.Quotes);
  //   theme.variantImage();
  //   theme.menuBgChange();
  // })
})( jQuery );