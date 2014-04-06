(function() {
    var isFetchingNow = false;
    $.joconut.on('error', function(err) { // fires on timeout, page without <body>, invalid requests
        console.log(err.state());
        if (err.status === 401) showLoginPrompt('Please login first and retry', 'danger');
        else $('#main').prepend('<div class="panel panel-danger"><div class="panel-heading"><h3 class="panel-title pull-left">' + 'There was an error fetching new page (' + err.message + ')</h3>' + '<button type="button" class="close pull-right" aria-hidden="true" onclick="$(\'.panel-danger\').remove()">' + '&times;</button><div class="clearfix col-x"></div></div></div>');
        stopProgress();
        isFetchingNow = false;


    });

    $.joconut.on('fetch', function() { // Page changed

        console.log('fetched');
        triggerLoad();
        isFetchingNow = false;
    });

    $.joconut.on('before:fetch', function() { // page will be loaded now
        if (!isFetchingNow) {
            console.log('fetching')
            startProgress();
            isFetchingNow = true;
        }


    });
    var startProgress = function() {
        $('.screen').fadeIn(100);
        $('html, body').animate({
            scrollTop: 0
        }, 'fast');
        $('#main').animate({
            opacity: 0.5
        }, 'fast');
    }
    var stopProgress = function() {
        $('.screen').fadeOut(100, function() {
            $('.screen').css({
                display: 'none'
            });
            $('#main').animate({
                opacity: 1
            }, 'fast');
        });
    }


})();
$(document).ready((triggerLoad = function() {
    if ($.fn.markdown) {

        $('.markdown-enabled').markdown({

            additionalButtons: [
                [{
                    name: "groupCustom",
                    data: [{
                        name: "cmdBadge",
                        title: "Add a badge",
                        icon: "glyphicon glyphicon-certificate",
                        callback: function(e) {
                            // Replace selection with some drinks
                            var chunk, cursor,
                            selected = e.getSelection();
                            // transform selection and set the cursor into chunked text
                            e.replaceSelection('[[' + (e.getSelection().text || '42') + ']]');
                            cursor = selected.start;

                            // Set the cursor
                            e.setSelection(cursor + 2, cursor + selected.length + 2)
                        }
                    }, {
                        name: "cmdTags",
                        title: "Add a label",
                        icon: "glyphicon glyphicon-tags",
                        callback: function(e) {
                            // Replace selection with some drinks
                            var chunk, cursor,
                            selected = e.getSelection();
                            // transform selection and set the cursor into chunked text
                            e.replaceSelection('||' + (e.getSelection().text || 'This is a label!') + '|info||');
                            cursor = selected.start;

                            // Set the cursor
                            e.setSelection(cursor + 2, cursor + selected.length + 2)
                        }
                    }, {
                        name: "cmdIcon",
                        title: "Add a label",
                        icon: "glyphicon glyphicon-th-large",
                        callback: function(e) {
                            bootbox.dialog({
                                message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
                                title: "Select an icon",
                                buttons: {}
                            });
                            $('.bootbox-body').addClass('row');
                            $('.bootbox-body').addClass('loading-bb');
                            $.ajax({
                                url: '/api/ajax/glyphicons',
                                success: function(data) {
                                    $('.bootbox-body').fadeOut(150, function() {
                                        $('.bootbox-body').removeClass('loading-bb');
                                        console.log(data);
                                        $('.bootbox-body').html(data);
                                        $('[name="login"]').remove();
                                        $('.icon-item').click(function(event) {
                                            var icon = $(this).attr('data-x-icon');
                                            var selected = e.getSelection();
                                            // transform selection and set the cursor into chunked text
                                            e.replaceSelection('::|' + icon + '::');
                                            var cursor = selected.start;

                                            // Set the cursor
                                            e.setSelection(cursor)
                                            bootbox.hideAll();
                                        })
                                        $('.bootbox-body').fadeIn(150);

                                    })
                                }
                            })
                        }
                    }, ]
                }, {
                    name: 'groupUtil',
                    data: [{
                        name: "cmdHelp",
                        title: "Help",
                        btnClass: 'btn btn-info btn-sm',
                        btnText: '<img width="22" src="images/markdown-mark.svg" />  Help',
                        callback: function(e) {
                            bootbox.dialog({
                                message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
                                title: "Help: Markdown Cheatsheet",
                                buttons: {}
                            });
                            $('.bootbox-body').addClass('row');
                            $('.bootbox-body').addClass('loading-bb');
                            $.ajax({
                                url: '/help/markdown-cs.md',
                                success: function(data) {
                                    $('.bootbox-body').fadeOut(150, function() {
                                        $('.bootbox-body').removeClass('loading-bb');
                                        $('.bootbox-body').html(data);
                                        $('.bootbox-body').fadeIn(150);

                                    })
                                }
                            })
                        }
                    }, ]
                }]
            ],

            onPreview: function(e) {
                if (!window.XMLHttpRequest) return '<b>Please update your browser or enable XHR</b>';
                var req = new window.XMLHttpRequest();

                req.open('POST', '/api/ajax/parse.md', false);
                req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

                req.send(JSON.stringify({
                    markdown: e.getContent()
                }))
                console.log('hiiii')
                return req.responseText;
            }
        });
    }
    $('#login').click(function(event) {
        event.preventDefault();
        showLoginPrompt();
    });
}));
var showLoginPrompt = function(flash, type) {
    bootbox.dialog({
        message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
        title: "Please login",
        buttons: {
            'login': {
                label: 'Login now',
                className: 'btn-primary',
                callback: function() {
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
                        success: function(data) {
                            if (data.error === 'invalid_credentials') return showLoginPrompt('Invalid username or password. Please retry', 'danger');
                            if (data.error) return showLoginPrompt('Unknown error. Please retry', 'danger');
                            window.location.reload();

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
        success: function(data) {
            $('.bootbox-body').fadeOut(150, function() {
                $('.bootbox-body').removeClass('loading-bb');
                $('.bootbox-body').html(data)
                $('[name="login"]').remove();
                if (flash) $('.bootbox-body').prepend(bs_alert(type, flash));

                $('.bootbox-body').fadeIn(150);

            })
        }
    })

}
var ajax = function(url, type, data, callback) {
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

var bs_alert = function(type, flash) {
    return '<div class="panel panel-' + (type || 'info') + '">' + '<div class="panel-heading"><h3 class="panel-title pull-left">' + flash + '</h3><button type="button" class="close pull-right" aria-hidden="true" onclick="$(\'.panel-danger\').remove()">' + '&times;</button><div class="clearfix col-x"></div></div></div>';
}
var addToCart = function(id, cb) {
    var cart = $.cookie('cart_id');
    console.log(cart);
    if (!cart) {
        return ajax('/api/cart/create', function(data) {
            if (data.status === "success") {
                if (!c) $('#main').prepend(bs_alert('success', data.message));
                $.cookie('cart_id', data.data.cart._id, {
                    path: '/',
                    expires: 365
                });
                addToCart(id);
            }
            if (data.status === "error") {
                $('#main').prepend(bs_alert('danger', data.message));
            }
        });
    }
    cb = cb || function(data) {
        if (data.status === "success") {
            $('#main').prepend(bs_alert('success', data.message));
        }
        if (data.status === "error") {
            $('#main').prepend(bs_alert('danger', data.message));
        }
    };
    ajax('/api/cart/' + cart + '/push/' + id, cb);
}
pushToCart = function(id) {
    var $el = $('.cart[data-id=' + id + ']');
    var $a = $('.cart-a.cart-' + id);
    addToCart(id, function(data) {
        $a.animate({
            'top': '+=20px'
        }, 250, function() {
            $el.html('<span class="cart-btn cart-b cart-' + id + '"><span class="glyphicon glyphicon-ok"></span> Remove</span>');
            $el.attr('onclick', 'dropCartItem(\'' + id + '\')')
            var $b = $('.cart-b.cart-' + id);
            $b.animate({
                'top': '+=20px'
            }, 250);
        });
    });
}
