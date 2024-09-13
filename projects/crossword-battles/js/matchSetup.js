$('.race-mode').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.battle-mode').removeClass('selected');

	if ($('.race-mode').hasClass('selected')) {
		$('.race-mode').removeClass('selected deselected');
		$('.battle-mode').removeClass('deselected');
	} else {
		$('.race-mode').addClass('selected');
		$('.race-mode').removeClass('deselected');
		$('.battle-mode').addClass('deselected');
	}

	if ($('.race-mode').hasClass('selected') || $('.battle-mode').hasClass('selected')) {
		$('.play-button').prop('disabled', false);
	} else {
		$('.play-button').prop('disabled', true);
	}
});

$('.battle-mode').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.race-mode').removeClass('selected');

	if ($('.battle-mode').hasClass('selected')) {
		$('.battle-mode').removeClass('selected deselected');
		$('.race-mode').removeClass('deselected');
	} else {
		$('.battle-mode').addClass('selected');
		$('.battle-mode').removeClass('deselected');
		$('.race-mode').addClass('deselected');
	}

	if ($('.race-mode').hasClass('selected') || $('.battle-mode').hasClass('selected')) {
		$('.play-button').prop('disabled', false);
	} else {
		$('.play-button').prop('disabled', true);
	}
});

$('.num-columns-select > .decrement').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	let numColumns = parseInt($('.num-columns').attr('size'));
	numColumns = Math.max(numColumns - 1, 3);
	$('.num-columns').attr('size', numColumns);

	if (numColumns <= 3) {
		$('.num-columns-select > .decrement').prop('disabled', true);
	}
	$('.num-columns-select > .increment').prop('disabled', false);
});

$('.num-columns-select > .increment').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	let numColumns = parseInt($('.num-columns').attr('size'));
	numColumns = Math.min(numColumns + 1, 6);
	$('.num-columns').attr('size', numColumns);

	if (numColumns >= 6) {
		$('.num-columns-select > .increment').prop('disabled', true);
	}
	$('.num-columns-select > .decrement').prop('disabled', false);
});

$('.num-rows-select > .decrement').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	let numRows = parseInt($('.num-rows').attr('size'));
	numRows = Math.max(numRows - 1, 3);
	$('.num-rows').attr('size', numRows);

	if (numRows <= 3) {
		$('.num-rows-select > .decrement').prop('disabled', true);
	}
	$('.num-rows-select > .increment').prop('disabled', false);
});

$('.num-rows-select > .increment').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	let numRows = parseInt($('.num-rows').attr('size'));
	numRows = Math.min(numRows + 1, 6);
	$('.num-rows').attr('size', numRows);

	if (numRows >= 6) {
		$('.num-rows-select > .increment').prop('disabled', true);
	}
	$('.num-rows-select > .decrement').prop('disabled', false);
});

$('.num-columns > .box:nth-child(1)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-columns').attr('size', 3);

	$('.num-columns-select > .decrement').prop('disabled', true);
	$('.num-columns-select > .increment').prop('disabled', false);
});

$('.num-columns > .box:nth-child(2)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-columns').attr('size', 4);

	$('.num-columns-select > .decrement').prop('disabled', false);
	$('.num-columns-select > .increment').prop('disabled', false);
});

$('.num-columns > .box:nth-child(3)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-columns').attr('size', 5);

	$('.num-columns-select > .decrement').prop('disabled', false);
	$('.num-columns-select > .increment').prop('disabled', false);
});

$('.num-columns > .box:nth-child(4)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-columns').attr('size', 6);

	$('.num-columns-select > .decrement').prop('disabled', false);
	$('.num-columns-select > .increment').prop('disabled', true);
});

$('.num-rows > .box:nth-child(1)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-rows').attr('size', 3);

	$('.num-rows-select > .decrement').prop('disabled', true);
	$('.num-rows-select > .increment').prop('disabled', false);
});

$('.num-rows > .box:nth-child(2)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-rows').attr('size', 4);

	$('.num-rows-select > .decrement').prop('disabled', false);
	$('.num-rows-select > .increment').prop('disabled', false);
});

$('.num-rows > .box:nth-child(3)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-rows').attr('size', 5);

	$('.num-rows-select > .decrement').prop('disabled', false);
	$('.num-rows-select > .increment').prop('disabled', false);
});

$('.num-rows > .box:nth-child(4)').on('click tap', function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.num-rows').attr('size', 6);

	$('.num-rows-select > .decrement').prop('disabled', false);
	$('.num-rows-select > .increment').prop('disabled', true);
});
