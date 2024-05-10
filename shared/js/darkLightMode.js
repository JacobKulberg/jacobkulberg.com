let toggle = $('.dark-light-mode');
let faIcon = $('.dark-light-mode i');

let currentTheme = Cookies.get('colorTheme');
if (currentTheme === 'light') {
	$('*').css('transition', 'unset', 'important');
	$('*').addClass('light');
	setTimeout(() => {
		$('*').css('transition', '');
	}, 0);
	$(faIcon).removeClass('fa-cloud-moon');
	$(faIcon).addClass('fa-sun');
}

if (!currentTheme) {
	Cookies.set('colorTheme', 'dark');
}

toggle.click(function () {
	let topDistance = $(toggle).offset().top + $(toggle).height();
	$(toggle).css('top', -topDistance);

	$('.typed-letter').css('transition', 'color 250ms linear');

	setTimeout(() => {
		if ($(faIcon).hasClass('fa-cloud-moon')) {
			$('*').addClass('light');
			$(faIcon).removeClass('fa-cloud-moon');
			$(faIcon).addClass('fa-sun');
			Cookies.set('colorTheme', 'light');
		} else {
			$('*').removeClass('light');
			$(faIcon).removeClass('fa-sun');
			$(faIcon).addClass('fa-cloud-moon');
			Cookies.set('colorTheme', 'dark');
		}

		$(toggle).css('top', 0);

		setTimeout(() => {
			$('.typed-letter').css('transition', '');
		}, 250);
	}, 500);
});
