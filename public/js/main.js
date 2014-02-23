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
