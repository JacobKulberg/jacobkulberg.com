const $window = $(window);

$(document).on('dblclick', function (e) {
	e.preventDefault();
});

$window.on('load', () => {
	$('#loading img').on('animationiteration', () => {
		$('#loading img').css('animation', 'none');

		$('#loading').css('opacity', '0');

		setTimeout(() => {
			$('#loading').css('pointer-events', 'none');
		}, 250);
	});
});
