const search = $('#search');
const remainingAttempts = $('#remaining-attempts-images img');

search.on('click touchstart', function () {
	if (search.hasClass('searching')) return;

	if (search.children('span').text() === 'Next!') {
		$('#bananas-collected-text').css('opacity', '0');
		$('#background #bananas .banana').css('opacity', '0');

		setTimeout(() => {
			$('#bananas-collected-text').text('');
			$('#background #bananas').css('border-width', '0px');
			$('#background #bananas .banana').remove();
			$('#background #bananas').css('height', '0px');
			$('#background #bananas').css('margin-bottom', '');

			setTimeout(() => {
				$('#background').removeClass('background');
				$('#background #bananas').css('transition', 'unset');
				$('#background #bananas').css('width', '0px');
				$('#background #bananas').css('height', '75px');
				setTimeout(() => {
					$('#background #bananas').css('transition', '');
				}, 0);
				setTimeout(() => {
					$('#background #bananas').css('height', '');
				}, 500);

				if (remainingAttempts.last().css('filter') === 'grayscale(1)') {
					endGame();
					return;
				} else {
					setRandomAngle();
					search.removeClass('searching');
					search.children('span').text('Search!');
					search.css('z-index', '');
				}
			}, 500);
		}, 500);

		search.addClass('searching');
	} else {
		remainingAttempts.each((index, bananaImage) => {
			if ($(bananaImage).css('filter') !== 'grayscale(1)') {
				$(bananaImage).css('filter', 'grayscale(1)');
				score();
				return false;
			}
		});

		search.addClass('searching');
	}
});

function setRandomAngle() {
	let hardMode = Cookies.get('bananaBonanzaHardMode') == 'true';

	let prevAngle = parseInt($('#current-angle').text());

	let randAngle;
	do {
		if (hardMode) {
			randAngle = (Math.round(Math.random() * 2 * Math.PI * 1000) / 1000) % 6.283;
		} else {
			randAngle = Math.floor(Math.random() * 359) + 1;
		}
	} while (randAngle == prevAngle);

	$('#current-angle').text(randAngle);

	if (hardMode) {
		$('#current-unit').text(`radian${randAngle !== 1 ? 's' : ''}`);
	} else {
		$('#current-unit').text(`degree${randAngle !== 1 ? 's' : ''}`);
	}
}
setRandomAngle();

function score() {
	let correctAngle = parseFloat($('#current-angle').text());
	let hardMode = Cookies.get('bananaBonanzaHardMode') == 'true';

	let playerAngle = Math.round(((-angle * 180) / Math.PI + 360) % 360) % 360;
	if (hardMode) {
		playerAngle = Math.round(((-angle + 2 * Math.PI) % (2 * Math.PI)) * 1000) / 1000;
	}

	let correctAngleDegrees = hardMode ? Math.round((correctAngle * 180) / Math.PI) : correctAngle;
	let playerAngleDegrees = hardMode ? Math.round((playerAngle * 180) / Math.PI) : playerAngle;
	let difference = Math.min(Math.abs(correctAngleDegrees - playerAngleDegrees), Math.abs(correctAngleDegrees - (playerAngleDegrees + 360)), Math.abs(correctAngleDegrees - (playerAngleDegrees - 360)));

	let background = $('#background');
	background.addClass('background');

	let n = 0;

	switch (difference) {
		case 0:
			n = 10;
			break;
		case 1:
			n = 8;
			break;
		case 2:
			n = 6;
			break;
		case 3:
			n = 4;
			break;
		case 4:
			n = 2;
			break;
		case 5:
			n = 1;
			break;
	}

	let bananasFound = n;

	setTimeout(() => {
		$('#background #bananas').css('width', `max(calc(max(${n * 4.5}vw, ${n * 4.5}vh) + 40px), 425px)`);
		$('#background #bananas').css('border-width', '3px');

		if (difference > 5) {
			setTimeout(() => {
				$('#bananas-collected-text').css('opacity', '1');
			}, 500);
		}
	}, 0);

	$('#bananas-collected-text').text(`You searched at ${playerAngle} ${hardMode ? (playerAngle !== 1 ? 'radians' : 'radian') : playerAngle !== 1 ? 'degrees' : 'degree'} and found ${bananasFound} banana${bananasFound !== 1 ? 's' : ''}!`);
	if (difference > 5) $('#bananas-collected-text').css('top', 'calc(50% - 12.5px)');
	setTimeout(() => {
		if (difference <= 5) {
			$('#background #bananas').css('height', '100px');
			$('#background #bananas').css('margin-bottom', '25px');

			setTimeout(() => {
				$('#bananas-collected-text').css('opacity', '1');
			}, 250);

			$('#bananas-collected-text').css('top', 'calc(50% - 57.5px)');
		}

		setTimeout(() => {
			search.removeClass('searching');
			search.children('span').text('Next!');
			search.css('z-index', '11');
		}, 500);
	}, n * 500 + 500);

	(function loop() {
		setTimeout(() => {
			if (n > 0) {
				addBanana();
			}
			n--;
			loop();
		}, 500);
	})();
}

function addBanana() {
	const currentBananas = parseInt($('#current-banana-count').text());
	$('#current-banana-count').text(currentBananas + 1);
	$('#current-banana-count-text').text(currentBananas + 1 === 1 ? 'Banana' : 'Bananas');

	let banana = $('<img src="images/banana.png" />');
	banana.addClass('banana');
	$('#background #bananas').append(banana);
}

function endGame() {
	const gameOver = $('#game-over');
	const finalBananaCount = $('#final-banana-count');

	gameOver.css('transition', 'opacity 0.5s ease-in-out');
	gameOver.css('display', 'flex');
	gameOver.css('opacity', '1');
	gameOver.css('pointer-events', 'all');

	finalBananaCount.text($('#current-banana-count').text());
	$('#final-banana-count-text').text($('#current-banana-count').text() === '1' ? 'Banana!' : 'Bananas!');

	let bananaCount = parseInt($('#current-banana-count').text());
	if (bananaCount === 50) {
		$('#final-adjective').text('World Class!');
		$('#final-monkey img').css('content', 'url(images/excited_monkey.svg)');
	} else if (bananaCount >= 40) {
		$('#final-adjective').text('Phenomenal!');
		$('#final-monkey img').css('content', 'url(images/winking_monkey.svg)');
	} else if (bananaCount >= 30) {
		$('#final-adjective').text('Excellent!');
		$('#final-monkey img').css('content', 'url(images/goofy_monkey.svg)');
	} else if (bananaCount >= 20) {
		$('#final-adjective').text('Decent!');
		$('#final-monkey img').css('content', 'url(images/neutral_monkey.svg)');
	} else if (bananaCount >= 10) {
		$('#final-adjective').text('Mediocre!');
		$('#final-monkey img').css('content', 'url(images/sad_monkey.svg)');
	} else if (bananaCount > 0) {
		$('#final-adjective').text('Poor!');
		$('#final-monkey img').css('content', 'url(images/crying_monkey.svg)');
	} else {
		$('#final-adjective').text('Abysmal!');
		$('#final-monkey img').css('content', 'url(images/dead_monkey.svg)');
	}
}

$('#play-again').on('click', function () {
	$('#current-banana-count').text('0');
	$('#bananas-collected-text').text('');
	$('#bananas-collected-text').css('opacity', '0');
	$('#background #bananas').css('border-width', '0px');
	$('#background #bananas .banana').remove();
	$('#background #bananas').css('height', '');
	$('#background #bananas').css('margin-bottom', '');
	$('#game-over').css('opacity', '0');
	$('#game-over').css('pointer-events', 'none');
	search.removeClass('searching');
	search.children('span').text('Search!');
	search.css('z-index', '');

	remainingAttempts.each((index, bananaImage) => {
		$(bananaImage).css('filter', '');
	});

	setRandomAngle();
});

$('#share').on('mousedown', function (e) {
	if (typeof window.ontouchstart != 'undefined' && e.type == 'mousedown') return;

	$('#share').one('mouseup', function () {
		let shareText = `I found ${$('#current-banana-count').text()} banana${$('#current-banana-count').text() !== '1' ? 's' : ''} in Banana Bonanza! Can you beat my score? https://jacobkulberg.com/projects/banana-bonanza/`;

		copyTextToClipboard(shareText);
	});

	$window.one('mouseup', function () {
		$('#share').off('mouseup');
	});
});

$('#share').on('touchstart', function () {
	$('#share').one('touchend', function () {
		let shareText = `I found ${$('#current-banana-count').text()} banana${$('#current-banana-count').text() !== '1' ? 's' : ''} in Banana Bonanza! Can you beat my score? https://jacobkulberg.com/projects/banana-bonanza/`;

		if (navigator.canShare) {
			navigator.share({
				text: shareText,
			});
		} else {
			copyTextToClipboard(shareText);
		}
	});

	$window.one('touchend', function () {
		$('#share').off('touchend');
	});
});

function copyTextToClipboard(shareText) {
	navigator.clipboard.writeText(shareText);

	$('#share').text('Copied!');
}
