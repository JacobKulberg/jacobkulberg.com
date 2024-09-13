let code = '';

$(window).on('keydown', function (e) {
	// arrow keys
	if (e.keyCode >= 37 && e.keyCode <= 40) {
		e.preventDefault();
	}

	if (!$('.code').is(':focus')) {
		$('.code').focus();
	}
});

$('.enter-code-digits').on('mousedown touchstart', function (e) {
	e.preventDefault();
	e.stopPropagation();

	if (!$('.code').is(':focus')) {
		$('.code').focus();
	}
});

function validateInput(value) {
	return /^\d{0,4}$/.test(value);
}

function updateActiveDigit() {
	let numDigits = Math.min($('.code').val().length || 0, 3);

	$('.enter-code-digit').removeClass('active');
	$(`.enter-code-digit[order="${numDigits + 1}"]`).addClass('active');
}

$('.code').on('input', function (e) {
	let value = $(this).val();

	if (value.length >= 5) {
		value = value.substring(0, 3) + value.slice(-1);
	}

	if (!validateInput(value)) {
		$(this).val(value.replace(/\D/g, '').slice(0, 4));
		return;
	}

	updateActiveDigit();

	for (let i = 0; i < 4; i++) {
		$(`.enter-code-digit[order="${i + 1}"]`)[0].innerText = value[i] || '';
	}

	if (value.length === 4) {
		$('.code').blur();
		$('.join-game-button').prop('disabled', false);
	} else {
		$('.join-game-button').prop('disabled', true);
	}

	code = value;
});

$('.code').on('paste', function (e) {
	var pastedData = e.originalEvent.clipboardData.getData('text');
	if (!validateInput(pastedData)) {
		e.preventDefault();
	}
});

$('.code').on('focus', updateActiveDigit);

$('.code').on('blur', function () {
	$('.enter-code-digit').removeClass('active');
});

function getJoinCode() {
	return code;
}

export { getJoinCode };
