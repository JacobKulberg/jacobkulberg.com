$(window).on('load', () => {
	function backToHome() {
		window.location.href = '/';
	}

	function backToHomeCancel() {
		$('#back-to-home').off('click', backToHome);

		$(window).one('mouseup touchend', () => {
			$('#back-to-home').on('click', backToHome);
		});

		if ($('#back-to-home').css('left') == '-104px') {
			$('#back-to-home').css({
				left: '',
			});

			$('#back-to-home-cancel i').removeClass('fa-chevron-right');
			$('#back-to-home-cancel i').addClass('fa-times');
		} else {
			$('#back-to-home').css({
				left: '-104px',
			});

			$('#back-to-home-cancel i').removeClass('fa-times');
			$('#back-to-home-cancel i').addClass('fa-chevron-right');
		}
	}

	$('#back-to-home-cancel').on('click', backToHomeCancel);

	$('#back-to-home').on('click', backToHome);
});
