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
