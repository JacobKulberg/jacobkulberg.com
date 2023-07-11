$(window).on('load', () => {
	let links = $('header nav a');
	let pages = $('.page');
	let underline = $('#selected-page');

	let validHashes = ['#about-me', '#projects', '#services'];
	let titles = ['About Me', 'Projects', 'Services'];

	let selected = '#about-me';
	if (validHashes.indexOf(window.location.hash) > 0) {
		selected = window.location.hash;
		$(document).prop('title', `Jacob Kulberg | ${titles[validHashes.indexOf(selected)]}`);
	}
	window.location.hash = selected;

	selectPage($(`header nav a[href="${selected}"]`));

	links.each((index, link) => {
		$(link).on('click', () => {
			selectPage($(link));
			selected = $(link).attr('href');
			$(document).prop('title', `Jacob Kulberg | ${titles[validHashes.indexOf(selected)]}`);
		});
	});

	$(window).on('resize orientationchange', () => {
		underline.css('transition', 'none');
		selectPage($(`header nav a[href="${selected}"]`));
		setTimeout(() => {
			underline.css('transition', '');
		}, 0);
	});

	function selectPage(link) {
		underline.css({
			left: `${link.offset().left}px`,
			width: `${link.width()}px`,
		});

		pages.each((index, page) => {
			$(page).css({
				opacity: '0',
				pointerEvents: 'none',
			});
		});

		$(`#${link.attr('href').slice(1)}`).css({
			opacity: '',
			pointerEvents: '',
		});
	}
});
