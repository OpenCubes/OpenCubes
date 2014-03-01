(function() {
    var isFetchingNow = false;
    $.joconut.on('error', function(err) { // fires on timeout, page without <body>, invalid requests

        console.log('errorr')
        stopProgress();
        isFetchingNow = false;

        $('#main').prepend('<div class="panel panel-danger"><div class="panel-heading"><h3 class="panel-title pull-left">' + 'There was an error fetching new page (' + err.message + ')</h3>' + '<button type="button" class="close pull-right" aria-hidden="true" onclick="$(\'.panel-danger\').remove()">' + '&times;</button><div class="clearfix col-x"></div></div></div>');
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
        bootbox.dialog({
            message: '<img class="col-md-4 col-md-offset-4" src="/images/load/spinner-256.gif" />',
            title: "Please login",
            buttons: {
              'cancel':{
                  label: 'cancel',
                  className: 'btn-link'
              }
            }
        });
        $('.bootbox-body').addClass('loading-bb');
        $.ajax({
            url: '/api/ajax/login',
            success: function(data) {

                $('.bootbox-body').html(data)
                $('.bootbox-body').removeClass('loading-bb');
            }
        })
    })
}));