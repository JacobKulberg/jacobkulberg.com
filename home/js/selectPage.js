$(window).on('load', () => {
	let links = $('header nav a');
	let pages = $('.page');

	let underline = $('#selected-page');

	let selected = window.location.hash || '#home';

	selectPage($('header nav a[href="' + selected + '"]'));

	links.each((index, link) => {
		$(link).on('click', () => {
			selectPage($(link));
			selected = $(link).attr('href');
		});
	});

	$(window).on('resize orientationchange', () => {
		underline.css('transition', 'none');
		selectPage($('header nav a[href="' + selected + '"]'));
		setTimeout(() => {
			underline.css('transition', '');
		}, 0);
	});

	function selectPage(link) {
		underline.css('left', link.offset().left + 'px');
		underline.css('width', link.outerWidth() + 'px');

		pages.each((index, page) => {
			$(page).css('opacity', '0');
			$(page).css('pointerEvents', 'none');
		});

		$('#' + link.attr('href').substring(1)).css('opacity', '');
		$('#' + link.attr('href').substring(1)).css('pointerEvents', '');
	}
});
