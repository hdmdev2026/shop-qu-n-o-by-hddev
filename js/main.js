var RF = {};
window.cartJS = {};
window.accountJS = {};
window.checkoutsJS = {};
window.productLoop = {};
var sizeImg = 'grande',
  sizeImgDetail = '1024x1024',
  sizeThumb = 'grande';
RF.init = function () {
  RF.Global.init();
  if (shop.template.indexOf('index') != -1) {
    RF.Index.init();
  }
  if (shop.template.indexOf('collection') != -1) {
    RF.Collection.init();
  }
  if (shop.template.indexOf('product') != -1) {
    RF.Product.init();
  }
  if (shop.template.indexOf('cart') != -1) {
    RF.Cart.init();
  }
  if (shop.template == 'customers[account]') {
    RF.Account.init();
  }
  if (shop.template == 'customers[account].orders') {
    RF.ListOrder.init();
  }
  if (shop.template == 'customers[account].order' || shop.template == 'customers[order]') {
    RF.OrderDetail.init();
  }
  if (shop.template === 'customers[register].otp' || shop.template.indexOf('customers[login]') != -1 || shop.template === 'customers[register]' || shop.template === 'customers[reset_password]' || shop.template === 'customers[activate_account]') {
    RF.FormAccount.init();
  }
  if (shop.template == 'customers[addresses]') {
    RF.Addresses.init();
  }
  if (shop.template == 'search') {
    RF.PageSearch.init();
  }
  if (shop.template == 'page.ldp_branding' || shop.template == 'page.ldp_branding_v2') {
    RF.LDPBranding.init();
  }
  if (shop.template == 'customers[account].voucher') {
    RF.AccountVoucher.init();
  }
  if (shop.template == 'customers[account].review') {
    RF.AccountReview.init();
  }
  if (shop.template == 'customers[account].preview') {
    RF.AccountPreview.init();
  }
  if (shop.template == 'customers[account].wishlist') {
    RF.Wishlist.init();
  }
  if (shop.template == 'page.about-us') {
    RF.AboutUS.init();
  }
  if (shop.template == 'page.shoplist') {
    RF.ShopList.init();
  }
  if (shop.template == 'page.member-infomation') {
    RF.MemberInfomation.init();
  }
  if (shop.template.indexOf('blog') != -1) {
    RF.Blog.init();
  }
  if (shop.template.indexOf('article') != -1) {
    RF.Article.init();
  }
};
RF.CookiesBox = {
  storageKey: 'rf_cookies_consent',
  $el: null,
  init: function () {
    var that = this;
    that.$el = $('#cookies-box');
    if (!that.$el.length) return;
    that.bindEvents();
    if (!that.hasDecision()) {
      that.show();
    }
  },
  hasDecision: function () {
    try {
      var value = localStorage.getItem(this.storageKey);
      return value === 'accepted' || value === 'rejected';
    } catch (e) {
      return false;
    }
  },
  save: function (value) {
    try {
      localStorage.setItem(this.storageKey, value);
    } catch (e) {}
  },
  show: function () {
    if (!this.$el || !this.$el.length) return;
    this.$el.addClass('is-visible').attr('aria-hidden', 'false');
  },
  off: function () {
    if (!this.$el || !this.$el.length) return;
    this.$el.removeClass('is-visible').attr('aria-hidden', 'true');
  },
  bindEvents: function () {
    var that = this;
    that.$el.on('click', '[data-cookies-action]', function () {
      var action = $(this).attr('data-cookies-action');
      that.save(action);
      that.off();
    });
  },
};
RF.MemberInfomation = {
  init: function () {
    var that = this;
    that.sliderHome();
  },
  sliderHome: function () {
    var mySwiper = new Swiper('.swiper-member-slider', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#slider-member .swiper-button-next',
        prevEl: '#slider-member .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
};
RF.CustomerReviewLoop = {
  data: {},
  init: function () {
    var that = this;
    that.api();
  },
  api: function () {
    var self = this;
    var list = self.check();
    if (list.length > 0) {
      var validateList = list.filter((id) => self.data[id] == undefined);
      var version = new Date().getTime();
      if (validateList.length > 0) {
        var url = 'https://customer-reviews-api.haravan.app/api/buyer/product_rating/report?org_id=' + shop.id + '&product_ids=' + validateList.join(',') + '&v=' + version;
        $.get(url, function (response) {
          if (response.rating_reports && response.rating_reports.length > 0) {
            response.rating_reports.map((product) => {
              self.data[product.product_id] = product;
            });
          }
          self.render(list);
        });
      } else {
        self.render(list);
      }
    }
  },
  render: function (ids) {
    var self = this;
    var data = self.data;
    if (ids.length > 0) {
      ids.map((id) => {
        var dataId = data[id];
        if (dataId != undefined) {
          var avg = self.formatToOneDecimalIfNeeded(dataId.avg);
          if ($('.product-loop[data-id-product="' + id + '"] .cus-avg-star').length == 0) {
            $('.product-loop[data-id-product="' + id + '"] .custom-rating-new').prepend('<div class="cus-avg-star">' + avg + '</div>');
            $('.product-loop[data-id-product="' + id + '"] .hrv-crv-star-total').html('(' + dataId.total_ratings + ')');
            //$('.product-loop[data-id-product="'+id+'"]').addClass('render-review');
          }
        }
      });
    }
  },
  check: function () {
    var self = this;
    var ids = [];
    $('.product-loop:not(.render-review)').each(function () {
      var $this = $(this);
      var id = parseInt($this.attr('data-id-product'));
      if (id) {
        ids.push(id);
      }
      $(this).addClass('render-review');
    });
    return ids;
  },
  formatToOneDecimalIfNeeded: function (number) {
    if (Number.isInteger(number)) {
      return number;
    }
    return Math.floor(number * 10) / 10;
  },
};
RF.ShopList = {
  distObj: {},
  firstFrame: false,
  init: function () {
    var that = this;
    that.action();
    RF.Module.openLoading(function () {
      that.api(function () {
        that.render();
      });
    });
  },
  htmlItem: function () {
    var self = this;
    var $province = $('#city').val();
    var $shops = $('#shops').val();
    var data = self.distObj[$province];
    if ($shops != '') {
      var check = data.filter((item) => item.shop == $shops);
      if (check.length > 0) {
        data = check;
      }
    }
    $('.count-store span').html(data.length);
    if (data.length > 0) {
      console.log(data);
      var htmlItem = '';
      data.map((item, index) => {
        var active = '';
        if (index == 0) {
          active = 'active';
        }
        htmlItem += '<div class="store-card ' + active + '" data-index="' + index + '">';
        //htmlItem += '<p class="city">'+$province+'</p>';
        htmlItem += '<h3>' + item.shop + '</h3>';
        htmlItem += '<div class="wrap-content">' + item.info + '</div>';
        htmlItem += '</div>';
      });
      $('.wrap-store-card').html(htmlItem);
      if (!self.firstFrame) {
        self.renderFrame();
        self.firstFrame = true;
      }
    }
  },
  renderFrame: function () {
    var self = this;
    var $this = $('.store-card.active');
    var $line = $this.attr('data-index');
    var $province = $('#city').val();
    var data = self.distObj[$province];
    var get = data[$line];
    var newDiv = document.createElement('div');
    newDiv.innerHTML = get.map.replace('&lt;iframe', '<iframe').replace('&lt;/iframe&gt;', '</iframe>');
    if ($(window).width() < 992) {
      $('#map-mb').html(newDiv);
    } else {
      $('#map').html(newDiv);
    }
  },
  render: function () {
    var self = this;
    var distHTML = '';
    Object.keys(self.distObj).map((dist) => {
      if (dist && dist !== 'undefined') {
        distHTML += `<option value='${dist}'>${dist}</option>`;
      }
    });
    $('#city').html(distHTML);
    $('#city').change();
  },
  action: function () {
    var self = this;
    $(document).on('click', '.store-card', function () {
      var $this = $(this);
      $('.store-card').removeClass('active');
      $(this).addClass('active');
      self.renderFrame();
    });
    $('#city').change(function () {
      var html = '<option value="">Chọn cửa hàng</option>';
      //console.log(self.distObj);
      self.distObj[$(this).val()].map((item) => {
        item.shop = $(`<option value='${item.shop}'>${item.shop}</option>`).text();
        html += `<option value='${item.shop}'>${item.shop}</option>`;
      });
      if (html === "<option value=''></option>") {
        html = `<option value=''>Không tìm thấy cửa hàng</option>`;
      }
      $('#shops').html(html);
      $('#shops').val($('#shops option').val()).change();
      self.htmlItem();
    });
    $('#shops').change(function () {
      self.htmlItem();
      /*var shop = self.distObj[$('#city').val()].find(item => {
        return item.shop === $(this).val();
      });
      if(shop){
        $('#shop-infor').html(`<p>${shop.info}</p>`)
      }
      if(!$('#shop-infor').text().trim() || !shop){
        $('#shop-infor').html(`<p>Không tìm thấy cửa hàng</p>`)
        $('#shops').html(`<option value=''>Không tìm thấy cửa hàng</option>`)
      }
      var newDiv = document.createElement("div"); 
      newDiv.innerHTML = shop.map.replace('&lt;iframe','<iframe').replace('&lt;/iframe&gt;', '</iframe>')
      $('#map').html(newDiv)*/
    });
  },
  api: function (callback) {
    var self = this;
    var spreadSheet = shop.spreadSheet;
    var id = spreadSheet.match(/(d\/)(.*)(?=\/)/gm);
    var gid = '0';
    var url = 'https://docs.google.com/spreadsheets/' + id + '/gviz/tq?tqx=out:json&tq&gid=' + gid;
    var params = {
      type: 'GET',
      url: url,
      dataType: 'text',
      success: function (data) {
        var from = data.indexOf('{');
        var to = data.lastIndexOf('}') + 1;
        var jsonText = data.slice(from, to);
        var parsedText = JSON.parse(jsonText);
        var table = parsedText.table;
        if (!table || !table.rows || !table.rows.length) {
          RF.Module.removeLoading();
          return;
        }
        var result = table.rows.map((item) => {
          return item.c;
        });
        self.distObj = [...new Set(result.map((item) => item[0].v.trim()))].reduce((obj, item) => {
          obj[item] = [];
          return obj;
        }, {});
        result.map((item) =>
          self.distObj[item[0].v.trim()].push({
            shop: item[1].v,
            info: item[2].v,
            map: item[3].v,
          }),
        );
        RF.Module.removeLoading();
        if (typeof callback === 'function') {
          return callback();
        }
      },
      error: function () {
        RF.Module.removeLoading();
      },
    };
    $.ajax(params);
  },
};
RF.MiniCart = {
  first: false,
  init: function () {
    var that = this;
    that.action();
  },
  addLoading: function (callback) {
    $('.cart-preview').addClass('loading');
    if (typeof callback === 'function') {
      return callback();
    }
  },
  removeLoading: function (callback) {
    $('.cart-preview').removeClass('loading');
    if (typeof callback === 'function') {
      return callback();
    }
  },
  render: function () {
    var html = '';
    $('.total-price-cart').html(Haravan.formatMoney(cartJS.total_price, shop.moneyFormat));
    $('.count-total-cart').html(cartJS.item_count);
    if (cartJS.items.length > 0) {
      cartJS.items.map((item, index) => {
        html += '<div class="cart-item">';
        html += '<div class="cart-img">';
        html += '<img src="' + Haravan.resizeImage(item.image, 'large') + '" alt="' + item.title + '">';
        html += '</div>';
        html += '<div class="cart-info">';
        html += '<h4>' + item.title + '</h4>';
        html += '<p>' + item.variant_title + '</p>';
        html += '<div class="price">' + Haravan.formatMoney(item.price, shop.moneyFormat) + '</div>';
        html += '<p>x' + item.quantity + '</p>';
        html += '</div>';
        html += '<button data-index="' + index + '" class="remove-btn">×</button>';
        html += '</div>';
      });
    } else {
      html += '<div class="empty-item-cart">Hiện chưa có sản phẩm trong giỏ hàng</div>';
    }
    $('.wrap-cart-preview').html(html);
  },
  action: function () {
    var self = this;
    $(document).on('click', '.cart-preview .remove-btn', function () {
      var $this = $(this);
      var line = parseInt($this.attr('data-index')) + 1;
      var currentQty = 0;
      var params = {
        type: 'POST',
        url: '/cart/change.js',
        data: 'quantity=' + currentQty + '&line=' + line,
        dataType: 'json',
        success: function (data) {
          if (shop.template == 'cart') {
            location.reload();
          } else {
            RF.Module.cartJS(function () {
              self.removeLoading();
            });
          }
        },
      };
      self.addLoading(function () {
        $.ajax(params);
      });
    });
  },
};
RF.Menu = {
  init: function () {
    var that = this;
    that.hoverSub1();
    that.tabMenuMobile();
    that.sliderBanner();
  },
  sliderBanner: function () {
    var mySwiper1 = new Swiper('#menu-mb-new .mySwiper1', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper1 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper1 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
    var mySwiper2 = new Swiper('#menu-mb-new .mySwiper2', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper2 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper2 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
    var mySwiper3 = new Swiper('#menu-mb-new .mySwiper3', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper3 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper3 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
    var mySwiper4 = new Swiper('#menu-mb-new .mySwiper4', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper4 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper4 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
    var mySwiper5 = new Swiper('#menu-mb-new .mySwiper5', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper5 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper5 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
    var mySwiper6 = new Swiper('#menu-mb-new .mySwiper6', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#menu-mb-new .mySwiper6 .swiper-button-next',
        prevEl: '#menu-mb-new .mySwiper6 .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
  hoverSub1: function () {
    $('.li-mega > a').hover(
      function () {
        $('header').addClass('show-submenu');
      },
      function () {
        $('header').removeClass('show-submenu');
      },
    );
    $('.ul-lv2').hover(
      function () {
        $('header').addClass('show-submenu');
      },
      function () {
        $('header').removeClass('show-submenu');
      },
    );
    $('.store-headernew').hover(
      function () {
        $('header').addClass('show-submenu');
      },
      function () {
        $('header').removeClass('show-submenu');
      },
    );
  },
  tabMenuMobile: function () {
    $(document).on('click', '#menu-mb-new .tab-header button', function () {
      var $button = $(this);
      var $code = $button.attr('data-tab');
      $('#menu-mb-new .tab-content[data-tab="' + $code + '"]').addClass('active');
      $('#menu-mb-new .tab-content[data-tab!="' + $code + '"]').removeClass('active');
      $('#menu-mb-new .tab-header button[data-tab="' + $code + '"]').addClass('active');
      $('#menu-mb-new .tab-header button[data-tab!="' + $code + '"]').removeClass('active');
    });
    $(document).on('click', '#menu-mb-new .accordion-item .title .arrow-open', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const $arrow = $(this);
      const $title = $arrow.closest('.title');
      const $content = $title.next();
      $('#menu-mb-new .accordion-item .title .arrow-open').not($arrow).removeClass('active');
      $('#menu-mb-new .accordion-item .title').not($title).next().slideUp();
      $arrow.toggleClass('active');
      $content.slideToggle();
    });
    $(document).on('click', '.care-share .title .arrow-open', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const $arrow = $(this);
      const $careShare = $arrow.closest('.care-share');
      const $content = $careShare.find('ul');
      $('.care-share .title .arrow-open').not($arrow).removeClass('active');
      $('.care-share').not($careShare).find('ul').slideUp();
      $arrow.toggleClass('active');
      $content.slideToggle();
    });
  },
};
RF.AboutUS = {
  init: function () {
    var that = this;
    that.sliderHome();
  },
  sliderHome: function () {
    var mySwiper = new Swiper('.swiper-aboutus-slider', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#slider-aboutus .swiper-button-next',
        prevEl: '#slider-aboutus .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
};
RF.Wishlist = {
  dataFilter: {},
  init: function () {
    var that = this;
    that.actionPagi();
    that.renderWishlistPage();
    that.addtocart();
    that.deleteItems();
  },
  deleteItems: function () {
    var self = this;
    $(document).on('click', '.remove-wishlist', function () {
      var $title = $(this).attr('data-title');
      var $handle = $(this).attr('data-handle');
      self.remove($title, $handle);
    });
  },
  addtocart: function () {
    $(document).on('click', '.btn-addtocart', function () {
      $(this).parents('.product-loop').find('.addtocart-loop').click();
    });
  },
  initProduct: function () {
    var that = this;
    that.checkWishlist();
    that.actionBtnWishlist();
  },
  appendBtnRemove: function () {
    $('#wishlist-container .product-loop').each(function () {
      var $this = $(this);
      $this.addClass('loop-wishlist');
      var $title = $this.find('.box-info h4 a').html();
      var $handle = $this.find('.box-info h4 a').attr('href').split('/')[2];
      var html = '';
      html += '<div class="box-action-wishlist">';
      html += '<button class="btn-addtocart">Thêm vào giỏ</button>';
      html += '<button class="remove-wishlist" data-handle="' + $handle + '" data-title="' + $title + '">Xoá</button>';
      html += '</div>';
      $this.find('.box-info').append(html);
    });
  },
  checkWishlist: function () {
    var self = this;
    var list = self.getList();
    if (list.length > 0) {
      list.map((item) => {
        $('.btn-wishlist[data-handle="' + item + '"]').addClass('in-wishlist');
      });
    }
  },
  checkWishlistQV: function () {
    var self = this;
    var list = self.getList();
    $('.btn-wishlist-qv').removeClass('in-wishlist');
    if (list.length > 0) {
      list.map((item) => {
        $('.btn-wishlist-qv[data-handle="' + item + '"]').addClass('in-wishlist');
      });
    }
  },
  actionBtnWishlist: function () {
    var self = this;
    $(document).on('click', '.btn-wishlist', function (e) {
      e.preventDefault();
      var $this = $(this);
      var $title = $this.attr('data-title');
      var $handle = $this.attr('data-handle');
      if ($this.hasClass('in-wishlist')) {
        self.remove($title, $handle);
        $this.removeClass('in-wishlist');
      } else {
        self.add($title, $handle);
        $this.addClass('in-wishlist');
      }
    });
  },
  actionBtnWishlistQV: function () {
    var self = this;
    $(document).on('click', '.btn-wishlist-qv', function (e) {
      e.preventDefault();
      var $this = $(this);
      var $title = $this.attr('data-title');
      var $handle = $this.attr('data-handle');
      if ($this.hasClass('in-wishlist')) {
        self.remove($title, $handle);
        $this.removeClass('in-wishlist');
      } else {
        self.add($title, $handle);
        $this.addClass('in-wishlist');
      }
    });
  },
  add: function (title, handle) {
    var self = this;
    var wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!wishlist.includes(handle)) {
      wishlist.push(handle);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      RF.Module.toastShow(`Đã thêm "${title}" vào wishlist.`);
    } else {
      RF.Module.toastShow(`"${title}" đã có trong wishlist.`);
    }
  },
  remove: function (title, handle, callback) {
    var self = this;
    var wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter((item) => item !== handle);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    RF.Module.toastShow(`Đã xoá "${title}" khỏi wishlist.`);
    if (typeof callback === 'function') {
      return callback();
    }
  },
  getList: function () {
    var rawList = JSON.parse(localStorage.getItem('wishlist')) || [];
    var cleanList = rawList.filter((item) => item !== null && item !== undefined && item !== '');
    localStorage.setItem('wishlist', JSON.stringify(cleanList));
    return cleanList;
  },
  getWishlistPage: function (page = 1, perPage = 8) {
    var self = this;
    var wishlist = self.getList();
    var totalItems = wishlist.length;
    var totalPages = Math.ceil(totalItems / perPage);
    var start = (page - 1) * perPage;
    var end = start + perPage;
    var pageData = wishlist.slice(start, end);
    return {
      currentPage: page,
      perPage,
      totalItems,
      totalPages,
      data: pageData,
    };
  },
  renderWishlistPage: function (page = 1) {
    var self = this;
    var result = self.getWishlistPage(page, 8);
    var $container = $('#wishlist-container');
    $container.empty();
    if (result.data.length === 0) {
      $container.append('Chưa có sản phẩm yêu thích nào.');
      $container.addClass('empty-prod');
      return;
    }
    var filters = result.data.map((handle) => `((handle:product=${handle}))`).join('||');
    self.filter(filters, page);
    self.renderPagination(result.currentPage, result.totalPages);
  },
  filter: function (query, pageSave) {
    var self = this;
    const $container = $('#wishlist-container');
    var data = {
      q: 'filter=' + query,
      type: 'product',
      page: 1,
      limit: 8,
    };
    if (self.dataFilter[pageSave] == undefined) {
      RF.ProductLoop.searchJS(data, function (response) {
        if (response.total > 0) {
          var items = RF.ProductLoop.loopHtml(response, false, '');
          self.dataFilter[pageSave] = '';
          self.dataFilter[pageSave] = items;
          $container.append(items);
          //RF.CustomerReviewLoop.init();
          self.appendBtnRemove();
        }
      });
    } else {
      $container.append(self.dataFilter[pageSave]);
      self.appendBtnRemove();
    }
  },
  renderPagination: function (currentPage, totalPages) {
    const $pagination = $('#wishlist-pagination');
    $pagination.empty();
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      $pagination.append(`<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`);
    }
  },
  actionPagi: function () {
    var self = this;
    $(document).on('click', '.page-btn', function () {
      const page = parseInt($(this).data('page'));
      self.renderWishlistPage(page);
    });
  },
};
RF.AccountPreview = {
  init: function () {
    var that = this;
    if (localStorage.getItem('viewed_products_handle') != null) {
      that.render();
    } else {
      $('.wrap-listing-product').addClass('empty-prod');
    }
  },
  render: function () {
    var self = this;
    var viewedProducts = JSON.parse(localStorage.getItem('viewed_products_handle'));
    if (viewedProducts.length > 20) {
      viewedProducts = viewedProducts.slice(0, 16);
    }
    if (viewedProducts.length > 0) {
      var listHandle = viewedProducts;
      var query = '((handle:product in ' + listHandle + '))&&((available:product=true))&&((price:product>0))';
      var data = {
        q: 'filter=' + query,
        type: 'product',
        page: 1,
        limit: 20,
      };
      RF.ProductLoop.searchJS(data, function (response) {
        if (response.total > 0) {
          var items = RF.ProductLoop.loopHtml(response, false, '');
          $('.wrap-listing-product').html(items);
          //RF.CustomerReviewLoop.init();
        }
      });
    }
  },
};
RF.AccountReview = {
  data: {},
  init: function () {
    var that = this;
    //that.api();
  },
  api: function (page) {
    var self = this;
    var org_id = shop.id;
    var current_page = 1;
    var cus_id = shop.account.id;
    if (page) {
      current_page = page;
    }
    var url = 'https://customer-reviews-api.haravan.app/api/buyer/product_rating?org_id=' + org_id + '&page=' + current_page + '&limit=10&customer_id=' + cus_id;
    $.get(url, function (response) {
      self.data = response;
      var html = self.items(response);
    });
  },
  items: function (data) {
    var html = '';

    html += '<div class="review-item">';
    html += '<div class="product-info">';
    html += '<div class="product-thumb bg-green">Sản Phẩm A</div>';
    html += '<div class="product-meta">';
    html += '<h3>Áo Thun Trẻ Em Cotton In Hình Vui Nhộn</h3>';
    html += '<p>Phân loại: Màu Xanh, Size M</p>';
    html += '<p>Ngày mua: 10/05/2025</p>';
    html += '</div>';
    html += '</div>';

    html += '<div class="rating">★★★★☆ <span>Rất tốt</span></div>';

    html += '<p class="review-content">';
    html += '<em>Chất vải mềm mại, thoáng mát, bé nhà mình rất thích. Hình in sắc nét, không bị bong tróc sau khi giặt. Sẽ ủng hộ shop tiếp!</em>';
    html += '</p>';

    html += '<p class="review-date">Đã đánh giá vào ngày 15/05/2025</p>';

    html += '<div class="reply-box">';
    html += '<strong>🛍️ Rabity Official Phản hồi:</strong>';
    html += '<p>';
    html += 'Cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của Rabity. Shop rất vui khi bé yêu thích sản phẩm này. Mong bạn sẽ tiếp tục đồng hành cùng Rabity trong thời gian tới!';
    html += '</p>';
    html += '<span class="reply-date">Ngày 16/05/2025</span>';
    html += '</div>';
    html += '</div>';
  },
};
RF.AccountVoucher = {
  init: function () {
    var that = this;
    that.render();
    that.open();
    that.copy();
  },
  copy: function () {
    $(document).on('click', '.btn-apply', function () {
      const code = $(this).data('code');
      const $tempInput = $('<input>');
      $('body').append($tempInput);
      $tempInput.val(code).select();
      document.execCommand('copy');
      $tempInput.remove();
      RF.Module.toastShow('Đã sao chép mã: ' + code);
    });
  },
  open: function () {
    $(document).on('click', '.open-voucher', function () {
      var $index = parseInt($(this).attr('data-index'));
      var $data = voucher_list[$index];
      var $modal = $('#voucher-detail');

      if ($data) {
        $modal.find('h3 span').html($data.label);

        if ($data.type == 'code') {
          $modal.find('.voucher-actions').removeClass('d-none');
          $modal.find('.btn-apply').attr('data-code', $data.code);
        } else {
          $modal.find('.voucher-actions').addClass('d-none');
        }

        var htmlText = `${$data.type == 'code' ? '<li><strong>Mã Voucher:</strong> ' + $data.code + '</li>' : ''}
        <li><strong>Mô tả ngắn:</strong> ${$data.short_label}</li>
        <li><strong>Điều kiện sử dụng:</strong> ${$data.des_condition}</li>
        ${$data.order_min_price != '' ? '<li><strong>Đơn hàng tối thiểu:</strong> ' + $data.order_min_price + '</li>' : ''}
        <li><strong>Áp dụng cho sản phẩm:</strong> ${$data.apply_to}</li>
        ${$data.expiry != '' ? '<li><strong>Ngày hết hạn:</strong> ' + $data.expiry + '</li>' : ''}`;

        $modal.find('.voucher-info').html(htmlText);

        $.fancybox.open($modal, {
          touch: false,
        });
      }
    });
  },
  render: function () {
    if (voucher_list.length > 0) {
      var html = '';
      voucher_list.map((voucher, index) => {
        html += '<div class="voucher-card">';
        html += '<div class="voucher-icon" style="background:' + voucher.color + ';">';
        html += '<strong>' + voucher.label + '</strong>';
        html += '<span>' + voucher.short_label + '</span>';
        html += '</div>';
        html += '<div class="voucher-info">';
        html += '<h4>' + voucher.title + '</h4>';
        html += '<p>' + voucher.short + '</p>';
        html += '<ul>';
        if (voucher.expiry != '') {
          html += '<li>HSD: ' + voucher.expiry + '</li>';
        }
        html += '<li>' + voucher.apply_to + '</li>';
        html += '</ul>';
        html += '<div class="voucher-actions">';
        html += '<a class="open-voucher" data-index="' + index + '" href="#" onclick="return false;">Xem chi tiết</a>';
        if (voucher.type == 'code') {
          html += '<button class="btn-apply" data-code="' + voucher.code + '">Dùng ngay</button>';
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';
      });
      $('.voucher-list').html(html);
    } else {
      $('.voucher-list').html('Hiện chưa có mã khuyến mãi nào');
    }
  },
};
RF.GiftPromotion = {
  urlAPI: '/apps/promotion-enterprise/api/gift/list-suggestion',
  init: function () {
    var that = this;
    that.api();
  },
  api: function () {
    var self = this;
    $.ajax({
      url: self.urlAPI + '?list_product_id=' + productDetail.id + '&additional_item_fields=product_handle,title,product_image',
      success: function (response) {
        if (!response.error) {
          self.render(response);

          //console.log(response);
        }
      },
    });
  },
  render: function (gift_data) {
    if (!gift_data.success || !gift_data.data || !Array.isArray(gift_data.data.items)) return;

    const $container = $('#gift-app-container').empty();

    gift_data.data.items.forEach((item) => {
      const $wrapper = $(`
        <div class="gift_app_pe-wrapper"
             data-code="${item.code}"
             data-condition-type="${item.condition_type}"
             data-apply-for="${item.apply_for}">
          <div class="gift_app_pe-title">${item.title}</div>
        </div>
      `);

      item.list_condition_and_gift_items.forEach((condition, index) => {
        const $conditionBox = $(`
          <div class="gift_app_pe-condition"
               data-id="${item._id}_${index}"
               data-condition-value="${condition.condition_value}"
               data-max-multiple="${condition.max_multiple}"
               data-is-limit-multiple="${condition.is_limit_multiple}">
            <div class="gift_app_pe-condition-title">
              Đơn hàng từ <strong>${condition.condition_value.toLocaleString()}đ</strong> sẽ nhận quà tặng sau:
            </div>
            <div class="gift_app_pe-condition-inner"></div>
          </div>
        `);

        condition.list_gift_items.forEach((gift) => {
          const $giftItem = $(`
            <div class="gift_app_pe-gift-item" data-id="${gift.product_id}">
              <div class="gift_app_pe-img">
                <input class="gift_app_pe-radio" 
                       type="radio" 
                       name="gift_item_${item.code}_${index}" 
                       id="gift_${gift.product_id}_${gift.variant_id}">
                <img src="${gift.product_image}" alt="${gift.product_title}">
              </div>
              <div class="gift_app_pe-info">
                <h4>${gift.product_title}</h4>
                <div class="gift_app_pe-variant">${gift.title}</div>
                <div class="gift_app_pe-price d-none">
                  <span class="gift_app_pe-price-sell">0đ</span>
                </div>
              </div>
            </div>
          `);
          $conditionBox.find('.gift_app_pe-condition-inner').append($giftItem);
        });

        $wrapper.append($conditionBox);
      });

      $container.append($wrapper);
      $('#gift-app-container').removeClass('d-none');
    });
  },
};
RF.BuyXSelectY = {
  variantFirstXy: '',
  listXY: {},
  promotions_applied: [],
  data_ilussion: null,
  init: function () {
    this.inputChange();
    this.checkInput();
    this.actionBuy();
    this.actionModal();
    this.renderNew.changeOption();
  },
  getBuyXSelectY: function (variantId, view) {
    var self = this;
    $.ajax({
      url: app.urlGetBuyXSelectY + variantId,
      success: function (response) {
        self.listXY = response;
        self.renderBuyXSelecty();
      },
    });
  },
  renderBuyXSelecty: function (view) {
    var self = this;
    if (self.listXY.success) {
      var idClassMain = '';
      var dataProduct = productDetail;
      if (self.listXY.data.total > 0) {
        var html = '';
        var idSearch = [];
        var isSearchMain = {};
        self.listXY.data.items.filter((items) => {
          isSearchMain[items._id] = [];

          var listCondition = '';
          if (items.list_condition_and_promotions.length > 0) {
            items.list_condition_and_promotions.map((condition, index) => {
              if (condition.list_promotion.length > 0) {
                var htmlList = '';
                condition.list_promotion.map((listPromotion, index2) => {
                  var htmlListItems = '';
                  var isChecked = '';
                  if (listPromotion.is_selected == true || (index == 0 && index2 == 0)) {
                    isChecked = 'checked';
                  }
                  htmlList += '<div class="wrapper-list-promotion" data-total-price="' + listPromotion.total_price + '" data-total-price-original="' + listPromotion.total_price_original + '">';
                  htmlList += '<div class="label-select">';
                  htmlList += '<input ' + isChecked + ' data-prev="' + listPromotion.is_selected + '" class="input-bxsy" type="checkbox" data-name="' + items.title + '" name="' + items.code + listPromotion._id + '" data-code="' + items.code + '" data-condition="' + condition.condition_value + '" value="' + listPromotion._id + '"/>';
                  htmlList += '</div>';

                  listPromotion.list_items.map((listItems, index) => {
                    var labelPromotion = '';
                    if (listPromotion.total_price == 0) {
                      var discount = 0;
                      labelPromotion += '<span>Tặng</span>';
                    } else {
                      /*var discount = listPromotion.total_price;
                      if(listPromotion.total_price_original != undefined){
                        discount = listPromotion.total_price_original - listPromotion.total_price;
                        labelPromotion += '<span>Giảm ' + Haravan.formatMoney(discount*100, formatMoney) + ' cho </span>';
                      }
                      else {
                        labelPromotion += '<span>Chỉ còn ' + Haravan.formatMoney(discount*100, formatMoney) + ' cho </span>';
                      }*/

                      labelPromotion += '<span>Chỉ còn ' + Haravan.formatMoney(listItems.price * 100, formatMoney) + ' cho </span>';
                    }

                    if (!idSearch.includes(listItems.product_id)) {
                      idSearch.push(listItems.product_id);
                    }

                    htmlListItems += '<div class="buyxgety_item" data-variant-id="' + listItems.variant_id + '" data-id="' + listItems.product_id + '" data-price="' + listItems.price * 100 + '">';
                    htmlListItems += '<div class="buyxgety_image">';
                    htmlListItems += '<a href="#" target="_blank">';
                    htmlListItems += '<img width="150" src="' + listItems.product_image + '" alt="item ' + index + '">';
                    htmlListItems += '</a>';
                    htmlListItems += '</div>';
                    htmlListItems += '<div class="buyxgety_item_title">';
                    htmlListItems += '<p class="bxy__tt1">';
                    //htmlListItems += labelPromotion + ' sản phẩm ';
                    htmlListItems += '<a href="#" target="_blank">';
                    htmlListItems += listItems.product_title;
                    htmlListItems += '.</a>';
                    htmlListItems += '</p>';
                    htmlListItems += '<div class="bxy__variant_title"></div>';
                    htmlListItems += '<div class="price-main">';
                    htmlListItems += '<span class="price-sell">' + Haravan.formatMoney(listItems.price * 100, formatMoney) + '</span>';
                    htmlListItems += '<del></del>';
                    htmlListItems += '<span class="label-sale d-none"></span>';
                    htmlListItems += '</div>';
                    htmlListItems += '</div>';
                    htmlListItems += '</div>';
                  });

                  if (htmlListItems != '') {
                    htmlList += '<div class="wrapper-listItems">' + htmlListItems + '</div>';
                  }
                  htmlList += '</div>';
                });

                var checkRender = true;
                var checkFirstRender = '';
                if (cartJS.items.length > 0) {
                  checkFirstRender = cartJS.items.filter((x) => x.variant_id == self.variantFirstXy || x.properties.hasOwnProperty('PE-bXsY-item-buy ' + items.code));
                  if (checkFirstRender.length > 0 && cartJS.attributes['PE-bXsY-detail ' + items.code] != undefined) {
                    var is_selected = Number(cartJS.attributes['PE-bXsY-detail ' + items.code].split('|')[0].split(':')[1]);
                    if (condition.condition_value <= is_selected) checkRender = false;
                  }
                }
                var isDisabled = '';
                if (condition.is_matched_condition == false || checkRender == false) {
                  isDisabled = 'disabled';
                }
                listCondition += '<div class="wrapper-condition ' + isDisabled + '" data-id="' + items._id + '" data-condition-value="' + condition.condition_value + '" data-max-selected-promotion="' + condition.max_selected_promotion + '">';
                if (items.condition_type == 'MIN_TOTAL_QUANTITY') {
                  listCondition += '<div class="condition-title">Mua <span>' + condition.condition_value + '</span> ' + dataProduct.title + ' để nhận ngay ưu đãi đi kèm (Tối đa ' + condition.max_selected_promotion + ')</div>';
                } else if (items.condition_type == 'MIN_TOTAL_PRICE') {
                  listCondition += '<div class="condition-title">Đơn hàng đủ <span>' + Haravan.formatMoney(condition.condition_value * 100, formatMoney) + '</span> có chứa ' + dataProduct.title + ' nhận ngay ưu đãi đi kèm (Tối đa ' + condition.max_selected_promotion + ')</div>';
                }
                listCondition += '<div class="wrapper-condition-inner">';
                listCondition += '<div class="buyxselecty-content--detail">';
                if (htmlList != '') {
                  listCondition += htmlList;
                }
                listCondition += '</div>';
                listCondition += '<div class="buyxselecty-content--total"><button class="button buy-xy-loop btnred" data-condition-value="' + condition.condition_value + '">Mua ngay</button></div>';
                listCondition += '</div>';
                listCondition += '</div>';
              }
            });
          }
          html += '<div class="list-buyxselecty" data-code="' + items.code + '" data-condition-type="' + items.condition_type + '" data-apply-for="' + items.apply_for + '">';
          html += '<div class="itemsHeadBuyXSelectY">' + items.title + '</div>';
          if (listCondition != '') {
            html += listCondition;
          }
          html += '</div>';
        });
        self.listXY.data.items.filter((items) => {
          if (items.list_item_buy.length > 0) {
            items.list_item_buy.filter((x) => {
              isSearchMain[items._id].push(x.product_id);
            });
          }
        });
        if (html != '') {
          $('.buyxgety_lists').html(html);
          // $('#buyxgety-program, .selector-buyxgety').removeClass('d-none');
          if (idSearch.length > 0) {
            var result = idSearch
              .map(function (id) {
                return '((id:product=' + id + '))';
              })
              .join('||');
            var query = result;
            var postQuery = {
              q: 'filter=' + query,
              type: 'product',
              include: 'metafields[product]',
              page: 1,
              limit: idSearch.length,
            };
            $.ajax({
              type: 'POST',
              url: '/search.js',
              data: postQuery,
              success: function (response) {
                //console.log(response);
                if (response.total > 0) {
                  response.products.map((item) => {
                    $('.buyxgety_item[data-id="' + item.id + '"] a').attr('href', item.url);
                    item.variants.map((variant) => {
                      if ($('.buyxgety_item[data-id="' + item.id + '"][data-variant-id="' + variant.id + '"]').length > 0) {
                        $('.buyxgety_item[data-id="' + item.id + '"][data-variant-id="' + variant.id + '"] .bxy__variant_title').html(variant.title);
                        var price = parseInt($('.buyxgety_item[data-id="' + item.id + '"][data-variant-id="' + variant.id + '"]').attr('data-price'));
                        var compare = variant.price;
                        if (compare > price) {
                          $('.buyxgety_item[data-id="' + item.id + '"][data-variant-id="' + variant.id + '"] .price-main del').html(Haravan.formatMoney(variant.price, formatMoney));
                          var mathDiscount = ((compare - price) / compare) * 100;
                          var result_sale = self.mathLabelSale(mathDiscount);
                          $('.buyxgety_item[data-id="' + item.id + '"][data-variant-id="' + variant.id + '"] .price-main .label-sale')
                            .html('-' + result_sale + '%')
                            .removeClass('d-none');
                        }
                      }
                    });
                  });
                }

                self.renderNew.data = response;
                self.renderNew.init();

                if ($('.list-buyxselecty').length != $('.list-buyxselecty.d-none').length) {
                  $('#buyxgety-program, .selector-buyxgety').removeClass('d-none');
                }
              },
              error: function () {},
            });
          }
        }
      }
    }
  },
  mathLabelSale: function (number) {
    var phanNguyen = Math.floor(number);
    var phanThapPhan = number - phanNguyen;
    if (phanThapPhan >= 0.5) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  },
  inputChange: function () {
    var self = this;
    $(document).on('change', '#buyxselecty-list input', function () {
      var $this = $(this);
      var parent = $this.parents('.wrapper-condition'),
        dataValue = parent.attr('data-condition-value'),
        dataMax = parseInt(parent.attr('data-max-selected-promotion')),
        currentChecked = parseInt(parent.find('input:checked').length);
      if (currentChecked > dataMax) {
        RF.Module.toastShow('Chương trình đang chọn chỉ được chọn ' + dataMax + ' quà tặng');
        $this.prop('checked', false);
      }
      self.checkInput();
    });
  },
  checkInput: function () {
    if ($('#buyxselecty-list input:checked').length > 0) {
      $('#add-to-cartQuickview').addClass('isBuyXSelectY');
    } else {
      $('#add-to-cartQuickview').removeClass('isBuyXSelectY');
    }
  },
  listApplyable: function (data, callback) {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      url: app.urlListApplyable,
      dataType: 'json',
      success: function (response) {
        return callback(response);
      },
    });
  },
  actionBuy: function () {
    var self = this;
    $(document).on('click', '#add-to-cartQuickview', function (e) {
      e.preventDefault();
      self.variantFirstXy = $('#product-select-quickview').val();
      var quantity = $('.quickview-qtyvalue').val();
      self.addBuyXSelectY(self.variantFirstXy, quantity);
    });
    $(document).on('click', '.buy-xy-loop', function (e) {
      e.preventDefault();
      self.variantFirstXy = $('#product-select').val();
      var quantity = $('.product-template .input-quantity').val();
      self.addBuyXSelectY(self.variantFirstXy, quantity);
    });
    $(document).on('click', '#confirmAddNew', function (e) {
      e.preventDefault();
      var variantId = self.variantFirstXy;
      var quantity = $('.quickview-qtyvalue').val();
      var input = $('#buyxselecty-list input.input-bxsy:checked');
      if (input.length == 0) {
        self.addProductX(variantId, quantity, function () {
          window.location = '/cart';
        });
      } else {
        var data = {};
        var code = input.parents('.list-buyxselecty').attr('data-code');
        var codition = input.parents('.wrapper-condition').attr('data-condition-value');
        data[code] = {};
        data[code].rank = codition;
        data[code].selected_promotions = [];
        $('#buyxselecty-list input.input-bxsy:checked').each(function () {
          var id = $(this).val();
          data[code].selected_promotions.push(id);
        });
        self.addProductX(variantId, quantity, function () {
          self.addProductY(data);
        });
      }
    });
    $(document).on('click', '.more-xy', function () {
      $('.buyxselecty-inner').addClass('more');
    });
    $(document).on('click', '.less-xy', function () {
      $('.buyxselecty-inner').removeClass('more');
    });
    $(document).on('change', '.input-bxsy', function () {
      var bxsy = $(this);
      var name = bxsy.attr('data-name');
      var main = bxsy.parents('.wrapper-condition');
      var subMain = bxsy.parents('.wrapper-list-promotion');

      var selectecCondition = main.attr('data-condition-value');
      var inputOther = bxsy.parents('.buyxgety_lists').find('.wrapper-condition:not([data-condition-value="' + selectecCondition + '"]) .input-bxsy');

      var limit = parseInt(main.attr('data-max-selected-promotion')) || 0;
      var aInputChecked = main.find('.input-bxsy:checked');
      if (aInputChecked.length > limit) {
        RF.Module.toastShow('Chương trình đang chọn chỉ được chọn ' + limit + ' quà tặng', 'info');
        bxsy.prop('checked', false);
      }

      if (aInputChecked.length > 0) inputOther.prop('checked', false);

      subMain.each(function (index2) {
        var subMainChecked = $(this).find('.input-bxsy:checked');
        if (subMainChecked.length > 0) $(this).addClass('active');
        else $(this).removeClass('active');
      });
    });
  },
  addBuyXSelectY: function (variantId, quantity) {
    var self = this;
    RF.Module.cartJS(function () {
      var checkVariantId = cartJS.items.filter((x) => x.variant_id == variantId);
      if ($('.input-bxsy:checked').length == 0) {
        self.addProductX(variantId, quantity, function () {
          window.location = '/cart';
        });
      } else {
        if (cartJS.item_count == 0 || checkVariantId.length == 0) {
          self.addProductX(variantId, quantity, function () {
            self.checkPromotionValidCart(variantId, quantity, function (data) {
              if (data == undefined) {
                window.location = '/cart';
              } else {
                self.addProductY(data);
              }
            });
          });
        } else {
          self.checkPromotionValidCart(variantId, quantity, function (data) {
            if (data == undefined) {
              self.addProductX(variantId, quantity, function () {
                window.location = '/cart';
              });
            } else {
              self.data_ilussion = data;
              self.addProductX(variantId, quantity, function () {
                self.addProductY(data);
              });
            }
          });
        }
      }
    });
  },
  checkPromotionValidCart: function (variant_id, qty, callback) {
    var self = this;
    qty = parseInt(qty);
    RF.Module.cartJS(function (cart) {
      self.promotions_applied = [];
      for (key in cartJS.attributes) {
        if (key.indexOf('PE-bXsY-detail ') > -1) {
          let data_promote = {
            code: key.replace('PE-bXsY-detail ', '').trim(),
            id: cartJS.attributes[key].split('|')[2].split(':')[1].trim(),
          };
          self.promotions_applied.push(data_promote);
        }
      }
      var checkExist = cart.items.filter((x) => x.variant_id == variant_id);
      var promotion_aplied = {};
      var isFirst = true;
      if (checkExist.length > 0) {
        for (key in checkExist[0].properties) {
          if (key.indexOf('PE-bXsY-item-buy') > -1) {
            isFirst = false;
            break;
          }
        }
        if (isFirst == false) {
          cart.item_count += qty;
        }
      }
      let total = 0;
      cart.items.map((x) => {
        x.price = x.price / 100;
        x.price_original = x.price_original / 100;
        if (isFirst == false && checkExist.length > 0 && x.variant_id == variant_id) {
          x.line_price = x.line_price / 100 + x.price * qty;
          x.line_price_orginal = x.line_price_orginal / 100 + x.price_original * qty;
          total += x.line_price;
          x.quantity += qty;
        } else {
          x.line_price = x.line_price / 100;
          x.line_price_orginal = x.line_price_orginal / 100;
          total += x.line_price;
        }
      });
      cart.total_price = cart.total_price / 100;
      if (checkExist.length > 0) {
        cart.total_price = total;
      }
      var data = { cart: cart };
      $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        url: app.urlListApplyable,
        dataType: 'json',
        success: function (response) {
          var promotion_will_be_changed = [];
          var promotion_will_change = [];
          var data = {};
          if (response.success) {
            if (response.data.items.length > 0) {
              var listPromotion = response.data.items;
              if (self.promotions_applied.length > 0) {
                self.promotions_applied.map((applied) => {
                  listPromotion.map((listPro) => {
                    if (listPro.code == applied.code) {
                      if (listPro.list_condition_and_promotions.length > 0) {
                        listPro.list_condition_and_promotions.map((listCondition) => {
                          if (listCondition.list_promotion.length > 0) {
                            listCondition.list_promotion.map((itemsList) => {
                              if ((itemsList._id == applied.id || applied.id.indexOf(itemsList._id) != -1) && listCondition.is_matched_condition == false) {
                                promotion_will_be_changed.push(itemsList._id);
                              } else if (listCondition.is_matched_condition == true) {
                                promotion_will_change.push(itemsList._id);
                              }
                            });
                          }
                        });
                      }
                    } else {
                      data[listPro.code] = {};
                      if (listPro.list_condition_and_promotions.length > 0) {
                        listPro.list_condition_and_promotions.map((listCondition) => {
                          if (listCondition.is_matched_condition) {
                            data[listPro.code].rank = listCondition.condition_value;
                            data[listPro.code].selected_promotions = [];
                            if (listCondition.is_matched_condition) {
                              if (listCondition.list_promotion.length > 0) {
                                listCondition.list_promotion.map((itemsList) => {
                                  if (itemsList.is_selected) {
                                    data[listPro.code].selected_promotions.push(itemsList._id);
                                  }
                                });
                              }
                            }
                          }
                        });
                      }
                    }
                  });
                });

                self.data_ilussion = data;
              }
              if (promotion_will_be_changed.length == 0) {
                listPromotion.map((promotes, indPromotes) => {
                  data[promotes.code] = {};
                  if (promotes.is_matched_condition) {
                    promotes.list_condition_and_promotions.map((promote, indPromote) => {
                      if (promote.is_matched_condition) {
                        data[promotes.code].rank = promote.condition_value;
                        data[promotes.code].selected_promotions = [];
                        promote.list_promotion.map((list, indList) => {
                          //debugger
                          //|| list.is_selected
                          if ($('input.input-bxsy[value="' + list._id + '"]').is(':checked')) {
                            data[promotes.code].selected_promotions.push(list._id);
                          }
                        });
                      }
                    });
                  }
                });
                console.log('data add ảo', data);
                if (typeof callback === 'function') return callback(data);
              } else {
                var cloneHtml = '';
                promotion_will_be_changed.filter((x) => {
                  var items = $('.input-bxsy[value="' + x + '"]')
                    .parents('.wrapper-list-promotion')
                    .clone();
                  cloneHtml += items[0].outerHTML;
                });
                if (cloneHtml != '') {
                  //ML.Module.fancyboxItemsXY(cloneHtml);
                }
              }
            } else {
              if (typeof callback === 'function') {
                return callback();
              }
            }
          } else {
          }
        },
        error: function (x) {
          console.log(x);
        },
      });
    });
  },
  addProductX: function (variantId, qty, callback) {
    var checkExistInCart = cartJS.items.filter((x) => x.variant_id == variantId);
    var properties = {};
    if (checkExistInCart.length > 0) {
      properties = checkExistInCart[0].properties;
    }
    var params = {
      quantity: qty,
      id: variantId,
      properties: properties,
    };
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: params,
      dataType: 'json',
      success: function (cart) {
        if (typeof callback === 'function') return callback();
      },
      error: function (XMLHttpRequest, textStatus) {
        Haravan.onError(XMLHttpRequest, textStatus);
        RF.Module.removeLoading();
      },
    });
  },
  addProductY: function (data) {
    $.ajax({
      url: '/cart/add.js',
      type: 'POST',
      data: {
        id: app.productKeyCombo,
        quantity: 1,
        properties: {
          'PE-bXsY-set': JSON.stringify(data),
        },
      },
      dataType: 'JSON',
      async: false,
      success: function (res) {
        window.location = '/cart';
      },
      error: function () {
        RF.Module.removeLoading();
      },
    });
  },
  actionModal: function () {
    $(document).on('click', '#cancelAddNew', function () {
      $.fancybox.close();
    });
    $('.promotion-customer').click(function () {
      $.fancybox.open($('#modalBuyXSlectY'), {});
    });
    $('#confirm-modal-buyxselecty').click(function (e) {
      e.preventDefault();
      var data = {};
      var inputBxSy = $('.wrapper-condition:not(.disabled) .input-bxsy[type="checkbox"]');
      if (inputBxSy.length > 0) {
        inputBxSy.each(function (index) {
          var input = $(this);
          var isChecked = input.prop('checked');
          var isCheckedPrev = input.attr('data-prev');
          var isDisabled = false;
          var code = input.attr('data-code');
          var condition = input.attr('data-condition');
          var id = input.val();
          if (data.hasOwnProperty(code)) {
            var aPromotion = data[code]['selected_promotions'];
            if (isChecked == true) aPromotion.push(id);
            if (isChecked == false && isCheckedPrev == 'true') {
              var index = aPromotion.indexOf(id);
              if (index > -1) aPromotion.splice(index, 1);
            }
          } else {
            data[code] = {};
            data[code]['rank'] = condition;
            data[code]['selected_promotions'] = [];
            if (isChecked == true) data[code]['selected_promotions'].push(id);
          }
        });
        var current_quantity = 1;
        var id = app.productKeyCombo;
        var properties = {};
        var code = {};
        var data_add = { id: id, quantity: current_quantity };
        properties['PE-bXsY-set'] = JSON.stringify(data);
        data_add['properties'] = properties;
        var params = {
          url: '/cart/add.js',
          type: 'POST',
          data: data_add,
          dataType: 'JSON',
          async: false,
          success: function (res) {
            location.reload();
          },
          error: function (x, y) {
            if (x.status == 200 && x.responseText == '') {
              location.reload();
            }
          },
        };
        $.ajax(params);
      } else {
        location.reload();
      }
    });
  },
  checkApplyableCart: function () {
    if (!$.isEmptyObject(cartJS)) {
      var self = this;
      let total = 0;
      var cart = cartJS;
      cart.items.map((x) => {
        x.price = x.price / 100;
        x.price_original = x.price_original / 100;
        x.line_price = x.line_price / 100;
        x.line_price_orginal = x.line_price_orginal / 100;
        total += x.line_price;
      });
      cart.total_price = cart.total_price / 100;
      var data = { cart: cart };
      self.listApplyable(data, function (response) {
        if (response.success) {
          if (response.data.total > 0) {
            var html = '';
            var idSearch = [];
            response.data.items.filter((items) => {
              var listCondition = '';
              console.log(items);
              if (items.list_condition_and_promotions.length > 0) {
                if (items.list_condition_and_promotions.length > 1) {
                  $('.buyxselecty-viewmore').removeClass('d-none');
                }
                items.list_condition_and_promotions.filter((condition) => {
                  if (condition.list_promotion.length > 0) {
                    if (condition.list_promotion.length > 1) {
                      $('.buyxselecty-viewmore').removeClass('d-none');
                    }
                    var htmlList = '';
                    condition.list_promotion.filter((listPromotion) => {
                      var htmlListItems = '';
                      htmlList += '<div class="wrapper-list-promotion" data-total-price="' + listPromotion.total_price + '" data-total-price-original="' + listPromotion.total_price_original + '">';
                      htmlList += '<div class="label-select"><input ' + (listPromotion.is_selected == true ? 'checked' : '') + ' data-prev="' + listPromotion.is_selected + '" class="input-bxsy" type="checkbox" name="' + items.code + listPromotion._id + '" data-code="' + items.code + '" data-condition="' + condition.condition_value + '" value="' + listPromotion._id + '"/></div>';
                      listPromotion.list_items.filter((listItems) => {
                        if (!idSearch.includes(listItems.product_id)) {
                          idSearch.push(listItems.product_id);
                        }
                        htmlListItems += '<div class="items-listItems" data-variant="' + listItems.variant_id + '" data-product-id="' + listItems.product_id + '" data-quantity="' + listItems.quantity + '" data-price="' + listItems.price + '">';
                        htmlListItems += '<label for="' + items.code + listPromotion._id + '">';
                        htmlListItems += '<a href="">';
                        htmlListItems += '<img src="" alt=""/>';
                        htmlListItems += '<div class="right-infoItems">';
                        if (listPromotion.total_price == 0) {
                          htmlListItems += '<b>Tặng</b>';
                        } else {
                          var discount = listPromotion.total_price_original - listPromotion.total_price;
                          htmlListItems += '<b>Giảm ' + Haravan.formatMoney(discount * 100, formatMoney) + ' cho </b>';
                        }
                        htmlListItems += '<span></span>';
                        htmlListItems += '</div>';
                        htmlListItems += '</a>';
                        htmlListItems += '</label>';
                        htmlListItems += '</div>';
                      });
                      if (htmlListItems != '') {
                        htmlList += '<div class="wrapper-listItems">' + htmlListItems + '</div>';
                      }
                      htmlList += '</div>';
                    });
                    var checkRender = true;
                    var checkFirstRender = '';
                    if (cartJS.items.length > 0) {
                      checkFirstRender = cartJS.items.filter((x) => x.variant_id == self.variantFirstXy || x.properties.hasOwnProperty('PE-bXsY-item-buy ' + items.code));
                      if (checkFirstRender.length > 0 && cartJS.attributes['PE-bXsY-detail ' + items.code] != undefined) {
                        var is_selected = Number(cartJS.attributes['PE-bXsY-detail ' + items.code].split('|')[0].split(':')[1]);
                        if (condition.condition_value <= is_selected) checkRender = false;
                      }
                    }
                    listCondition += '<div class="wrapper-condition ' + (condition.is_matched_condition == false || checkRender == false ? 'disabled' : '') + '" data-condition-value="' + condition.condition_value + '" data-max-selected-promotion="' + condition.max_selected_promotion + '">';
                    if (items.condition_type == 'MIN_TOTAL_QUANTITY') {
                      listCondition += '<div class="condition-title">Mua <span>' + condition.condition_value + '</span> sản phẩm, chọn quà tặng bên dưới (Tối đa ' + condition.max_selected_promotion + ')</div>';
                    } else if (items.condition_type == 'MIN_TOTAL_PRICE') {
                      listCondition += '<div class="condition-title">Mua từ <span>' + Haravan.formatMoney(condition.condition_value * 100, formatMoney) + '</span>, chọn quà tặng bên dưới (Tối đa ' + condition.max_selected_promotion + ')</div>';
                    }
                    if (htmlList != '') {
                      listCondition += htmlList;
                    }
                    listCondition += '</div>';
                  }
                });
              }
              html += '<div class="list-buyxselecty" data-code="' + items.code + '" data-condition-type="' + items.condition_type + '" data-apply-for="' + items.apply_for + '">';
              html += '<div class="itemsHeadBuyXSelectY">' + items.title + '</div>';
              if (listCondition != '') {
                html += listCondition;
              }
              html += '</div>';
            });
            if (html != '') {
              $('#buyxselecty-list').html(html);
              $('#buyxselecty').removeClass('d-none');
              $('.promotion-customer').removeClass('d-none');
              if (idSearch.length > 0) {
                var filter = '/search?q=filter=((id:product=' + idSearch.join(')||(id:product=') + '))';
                $.ajax({
                  url: filter + '&view=item-cart',
                  async: false,
                  success: function (response) {
                    response = JSON.parse(response);
                    if (!$.isEmptyObject(response)) {
                      $.each(response, function (i, v) {
                        $('.items-listItems[data-product-id="' + i + '"] a').attr('href', 'javascript:void(0);');
                        $('.items-listItems[data-product-id="' + i + '"] span').html(v.title);
                        $('.items-listItems[data-product-id="' + i + '"] img').attr('src', v.img);
                      });
                    }
                  },
                });
              }
            }
          }
        }
      });
    }
  },

  renderNew: {
    data: {},
    dataHtml: {},
    dataXY: {},
    init: function () {
      var that = this;
      that.dataXY = RF.BuyXSelectY.listXY;
      that.getData();
    },
    getData: function () {
      var self = this;
      const result = {};
      $('.list-buyxselecty').each(function () {
        const code = $(this).data('code');
        result[code] = {};
        $(this)
          .find('.wrapper-condition')
          .each(function () {
            const wrapperId = $(this).data('id');
            const conditionValue = $(this).data('condition-value');
            const conditionKey = `${wrapperId}_${conditionValue}`;
            if (!result[code][conditionKey]) {
              result[code][conditionKey] = {};
            }
            $(this)
              .find('.buyxgety_item')
              .each(function () {
                const itemId = $(this).data('id');
                const variantId = $(this).data('variant-id');
                if (!result[code][conditionKey][itemId]) {
                  result[code][conditionKey][itemId] = [];
                }
                result[code][conditionKey][itemId].push(variantId);
              });
          });
      });
      self.dataHtml = result;
      self.reRender();
    },
    reRender: function () {
      var self = this;
      var $list = self.data;
      var $main = self.dataHtml;
      var $dataXY = self.dataXY.data.items;
      //console.log($list);
      //console.log($main);
      //console.log($dataXY);
      $.each($main, function (code, conditions) {
        $.each(conditions, function (all_condition, product) {
          var html = '';
          $.each(product, function (id, variants) {
            var temp = $list.products.filter((item) => item.id == id);
            var product_data = temp.length > 0 ? temp[0] : [];
            if (temp.length > 0) {
              html += '<div class="item-xy-new" data-code="' + code + '" data-id="' + id + '">';
              html += '<div class="box-img">';
              html += '<input class="new_input_xy" type="radio" name="' + code + '" id="' + code + '_' + id + '" />';
              html += '<img src="' + product_data.featured_image + '" alt="' + product_data.title + '" />';
              html += '</div>';
              html += '<div class="box-info">';
              html += '<h4>' + product_data.title + '</h4>';
              html += '<select class="change-option">';
              var price_sell = 0,
                price_original = 0;
              variants.forEach((variant, index) => {
                const find_code = $dataXY.find((item) => item.code === code);
                var true_code = {};
                var found = false;
                var data_found = {};
                var find_condition = '';
                if (find_code) {
                  find_code.list_condition_and_promotions.forEach((condition) => {
                    var temp_get_condition = parseInt(all_condition.split('_')[1]);
                    if (temp_get_condition == condition.condition_value) {
                      find_condition = condition.condition_value;
                    }
                    condition.list_promotion.forEach((promo) => {
                      const foundItem = promo.list_items.find((item) => item.variant_id === variant);
                      if (foundItem) {
                        data_found = foundItem;
                        true_code = promo;
                        found = true;
                      }
                    });
                  });
                }
                if (found) {
                  var temp_variant = product_data.variants.filter((find) => find.id == variant);
                  var getVariant = temp_variant[0];
                  var item_promotion = data_found;

                  price_sell = item_promotion.price;
                  price_original = getVariant.price;

                  var isChecked = '';
                  if (true_code.is_selected == true || index == 0) {
                    isChecked = 'selected';
                  }

                  html += '<option ' + isChecked + '';
                  html += '  data-price="' + item_promotion.price + '" ';
                  html += '  data-price-admin="' + getVariant.price + '" ';
                  html += '  data-name="' + code + true_code._id + '" ';
                  html += '  data-id="' + variant + '" ';
                  html += '  data-code="' + code + '" ';
                  html += '  data-condition="' + find_condition + '" ';
                  html += '  value="' + true_code._id + '">' + getVariant.title + '</option>';
                }
              });
              html += '</select>';
              html += '<div class="price-new">';
              html += '<div class="price-sell">' + Haravan.formatMoney(price_sell * 100, shop.moneyFormat) + '</div>';
              html += '<div class="price-original">' + Haravan.formatMoney(price_original, shop.moneyFormat) + '</div>';
              html += '</div>';
              html += '</div>';
              html += '</div>';
            }
          });
          if (html != '') {
            var wrap_html = '<div class="wrap-new-item">' + html + '</div>';
            var temp_condition = all_condition.split('_');
            var id_condition = temp_condition[0];
            var value_condition = temp_condition[1];
            $('.list-buyxselecty[data-code="' + code + '"] .wrapper-condition[data-id="' + id_condition + '"][data-condition-value="' + value_condition + '"] .wrapper-condition-inner').prepend(wrap_html);
            $('.list-buyxselecty[data-code="' + code + '"] .wrapper-condition[data-id="' + id_condition + '"][data-condition-value="' + value_condition + '"] .wrapper-condition-inner .buyxselecty-content--detail').addClass('d-none');
          } else {
            $('.list-buyxselecty[data-code="' + code + '"]').addClass('d-none');
          }
        });
      });
      self.eachChecked();
      self.processbar();
    },
    eachChecked: function () {
      $('.list-buyxselecty').each(function () {
        var $this = $(this);
        $this.find('.wrapper-condition').each(function () {
          var $this2 = $(this);
          $this2.find('.wrapper-list-promotion').each(function () {
            var $this3 = $(this);
            var $input = $this3.find('.input-bxsy:checked');
            if ($input.length > 0) {
              var $name = $input.attr('name');
              var $code = $input.attr('data-code');
              var $condition = $input.attr('data-condition');
              var $value = $input.val();
              var $option = $('.list-buyxselecty[data-code="' + $code + '"] .wrapper-condition[data-condition-value="' + $condition + '"] .wrap-new-item .change-option option[data-name="' + $name + '"]');
              if ($option.length > 0) {
                $option.parents('.item-xy-new').find('.new_input_xy').prop('checked', true);
              }
            }
          });
        });
      });
    },
    changeOption: function () {
      $(document).on('change', '.new_input_xy', function (e) {
        var $this = $(this);
        var $parent = $this.parents('.item-xy-new');
        var $name = $parent.find('.change-option option:selected').attr('data-name');
        var $code = $parent.find('.change-option option:selected').attr('data-code');
        var $condition = $parent.find('.change-option option:selected').attr('data-condition');
        var $value = $parent.find('.change-option').val();
        $('.input-bxsy[name="' + $name + '"][data-code="' + $code + '"][data-condition="' + $condition + '"][value="' + $value + '"]')
          .prop('checked', true)
          .change();
      });
      $(document).on('change', '.change-option', function (e) {
        var $this = $(this);
        var $parent = $this.parents('.item-xy-new');
        var price_sell = $this.find('option:selected').attr('data-price');
        var price_original = $this.find('option:selected').attr('data-price-admin');
        var for_price_sell = Haravan.formatMoney(price_sell * 100, shop.moneyFormat);
        var for_price_original = Haravan.formatMoney(price_original, shop.moneyFormat);
        $parent.find('.price-sell').html(for_price_sell);
        $parent.find('.price-original').html(for_price_original);
        var $name = $this.find('option:selected').attr('data-name');
        var $code = $this.find('option:selected').attr('data-code');
        var $condition = $this.find('option:selected').attr('data-condition');
        var $value = $this.val();
        $('.input-bxsy[name!="' + $name + '"][data-code="' + $code + '"][data-condition="' + $condition + '"][value!="' + $value + '"]').prop('checked', false);
        $('.input-bxsy[name="' + $name + '"][data-code="' + $code + '"][data-condition="' + $condition + '"][value="' + $value + '"]')
          .prop('checked', true)
          .change();
        $parent.find('.new_input_xy').prop('checked', true);
      });
    },
    processbar: function () {
      var $idProd = productDetail.id;
      var currentPrice = cartJS.items.filter((item) => item.product_id == $idProd).reduce((total, item) => total + item.price * item.quantity, 0) / 100;
      var maxCondition = 0;
      var conditionList = [];
      $('.list-buyxselecty .wrapper-condition').each(function () {
        var $this = $(this);
        var value = parseInt($this.attr('data-condition-value'));
        var tooltip = $this.find('.item-xy-new h4').html() || 'Click để xem chi tiết';
        maxCondition = Math.max(maxCondition, value);
        conditionList.push({ value, tooltip });
      });
      conditionList.forEach(({ value, tooltip }) => {
        var percent = (value / maxCondition) * 100;
        var marker = $(`
          <div class="progress-marker" style="left:${percent}%">
            <span class="tooltip">${tooltip}</span>
            ${Haravan.formatMoney(value * 100, shop.moneyFormat)}
          </div>
        `);
        $('.progress-track').append(marker);
      });
      var progressPercent = (currentPrice / maxCondition) * 100;
      $('.progress-fill').css('width', `${Math.min(progressPercent, 100)}%`);

      conditionList.sort((a, b) => a.value - b.value);
      var nearest = conditionList.find((c) => currentPrice < c.value);
      if (nearest) {
        var missing = nearest.value - currentPrice;
        $('.promo-message .remaining-amount').html(Haravan.formatMoney(missing * 100, shop.moneyFormat));
        $('.promo-message strong').text(`"${nearest.tooltip}!"`);
      } else {
        $('.promo-message').html(`<strong>🎉 Bạn đã đủ điều kiện nhận khuyến mãi!</strong>`);
      }

      //$('.promo-zone').removeClass('d-none');
    },
  },
};
RF.Combo = {
  uniques: function (arr) {
    var a = [];
    for (var i = 0, l = arr.length; i < l; i++) if (a.indexOf(arr[i]) === -1 && arr[i] !== '') a.push(arr[i]);
    return a;
  },
  variantFirst: '',
  currentId: '',
  listCombo: {},
  listItemCombo: [],
  init: function () {
    this.actionBuy();
    RF.Combo.getCombo(productDetail.id, $('#product-select').val(), function (response) {
      console.log(response);
    });
  },
  getCombo: function (idProduct, variantId, callback) {
    var self = this;
    self.listCombo = {};
    self.listItemCombo = [];
    $.ajax({
      url: app.urlGetCombo + idProduct,
      success: function (response) {
        self.listCombo = response;
        self.currentId = idProduct;
        self.variantFirst = variantId;
        self.renderCombo();
        if (callback && typeof callback === 'function') return callback();
      },
    });
  },
  renderCombo: function (view) {
    var self = this,
      listId = [],
      listIdSearch = [];
    if (self.listCombo.total > 0) {
      self.listCombo.items.filter((x) => {
        var temp = [];
        var temp2 = {};
        x.items.filter((y) => {
          temp.push(y.product_id);
          temp2[y.product_id] = y;
          temp2.code = x.code;
          temp2.title = x.title;
          listIdSearch.push(y.product_id);
        });
        listId.push(temp);
        self.listItemCombo.push(temp2);
      });
      listIdSearch = self.uniques(listIdSearch);
      var q = '((id:product=' + listIdSearch.join(')||(id:product=') + '))';
      q = encodeURIComponent(q);
      var filter = '/search.js?q=filter=' + q + '&include=metafields[product,hrvmultilang_en]&page=1&limit=' + listIdSearch.length;
      $.ajax({
        url: filter,
        async: false,
        success: function (response) {
          if (response.hasOwnProperty('products')) {
            var itemsCombo = '';
            var index = 0;
            var htmlDetailShow = false;
            listId.filter((listId) => {
              var allAvailable = true;
              index++;
              listId.filter((y) => {
                response.products.map((item) => {
                  if (item.id == y && !item.available) {
                    allAvailable = false;
                    return false;
                  }
                });
              });
              if (allAvailable) {
                var htmlImg = self.renderImage(response, listId);
                var htmlTitleCb = self.renderTitle(response, index - 1, listId);
                var detail = self.renderItem(response, index - 1, listId);
                var htmlDetail = detail.htmlDetail;
                var classHide = '';
                if (detail.idFirst != self.variantFirst) {
                  classHide = ' d-none';
                } else {
                  htmlDetailShow = true;
                }
                itemsCombo += '<div class="item-list-combo fw-variant-' + detail.idFirst + classHide + '">';
                itemsCombo += htmlImg;
                itemsCombo += htmlTitleCb;
                itemsCombo += htmlDetail;
                itemsCombo += '</div>';
              }
            });
            if (itemsCombo != '' && htmlDetailShow) {
              $('.pe-combo .list-combo').html(itemsCombo);
              $('.pe-combo').removeClass('d-none');
            } else {
              $('.pe-combo').addClass('d-none');
            }
          }
        },
      });
    }
  },
  renderItem: function (result, iCombo, nCombo) {
    var self = this;

    var nameCombo = self.listItemCombo[iCombo].title;
    var codeCombo = self.listItemCombo[iCombo].code;
    var detail = { idFirst: null };
    var mainDetail = '';
    var htmlDetail = '';
    var htmlItemPro = '';
    var htmlItemGift = '';

    var totalPriceCombo = 0;
    var totalPriceComboOriginal = 0;
    $.each(nCombo, function (i, v) {
      var getProduct = result.products.filter((item) => item.id == v);
      var product = getProduct[0];
      var htmlItem = '';
      var dtPrice = self.listItemCombo[iCombo][v].price;
      var dtComparePrice = self.listItemCombo[iCombo][v].price_original;
      var dtQty = self.listItemCombo[iCombo][v].quantity;
      var dtVrId = self.listItemCombo[iCombo][v].variant_id;
      var dtVrTt = self.listItemCombo[iCombo][v].variant_title;
      var dtVendor = product.vendor;
      var dtVariantTitle = product.length > 0 ? product.variant_title : '';
      totalPriceCombo += dtPrice * dtQty;
      totalPriceComboOriginal += dtComparePrice * dtQty;
      if (v == self.currentId) {
        detail.idFirst = dtVrId;
      }
      product.price = product.price / 100;
      if (v != self.currentId) {
        htmlItem += '<div class="item-prod-combo">';
        htmlItem += '<div class="media-combo">';
        if (product.price > dtPrice) {
          var pro_sold = dtPrice;
          var pro_comp = (product.price * dtQty) / 100;
          var sale = 100 - pro_sold / pro_comp;
          var kq_sale = Math.round(sale);
          htmlItem += '<div class="label-loop">';
          htmlItem += '<div class="product-sale"><span>-' + kq_sale + '%</span></div>';
          htmlItem += '</div>';
        }
        htmlItem += '<img src="' + (product.featured_image == '' ? 'https://theme.hstatic.net/200000351935/1000850995/14/no_image.jpg' : product.featured_image) + '" alt="' + product.title + '" />';
        htmlItem += '</div>';
        htmlItem += '<div class="info-combo">';
        htmlItem += '<div class="title-loop">';
        htmlItem += '<h4>';
        htmlItem += dtQty + ' x ' + product.title;
        htmlItem += '</h4>';
        htmlItem += '</div>';
        htmlItem += '<div class="variant-loop">' + dtVariantTitle + '</div>';
        htmlItem += '<div class="price-loop">';
        htmlItem += '<span>' + Haravan.formatMoney(dtPrice * dtQty * 100, formatMoney) + '</span>';
        htmlItem += product.price > dtPrice ? '<del>' + Haravan.formatMoney(product.price * dtQty * 100, formatMoney) + '</del>' : '';
        htmlItem += '</div>';
        htmlItem += '</div>';
        htmlItem += '</div>';

        if (product.price > dtPrice) {
          htmlItemGift += htmlItem;
        } else {
          htmlItemPro += htmlItem;
        }
      }
    });

    htmlDetail += '<div class="combo-wrapper--detail">';
    htmlDetail += '<div class="combo-content--detail">';
    if (htmlItemPro != '') {
      htmlDetail += '<div class="main-prod">';
      htmlDetail += htmlItemPro;
      htmlDetail += '</div>';
      htmlDetail += '<div class="icon-plus-combo"><img src="https://file.hstatic.net/200000532849/file/plus_aa7d7af105bb4371ad3d6a5aed821b1b.svg" alt="plus" /></div>';
    }
    htmlDetail += '<div class="main-item-gift">';
    htmlDetail += htmlItemGift;
    htmlDetail += '</div>';
    htmlDetail += '</div>';
    htmlDetail += '<div class="combo-content--total">';
    htmlDetail += '<div class="title-combo-total">Tổng tiền:</div>';
    htmlDetail += '<div class="combo-wrap-price">';
    htmlDetail += '<div class="combo-total-price">' + Haravan.formatMoney(totalPriceCombo * 100, formatMoney) + '</div>';
    htmlDetail += '<del class="combo-total-price-original">' + Haravan.formatMoney(totalPriceComboOriginal * 100, formatMoney) + '</del>';
    htmlDetail += '<div class="combo-total-price-save">Tiết kiệm ' + Haravan.formatMoney((totalPriceComboOriginal - totalPriceCombo) * 100, formatMoney) + '</div>';
    htmlDetail += '</div>';
    htmlDetail += '<button type="button" class="button dark btnred add-combo-quickview" data-codeCb="' + codeCombo + '" data-nameCb="' + nameCombo + '">Mua combo</button>';
    htmlDetail += '</div>';
    htmlDetail += '</div>';
    detail.htmlDetail = htmlDetail;
    return detail;
  },
  renderTitle: function (result, iCombo, nCombo) {
    var self = this;
    var nameCombo = self.listItemCombo[iCombo].title;
    var htmlTitleCb = '<div class="combo-content--title"><h4>Bộ Combo: ' + nameCombo + '</h4></div>';
    return htmlTitleCb;
  },
  renderImage: function (result, aIdComboNew) {
    var htmlImg = '';
    var numIdCombo = aIdComboNew.length - 1;
    htmlImg += '<div class="combo-content--images d-none1">';
    $.each(aIdComboNew, function (i, v) {
      var items = result.products.filter((item) => item.id == v);
      if (items.length > 0) {
        var product = items[0];
        htmlImg += '<div class="media-combo-image">';
        htmlImg += '<a href="' + product.url + '" title="' + product.title + '" class="image ">';
        htmlImg += '<img src="' + (product.featured_image == '' ? 'https://theme.hstatic.net/200000351935/1000850995/14/no_image.jpg' : product.featured_image) + '" alt="' + product.title + '">';
        htmlImg += '</a>';
        htmlImg += '</div>';
        if (i < numIdCombo) {
          htmlImg += '<div class="plus">+</div>';
        }
      }
    });
    htmlImg += '</div>';
    return htmlImg;
  },
  checkGiftCombo: function (variantFirst, view) {
    if ($('.item-list-combo.fw-variant-' + variantFirst).length > 0) {
      $('#select-combo').removeClass('d-none');
      if ($('.item-list-combo.fw-variant-' + variantFirst + ' input:checked').length == 0) {
        $('.item-list-combo.fw-variant-' + variantFirst + ':eq(0) input').click();
      }
      $('.item-list-combo.fw-variant-' + variantFirst).removeClass('d-none');
    } else {
      $('#select-combo').addClass('d-none');
    }
  },
  actionBuy: function () {
    $(document).on('click', '.add-combo-quickview', function (e) {
      e.preventDefault();
      var addCodeCombo = $(this).attr('data-codecb');
      var addNameCombo = $(this).attr('data-namecb');
      var properties = {};
      var data_add = { id: app.productKeyCombo, quantity: 1 };
      $.get('/cart.js').done(function (cart) {
        var param = {};
        param[addCodeCombo] = 1;
        if (cart.attributes) {
          $.each(cart.attributes, function (i, v) {
            if (i == 'PE-combo-detail ' + addCodeCombo) {
              param[addCodeCombo] = parseInt(param[addCodeCombo]) + parseInt(v);
            }
          });
        }
        properties['PE-combo-set'] = JSON.stringify(param);
        if (!$.isEmptyObject(properties)) {
          data_add['properties'] = properties;
        }
        var params = {
          type: 'POST',
          url: '/cart/add.js',
          /*async: true,*/
          data: data_add,
          dataType: 'json',
          success: function (line_item) {
            window.location = '/cart';
          },
          error: function (XMLHttpRequest, textStatus) {
            console.log(XMLHttpRequest);
          },
        };
        $.ajax(params);
      });
    });
    $(document).on('click', '.more-combo', function () {
      $('#select-combo').addClass('more');
    });
    $(document).on('click', '.less-combo', function () {
      $('#select-combo').removeClass('more');
    });
  },
  slickCombo: function () {
    var slickcombo = $('.combo-content--detail-right-slick');
    if (!slickcombo.hasClass('slick-initialized')) {
      slickcombo.slick({
        dots: false,
        infinite: false,
        speed: 800,
        slidesToShow: 3,
        slidesToScroll: 3,
        nextArrow: iconNext,
        prevArrow: iconPrev,
        responsive: [
          {
            breakpoint: 1199,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
            },
          },
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
            },
          },
        ],
      });
    }
  },
  slickMain: function (x) {
    var slickcombo = $('.combo-content--detail-left');
    if (!slickcombo.hasClass('slick-initialized')) {
      slickcombo.slick({
        dots: false,
        infinite: false,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: iconNext,
        prevArrow: iconPrev,
        responsive: [
          {
            breakpoint: 1199,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              infinite: true,
              autoplay: true,
              autoplaySpeed: 3000,
              dots: true,
            },
          },
        ],
      });
    }
  },
};

let recaptchaWidgetId = null;
RF.FormBuyer = {
  isSendAgain: false,
  init: function () {
    var that = this;

    window.On_PhoneAuthRecaptchaCallback = function (token) {
      if (!token) return false;
      that.handleSendOtp(token);
      return;
    };

    var a = document.createElement('script');
    a.type = 'text/javascript';
    var s = document.getElementsByTagName('script')[0];
    a.src = '/phone_auth/lib.js';
    s.parentNode.insertBefore(a, s);

    this.open();
    this.bindToggleForm();
    this.bindLogin();
    this.bindRegister();
    this.bindForgot();
    this.bindOtp();
    this.bindResend();
  },
  open: function () {
    var self = this;
    $('.open-modal').click(function () {
      var type = $(this).attr('data-type');
      if (type == 'register') {
        self.showForm('#register-form');
      } else {
        self.showForm('#login-form');
      }
      $.fancybox.open($('#account-buyer-form'), {
        touch: false,
      });
    });
  },
  sendOtp: function () {
    $('#phone-auth-submit').trigger('click');
  },
  handleSendOtp: function (token) {
    const self = this;
    const $form = $('#phone_auth_recaptcha');
    const phone = $form.find('[name="phone_number"]').val();
    // debugger
    if (!self.isValidPhone(phone)) {
      return alert('Số điện thoại không hợp lệ');
    }
    $.ajax({
      type: 'POST',
      url: '/phone_auth/send_verify_code',
      data: $form.serialize(),
      dataType: 'json',
      success: function (res) {
        if (res.is_error) {
          return alert(res.message);
        }

        // lưu session
        $('[name="session_info"]').val(res.token);

        // disable resend
        $('#send_again').addClass('disable');
        self.isSendAgain = false;

        // start countdown
        self.startCountdown();

        console.log('OTP sent');
      },
      error: function () {
        alert('Không thể gửi OTP');
      },
    });
  },
  duration: 60,
  timer: null,
  startCountdown: function () {
    var self = this;
    var timeLeft = self.duration;

    var $display = document.querySelector('.count-down-content');
    var $resend = document.getElementById('send_again');

    // reset UI
    $resend.classList.add('disabled');
    $resend.style.pointerEvents = 'none';

    function formatTime(seconds) {
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // render lần đầu
    $display.textContent = formatTime(timeLeft);

    self.timer = setInterval(function () {
      timeLeft--;

      $display.textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(self.timer);
        $display.textContent = '00:00';

        // enable gửi lại
        $resend.classList.remove('disabled');
        $resend.style.pointerEvents = 'auto';
      }
    }, 1000);
  },
  bindRegister: function () {
    const self = this;
    $('#register-form').on('submit', function (e) {
      e.preventDefault();
      const $form = $(this);
      self.clearError($form);
      const phone = $form.find('[name="customer[phone]"]').val();
      let isValid = true;
      if (!phone) {
        self.showError($form.find('[name="customer[phone]"]'), 'Nhập SĐT');
        isValid = false;
      } else if (!self.isValidPhone(phone)) {
        self.showError($form.find('[name="customer[phone]"]'), 'SĐT không hợp lệ');
        isValid = false;
      }
      if (!isValid) return;
      $('#phone_auth_recaptcha [name="phone_number"]').val(phone);
      $('#phone-auth-submit').trigger('click');
      self.showForm('#register_page_otp_form');
    });
  },
  showForm: function (target) {
    $('.auth-form').removeClass('active');
    $(target).addClass('active');
  },
  showError: function ($input, message) {
    $input.closest('.form-group').find('.text-error').text(message);
  },
  clearError: function ($form) {
    $form.find('.text-error').text('');
    $form.find('.error-status').addClass('d-none').text('');
  },
  isValidPhone: function (phone) {
    phone = phone.trim();
    if (phone.startsWith('+84')) phone = phone.replace('+84', '0');
    if (phone.startsWith('84')) phone = phone.replace('84', '0');
    return /(03|05|07|08|09)+([0-9]{8})\b/.test(phone);
  },
  bindToggleForm: function () {
    const self = this;
    $('.show-register').on('click', function () {
      self.showForm('#register-form');
    });
    $('.show-login').on('click', function () {
      self.showForm('#login-form');
    });
    $('.show-forgot').on('click', function () {
      self.showForm('#forgot-form');
    });
  },
  bindLogin: function () {
    const self = this;
    $('#login-form').on('submit', function (e) {
      e.preventDefault();
      const $form = $(this);
      self.clearError($form);
      const phone = $form.find('[name="customer[email]"]').val();
      const password = $form.find('[name="customer[password]"]').val();
      let isValid = true;
      if (!phone) {
        self.showError($form.find('[name="customer[email]"]'), 'Không được bỏ trống');
        isValid = false;
      } else if (!self.isValidPhone(phone)) {
        self.showError($form.find('[name="customer[email]"]'), 'SĐT không hợp lệ');
        isValid = false;
      }
      if (!password) {
        self.showError($form.find('[name="customer[password]"]'), 'Nhập mật khẩu');
        isValid = false;
      }
      if (!isValid) return;
      RF.Module.openLoading(function () {
        grecaptcha.ready(function () {
          grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
            var verification = $form.find('input[name="__RequestVerificationToken"]').val();
            var payload = {
              customer: {
                email: phone,
                password: password,
              },
              __RequestVerificationToken: verification,
              'g-recaptcha-response': token,
            };
            $.ajax({
              type: 'POST',
              url: '/account/login',
              data: payload,
              form_type: 'customer_login',
              utf8: '✓',
              success: function (data) {
                var parsedResponse = $.parseHTML(data);
                var result = $(parsedResponse);
                if (result.find('#customer_login .errors').length > 0) {
                  var titleError = result.find('#customer_login .errors li').html();
                  if (titleError.indexOf('Thông tin đăng nhập không hợp lệ') != -1) {
                    $form.find('.error-status').html('Thông tin đăng nhập không hợp lệ').removeClass('d-none');
                  }
                  if (titleError.indexOf('quá hạn') != -1) {
                    $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                  }
                  if (titleError.indexOf('Không tìm thấy tài khoản nào với email này') != -1) {
                    $form.find('.error-status').html('Không tìm thấy tài khoản nào với email này').removeClass('d-none');
                  }
                  RF.Module.removeLoading();
                } else {
                  window.location = '/account';
                }
              },
              error: function (x, y) {
                RF.Module.removeLoading();
                RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
              },
            });
          });
        });
      });
    });
  },
  bindForgot: function () {
    const self = this;
    $('#forgot-form').on('submit', function (e) {
      e.preventDefault();
      const $form = $(this);
      self.clearError($form);
      const phone = $form.find('[name="phone"]').val();
      if (!phone || !self.isValidPhone(phone)) {
        self.showError($form.find('[name="phone"]'), 'SĐT không hợp lệ');
        return;
      }
      $('#phone_auth_recaptcha [name="phone_number"]').val(phone);
      $('#phone-auth-submit').trigger('click');
      self.showForm('#register_page_otp_form');
    });
  },
  bindOtp: function () {
    const self = this;
    $('#register_page_otp_form').on('submit', function (e) {
      e.preventDefault();
      var $form = $(this);
      const otp = self.getOtp();
      if (!/^[0-9]{6}$/.test(otp)) {
        RF.Module.toastShow('OTP không hợp lệ');
        return;
      }
      $form.find('input[name="otp_code"]').val(otp);
      $.ajax({
        url: '/phone_auth/validate',
        type: 'POST',
        data: $form.serialize(),
        success: function (data) {
          // debugger
          var urlPass = data.split('<meta property="og:url" content="')[1].split('" />')[0];
          if (urlPass.indexOf('account/reset') > -1) {
            // localStorage.setItem('user_info', JSON.stringify(user_register_info));
            window.location = urlPass;
          } else {
            RF.Module.toastShow('Có lỗi xảy ra. Xin nhấn gửi lại.');
          }
        },
      });
    });
    $('#register_page_otp_form input').on('input', function () {
      if (this.value.length === 1) {
        $(this).parent().next().find('input').focus();
      }
    });
  },
  getOtp: function () {
    return $('#register_page_otp_form .input-wrap input')
      .map((i, el) => $(el).val())
      .get()
      .join('');
  },
  bindResend: function () {
    const self = this;
    $('#send_again').on('click', function (e) {
      e.preventDefault();
      if (self.isSendAgain) {
        $('#phone-auth-submit').trigger('click');
      }
    });
  },
};

RF.ModalFormBuyer = {
  init: function () {
    var that = this;
    that.action();
    that.open();
    that.login();
    that.register();
    that.handleInput();
    that.forgot();
  },
  handleInput: function () {
    $('#account-buyer-form input').change(function () {
      $(this).parent().removeClass('error').find('.text-error').html('');
    });
  },
  register: function () {
    var self = this;
    $('#account-buyer-form #register-form').submit(function (e) {
      e.preventDefault();
      var $this = $(this),
        $form = $('#register-form'),
        $lastName = $form.find('input[name="customer[last_name]"]').val(),
        $firstName = $form.find('input[name="customer[first_name]"]').val(),
        $email = $form.find('input[name="customer[email]"]').val(),
        $phone = $form.find('input[name="customer[phone]"]').val(),
        $password = $form.find('input[name="customer[password]"]').val();

      $form.find('.error-status').addClass('d-none');
      $form.find('.success-status').addClass('d-none');
      $form.find('.form-group').removeClass('error');
      $form.find('.text-error').html('');

      if ($lastName == '') {
        $form.find('input[name="customer[last_name]"]').parent().addClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('Họ không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[last_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('');
      }

      if ($firstName == '') {
        $form.find('input[name="customer[first_name]"]').parent().addClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('Tên không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[first_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('');
      }

      if ($email == '') {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!RF.FormAccount.validateEmail($email)) {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[email]"]').parent().removeClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('');
      }

      if ($phone == '') {
        $form.find('input[name="customer[phone]"]').parent().addClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không được để trống');
        return;
      } else if (!RF.Module.isVietnamesePhoneNumber($phone)) {
        $form.find('input[name="customer[phone]"]').parent().addClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[phone]"]').parent().removeClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('');
      }

      if ($password == '') {
        $form.find('input[name="customer[password]"]').parent().addClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu không được để trống');
        return;
      } else if ($password != '') {
        if ($password.length < 8) {
          $form.find('input[name="customer[password]"]').parent().addClass('error');
          $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu phải dài 10-16 ký tự');
          return;
        } else {
          var validatePasssword = RF.FormAccount.checkPasswordValidation($password);
          if (validatePasssword != null) {
            $form.find('input[name="customer[password]"]').parent().addClass('error');
            $form.find('input[name="customer[password]"]').parent().find('.text-error').html(validatePasssword);
            return;
          }
        }
      } else {
        $form.find('input[name="customer[password]"]').parent().removeClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('');
      }

      $('.loading-ovl').addClass('open');

      grecaptcha.ready(function () {
        grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
          $.ajax({
            type: 'POST',
            url: '/account',
            data: {
              customer: {
                last_name: $lastName,
                first_name: $firstName,
                email: $email,
                phone: $phone,
                password: $password,
              },
              __RequestVerificationToken: shop.keyFormOmniRegister,
              'g-recaptcha-response': token,
            },
            form_type: 'create_customer',
            utf8: '✓',
            success: function (data) {
              var parsedResponse = $.parseHTML(data);
              var result = $(parsedResponse);
              if (result.find('#create_customer .errors').length > 0) {
                var titleError = result.find('#create_customer .errors li').html();
                if (titleError.indexOf('quá hạn') != -1) {
                  $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                }
                if (titleError.indexOf('Email đã tồn tại') != -1) {
                  $form.find('.error-status').html('Email đã tồn tại').removeClass('d-none');
                }
                if (titleError.indexOf('Lỗi hệ thống') != -1) {
                  $form.find('.error-status').html('Lỗi hệ thống').removeClass('d-none');
                }
                if (titleError.indexOf('xin vui lòng vào liên kết') != -1) {
                  sessionStorage.setItem('isRegister', true);
                  $form
                    .find('.success-status')
                    .html('Chúng tôi đã gửi email đến ' + $email + ', xin vui lòng vào liên kết trong mail để xác minh.')
                    .removeClass('d-none');
                }
              } else {
                $form.find('.success-status').html('Quý khách đăng ký tài khoản thành công').removeClass('d-none');
                setTimeout(function () {
                  window.location = '/account';
                }, 1500);
              }
              $('.loading-ovl').removeClass('open');
            },
            error: function (x, y) {
              RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
            },
          });
        });
      });
    });
  },
  login: function () {
    var self = this;
    $('#login-form').submit(function (e) {
      e.preventDefault();
      var $form = $('#login-form'),
        $email = $form.find('input[name="customer[email]"]').val(),
        $password = $form.find('input[name="customer[password]"]').val();

      $form.find('.error-status').addClass('d-none');

      if ($email == '') {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!RF.FormAccount.validateEmail($email)) {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[email]"]').parent().removeClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('');
      }

      if ($password == '') {
        $form.find('input[name="customer[password]"]').parent().addClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu không được để trống');
        return;
      } else {
        $form.find('input[name="customer[password]"]').parent().removeClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('');
      }

      RF.Module.openLoading(function () {
        grecaptcha.ready(function () {
          grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
            var payload = {
              customer: {
                email: $email,
                password: $password,
              },
              __RequestVerificationToken: shop.keyFormOmniLogin,
              'g-recaptcha-response': token,
            };
            $.ajax({
              type: 'POST',
              url: '/account/login',
              data: payload,
              form_type: 'customer_login',
              utf8: '✓',
              success: function (data) {
                var parsedResponse = $.parseHTML(data);
                var result = $(parsedResponse);
                if (result.find('#customer_login .errors').length > 0) {
                  var titleError = result.find('#customer_login .errors li').html();
                  if (titleError.indexOf('Thông tin đăng nhập không hợp lệ') != -1) {
                    $form.find('.error-status').html('Thông tin đăng nhập không hợp lệ').removeClass('d-none');
                  }
                  if (titleError.indexOf('quá hạn') != -1) {
                    $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                  }
                  if (titleError.indexOf('Không tìm thấy tài khoản nào với email này') != -1) {
                    $form.find('.error-status').html('Không tìm thấy tài khoản nào với email này').removeClass('d-none');
                  }
                  RF.Module.removeLoading();
                } else {
                  window.location = '/account';
                }
              },
              error: function (x, y) {
                RF.Module.removeLoading();
                RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
              },
            });
          });
        });
      });
    });
  },
  callToken: function (callback) {
    if (shop.keyFormOmniLogin == '' && shop.keyFormOmniForgot == '' && shop.keyFormOmniRegister == '') {
      $.get('/cart?view=form-account', function (response) {
        $('body').append(response);
        if (typeof callback === 'function') {
          return callback();
        }
      });
    } else {
      if (typeof callback === 'function') {
        return callback();
      }
    }
  },
  open: function () {
    var self = this;
    $('.open-modal').click(function () {
      var type = $(this).attr('data-type');
      if (type == 'register') {
        self.switchForm('#register-form');
      } else {
        self.switchForm('#login-form');
      }
      self.callToken(function () {
        $.fancybox.open($('#account-buyer-form'), {
          touch: false,
        });
      });
    });
  },
  switchForm: function (showId) {
    $('.auth-form').removeClass('active');
    $(showId).addClass('active');
  },
  action: function () {
    var self = this;
    $('.toggle-password').on('click', function () {
      const $input = $(this).siblings('input');
      const type = $input.attr('type') === 'password' ? 'text' : 'password';
      $input.attr('type', type);
      $(this).text(type === 'password' ? '👁️' : '🙈');
    });

    $('.show-register').on('click', function () {
      self.switchForm('#register-form');
    });
    $('.show-forgot').on('click', function () {
      self.switchForm('#forgot-form');
    });
    $('.show-login').on('click', function () {
      self.switchForm('#login-form');
    });
  },
  forgot: function () {
    var self = this;
    $('#forgot-form').submit(function (e) {
      e.preventDefault();
      var $form = $('#forgot-form'),
        $email = $form.find('input[name="email"]').val();

      $form.find('.error-status').addClass('d-none');

      if ($email == '') {
        $form.find('input[name="email"]').parent().addClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!RF.FormAccount.validateEmail($email)) {
        $form.find('input[name="email"]').parent().addClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="email"]').parent().removeClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('');
      }

      RF.Module.openLoading(function () {
        grecaptcha.ready(function () {
          grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
            var payload = {
              email: $email,
              __RequestVerificationToken: shop.keyFormOmniForgot,
              'g-recaptcha-response': token,
            };
            $.ajax({
              type: 'POST',
              url: '/account/recover',
              data: payload,
              form_type: 'recover_customer_password',
              utf8: '✓',
              success: function (data) {
                var parsedResponse = $.parseHTML(data);
                var result = $(parsedResponse);

                RF.Module.removeLoading();

                if (result.find('form[action="/account/recover"] .errors').length > 0) {
                  var titleError = result.find('form[action="/account/recover"] .errors li').html();
                  if (titleError.indexOf('quá hạn') != -1) {
                    $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                  }
                  if (titleError.indexOf('Không tìm thấy tài khoản nào với email này') != -1) {
                    $form.find('.error-status').html('Không tìm thấy tài khoản nào với email này').removeClass('d-none');
                  }
                } else {
                  $form.find('.success-status').html('Quý khách vui lòng kiểm tra email để tiến hành đặt lại mật khẩu').removeClass('d-none');
                }
              },
              error: function (x, y) {
                RF.Module.removeLoading();
                RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
              },
            });
          });
        });
      });
    });
  },
};
RF.LDPBranding = {
  init: function () {
    var that = this;
    that.tab();
    var handle = $('.main-tab button.tab.active').attr('data-handle');
    var total = $('.main-tab button.tab.active').attr('data-total');
    that.build(handle, 1, 30, total);
    that.pagi();
    that.copyCode();
  },
  copyCode: function () {
    $('.item-banner.actived').on('click', function () {
      const code = $(this).data('code');
      const tempInput = $('<input>');
      $('body').append(tempInput);
      tempInput.val(code).select();
      document.execCommand('copy');
      tempInput.remove();
      RF.Module.toastShow('Đã sao chép mã: ' + code);
    });
  },
  currentPage: 1,
  buildPaginate2: function (number, limit) {
    var self = this;
    $('.pagi-ajax').addClass('d-none');
    limit = parseInt(limit);
    var math = Math.ceil(number / limit);
    var url = Arg.parse(window.location.href);
    var currentPage = 1;
    if (self.currentPage != 1) {
      currentPage = self.currentPage;
    }
    if (math > 1) {
      var pagi = '';
      var htmlPagi = self.pagination(currentPage, math, 'pagi-item', 'disabled');
      pagi += '<div class="pagination-custom-ajax d-flex align-items-center justify-content-lg-end justify-content-center">';
      pagi += '<span class="titlePagi">Tổng ' + math + ' Trang</span>';
      pagi += htmlPagi;
      pagi += '</div>';
      $('.pagi-ajax').html(pagi).removeClass('d-none');
    } else {
      $('.pagi-ajax').html('').addClass('d-none');
    }
  },
  pagination: function (PageNumber, PageTotal, ClassName, DisableClassName) {
    var ReturnValue = '';
    var htmlPrev = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0.5L0.5 8L8 15.5" stroke="#868D95" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
    var htmlNext = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M1 0.5L8.5 8L1 15.5" stroke="#2E2E2E" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
    var TotalPages = PageTotal;
    var isPage = 3;
    if ($(window).width() < 991) {
      isPage = 1;
    }
    if (+PageNumber > 1) {
      if (+PageNumber == 2) {
        ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
      } else {
        ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
      }
    } else {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="prev-pagi ' + DisableClassName + '" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
    }
    if (+PageNumber - isPage > 1) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="1">1</span></div><div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div>';
    }
    for (var i = +PageNumber - isPage; i <= +PageNumber; i++) {
      if (i >= 1) {
        if (+PageNumber != i) {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
        } else {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
        }
      }
    }
    for (var i = +PageNumber + 1; i <= +PageNumber + isPage; i++) {
      if (i <= TotalPages) {
        if (+PageNumber != i) {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
        } else {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
        }
      }
    }
    if (+PageNumber + isPage < TotalPages) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div><div class="' + ClassName + ' pagiItem"><span data-page="' + TotalPages + '">' + TotalPages + '</span></div>';
    }
    if (+PageNumber < TotalPages) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="next-pagi" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
    } else {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="next-pagi ' + DisableClassName + '" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
    }
    return ReturnValue;
  },
  pagi: function () {
    var self = this;
    $(document).on('click', '.pagi-ajax .pagi-item:not(.disabled) span:not(.disabled)', function (e) {
      e.preventDefault();
      var $this = $(this);
      RF.Module.openLoading(function () {
        var page = parseInt($this.attr('data-page'));
        self.currentPage = page;
        var handle = $('.main-tab button.tab.active').attr('data-handle');
        var total = $('.main-tab button.tab.active').attr('data-total');
        self.build(handle, page, 30, total, function () {
          $('html, body').animate(
            {
              scrollTop: $('.render-product').offset().top - 100,
            },
            200,
          );
          RF.Module.removeLoading();
        });
      });
    });
  },
  tab: function () {
    var self = this;
    $('.tab').on('click', function () {
      var $this = $(this);
      RF.Module.openLoading(function () {
        self.currentPage = 1;
        $('.tab').removeClass('active');
        $this.addClass('active');
        var handle = $this.attr('data-handle');
        var total = $this.attr('data-total');
        self.build(handle, 1, 30, total, function () {
          RF.Module.removeLoading();
        });
      });
    });
  },
  build: function (handle, page, limit, total, callback) {
    var self = this;
    RF.ProductLoop.collectionJS2(handle, page, limit, function (response) {
      if (response.products.length > 0) {
        var items = RF.ProductLoop.loopHtml(response, true, '');
        $('.render-product').html(items);
        //RF.CustomerReviewLoop.init();
        self.buildPaginate2(total, limit);
        try {
          ProductReviews.init();
        } catch (err) {}
        if (typeof callback === 'function') {
          return callback();
        }
      } else {
        $('.render-product').html("<div class='text-center no-product'><p>Nhóm sản phẩm chưa có sản phẩm</p></div>");
        if (typeof callback === 'function') {
          return callback();
        }
      }
    });
  },
};
RF.PageSearch = {
  init: function () {
    var that = this;
    var key = that.getKey();
    that.query(key);
    that.scrollLoad();
  },
  currentPage: 1,
  query: function (key, append = false) {
    var self = this;
    var url = '/search.js';
    var query = '(((title:product=' + key + '))||((title:product**' + key + '))||((barcode:product**' + key + '))||((sku:product**' + key + '))||((tag:product**' + key + ')))&&((price:product>0))&&((tag:product<>quatang))&&((available:product=true))';
    var limit = 50;
    if ($(window).width() < 992) {
      limit = 6;
    }
    var data = {
      q: 'filter=' + query,
      type: 'product',
      page: self.currentPage,
      limit: limit,
    };
    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      success: function (response) {
        if (response.total > 0) {
          var items = RF.ProductLoop.loopHtml(response, '', '');

          if (append) {
            $('.render-product').append(items).removeClass('empty-product');
          } else {
            $('.render-product').html(items).removeClass('empty-product');
          }

          //RF.CustomerReviewLoop.init();

          var math = Math.ceil(response.total / 50);
          if (math > self.currentPage) {
            $('.loadmore-ajax').removeClass('d-none');
          } else {
            $('.loadmore-ajax').addClass('d-none');
          }

          //self.buildPaginate2(response.total,50);
        } else {
          $('.loadmore-ajax').addClass('d-none');
          $('.render-product').html("<div class='text-center no-product'><p>Không tìm thấy sản phẩm phù hợp.</p></div>").addClass('empty-product');
        }
      },
    });
  },
  getKey: function () {
    var url = new URLSearchParams(window.location.search);
    var key = url.get('q');
    return key;
  },
  buildPaginate2: function (number, limit) {
    var self = this;
    $('.pagi-ajax').addClass('d-none');
    limit = parseInt(limit);
    var math = Math.ceil(number / limit);
    var url = Arg.parse(window.location.href);
    var currentPage = 1;
    if (url.page) {
      if (parseInt(url.page) > math) {
        currentPage = 1;
      } else {
        currentPage = parseInt(url.page);
      }
    }
    if (math > 1) {
      var pagi = '';
      var htmlPagi = self.pagination(currentPage, math, 'pagi-item', 'disabled');
      pagi += '<div class="pagination-custom-ajax d-flex align-items-center justify-content-lg-end justify-content-center">';
      pagi += '<span class="titlePagi">Tổng ' + math + ' Trang</span>';
      pagi += htmlPagi;
      pagi += '</div>';
      $('.pagi-ajax').html(pagi).removeClass('d-none');
    } else {
      $('.pagi-ajax').html('').addClass('d-none');
    }
  },
  pagination: function (PageNumber, PageTotal, ClassName, DisableClassName) {
    var ReturnValue = '';
    var htmlPrev = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0.5L0.5 8L8 15.5" stroke="#868D95" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
    var htmlNext = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M1 0.5L8.5 8L1 15.5" stroke="#2E2E2E" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
    var TotalPages = PageTotal;
    var isPage = 3;
    if ($(window).width() < 991) {
      isPage = 1;
    }
    if (+PageNumber > 1) {
      if (+PageNumber == 2) {
        ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
      } else {
        ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
      }
    } else {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="prev-pagi ' + DisableClassName + '" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
    }
    if (+PageNumber - isPage > 1) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="1">1</span></div><div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div>';
    }
    for (var i = +PageNumber - isPage; i <= +PageNumber; i++) {
      if (i >= 1) {
        if (+PageNumber != i) {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
        } else {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
        }
      }
    }
    for (var i = +PageNumber + 1; i <= +PageNumber + isPage; i++) {
      if (i <= TotalPages) {
        if (+PageNumber != i) {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
        } else {
          ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
        }
      }
    }
    if (+PageNumber + isPage < TotalPages) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div><div class="' + ClassName + ' pagiItem"><span data-page="' + TotalPages + '">' + TotalPages + '</span></div>';
    }
    if (+PageNumber < TotalPages) {
      ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="next-pagi" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
    } else {
      ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="next-pagi ' + DisableClassName + '" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
    }
    return ReturnValue;
  },
  scrollLoad: function () {
    var self = this;
    $('#btn-loadmore-ajax').click(function (e) {
      e.preventDefault();
      self.currentPage++;
      var key = self.getKey();
      self.query(key, true);
    });
  },
};
RF.Addresses = {
  init: function () {
    var that = this;
    that.action();
  },
  action: function () {
    $('.edit-address').click(function (e) {
      e.preventDefault();
      const id = $(this).data('id');
      $('#edit_address_' + id).slideDown();
    });
    $('.cancel-edit').click(function () {
      const id = $(this).data('id');
      $('#edit_address_' + id).slideUp();
    });
  },
};
RF.Quickview = {
  firstRun: false,
  productDetail: {},
  productImages: {},
  init: function () {
    var that = this;
    that.open();
    that.actionBuy();
    that.quantityInput();
    that.toggleTabPromotion();
    RF.Wishlist.actionBtnWishlistQV();
  },
  toggleTabPromotion: function () {
    $('#quickview-template .promotion-group .head-pro').click(function () {
      $(this).toggleClass('active');
    });
  },
  actionBuy: function () {
    var self = this;
    $(document).on('click', '.addtocart-detail-qv', function (e) {
      e.preventDefault();
      var $this = $(this);
      self.addClassBtn('.addtocart-detail-qv', 'added', function () {
        var $quantity = $('#quickview-template .input-quantity').val();
        var $id = $('#quickview-template #product-select-qv').val();
        var payload = { id: $id, quantity: $quantity };
        var param = {
          type: 'POST',
          url: '/cart/add.js',
          data: payload,
          success: function (response) {
            self.removeClassBtn('.addtocart-detail-qv', 'added', function () {
              window.location = '/cart';
            });
          },
          error: function () {
            self.removeClassBtn('.addtocart-detail-qv', 'added', function () {
              RF.Module.toastShow('Số lượng bạn mua vượt quá tồn kho');
            });
          },
        };
        $.ajax(param);
      });
    });
    $(document).on('click', '.buynow-detail-qv', function (e) {
      e.preventDefault();
      var $this = $(this);
      self.addClassBtn('.buynow-detail-qv', 'added', function () {
        var $quantity = $('#quickview-template .input-quantity').val();
        var $id = $('#quickview-template #product-select-qv').val();
        var payload = { id: $id, quantity: $quantity };
        var param = {
          type: 'POST',
          url: '/cart/add.js',
          data: payload,
          success: function (response) {
            self.removeClassBtn('.buynow-detail-qv', 'added', function () {
              window.location = '/checkout';
            });
          },
          error: function () {
            self.removeClassBtn('.buynow-detail-qv', 'added', function () {
              RF.Module.toastShow('Số lượng bạn mua vượt quá tồn kho');
            });
          },
        };
        $.ajax(param);
      });
    });
  },
  addClassBtn: function ($ele, $class, callback) {
    $($ele).addClass($class);
    return callback();
  },
  removeClassBtn: function ($ele, $class, callback) {
    $($ele).removeClass($class);
    return callback();
  },
  open: function () {
    var self = this;
    $(document).on('click', '.addtocart-loop', function (e) {
      e.preventDefault();
      var handle = $(this).attr('data-handle');
      self.getAPI(handle, function (data) {
        self.productImages = data.media.map((item) => ({
          src: item.src,
          color: item.alt,
        }));
        self.swatch.init(handle);
        $.fancybox.open($('#quickview-template'), {
          touch: false,
        });
      });
    });
    $(document).on('click', '.buy-loop', function (e) {
      var handle = $(this).attr('data-handle');
      self.getAPI(handle, function (data) {
        self.productImages = data.media.map((item) => ({
          src: item.src,
          color: item.alt,
        }));
        self.swatch.init(handle);
        $.fancybox.open($('#quickview-template'), {
          touch: false,
        });
      });
    });
  },
  getAPI: function (handle, callback) {
    var self = this;
    if (self.productDetail[handle] == undefined) {
      $.get('/products/' + handle + '.js', function (response) {
        self.productDetail[handle] = response;
        if (typeof callback === 'function') {
          return callback(response);
        }
      });
    } else {
      if (typeof callback === 'function') {
        return callback(self.productDetail[handle]);
      }
    }
  },
  swatch: {
    _elm_color: '#quickview-template .item-option[data-index="1"] .list-option',
    _elm_Option1Active: '#quickview-template .item-option[data-index="1"] .list-option input[name="option1"]:checked',
    _elm_Option2Active: '#quickview-template .item-option[data-index="2"] .list-option input[name="option2"]:checked',
    _elm_size: '#quickview-template .item-option[data-index="2"] .list-option',
    _elm_gallery: '#quickview-template .slider-large .swiper-wrapper',
    _elm_gallery_thumb: '#quickview-template .slider-thumb .swiper-wrapper',
    _elm_swiper_thumb: '#quickview-template .slider-thumb',
    _elm_swiper_large: '#quickview-template .slider-large',
    _elm_thumb_nextEl: '#quickview-template .slider-thumb .swiper-button-next',
    _elm_thumb_prevEl: '#quickview-template .slider-thumb .swiper-button-prev',
    _elm_large_nextEl: '#quickview-template .slider-large .swiper-button-next',
    _elm_large_prevEl: '#quickview-template .slider-large .swiper-button-prev',
    _elm_input_option1: '#quickview-template .swatch-detail input[name="option1"]',
    _elm_input_option2: '#quickview-template .swatch-detail input[name="option2"]',
    _elm_product_select: '#quickview-template #product-select-qv',
    _elm_product_price_wrap: '#quickview-template .price-detail',
    _elm_product_price: '#quickview-template .price-detail span',
    _elm_product_compare_price: '#quickview-template .price-detail del',
    _elm_product_labelsale: '#quickview-template .price-detail label',
    _elm_product_sku: '#quickview-template .sku-item span',
    _elm_product_addtocart: '#quickview-template .addtocart-detail-qv',
    _elm_product_buynow: '#quickview-template .buynow-detail-qv',
    _elm_product_wishlist: '#quickview-template .btn-wishlist-qv',
    _elm_product_options: '#quickview-template .swatch-detail',
    _elm_product_like: '#quickview-template .like-item span',
    _elm_product_h2: '#quickview-template .info-column h2',
    _elm_product_groupaction: '#quickview-template .group-action',
    data: '',
    dataImages: '',
    init: function (handle) {
      var that = this;
      that.data = RF.Quickview.productDetail[handle];
      that.dataImages = RF.Quickview.productImages;
      that.renderOptions();
      if (!RF.Quickview.firstRun) {
        that.actionElement();
        RF.Quickview.firstRun = true;
      }
    },
    slug: function (str) {
      if (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, '-');
        str = str.replace(/-+-/g, '-');
        str = str.replace(/^\-+|\-+$/g, '');
        return str;
      }
    },
    renderOptions: function () {
      var self = this;
      var product = self.data;
      var html = '';
      product.options.map((option, i) => {
        var index = i + 1;
        html += '<div class="item-option ' + (index == 1 ? 'item-option-color' : 'normal-item') + '" data-option="' + option.name + '" data-index="' + index + '">';
        html += '<div class="head-option">' + option.name + '<span></span></div>';
        html += '<div class="list-option effect-loading"></div>';
        html += '</div>';
      });
      $(self._elm_product_options).html(html);
      self.renderOption1();
    },
    renderOption1: function () {
      var self = this;
      var product = self.data;
      var seenColors = new Set();
      var result = product.variants
        .filter((v) => !seenColors.has(v.option1) && seenColors.add(v.option1))
        .map((v) => ({
          option1: v.option1,
          image: v.featured_image != null ? v.featured_image.src : null,
        }));
      if (result.length > 0) {
        var html = '';
        var isChecked = false;
        result.map((variant, index) => {
          var checked = '';
          var handleColor = self.slug(variant.option1);
          var available = product.variants.filter((item) => item.option1 == variant.option1 && item.available);
          if (!isChecked && available.length > 0) {
            checked = 'checked';
            isChecked = true;
          }
          var disabled = '';
          if (available.length == 0) {
            disabled = 'sold_out';
          }
          html += '<div class="item-variant ' + disabled + '">';
          html += '<input data-color="' + handleColor + '" ' + checked + ' id="qv-option1-index-' + index + '" type="radio" value="' + variant.option1 + '" name="option1">';
          html += '<label for="qv-option1-index-' + index + '">';
          html += '<div class="in-color">';
          if (product.options[0].name == 'Màu sắc') {
            var find_color = swatch_color.filter((swt) => swt.name == variant.option1);
            var find_color_alt = '';
            if (!$.isEmptyObject(self.dataImages)) {
              var textFind = 'icon ' + variant.option1;
              find_color_alt = self.dataImages.find((item) => {
                if (!item.color) return false;
                if (item.color.indexOf('icon') !== -1) {
                  return item.color === textFind;
                }
                return false;
              });
            }
            if (find_color.length > 0) {
              var temp_color = find_color[0];
              if (temp_color.type == 'image') {
                html += '<img class="lazyload" data-src="' + temp_color.icon + '" alt="' + variant.option1 + '"/>';
              } else {
                html += '<span class="label-color" data-color="' + variant.option1 + '" style="background:' + temp_color.code + '"></span>';
              }
            } else {
              if (find_color_alt != undefined && find_color_alt != '') {
                var fix_img = Haravan.resizeImage(find_color_alt.src, sizeThumb);
                html += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
              } else {
                if (variant.image != null) {
                  var fix_img = Haravan.resizeImage(variant.image, sizeThumb);
                  html += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
                } else {
                  html += '<span class="label-color" data-color="' + variant.option1 + '"></span>';
                }
              }
            }
          } else {
            html += '<span>' + variant.option1 + '</span>';
          }
          html += '</div>';
          html += '<span class="tooltip-color">' + variant.option1 + '</span>';
          html += '</label>';
          html += '</div>';
        });
        if (html != '') {
          $(self._elm_color).removeClass('effect-loading').html(html);
        }
        if (product.options.length > 1) {
          self.renderOption2();
        } else {
          self.renderImage();
          self.renderInfo();
        }
      }
    },
    renderOption2: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).val();
      var list = product.variants.filter((item) => item.option1 == option1Active);
      if (list.length > 0) {
        var html = '';
        var isChecked = false;
        list.map((variant, index) => {
          var checked = '';
          if (!isChecked && variant.available) {
            checked = 'checked';
            isChecked = true;
          }
          var disabled = '';
          if (!variant.available) {
            disabled = 'sold_out';
          }
          html += '<div class="item-variant ' + disabled + '">';
          html += '<input ' + checked + ' id="qv-option2-index-' + index + '" type="radio" value="' + variant.option2 + '" name="option2">';
          html += '<label for="qv-option2-index-' + index + '">';
          html += '<span>' + variant.option2 + '</span>';
          html += '</label>';
          html += '</div>';
        });
        if (html != '') {
          $(self._elm_size).removeClass('effect-loading').html(html);
          self.renderImage();
          self.renderInfo();
        }
      }
    },
    isChange: false,
    renderImage: function () {
      var self = this;
      var product = self.data;
      var images = self.dataImages;
      var check = product.options[0].name;

      var colorChecked = $(self._elm_Option1Active).val();
      var imageSelect = images.filter((img) => img.color == colorChecked || img.color == 'main ' + colorChecked || img.color == 'icon ' + colorChecked);
      var imageNotSelect = images.filter((img) => img.color != colorChecked && img.color != 'main ' + colorChecked && img.color != 'icon ' + colorChecked);

      if (imageSelect.length > 0 && imageNotSelect.length > 0) {
        const merged = [...imageSelect, ...imageNotSelect];
        self.renderHtmlImage(merged);
      } else {
        if (!self.isChange) {
          /*var colorChecked = $(self._elm_Option1Active).val();
          if(colorChecked != undefined && colorChecked != ''){
            var dataRender = images.filter(img => img.color == colorChecked || img.color == ('main ' + colorChecked) || img.color == ('icon ' + colorChecked) );
  
            if(images.length == 1) dataRender = images;
            
            self.renderHtmlImage(dataRender);
          }
          else{
            self.renderHtmlImage(images);
          }*/
          self.renderHtmlImage(images);
        } else {
          if (check == 'Màu sắc') {
            var colorChecked = $(self._elm_Option1Active).val();
            var dataRender = images.filter((img) => img.color == colorChecked || img.color == 'main ' + colorChecked || img.color == 'icon ' + colorChecked || img.color == '');
            self.renderHtmlImage(dataRender);
          } else {
            self.renderHtmlImage(images);
          }
        }
      }

      /*
      if(check == 'Màu sắc'){
        var colorChecked = $(self._elm_Option1Active).val();
        var dataRender = images.filter(img => img.color == colorChecked);
        if(dataRender.length > 0){
          self.renderHtmlImage(dataRender);
        }
        else {
          self.renderHtmlImage(images);
        }
      }
      else {
        self.renderHtmlImage(images);
      }
      */
    },
    renderHtmlImage: function (data) {
      var self = this;
      var htmlLarge = '',
        htmlThumb = '';
      data.map((img) => {
        var fix_img = Haravan.resizeImage(img.src, sizeImgDetail);

        htmlLarge += '<div class="swiper-slide">';
        htmlLarge += '<div class="box-image">';
        htmlLarge += '<img class="lazyload" data-src="' + fix_img + '" alt="' + img.color + '"/>';
        htmlLarge += '</div>';
        htmlLarge += '</div>';

        htmlThumb += '<div class="swiper-slide">';
        htmlThumb += '<div class="box-image">';
        htmlThumb += '<img class="lazyload" data-src="' + fix_img + '" alt="' + img.color + '"/>';
        htmlThumb += '</div>';
        htmlThumb += '</div>';
      });
      if (htmlLarge != '') {
        if (self.largeSlider && self.largeSlider.destroy) self.largeSlider.destroy(true, true);
        $(self._elm_gallery).html(htmlLarge);
        self.swiperGallery();
      }
    },
    thumbSlider: '',
    largeSlider: '',
    swiperGallery: function () {
      var self = this;
      self.largeSlider = new Swiper(self._elm_swiper_large, {
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: {
          nextEl: self._elm_large_nextEl,
          prevEl: self._elm_large_prevEl,
        },
      });
    },
    actionElement: function () {
      var self = this;
      var product = self.data;
      $(document).on('change', self._elm_input_option1, function (e) {
        e.preventDefault();
        self.isChange = true;
        if (product.options.length > 1) {
          self.renderOption2();
        } else {
          self.renderInfo();
        }
      });
      $(document).on('change', self._elm_input_option2, function (e) {
        e.preventDefault();
        self.renderInfo();
      });
    },
    renderInfo: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).val();
      var option2Active = $(self._elm_Option2Active).val();
      var temp = product.variants.filter((item) => item.option1 == option1Active);
      if (temp.length > 0 && product.options.length > 1) {
        temp = temp.filter((item) => item.option2 == option2Active);
      }
      if (temp.length > 0) {
        var variant = temp[0];
        $(self._elm_product_select).val(variant.id);
        self.renderPrice(variant);
        self.renderSKU(variant);
        self.renderStatus(variant);
        self.renderTitle();
      }
    },
    renderStatus: function (variant) {
      var self = this;
      if (variant.available) {
        $(self._elm_product_addtocart).removeClass('disabled').find('span').html('Thêm vào giỏ hàng');
        $(self._elm_product_buynow).removeClass('d-none');
      } else {
        $(self._elm_product_addtocart).addClass('disabled').find('span').html('Tạm hết hàng');
        $(self._elm_product_buynow).addClass('d-none');
      }
    },
    renderSKU: function (variant) {
      var self = this;
      $(self._elm_product_sku).html(variant.sku);
    },
    renderPrice: function (variant) {
      var self = this;
      $(self._elm_product_compare_price).addClass('d-none');
      $(self._elm_product_labelsale).addClass('d-none');
      $(self._elm_product_price).html(Haravan.formatMoney(variant.price, shop.moneyFormat));
      $(self._elm_product_price_wrap).removeClass('hasSale');
      if (variant.compare_at_price > variant.price) {
        $(self._elm_product_price_wrap).addClass('hasSale');
        $(self._elm_product_compare_price).html(Haravan.formatMoney(variant.compare_at_price, shop.moneyFormat)).removeClass('d-none');
        var price = variant.price;
        var compare_at_price = variant.compare_at_price;
        var mathDiscount = ((compare_at_price - price) / compare_at_price) * 100;
        var result_sale = Math.round(mathDiscount);
        $(self._elm_product_labelsale)
          .html('-' + result_sale + '<small>%</small>')
          .removeClass('d-none');
      }
    },
    renderLike: function () {
      var self = this;
      var product = self.data;
      var like = product.tags.filter((tag) => tag.indexOf('like:') != -1);
      var quatang = product.tags.filter((tag) => tag.indexOf('quatang') != -1);
      if (like.length > 0) {
        var getLike = like[0].split('like:')[1];
        $(self._elm_product_like).html(getLike + ' thích');
      }
      if (quatang.length > 0) {
        $(self._elm_product_groupaction).addClass('d-none');
      } else {
        $(self._elm_product_groupaction).removeClass('d-none');
      }
    },
    renderTitle: function () {
      var self = this;
      var product = self.data;
      $(self._elm_product_h2).html(product.title);
      $(self._elm_product_wishlist).attr('data-handle', product.handle);
      $(self._elm_product_wishlist).attr('data-title', product.title);
      RF.Wishlist.checkWishlistQV();
    },
    buildParam: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).attr('data-color');
      var option2Active = $(self._elm_Option2Active).val();
      var params = new URLSearchParams(window.location.search);
      params.set('color', option1Active);
      if (product.options.length > 1) {
        params.set('size', option2Active);
      }
      var newUrl = window.location.pathname + '?' + params.toString();
      history.replaceState(null, '', newUrl);
    },
  },
  quantityInput: function () {
    var $input = $('#quickview-template .input-quantity');
    var min = 1;
    $('#quickview-template .btn-minus').on('click', function () {
      let current = parseInt($input.val()) || min;
      if (current > min) {
        $input.val(current - 1);
      }
    });
    $('#quickview-template .btn-plus').on('click', function () {
      let current = parseInt($input.val()) || min;
      $input.val(current + 1);
    });
    $input.on('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value === '' || parseInt(this.value) < min) {
        this.value = min;
      }
    });
  },
};
RF.FormAccount = {
  isSendAgain: false,
  init: function () {
    var that = this;
    that.slideForms();
    that.disabledFormEnter();
    that.lowerCaseEmail();
    that.warningErrorLogin();
    that.styleInputFormCustomer();
    that.recaptchaReadyForForm();

    that.loginAccount();
    that.formForgotPasswordPhone();
    that.bindOtpPage();
    that.bindRegister();
  },
  validateEmail: function ($email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test($email);
  },
  isValidPhone: function (phone) {
    phone = phone.trim();
    if (phone.startsWith('+84')) phone = phone.replace('+84', '0');
    if (phone.startsWith('84')) phone = phone.replace('84', '0');
    return /(03|05|07|08|09)+([0-9]{8})\b/.test(phone);
  },
  checkPasswordValidation: function (value) {
    const isWhitespace = /^(?=.*\s)/;
    if (isWhitespace.test(value)) {
      return 'Mật khẩu không được chứa khoảng trắng';
    }

    const isContainsUppercase = /^(?=.*[A-Z])/;
    if (!isContainsUppercase.test(value)) {
      return 'Mật khẩu phải có ít nhất một ký tự viết hoa';
    }

    const isContainsLowercase = /^(?=.*[a-z])/;
    if (!isContainsLowercase.test(value)) {
      return 'Mật khẩu phải có ít nhất một ký tự chữ thường';
    }

    const isContainsNumber = /^(?=.*[0-9])/;
    if (!isContainsNumber.test(value)) {
      return 'Mật khẩu phải chứa ít nhất một chữ số';
    }

    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    if (!isContainsSymbol.test(value)) {
      return 'Mật khẩu phải chứa ít nhất một Ký hiệu Đặc biệt';
    }

    return null;
  },
  recaptchaReadyForForm: function () {
    $('.btn-recaptcha').removeAttr('disabled').removeClass('disabled').removeClass('no-image');
  },
  swithchSlide: function ($target) {
    var self = this;
    $target.addClass('show').siblings().removeClass('show');
    $('.customer-actions__forms').css('height', $target.outerHeight());
  },
  slideForms: function () {
    var self = this;
    $('.customer-actions__forms').css('height', $('.login-n-sigup').height());
    $('.register-now a').on('click', function () {
      $('.forgotten-password').removeClass('show');
      $('.login-n-sigup').addClass('show');
      $('[data-bs-target="#signup"]').trigger('click');
    });
    $('.redirect-btn').on('click', function (e) {
      e.preventDefault();
      var $target = $($(this).data('target'));
      var id = $(this).data('target');
      if (id == '.forgotten-password') {
        history.replaceState(null, '', '#recover');
      }
      self.swithchSlide($target);
    });

    $('.login-n-sigup .nav-link').on('shown.bs.tab', function (e) {
      if ($(e.target).data('bs-target') === '#login') {
        history.replaceState(null, '', '/account/login');
      } else {
        history.replaceState(null, '', '/account/register');
      }
      $('.customer-actions__forms').css('height', $('.login-n-sigup').height());
    });

    $('#change_login-phone').on('click', function (e) {
      if (e.cancelable) e.preventDefault();
      $('.login-phone').siblings('form').addClass('d-none');
      $('.login-phone').removeClass('d-none');
    });

    $('#change_login-email').on('click', function (e) {
      if (e.cancelable) e.preventDefault();
      $('.login-phone').siblings('form').removeClass('d-none');
      $('.login-phone').addClass('d-none');
    });
  },
  disabledFormEnter: function () {
    $('.customer-actions form').on('keyup keypress', function (e) {
      if (e.key === 'Enter') {
        if (e.cancelable) e.preventDefault();
        return false;
      }
    });
  },
  loginAccount: function () {
    var self = this;
    $('.btn-login-form-page').click(function (e) {
      e.preventDefault();
      var $form = $('#customer_login'),
        $email = $form.find('input[name="customer[email]"]').val(),
        $password = $form.find('input[name="customer[password]"]').val();

      $form.find('.error-status').addClass('d-none');

      if ($email == '') {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        // $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không được để trống');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Số điện thoại không được để trống');
        return;
        // } else if (!self.validateEmail($email)) {
        //   $form.find('input[name="customer[email]"]').parent().addClass('error');
        //   $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không hợp lệ');
        //   return;
      } else {
        $form.find('input[name="customer[email]"]').parent().removeClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('');
      }

      if ($password == '') {
        $form.find('input[name="customer[password]"]').parent().addClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu không được để trống');
        return;
      } else {
        $form.find('input[name="customer[password]"]').parent().removeClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('');
      }

      RF.Module.openLoading(function () {
        grecaptcha.ready(function () {
          grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
            var tokenVerification = $form.find('input[name="__RequestVerificationToken"]').val();

            var payload = {
              customer: {
                email: $email,
                password: $password,
              },
              __RequestVerificationToken: tokenVerification,
              'g-recaptcha-response': token,
            };
            $.ajax({
              type: 'POST',
              url: '/account/login',
              data: payload,
              form_type: 'customer_login',
              utf8: '✓',
              success: function (data) {
                var parsedResponse = $.parseHTML(data);
                var result = $(parsedResponse);
                if (result.find('#customer_login .errors').length > 0) {
                  var titleError = result.find('#customer_login .errors li').html();
                  if (titleError.indexOf('Thông tin đăng nhập không hợp lệ') != -1) {
                    $form.find('.error-status').html('Thông tin đăng nhập không hợp lệ').removeClass('d-none');
                  }
                  if (titleError.indexOf('quá hạn') != -1) {
                    $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                  }
                  if (titleError.indexOf('Không tìm thấy tài khoản nào với email này') != -1) {
                    $form.find('.error-status').html('Không tìm thấy tài khoản nào với email này').removeClass('d-none');
                  }
                  RF.Module.removeLoading();
                } else {
                  window.location = '/account';
                }
              },
              error: function (x, y) {
                RF.Module.removeLoading();
                RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
              },
            });
          });
        });
      });
    });
  },
  createAccount: function () {
    var self = this;
    $('.btn-register-form-page').click(function (e) {
      e.preventDefault();
      var $this = $(this),
        $form = $('#create_customer'),
        $lastName = $form.find('input[name="customer[last_name]"]').val(),
        $firstName = $form.find('input[name="customer[first_name]"]').val(),
        $email = $form.find('input[name="customer[email]"]').val(),
        $phone = $form.find('input[name="customer[phone]"]').val(),
        $password = $form.find('input[name="customer[password]"]').val();

      $form.find('.error-status').addClass('d-none');
      $form.find('.success-status').addClass('d-none');

      if ($lastName == '') {
        $form.find('input[name="customer[last_name]"]').parent().addClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('Họ không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[last_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('');
      }

      if ($firstName == '') {
        $form.find('input[name="customer[first_name]"]').parent().addClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('Tên không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[first_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('');
      }

      if ($email == '') {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!self.validateEmail($email)) {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[email]"]').parent().removeClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('');
      }

      /*if($phone == ''){
				$form.find('input[name="customer[phone]"]').parent().addClass('error');
				$form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không được để trống');
				return;
			}
			else if(!MSO.Module.isVietnamesePhoneNumber($phone)){
				$form.find('input[name="customer[phone]"]').parent().addClass('error');
				$form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không hợp lệ');
				return;
			}
			else {
				$form.find('input[name="customer[phone]"]').parent().removeClass('error');
				$form.find('input[name="customer[phone]"]').parent().find('.text-error').html('');
			}*/

      if ($password == '') {
        $form.find('input[name="customer[password]"]').parent().addClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu không được để trống');
        return;
      } else if ($password != '') {
        if ($password.length < 8) {
          $form.find('input[name="customer[password]"]').parent().addClass('error');
          $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu phải dài 10-16 ký tự');
          return;
        } else {
          var validatePasssword = self.checkPasswordValidation($password);
          if (validatePasssword != null) {
            $form.find('input[name="customer[password]"]').parent().addClass('error');
            $form.find('input[name="customer[password]"]').parent().find('.text-error').html(validatePasssword);
            return;
          }
        }
      } else {
        $form.find('input[name="customer[password]"]').parent().removeClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('');
      }

      $('.loading-ovl').addClass('open');

      self.omniFormRegister($form, $lastName, $firstName, $email, '', $password);
    });
    $('.get-otp-form-register-page').click(function (e) {
      if (e.cancelable) e.preventDefault();
      var $this = $(this),
        $form = $('#create_customer'),
        $lastName = $form.find('input[name="customer[last_name]"]').val(),
        $firstName = $form.find('input[name="customer[first_name]"]').val(),
        $email = $form.find('input[name="customer[email]"]').val(),
        $phone = $form.find('input[name="customer[phone]"]').val(),
        $password = $form.find('input[name="customer[password]"]').val();
      $this.addClass('disabled');
      $form.find('.error-status').addClass('d-none');
      $form.find('.success-status').addClass('d-none');

      if ($lastName == '') {
        $form.find('input[name="customer[last_name]"]').parent().addClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('Họ không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[last_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[last_name]"]').parent().find('.text-error').html('');
      }

      if ($firstName == '') {
        $form.find('input[name="customer[first_name]"]').parent().addClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('Tên không được bỏ trống');
        return;
      } else {
        $form.find('input[name="customer[first_name]"]').parent().removeClass('error');
        $form.find('input[name="customer[first_name]"]').parent().find('.text-error').html('');
      }

      if ($email == '') {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!self.validateEmail($email)) {
        $form.find('input[name="customer[email]"]').parent().addClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[email]"]').parent().removeClass('error');
        $form.find('input[name="customer[email]"]').parent().find('.text-error').html('');
      }

      if ($phone == '') {
        $form.find('input[name="customer[phone]"]').parent().addClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không được để trống');
        return;
      } else if (!self.isVietnamesePhoneNumber($phone)) {
        $form.find('input[name="customer[phone]"]').parent().addClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('Số điện thoại không hợp lệ');
        return;
      } else {
        $form.find('input[name="customer[phone]"]').parent().removeClass('error');
        $form.find('input[name="customer[phone]"]').parent().find('.text-error').html('');
      }

      if ($password == '') {
        $form.find('input[name="customer[password]"]').parent().addClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu không được để trống');
        return;
      } else if ($password != '') {
        if ($password.length < 8) {
          $form.find('input[name="customer[password]"]').parent().addClass('error');
          $form.find('input[name="customer[password]"]').parent().find('.text-error').html('Mật khẩu phải dài 10-16 ký tự');
          return;
        } else {
          var validatePasssword = self.checkPasswordValidation($password);
          if (validatePasssword != null) {
            $form.find('input[name="customer[password]"]').parent().addClass('error');
            $form.find('input[name="customer[password]"]').parent().find('.text-error').html(validatePasssword);
            return;
          }
        }
      } else {
        $form.find('input[name="customer[password]"]').parent().removeClass('error');
        $form.find('input[name="customer[password]"]').parent().find('.text-error').html('');
      }

      $('.loading-ovl').addClass('open');

      grecaptcha.ready(function () {
        grecaptcha.execute('6Le2KUwmAAAAAFrrcqmsaN_xyyPqpEGo6_6j_Hd9', { action: 'submit' }).then(function (token) {
          MSO.CustomerVerify.apiFormRegister($lastName, $firstName, $email, $phone, $password, token, function (data) {
            if (data.success) {
              $('#create_customer .item-input-otp-register').removeClass('d-none');
            } else {
              if (data.error.code == 'ERR_VALIDATION_FAILED') {
                $form.find('.error-status').html('Dữ liệu không đúng định dạng').removeClass('d-none');
              } else if (data.error.code == 'ERR_DATA_EXISTED') {
                $form.find('.error-status').html('Email hoặc số điện thoại đã tồn tại').removeClass('d-none');
              } else if (data.error.code == 'ERR_OTP_WAS_SENT_RECENTLY') {
                $form.find('.error-status').html('Thử lại sau ít phút').removeClass('d-none');
              } else if (data.error.code == 'ERR_INVALID_GRECAPTCHA') {
                $form.find('.error-status').html('Mã recaptcha không hợp lệ').removeClass('d-none');
              } else if (data.error.code == 'ERR_SERVER_FAILED') {
                $form.find('.error-status').html(data.error.message).removeClass('d-none');
              } else if (data.error.code == 'ERR_UNSUPPORTED_FEATURE') {
                $form.find('.error-status').html(data.error.message).removeClass('d-none');
              } else if (data.error.code == 'ERR') {
                $form.find('.error-status').html('Thử lại sau ít phút').removeClass('d-none');
              }
            }
            $('.loading-ovl').removeClass('open');
          });
        });
      });
    });
    $('#signup-phone').keyup(function () {
      var $this = $(this);
      var phone = $this.val();
      if (self.isVietnamesePhoneNumber(phone)) {
        $('.get-otp-form-register-page').removeClass('disabled');
      } else {
        $('.get-otp-form-register-page').addClass('disabled');
      }
    });
    $('#otp_code_register_page').keyup(function () {
      var $this = $(this);
      var otp = $this.val();
      var length = otp.length;
      if (length == 6) {
        $('.verify-phone-form-register-page').removeClass('disabled');
      } else {
        $('.verify-phone-form-register-page').addClass('disabled');
      }
    });
  },
  omniFormRegister: function ($form, $lastName, $firstName, $email, $phone, $password) {
    grecaptcha.ready(function () {
      grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
        var tokenVerification = $form.find('input[name="__RequestVerificationToken"]').val();

        $.ajax({
          type: 'POST',
          url: '/account',
          data: {
            customer: {
              last_name: $lastName,
              first_name: $firstName,
              email: $email,
              phone: $phone,
              password: $password,
            },
            __RequestVerificationToken: tokenVerification,
            'g-recaptcha-response': token,
          },
          form_type: 'create_customer',
          utf8: '✓',
          success: function (data) {
            var parsedResponse = $.parseHTML(data);
            var result = $(parsedResponse);
            if (result.find('#create_customer .errors').length > 0) {
              var titleError = result.find('#create_customer .errors li').html();
              if (titleError.indexOf('quá hạn') != -1) {
                $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
              }
              if (titleError.indexOf('Email đã tồn tại') != -1) {
                $form.find('.error-status').html('Email đã tồn tại').removeClass('d-none');
              }
              if (titleError.indexOf('Lỗi hệ thống') != -1) {
                $form.find('.error-status').html('Lỗi hệ thống').removeClass('d-none');
              }
              if (titleError.indexOf('xin vui lòng vào liên kết') != -1) {
                sessionStorage.setItem('isRegister', true);
                $form
                  .find('.success-status')
                  .html('Chúng tôi đã gửi email đến ' + $email + ', xin vui lòng vào liên kết trong mail để xác minh.')
                  .removeClass('d-none');
              }
            } else {
              setTimeout(function () {
                window.location = '/account';
              }, 500);
            }
            $('.loading-ovl').removeClass('open');
          },
          error: function (x, y) {
            RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
          },
        });
      });
    });
  },
  forgotAccount: function () {
    var self = this;
    $('.btn-send-forgot-form-page').click(function (e) {
      e.preventDefault();

      var $this = $(this),
        $form = $('form[action="/account/recover"]'),
        $email = $form.find('input[name="email"]').val();

      $form.find('.error-status').addClass('d-none');
      $form.find('.success-status').addClass('d-none');

      if ($email == '') {
        $form.find('input[name="email"]').parent().addClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('Email không được để trống');
        return;
      } else if (!self.validateEmail($email)) {
        $form.find('input[name="email"]').parent().addClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('Email không hợp lệ');
        return;
      } else {
        $form.find('input[name="email"]').parent().removeClass('error');
        $form.find('input[name="email"]').parent().find('.text-error').html('');
      }

      var tokenVerification = $form.find('input[name="__RequestVerificationToken"]').val();

      grecaptcha.ready(function () {
        grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
          $.ajax({
            type: 'POST',
            url: '/account/recover',
            data: {
              email: $email,
              __RequestVerificationToken: tokenVerification,
              'g-recaptcha-response': token,
            },
            form_type: 'recover_customer_password',
            utf8: '✓',
            success: function (data) {
              var parsedResponse = $.parseHTML(data);
              var result = $(parsedResponse);
              if (result.find('form[action="/account/recover"] .errors').length > 0) {
                var titleError = result.find('form[action="/account/recover"] .errors li').html();
                if (titleError.indexOf('quá hạn') != -1) {
                  $form.find('.error-status').html('Vui lòng làm mới lại trang').removeClass('d-none');
                }
                if (titleError.indexOf('Không tìm thấy tài khoản nào với email này') != -1) {
                  $form.find('.error-status').html('Không tìm thấy tài khoản nào với email này').removeClass('d-none');
                }
              } else {
                $form.find('.success-status').html('Quý khách vui lòng kiểm tra email để tiến hành đặt lại mật khẩu').removeClass('d-none');
              }
            },
            error: function (x, y) {
              RF.Module.toastShow('Có lỗi xãy ra. Vui lòng thử lại sau');
            },
          });
        });
      });
    });
  },
  formForgotPasswordPhone: function () {
    var self = this;
    $('#form_recover_password_page').submit(function (e) {
      e.preventDefault();
      const $form = $(this);
      self.clearError($form);
      const phone = $form.find('[name="phone_number"]').val();
      if (!phone || !self.isValidPhone(phone)) {
        self.showError($form.find('[name="phone_number"]'), 'SĐT không hợp lệ');
        return;
      }
      $('#phone_auth_recaptcha [name="phone_number"]').val(phone);
      $('#phone-auth-submit').trigger('click');
      self.swithchSlide($('.otp-form-panel'));
    });
  },
  styleInputFormCustomer: function () {
    $(document).on('change', '.customer-actions__forms input', function () {
      $(this).parent().removeClass('error');
      $(this).parent().find('.text-error').html('');
    });
  },
  inputPassword: function () {
    $('.input-password').each(function () {
      var $this = $(this),
        val = $this.val();
      if (val != '') {
        $this.addClass('hasValue');
      } else {
        $this.removeClass('hasValue');
      }
    });
    $('.input-password').on('input', function () {
      var $this = $(this),
        val = $this.val();
      if (val != '') {
        $this.addClass('hasValue');
      } else {
        $this.removeClass('hasValue');
      }
    });
    $('.eyes-password').click(function () {
      var $this = $(this);
      if ($this.parent().find('input').attr('type') === 'password') {
        $this.parent().find('input').attr('type', 'text');
      } else {
        $this.parent().find('input').attr('type', 'password');
      }
    });
  },
  lowerCaseEmail: function () {
    var $input = $('#signup-email');
    if ($input.length > 0) {
      var isValue = $input.val();
      isValue = isValue.toLowerCase();
      $input.val(isValue);

      $input.on('keyup change paste propertychange', function () {
        var value = $(this).val();
        value = value.toLowerCase();
        $input.val(value);
      });
    }
  },
  warningErrorLogin: function () {
    var url = window.location.href;
    if (url.indexOf('#recover') != -1) {
      $('.redirect-btn[data-target=".forgotten-password"]').click();
    }
    $('.forgotten-password form').submit(function () {
      localStorage.setItem('forgotPass', true);
    });
    if (localStorage.getItem('forgotPass') != null) {
      $('.redirect-btn[data-target=".forgotten-password"]').click();
      if ($('.forgotten-password .errors').length == 0) {
        $('.forgotten-password .form-desc').html('Nếu quý khách vẫn chưa nhận được email thay đổi thì vui lòng xác thực lại email lần nữa.');
        localStorage.removeItem('forgotPass');
      }
    }
  },
  showError: function ($input, message) {
    $input.parent().find('.error-status').text(message).removeClass('d-none');
  },
  clearError: function ($form) {
    $form.find('.text-error').text('');
    $form.find('.error-status').addClass('d-none').text('');
    $form.find('.success-status').addClass('d-none').text('');
  },
  bindOtpPage: function () {
    const self = this;
    $('#form_otp_page').on('submit', function (e) {
      e.preventDefault();
      var $form = $(this);
      const otp = self.getOtp();
      if (!/^[0-9]{6}$/.test(otp)) {
        RF.Module.toastShow('OTP không hợp lệ');
        return;
      }
      $form.find('input[name="otp_code"]').val(otp);
      $.ajax({
        url: '/phone_auth/validate',
        type: 'POST',
        data: $form.serialize(),
        success: function (data) {
          // debugger
          var urlPass = data.split('<meta property="og:url" content="')[1].split('" />')[0];
          if (urlPass.indexOf('account/reset') > -1) {
            // localStorage.setItem('user_info', JSON.stringify(user_register_info));
            window.location = urlPass;
          } else {
            RF.Module.toastShow('Có lỗi xảy ra. Xin nhấn gửi lại.');
          }
        },
      });
    });
    $('#form_otp_page input').on('input', function () {
      if (this.value.length === 1) {
        $(this).parent().next().find('input').focus();
      }
    });
  },
  getOtp: function () {
    return $('#form_otp_page .input-wrap input')
      .map((i, el) => $(el).val())
      .get()
      .join('');
  },
  bindResend: function () {
    const self = this;
    $('#send_again_otp_page').on('click', function (e) {
      e.preventDefault();
      if (self.isSendAgain) {
        $('#phone-auth-submit').trigger('click');
      }
    });
  },
  bindRegister: function () {
    const self = this;
    $('#form_register_page').on('submit', function (e) {
      e.preventDefault();
      const $form = $(this);
      self.clearError($form);
      const phone = $form.find('[name="customer[phone]"]').val();
      let isValid = true;
      if (!phone) {
        self.showError($form.find('[name="customer[phone]"]'), 'Nhập SĐT');
        isValid = false;
      } else if (!self.isValidPhone(phone)) {
        self.showError($form.find('[name="customer[phone]"]'), 'SĐT không hợp lệ');
        isValid = false;
      }
      if (!isValid) return;
      $('#phone_auth_recaptcha [name="phone_number"]').val(phone);
      $('#phone-auth-submit').trigger('click');
      self.swithchSlide($('.otp-form-panel'));
    });
  },
};
RF.OrderDetail = {
  init: function () {
    var that = this;
    RF.Module.openLoading(function () {
      that.getAPI();
    });
  },
  productItem: function (data) {
    var html = '';

    var no_img = 'https://file.hstatic.net/1000290074/file/no_image_available.jpg';

    data.line_items.map((product) => {
      var img = no_img;
      if (product.image.src) {
        img = product.image.src;
      }
      html += '<div class="item-product">';
      html += '<div class="box-img">';
      html += '<img src="' + img + '" alt="' + product.title + '">';
      html += '</div>';
      html += '<div class="box-info">';
      html += '<div class="title-prod">' + product.title + '</div>';
      html += '<div class="variant-title">' + product.variant_title + '</div>';
      html += '<div class="wrap-price">';
      html += '<div class="price-prod-normal">';
      if (product.price_original > product.price) {
        html += '<del>' + Haravan.formatMoney(product.price_original * 100, shop.moneyFormat) + '</del>';
      }
      html += '<span>' + Haravan.formatMoney(product.price * 100, shop.moneyFormat) + '</span>';
      html += '</div>';
      html += '<div class="qty-prod">x' + product.quantity + '</div>';
      html += '<div class="price-prod">';
      html += '<span>' + Haravan.formatMoney(product.price * product.quantity * 100, shop.moneyFormat) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    return html;
  },
  renderPayment: function (data) {
    var logo = {
      zalo: 'https://file.hstatic.net/1000290074/file/zalopay.png',
      vietqr: 'https://hstatic.net/0/0/global/design/seller/image/payment/vietqr.svg',
      momo: 'https://hstatic.net/0/0/global/design/seller/image/payment/momo.svg',
      vnpay: 'https://hstatic.net/0/0/global/design/seller/image/payment/vnpay_new.svg',
      transfer: 'https://hstatic.net/0/0/global/design/seller/image/payment/other.svg',
      cod: 'https://hstatic.net/0/0/global/design/seller/image/payment/cod.svg',
    };

    var img = logo.cod;
    var name = data.gateway.toLowerCase();
    if (name.indexOf('momo') != -1) {
      img = logo.momo;
    } else if (name.indexOf('chuyển khoản') != -1) {
      img = logo.transfer;
    } else if (name.indexOf('vnpay') != -1) {
      img = logo.vnpay;
    } else if (name.indexOf('vietqr') != -1) {
      img = logo.vietqr;
    } else if (name.indexOf('zalo') != -1) {
      img = logo.zalo;
    }

    $('.method-payment .box-img img').attr('src', img);
    $('.method-payment .box-name').html(data.gateway);
  },
  getAPI: function () {
    var self = this;
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (shop.template == 'customers[order]') {
      id = $('#hidden_order_id').val();
    }
    if (id != null) {
      var url = '/apps/smes/auth/api/orders/' + id + '/detail';
      $.get(url, function (response) {
        if (!response.error) {
          var order = response.item;

          var shipping = order.shipping_lines[0];
          $('.shipping-method').html(shipping.title);

          var info1 = order.shipping_address.name + ' | ' + '<span>' + order.shipping_address.phone + '</span>';
          $('.info-shipping .info-1').html(info1);

          var ship = order.shipping_address;
          var info2 = ship.address1 + ', ' + ship.ward + ', ' + ship.district + ', ' + ship.province;
          $('.info-shipping .info-2').html(info2);

          var lineItem = self.productItem(order);
          $('.prod-listing').html(lineItem);

          self.renderPayment(order);

          $('.ajax-code-order').html(order.order_number);

          $('.item-table-subtotal .title-table span').html(order.line_items.length);
          var subprice = Haravan.formatMoney(order.total_line_items_price * 100, shop.moneyFormat);
          $('.item-table-subtotal .ajax-subtotal').html(subprice);

          if (order.discount_codes.length > 9) {
            var discount = order.discount_codes[0];
            $('.promotion-price')
              .removeClass('d-none')
              .find('.value-table')
              .html('-' + Haravan.formatMoney(discount.amount * 100, shop.moneyFormat));
          }

          var priceship = shipping.price;
          $('.fee-shipping').html(Haravan.formatMoney(priceship * 100, shop.moneyFormat));

          var totalprice = Haravan.formatMoney(order.total_price * 100, shop.moneyFormat);
          $('.total-price-order').html(totalprice);

          RF.Module.removeLoading();
        }
      });
    }
  },
};
RF.ListOrder = {
  init: function () {
    var that = this;
    that.tab();
    that.api(1, 100, '', '', function (response) {
      if (response.items.length > 0) {
        var items = that.renderHtml(response);
        $('.order-list .item-content[data-tab="all"] .ajax-render-item').html(items);
      }
    });
  },
  checkTab: function (data) {
    if (!data.error) {
      $('.tab-listing .item-tab[data-tab="all"] span').html('(' + data.total + ')');
      if (data.items.length > 0) {
        var find_complete = data.items.filter((item) => item.financial_status == 'paid');
        if (find_complete.length > 0) {
          $('.tab-listing .item-tab[data-tab="paid"] span').html('(' + find_complete.length + ')');
        }

        var find_wait_shipping = data.items.filter((item) => item.pos_order_status == 'readytopick' || item.pos_order_status == 'picking');
        if (find_wait_shipping.length > 0) {
          $('.tab-listing .item-tab[data-tab="process"] span').html('(' + find_wait_shipping.length + ')');
        }

        var find_shipping = data.items.filter((item) => item.pos_order_status == 'delivering');
        if (find_shipping.length > 0) {
          $('.tab-listing .item-tab[data-tab="on_delivery"] span').html('(' + find_shipping.length + ')');
        }

        var find_deliveried = data.items.filter((item) => item.pos_order_status == 'delivered');
        if (find_deliveried.length > 0) {
          $('.tab-listing .item-tab[data-tab="delivered"] span').html('(' + find_deliveried.length + ')');
        }

        var find_cancel = data.items.filter((item) => item.pos_order_status == 'pos_cancel');
        if (find_cancel.length > 0) {
          $('.tab-listing .item-tab[data-tab="cancel"] span').html('(' + find_cancel.length + ')');
        }

        var find_refund = data.items.filter((item) => item.pos_order_status == 'pos_cancel_refund');
        if (find_refund.length > 0) {
          $('.tab-listing .item-tab[data-tab="refund"] span').html('(' + find_refund.length + ')');
        }
      }
    }
  },
  renderHtml: function (response) {
    var html = '';
    var svg_1 = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M44 108a3.988 3.988 0 0 1-2.828-1.172 3.997 3.997 0 0 1 0-5.656L78.344 64 41.172 26.828c-1.563-1.563-1.563-4.094 0-5.656s4.094-1.563 5.656 0l40 40a3.997 3.997 0 0 1 0 5.656l-40 40A3.988 3.988 0 0 1 44 108z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';
    var no_img = 'https://file.hstatic.net/1000290074/file/no_image_available.jpg';

    console.log(response);

    response.items.map((order) => {
      var status = 'Đang xử lý';
      if (order.pos_order_status == 'pos_complete') {
        status = 'Hoàn tất';
      } else if (order.pos_order_status == 'pos_cancel') {
        status = 'Đã huỷ';
      }

      html += '<div class="item-order">';
      html += '<div class="head-order">';
      html += '<div class="staus-order">' + status + '</div>';
      html += '<a href="/account?view=order&id=' + order._id + '">';
      html += 'Chi tiết';
      html += svg_1;
      html += '</a>';
      html += '</div>';
      html += '<div class="shipping-method">';
      html += order.shipping_lines[0].title;
      html += '</div>';
      html += '<div class="listing-product">';
      order.line_items.map((product) => {
        var img = no_img;
        if (product.image.src) {
          img = product.image.src;
        }

        html += '<div class="item-product">';
        html += '<div class="left-column">';
        html += '<div class="box-img">';
        html += '<img src="' + img + '" alt="' + product.title + '"/>';
        html += '</div>';
        html += '<div class="box-title">';
        html += '<h4>' + product.title + '</h4>';
        html += '<p>' + product.variant_title + '</p>';
        html += '<p>' + Haravan.formatMoney(product.price * 100, shop.moneyFormat) + '</p>';
        html += '</div>';
        html += '</div>';
        html += '<div class="right-column">';
        html += '<div class="quantity-item">x' + product.quantity + '</div>';
        var price = product.price * product.quantity;
        html += '<div class="price-item">' + Haravan.formatMoney(price * 100, shop.moneyFormat) + '</div>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="footer-total">';
      html += '<div class="left-total">';
      html += '<div class="total-line">Có <strong>' + order.line_items.length + ' sản phẩm</strong></div>';
      html += '<div class="ordercode-line">Mã đơn: <strong>' + order.order_number + '</strong></div>';
      html += '</div>';
      html += '<div class="right-total">';
      html += '<div class="line-total">';
      html += '<label>Thành tiền: </label>';
      var totalPrice = order.total_price * 100;
      html += '<span class="ajax-total-price">' + Haravan.formatMoney(totalPrice, shop.moneyFormat) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    return html;
  },
  tab: function () {
    var self = this;
    $('.tab-listing .item-tab').click(function () {
      var tab = $(this).attr('data-tab');
      $('.tab-listing .item-tab[data-tab="' + tab + '"]').addClass('active');
      $('.tab-listing .item-tab[data-tab!="' + tab + '"]').removeClass('active');
      $('.content-tab .item-content[data-tab="' + tab + '"]').addClass('active');
      $('.content-tab .item-content[data-tab!="' + tab + '"]').removeClass('active');
      var payment = $(this).attr('pos_order_status_in') || '';
      var shipping = $(this).attr('carrier_status_code_in') || '';
      var page = 1;
      var limit = 100;
      self.api(page, limit, payment, shipping, function (response) {
        console.log('Dữ liệu từ API:', response);
        if (response.items.length > 0) {
          var items = self.renderHtml(response);
          $('.order-list .item-content[data-tab="' + tab + '"] .ajax-render-item').html(items);
        }
      });
    });
  },
  api: function (page, limit, payment, shipping, callback) {
    const baseUrl = '/apps/smes/auth/api/orders/listbycustomer';
    const queryParams = new URLSearchParams({
      page: page || 1,
      limit: limit || 10,
      pos_order_status_in: payment || '',
      carrier_status_code_in: shipping || '',
    });
    const url = `${baseUrl}?${queryParams.toString()}`;
    $.get(url, function (response) {
      if (typeof callback === 'function') {
        return callback(response);
      }
    });
  },
};
RF.Account = {
  init: function () {
    this.formUpdateProfile();
  },
  formUpdateProfile: function () {
    $('#update_customer').submit(function (e) {
      e.preventDefault();
      var $form = $(this),
        $lastName = $form.find('#input-lastname-update').val(),
        $firstName = $form.find('#input-firstname-update').val(),
        $birthDay = $form.find('#input-birthday-update').val(),
        $gender = $form.find('#input-gender-update').val();

      if ($lastName == '') {
        $form.find('#input-lastname-update').parent().addClass('error');
        $form.find('#input-lastname-update').parent().find('.text-error').html('Họ không được bỏ trống');
        return;
      } else {
        $form.find('#input-lastname-update').parent().removeClass('error');
        $form.find('#input-lastname-update').parent().find('.text-error').html('');
      }

      if ($firstName == '') {
        $form.find('#input-firstname-update').parent().addClass('error');
        $form.find('#input-firstname-update').parent().find('.text-error').html('Tên không được bỏ trống');
        return;
      } else {
        $form.find('#input-firstname-update').parent().removeClass('error');
        $form.find('#input-firstname-update').parent().find('.text-error').html('');
      }

      if ($birthDay != '') {
        var getDate = $birthDay.split('/');
        $birthDay = getDate[1] + '/' + getDate[0] + '/' + getDate[2];
      }

      grecaptcha.ready(function () {
        grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
          $.ajax({
            type: 'POST',
            url: '/account',
            data: {
              customer: {
                last_name: $lastName,
                first_name: $firstName,
                birthday: $birthDay,
                gender: $gender,
              },
              'g-recaptcha-response': token,
              __RequestVerificationToken: window.shop.keyFormOmniUpdate,
              form_type: 'update_customer',
              utf8: '✓',
            },
            success: function (data) {
              RF.Module.toastShow('Cập nhật thông tin thành công');
            },
            error: function (x, y) {
              RF.Module.toastShow('Hệ thống bận, vui lòng thử lại sau!');
            },
          });
        });
      });
    });
  },
};
RF.Module = {
  countItemsHeader: function () {
    $('.cart-header .count-item').html(cartJS.item_count);
  },
  notiAddSuccess: function (data) {
    var html = '';
    html += '<div class="cart-popup">';
    html += '<div class="cart-popup__title">Đã thêm vào giỏ hàng!</div>';
    html += '<div class="cart-popup__body">';
    html += '<img src="' + data.image + '" alt="' + data.product_title + '" class="cart-popup__image" />';
    html += '<div class="cart-popup__details">';
    html += '<div class="cart-popup__name">' + data.product_title + '</div>';
    html += '<div class="cart-popup__variant">' + (data.variant_title.toLowerCase().indexOf('default title') > -1 ? '' : data.variant_title) + '</div>';
    html += '<div class="cart-popup__price">' + Haravan.formatMoney(data.price, shop.moneyFormat) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<a class="cart-popup__button" href="/cart">Xem giỏ hàng</a>';
    html += '</div>';
    $('body').append(html);
    $('.cart-popup').addClass('isShow');
    setTimeout(function () {
      $('.cart-popup').remove();
    }, 3000);
  },
  slug: function (str) {
    if (str) {
      str = str.toLowerCase();
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, '-');
      str = str.replace(/-+-/g, '-');
      str = str.replace(/^\-+|\-+$/g, '');
      return str;
    }
  },
  cartJS: function (callback) {
    var self = this;
    $.get('/cart.js', function (response) {
      window.cartJS = response;
      self.countItemsHeader();
      RF.MiniCart.render();
      if (typeof callback === 'function') {
        return callback(response);
      }
    });
  },
  validatePhone: function (phone) {
    var regex = /^0(96|97|98|32|33|34|35|36|37|38|39|90|93|70|71|71|76|77|78|79|91|94|81|82|83|84|85|86|87|88|89|99|92|56|58|95|55)[0-9]{7}$/;
    if (regex.test(phone)) {
      return true;
    }
    return false;
  },
  isVietnamesePhoneNumber: function (number) {
    return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
  },
  openLoading: function (callback) {
    $('.loading-ovl').addClass('open');
    if (typeof callback === 'function') {
      return callback();
    }
  },
  removeLoading: function (callback) {
    $('.loading-ovl').removeClass('open');
    if (typeof callback === 'function') {
      return callback();
    }
  },
  toastShow: function (mess) {
    var $toast = $('.toast');
    var textWarning = mess;
    $toast.find('.toast-body').text(textWarning);
    new bootstrap.Toast($toast[0]).show();
  },
  getTokenCheckout: function (callback) {
    var self = this;
    $.get('/checkouts.js', function (response) {
      window.checkoutsJS = response;
      if (typeof callback === 'function') {
        return callback();
      }
    });
  },
  hiddenNavMobile: function () {
    //if($(window).width() < 992){
    var check = $('.size-list.show');
    if (check.length > 0) {
      check.parents('.swiper-initialized').find('.btn-nav').addClass('d-none');
    } else {
      $('.btn-nav.d-none').removeClass('d-none');
    }
    //}
  },
};
RF.RatingHome = {
  init: function () {
    var that = this;
    if ($('.swiper-homepage-customer-rating').length > 0) {
      that.render();
    }
  },
  dateG: function (dates) {
    const isoString = dates;
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formatted;
  },
  html: function (data) {
    var self = this;
    var htmlItem = '';
    var img = 'https://product.hstatic.net/1000290074/product/900099-1_2802c1857db24dc59444aab57b9e1504.jpg';
    var star = '<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3154 17.77L18.4954 21.5L16.8554 14.47L22.3154 9.74L15.1254 9.13L12.3154 2.5L9.50543 9.13L2.31543 9.74L7.77543 14.47L6.13543 21.5L12.3154 17.77Z" fill="#F3C63F"></path></svg>';
    data.map((item) => {
      var firstImage = img;
      var secondImage = img;
      var dateShow = self.dateG(item.created_at);
      htmlItem += '<div class="swiper-slide">';
      htmlItem += '<div class="product-loop" data-id-product="' + item.product.id + '">';
      htmlItem += '<div class="box-image">';
      htmlItem += '<a href="/products/' + item.product.handle + '" title="' + item.product.title + '" aria-label="' + item.product.title + '">';
      htmlItem += '<picture>';
      htmlItem += '<source media="(min-width: 992px)" data-srcset="' + firstImage + '">';
      htmlItem += '<source media="(max-width: 991px)" data-srcset="' + firstImage + '">';
      htmlItem += '<img class="lazyload" data-src="' + firstImage + '" alt="' + item.product.title + '">';
      htmlItem += '</picture>';
      htmlItem += '<picture>';
      htmlItem += '<source media="(min-width: 992px)" data-srcset="' + secondImage + '">';
      htmlItem += '<source media="(max-width: 991px)" data-srcset="' + secondImage + '">';
      htmlItem += '<img class="lazyload" data-src="' + secondImage + '" alt="' + item.product.title + '">';
      htmlItem += '</picture>';
      htmlItem += '</a>';
      htmlItem += '</div>';
      htmlItem += '<div class="box-review">';
      htmlItem += '<div class="title-review">' + item.product.title + '</div>';
      htmlItem += '<div class="des-review">' + item.content + '</div>';
      htmlItem += '<div class="detail-review">';
      htmlItem += '<div class="star-custom" data-rate="' + item.rate + '">';
      for (var i = 0; i < 5; i++) {
        htmlItem += star;
      }
      htmlItem += '</div>';
      htmlItem += '<div class="detail-created"><span>' + dateShow + '</span><span>-</span><span>bởi: ' + item.customer.name + '</span></div>';
      htmlItem += '</div>';
      htmlItem += '</div>';
      htmlItem += '</div>';
      htmlItem += '</div>';
    });

    return htmlItem;
  },
  render: function () {
    var self = this;
    var id = $('.swiper-homepage-customer-rating').attr('data-id');
    var url = 'https://customer-reviews-api.haravan.app/api/buyer/product_rating?org_id=' + shop.id + '&product_id=' + id + '&page=1&limit=20';
    $.get(url, function (response) {
      if (response.list_ratings.length > 0) {
        var items = self.html(response.list_ratings);
        $('.swiper-homepage-customer-rating .swiper-wrapper').html(items);
        self.sliderReview();
      } else {
        $('.section-rating-homepage').hide();
      }
    });
  },
  sliderReview: function () {
    var mySwiper = new Swiper('.swiper-homepage-customer-rating', {
      spaceBetween: 10,
      slidesPerView: 2,
      loop: true,
      navigation: {
        nextEl: '.swiper-homepage-customer-rating .swiper-button-next',
        prevEl: '.swiper-homepage-customer-rating .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
        },
      },
    });
  },
};
RF.Cart = {
  init: function () {
    var that = this;
    that.toggleIcon();
    that.inputNumberClickNew();
    that.countWorkNote();
    that.noteKeyPress();
    that.cartInvoiceToggle();
    that.saveInvoice();
    that.checkoutProcess();
    that.renderCollectionCart();
    that.promotion.init();
    RF.Wishlist.initProduct();
  },
  dataPromotion: {},
  promotion: {
    init: function () {
      var that = this;
      that.open();
      that.action();
      that.api();
    },
    action: function () {
      var self = this;
      $('#form-discount input[type="text"]').on('input', function () {
        var value = $(this).val().trim();
        var button = $('#form-discount button');
        if (value) {
          button.addClass('actived');
        } else {
          button.removeClass('actived');
        }
      });
      $('#form-discount').submit(function (e) {
        e.preventDefault();
        $('.error-coupon').remove();
        var code = $('#form-discount input[type="text"]').val();
        if (code == '') {
          RF.Module.toastShow('Vui lòng nhập mã giảm giá');
        } else {
          RF.Module.openLoading(function () {
            self.applyVoucher(code, function () {
              self.handlePrice();
              RF.Module.toastShow('Áp dụng mã thành công');
              RF.Module.removeLoading();
            });
          });
        }
      });
      $(document).on('click', '.remove-code', function (e) {
        e.preventDefault();
        self.applyVoucher('', function () {
          self.handlePrice();
          RF.Module.toastShow('Đã xoá mã khuyến mãi');
        });
      });
      $(document).on('change', '.item-coupon input[name="voucher"]', function () {
        $('.apply-voucher').removeClass('disabled');
      });
      $('.apply-voucher').click(function (e) {
        e.preventDefault();
        var check = $('input[name="voucher"]').length;
        var code = $('input[name="voucher"]:checked').val();
        if (check == 0) {
          RF.Module.toastShow('Vui lòng chọn mã khuyến mãi');
        } else {
          self.applyVoucher(code, function () {
            self.handlePrice();
            $.fancybox.close();
            RF.Module.toastShow('Áp dụng mã thành công');
          });
        }
      });
      $(document).on('change', '#render-cus-promotion input[name="voucher"]', function () {
        var code = $(this).val();
        $('.status-voucher').removeClass('error').removeClass('success').addClass('d-none');
        RF.Module.openLoading(function () {
          self.applyVoucher(code, function () {
            self.handlePrice();
            //$.fancybox.close();
            RF.Module.removeLoading();
            //RF.Module.toastShow('Áp dụng mã thành công');
            $('.status-voucher').html('Áp dụng mã thành công').addClass('success').removeClass('d-none');
          });
        });
      });
    },
    handlePrice: function () {
      $('.item-promotion').remove();
      if (cartJS.items.length > 0) {
        var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M4.59 59.41a2 2 0 0 0 2.83 0L32 34.83l24.59 24.58a2 2 0 0 0 2.83-2.83L34.83 32 59.41 7.41a2 2 0 0 0-2.83-2.83L32 29.17 7.41 4.59a2 2 0 0 0-2.82 2.82L29.17 32 4.59 56.59a2 2 0 0 0 0 2.82z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';
        RF.Module.getTokenCheckout(function () {
          var checkouts = checkoutsJS.checkouts;
          if (checkouts.discount_allocations) {
            var html = '';
            checkouts.discount_allocations.map((item) => {
              html += '<div class="item-price-order item-promotion">';
              html += '<label>Khuyến mãi <span>' + item.code + '<p class="remove-code" data-code="' + item.code + '">' + closeIcon + '</p></span></label>';
              html += '<div class="price-promotion">-' + Haravan.formatMoney(item.savings * 100, shop.moneyFormat) + '</div>';
              html += '</div>';
            });
            $('.subtotal-price').after(html);
          }

          $('.price-subtotal').html(Haravan.formatMoney(checkouts.subtotal_price_original * 100, shop.moneyFormat));
          $('.price-totalprice span').html(Haravan.formatMoney(checkouts.total_price * 100, shop.moneyFormat));
        });
      } else {
        $('.price-subtotal, .price-totalprice span').html(Haravan.formatMoney(cartJS.total_price, shop.moneyFormat));
      }
    },
    open: function () {
      var self = this;
      $('.show-coupon').click(function () {
        if ($.isEmptyObject(self.dataPromotion)) {
          self.api(function () {
            $.fancybox.open($('#modal-promotion'), {
              touch: false,
            });
          });
        } else {
          $.fancybox.open($('#modal-promotion'), {
            touch: false,
          });
        }
      });
    },
    formatDateTime: function (dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    htmlItem: function (data) {
      var self = this;
      var html = '';
      //console.log(data.promotions);
      data.promotions.map((item, index) => {
        //console.log(item);
        //console.log(item.savings.size);
        if (item.take_type != 2 && item.code.indexOf('CTKM') == -1) {
          var timeend = item.enddate != null ? self.formatDateTime(item.enddate) : '∞';
          var saving = '';
          if (item.take_type == 2) {
            saving = 'Giảm ' + item.savings + '%';
          } else {
            saving = 'Tiết kiệm ' + Haravan.formatMoney(item.savings * 100, shop.moneyFormat);
          }

          var orderMin = item.order_over ? Haravan.formatMoney(item.order_over * 100, shop.moneyFormat) : 'Không yêu cầu';
          var conditionItems = `<li>Đơn hàng từ ${orderMin}</li>`;
          if (item.entitled_collections?.length > 0) {
            var collections = item.entitled_collections.map((c) => c.title).join(', ');
            conditionItems += `<li>Áp dụng cho: ${collections}</li>`;
          }

          html += '<label for="promotion-item-' + index + '" class="item-coupon">';
          html += '<div class="box-coupon">';
          html += item.code;
          html += '</div>';
          html += '<div class="box-detail">';
          html += '<div class="title-coupon">' + saving + '</div>';
          if (item.description != null) {
            html += '<div class="des-coupon">' + item.description + '</div>';
          }
          html += '<div class="condition-coupon">';
          html += '<ul>' + conditionItems + '</ul>';
          html += '</div>';
          html += '<div class="date-coupon">Thời hạn: ' + timeend + '</div>';
          if (item.take_type != 2) {
            html += '<input id="promotion-item-' + index + '" type="radio" name="voucher" value="' + item.code + '"/>';
          }
          html += '</div>';
          html += '</label>';
        }
      });
      return html;
    },
    checkLength: function () {
      var size = $('#render-cus-promotion .item-coupon').length;
      if (size == 1) {
        $('#render-cus-promotion').addClass('one-item');
      }
    },
    api: function (callback) {
      var self = this;
      $.ajax({
        url: '/promotions.json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          limit: 10,
          items: [],
        }),
        success: function (data) {
          self.dataPromotion = data;
          if (data.promotions) {
            var items = self.htmlItem(data);
            $('#render-cus-promotion').html(items).removeClass('d-none');
            self.checkLength();
          } else {
            //$('#render-cus-promotion').html('Hiện chưa có khuyến mãi nào đang diễn ra');
          }
          if (typeof callback === 'function') {
            return callback();
          }
        },
      });
    },
    applyVoucher: function (code, callback) {
      var self = this;
      var dataCoupon = {
        discount_code: code,
      };
      $.ajax({
        url: '/checkouts/discount.js',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(dataCoupon),
        success: function (result) {
          window.checkoutsJS = result;
          if (typeof callback === 'function') {
            return callback();
          }
        },
        error: function (request, status, errorThrown) {
          RF.Module.removeLoading();
          //RF.Module.toastShow('Coupon không hợp lệ hoặc đã hết hạn');
          $('.status-voucher').html('Coupon không hợp lệ hoặc đã hết hạn').addClass('error').removeClass('d-none');
        },
      });
    },
  },

  sliderCollectionCart: function () {
    var mySwiper = new Swiper('.swiper-cart-page', {
      spaceBetween: 10,
      slidesPerView: 2,
      slidesPerGroup: 2,
      loop: true,
      navigation: {
        nextEl: '.swiper-cart-page .swiper-button-next',
        prevEl: '.swiper-cart-page .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    });
  },
  renderCollectionCart: function () {
    var self = this;
    var $parent = $('.swiper-cart-page');
    if ($parent.length > 0) {
      var handle = $parent.attr('data-handle');
      RF.ProductLoop.collectionJS2(handle, 1, 20, function (response) {
        if (response.products) {
          var items = RF.ProductLoop.loopHtml(response, true, 'slider');
          $('.swiper-cart-page .swiper-wrapper').html(items);
          //RF.CustomerReviewLoop.init();
          self.sliderCollectionCart();
        }
      });
    }
  },

  checkoutProcess: function () {
    $('#checkout-process').click(function (e) {
      e.preventDefault();
      window.location.href = '/checkout';
    });
  },

  countWorkNote: function () {
    var noteLenght = $('#note-cart').val().length,
      max = 2000,
      total = max - noteLenght;
    $('.note-sidebar span').html(noteLenght + '/' + max);
  },
  noteKeyPress: function () {
    var self = this;
    $('#note-cart').on('keypress change', function () {
      self.countWorkNote();
    });
  },
  cartInvoiceToggle: function () {
    $(document).on('change', '.invoice__show input', function () {
      if ($(this).is(':checked')) {
        $('.invoice__form').slideDown();
      } else {
        $('.invoice__form').slideUp();
      }
    });
  },
  validateInvoice: function (callback) {
    var company = $('#company_name').val();
    var tax = $('#company_taxcode').val();
    var address = $('#company_address').val();
    var email = $('#company_email').val();
    if (company.trim() === '') {
      RF.Module.toastShow('Vui lòng nhập tên công ty');
      return false;
    }
    if (tax.trim() === '') {
      RF.Module.toastShow('Vui lòng nhập mã số thuế');
      return false;
    } else if (tax.length !== 10 || !/^\d+$/.test(tax)) {
      RF.Module.toastShow('Mã số thuế phải có đúng 10 chữ số');
      return false;
    }
    if (address.trim() === '') {
      RF.Module.toastShow('Vui lòng nhập địa chỉ công ty');
      return false;
    }
    if (email.trim() === '') {
      RF.Module.toastShow('Vui lòng nhập email');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      RF.Module.toastShow('Vui lòng nhập đúng định dạng email');
      return false;
    }
    return callback();
  },
  saveInvoice: function () {
    var self = this;
    $('#save-invoice').click(function () {
      self.validateInvoice(function () {
        var inv_at = cartJS.attributes || {};
        inv_at['bill_order_company'] = $('#company_name').val();
        inv_at['bill_order_tax_code'] = $('#company_taxcode').val();
        inv_at['bill_order_address'] = $('#company_address').val();
        inv_at['bill_email'] = $('#company_email').val();
        inv_at['bill_type'] = $('#company_type').val();
        $.ajax({
          type: 'post',
          url: '/cart/update.js',
          async: false,
          data: { attributes: inv_at, note: typeof $('#note-cart').val() !== 'undefined' && $('#note-cart').val().length > 0 ? $('#note-cart').val() : null },
          success: function (response) {
            cartJS = response;
            RF.Module.toastShow('Cập nhật thông tin hóa đơn thành công');
          },
          error: function () {
            RF.Module.toastShow('Vui lòng thử lại');
          },
        });
      });
    });
  },
  updateDefaultInvoice: function () {
    if (cartJS.attributes.bill_type == undefined) {
      var inv_at = window.cartJS.attributes || {};
      inv_at['bill_type'] = 'NONE';
      $.ajax({
        type: 'post',
        url: '/cart/update.js',
        async: false,
        data: { attributes: inv_at },
        success: function (data) {
          console.log('update bill_type default is none');
          window.cartJS = data;
        },
      });
    }
  },

  cartRender: {
    init: function () {
      var that = this;
      that.getInAdmin(function () {
        that.renderItems(function () {
          that.checkVariant();
        });
      });
      that.action();
    },
    checkVariant: function () {
      $('.main-cart .item-cart').each(function () {
        var $this = $(this);
        var $proId = parseInt($this.attr('data-product-id'));
        var $option1 = $this.find('.change-option0').val();
        var $items = cartJS.items.filter((item) => item.product_id == $proId);
        var variants = $items[0].fullInfo.variants;
        var listCurrent = variants.filter((item) => item.option1 == $option1);
        $this.find('.change-option1 option').each(function () {
          var $this2 = $(this);
          var $option2 = $this2.attr('value');
          var getCheck = listCurrent.filter((item) => item.option2 == $option2);
          if (getCheck.length > 0) {
            if (!getCheck[0].available) {
              $this2.attr('disabled', 'disabled').addClass('disabled');
            } else {
              $this2.removeAttr('disabled').removeClass('disabled');
            }
          }
        });
      });
    },
    checkOption1Change: function ($elm) {
      var self = this;
      var $oldId = $elm.attr('data-selected');
      var $loop = $elm.parents('.item-cart');
      var $proId = $loop.attr('data-product-id');
      var $option1 = $elm.val();
      var $option2 = $loop.find('.change-option1').val();
      var $items = cartJS.items.filter((item) => item.product_id == $proId);
      var variants = $items[0].fullInfo.variants;
      var listCurrent = variants.filter((item) => item.option1 == $option1);
      var check = listCurrent.filter((item) => item.option2 == $option2);
      if (check.length > 0) {
        if (!check[0].available) {
          RF.Module.toastShow('Màu ' + $option1 + ' và kích thước' + $option2 + ' hiện đã hết hàng!');
          $elm.val($oldId).prop('selected', true);
        } else {
          self.checkVariant();
        }
      }
    },
    action: function () {
      var self = this;
      $(document).on('change', '.item-cart .option-select .item-options .change-option0', function (e) {
        e.preventDefault();
        //self.checkOption1Change($(this));
        self.checkVariant();
      });
      $(document).on('change', '.item-cart .option-select .item-options .change-option1', function (e) {
        e.preventDefault();
        self.checkVariant();
      });
      $(document).on('click', '.item-cart .edit-variant', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $parent = $this.parents('.item-cart');
        $parent.addClass('open-edit');
      });
      $(document).on('click', '.item-cart .cancel-edit', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $parent = $this.parents('.item-cart');
        $parent.removeClass('open-edit');
        var oldOption1 = $parent.find('.change-option0').attr('data-selected');
        var oldOption2 = $parent.find('.change-option1').attr('data-selected');
        $parent.find('.change-option0').val(oldOption1).prop('selected', true);
        $parent.find('.change-option1').val(oldOption2).prop('selected', true);
        self.checkVariant();
      });
      $(document).on('click', '.item-cart .acept-edit', function (e) {
        e.preventDefault();
        var $this = $(this);
        RF.Module.openLoading(function () {
          var $parent = $this.parents('.item-cart');
          var $option1 = $parent.find('.change-option0 option:selected').attr('value');
          var $option2 = $parent.find('.change-option1 option:selected').attr('value');
          var $quantity = parseInt($parent.find('.input-quantity').val());
          var $proId = $parent.attr('data-product-id');
          var $proVarId = $parent.attr('data-variant-id');
          var $items = cartJS.items.filter((item) => item.product_id == $proId);
          var variants = $items[0].fullInfo.variants;
          var listCurrent = variants.filter((item) => item.option1 == $option1);
          var check = listCurrent.filter((item) => item.option2 == $option2);
          if (check.length > 0) {
            var data = check[0];
            if (data.available) {
              var find = cartJS.items.filter((item) => item.id == data.id);
              var post = { id: data.id, quantity: $quantity };
              if (find.length > 0) {
                var getPro = find[0].properties;
                if (!$.isEmptyObject(getPro)) {
                  post['properties'] = v.properties;
                }
              }
              self.updateLine(post, function () {
                var removeItems = {};
                removeItems[$proVarId] = 0;
                $.ajax({
                  type: 'POST',
                  url: '/cart/update.js',
                  data: { updates: removeItems },
                  success: function (data) {
                    location.reload();
                  },
                  error: function () {
                    RF.Module.removeLoading();
                    RF.Module.toastShow('Có lỗi xảy ra. Vui lòng thử lại');
                  },
                });
              });
            } else {
              RF.Module.removeLoading();
              RF.Module.toastShow('Lựa chọn của bạn tạm hết hàng. Vui lòng chọn thông số khác');
            }
          } else {
            RF.Module.removeLoading();
            RF.Module.toastShow('Có lỗi xảy ra. Vui lòng thử lại');
          }
        });
      });
    },
    updateLine: function (post, callback) {
      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: post,
        dataType: 'JSON',
        success: function (data) {
          if (typeof callback === 'function') {
            return callback();
          }
        },
        error: function () {
          RF.Module.removeLoading();
          RF.Module.toastShow('Sản phẩm bạn thêm vượt quá tồn khó. Vui lòng chọn thông số khác');
        },
      });
    },
    getInAdmin: function (callback) {
      if (cartJS.items.length > 0) {
        var cartItems = cartJS.items;
        var productInfos = cartItemsData;
        cartItems.forEach(function (item) {
          var matchedProduct = productInfos.find(function (p) {
            return p.id === item.product_id;
          });
          if (matchedProduct) {
            item.fullInfo = matchedProduct;
          }
        });
        cartJS.items = cartItems;
      }
      if (typeof callback === 'function') {
        return callback();
      }
    },
    renderItems: function (callback) {
      if (cartJS.items.length > 0) {
        var html = '';
        var no_img = 'https://file.hstatic.net/1000290074/file/no_image_available.jpg';
        var icon_minus = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 6.35 6.35" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M.794 2.91a.265.265 0 0 0 0 .53h4.762a.265.265 0 0 0 0-.53z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>',
          icon_plus = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M492 236H276V20c0-11.046-8.954-20-20-20s-20 8.954-20 20v216H20c-11.046 0-20 8.954-20 20s8.954 20 20 20h216v216c0 11.046 8.954 20 20 20s20-8.954 20-20V276h216c11.046 0 20-8.954 20-20s-8.954-20-20-20z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>',
          icon_wishlist =
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M378.667 21.333c-56.792 0-103.698 52.75-122.667 77.646-18.969-24.896-65.875-77.646-122.667-77.646C59.813 21.333 0 88.927 0 172c0 45.323 17.99 87.562 49.479 116.469a10.54 10.54 0 0 0 1.677 2.177l197.313 196.906c2.083 2.073 4.802 3.115 7.531 3.115s5.458-1.042 7.542-3.125L467.417 283.74l2.104-2.042c1.667-1.573 3.313-3.167 5.156-5.208a10.372 10.372 0 0 0 1.896-2.542C499.438 245.948 512 209.833 512 172c0-83.073-59.812-150.667-133.333-150.667zm80.156 240.615a9.929 9.929 0 0 0-.802 1.083c-1 1.146-2.094 2.156-3.177 3.188L255.99 464.927 68.667 277.979a10.706 10.706 0 0 0-2.479-3.177C37.677 249.906 21.333 212.437 21.333 172c0-71.313 50.24-129.333 112-129.333 61.063 0 113.177 79.646 113.698 80.448 3.938 6.083 14 6.083 17.938 0 .521-.802 52.635-80.448 113.698-80.448 61.76 0 112 58.021 112 129.333 0 33.604-11.313 65.552-31.844 89.948z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>',
          icon_delete =
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M424 64h-88V48c0-26.467-21.533-48-48-48h-64c-26.467 0-48 21.533-48 48v16H88c-22.056 0-40 17.944-40 40v56c0 8.836 7.164 16 16 16h8.744l13.823 290.283C87.788 491.919 108.848 512 134.512 512h242.976c25.665 0 46.725-20.081 47.945-45.717L439.256 176H448c8.836 0 16-7.164 16-16v-56c0-22.056-17.944-40-40-40zM208 48c0-8.822 7.178-16 16-16h64c8.822 0 16 7.178 16 16v16h-96zM80 104c0-4.411 3.589-8 8-8h336c4.411 0 8 3.589 8 8v40H80zm313.469 360.761A15.98 15.98 0 0 1 377.488 480H134.512a15.98 15.98 0 0 1-15.981-15.239L104.78 176h302.44z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M256 448c8.836 0 16-7.164 16-16V224c0-8.836-7.164-16-16-16s-16 7.164-16 16v208c0 8.836 7.163 16 16 16zM336 448c8.836 0 16-7.164 16-16V224c0-8.836-7.164-16-16-16s-16 7.164-16 16v208c0 8.836 7.163 16 16 16zM176 448c8.836 0 16-7.164 16-16V224c0-8.836-7.164-16-16-16s-16 7.164-16 16v208c0 8.836 7.163 16 16 16z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>',
          icon_edit =
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M4.76 18.81h.11l2.93-.27c.41-.04.79-.22 1.08-.51L19.94 6.97c.52-.52.81-1.21.81-1.94s-.29-1.42-.81-1.94l-.71-.71c-1.04-1.04-2.85-1.04-3.89 0l-1.41 1.41-9.64 9.64c-.29.29-.47.67-.5 1.08l-.27 2.93c-.03.37.1.73.36 1 .24.24.55.37.88.37zM17.29 3.07c.32 0 .64.12.88.37l.71.71a1.234 1.234 0 0 1 0 1.76l-.88.88-2.47-2.47.88-.88c.24-.24.56-.37.88-.37zM5.28 14.65c0-.06.03-.11.07-.15l9.11-9.12 2.47 2.47-9.11 9.11s-.1.07-.15.07l-2.63.24.24-2.63zM22.75 22c0 .41-.34.75-.75.75H2c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h20c.41 0 .75.34.75.75z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>';
        var icon_confirm =
          '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 520 520" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M79.423 240.755a47.529 47.529 0 0 0-36.737 77.522l120.73 147.894a43.136 43.136 0 0 0 36.066 16.009c14.654-.787 27.884-8.626 36.319-21.515L486.588 56.773a6.13 6.13 0 0 1 .128-.2c2.353-3.613 1.59-10.773-3.267-15.271a13.321 13.321 0 0 0-19.362 1.343q-.135.166-.278.327L210.887 328.736a10.961 10.961 0 0 1-15.585.843l-83.94-76.386a47.319 47.319 0 0 0-31.939-12.438z" data-name="7-Check" fill="#00e51c" opacity="1" data-original="#000000" class=""></path></g></svg>';
        var icon_notconfirm =
          '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 329.269 329" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill="#f44336"><path d="M21.34 329.398c-5.461 0-10.926-2.09-15.082-6.25-8.344-8.34-8.344-21.824 0-30.164L292.848 6.391c8.34-8.34 21.824-8.34 30.164 0 8.343 8.34 8.343 21.824 0 30.164L36.422 323.148a21.231 21.231 0 0 1-15.082 6.25zm0 0" fill="#f44336" opacity="1" data-original="#f44336" class=""></path><path d="M307.93 329.398c-5.461 0-10.922-2.09-15.082-6.25L6.258 36.555c-8.344-8.34-8.344-21.825 0-30.164 8.34-8.34 21.82-8.34 30.164 0l286.59 286.593c8.343 8.34 8.343 21.825 0 30.164-4.16 4.18-9.621 6.25-15.082 6.25zm0 0" fill="#f44336" opacity="1" data-original="#f44336" class=""></path></g></g></svg>';
        cartJS.items.map((item, index) => {
          var newIndex = index + 1;

          var options = '';
          if (item.fullInfo) {
            var productAdmin = item.fullInfo;
            var listOption1 = [];
            var listOption2 = [];
            productAdmin.variants.forEach(function (v) {
              if (v.option1 && listOption1.indexOf(v.option1) === -1) {
                listOption1.push(v.option1);
              }
              if (v.option2 && listOption2.indexOf(v.option2) === -1) {
                listOption2.push(v.option2);
              }
            });
            if (productAdmin.options) {
              productAdmin.options.map((option, index) => {
                var variants = index == 0 ? listOption1 : listOption2;
                var getCheck = item.variant_options[index];
                options += '<div class="item-options" data-value="' + option + '" data-index="' + index + '">';
                options += '<div class="head-option">' + option + '</div>';
                options += '<select data-selected="' + getCheck + '" class="change-option' + index + '">';
                variants.map((variant) => {
                  var selected = '';
                  if (getCheck == variant) {
                    selected = 'selected';
                  }
                  options += '<option ' + selected + ' value="' + variant + '">' + variant + '</option>';
                });
                options += '</select>';
                options += '</div>';
              });
              var confirmEdit = '';
              confirmEdit += '<div class="confirm-edit">';
              confirmEdit += '<button type="button" class="acept-edit">' + icon_confirm + '</button>';
              confirmEdit += '<button type="button" class="cancel-edit">' + icon_notconfirm + '</button>';
              confirmEdit += '</div>';
              options += confirmEdit;
            }
          }

          var optionCustom = '';
          optionCustom += '<div class="variant-title-info">';
          optionCustom += '<span class="name-variant">' + item.variant_title + '</span>';
          if (!item.fullInfo?.tags?.includes('quatang') && item.price > 0) {
            optionCustom += '<span class="edit-variant" title="Sửa">' + icon_edit + '</span>';
          }
          optionCustom += '</div>';
          optionCustom += '<div class="option-select">' + options + '</div>';

          html += '<div class="item-cart" data-variant-id="' + item.variant_id + '" data-id="' + item.id + '" data-product-id="' + item.product_id + '">';
          html += '<div class="box-product">';
          html += '<div class="box-img">';
          html += '<a href="' + item.url + '">';
          html += '<img src="' + (item.image != null ? item.image : no_img) + '" alt="' + item.title + '"/>';
          html += '</a>';
          html += '</div>';
          html += '<div class="box-title">';
          html += '<div class="title-info"><a href="' + item.url + '">' + item.title + '</a></div>';
          if ($(window).width() > 991) {
            html += optionCustom;
          }
          html += '</div>';
          html += '</div>';
          html += '<div class="box-info">';
          html += '<div class="title-info-mb"><a href="' + item.url + '">' + item.title + '</a></div>';
          html += '<div class="box-price">';
          var onSale = false;
          if (item.price_original > item.price) {
            onSale = true;
          }
          html += '<span class="price-sell">' + Haravan.formatMoney(item.price, shop.moneyFormat) + '</span>';
          if (onSale) {
            html += '<del class="compare-price">' + Haravan.formatMoney(item.price_original, shop.moneyFormat) + '</del>';
          }
          html += '</div>';

          if ($(window).width() < 992) {
            html += optionCustom;
          }

          if (!item.fullInfo?.tags?.includes('quatang') && item.price > 0) {
            html += '<div class="box-quantity">';
            html += '<div class="quantity-wrap">';
            html += '<button class="btn-minus">' + icon_minus + '</button>';
            html += '<input data-line="' + newIndex + '" name="updates[]" id="updates_' + item.id + '" value="' + item.quantity + '" minlength="1" maxlength="3" type="text" name="quantity" class="input-quantity">';
            html += '<button class="btn-plus">' + icon_plus + '</button>';
            html += '</div>';
            html += '</div>';

            html += '<div class="box-lineprice">';
            html += Haravan.formatMoney(item.line_price, shop.moneyFormat);
            html += '</div>';
          } else {
            html += `<div class="box-quantity">x ${item.quantity}</div>`;
          }

          html += '<div class="box-action">';
          if (!item.fullInfo?.tags?.includes('quatang')) {
            html += '<button class="wishlist-btn btn-wishlist" data-title="' + item.title + '" data-handle="' + item.handle + '">' + icon_wishlist + '</button>';
          }
          html += '<a href="/cart/change?line=' + newIndex + '&quantity=0" class="cart">';
          html += icon_delete;
          html += '</a>';
          html += '</div>';
          html += '</div>';
          html += '</div>';
        });
        if (html != '') {
          $('.main-cart').html(html);
          RF.Wishlist.checkWishlist();
          $('#checkout-process').removeClass('disabled');
        }
      }
      RF.Module.removeLoading();
      if (typeof callback === 'function') {
        return callback();
      }
    },
  },
  toggleIcon: function () {
    var self = this;
    $('.icon-pro g g g')
      .css({
        transform: 'matrix(1, 0, 0, 1, 0, 0)',
        opacity: 0,
      })
      .animate(
        { opacity: 1 },
        {
          duration: 1000,
          step: function (now, fx) {
            let tx = now * 800;
            $(this).css('transform', `matrix(1, 0, 0, 1, ${tx}, 0)`);
          },
          complete: function () {
            setTimeout(self.toggleIcon(), 200);
          },
        },
      );
  },
  inputNumberClickNew: function () {
    var self = this;
    $(document).on('click', '.quantity-wrap > button', function (e) {
      e.preventDefault();
      var $button = $(this);
      RF.Module.openLoading(function () {
        var $input = $button.siblings('.input-quantity');
        var inputVal = $($input).val() * 1;
        var quantityMax = $input.data('max') || 999999;
        var quantityMin = $input.data('min') || 1;
        var quantityUpdate = 1;
        if ($button.hasClass('btn-plus')) {
          if (inputVal >= quantityMax) {
            RF.Module.removeLoading();
            var $toast = $('.toast');
            $toast.find('.toast-body').text('BẠN ĐÃ MUA QUÁ SỐ LƯỢNG TỒN KHO');
            new bootstrap.Toast($toast[0]).show();
            return;
          } else {
            $input.removeClass('is-limited').val(inputVal + 1);
            quantityUpdate = inputVal + 1;
          }
        } else {
          if (inputVal == quantityMin) {
            RF.Module.removeLoading();
            return;
          } else {
            $input.removeClass('is-limited').val(inputVal - 1);
            quantityUpdate = inputVal - 1;
          }
        }
        $input.data('current', $input.val());
        var $inputQuantity = $button.parent().find('.input-quantity');
        var line = $inputQuantity.attr('data-line');
        self.updatePriceChange(line, quantityUpdate);
      });
    });
  },
  updatePriceChange: function (line, qty) {
    var params = {
      type: 'POST',
      url: '/cart/change.js',
      data: 'quantity=' + qty + '&line=' + line,
      dataType: 'json',
      success: function (data) {
        location.reload();
      },
      error: function () {
        RF.Module.removeLoading();
        var $toast = $('.toast');
        $toast.find('.toast-body').text('BẠN ĐÃ MUA QUÁ SỐ LƯỢNG TỒN KHO');
        new bootstrap.Toast($toast[0]).show();
        return;
      },
    };
    $.ajax(params);
  },
};
RF.ProductLoop = {
  init: function () {
    var that = this;
    that.switchOption1();
  },
  changeImage: function (product, option1, loop) {
    //console.log(product);
    //console.log(option1);
    var dataImages = [];
    if (product.media) {
      dataImages = product.media;
    } else if (product.custom_media) {
      dataImages = product.custom_media;
    }
    if (dataImages.length > 0) {
      console.log(option1);
      var images = dataImages.filter((item) => item.alt == option1);
      var img_front = '';
      var img_back = '';
      if (images.length > 0) {
        img_front = images[0].src;
        if (images.length > 1) {
          img_back = images[1].src;
        } else {
          img_back = images[0].src;
        }
      }
      var check = dataImages.filter((item) => item.alt == 'main ' + option1);
      if (check.length > 0) {
        img_front = check[0].src;
      }
      if (img_front != '' && img_back != '') {
        loop.find('.box-image a picture:nth-child(1) source').attr('srcset', img_front);
        loop.find('.box-image a picture:nth-child(1) img').attr('srcset', img_front);
        loop.find('.box-image a picture:nth-child(2) source').attr('srcset', img_back);
        loop.find('.box-image a picture:nth-child(2) img').attr('srcset', img_back);
      }
    } else {
      var getVariant = product.variants.filter((item) => item.option1 == option1);
    }
  },
  switchOption1: function () {
    var self = this;
    $(document).on('click', '.product-loop .list-variant .item-variant', function (e) {
      e.preventDefault();
      var $this = $(this);
      var $parent = $this.parents('.product-loop');
      var option1 = $this.attr('data-option1');
      var handle = $this.attr('data-handle');
      $('.product-loop .list-variant .item-variant[data-option1="' + option1 + '"][data-handle="' + handle + '"]').addClass('selected');
      $('.product-loop .list-variant .item-variant[data-option1!="' + option1 + '"][data-handle="' + handle + '"]').removeClass('selected');

      var $loop = $this.parents('.product-loop');
      var handle = $this.attr('data-handle');
      var data = productLoop[handle];
      if (data) {
        var color = option1;
        var variants = data.variants.filter((item) => item.option1 == color);
        var sizeList = $loop.find('.size-list');
        if (variants.length > 0) {
          self.changeImage(data, color, $parent);
          var html = '<li class="head-size-list">Thêm nhanh vào giỏ</li>';
          variants.map((item) => {
            html += '<li data-id="' + item.id + '" class="' + (!item.available ? 'disabled' : '') + '">' + item.option2 + '</li>';
          });
          if (html != '') {
            sizeList.html(html);
          }
        }
      }
    });
    $(document).on('click', '.addtocart-loop-quickbuy', function (e) {
      e.preventDefault();
      var $this = $(this);
      var $loop = $this.parents('.product-loop');
      var handle = $this.attr('data-handle');
      var data = productLoop[handle];
      if (data) {
        var color = $loop.find('.item-variant.selected').attr('data-option1');
        var variants = data.variants.filter((item) => item.option1 == color);
        var sizeList = $loop.find('.size-list');
        if (variants.length > 0) {
          var html = '<li class="head-size-list">Thêm nhanh vào giỏ</li>';
          variants.map((item) => {
            html += '<li data-id="' + item.id + '" class="' + (!item.available ? 'disabled' : '') + '">' + item.option2 + '</li>';
          });
          if (html != '') {
            sizeList.html(html);
          }
        }
        $this.parents('.custom-btn-loop').find('.size-list').toggleClass('show');
        RF.Module.hiddenNavMobile();
      }
    });
    $('.product-loop').on('mouseenter', function () {});
    $(document).on('mouseleave', '.product-loop', function () {
      var $this = $(this);
      $this.find('.size-list').removeClass('show');
      RF.Module.hiddenNavMobile();
    });
    $(document).on('click', '.product-loop .size-list li', function (e) {
      e.preventDefault();
      var $this = $(this);
      RF.Module.openLoading(function () {
        var $quantity = 1;
        var $id = $this.attr('data-id');
        var payload = { id: $id, quantity: $quantity };
        var param = {
          type: 'POST',
          url: '/cart/add.js',
          data: payload,
          success: function (response) {
            RF.Module.cartJS(function () {
              RF.Module.notiAddSuccess(response);
              RF.Module.removeLoading();
            });
          },
          error: function () {
            RF.Module.removeLoading();
            $this.parent().removeClass('show');
            RF.Module.toastShow('Số lượng bạn mua vượt quá tồn kho');
          },
        };
        $.ajax(param);
      });
    });
  },
  searchJS: function (post, callback) {
    $.ajax({
      type: 'POST',
      url: '/search.js',
      data: post,
      success: function (response) {
        if (typeof callback === 'function') return callback(response);
      },
      error: function () {},
    });
  },
  collectionJS: function (handle, callback) {
    $.ajax({
      url: '/collections/' + handle + '/products.json',
      success: function (response) {
        if (typeof callback === 'function') return callback(response);
      },
      error: function () {},
    });
  },
  collectionJS2: function (handle, page, limit, callback) {
    $.ajax({
      url: '/collections/' + handle + '/products.json?page=' + page + '&limit=' + limit,
      success: function (response) {
        if (typeof callback === 'function') return callback(response);
      },
      error: function () {},
    });
  },
  collectionJS3: function (handle, page, limit, sort, callback) {
    $.ajax({
      url: '/collections/' + handle + '/products.json?page=' + page + '&limit=' + limit + '&sort_by=' + sort,
      success: function (response) {
        if (typeof callback === 'function') return callback(response);
      },
      error: function () {},
    });
  },
  loopHtml: function (data, collectionJS, isSlider) {
    var list = data.products,
      htmlItem = '',
      noImage = 'https://file.hstatic.net/200000642007/file/loading-product_166be939a5b54a2aa4d9653d29b9b21d.jpg',
      btnAdd =
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="m87.7 33.1-.8-10.8C86 10.4 76 1 64 1s-22.1 9.4-22.9 21.3l-.8 10.8H28.8c-4.7 0-8.6 3.7-9 8.4l-5.4 75.9c-.2 2.5.7 5 2.4 6.8s4.1 2.9 6.6 2.9h81.3c2.5 0 4.9-1 6.6-2.9 1.7-1.8 2.6-4.3 2.4-6.8l-5.4-75.2c-.4-5.1-4.6-9-9.7-9H87.7zM47.1 22.7C47.7 13.9 55.1 7 64 7s16.3 6.9 16.9 15.7l.7 10.4H46.3zm55.2 19.9 5.4 75.2c.1.8-.2 1.6-.8 2.3-.6.6-1.4 1-2.2 1H23.4c-.8 0-1.6-.3-2.2-1s-.9-1.4-.8-2.3l5.4-75.9c.1-1.6 1.4-2.8 3-2.8h11.1l-.6 8c-.1 1.7 1.1 3.1 2.8 3.2h.2c1.6 0 2.9-1.2 3-2.8l.6-8.4h36.2l.6 8.4c.1 1.7 1.5 2.9 3.2 2.8s2.9-1.5 2.8-3.2l-.6-8h10.5c1.9 0 3.5 1.5 3.7 3.5z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>',
      eye =
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 511.999 511.999" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M508.745 246.041c-4.574-6.257-113.557-153.206-252.748-153.206S7.818 239.784 3.249 246.035a16.896 16.896 0 0 0 0 19.923c4.569 6.257 113.557 153.206 252.748 153.206s248.174-146.95 252.748-153.201a16.875 16.875 0 0 0 0-19.922zM255.997 385.406c-102.529 0-191.33-97.533-217.617-129.418 26.253-31.913 114.868-129.395 217.617-129.395 102.524 0 191.319 97.516 217.617 129.418-26.253 31.912-114.868 129.395-217.617 129.395z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M255.997 154.725c-55.842 0-101.275 45.433-101.275 101.275s45.433 101.275 101.275 101.275S357.272 311.842 357.272 256s-45.433-101.275-101.275-101.275zm0 168.791c-37.23 0-67.516-30.287-67.516-67.516s30.287-67.516 67.516-67.516 67.516 30.287 67.516 67.516-30.286 67.516-67.516 67.516z" fill="#000000" opacity="1" data-original="#000000"></path></g></svg>';
    var customStar = '<div class="hrv-product-reviews-star" data-score="0" data-number="5" title="Not rated yet!"><i data-alt="1" class="star-off-png" title="Not rated yet!" style="color: rgb(236, 186, 85);"></i>&nbsp;<i data-alt="2" class="star-off-png" title="Not rated yet!" style="color: rgb(236, 186, 85);"></i>&nbsp;<i data-alt="3" class="star-off-png" title="Not rated yet!" style="color: rgb(236, 186, 85);"></i>&nbsp;<i data-alt="4" class="star-off-png" title="Not rated yet!" style="color: rgb(236, 186, 85);"></i>&nbsp;<i data-alt="5" class="star-off-png" title="Not rated yet!" style="color: rgb(236, 186, 85);"></i></div>';
    var svg_icon_start = '<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 14.2275L13.635 17.025L12.405 11.7525L16.5 8.20502L11.1075 7.74752L9 2.77502L6.8925 7.74752L1.5 8.20502L5.595 11.7525L4.365 17.025L9 14.2275Z" fill="#F3C63F"></path></svg>';
    var classLoop = 'product-loop';

    list.map((product, i) => {
      if (product.available) {
        productLoop[product.handle] = {};
        productLoop[product.handle] = product;

        var seenColors = new Set();
        var listColors = [];
        if (collectionJS === true) {
          var imageMapById = {};
          var imageMapByAlt = {};
          productLoop[product.handle].custom_media = [];
          productLoop[product.handle].custom_media = product.images;
          product.images.forEach((img) => {
            imageMapById[img.id] = img.src;
            if (img.alt) {
              imageMapByAlt[img.alt.trim().toLowerCase()] = img.src;
            }
          });
          product.variants.forEach((v) => {
            var featuredImage = imageMapById[v.image_id] || imageMapByAlt[v.option1.trim().toLowerCase()] || null;
            if (!seenColors.has(v.option1)) {
              seenColors.add(v.option1);
              listColors.push({
                ...v,
                featured_image: featuredImage,
                handle: product.handle,
              });
            }
          });
        } else {
          listColors = product.variants
            .filter((v) => !seenColors.has(v.option1) && seenColors.add(v.option1))
            .map((v) => ({
              ...v,
              handle: product.handle,
            }));
        }

        if (collectionJS == true) {
          product.url = '/products/' + product.handle;
          var listImages = product.images.map((img) => {
            return img.src;
          });
          product.images = listImages;
          product.price = Number(product.variants[0].price) * 100;
          product.compare_at_price = Number(product.variants[0].compare_at_price) * 100;
          product.variants[0].price = Number(product.variants[0].price) * 100;
          product.variants[0].compare_at_price = Number(product.variants[0].compare_at_price) * 100;
          if (product.image != null) {
            product.featured_image = product.image.src;
          } else {
            product.featured_image = null;
          }

          if (product.tags != null) {
            product.tags = product.tags.split(',');
          }
        }

        var firstImage = '',
          secondImage = '';

        var metafields = [];

        if (product.metafields != undefined) {
          if (product.metafields.length > 0) {
            metafields = product.metafields;
          }
        }

        var on_sale = false,
          compare_at_price = 0,
          price = product.variants[0].price,
          price_sale = 0;
        if (product.variants[0].compare_at_price > price) {
          on_sale = true;
          compare_at_price = product.variants[0].compare_at_price;
          var mathDiscount = ((compare_at_price - price) / compare_at_price) * 100;
          var result_sale = Math.round(mathDiscount);
          price_sale = result_sale;
        }

        var sold_out = true;
        if (product.available) {
          sold_out = false;
        }

        if (product.id == 1064230844) {
          //console.log(product);
        }

        var checkMain = '';
        var tempImg = '',
          tempImg2 = '';
        // if(shop.template == 'index'){
        if (collectionJS === true) {
          if (product.custom_media.length > 0) {
            tempImg = product.custom_media.filter((item) => item.alt != null && item.alt.indexOf('main') != -1);
            tempImg2 = product.custom_media.filter((item) => item.alt != null && item.alt.indexOf('icon') != -1);
            if (tempImg2.length > 0) {
              //console.log(product.handle);
            }
            if (tempImg.length > 0) {
              checkMain = tempImg[0].src;
            }
          }
        } else {
          if (product.media.length > 0) {
            tempImg = product.media.filter((item) => item.alt != null && item.alt.indexOf('main') != -1);
            tempImg2 = product.media.filter((item) => item.alt != null && item.alt.indexOf('icon') != -1);

            if (tempImg2.length > 0) {
              //console.log(product.handle);
            }
            if (tempImg.length > 0) {
              checkMain = tempImg[0].src;
            }
          }
        }
        // }
        if (checkMain != '') {
          firstImage = checkMain;
        } else {
          if (product.featured_image != '' && product.featured_image != null) {
            if (product.featured_image.indexOf('.jfif') == -1) {
              firstImage = Haravan.resizeImage(product.featured_image, sizeImg);
            } else {
              firstImage = product.featured_image;
            }
          } else {
            firstImage = noImage;
          }
        }

        if (product.images.length > 1) {
          if (product.images[1].indexOf('.jfif') == -1) {
            secondImage = Haravan.resizeImage(product.images[1], sizeImg);
          } else {
            secondImage = product.images[1];
          }
        } else {
          if (product.featured_image != '' && product.featured_image != null) {
            if (product.featured_image.indexOf('.jfif') == -1) {
              secondImage = Haravan.resizeImage(product.featured_image, sizeImg);
            } else {
              secondImage = product.featured_image;
            }
          } else {
            secondImage = noImage;
          }
        }

        var check_gift = false;
        var label_new = false;
        var frame_label_loop = [];
        var quatang = false;
        if (product.tags != '' && product.tags != null) {
          if (product.tags.length > 0) {
            product.tags.map((tag) => {
              if (tag == 'new' || tag == 'New' || tag == 'NEW') {
                label_new = true;
              }
              if (tag == 'quatang') {
                quatang = true;
              }
            });
            frame_label_loop = window.frame_label.filter((obj) => product.tags.includes(obj.tag)).map((obj) => obj.icon);
          }
        }

        //console.log(frame_label_loop);
        if (price == 0) {
          check_gift = true;
        }

        var sold_qty = 0;
        if (product.sole_quantity) {
          sold_qty = product.sole_quantity;
          if (sold_qty >= 1000000) {
            sold_qty = Math.floor(sold_qty / 1000000);
            var sold_qty_2 = (sold_qty % 1000000).toString().charAt(0);
            if (sold_qty_2 !== '0') {
              sold_qty = sold_qty + '.' + sold_qty_2 + 'M';
            }
          } else if (sold_qty >= 1000) {
            sold_qty = Math.floor(sold_qty / 1000);
            var sold_qty_2 = (sold_qty % 1000).toString().charAt(0);
            if (sold_qty_2 !== '0') {
              sold_qty = sold_qty + '.' + sold_qty_2 + 'k';
            }
          }
        }

        if (isSlider == 'slider') {
          htmlItem += '<div class="swiper-slide">';
        }

        htmlItem += '<div class="product-loop" data-id-product="' + product.id + '">';
        htmlItem += '<div class="box-image">';

        htmlItem += '<div class="custom-rating-new">';
        htmlItem += '<div class="hrv-crv-container" data-hrvcrv-layout="star" data-product-id="' + product.id + '">';
        htmlItem += '<div class="hrv-crv-star-container">';
        htmlItem += '<div class="hrv-crv-star-groups">';
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += '</div>';
        htmlItem += '<div class="hrv-crv-star-total">(0)</div>';
        htmlItem += '</div>';
        htmlItem += '</div>';
        htmlItem += '</div>';

        htmlItem += '<div class="group-label">';
        if (on_sale) {
          htmlItem += '<div class="label-sale">-' + price_sale + '<small>%</small></div>';
        }
        if (label_new) {
          htmlItem += '<div class="label-new">Mới</div>';
        }
        htmlItem += '</div>';
        htmlItem += '<a href="' + product.url + '" title="' + product.title + '" aria-label="' + product.title + '">';
        htmlItem += '<picture>';
        htmlItem += '<source media="(min-width: 992px)" data-srcset="' + firstImage + '">';
        htmlItem += '<source media="(max-width: 991px)" data-srcset="' + firstImage + '">';
        htmlItem += '<img class="lazyload" data-src="' + firstImage + '" alt="' + product.title + '">';
        htmlItem += '</picture>';
        htmlItem += '<picture>';
        htmlItem += '<source media="(min-width: 992px)" data-srcset="' + secondImage + '">';
        htmlItem += '<source media="(max-width: 991px)" data-srcset="' + secondImage + '">';
        htmlItem += '<img class="lazyload" data-src="' + secondImage + '" alt="' + product.title + '">';
        htmlItem += '</picture>';
        if (frame_label_loop.length > 0) {
          htmlItem += '<div class="label_full"><img class="lazyload" data-src="' + frame_label_loop[0] + '" alt="' + product.title + '"/></div>';
        }
        htmlItem += '</a>';
        htmlItem += '</div>';
        htmlItem += '<div class="box-info">';
        htmlItem += '<h4>';
        htmlItem += '<a href="' + product.url + '">' + product.title + '</a>';
        htmlItem += '</h4>';
        htmlItem += '<div class="custom-rating d-none">';

        htmlItem += '<div class="hrv-crv-container" data-hrvcrv-layout="star" data-product-id="' + product.id + '">';
        htmlItem += '<div class="hrv-crv-star-container">';
        htmlItem += '<div class="hrv-crv-star-groups">';
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += svg_icon_start;
        htmlItem += '</div>';
        htmlItem += '<div class="hrv-crv-star-total">(0)</div>';
        htmlItem += '</div>';
        htmlItem += '</div>';

        htmlItem += '<div class="sole_quantity">Đã bán: ' + product.sole_quantity + '</div>';
        htmlItem += '</div>';
        htmlItem += '<div class="box-action">';

        if (!quatang) {
          htmlItem += '<div class="custom-btn-loop">';
          htmlItem += '<ul class="size-list">';
          htmlItem += '<li class="head-size-list">Thêm nhanh vào giỏ</li>';
          htmlItem += '<li data-id="" class="disabled">S</li>';
          htmlItem += '<li data-id="">X</li>';
          htmlItem += '<li data-id="">L</li>';
          htmlItem += '</ul>';
          htmlItem += '<div class="box-btn">';
          htmlItem += '<button class="addtocart-loop-quickbuy" data-handle="' + product.handle + '">' + btnAdd + '</button>';
          htmlItem += '</div>';
          htmlItem += '<div class="box-btn">';
          htmlItem += '<button class="addtocart-loop" data-handle="' + product.handle + '">' + eye + '</button>';
          htmlItem += '</div>';
          htmlItem += '</div>';
        }

        htmlItem += '<div class="box-price ' + (on_sale ? 'onsale' : '') + '">';
        htmlItem += '<span>' + Haravan.formatMoney(product.price, shop.moneyFormat) + '</span>';
        if (on_sale) {
          htmlItem += '<div class="label-sale-cus">-' + price_sale + '<small>%</small></div>';
          htmlItem += '<del>' + Haravan.formatMoney(product.compare_at_price, shop.moneyFormat) + '</del>';
        }
        htmlItem += '</div>';
        htmlItem += '</div>';

        if (listColors.length > 0) {
          htmlItem += '<div class="list-variant">';
          var color_active = false;
          listColors.map((item, index) => {
            var typeImgs = typeof item.featured_image;
            var imgTemp = '';
            var find_color = swatch_color.filter((swt) => swt.name == item.option1);
            var label_color = '';
            if (find_color.length > 0) {
              var temp_color = find_color[0];
              if (temp_color.type == 'image') {
                imgTemp = temp_color.icon;
              } else {
                label_color = '<span class="labe-color" style="background: ' + temp_color.code + '"></span>';
              }
            } else {
              if (item.featured_image != null) {
                if (typeImgs == 'object') {
                  imgTemp = item.featured_image.src;
                } else {
                  imgTemp = item.featured_image;
                }
              }
            }

            if (imgTemp != '' || label_color != '' || tempImg2 != '') {
              var actived = '';
              if (!color_active) {
                actived = 'selected';
                color_active = true;
              }
              htmlItem += '<div class="item-variant ' + actived + '" data-option1="' + item.option1 + '" data-handle="' + item.handle + '">';

              var checkColor = {};
              if (tempImg2.length > 0) {
                var textFind = 'icon ' + item.option1;
                checkColor = tempImg2.find((tempI) => {
                  if (!tempI.alt) return false;
                  if (tempI.alt.indexOf('icon') !== -1) {
                    //console.log(tempI.alt);
                    //console.log(textFind);
                    return tempI.alt === textFind;
                  }
                  return false;
                });
              }

              htmlItem += '<div class="inner-item-variant">';
              if (!$.isEmptyObject(checkColor)) {
                //console.log(product.title);
                var fix_img = Haravan.resizeImage(checkColor.src, sizeThumb);
                htmlItem += '<img class="lazyload" data-src="' + fix_img + '" alt="' + product.title + '" />';
              } else if (label_color != '') {
                htmlItem += label_color;
              } else {
                var fix_img = Haravan.resizeImage(imgTemp, sizeThumb);
                htmlItem += '<img class="lazyload" data-src="' + fix_img + '" alt="' + product.title + '" />';
              }
              htmlItem += '</div>';

              htmlItem += '<span class="color-name">' + item.option1 + '</span>';
              htmlItem += '</div>';
            }
          });
          htmlItem += '</div>';
        }

        htmlItem += '</div>';
        htmlItem += '</div>';

        if (isSlider == 'slider') {
          htmlItem += '</div>';
        }
      } // product.available
    });

    return htmlItem;
  },
  switchSort: function (sort) {
    var isSortt = '';
    switch (sort) {
      case 'price-ascending':
        isSortt = '(price:product=asc)';
        break;
      case 'price-descending':
        isSortt = '(price:product=desc)';
        break;
      case 'title-ascending':
        isSortt = '(title:product=asc)';
        break;
      case 'title-descending':
        isSortt = '(title:product=desc)';
        break;
      case 'created-ascending':
        isSortt = '(created_at:product=asc)';
        break;
      case 'created-descending':
        isSortt = '(created_at:product=desc)';
        break;
      case 'best-selling':
        isSortt = '(sold_quantity:product=desc)';
        break;
      case 'quantity-descending':
        isSortt = '(quantity:product=desc)';
        break;
    }
    return isSortt;
  },
};
RF.Global = {
  init: function () {
    var that = this;
    that.hotlineHeader();
    RF.ProductLoop.init();
    RF.Search.init();
    RF.Quickview.init();
    that.api();
    that.menuMobile();
    that.footerToggle();
    RF.FormBuyer.init();
    // RF.ModalFormBuyer.init();
    RF.FormAccount.inputPassword();
    that.newsLetter();
    RF.Menu.init();
    RF.MiniCart.init();
    that.iconFixed();
    that.scrollToTop();
    $(document).ajaxStop(function () {
      RF.CustomerReviewLoop.init();
    });
    RF.CookiesBox.init();
  },
  scrollToTop: function () {
    var $btn = $('#scrollToTopBtn');
    $(window).on('scroll', function () {
      if ($(this).scrollTop() > 300) {
        $btn.addClass('show');
      } else {
        $btn.removeClass('show');
      }
    });
    $btn.on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 200);
    });
  },
  iconFixed: function () {
    $('.main-button').click(function (e) {
      e.preventDefault();
      $('.circle-button').toggleClass('active');
      $('.main-button').toggleClass('active');
      $('.sub-button').toggleClass('show');
      if ($('.sub-buttons').hasClass('hide')) {
        $('.sub-buttons').removeClass('hide').addClass('show');
      } else {
        $('.sub-buttons').removeClass('show').addClass('hide');
      }
    });
    $('.livechat').hover(
      function () {
        $('.sub-button-tooltip').addClass('active');
      },
      function () {
        $('.sub-button-tooltip').removeClass('active');
      },
    );
  },
  hotlineHeader: function () {
    if ($(window).width() < 992) {
      $('#hotlineToggle').on('click', function (e) {
        e.stopPropagation();
        $('#hotlineDropdown').toggleClass('show');
      });
      $(document).on('click', function (e) {
        if (!$(e.target).closest('#hotlineDropdown').length && !$(e.target).closest('#hotlineToggle').length) {
          $('#hotlineDropdown').removeClass('show');
        }
      });
    }
  },
  newsLetter: function () {
    $('#newsletter-footer').submit(function (e) {
      if ($(this)[0].checkValidity() == true) {
        e.preventDefault();
        RF.Module.openLoading(function () {
          var email = $('#newsletter-footer input').val();
          grecaptcha.ready(function () {
            grecaptcha.execute('6LchSLkqAAAAABVHBpeFgg8N-WgkYsr5fO6GUF_s', { action: 'submit' }).then(function (token) {
              $.ajax({
                url: '/account/contact',
                method: 'POST',
                data: {
                  form_type: 'customer',
                  utf8: '✓',
                  contact: {
                    tags: 'Đăng ký nhận thông tin',
                    email: email,
                    first_name: 'Khách đăng ký nhận tin',
                  },
                  'g-recaptcha-response': token,
                  __RequestVerificationToken: shop.keyFormOmniContact,
                },
                success: function (response) {
                  /*RF.Module.toastShow('Quý khách đã đăng ký email thành công. Hệ thống reload sau 3s');
                  setTimeout(function(){
                    location.reload();
                  },3000);*/
                  $('#newsletter-footer').addClass('d-none');
                  $('.success-form').removeClass('d-none');
                  RF.Module.removeLoading();
                },
                error: function (xhr, status, error) {
                  RF.Module.toastShow('Thử lại sau');
                  RF.Module.removeLoading();
                },
              });
            });
          });
        });
      }
    });
  },
  menuMobile: function () {
    $(document).on('click', '.open-menu-mobile', function () {
      $('body').toggleClass('show-menu-mobile');
    });
    $(document).on('click', '.close-menu', function () {
      $('body').toggleClass('show-menu-mobile');
    });
    $(document).on('click', '#menu-mobile .sub1-menu-mb > li > h4 > .arrow-sub', function () {
      $(this).parents('.li-lv1').toggleClass('active');
    });
    $(document).on('click', '#menu-mobile .sub2-menu-mb > li > h4 > .arrow-sub', function () {
      $(this).parents('.li-lv2').toggleClass('active');
    });
  },
  api: function () {
    $.when($.getJSON('/cart.js'), $.getJSON('/account.js'))
      .done(function (cartData, accountData) {
        cartJS = cartData[0];
        accountJS = accountData[0];
        RF.MiniCart.render();
        if (shop.template == 'cart') {
          RF.Module.openLoading(function () {
            RF.Cart.cartRender.init();
            RF.Cart.promotion.handlePrice();
          });
        }
        if (shop.template == 'product') {
          RF.BuyXSelectY.getBuyXSelectY(productDetail.variants[0].id);
          RF.BuyXSelectY.init();
          RF.GiftPromotion.init();
        }
      })
      .fail(function () {
        console.error('Một trong hai API thất bại');
      });
  },
  footerToggle: function () {
    $('.title-footer').click(function () {
      var $this = $(this);
      if ($(window).width() < 992) {
        $this.toggleClass('active');
        $this.next().toggleClass('ishow');
      }
    });
  },
};
RF.Search = {
  keySuggest: '',
  proSuggest: [],
  allCollections: [],
  init: function () {
    var that = this;
    that.search();
    that.blur();
    that.renderHistory();
    that.mbOpen();
  },
  mbOpen: function () {
    $('.search-mb').on('click', function (e) {
      e.stopPropagation();
      $('body').toggleClass('open-search-mb').removeClass('show-detail-filter');
    });
    $('.search-header').on('click', function (e) {
      if ($(e.target).closest('.buy-loop').length === 0) {
        e.stopPropagation();
      }
    });
    $(document).on('click', function () {
      $('body').removeClass('open-search-mb');
    });
  },
  renderHistory: function () {
    var data = localStorage.getItem('searchKeywords');
    if (data != null) {
      data = JSON.parse(data);
      var html = '';
      data.map((key) => {
        html += '<a href="/search?q=' + key + '">' + key + '</a>';
      });
      $('.last-search').removeClass('d-none');
      $('.list-key').html(html);
    }
  },
  backBase: function () {
    var self = this;
    if (self.keySuggest == '') {
      $.get('/pages/get-data?view=keysuggest', function (data) {
        self.keySuggest = data;
        $('.render-key').html(data);
      });
    } else {
      $('.render-key').html(self.keySuggest);
    }
    if (self.proSuggest.length == 0) {
      var url = '/search.js';
      var query = '((collectionid:product=' + shop.proSuggest + '))';
      var data = {
        q: 'filter=' + query,
        type: 'product',
        page: 1,
        limit: 12,
      };
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (response) {
          self.proSuggest = response;
          if (response.total > 0) {
            var items = self.html(response);
            $('.render-search').html(items);
          } else {
            $('.render-search').html("<div class='text-center no-product'>Đang cập nhật sản phẩm</div>");
          }
        },
      });
    } else {
      var response = self.proSuggest;
      if (response.total > 0) {
        var items = self.html(response);
        $('.render-search').html(items);
      } else {
        $('.render-search').html("<div class='text-center no-product'>Đang cập nhật sản phẩm</div>");
      }
    }
  },
  html: function (data) {
    var html = '',
      svg =
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><path d="M16 17.82A6 6 0 0 1 10.11 13a1 1 0 0 1 1-1.15 1 1 0 0 1 1 .83 4 4 0 0 0 7.83 0 1 1 0 0 1 1-.83 1 1 0 0 1 1 1.15A6 6 0 0 1 16 17.82z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M24.9 31H7.1a3 3 0 0 1-3-3.15l.81-17.24a3 3 0 0 1 3-2.87h16.18a3 3 0 0 1 3 2.87l.81 17.24a3 3 0 0 1-3 3.15zM7.91 9.75a1 1 0 0 0-1 1l-.81 17.2a1 1 0 0 0 1 1.05h17.8a1 1 0 0 0 1-1.05l-.81-17.24a1 1 0 0 0-1-1z" fill="#000000" opacity="1" data-original="#000000"></path><path d="M22 8.75h-2V7a4 4 0 0 0-8 0v1.75h-2V7a6 6 0 0 1 12 0z" fill="#000000" opacity="1" data-original="#000000"></path></g></g></svg>';
    data.products.map((product) => {
      var img = Haravan.resizeImage(product.featured_image, sizeImg);
      var on_sale = false,
        compare_at_price = 0,
        price = product.variants[0].price,
        price_sale = 0;
      if (product.variants[0].compare_at_price > price) {
        on_sale = true;
        compare_at_price = product.variants[0].compare_at_price;
        var mathDiscount = ((compare_at_price - price) / compare_at_price) * 100;
        var result_sale = Math.round(mathDiscount);
        price_sale = result_sale;
      }
      var quatang = false;
      if (product.tags.includes('quatang')) {
        quatang = true;
      }
      html += '<div class="loop-search">';
      html += '<div class="box-img">';
      html += '<a href="' + product.url + '" aria-label="' + product.title + '">';
      html += '<img class="lazyload"';
      html += 'data-src="' + img + '"';
      html += 'alt="' + product.title + '" />';
      html += '</a>';
      html += '</div>';
      html += '<div class="box-info">';
      html += '<div class="box-title"><a href="' + product.url + '">' + product.title + '</a></div>';
      html += '<div class="box-price">';
      html += '<span>' + Haravan.formatMoney(price, shop.moneyFormat) + '</span>';
      if (on_sale) {
        html += '<del>' + Haravan.formatMoney(compare_at_price, shop.moneyFormat) + '</del>';
      }
      html += '</div>';
      html += '</div>';
      if (!quatang) {
        html += '<div class="box-buy">';
        html += '<div class="buy-loop" data-handle="' + product.handle + '">' + svg + '</div>';
        html += '</div>';
      }
      html += '</div>';
    });
    return html;
  },
  handleResult: function (key) {
    if (key == undefined) {
      $('.view-more-search').addClass('d-none');
    } else {
      $('.view-more-search').removeClass('d-none');
      $('.view-more-search a')
        .html('"' + key + '"')
        .attr('href', '/search?q=' + key);
    }
  },
  query: function (key) {
    var self = this;
    var url = '/search.js';
    var query = '(((title:product=' + key + '))||((title:product**' + key + '))||((barcode:product**' + key + '))||((sku:product**' + key + '))||((tag:product**' + key + ')))&&((price:product>0))&&((tag:product<>quatang))&&((available:product=true))';
    var data = {
      q: 'filter=' + query,
      type: 'product',
      page: 1,
      limit: 12,
    };
    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      success: function (response) {
        if (response.total > 0) {
          var items = self.html(response);
          $('.render-search').html(items);
          self.handleResult(key);
        } else {
          $('.render-search').html("<div class='text-center no-product'>Không tìm thấy sản phẩm phù hợp</div>");
          self.handleResult();
        }
      },
    });
  },
  loadCollections: function (callback) {
    var self = this;
    $.get('/collections', function (data) {
      var response = JSON.parse(data);
      var totalPages = parseInt(response.total);
      if (!isNaN(totalPages)) {
        for (let i = 2; i <= totalPages; i++) {
          $.get('/collections?page=' + i, function (res1) {
            var res = JSON.parse(res1);
            if (res.data && Array.isArray(res.data)) {
              self.allCollections = self.allCollections.concat(res.data);
              if (i === totalPages) {
                console.log('Hoàn tất tải tất cả collections:', self.allCollections);
                if (typeof callback === 'function') {
                  return callback();
                }
              }
            }
          });
        }
      } else {
        console.error('Không lấy được số trang hợp lệ từ response:', response);
      }
    });
  },
  handleKeySuggest: function () {
    var self = this;
    var data = self.allCollections;
    var key = $('#form-search input').val();
    var keyword = key.toLowerCase();
    var filtered = data.filter(function (item) {
      return item.title.toLowerCase().includes(keyword);
    });
    var html = '<a href="#" onclick="return false;">' + key + '</a>';
    if (filtered.length > 0) {
      filtered.forEach(function (item) {
        html += '<a href="/collections/' + item.handle + '">' + item.title + '</a>';
      });
    } else {
      html = '';
    }
    $('.render-key').html(html);
  },
  search: function () {
    var self = this;
    var typingTimer;
    var doneTypingInterval = 200;
    $('#form-search input').on('keyup', function () {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });
    $('#form-search input').on('keydown', function () {
      clearTimeout(typingTimer);
    });
    $('#form-search').submit(function (e) {
      e.preventDefault();
      var key = $('#form-search input').val().trim();
      if (!key) return;
      var keywords = JSON.parse(localStorage.getItem('searchKeywords')) || [];
      keywords = keywords.filter(function (k) {
        return k !== key;
      });
      keywords.unshift(key);
      if (keywords.length > 12) {
        keywords = keywords.slice(0, 12);
      }
      localStorage.setItem('searchKeywords', JSON.stringify(keywords));
      window.location.href = '/search?q=' + key;
    });
    function doneTyping() {
      var keyword = $('#form-search input').val();
      if (keyword != '') {
        self.query(keyword);
        if (self.allCollections.length == 0) {
          self.loadCollections(function () {
            self.handleKeySuggest();
          });
        } else {
          self.handleKeySuggest();
        }
      } else {
        self.backBase();
      }
    }
  },
  blur: function () {
    var self = this;
    var first = false;
    $('#form-search input').on('focus', function (e) {
      e.preventDefault();
      if (!first) {
        self.backBase();
        first = true;
      }
      $('#smart-search').addClass('opening');
    });
    $(document).on('click', function (e) {
      if (!$(e.target).closest('#form-search input').length && !$(e.target).closest('#smart-search').length) {
        $('#smart-search').removeClass('opening');
      }
    });
    $('.wrap-menu').on('mouseenter', function () {
      if ($('#smart-search.opening').length != 0) {
        $('#smart-search').removeClass('opening');
        $('#form-search input').blur();
      }
    });
    $('.store-headernew').on('mouseenter', function () {
      if ($('#smart-search.opening').length != 0) {
        $('#smart-search').removeClass('opening');
        $('#form-search input').blur();
      }
    });
  },
};
RF.Index = {
  init: function () {
    var that = this;
    that.sliderHome();
    that.renderCollection1();
    that.renderCollectionFlashsale();
    that.countDownTime();
    var handle1 = $('.collection-tab .head-tab li.active[data-tab="1"]').attr('data-handle');
    that.renderTabCollection(handle1, '.content-tab[data-tab="1"]', '.swiper-homepage-collection-tab-1');
    var handle2 = $('.collection-tab .head-tab li.active[data-tab="2"]').attr('data-handle');
    that.renderTabCollection(handle2, '.content-tab[data-tab="2"]', '.swiper-homepage-collection-tab-2');
    that.recentlyProduct.init();
    that.tabCollection();
    RF.RatingHome.init();
    that.sliderBlog();
    that.sliderBrand();
  },
  sliderHome: function () {
    var mySwiper = new Swiper('.swiper-homepage-slider', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#slider-homepage .swiper-button-next',
        prevEl: '#slider-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
  renderCollection1: function () {
    var self = this;
    var $parent = $('.swiper-homepage-collection-1');
    if ($parent.length > 0) {
      var handle = $parent.attr('data-handle');
      RF.ProductLoop.collectionJS2(handle, 1, 12, function (response) {
        if (response.products) {
          var items = RF.ProductLoop.loopHtml(response, true, 'slider');
          $('.swiper-homepage-collection-1 .swiper-wrapper').html(items);
          //RF.CustomerReviewLoop.init();
          self.sliderCollection1();
        }
      });
    }
  },
  renderCollectionFlashsale: function () {
    var self = this;
    var $parent = $('.swiper-homepage-flashsale');
    if ($parent.length > 0) {
      var handle = $parent.attr('data-handle');
      RF.ProductLoop.collectionJS2(handle, 1, 20, function (response) {
        if (response.products) {
          var items = RF.ProductLoop.loopHtml(response, true, 'slider');
          $('.swiper-homepage-flashsale .swiper-wrapper').html(items);
          //RF.CustomerReviewLoop.init();
          self.sliderCollection2();
        }
      });
    }
  },
  sliderCollection1: function () {
    var mySwiper = new Swiper('.swiper-homepage-collection-1', {
      spaceBetween: 10,
      slidesPerView: 2,
      loop: true,
      navigation: {
        nextEl: '.section-product-tab .swiper-button-next',
        prevEl: '.section-product-tab .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 3.5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 3.5,
        },
      },
    });
  },
  sliderCollection2: function () {
    var mySwiper = new Swiper('.swiper-homepage-flashsale', {
      spaceBetween: 10,
      slidesPerView: 2,
      slidesPerGroup: 2,
      loop: true,
      loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '#flashsale-homepage .swiper-button-next',
        prevEl: '#flashsale-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    });
  },
  countDownTime: function () {
    var autoFlashsale = shop.autoFlashsale;
    var element = document.getElementById('soon-espa');
    var time_start = $('#flashsale-homepage #soon-espa').attr('data-start');
    var time_end = $('#flashsale-homepage #soon-espa').attr('data-end');
    if (autoFlashsale) {
      var todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      var todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      time_start = todayStart.toISOString();
      time_end = todayEnd.toISOString();
    }
    console.log(time_start);
    var startRun = new Date(time_start).getTime();
    var endRun = new Date(time_end).getTime();
    var now = Date.now();
    function tick(milliseconds, startRun) {
      $('.label-countdown').html('Bắt đầu trong');
    }
    function tick2(milliseconds, endRun) {
      if (milliseconds == 0) {
        $('.label-countdown').html('Chương trình đã kết thúc');
      } else {
        $('.label-countdown').html('Thời gian còn lại');
      }
    }
    function complete() {
      Soon.destroy(element);
      Soon.create(element, {
        due: time_end,
        now: null,
        layout: 'group label-small',
        face: 'slot',
        format: 'd,h,m,s',
        labelsYears: null,
        labelsDays: 'Ngày',
        labelsHours: 'Giờ',
        labelsMinutes: 'Phút',
        labelsSeconds: 'Giây',
        separateChars: true,
        scaleMax: 's',
        separator: ':',
        singular: true,
        padding: true,
        eventTick: tick2,
        eventComplete: function () {
          $('.label-countdown').html('Chương trình đã kết thúc');
        },
      });
    }
    Soon.create(element, {
      due: time_start,
      now: null,
      layout: 'group label-small',
      face: 'slot',
      format: 'd,h,m,s',
      labelsYears: null,
      labelsDays: 'Ngày',
      labelsHours: 'Giờ',
      labelsMinutes: 'Phút',
      labelsSeconds: 'Giây',
      separateChars: true,
      scaleMax: 's',
      separator: ':',
      singular: true,
      padding: true,
      eventTick: tick,
      eventComplete: complete,
    });
  },
  sliderCollectionTab: function ($elment) {
    var mySwiper = new Swiper($elment, {
      spaceBetween: 10,
      slidesPerView: 2,
      slidesPerGroup: 2,
      loop: true,
      loopFillGroupWithBlank: true,
      navigation: {
        nextEl: $elment + ' .swiper-button-next',
        prevEl: $elment + ' .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    });
  },
  sliderCollectionTabPreview: function () {
    var mySwiper = new Swiper('.swiper-homepage-collection-tab-preview', {
      spaceBetween: 10,
      slidesPerView: 2,
      slidesPerGroup: 2,
      loop: true,
      loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '.swiper-homepage-collection-tab-preview .swiper-button-next',
        prevEl: '.swiper-homepage-collection-tab-preview .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    });
  },
  renderTabCollection: function (handle, $parent, $slider) {
    var self = this;
    RF.ProductLoop.collectionJS2(handle, 1, 20, function (response) {
      if (response.products) {
        var items = RF.ProductLoop.loopHtml(response, true, 'slider');
        $($parent + ' .swiper-wrapper').html(items);
        //RF.CustomerReviewLoop.init();
        self.sliderCollectionTab($slider);
        self.handleBtnViewAll($parent, handle);
      }
    });
  },
  handleBtnViewAll: function ($parent, $handle) {
    $($parent)
      .parent()
      .find('.view-more-loop a')
      .attr('href', '/collections/' + $handle);
  },
  tabCollection: function () {
    var self = this;
    $('.head-tab li').click(function () {
      var tab = $(this).attr('data-tab');
      var handle = $(this).attr('data-handle');
      $('.head-tab li[data-tab="' + tab + '"][data-handle="' + handle + '"]').addClass('active');
      $('.head-tab li[data-tab="' + tab + '"][data-handle!="' + handle + '"]').removeClass('active');
      self.renderTabCollection(handle, '.content-tab[data-tab="' + tab + '"]', '.swiper-homepage-collection-tab-' + tab);
    });
  },
  recentlyProduct: {
    init: function () {
      if (localStorage.getItem('viewed_products_handle') != null) {
        this.render();
      } else {
        this.renderNormal();
      }
    },
    renderNormal: function () {
      var self = this;
      var $parent = $('.swiper-homepage-collection-tab-preview');
      if ($parent.length > 0) {
        var handle = $parent.attr('data-handle');
        RF.ProductLoop.collectionJS2(handle, 1, 20, function (response) {
          if (response.products) {
            var items = RF.ProductLoop.loopHtml(response, true, 'slider');
            $('.swiper-homepage-collection-tab-preview .swiper-wrapper').html(items);
            //RF.CustomerReviewLoop.init();
            RF.Index.sliderCollectionTabPreview();
          }
        });
      }
    },
    render: function () {
      var self = this;
      var viewedProducts = JSON.parse(localStorage.getItem('viewed_products_handle'));
      if (viewedProducts.length > 20) {
        viewedProducts = viewedProducts.slice(0, 20);
      }
      if (viewedProducts.length > 0) {
        var listHandle = viewedProducts;
        var query = '((handle:product in ' + listHandle + '))&&((available:product=true))&&((price:product>0))';
        var data = {
          q: 'filter=' + query,
          type: 'product',
          page: 1,
          limit: 20,
        };
        RF.ProductLoop.searchJS(data, function (response) {
          if (response.total > 0) {
            var items = RF.ProductLoop.loopHtml(response, false, 'slider');
            $('.swiper-homepage-collection-tab-preview .swiper-wrapper').html(items);
            //RF.CustomerReviewLoop.init();
            RF.Index.sliderCollectionTabPreview();
          }
        });
      }
    },
  },
  sliderBlog: function () {
    new Swiper('.swiper-blog-homepage', {
      spaceBetween: 0,
      slidesPerView: 1,
      loop: true,
      navigation: {
        nextEl: '.swiper-blog-homepage .swiper-button-next',
        prevEl: '.swiper-blog-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 3,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 2,
        },
      },
    });
  },
  sliderBrand: function () {
    new Swiper('.swiper-brand-homepage', {
      spaceBetween: 10,
      slidesPerView: 2,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-brand-homepage .swiper-button-next',
        prevEl: '.swiper-brand-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 3,
        },
      },
    });
  },
};
RF.Collection = {
  init: function () {
    var that = this;
    that.checkDefaultSort();
    that.btnFilter();
    that.sliderRange();
    that.showSort();
    that.filter.init();
    if ($('#slider-homepage').length > 0) {
      that.sliderHome();
    }
  },
  sliderHome: function () {
    /*1340: {
          slidesPerView: 1.1,
          spaceBetween: 10,
          centeredSlides: true
        }
        */
    var mySwiper = new Swiper('.swiper-homepage-slider', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '#slider-homepage .swiper-button-next',
        prevEl: '#slider-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
  btnFilter: function () {
    $('.list-btn-filter .btn-filter').click(function () {
      var $this = $(this);
      var type = $this.attr('data-open');
      $('.list-btn-filter .btn-filter[data-open!="' + type + '"]').removeClass('active');
      $('.list-btn-filter .btn-filter[data-open="' + type + '"]').toggleClass('active');
      if (type != 'all') {
        $('.list-optional-filter').removeClass('show-all');
        $('body').removeClass('show-all-filter');
        $('.list-optional-filter .item-filter[data-open="' + type + '"]').toggleClass('detail-filter');
        $('.list-optional-filter .item-filter[data-open!="' + type + '"]').removeClass('detail-filter');

        if ($('.list-optional-filter .item-filter').hasClass('detail-filter')) {
          $('body').addClass('show-detail-filter');
        } else {
          $('body').removeClass('show-detail-filter');
        }
      } else {
        $('.list-optional-filter .item-filter').removeClass('detail-filter');
        $('body').removeClass('show-detail-filter');
        $('.list-optional-filter').toggleClass('show-all');
        $('body').toggleClass('show-all-filter');
      }
    });
    $('.bgFilter-total').click(function () {
      $('.list-btn-filter .btn-filter').removeClass('active');
      $('.list-optional-filter').removeClass('show-all');
      $('body').removeClass('show-all-filter');
    });
    $('.flt-fixbtn').click(function () {
      $('.list-btn-filter .btn-filter').removeClass('active');
      $('.list-optional-filter').removeClass('show-all');
      $('body').removeClass('show-all-filter');
    });
  },
  checkDefaultSort: function () {
    var value = varibleCollection.defaultSortBy;
    var $elment = $('.sort-by-content span[data-value="' + value + '"]');
    var $title = $elment.html();
    $('.show-sort').html($title);
    $elment.parent().addClass('active');
  },
  showSort: function () {
    $('.btn-sort').click(function (event) {
      event.stopPropagation();
      $(this).toggleClass('opened');
      $('.sort-by-content').slideToggle();
      $('.sort-collection').toggleClass('style-opened');
    });
    $(document).click(function () {
      $('.sort-by-content').slideUp();
      $('.sort-collection').removeClass('style-opened');
      $('.btn-sort').removeClass('opened');
    });
    $('.sort-by-content').click(function (event) {
      event.stopPropagation();
    });
  },
  sliderRange: function () {
    var self = this;
    $('#slider-range').slider({
      range: true,
      min: filterPrice.min,
      max: filterPrice.max,
      values: [filterPrice.min, filterPrice.max],
      step: 1000,
      slide: function (event, ui) {
        var minPrice = Haravan.formatMoney(ui.values[0] * 100, shop.moneyFormat);
        var maxPrice = Haravan.formatMoney(ui.values[1] * 100, shop.moneyFormat);

        $('#priceMin').val(minPrice);
        $('#priceMax').val(maxPrice);

        $('.text-show-price-l').html(minPrice).attr('data-price', ui.values[0]);
        $('.text-show-price-r').html(maxPrice).attr('data-price', ui.values[1]);
        $('input[name="price"]').val(ui.values[0] + '_' + ui.values[1]);
      },
      stop: function (event, ui) {
        if (!self.filter.filterPriced) {
          self.filter.filterPriced = true;
        }
      },
    });
    var firstPrice = $('#slider-range').slider('values', 0);
    var firstPrice2 = $('#slider-range').slider('values', 1);
    var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
    var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
    $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
    $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
    $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
  },
  filter: {
    isRenderPin: false,
    collPin: false,
    isFilter: false,
    limit: 30,
    gender: [],
    age: [],
    weight: [],
    category: [],
    type: [],
    color: [],
    material: [],
    pattern: [],
    price: [],
    currentPage: 1,
    sort: null,
    dataColl: varibleCollection,
    filterPriced: false,
    init: function () {
      var that = this;
      if ($(window).width() < 992) {
        that.limit = 6;
      }
      that.actionElement();
      that.checkUrl();
      that.scrollLoad();
      that.removeOptionFilter();
      that.actionType();
    },
    countFilter: function () {
      var items = $('.list-optional-filter li input:checked').length;
      $('.count-filter').html(items);
      if (items > 0) {
        $('.count-filter').removeClass('d-none');
      } else {
        $('.count-filter').addClass('d-none');
      }
    },
    checkActiveFilter: function () {
      var self = this;
      $('.btn-filter').removeClass('in-active');
      $('.item-filter input').each(function (e) {
        var $this = $(this);
        if ($this.is(':checked')) {
          var $parent = $this.parents('.item-filter');
          var $open = $parent.attr('data-open');
          $('.btn-filter[data-open="' + $open + '"]').addClass('in-active');
        }
      });
      if (self.filterPriced) {
        $('.btn-filter[data-open="price"]').addClass('in-active');
      }
    },
    buildPaginate2: function (number, limit) {
      var self = this;
      $('.pagi-ajax').addClass('d-none');
      limit = parseInt(limit);
      var math = Math.ceil(number / limit);
      var url = Arg.parse(window.location.href);
      var currentPage = self.currentPage ? self.currentPage : 1;
      if (url.page) {
        if (parseInt(url.page) > math) {
          currentPage = 1;
        } else {
          currentPage = parseInt(url.page);
        }
      }
      if (math > 1) {
        var pagi = '';
        var htmlPagi = self.pagination(currentPage, math, 'pagi-item', 'disabled');
        pagi += '<div class="pagination-custom-ajax d-flex align-items-center justify-content-lg-end justify-content-center">';
        pagi += '<span class="titlePagi">Tổng ' + math + ' Trang</span>';
        pagi += htmlPagi;
        pagi += '</div>';
        //$('.pagi-ajax').html(pagi).removeClass('d-none');
      } else {
        $('.pagi-ajax').html('').addClass('d-none');
      }
    },
    pagination: function (PageNumber, PageTotal, ClassName, DisableClassName) {
      var ReturnValue = '';
      var htmlPrev = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8 0.5L0.5 8L8 15.5" stroke="#868D95" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
      var htmlNext = '<svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M1 0.5L8.5 8L1 15.5" stroke="#2E2E2E" stroke-linecap="round" stroke-linejoin="round"/> </svg>';
      var TotalPages = PageTotal;
      var isPage = 3;
      if ($(window).width() < 991) {
        isPage = 1;
      }
      if (+PageNumber > 1) {
        if (+PageNumber == 2) {
          ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
        } else {
          ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="prev-pagi" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
        }
      } else {
        ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="prev-pagi ' + DisableClassName + '" data-page="' + (+PageNumber - 1) + '">' + htmlPrev + '</span></div>';
      }
      if (+PageNumber - isPage > 1) {
        ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="1">1</span></div><div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div>';
      }
      for (var i = +PageNumber - isPage; i <= +PageNumber; i++) {
        if (i >= 1) {
          if (+PageNumber != i) {
            ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
          } else {
            ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
          }
        }
      }
      for (var i = +PageNumber + 1; i <= +PageNumber + isPage; i++) {
        if (i <= TotalPages) {
          if (+PageNumber != i) {
            ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span data-page="' + i + '">' + i + '</span></div>';
          } else {
            ReturnValue = ReturnValue + '<div class="' + ClassName + ' pagiItem"><span class="active" data-page="' + i + '">' + i + '</span></div>';
          }
        }
      }
      if (+PageNumber + isPage < TotalPages) {
        ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="span-non">....</span></div><div class="' + ClassName + ' pagiItem"><span data-page="' + TotalPages + '">' + TotalPages + '</span></div>';
      }
      if (+PageNumber < TotalPages) {
        ReturnValue = ReturnValue + '<div class="' + ClassName + '"><span class="next-pagi" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
      } else {
        ReturnValue = ReturnValue + '<div class="' + ClassName + ' ' + DisableClassName + '"><span class="next-pagi ' + DisableClassName + '" data-page="' + (+PageNumber + 1) + '">' + htmlNext + '</span></div>';
      }
      return ReturnValue;
    },
    actionElement: function () {
      var self = this;
      $('.sort-by-content li').click(function (event) {
        event.stopPropagation();
        $('.sort-by-content').addClass('hasSort');
        $('.sort-by-content li').removeClass('active');
        $(this).addClass('active');
        self.buildParam();
      });
      $(document).on('click', '.pagi-ajax .prev-pagi:not(.disabled)', function (e) {
        var page = $(this).attr('data-page');
        var url = Arg.parse(window.location.href);
        if (page != undefined) url['page'] = page;
        var build_url = Arg.url(url);
        window.location = build_url;
      });
      $(document).on('click', '.pagi-ajax .next-pagi:not(.disabled)', function (e) {
        var page = $(this).attr('data-page');
        var url = Arg.parse(window.location.href);
        if (page != undefined) url['page'] = page;
        var build_url = Arg.url(url);
        window.location = build_url;
      });
      $(document).on('click', '.pagi-ajax .pagiItem:not(.disabled) span:not(.active)', function (e) {
        var page = $(this).attr('data-page');
        var url = Arg.parse(window.location.href);
        if (page != undefined) url['page'] = page;
        var build_url = Arg.url(url);
        window.location = build_url;
      });
      $(document).on('click', '.btn-filter-close, .btn-clear-filter, .back-normal', function (e) {
        e.preventDefault();
        var $this = $(this);
        $('.sort-by-content').removeClass('hasSort');
        $('.list-optional-filter .item-filter').removeClass('detail-filter');
        $('body').removeClass('show-detail-filter');
        $('.list-btn-filter .btn-filter').removeClass('active');
        $('.list-optional-filter').removeClass('show-all');
        $('body').removeClass('show-all-filter');
        var $parent = $this.parents('.item-filter');
        var $input = $parent.find('input');
        var $name = $input.attr('name');
        if ($this.hasClass('clear-all')) {
          $('.list-optional-filter .item-filter input').prop('checked', false);
          self.filterPriced = false;
          $('#slider-range').slider('values', 0, filterPrice.min);
          $('#slider-range').slider('values', 1, filterPrice.max);
          var firstPrice = $('#slider-range').slider('values', 0);
          var firstPrice2 = $('#slider-range').slider('values', 1);
          var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
          var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
          $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
          $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
          $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
          $('#priceMin').val(minPrice);
          $('#priceMax').val(maxPrice);
        } else {
          if ($name == 'price') {
            self.filterPriced = false;
            $('#slider-range').slider('values', 0, filterPrice.min);
            $('#slider-range').slider('values', 1, filterPrice.max);
            var firstPrice = $('#slider-range').slider('values', 0);
            var firstPrice2 = $('#slider-range').slider('values', 1);
            var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
            var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
            $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
            $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
            $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
            $('#priceMin').val(minPrice);
            $('#priceMax').val(maxPrice);
          } else {
            $input.prop('checked', false);
          }
        }
        self.buildParam();
      });
      $('.btn-filter-readmore').click(function (e) {
        e.preventDefault();
        $('.list-optional-filter .item-filter').removeClass('detail-filter');
        $('body').removeClass('show-detail-filter');
        $('.list-btn-filter .btn-filter').removeClass('active');
        $('.list-optional-filter').removeClass('show-all');
        $('body').removeClass('show-all-filter');
        self.buildParam();
      });
      $('.wrap-input-price input').focus(function () {
        var $this = $(this);
        var value = $this.val().replaceAll(',', '').replaceAll('đ', '');
        $this.val(value);
      });
      $('.wrap-input-price input').blur(function () {
        $(this).trigger('change');
      });
      $('#priceMin').on('change', function () {
        var minInput = $('#priceMin');
        var maxInput = $('#priceMax');
        var min = parseInt(minInput.val().replaceAll(',', '').replaceAll('đ', ''));
        var max = parseInt(maxInput.val().replaceAll(',', '').replaceAll('đ', ''));
        var minAttr = parseInt(minInput.attr('min')) || 0;
        if (min < minAttr) min = minAttr;
        if (min > max) {
          min = max;
          maxInput.val(Haravan.formatMoney(max * 100, shop.moneyFormat));
        }
        minInput.val(Haravan.formatMoney(min * 100, shop.moneyFormat));

        self.filterPriced = true;
        var getMinPrice = min;
        var getMaxPrice = max;
        $('#slider-range').slider('values', 0, getMinPrice);
        $('#slider-range').slider('values', 1, getMaxPrice);
        var firstPrice = $('#slider-range').slider('values', 0);
        var firstPrice2 = $('#slider-range').slider('values', 1);
        var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
        var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
        $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
        $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
        $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
      });
      $('#priceMax').on('change', function () {
        var minInput = $('#priceMin');
        var maxInput = $('#priceMax');
        var min = parseInt(minInput.val().replaceAll(',', '').replaceAll('đ', ''));
        var max = parseInt(maxInput.val().replaceAll(',', '').replaceAll('đ', ''));
        var maxAttr = parseInt(maxInput.attr('max')) || 1000000000;
        if (max > maxAttr) max = maxAttr;
        if (max < min) {
          max = min;
        }
        maxInput.val(Haravan.formatMoney(max * 100, shop.moneyFormat));

        self.filterPriced = true;
        var getMinPrice = min;
        var getMaxPrice = max;
        $('#slider-range').slider('values', 0, getMinPrice);
        $('#slider-range').slider('values', 1, getMaxPrice);
        var firstPrice = $('#slider-range').slider('values', 0);
        var firstPrice2 = $('#slider-range').slider('values', 1);
        var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
        var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
        $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
        $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
        $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
      });
    },
    reFillSort: function (value) {
      var $elment = $('.sort-by-content span[data-value="' + value + '"]');
      var $title = $elment.html();
      $('.value-sort span').html($title);
      $('.sort-by-content li').removeClass('active');
      $elment.parent().addClass('active');
    },
    removeOptionFilter: function () {
      var self = this;
      $(document).on('click', '.item-option svg', function (e) {
        e.preventDefault();
        var type = $(this).parent().attr('data-type');
        var value = $(this).parent().attr('data-value');
        if (type == 'price') {
          self.filterPriced = false;
          $('#slider-range').slider('values', 0, filterPrice.min);
          $('#slider-range').slider('values', 1, filterPrice.max);
          var firstPrice = $('#slider-range').slider('values', 0);
          var firstPrice2 = $('#slider-range').slider('values', 1);
          var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
          var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);
          $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
          $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
          $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
        } else {
          if ((value == 'Bé trai' || value == 'Bé gái') && type == 'category') {
            $('.filter-collection input[name="' + type + '"]').prop('checked', false);
          } else {
            $('.filter-collection input[name="' + type + '"][value="' + value + '"]').prop('checked', false);
          }
        }
        self.buildParam();
      });
    },
    renderOptionalFilter: function (ishow) {
      var self = this;
      $('.list-render-filter').addClass('d-none');
      $('.list-render-filter ul').empty();
      if (ishow) {
        var option = '';
        var gender = self.gender,
          age = self.age,
          weight = self.weight,
          category = self.category,
          type = self.type,
          color = self.color,
          material = self.material,
          pattern = self.pattern,
          price = self.price;
        var icon_x = '<svg class="cursor-pointer text-neutral-400 hover:opacity-70 ml-2 h-2.5 w-2.5" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L1 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-miterlimit="10"></path><path d="M1 1L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-miterlimit="10"></path></svg>';
        if (gender.length > 0) {
          gender.map((item) => {
            option += '<li class="item-option" data-type="gender" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (age.length > 0) {
          age.map((item) => {
            var getHtml = $('.filter-collection input[name="age"][value="' + item + '"]').attr('data-name');
            option += '<li class="item-option" data-type="age" data-value="' + item + '"><span class="name-option">' + getHtml + '</span>' + icon_x + '</li>';
          });
        }
        if (weight.length > 0) {
          weight.map((item) => {
            var getHtml = $('.filter-collection input[name="weight"][value="' + item + '"]').attr('data-name');
            option += '<li class="item-option" data-type="weight" data-value="' + item + '"><span class="name-option">' + getHtml + '</span>' + icon_x + '</li>';
          });
        }
        if (category.length > 0) {
          category.map((item) => {
            var getHtml = $('.filter-collection input[name="category"][value="' + item + '"]').attr('data-name');
            option += '<li class="item-option" data-type="category" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (type.length > 0) {
          type.map((item) => {
            option += '<li class="item-option" data-type="type" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (color.length > 0) {
          color.map((item) => {
            option += '<li class="item-option" data-type="color" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (material.length > 0) {
          material.map((item) => {
            option += '<li class="item-option" data-type="material" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (pattern.length > 0) {
          pattern.map((item) => {
            option += '<li class="item-option" data-type="pattern" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (price.length > 0) {
          price.map((item) => {
            option += '<li class="item-option" data-type="price" data-value="' + item + '"><span class="name-option">' + item + '</span>' + icon_x + '</li>';
          });
        }
        if (option != '') {
          var btnRemove = '<li class="last-item-option"><button class="btn-clear-filter clear-all">Xóa lọc</button></li>';
          $('.list-render-filter ul').html(option + btnRemove);
          $('.list-render-filter').removeClass('d-none');
        }
      }
    },
    checkUrl: function (selfPage = false) {
      var self = this;
      var $element = Arg.parse(window.location.href);
      var $collection = self.dataColl;
      self.gender = [];
      self.age = [];
      self.weight = [];
      self.category = [];
      self.type = [];
      self.color = [];
      self.material = [];
      self.pattern = [];
      self.price = [];
      self.sort = [];
      if ($element.page) {
        self.currentPage = $element.page;
      } else {
        self.currentPage = 1;
      }

      var checkPin = false;
      if (collection_pin != '') {
        if (collection_pin.indexOf(',') != -1) {
          var colPin = collection_pin.split(',');
          var tempCheck = colPin.filter((id) => id == $collection.id);
          if (tempCheck.length > 0) {
            checkPin = true;
          }
        } else {
          if ($collection.id == collection_pin) {
            checkPin = true;
          }
        }
      }
      self.collPin = checkPin;

      if (checkPin || $element.pattern || $element.gender || $element.age || $element.weight || $element.category || $element.type || $element.color || $element.material || $element.price || $element.sort) {
        if ($element.gender) {
          self.gender = $element.gender.includes(',') ? $element.gender.split(',') : [$element.gender];
          self.gender.map((item) => {
            $('input[name="gender"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.age) {
          self.age = $element.age.includes(',') ? $element.age.split(',') : [$element.age];
          self.age.map((item) => {
            $('input[name="age"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.weight) {
          self.weight = $element.weight.includes(',') ? $element.weight.split(',') : [$element.weight];
          self.weight.map((item) => {
            $('input[name="weight"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.category) {
          self.category = $element.category.includes(',') ? $element.category.split(',') : [$element.category];
          self.category.map((val) => {
            $('.filter-category input[type="radio"][value="' + val + '"]').prop('checked', true);
            $('.filter-category input[type="checkbox"][value="' + val + '"]').prop('checked', true);
          });
        }
        if ($element.type) {
          self.type = $element.type.includes(',') ? $element.type.split(',') : [$element.type];
          self.type.map((item) => {
            $('input[name="type"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.color) {
          self.color = $element.color.includes(',') ? $element.color.split(',') : [$element.color];
          self.color.map((item) => {
            $('input[name="color"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.material) {
          self.material = $element.material.includes(',') ? $element.material.split(',') : [$element.material];
          self.material.map((item) => {
            $('input[name="material"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.pattern) {
          self.pattern = $element.pattern.includes(',') ? $element.pattern.split(',') : [$element.pattern];
          self.pattern.map((item) => {
            $('input[name="pattern"][value="' + item + '"]').prop('checked', true);
          });
        }
        if ($element.price) {
          self.filterPriced = true;
          self.price.push($element.price);
          var getMinPrice = $element.price.includes('_') ? $element.price.split('_')[0] : $element.price;
          var getMaxPrice = $element.price.includes('_') ? $element.price.split('_')[1] : filterPrice.max;

          $('#slider-range').slider('values', 0, getMinPrice);
          $('#slider-range').slider('values', 1, getMaxPrice);
          var firstPrice = $('#slider-range').slider('values', 0);
          var firstPrice2 = $('#slider-range').slider('values', 1);
          var minPrice = Haravan.formatMoney($('#slider-range').slider('values', 0) * 100, shop.moneyFormat);
          var maxPrice = Haravan.formatMoney($('#slider-range').slider('values', 1) * 100, shop.moneyFormat);

          $('#priceMin').val(minPrice);
          $('#priceMax').val(maxPrice);

          $('.text-show-price-l').html(minPrice).attr('data-price', firstPrice);
          $('.text-show-price-r').html(maxPrice).attr('data-price', firstPrice2);
          $('input[name="price"]').val(firstPrice + '_' + firstPrice2);
        }
        if ($element.sort) {
          self.sort = $element.sort;
          self.reFillSort($element.sort);
        }
        self.isFilter = true;
        self.filterRender();
        self.renderOptionalFilter(true);
        self.checkActiveFilter();
      } else {
        self.isFilter = false;
        var sort = $('.sort-by-content li.active span').attr('data-value');
        if ($element.sort) {
          sort = $element.sort;
        }
        self.normalRender($collection.handle, self.currentPage);
        self.renderOptionalFilter(false);
      }
      self.countFilter();
    },
    buildParam: function () {
      var self = this;
      var gender = [],
        age = [],
        weight = [],
        category = [],
        type = [],
        color = [],
        material = [],
        pattern = [],
        price = [];
      var sort = $('.sort-by-content li.active span').attr('data-value');
      $('input[name="gender"]:checked').each(function () {
        var val = $(this).val();
        gender.push(val);
      });
      $('input[name="age"]:checked').each(function () {
        var val = $(this).val();
        age.push(val);
      });
      $('input[name="weight"]:checked').each(function () {
        var val = $(this).val();
        weight.push(val);
      });
      $('input[name="category"]:checked').each(function () {
        var val = $(this).val();
        category.push(val);
      });
      $('input[name="type"]:checked').each(function () {
        var val = $(this).val();
        type.push(val);
      });
      $('input[name="color"]:checked').each(function () {
        var val = $(this).val();
        color.push(val);
      });
      $('input[name="material"]:checked').each(function () {
        var val = $(this).val();
        material.push(val);
      });
      $('input[name="pattern"]:checked').each(function () {
        var val = $(this).val();
        pattern.push(val);
      });
      if (self.filterPriced) {
        price.push($('input[name="price"]').val());
      }
      var $element = Arg.parse(window.location.href);
      function setFilterValue(key, array, joinChar = ',') {
        $element[key] = array.length > 0 ? array.join(joinChar) : '';
      }
      setFilterValue('gender', gender);
      setFilterValue('age', age);
      setFilterValue('weight', weight);
      setFilterValue('category', category);
      setFilterValue('type', type);
      setFilterValue('color', color);
      setFilterValue('material', material);
      setFilterValue('pattern', pattern);
      setFilterValue('price', price, '');
      if ($('.sort-by-content').hasClass('hasSort')) {
        $element.sort = sort;
      } else {
        $element.sort = '';
      }

      var newUrl = Arg.url($element);
      window.history.replaceState('', '', newUrl);

      self.checkUrl();
    },

    actionType: function () {
      $(document).on('change', ".filter-category input[type='checkbox']", function () {
        if (!$(this).prop('checked')) {
          $(this).closest('li').find("input[type='checkbox']").prop('checked', false);
        }
      });
      $(document).on('click', '.arrow-svg', function (e) {
        e.stopPropagation();
        let $label = $(this).closest('label');
        $label.toggleClass('open');
      });
    },
    renderType: function () {
      var data = window.main_menu;
      var collection = varibleCollection;
      var targetHandle = collection.handle;
      function flattenMenu(data) {
        return data.reduce((acc, item) => {
          acc.push(item);
          if (item.sublv2) acc.push(...flattenMenu(item.sublv2));
          if (item.sublv3) acc.push(...flattenMenu(item.sublv3));
          return acc;
        }, []);
      }
      const flatMenu = flattenMenu(data);
      const foundItems = flatMenu.filter((i) => i.handle === targetHandle);
      return foundItems;
    },
    buildCheckedTree: function ($container) {
      function loop($ul) {
        let arr = [];
        $ul.children('li').each(function () {
          let $li = $(this);
          let $checkbox = $li.find('input[type="checkbox"], input[type="radio"]').first();
          if ($checkbox.length) {
            let node = {
              id: $checkbox.attr('id'),
              value: $checkbox.val(),
              checked: $checkbox.prop('checked'),
              children: [],
            };
            let $childUL = $li.children('ul').first();
            if ($childUL.length) {
              node.children = loop($childUL);
            }
            arr.push(node);
          }
        });
        return arr;
      }
      return loop($container);
    },
    getCheckedCategoryTree: function (tree) {
      let ids = [];
      function traverse(node) {
        if (node.checked) {
          ids.push(node.id);
        }
        if (node.children && node.children.length) {
          $.each(node.children, function (_, child) {
            traverse(child);
          });
        }
      }
      $.each(tree, function (_, node) {
        traverse(node);
      });
      return ids;
    },
    buildCategory: function () {
      var self = this;
      var treeData = self.buildCheckedTree($('ul.listing-item.filter-category'));
      var checkedIds = self.getCheckedCategoryTree(treeData);
      var queryCate = self.buildQueryCate(treeData);
      console.log(treeData);
      console.log(checkedIds);
      console.log(queryCate);
      return queryCate || '';
    },
    buildQueryCate: function (tree) {
      function parseLevel(nodes) {
        let levelParts = [];
        nodes.forEach((node) => {
          if (node.checked) {
            let current = `(tag:product=*${node.value})`;
            if (node.children && node.children.length) {
              let childQuery = parseLevel(node.children);
              if (childQuery) {
                current = `((${current})&&${childQuery})`;
              }
            }
            levelParts.push(current);
          }
        });
        return levelParts.length > 1 ? `(${levelParts.join('||')})` : levelParts[0] || '';
      }
      return parseLevel(tree);
    },

    query: function () {
      var self = this;
      var $collection = self.dataColl;
      var cid = shop.template == 'search' ? 0 : parseInt($collection.id);
      var q = cid !== 0 ? '((collectionid:product=' + cid + '))' : '((collectionid:product>0))';

      var checkCate = self.buildCategory();
      if (checkCate != '' && checkCate != undefined) {
        q += '&&' + '(' + checkCate + ')';
      }

      if (self.gender.length > 0) {
        var genderFQuery = self.gender.map((item) => '(tag:product=*' + item + ')').join('||');
        q += '&&' + '(' + genderFQuery + ')';
      }
      if (self.age.length > 0) {
        var ageFQuery = self.age.map((item) => '(variant:product contains ' + item + ')').join('||');
        q += '&&' + '(' + ageFQuery + ')';
      }
      if (self.weight.length > 0) {
        var weightFQuery = self.weight.map((item) => '(variant:product contains ' + item + ')').join('||');
        q += '&&' + '(' + weightFQuery + ')';
      }
      if (self.type.length > 0) {
        var typeFQuery = self.type.map((item) => '(product_type:product=' + item + ')').join('||');
        q += '&&' + '(' + typeFQuery + ')';
      }
      if (self.color.length > 0) {
        var colorFQuery = self.color.map((item) => '(tag:product=GR.COR/' + item + ')').join('||');
        q += '&&' + '(' + colorFQuery + ')';
      }
      if (self.material.length > 0) {
        var materialFQuery = self.material.map((item) => '(tag:product contains ' + item + ')').join('||');
        q += '&&' + '(' + materialFQuery + ')';
      }
      if (self.pattern.length > 0) {
        var patternFQuery = self.pattern.map((item) => '(tag:product contains ' + item + ')').join('||');
        q += '&&' + '(' + patternFQuery + ')';
      }
      if (self.price.length > 0) {
        var minPrice = $('.text-show-price-l').attr('data-price');
        var maxPrice = $('.text-show-price-r').attr('data-price');
        //var priceFQuery = '(price_variant:product range '+minPrice+'_'+maxPrice+')';
        var priceFQuery = '(price_variant:product>=' + minPrice + ')&&(price_variant:product<=' + maxPrice + ')';
        q += '&&' + '(' + priceFQuery + ')';
      }

      if (self.collPin) {
        q += '&&((tag:product<>top product))';
      }

      q += '&&((tag:product<>quatang))&&((available:product=true))';

      return '(' + q + ')';
    },
    filterRender: function (isPage, append = false) {
      var self = this;
      var query = self.query();
      var sort = $('.sort-by-content li.active span').attr('data-filter');
      var url = '/search.js';
      var limit = self.limit;
      var page = isPage != undefined ? isPage : self.currentPage;
      var data = {
        q: 'filter=' + query,
        type: 'product',
        page: page,
        limit: limit,
        sortby: sort,
      };
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (response) {
          if (response.total > 0) {
            var items = RF.ProductLoop.loopHtml(response, '', '');
            if (append) {
              $('.render-product').append(items).removeClass('empty-product');
            } else {
              $('.render-product').html(items).removeClass('empty-product');
            }

            //RF.CustomerReviewLoop.init();

            var math = Math.ceil(response.total / limit);
            if (math > self.currentPage) {
              $('.loadmore-ajax').removeClass('d-none');
            } else {
              $('.loadmore-ajax').addClass('d-none');
            }

            self.buildPaginate2(response.total, limit);
            try {
              ProductReviews.init();
            } catch (err) {}
          } else {
            $('.loadmore-ajax').addClass('d-none');
            $('.render-product').html("<div class='text-center no-product'><p>Không tìm thấy sản phẩm phù hợp. Thỏ vẫn còn rất nhiều đồ xinh mời ba mẹ chọn</p><div class='clear-all back-normal'>Quay lại</div></div>").addClass('empty-product');
          }

          if (self.collPin) {
            self.pinProduct();
            self.isRenderPin = true;
          }
        },
      });
    },
    normalRender: function (handle, page, append = false) {
      var self = this;
      var limit = self.limit;
      var $collection = self.dataColl;
      RF.ProductLoop.collectionJS2(handle, page, limit, function (response) {
        if (response.products.length > 0) {
          var items = RF.ProductLoop.loopHtml(response, true, '');
          if (append) {
            $('.render-product').append(items).removeClass('empty-product');
          } else {
            $('.render-product').html(items).removeClass('empty-product');
          }

          //RF.CustomerReviewLoop.init();

          var math = Math.ceil($collection.totalProduct / limit);
          if (math > self.currentPage) {
            $('.loadmore-ajax').removeClass('d-none');
          } else {
            $('.loadmore-ajax').addClass('d-none');
          }

          self.buildPaginate2($collection.totalProduct, limit);
          try {
            ProductReviews.init();
          } catch (err) {}
        } else {
          $('.loadmore-ajax').addClass('d-none');
          $('.render-product').html("<div class='text-center no-product'><p>Chưa cập nhật sản phẩm</p></div>").addClass('empty-product');
        }
      });
    },
    pinProduct: function () {
      var self = this;
      var $collection = self.dataColl;
      var cid = parseInt($collection.id);
      var query2 = self.query().replace('&&((tag:product<>top product))', '');
      var query = query2 + '&&((tag:product=top product))';
      var sort = $('.sort-by-content li.active span').attr('data-filter');
      var url = '/search.js';
      var limit = 5;
      var page = 1;
      var data = {
        q: 'filter=' + query,
        type: 'product',
        page: page,
        limit: limit,
        sortby: sort,
      };
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function (response) {
          if (response.total > 0) {
            var items = RF.ProductLoop.loopHtml(response, '', '');
            $('.render-product').prepend(items).removeClass('empty-product');
          }
        },
      });
    },
    scrollLoad: function () {
      var self = this;
      $('#btn-loadmore-ajax').click(function (e) {
        e.preventDefault();
        var $collection = self.dataColl;
        self.currentPage++;
        var page = self.currentPage;
        if (self.isFilter) {
          self.filterRender(page, true);
        } else {
          self.normalRender($collection.handle, page, true);
        }
      });
    },
  },
};
RF.Product = {
  init: function () {
    var that = this;
    that.swatch.init();
    that.quantityInput();
    that.actionBuy();
    that.collectionSwiper1();
    that.recentlyProduct.init();
    that.stockInventory.init();
    that.handleDescription();
    that.toggleTabPromotion();
    that.openSizechart();
    RF.Wishlist.initProduct();

    that.checkDisplayPromotion();
    that.actionTriggerDisplayPromotion();
    if ($(window).width() < 992) {
      that.fixedMobileBtn();
      that.actionMobileBtn();
    }
  },

  waitForThirdPartyContent: function (callback, timeout = 10000, interval = 200) {
    const startTime = Date.now();
    const checkInterval = setInterval(function () {
      if ($('.dlpm-hrvmodal--dialog').length > 0) {
        clearInterval(checkInterval);
        callback();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.warn('Timeout: .dlpm-row-header chưa xuất hiện');
      }
    }, interval);
  },
  checkDisplayPromotion: function () {
    var self = this;
    self.waitForThirdPartyContent(function () {
      $('.dlpm-hrvmodal--body .dlpm-mini--slide .dlpm-mini--row').each(function () {
        var $this = $(this);
        var flag = $this.find('.dlpm-label').html().trim();
        var flag_id = $this.find('.btn-hrvmodal-coupon').attr('data-id');
        $('.mini-voucher').each(function () {
          var $this2 = $(this);
          var flag2 = $this2.find('span').html().trim();
          if (flag == flag2) {
            $this2.attr('data-id', flag_id);
            $this2.addClass('cus-show-modal');
          }
        });
      });
    });
  },
  actionTriggerDisplayPromotion: function () {
    $(document).on('click', '.cus-show-modal', function (e) {
      e.preventDefault();
      var id = $(this).attr('data-id');
      $('.btn-detail.btn-hrvmodal-coupon[data-id="' + id + '"]').click();
    });
  },

  openSizechart: function () {
    $('.open-sizeguide').click(function () {
      const matchedTags = sizechart.filter((obj) => obj.tag && productDetail.tags.includes(obj.tag)).map((obj) => obj);
      if (matchedTags.length > 0) {
        var temp_img = matchedTags[0].img_dk;
        if ($(window).width() < 992) {
          temp_img = matchedTags[0].img_mb;
        }
        var img = '<img src="' + temp_img + '" alt="size chart"/>';
        $('#modal-size .wrap-size').html(img);
      } else {
        $('#modal-size .wrap-size').html('Đang cập nhật sizechart cho sản phẩm');
      }
      $.fancybox.open($('#modal-size'), {
        touch: false,
      });
    });
  },

  toggleTabPromotion: function () {
    $('.product-template .promotion-group .head-pro').click(function () {
      $(this).toggleClass('active');
    });
  },

  addClassBtn: function ($ele, $class, callback) {
    $($ele).addClass($class);
    return callback();
  },
  removeClassBtn: function ($ele, $class, callback) {
    $($ele).removeClass($class);
    return callback();
  },
  actionBuy: function () {
    var self = this;
    $(document).on('click', '.addtocart-detail', function (e) {
      e.preventDefault();
      var $this = $(this);
      RF.Module.openLoading(function () {
        var checkXY = $('#detail-product.d-none');
        if (checkXY.length == 0) {
          $('.new_input_xy:checked').parents('.wrapper-condition-inner').find('.buyxselecty-content--total button').click();
        } else {
          self.addClassBtn('.addtocart-detail', 'added', function () {
            var $quantity = $('.template-product .input-quantity').val();
            var $id = $('.template-product #product-select').val();
            var payload = { id: $id, quantity: $quantity };
            var properties = {};
            if (cartJS != null && cartJS.items.length > 0) {
              var exist_vid = cartJS.items.filter((item) => item.variant_id == $id);
              if (exist_vid.length > 0) {
                properties = exist_vid[0].properties;
              }
            }
            payload.properties = properties;

            var param = {
              type: 'POST',
              url: '/cart/add.js',
              data: payload,
              success: function (response) {
                self.removeClassBtn('.addtocart-detail', 'added', function () {
                  RF.Module.cartJS(function () {
                    RF.Module.notiAddSuccess(response);
                    RF.Module.removeLoading();
                  });
                });
              },
              error: function () {
                self.removeClassBtn('.addtocart-detail', 'added', function () {
                  RF.Module.toastShow('Số lượng bạn mua vượt quá tồn kho');
                  RF.Module.removeLoading();
                });
              },
            };
            $.ajax(param);
          });
        }
      });
    });
    $(document).on('click', '.buynow-detail', function (e) {
      e.preventDefault();
      var $this = $(this);
      RF.Module.openLoading(function () {
        var checkXY = $('#detail-product.d-none');
        if (checkXY.length == 0) {
          $('.new_input_xy:checked').parents('.wrapper-condition-inner').find('.buyxselecty-content--total button').click();
        } else {
          self.addClassBtn('.buynow-detail', 'added', function () {
            var $quantity = $('.template-product .input-quantity').val();
            var $id = $('.template-product #product-select').val();
            var payload = { id: $id, quantity: $quantity };
            var param = {
              type: 'POST',
              url: '/cart/add.js',
              data: payload,
              success: function (response) {
                self.removeClassBtn('.buynow-detail', 'added', function () {
                  window.location = '/cart';
                });
              },
              error: function () {
                self.removeClassBtn('.buynow-detail', 'added', function () {
                  RF.Module.toastShow('Số lượng bạn mua vượt quá tồn kho');
                  RF.Module.removeLoading();
                });
              },
            };
            $.ajax(param);
          });
        }
      });
    });
  },
  quantityInput: function () {
    var $input = $('.product-template .input-quantity');
    var min = 1;
    $('.product-template .btn-minus').on('click', function () {
      let current = parseInt($input.val()) || min;
      if (current > min) {
        $input.val(current - 1);
      }
    });
    $('.product-template .btn-plus').on('click', function () {
      let current = parseInt($input.val()) || min;
      $input.val(current + 1);
    });
    $input.on('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value === '' || parseInt(this.value) < min) {
        this.value = min;
      }
    });
  },

  actionMobileBtn: function () {
    $('#floating-buy-btn button').click(function (e) {
      e.preventDefault();
      var targetOffset = $('.product-template .info-column .group-action .addtocart-detail').offset().top;
      $('html, body').animate(
        {
          scrollTop: targetOffset - 500,
        },
        200,
      );
    });
    $('#trigger-buy-mb').click(function (e) {
      e.preventDefault();
      //$('.addtocart-detail').click();
      var targetOffset = $('.product-template .info-column .group-action .addtocart-detail').offset().top;
      $('html, body').animate(
        {
          scrollTop: targetOffset - 500,
        },
        200,
      );
    });
    $(document).on('change', '#float-button-cus .item-variant-cus input', function () {
      var color = $(this).val();
      $('.product-template .swatch-detail .item-variant input[value="' + color + '"]').click();
    });
  },
  fixedMobileBtn: function () {
    var $floatingBtn = $('body');
    var $targetBtn = $('.product-template .info-column .group-action .addtocart-detail');
    function toggleFloatingBtn() {
      if ($targetBtn.length === 0) return;
      var scrollTop = $(window).scrollTop();
      var windowHeight = $(window).height();
      var btnOffsetTop = $targetBtn.offset().top;
      var btnHeight = $targetBtn.outerHeight();
      var btnTopInView = btnOffsetTop >= scrollTop;
      var btnBottomInView = btnOffsetTop + btnHeight <= scrollTop + windowHeight;
      var isInViewport = btnTopInView && btnBottomInView;
      if (isInViewport) {
        $floatingBtn.removeClass('show-floating-btn');
      } else {
        $floatingBtn.addClass('show-floating-btn');
      }
    }
    $(window).on('scroll resize', toggleFloatingBtn);
    toggleFloatingBtn();
  },

  swatch: {
    _elm_color: '.product-template .swatch-detail .item-option[data-index="1"] .list-option',
    _elm_Option1Active: '.product-template .swatch-detail .item-option[data-index="1"] .list-option input[name="option1"]:checked',
    _elm_Option2Active: '.product-template .swatch-detail .item-option[data-index="2"] .list-option input[name="option2"]:checked',
    _elm_size: '.product-template .swatch-detail .item-option[data-index="2"] .list-option',
    _elm_gallery: '.product-template .slider-large .swiper-wrapper',
    _elm_gallery_thumb: '.product-template .slider-thumb .swiper-wrapper',
    _elm_swiper_thumb: '.product-template .slider-thumb',
    _elm_swiper_large: '.product-template .slider-large',
    _elm_thumb_nextEl: '.product-template .slider-thumb .swiper-button-next',
    _elm_thumb_prevEl: '.product-template .slider-thumb .swiper-button-prev',
    _elm_large_nextEl: '.product-template .btn-nav-large .swiper-button-next',
    _elm_large_prevEl: '.product-template .btn-nav-large .swiper-button-prev',
    _elm_input_option1: '.product-template .swatch-detail input[name="option1"]',
    _elm_input_option2: '.product-template .swatch-detail input[name="option2"]',
    _elm_product_select: '.product-template #product-select',
    _elm_product_price_wrap: '.product-template .price-detail',
    _elm_product_price: '.product-template .price-detail span',
    _elm_product_compare_price: '.product-template .price-detail del',
    _elm_product_labelsale: '.product-template .price-detail label',
    _elm_product_sku: '.product-template .sku-item span',
    _elm_product_addtocart: '.product-template .addtocart-detail',
    _elm_product_buynow: '.product-template .buynow-detail',
    data: productDetail ? productDetail : {},
    dataImages: productImages ? productImages : {},
    init: function () {
      var that = this;
      that.renderOption1();
      that.renderOption1Cus();
      that.actionElement();
    },
    slug: function (str) {
      if (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, '-');
        str = str.replace(/-+-/g, '-');
        str = str.replace(/^\-+|\-+$/g, '');
        return str;
      }
    },
    renderOption1: function () {
      var self = this;

      var product = self.data;

      if (product.tags.includes('combo')) {
        self.renderImage();
        self.renderInfo();
      } else {
        var seenColors = new Set();
        var result = product.variants
          .filter((v) => !seenColors.has(v.option1) && seenColors.add(v.option1))
          .map((v) => ({
            option1: v.option1,
            image: v.featured_image != null ? v.featured_image.src : null,
          }));
        if (result.length > 0) {
          var html = '';
          var isChecked = false;
          var params = new URLSearchParams(window.location.search);
          result.map((variant, index) => {
            var checked = '';
            var handleColor = self.slug(variant.option1);
            var available = product.variants.filter((item) => item.option1 == variant.option1 && item.available);
            if (handleColor == params.get('color')) {
              checked = 'checked="checked"';
              isChecked = true;
            } else {
              if (!isChecked && available.length > 0) {
                checked = 'checked="checked"';
                isChecked = true;
              }
            }

            var disabled = '';
            if (available.length == 0) {
              disabled = 'sold_out';
            }
            html += '<div class="item-variant ' + disabled + '">';
            html += '<input data-color="' + handleColor + '" ' + checked + ' id="option1-index-' + index + '" type="radio" value="' + variant.option1 + '" name="option1">';
            html += '<label for="option1-index-' + index + '">';
            html += '<div class="in-color">';

            if (product.options[0] == 'Màu sắc') {
              var find_color = swatch_color.filter((swt) => swt.name == variant.option1);
              var find_color_alt = '';
              if (!$.isEmptyObject(self.dataImages)) {
                var textFind = 'icon ' + variant.option1;
                find_color_alt = self.dataImages.find((item) => {
                  if (!item.color) return false;
                  if (item.color.indexOf('icon') !== -1) {
                    //console.log(item.color);
                    //console.log(textFind);
                    return item.color === textFind;
                  }
                  return false;
                });
              }
              //console.log(find_color_alt);
              if (find_color.length > 0) {
                var temp_color = find_color[0];
                if (temp_color.type == 'image') {
                  html += '<img class="lazyload" data-src="' + temp_color.icon + '" alt="' + variant.option1 + '"/>';
                } else {
                  html += '<span class="label-color" data-color="' + variant.option1 + '" style="background:' + temp_color.code + '"></span>';
                }
              } else {
                if (find_color_alt != undefined && find_color_alt != '') {
                  var fix_img = Haravan.resizeImage(find_color_alt.src, sizeThumb);
                  html += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
                } else {
                  if (variant.image != null) {
                    var fix_img = Haravan.resizeImage(variant.image, sizeThumb);
                    html += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
                  } else {
                    html += '<span class="label-color" data-color="' + variant.option1 + '"></span>';
                  }
                }
              }
            } else {
              html += '<span>' + variant.option1 + '</span>';
            }

            html += '</div>';
            html += '<span class="tooltip-color">' + variant.option1 + '</span>';
            html += '</label>';
            html += '</div>';
          });

          if (html != '') {
            $(self._elm_color).removeClass('effect-loading').html(html);
          }

          if (product.options.length > 1) {
            self.renderOption2();
          } else {
            self.renderImage();
            self.renderInfo();
          }
        }
      }
    },
    renderOption1Cus: function () {
      var self = this;
      var product = self.data;
      var seenColors = new Set();
      var result = product.variants
        .filter((v) => !seenColors.has(v.option1) && seenColors.add(v.option1))
        .map((v) => ({
          option1: v.option1,
          image: v.featured_image != null ? v.featured_image.src : null,
        }));
      if (result.length > 0) {
        var params = new URLSearchParams(window.location.search);
        var htmlCus = '';
        var isChecked2 = false;
        result.map((variant, index) => {
          var checked = '';
          var handleColor = self.slug(variant.option1);
          var available = product.variants.filter((item) => item.option1 == variant.option1 && item.available);
          if (handleColor == params.get('color')) {
            checked = 'checked';
            isChecked2 = true;
          } else {
            if (!isChecked2 && available.length > 0) {
              checked = 'checked';
              isChecked2 = true;
            }
          }
          var disabled = '';
          if (available.length == 0) {
            disabled = 'sold_out';
          }
          htmlCus += '<div class="item-variant-cus ' + disabled + '">';
          htmlCus += '<input data-color="' + handleColor + '" ' + checked + ' id="cus-option1-index-' + index + '" type="radio" value="' + variant.option1 + '" name="option1-cus">';
          htmlCus += '<label for="cus-option1-index-' + index + '">';
          htmlCus += '<div class="in-color">';
          if (product.options[0] == 'Màu sắc') {
            var find_color = swatch_color.filter((swt) => swt.name == variant.option1);
            var find_color_alt = '';
            if (!$.isEmptyObject(self.dataImages)) {
              var textFind = 'icon ' + variant.option1;
              find_color_alt = self.dataImages.find((item) => {
                if (!item.color) return false;
                if (item.color.indexOf('icon') !== -1) {
                  return item.color === textFind;
                }
                return false;
              });
            }
            if (find_color.length > 0) {
              var temp_color = find_color[0];
              if (temp_color.type == 'image') {
                htmlCus += '<img class="lazyload" data-src="' + temp_color.icon + '" alt="' + variant.option1 + '"/>';
              } else {
                htmlCus += '<span class="label-color" data-color="' + variant.option1 + '" style="background:' + temp_color.code + '"></span>';
              }
            } else {
              if (find_color_alt != undefined && find_color_alt != '') {
                var fix_img = Haravan.resizeImage(find_color_alt.src, sizeThumb);
                htmlCus += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
              } else {
                if (variant.image != null) {
                  var fix_img = Haravan.resizeImage(variant.image, sizeThumb);
                  htmlCus += '<img class="lazyload" data-src="' + fix_img + '" alt="' + variant.option1 + '"/>';
                } else {
                  htmlCus += '<span class="label-color" data-color="' + variant.option1 + '"></span>';
                }
              }
            }
          } else {
            htmlCus += '<span>' + variant.option1 + '</span>';
          }
          htmlCus += '</div>';
          htmlCus += '</label>';
          htmlCus += '</div>';
        });
      }
      if (htmlCus != '') {
        $('#float-button-cus ul').html(htmlCus);
        $('#float-button-cus').removeClass('d-none');
        $('#floating-buy-btn').addClass('d-none');
      }
    },
    renderOption2: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).val();
      var list = product.variants.filter((item) => item.option1 == option1Active);
      if (list.length > 0) {
        var html = '';
        var isChecked = false;
        var params = new URLSearchParams(window.location.search);
        list.map((variant, index) => {
          var checked = '';
          if (params.get('size') == variant.option2) {
            checked = 'checked';
            isChecked = true;
          } else {
            if (!isChecked && variant.available) {
              checked = 'checked';
              isChecked = true;
            }
          }
          var disabled = '';
          if (!variant.available) {
            disabled = 'sold_out';
          }
          html += '<div class="item-variant ' + disabled + '">';
          html += '<input ' + checked + ' id="option2-index-' + index + '" type="radio" value="' + variant.option2 + '" name="option2">';
          html += '<label for="option2-index-' + index + '">';
          html += '<span>' + variant.option2 + '</span>';
          html += '</label>';
          html += '</div>';
        });
        if (html != '') {
          $(self._elm_size).removeClass('effect-loading').html(html);
          self.renderImage();
          self.renderInfo();
        }
      }
    },
    isChange: false,
    renderImage: function () {
      var self = this;
      var product = self.data;
      var images = self.dataImages;
      var check = product.options[0];

      var colorChecked = $(self._elm_Option1Active).val();

      var imageSelect = images.filter((img) => img.color == colorChecked || img.color == 'main ' + colorChecked || img.color == 'icon ' + colorChecked);
      var imageNotSelect = images.filter((img) => img.color != colorChecked && img.color != 'main ' + colorChecked && img.color != 'icon ' + colorChecked);

      if (imageSelect.length > 0 && imageNotSelect.length > 0) {
        const merged = [...imageSelect, ...imageNotSelect];
        self.renderHtmlImage(merged);
      } else {
        if (!self.isChange) {
          /*var colorChecked = $(self._elm_Option1Active).val();
          if(colorChecked != undefined && colorChecked != ''){
            var dataRender = images.filter(img => img.color == colorChecked || img.color == ('main ' + colorChecked) || img.color == ('icon ' + colorChecked) );
  
            if(images.length == 1) dataRender = images;
            
            self.renderHtmlImage(dataRender);
          }
          else{
            self.renderHtmlImage(images);
          }*/
          self.renderHtmlImage(images);
        } else {
          if (check == 'Màu sắc') {
            var colorChecked = $(self._elm_Option1Active).val();
            var dataRender = images.filter((img) => img.color == colorChecked || img.color == 'main ' + colorChecked || img.color == 'icon ' + colorChecked);
            self.renderHtmlImage(dataRender);
          } else {
            self.renderHtmlImage(images);
          }
        }
      }
    },
    renderHtmlImage: function (data) {
      var self = this;
      var htmlLarge = '',
        htmlThumb = '';
      var count = 0;
      var limit = 9999;
      if ($(window).width() < 992) {
        limit = 99;
      }
      data.map((img) => {
        count++;
        if (count <= limit) {
          var fix_img = Haravan.resizeImage(img.src, sizeImgDetail);

          htmlLarge += '<div class="swiper-slide">';
          htmlLarge += '<div class="box-image">';
          htmlLarge += '<a href="' + img.src + '" data-fancybox="gallery">';
          htmlLarge += '<img class="lazyload" data-src="' + fix_img + '" alt="' + img.color + '"/>';
          htmlLarge += '</a>';
          htmlLarge += '</div>';
          htmlLarge += '</div>';

          htmlThumb += '<div class="swiper-slide">';
          htmlThumb += '<div class="box-image">';
          htmlThumb += '<img class="lazyload" data-src="' + fix_img + '" alt="' + img.color + '"/>';
          htmlThumb += '</div>';
          htmlThumb += '</div>';
        }
      });
      if (htmlLarge != '') {
        if ($(window).width() < 992) {
          if (self.largeSlider && self.largeSlider.destroy) self.largeSlider.destroy(true, true);
          if (self.thumbSlider && self.thumbSlider.destroy) self.thumbSlider.destroy(true, true);
        }

        $(self._elm_gallery).html(htmlLarge);

        if ($(window).width() < 992) {
          $(self._elm_gallery_thumb).html(htmlThumb);
          self.swiperGallery();
        }
      }
    },
    thumbSlider: '',
    largeSlider: '',
    swiperGallery: function () {
      var self = this;
      self.thumbSlider = new Swiper(self._elm_swiper_thumb, {
        slidesPerView: 6,
        spaceBetween: 5,
        watchSlidesProgress: true,
        navigation: {
          nextEl: self._elm_thumb_nextEl,
          prevEl: self._elm_thumb_prevEl,
        },
        direction: 'vertical',
        watchSlidesProgress: true,
      });
      self.largeSlider = new Swiper(self._elm_swiper_large, {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        navigation: {
          nextEl: self._elm_large_nextEl,
          prevEl: self._elm_large_prevEl,
        },
        thumbs: {
          swiper: self.thumbSlider,
        },
      });
    },
    actionElement: function () {
      var self = this;
      var product = self.data;
      $(document).on('change', self._elm_input_option1, function (e) {
        e.preventDefault();
        self.isChange = true;
        if (product.options.length > 1) {
          self.renderOption2();
        } else {
          self.renderInfo();
        }
        self.buildParam();
        /*
        if($(window).width() < 992){
          $('html, body').animate({
            scrollTop: 0
          }, 200);
        }
        */
      });
      $(document).on('change', self._elm_input_option2, function (e) {
        e.preventDefault();
        self.renderInfo();
        self.buildParam();
      });
    },
    renderInfo: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).val();
      var option2Active = $(self._elm_Option2Active).val();
      var temp = product.variants.filter((item) => item.option1 == option1Active);
      if (temp.length > 0 && product.options.length > 1) {
        temp = temp.filter((item) => item.option2 == option2Active);
      }
      if (temp.length > 0) {
        var variant = temp[0];
        $(self._elm_product_select).val(variant.id);
        self.renderPrice(variant);
        self.renderSKU(variant);
        self.renderStatus(variant);
        RF.Product.stockInventory.callApi();
      }
    },
    renderStatus: function (variant) {
      var self = this;
      if (variant.available) {
        $(self._elm_product_addtocart).removeClass('disabled').find('span').html('Thêm vào giỏ hàng');
        $(self._elm_product_buynow).removeClass('d-none');
      } else {
        $(self._elm_product_addtocart).addClass('disabled').find('span').html('Tạm hết hàng');
        $(self._elm_product_buynow).addClass('d-none');
      }
    },
    renderSKU: function (variant) {
      var self = this;
      $(self._elm_product_sku).html(variant.sku);
    },
    renderPrice: function (variant) {
      var self = this;
      $(self._elm_product_compare_price).addClass('d-none');
      $(self._elm_product_labelsale).addClass('d-none');
      $(self._elm_product_price).html(Haravan.formatMoney(variant.price, shop.moneyFormat));
      $(self._elm_product_price_wrap).removeClass('hasSale');
      if (variant.compare_at_price > variant.price) {
        $(self._elm_product_price_wrap).addClass('hasSale');
        $(self._elm_product_compare_price).html(Haravan.formatMoney(variant.compare_at_price, shop.moneyFormat)).removeClass('d-none');
        var price = variant.price;
        var compare_at_price = variant.compare_at_price;
        var mathDiscount = ((compare_at_price - price) / compare_at_price) * 100;
        var result_sale = Math.round(mathDiscount);
        $(self._elm_product_labelsale)
          .html('-' + result_sale + '<small>%</small>')
          .removeClass('d-none');
      }
    },
    buildParam: function () {
      var self = this;
      var product = self.data;
      var option1Active = $(self._elm_Option1Active).attr('data-color');
      var option2Active = $(self._elm_Option2Active).val();
      var params = new URLSearchParams(window.location.search);
      params.set('color', option1Active);
      if (product.options.length > 1) {
        params.set('size', option2Active);
      }
      var newUrl = window.location.pathname + '?' + params.toString();
      history.replaceState(null, '', newUrl);
    },
  },

  sliderSwiperCollection: function ($elm) {
    new Swiper($elm, {
      slidesPerView: 2,
      slidesPerGroup: 2,
      spaceBetween: 10,
      loop: true,
      watchSlidesProgress: true,
      navigation: {
        nextEl: $elm + ' .swiper-button-next',
        prevEl: $elm + ' .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 5,
          slidesPerGroup: 5,
        },
      },
    });
  },
  collectionSwiper1: function () {
    var self = this;
    var product = productDetail;
    var type = product.type;
    var vendor = product.vendor;
    var query = '((product_type:product=' + type + '))&&((vendor:product=' + vendor + '))&&((id:product<>' + product.id + '))';
    var url = '/search.js';
    var data = {
      q: 'filter=' + query,
      type: 'product',
      page: 1,
      limit: 20,
    };
    RF.ProductLoop.searchJS(data, function (response) {
      if (response.total > 0) {
        var items = RF.ProductLoop.loopHtml(response, false, 'slider');
        $('.swiper-detail-1 .swiper-wrapper').html(items);
        //RF.CustomerReviewLoop.init();
        self.sliderSwiperCollection('.swiper-detail-1');
      } else {
        $('.product-sametype').hide();
      }
    });
  },
  recentlyProduct: {
    init: function () {
      this.save();
      this.render();
    },
    save: function () {
      var product = productDetail;
      if (product.tags != null) {
        if (!product.tags.includes('quatang') && !product.tags.includes('GIFT') && !product.tags.includes('gift') && product.price > 0) {
          var viewedProducts = JSON.parse(localStorage.getItem('viewed_products_handle'));
          if (viewedProducts) {
            var prdHandle = product.handle;
            if (viewedProducts.includes(prdHandle)) return;
            viewedProducts.unshift(prdHandle);
            viewedProducts.length > 20 && viewedProducts.pop(viewedProducts[20]);
            localStorage.setItem('viewed_products_handle', JSON.stringify(viewedProducts));
          } else {
            var listViewed = [];
            listViewed.push(product.handle);
            localStorage.setItem('viewed_products_handle', JSON.stringify(listViewed));
          }
        }
      }
    },
    render: function () {
      var self = this;
      var viewedProducts = JSON.parse(localStorage.getItem('viewed_products_handle'));
      if (viewedProducts.length > 20) {
        viewedProducts = viewedProducts.slice(0, 20);
      }
      if (viewedProducts.length > 0) {
        var listHandle = viewedProducts;
        var query = '((handle:product in ' + listHandle + '))&&((available:product=true))&&((price:product>0))';
        var data = {
          q: 'filter=' + query,
          type: 'product',
          page: 1,
          limit: 20,
        };
        RF.ProductLoop.searchJS(data, function (response) {
          if (response.total > 0) {
            var items = RF.ProductLoop.loopHtml(response, false, 'slider');
            $('.swiper-detail-2 .swiper-wrapper').html(items);
            //RF.CustomerReviewLoop.init();
            RF.Product.sliderSwiperCollection('.swiper-detail-2');
          } else {
            $('.product-preview').hide();
          }
        });
      }
    },
  },

  stockInventory: {
    data: {},
    init: function () {
      var that = this;
      that.open();
    },
    open: function () {
      $('.bottom-collect').click(function (e) {
        e.preventDefault();
        $.fancybox.open($('#stock-popup'), {
          touch: false,
        });
      });
    },
    callApi: function () {
      var self = this;
      var id = $('#product-select').val();
      var url = '?variant=' + id + '&view=stock';
      if (self.data[id] == undefined) {
        $.get(url, function (response) {
          var code = JSON.parse(response);
          self.data[id] = {};
          self.data[id] = code;
          self.renderCount(code);
          self.renderHtml(code);
        });
      } else {
        self.renderCount(self.data[id]);
        self.renderHtml(self.data[id]);
      }
    },
    renderCount: function (data) {
      var self = this;
      var locations = data.locations;
      var available = locations.filter((item) => item.inventory_location > 0);
      $('.count-store span').html(available.length + '/' + locations.length);
    },
    renderHtml: function (data) {
      var self = this;
      var locations = data.locations;
      var html = '';
      locations.map((address) => {
        var addOpen = address.location_address + ', ' + address.ward_name + ', ' + address.district_name + ', ' + address.province_name;
        html += '<div class="item-ajax-stock">';
        html += '<div class="head-item">';
        html += '<div class="stock-provin">' + address.province_name + '</div>';
        html += '<div class="stock-status ' + (address.inventory_location <= 0 ? 'out-stock' : '') + '">' + (address.inventory_location > 0 ? 'Còn hàng' : 'Hết hàng') + '</div>';
        html += '</div>';
        html += '<div class="content-item">';
        html += '<strong>' + address.location_name + '</strong>';
        html += '<div class="stock-address">Địa chỉ cửa hàng</div>';
        html += '<div class="stock-phone">' + address.location_phone + '</div>';
        html += '<div class="stock-time">';
        html += '<label>Giờ mở cửa</label>';
        html += '<span>09:00 - 21:00</span>';
        html += '</div>';
        html += '<div class="stock-action">';
        html += '<a href="https://www.google.com/maps/dir//' + addOpen + '" target="_blank">Xem địa chỉ</a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      });
      $('.ajax-stock').html(html);
    },
  },

  handleDescription: function () {
    $('.toggle-description-btn').click(function () {
      $('.wrap-description').toggleClass('expanded');
      $(this).text($('.wrap-description').hasClass('expanded') ? 'Rút gọn' : 'Xem thêm');
    });
    if ($('.wrap-description')[0].scrollHeight <= 300) {
      $('.toggle-description-btn').hide();
      $('.wrap-description').removeClass('more-content');
    }
  },
};
RF.Blog = {
  init: function () {
    var that = this;
    that.sliderHome();
  },
  sliderHome: function () {
    var mySwiper = new Swiper('.swiper-article-slider', {
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: false,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-article-slider .swiper-button-next',
        prevEl: '.swiper-article-slider .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
      },
    });
  },
};
RF.Article = {
  init: function () {
    var that = this;
    if ($(window).width() > 1200) {
      that.fixedBanner();
    }
    that.handleSidebarQA();
    that.sliderBlog();
    that.handleSliderProduct.init();
  },

  handleSliderProduct: {
    init: function () {
      var that = this;
      that.only(function () {
        that.group();
      });
    },
    sliderSwiperCollection: function ($elm) {
      new Swiper($elm, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 10,
        loop: true,
        watchSlidesProgress: true,
        navigation: {
          nextEl: $elm + ' .swiper-button-next',
          prevEl: $elm + ' .swiper-button-prev',
        },
        breakpoints: {
          1340: {
            spaceBetween: 10,
            slidesPerView: 4,
            slidesPerGroup: 4,
          },
          992: {
            spaceBetween: 10,
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
        },
      });
    },
    only: function (callback) {
      var $article = $('.article-content');
      var content = $article.html();
      var match = content.match(/\[only:([^\]]+)\]/);
      if (match && match[1]) {
        var handle = match[1];
        $.get('/products/' + handle + '?view=only', function (data) {
          var updated = content.replace(match[0], data);
          $article.html(updated);
          if (typeof callback === 'function') {
            return callback();
          }
        });
      }
    },
    group: function () {
      var self = this;
      var content = $('.article-content').html();
      var match = content.match(/\[group:([^\]]+)\]/);
      if (match && match[1]) {
        var listHandle = match.join(',');
        var query = '((handle:product in ' + listHandle + '))&&((available:product=true))&&((price:product>0))';
        var data = {
          q: 'filter=' + query,
          type: 'product',
          page: 1,
          limit: 20,
        };
        RF.ProductLoop.searchJS(data, function (response) {
          if (response.total > 0) {
            var items = RF.ProductLoop.loopHtml(response, false, 'slider');
            var html = '';
            html += '<div class="wrap-slider-article style-navigation-2">';
            html += '<div class="swiper-group-article swiper-container flex-loop" data-item="5" data-item-mb="2">';
            html += '<div class="swiper-wrapper">';
            html += items;
            html += '</div>';
            html += '<div class="btn-nav swiper-button-next"></div>';
            html += '<div class="btn-nav swiper-button-prev"></div>';
            html += '</div>';
            html += '</div>';

            var newContent = content.replace(match[0], html);
            $('.article-content').html(newContent);

            self.sliderSwiperCollection('.swiper-group-article');
          }
        });
      }
    },
  },

  handleSidebarQA: function () {
    var t = [];
    var temp = {};
    $('.article-container *').each(function (i, v) {
      if ($(this).prop('tagName') == 'H2') {
        temp = {};
        temp['name'] = $(this).text();
        temp['level'] = [];
        t.push(temp);
        $(this).attr('data-zone', t.length);
      } else if ($(this).prop('tagName') == 'H3') {
        temp = t.pop();
        var temp1 = {};
        temp1['name'] = $(this).text();
        temp1['level'] = [];
        temp['level'].push(temp1);
        t.push(temp);
        $(this).attr('data-zone', t.length + '_' + temp['level'].length);
      }
    });
    var html_menu_article = '';
    if (t.length > 0) {
      $.each(t, function (i, v) {
        html_menu_article += '<li class="menu-lv1">';
        html_menu_article += '<a href="' + (i + 1) + '">' + v.name + '</a>';
        if (v.level.length > 0) {
          html_menu_article += '<ul class="menu-lv2">';
          $.each(v.level, function (j, k) {
            html_menu_article += '<li><a href="' + (i + 1) + '_' + (j + 1) + '">' + k.name + '</a></li>';
          });
          html_menu_article += '</ul>';
        }
        html_menu_article += '</li>';
      });
    }

    if (html_menu_article != '') {
      $('#table-content-container ul').html(html_menu_article);
    }

    if ($('.article-container').length > 0) {
      $('#table-content-container .icon-list').click(function () {
        $(this).parents('#table-content-container').find('ul:first').slideToggle({ direction: 'left' }, 100);
        var texxx = $(this).text();
        if (texxx == 'Ẩn') {
          $(this).html('Hiện');
        } else {
          $(this).html('Ẩn');
        }
      });

      $('body').on('click', '#table-content-container ul li a, #clone-table  ul li a', function (e) {
        if (e.cancelable) e.preventDefault();
        var id = $(this).attr('href');
        if ($("[data-zone='" + id + "']").length > 0) {
          $('html,body').animate({ scrollTop: $("[data-zone='" + id + "']").offset().top - 102 }, 600);
          $('.table-content-fixed').removeClass('active');
        }
      });

      $('.table-content-button .btn-icolist').on('click', function (e) {
        $('.table-content-fixed').toggleClass('active');
      });

      $('.table-content-fixed .table-of-header .hClose').on('click', function (e) {});

      if ($('#table-content-container').length > 0) {
        /*
				var ofsettop_ = $(".article-table-contents").offset().top - 300 ;
				$(window).scroll(function(){
					if($(window).scrollTop() > ofsettop_){
						$(".table-content-button").addClass('active');
					}
          else{
						$(".table-content-button").removeClass('active');
						$('.table-content-fixed').removeClass('active');
					}
				});		
        */
      }
    }
  },
  fixedBanner: function () {
    function updateFixedBannerPosition() {
      var $container = $('.article-container');
      var $banner = $('.fixed-banner');
      var $footer = $('.blog-homepage');
      if ($container.length && $banner.length && $footer.length) {
        var containerOffset = $container.offset();
        var containerWidth = $container.outerWidth();
        var bannerLeft = containerOffset.left + containerWidth + 12;
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        var footerOffsetTop = $footer.offset().top;
        var bannerHeight = $banner.outerHeight();
        var bannerBottom = scrollTop + 200 + bannerHeight;
        if (bannerBottom > footerOffsetTop) {
          $banner.css({
            position: 'absolute',
            top: footerOffsetTop - bannerHeight - 40 + 'px',
            left: bannerLeft + 'px',
          });
        } else {
          $banner.css({
            position: 'fixed',
            top: 'auto',
            left: bannerLeft + 'px',
          });
        }
      }
    }

    $(window).on('load resize scroll', function () {
      updateFixedBannerPosition();
    });
  },
  sliderBlog: function () {
    new Swiper('.swiper-blog-homepage', {
      spaceBetween: 0,
      slidesPerView: 1,
      loop: true,
      navigation: {
        nextEl: '.swiper-blog-homepage .swiper-button-next',
        prevEl: '.swiper-blog-homepage .swiper-button-prev',
      },
      breakpoints: {
        1340: {
          spaceBetween: 10,
          slidesPerView: 3,
        },
        992: {
          spaceBetween: 10,
          slidesPerView: 2,
        },
      },
    });
  },
};
$(document).ready(function () {
  RF.init();
});
