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
        };


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
            onPreview: function(e) {
                return marked(e.getContent());
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
                if (flash) $('.bootbox-body').prepend('<div class="panel panel-' + (type || 'info') + '"><div class="panel-heading"><h3 class="panel-title pull-left">' + flash + '</h3><div class="clearfix col-x"></div></div></div>');

                $('.bootbox-body').fadeIn(150);

            })
        }
    })
}