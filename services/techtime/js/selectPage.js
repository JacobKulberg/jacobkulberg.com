$(window).on('load', () => {
	let links = $('header nav a');
	let underline = $('#selected-page');

	let validHashes = ['#my-mission', '#services', '#contact-me'];
	let titles = ['My Mission', 'Services', 'Contact Me'];

	let selected = '#my-mission';
	if (validHashes.indexOf(window.location.hash) > 0) {
		selected = window.location.hash;
		$(document).prop('title', `Tech Time | ${titles[validHashes.indexOf(selected)]}`);
	}
	window.location.hash = selected;

	selectPage($(`header nav a[href="${selected}"]`));

	links.each((index, link) => {
		$(link).on('click', () => {
			selectPage($(link));
			selected = $(link).attr('href');
			$(document).prop('title', `Tech Time | ${titles[validHashes.indexOf(selected)]}`);
		});
	});

	$(window).on('resize orientationchange', () => {
		underline.css({
			transition: 'none',
			left: `${$(`header nav a[href="${selected}"]`).offset().left}px`,
			width: `${$(`header nav a[href="${selected}"]`).width()}px`,
		});
		setTimeout(() => {
			underline.css('transition', '');
		}, 0);
	});

	function selectPage(link) {
		underline.css({
			left: `${link.offset().left}px`,
			width: `${link.width()}px`,
		});

		links.each((index, link) => {
			$($(link).attr('href')).css('backgroundColor', '');
		});
		$(link.attr('href')).css('backgroundColor', 'rgba(255, 255, 50, 0.25)');
		setTimeout(() => {
			$(link.attr('href')).css('backgroundColor', '');
		}, 1000);
	}
});
