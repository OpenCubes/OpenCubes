$(document).ready(function () {
  InstantClick.init();
});
$(document).on('click', 'a.need-login', function (event) {
  if ($.isLoggedIn)
    return;
  event.preventDefault();
  var $el = $(this);
  showLoginPrompt(function () {
    $el.removeClass('need-login');
    if (!$el.hasClass('no-redirect'))
      window.open($el.attr('href'), '_parent');
  });
});
$(document).on('click', 'a.bs-tab', function (e) {
  e.preventDefault();
  $(this).tab('show');
});
$(document).on("eldarion-ajax:begin", function (evt, $el) {
  $el.addClass("loading");
});
$(document).on("eldarion-ajax:success", function (evt, $el, data) {
  alert("hi")
  $.reloadSection($el.attr("data-target"));
});
$.reloadSection = function (id) {
  var q = window.location.pathname + (window.location.search || "") + " " + id;
  console.log(q)
  $(id).load(q, function () {});
}
$(document).on("eldarion-ajax:complete", function (evt, $el, xhr, status) {
  console.log(xhr)
  if (xhr.statusText !== 'OK') {
    if (JSON.parse(xhr.responseText).error === "unauthenticated") {
      $el.prepend('<div class="ui error message">' +
        '<p>You must signin to comment</p></div>');
      $el.removeClass("loading");
      $el.addClass("error")
      return;
    }
    $el.prepend('<div class="ui error message">' +
      '<p>' + (JSON.parse(xhr.responseText).message || xhr.statusText) + '</p></div>');
    $el.removeClass("loading");
    $el.addClass("error");
  }
});
var showLoginPrompt = function (cb) {
  $('.ui.modal').modal('setting', {
    closable: false,
    onDeny: function () {
      return true;
    },
    onApprove: function () {
      $('#login-form').addClass("loading")
      var username = $('#username').val();
      var password = $('#password').val();
      var xhr = new XMLHttpRequest();
      xhr.open("post", "/login", false);
      xhr.setRequestHeader('Accept', "application/json; charset=utf-8");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("password=" + password + "&username=" + username);
      console.log(xhr);
      var data = JSON.parse(xhr.responseText);
      console.log(data);
      $('ui.error').remove();
      if (data.error === 'invalid_credentials') {
        $('#login-form').removeClass("loading").addClass("error");
        $('#login-form').prepend('<div class="ui error message"><p>Invalid username or password.</p></div>');
        return false;
      }
      if (data.error) {
        $('#login-form').removeClass("loading").addClass("error");
        $('#login-form').prepend('<div class="ui error message"><p>Unknown error. Please retry</p></di');
        return false;
      }
      $.reloadSection('.main.menu');
      return true;
    }
  }).modal('show');


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
      $el.html('<span class="cart-btn cart-b cart-' + id + '"><i class="checkmark icon"></i> Remove</span>');
      $el.attr('onclick', 'dropCartItem(\'' + id + '\')')
      var $b = $('.cart-b.cart-' + id);
      $b.animate({
        'top': '+=20px'
      }, 250);
    });
  });
}
$(document).on('submit', 'form#upload-mod', function (e) {
  e.preventDefault();
  console.log("uploading");
  var $el = $(this);
  $el.addClass("loading");
  $.ajax({
    method: 'post',
    data: $el.serialize(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Triggered-By': 'Script'
    },
    success: function(data) {
      console.log(data);
      window.location.href = data.redirectTo;
    },
    error: function (data) {
      data = data.responseJSON;
      $(document).scrollTop(0);
      $el.removeClass("loading").addClass("error");
      var str = '<div class="ui error message"> <div class="header">There have been some errors</div><ul class="list">'
      for (var err in data.errors) {
        switch (err) {
        case 'name':
          $in = $('input[id=name]');
          $in.parent().parent().addClass('error');
          $in.after('<div class="ui red pointing above ui label">' + data.errors.name.message + '</div>');
          break;

        case 'summary':
          $in = $('[id=summary]');
          $in.parent().parent().addClass('error');
          $in.after('<div class="ui red pointing above ui label">' + data.errors.summary.message + '</div>');
          break;
        }
        str += '<li>'+data.errors[err].message+'</li>';
      }
      str += '</ul></div>';
      $('h2', $el).after(str);
    }
  });
});
