function toggleInfo() {
	if ($('#how-to-play').css('opacity') == '0') {
		$('#how-to-play').css('opacity', '1');
		$('#how-to-play').css('pointer-events', 'all');

		$('#how-to-play-angle').text($('#current-angle').text());
	} else {
		$('#how-to-play').css('opacity', '0');

		setTimeout(() => {
			$('#how-to-play').css('pointer-events', 'none');
		}, 250);
	}
}

function toggleSettings() {
	if ($('#settings').css('opacity') == '0') {
		$('#settings').css('opacity', '1');
		$('#settings').css('pointer-events', 'all');
		$('.settings-cog').css('transform', 'rotate(180deg)');
	} else {
		$('#settings').css('opacity', '0');
		$('.settings-cog').css('transform', 'rotate(0)');

		setTimeout(() => {
			$('#settings').css('pointer-events', 'none');
		}, 250);
	}

	if (remainingAttempts.first().css('filter') == 'grayscale(1)') {
		$('#hard-mode-toggle').bootstrapToggle('disable');
	} else {
		$('#hard-mode-toggle').bootstrapToggle('enable');
	}
}

$window.on('load', () => {
	$('body .setting-toggle').bootstrapToggle();

	if (Cookies.get('bananaBonanzaHardMode') == 'true') {
		$('#hard-mode-toggle').bootstrapToggle('on');
	} else {
		$('#hard-mode-toggle').bootstrapToggle('off');
	}

	Cookies.set('bananaBonanzaHardMode', Cookies.get('bananaBonanzaHardMode'), { expires: 365 });
});

$('#settings .setting-toggle').on('change', function () {
	Cookies.set('bananaBonanzaHardMode', $(this).prop('checked'), { expires: 365 });
	setRandomAngle();
});
