$(window).on('load', () => {
	let links = $('header nav a');
	let pages = $('.page');

	let underline = $('#selectedPage');

	let selected = window.location.hash || '#home';

	selectPage($('header nav a[href="' + selected + '"]'));

	links.each((index, link) => {
		$(link).on('click', () => {
			selectPage($(link));
			selected = $(link).attr('href');
		});
	});

	$(window).on('resize', () => {
		underline.css('transition', 'none');
		selectPage($('header nav a[href="' + selected + '"]'));
		underline.css('transition', '');
	});

	function selectPage(link) {
		underline.css('left', link.offset().left + 'px');
		underline.css('width', link.outerWidth() + 'px');

		pages.each((index, page) => {
			$(page).css('display', 'none');
		});
		$('#' + link.attr('href').substring(1)).css('display', '');
	}
});
