$('.service-container').on('touchstart', (e) => {
	let end = $(e.currentTarget).one('touchend', () => {
		if (!$(e.currentTarget).hasClass('clicked')) {
			setTimeout(() => {
				$(e.currentTarget).addClass('clicked');
			}, 0);
		}
	});

	$(e.currentTarget).one('touchmove', () => {
		end.off('touchend');
	});
});

$(window).on('touchstart', (e) => {
	if ($(e.target).parents('.link').length) return;
	$('.link').removeClass('clicked');

	let end = $(window).one('touchend', () => {
		$('.service-container').removeClass('clicked');
	});

	$(window).one('touchmove', () => {
		end.off('touchend');
	});
});
