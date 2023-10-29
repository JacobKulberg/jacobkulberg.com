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
	history.pushState(null, null, selected);

	selectPage($(`header nav a[href="${selected}"]`));

	links.each((index, link) => {
		$(link).on('click', () => {
			selectPage($(link));
			selected = $(link).attr('href');
			$(document).prop('title', `Jacob Kulberg | ${titles[validHashes.indexOf(selected)]}`);
		});
	});

	links[0].dispatchEvent(new Event('click'));

	$(window).on('resize orientationchange', () => {
		underline.css('transition', 'none');
		let link = $(`header nav a[href="${selected}"]`);
		underline.css({
			left: `${link.offset().left}px`,
			width: `${link.width()}px`,
		});
		setTimeout(() => {
			underline.css('transition', '');
		}, 0);
	});

	$('nav a').on('click', (e) => {
		e.preventDefault();

		history.pushState(null, null, selected);
	});

	function selectPage(link) {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		underline.css({
			left: `${link.offset().left}px`,
			width: `${link.width()}px`,
		});

		pages.each((index, page) => {
			$(page).css({
				opacity: '0',
				pointerEvents: 'none',
			});

			setTimeout(() => {
				if (selected !== `#${$(page).attr('id')}`) {
					$(page).css('display', 'none');
				}
			}, 250);
		});

		$(`#${link.attr('href').slice(1)}`).css({
			display: '',
		});

		setTimeout(() => {
			$(`#${link.attr('href').slice(1)}`).css({
				opacity: '',
				pointerEvents: '',
			});
		}, 0);
	}
});
