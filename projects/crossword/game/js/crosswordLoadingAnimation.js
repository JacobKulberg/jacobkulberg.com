let loadingAnimIntervalId = null;
function crosswordLoadingAnimation(rows, cols) {
	let crosswordLoadingAnimation = $('.crossword-loading-anim');

	for (let i = 0; i < rows; i++) {
		let row = $('<div class="crossword-loading-anim-row"></div>');

		for (let j = 0; j < cols; j++) {
			let cell = $('<div class="crossword-loading-anim-col"></div>');
			row.append(cell);
		}

		crosswordLoadingAnimation.append(row);
	}

	loadingAnimIntervalId = setInterval(nextLoadingAnimationIteration.bind({ rows, cols }), 75);
}

function nextLoadingAnimationIteration() {
	let randRow = Math.floor(Math.random() * this.rows);
	let randCol = Math.floor(Math.random() * this.cols);

	$('.crossword-loading-anim-row').eq(randRow).children().eq(randCol).toggleClass('crossword-loading-anim-col-black');
}

function finishCrosswordLoadingAnimation(grid, acrossClues, downClues, database, ref, set, code) {
	clearInterval(loadingAnimIntervalId);

	let remaining = $('.crossword-loading-anim-col:not(.crossword-loading-anim-col-black)');

	let valid = true;

	let finishAnimInterval = 2000 / remaining.length;

	let finishAnimIntervalId = setInterval(function () {
		valid = finishCrosswordLoadingAnimationIteration(remaining);

		if (!valid) {
			clearInterval(finishAnimIntervalId);

			setTimeout(async () => {
				let isPlayer1 = (await get(ref(database, `games/${code}/player1`))).val() === window.auth.currentUser.uid;

				if (isPlayer1) {
					let startedAt = Date.now();
					set(ref(database, `games/${code}/startedAt`), startedAt);
					set(ref(database, `games/${code}/lastWrite`), startedAt);
				}

				playGame(grid, acrossClues, downClues, startedAt);
			}, 1000);
		}
	}, finishAnimInterval);
}

function finishCrosswordLoadingAnimationIteration(remaining) {
	if (remaining.length > 0) {
		let randCell = Math.floor(Math.random() * remaining.length);
		remaining.eq(randCell).addClass('crossword-loading-anim-col-black');
		remaining.splice(randCell, 1);
		return true;
	} else {
		return false;
	}
}
