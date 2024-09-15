$(document).ready(function () {
	$(window)
		.on('keydown', function (e) {
			$('.input').focus();

			if (e.which === 8 && typeof myKeyboard !== 'undefined') {
				$('.hg-button[data-skbtn="{bksp}"]').css('background', 'rgb(218, 220, 228)');

				let currentInput = myKeyboard.getInput();
				myKeyboard.setInput(currentInput.slice(0, -1));
				myKeyboard.options.onKeyPress('{bksp}');

				document.querySelector('.input').value = myKeyboard.getInput();
			}

			let button = $('.hg-button[data-skbtn="' + e.key + '"]');
			$(button).css('background-color', '#c1c1c1');
		})
		.on('keyup', function (e) {
			if (e.which === 8) {
				$('.hg-button[data-skbtn="{bksp}"]').css('background', '');
			}
		});

	$(window).on('resize orientationchange', async function () {
		if (!isMobile) return;

		if (window.innerWidth / window.innerHeight > 2) {
			window.myKeyboard.destroy();
			window.myKeyboard = null;

			$('.keyboard-container').addClass('invisible');
			return;
		} else if (!window.myKeyboard) {
			let startedAt = (await window.get(window.ref(window.database, `games/${window.code}/startedAt`))).val();
			if (startedAt) {
				createKeyboard();
			}
		}
	});
});

function createKeyboard() {
	if (!isMobile) return;

	$('.clues-container-across').css('display', 'none');
	$('.clues-container-down').css('display', 'none');

	$('.header').addClass('mobile');
	$('.crossword-container').addClass('mobile');
	$('.keyboard-container').removeClass('invisible');

	if (window.innerWidth / window.innerHeight > 2) {
		return;
	}

	const Keyboard = window.SimpleKeyboard.default;

	window.myKeyboard = new Keyboard({
		onChange: (input) => {
			onChange(input);

			// check if grid is correct
			setTimeout(() => {
				if (isPuzzleSolved()) {
					finishGame();
				}
			}, 10);
		},
		physicalKeyboardHighlight: true,
		physicalKeyboardHighlightPress: true,
		layout: {
			default: ['q w e r t y u i o p', 'a s d f g h j k l', 'z x c v b n m {bksp}'],
		},
	});

	let keys = document.querySelectorAll('.hg-button');
	for (let key of keys) {
		key.textContent = key.textContent.toUpperCase();

		if (key.textContent === 'BACKSPACE') {
			key.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
		}
	}

	$('.hg-button-bksp').on('mousedown touchstart', function (e) {
		e.preventDefault();
		e.stopPropagation();

		if ($('.crossword-cell-selected .crossword-cell-value').text() !== '') {
			$('.crossword-cell-selected .crossword-cell-value').text('');
			return;
		}

		let row = 0;
		let col = 0;
		let direction = 'down';

		for (let i = 0; i < $('.crossword-row').length; i++) {
			if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
				row = i;
				break;
			}
		}

		for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
			if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
				col = i;
				break;
			}
		}

		if ($('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary')) {
			direction = 'across';
		}

		if (direction === 'across') {
			if (col === 0) {
				previousClue({ preventDefault: () => {}, stopPropagation: () => {} });
				return;
			}

			col--;
			col = Math.max(0, col);
		} else {
			if (row === 0) {
				previousClue({ preventDefault: () => {}, stopPropagation: () => {} });
				return;
			}

			row--;
			row = Math.max(0, row);
		}

		selectCell(row, col, direction);

		$('.crossword-cell-selected .crossword-cell-value').text('');
	});
}

function onChange(input) {
	document.querySelector('.input').value = input;

	let letter = input.slice(-1);

	if (typeof myKeyboard !== 'undefined') {
		myKeyboard.setInput('');
	} else {
		$('.input').val('');
	}

	// if cell is marked as correct, don't change cell value
	if (!$('.crossword-cell-selected').hasClass('correct')) $('.crossword-cell-selected .crossword-cell-value').text(letter.toUpperCase());

	if (!$('.crossword-cell-selected').hasClass('correct') && window.cheatMode) {
		let row = 0;
		let col = 0;

		for (let i = 0; i < $('.crossword-row').length; i++) {
			if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
				row = i;
				break;
			}
		}

		for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
			if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
				col = i;
				break;
			}
		}

		if (letter.toUpperCase() === grid[row][col]) {
			$('.crossword-cell-selected').removeClass('incorrect');
			$('.crossword-cell-selected').addClass('correct');
		} else {
			$('.crossword-cell-selected').removeClass('correct');
			$('.crossword-cell-selected').addClass('incorrect');
		}
	}

	let row = 0;
	let col = 0;
	let direction = 'down';

	for (let i = 0; i < $('.crossword-row').length; i++) {
		if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
			row = i;
			break;
		}
	}

	for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
		if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
			col = i;
			break;
		}
	}

	if ($('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary')) {
		direction = 'across';
	}

	if (direction === 'across') {
		if (col === $('.crossword-row').eq(row).find('.crossword-cell').length - 1) {
			do {
				if (isFilled()) break;

				nextClue({ preventDefault: () => {}, stopPropagation: () => {} });
			} while ($('.crossword-cell-selected .crossword-cell-value').text() !== '');
			return;
		}

		col++;
		col = Math.min(col, $('.crossword-row').eq(row).find('.crossword-cell').length - 1);
	} else {
		if (row === $('.crossword-row').length - 1) {
			do {
				if (isFilled()) break;

				nextClue({ preventDefault: () => {}, stopPropagation: () => {} });
			} while ($('.crossword-cell-selected .crossword-cell-value').text() !== '');
			return;
		}

		row++;
		row = Math.min(row, $('.crossword-row').length - 1);
	}

	let cell = $('.crossword-row').eq(row).find('.crossword-cell').eq(col);
	while (cell.children('.crossword-cell-value').text() !== '') {
		if (isFilled()) break;

		if (direction === 'across') {
			col++;

			if (col >= $('.crossword-row').eq(row).find('.crossword-cell').length) {
				col = 0;
				row++;
			}
		} else {
			row++;

			if (row >= $('.crossword-row').length) {
				row = 0;
				col++;
			}
		}

		if (row >= $('.crossword-row').length) {
			row = 0;
		}
		if (col >= $('.crossword-row').eq(row).find('.crossword-cell').length) {
			col = 0;
		}

		cell = $('.crossword-row').eq(row).find('.crossword-cell').eq(col);
	}

	selectCell(row, col, direction);
}

$(window).on('load', function () {
	if (!isMobile) $('.input').focus();

	$('.input').on('blur', function (e) {
		e.preventDefault();
		e.stopPropagation();

		if (!isMobile) $('.input').focus();
	});

	$('input').on('input', function () {
		onChange(this.value);
	});

	$(window).on('keydown', function (e) {
		/**
		 * 8: Backspace
		 * 37: Left
		 * 38: Up
		 * 39: Right
		 * 40: Down
		 */

		if (e.which === 8) {
			e.preventDefault();
			e.stopPropagation();

			// if puzzle is solved, don't allow backspace
			if (isPuzzleSolved()) return;

			// if cell is marked as correct, don't remove cell value
			if (!$('.crossword-cell-selected').hasClass('correct') && $('.crossword-cell-selected .crossword-cell-value').text() !== '') {
				$('.crossword-cell-selected .crossword-cell-value').text('');
				return;
			}

			let row = 0;
			let col = 0;
			let direction = 'down';

			for (let i = 0; i < $('.crossword-row').length; i++) {
				if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
					row = i;
					break;
				}
			}

			for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
				if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
					col = i;
					break;
				}
			}

			if ($('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary')) {
				direction = 'across';
			}

			if (direction === 'across') {
				if (col === 0) {
					previousClue({ preventDefault: () => {}, stopPropagation: () => {} });
					return;
				}

				col--;
				col = Math.max(0, col);
			} else {
				if (row === 0) {
					previousClue({ preventDefault: () => {}, stopPropagation: () => {} });
					return;
				}

				row--;
				row = Math.max(0, row);
			}

			selectCell(row, col, direction);

			// if cell is marked as correct, don't remove cell value
			setTimeout(() => {
				if (!$('.crossword-cell-selected').hasClass('correct')) {
					$('.crossword-cell-selected .crossword-cell-value').text('');
				}
			}, 0);
		} else if (e.which === 37) {
			e.preventDefault();
			e.stopPropagation();

			let row = 0;
			let col = 0;
			let direction = $('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary') ? 'across' : 'down';

			for (let i = 0; i < $('.crossword-row').length; i++) {
				if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
					row = i;
					break;
				}
			}

			for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
				if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
					col = i;
					break;
				}
			}

			if (direction === 'down') {
				selectCell(row, col, 'across');
				return;
			}

			if (direction === 'across') {
				col--;
				col %= $('.crossword-row').eq(row).find('.crossword-cell').length;
			} else {
				row--;
				row %= $('.crossword-row').length;
			}

			selectCell(row, col, direction);
		} else if (e.which === 38) {
			e.preventDefault();
			e.stopPropagation();

			let row = 0;
			let col = 0;
			let direction = $('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary') ? 'across' : 'down';

			for (let i = 0; i < $('.crossword-row').length; i++) {
				if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
					row = i;
					break;
				}
			}

			for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
				if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
					col = i;
					break;
				}
			}

			if (direction === 'down') {
				row--;
				row %= $('.crossword-row').length;
			} else {
				selectCell(row, col, 'down');
				return;
			}

			selectCell(row, col, direction);
		} else if (e.which === 39) {
			e.preventDefault();
			e.stopPropagation();

			let row = 0;
			let col = 0;
			let direction = $('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary') ? 'across' : 'down';

			for (let i = 0; i < $('.crossword-row').length; i++) {
				if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
					row = i;
					break;
				}
			}

			for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
				if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
					col = i;
					break;
				}
			}

			if (direction === 'down') {
				selectCell(row, col, 'across');
				return;
			}

			if (direction === 'across') {
				col++;
				col %= $('.crossword-row').eq(row).find('.crossword-cell').length;
			} else {
				row++;
				row %= $('.crossword-row').length;
			}

			selectCell(row, col, direction);
		} else if (e.which === 40) {
			e.preventDefault();
			e.stopPropagation();

			let row = 0;
			let col = 0;
			let direction = $('.crossword-cell-selected').prev().hasClass('crossword-cell-selected-secondary') || $('.crossword-cell-selected').next().hasClass('crossword-cell-selected-secondary') ? 'across' : 'down';

			for (let i = 0; i < $('.crossword-row').length; i++) {
				if ($('.crossword-row').eq(i).find('.crossword-cell-selected').length > 0) {
					row = i;
					break;
				}
			}

			for (let i = 0; i < $('.crossword-row').eq(row).find('.crossword-cell').length; i++) {
				if ($('.crossword-row').eq(row).find('.crossword-cell').eq(i).hasClass('crossword-cell-selected')) {
					col = i;
					break;
				}
			}

			if (direction === 'down') {
				row++;
				row %= $('.crossword-row').length;
			} else {
				selectCell(row, col, 'down');
				return;
			}

			selectCell(row, col, direction);
		} else {
			// check if grid is correct
			setTimeout(() => {
				if (isPuzzleSolved()) {
					finishGame();
				}
			}, 10);
		}
	});
});
