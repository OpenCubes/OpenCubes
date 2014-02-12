// Dynamically bining event for links to come 
$(document).on('click', 'a[data-ajax=true]', function (event) {
	event.preventDefault();
	history.pushState({}, "page 2", $(this).attr('href'));
	/*$('.screen').css({
		'display': 'block'
	});*/
	$('.screen').fadeIn();
	$('html, body').animate({
		scrollTop: 0
	}, 'slow');

	$.ajax({
		url: $(this).attr('href') + '?ajax=true',
		success: function (data) {
			$('#main').html(data.body);
			$('.screen').fadeOut(function () {
				$('.screen').css({
					display: 'none'
				});
			});

		}
	})
});
