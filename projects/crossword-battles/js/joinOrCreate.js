$('.join-button').on('click tap', function (e) {
	e.stopPropagation();

	$('.join-or-create-container').addClass('invisible');
	$('.enter-code-container').removeClass('invisible');

	window.location.hash = 'join';
});

$('.create-button').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();

	$('.join-or-create-container').addClass('invisible');
	$('.match-setup-container').removeClass('invisible');

	window.location.hash = 'create';
});

$(window).on('popstate', function () {
	if (window.location.hash === '#join') {
		$('.join-or-create-container').addClass('invisible');
		$('.enter-code-container').removeClass('invisible');
		$('.match-setup-container').addClass('invisible');
	} else if (window.location.hash === '#create') {
		$('.join-or-create-container').addClass('invisible');
		$('.enter-code-container').addClass('invisible');
		$('.match-setup-container').removeClass('invisible');
	} else {
		$('.join-or-create-container').removeClass('invisible');
		$('.enter-code-container').addClass('invisible');
		$('.match-setup-container').addClass('invisible');
	}
});

if (window.location.hash === '#join' || window.location.hash === '#create') {
	window.history.pushState({}, '', '/');
}
