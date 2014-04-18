$(document).ready(function () {
  InstantClick.init();
});
$(document).on('click', 'a.need-login', function (event) {
  if($.isLoggedIn)
    return;
  event.preventDefault();
  var $el = $(this);
  showLoginPrompt(function(){
    $el.removeClass('need-login');
    if(!$el.hasClass('no-redirect'))
    window.open($el.attr('href'), '_parent');
  });
});
$(document).on('click', 'a.bs-tab',function (e) {
  e.preventDefault();
  $(this).tab('show');
});
$(document).on("eldarion-ajax:begin", function(evt, $el) {
    $('button#submit').html('Please wait...').attr("disabled", true);
});
$(document).on("eldarion-ajax:success", function(evt, $el, data) {
    window.location.reload();
});
$(document).on("eldarion-ajax:complete", function(evt, $el, xhr, status) {
  if(xhr.statusText !== 'OK')
    $el.append('<p class="text-danger">'+xhr.statusText+'</p>');
  else
    $('button#submit').html('Done. Please wait...');
});
var showLoginPrompt = function (flash, type, cb) {
  if(typeof flash === 'function'){
    cb = flash;
    flash = undefined;
  }
  cb = cb || function(){
    window.location.reload();
  }
  bootbox.dialog({
    message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
    title: "Please login",
    buttons: {
      'login': {
        label: 'Login now',
        className: 'btn-primary',
        callback: function () {
          var username = $('#username').val();
          var password = $('#password').val();
          $.ajax({
            url: '/login',
            type: 'post',
            dataType: 'json',
            data: {
              password: password,
              username: username
            },
            headers: {
              Accept: "application/json; charset=utf-8",
            },
            success: function (data) {
              if (data.error === 'invalid_credentials') return showLoginPrompt('Invalid username or password. Please retry', 'danger');
              if (data.error) return showLoginPrompt('Unknown error. Please retry', 'danger');
              cb();

            },
          });
        }
      },
      'cancel': {
        label: 'or Cancel',
        className: 'btn-link'
      }
    }
  });
  $('.bootbox-body').addClass('row');
  $('.bootbox-body').addClass('loading-bb');
  $.ajax({
    url: '/api/ajax/login',
    success: function (data) {
      $('.bootbox-body').fadeOut(150, function () {
        $('.bootbox-body').removeClass('loading-bb');
        $('.bootbox-body').html(data)
        $('input#login').remove();
        if (flash) $('.bootbox-body').prepend(bs_alert(type, flash));

        $('.bootbox-body').fadeIn(150);

      })
    }
  })

}
var ajax = function (url, type, data, callback) {
  if (typeof type === "function") {
    callback = type;
    type = "get";
  }

  if (typeof data === "function") {
    callback = data;
    data = {};

  }
  type = type || 'get';
  data = data || {};
  $.ajax({
    url: url,
    data: data,
    type: type,
    success: callback
  });

}

var bs_alert = function (type, flash) {
  return '<div class="panel panel-' + (type || 'info') + '">' + '<div class="panel-heading"><h3 class="panel-title pull-left">' + flash + '</h3><button type="button" class="close pull-right" aria-hidden="true" onclick="$(\'.panel-danger\').remove()">' + '&times;</button><div class="clearfix col-x"></div></div></div>';
}
var addToCart = function (id, cb) {
  var cart = $.cookie('cart_id');
  console.log(cart);
  if (!cart) {
    return ajax('/api/cart/create', function (data) {
      if (data.status === "success") {
        if (!cb) $('#main').prepend(bs_alert('success', data.message));
        $.cookie('cart_id', data.data.cart._id, {
          path: '/',
          expires: 365
        });
        addToCart(id, cb);
      }
      if (data.status === "error") {
        $('#main').prepend(bs_alert('danger', data.message));
      }
    });
  }
  cb = cb || function (data) {
    if (data.status === "success") {
      $('#main').prepend(bs_alert('success', data.message));
    }
    if (data.status === "error") {
      $('#main').prepend(bs_alert('danger', data.message));
    }
  };
  ajax('/api/cart/' + cart + '/push/' + id, cb);
}
pushToCart = function (id) {
  var $el = $('.cart[data-id=' + id + ']');
  var $a = $('.cart-a.cart-' + id);
  addToCart(id, function (data) {
    $a.animate({
      'top': '+=20px'
    }, 250, function () {
      $el.html('<span class="cart-btn cart-b cart-' + id + '"><span class="glyphicon glyphicon-ok"></span> Remove</span>');
      $el.attr('onclick', 'dropCartItem(\'' + id + '\')')
      var $b = $('.cart-b.cart-' + id);
      $b.animate({
        'top': '+=20px'
      }, 250);
    });
  });
}
