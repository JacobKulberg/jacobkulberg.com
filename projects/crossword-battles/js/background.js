const wordsArr = Object.keys(CLUES);

function generateRandomWord() {
	let randWord;

	do {
		randWord = wordsArr[Math.floor(Math.random() * wordsArr.length)];
	} while (randWord.length > 6 || randWord.length < 3);

	return randWord;
}

function placeFlyingWord() {
	const randWord = generateRandomWord();

	const flyingWord = $('<div class="flying-word"></div>').text(randWord);
	flyingWord.appendTo('.word-container');

	const randY = Math.floor(Math.random() * (window.innerHeight - flyingWord.height())) + flyingWord.height() / 2;
	const randDuration = 2 * ((Math.floor(Math.random() * 2) == 0 ? 1 : -1) * Math.floor(Math.random() * 1000) + 5000);

	let comeFromRight = Math.floor(Math.random() * 2) == 0;
	if (comeFromRight) {
		flyingWord.css({
			right: flyingWord.width() * -1,
			top: randY,
			transform: `translateX(${(window.innerWidth + flyingWord.width()) * -1}px)`,
			transitionDuration: `${randDuration}ms`,
		});
	} else {
		flyingWord.css({
			left: flyingWord.width() * -1,
			top: randY,
			transform: `translateX(${window.innerWidth + flyingWord.width()}px)`,
			transitionDuration: `${randDuration}ms`,
		});
	}

	setTimeout(() => {
		flyingWord.remove();
	}, randDuration);
}

setInterval(placeFlyingWord, 150);

$(window).on('resize orientationchange visibilitychange', function () {
	$('.flying-word').remove();
});
