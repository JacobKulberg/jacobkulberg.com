let expirationDate = new Date();
expirationDate.setFullYear(expirationDate.getFullYear() + 1);

let guessedLetterCount = 0;
let hardMode = false;
let hasFinished = false;
let gamesPlayed = 0;

let day = Math.ceil((new Date().getTime() - new Date('7/17/2022').getTime()) / (1000 * 3600 * 24));

document.addEventListener('DOMContentLoaded', async () => {
	let nextLettle = new Date();
	nextLettle.setDate(nextLettle.getDate() + 1);
	nextLettle.setHours(0, 0, 0, 0);

	let countdownDate = nextLettle.getTime();
	let now = new Date().getTime();
	let distance = countdownDate - now;
	let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	document.getElementById('nextLettle').innerHTML = `${hours.toString().length > 1 ? hours : `0${hours}`}:${minutes.toString().length > 1 ? minutes : `0${minutes}`}:${seconds.toString().length > 1 ? seconds : `0${seconds}`}`;
	setInterval(function () {
		let nextLettle = new Date();
		nextLettle.setDate(nextLettle.getDate() + 1);
		nextLettle.setHours(0, 0, 0, 0);

		let countdownDate = nextLettle.getTime();
		let now = new Date().getTime();
		let distance = countdownDate - now;
		let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((distance % (1000 * 60)) / 1000);
		document.getElementById('nextLettle').innerHTML = `${hours.toString().length > 1 ? hours : `0${hours}`}:${minutes.toString().length > 1 ? minutes : `0${minutes}`}:${seconds.toString().length > 1 ? seconds : `0${seconds}`}`;
	}, 1000);

	document.getElementById('practiceHeader').style.display = 'none';
	document.getElementById('body').style.minHeight = '644px';
	document.getElementById('practiceButton').textContent = 'Play!';

	let letter;
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';

	await fetch('./json/letters.json')
		.then((response) => response.json())
		.then((data) => {
			letter = data[day];
		});

	let guessedLetters = [[]];
	let availableSpace = 1;

	const keys = document.querySelectorAll('.keyboard-row button');

	for (const key of keys) {
		if (keys[0].innerHTML == 'a' && (key.innerHTML == 'a' || key.innerHTML == 'k' || key.innerHTML == 't')) {
			key.style.marginLeft = '6px';
		} else if (keys[0].innerHTML == 'q' && (key.innerHTML == 'q' || key.innerHTML == 'a' || key.innerHTML == 'z')) {
			key.style.marginLeft = '6px';
		}
	}

	const restart = document.getElementById('restart-button');

	createSquares();

	if ((document.cookie.match(/^(?:.*;)?\s*lastStarted\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] != day) {
		document.cookie = 'letter1=a;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
		document.cookie = 'letter2=a;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
		document.cookie = 'letter3=a;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
		document.cookie = 'letter4=a;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
	}

	if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day - 1) {
		let curStreak = 'curStreak=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = curStreak;
	}

	if ((document.cookie.match(/^(?:.*;)?\s*lastStarted\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == day && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] != day) {
		if ((document.cookie.match(/^(?:.*;)?\s*letter1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
			await updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
		}
		if ((document.cookie.match(/^(?:.*;)?\s*letter2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
			await updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
		}
		if ((document.cookie.match(/^(?:.*;)?\s*letter3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
			await updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
		}
	}

	if (!(document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let numPlayed = 'numPlayed=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = numPlayed;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let numWon = 'numWon=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = numWon;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let curStreak = 'curStreak=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = curStreak;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*maxStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let maxStreak = 'maxStreak=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = maxStreak;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*solved1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let solved1 = 'solved1=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = solved1;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*solved2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let solved2 = 'solved2=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = solved2;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*solved3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let solved3 = 'solved3=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = solved3;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*solved4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let solved4 = 'solved4=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = solved4;
	}
	if (!(document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		let solvedIn = 'solvedIn=0; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = solvedIn;
	}

	if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == day && (document.cookie.match(/^(?:.*;)?\s*lastStarted\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == day) {
		enableEndSplashScreen();
	}

	document.getElementById('numPlayed').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);

	if ((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] > 0) {
		document.getElementById('winPercent').textContent = Math.round((parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) / parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])) * 100);
	}

	document.getElementById('curStreak').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);

	document.getElementById('maxStreak').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*maxStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);

	chart.updateOptions({
		series: [
			{
				data: [(document.cookie.match(/^(?:.*;)?\s*solved1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) - parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])],
			},
		],
	});

	let titles = document.querySelectorAll('title');
	for (let i = 0; i < titles.length; i++) {
		if (titles[i].textContent !== 'Lettle!') {
			titles[i].textContent = '';
		}
	}

	if (((document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == 0 || (document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= 1) && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= day && (document.cookie.match(/^(?:.*;)?\s*letter1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], true);
	}
	if (((document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == 0 || (document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= 2) && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= day && (document.cookie.match(/^(?:.*;)?\s*letter2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], true);
	}
	if (((document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == 0 || (document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= 3) && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= day && (document.cookie.match(/^(?:.*;)?\s*letter3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], true);
	}
	if (((document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == 0 || (document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= 4) && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= day && (document.cookie.match(/^(?:.*;)?\s*letter4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) {
		updateGuessedLetters((document.cookie.match(/^(?:.*;)?\s*letter4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], true);
	}

	if (hasFinished) {
		document.getElementById('shareButton').style.display = 'inline';
	}

	if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] >= day) {
		let columnColors = options.colors;
		if ((document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == 0) {
			columnColors[4] = '#FF4444';
		} else {
			columnColors[(document.cookie.match(/^(?:.*;)?\s*solvedIn\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] - 1] = '#538D4E';
		}
		chart.updateOptions({
			colors: columnColors,
		});
	}

	function getCurrentLetterArr() {
		const availableSpace = guessedLetters.length;
		return guessedLetters[availableSpace - 1];
	}

	function updateGuessedLetters(guess, force) {
		const currentLetterArr = getCurrentLetterArr();

		if (!hasFinished && currentLetterArr && currentLetterArr.length < 1) {
			let keyEl = document.querySelector(`[data-key='${guess}']`);
			if (!force && keyEl.style.cursor == 'default') return;
			keyEl.style.backgroundColor = getTileColor(guess);
			keyEl.style.cursor = 'default';

			if (!hardMode) {
				if (letter < guess) {
					for (let i = guess.charCodeAt(0) + 1; i < 123; i++) {
						keyEl = document.querySelector(`[data-key='${String.fromCharCode(i)}']`);
						keyEl.style.cursor = 'default';
					}
					let i = guess.charCodeAt(0) + 1;

					function removeUnnecessary() {
						if (i >= 123) return;
						setTimeout(function () {
							keyEl = document.querySelector(`[data-key='${String.fromCharCode(i)}']`);
							if (keyEl.style.backgroundColor == '' || keyEl.style.backgroundColor == 'rgb(129, 131, 132)') keyEl.style.backgroundColor = '#3A3A3C';
							i++;
							if (i < 123) {
								removeUnnecessary();
							}
						}, 30);
					}

					removeUnnecessary();
				} else if (letter > guess) {
					for (let i = guess.charCodeAt(0) - 1; i > 96; i--) {
						keyEl = document.querySelector(`[data-key='${String.fromCharCode(i)}']`);
						keyEl.style.cursor = 'default';
					}
					let i = guess.charCodeAt(0) - 1;

					let currentGamesPlayed = gamesPlayed;
					function removeUnnecessary() {
						if (i <= 96) return;
						setTimeout(function () {
							keyEl = document.querySelector(`[data-key='${String.fromCharCode(i)}']`);
							if ((keyEl.style.backgroundColor == '' || keyEl.style.backgroundColor == 'rgb(129, 131, 132)') && gamesPlayed == currentGamesPlayed) keyEl.style.backgroundColor = '#3A3A3C';
							i--;
							if (i > 96) {
								removeUnnecessary();
							}
						}, 30);
					}

					removeUnnecessary();
				}
			}

			currentLetterArr.push(guess);

			const availableSpaceEl = document.getElementById(String(availableSpace));
			availableSpace++;

			if (availableSpaceEl) availableSpaceEl.textContent = guess;

			submitLetter();
		}
	}

	function createSquares() {
		const gameBoard = document.getElementById('board');

		for (let i = 0; i < 4; i++) {
			let square = document.createElement('div');
			square.classList.add('square');
			square.classList.add('animate__animated');
			square.setAttribute('id', i + 1);
			gameBoard.appendChild(square);
		}
	}

	function getTileColor(currentLetter) {
		if (guessedLetterCount == 3 && currentLetter != letter) return '#FF4444';
		if (letter < currentLetter) return '#1B8AE4';
		if (letter > currentLetter) return '#AD5713';
		return '#538D4E';
	}

	function submitLetter() {
		const currentLetterArr = getCurrentLetterArr();

		if (currentLetterArr.length === 1 && guessedLetters.length <= 4) {
			if (guessedLetters.length <= 4 && (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day) {
				let letterX = `letter${guessedLetters.length}=${currentLetterArr[0]}; path=/; expires=` + expirationDate.toUTCString();
				document.cookie = letterX;
			}

			let lastStarted = `lastStarted=${day}; path=/; expires=` + expirationDate.toUTCString();
			document.cookie = lastStarted;

			const currentLetter = currentLetterArr.join('');

			const tileColor = getTileColor(currentLetterArr[0]);

			const letterID = guessedLetterCount + 1;
			const letterEl = document.getElementById(letterID);
			letterEl.classList.add('animate__flipInX');
			letterEl.style = `background-color: ${tileColor};border-color: ${tileColor};`;

			guessedLetterCount++;

			if (currentLetter === letter) {
				if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day) {
					let numPlayed = `numPlayed=${parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = numPlayed;
					let solvedIn = `solvedIn=${guessedLetterCount}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = solvedIn;
					if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] === null || (document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] == day - 1) {
						let curStreak = `curStreak=${parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
						document.cookie = curStreak;
					} else if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day - 1) {
						let curStreak = `curStreak=1; path=/; expires=` + expirationDate.toUTCString();
						document.cookie = curStreak;
					}
					let lastPlayed = `lastPlayed=${day}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = lastPlayed;
					document.getElementById('numPlayed').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
					let numWon = `numWon=${parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = numWon;
					document.getElementById('winPercent').textContent = Math.round((parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) / parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])) * 100);
					document.getElementById('curStreak').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
					if (parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) > parseInt((document.cookie.match(/^(?:.*;)?\s*maxStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])) {
						let maxStreak = `maxStreak=${parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])}; path=/; expires=` + expirationDate.toUTCString();
						document.cookie = maxStreak;
						document.getElementById('maxStreak').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*maxStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
					}
					let columnColors = options.colors;
					columnColors[guessedLetterCount - 1] = tileColor;
					chart.updateOptions({
						colors: columnColors,
					});
					let solvedX;
					if (guessedLetterCount == 1) solvedX = `solved1=${parseInt((document.cookie.match(/^(?:.*;)?\s*solved1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					if (guessedLetterCount == 2) solvedX = `solved2=${parseInt((document.cookie.match(/^(?:.*;)?\s*solved2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					if (guessedLetterCount == 3) solvedX = `solved3=${parseInt((document.cookie.match(/^(?:.*;)?\s*solved3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					if (guessedLetterCount == 4) solvedX = `solved4=${parseInt((document.cookie.match(/^(?:.*;)?\s*solved4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = solvedX;
					chart.updateOptions({
						series: [
							{
								data: [(document.cookie.match(/^(?:.*;)?\s*solved1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) - parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])],
							},
						],
					});
				}
				confetti.start();
				letterEl.classList.remove('animate__flipInX');
				letterEl.classList.add('animate__rubberBand');
				restart.style.pointerEvents = 'fill';
				restart.style.transition = 'opacity 0.5s linear';
				restart.style.opacity = 1;
				restart.style.visibility = 'visible';
				hasFinished = true;
				let currentGamesPlayed = gamesPlayed;
				setTimeout(function () {
					if (currentGamesPlayed == gamesPlayed) {
						confetti.stop();
					}
				}, 3000);
				setTimeout(function () {
					if (document.getElementById('practiceHeader').style.display == 'none') {
						enableEndSplashScreen();
					}
				}, 1500);
			} else if (guessedLetters.length === 4) {
				if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day) {
					let numPlayed = `numPlayed=${parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) + 1}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = numPlayed;
					let solvedIn = `solvedIn=0; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = solvedIn;
					let lastPlayed = `lastPlayed=${day}; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = lastPlayed;
					document.getElementById('numPlayed').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
					document.getElementById('winPercent').textContent = Math.round((parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) / parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])) * 100);
					let curStreak = `curStreak=0; path=/; expires=` + expirationDate.toUTCString();
					document.cookie = curStreak;
					document.getElementById('curStreak').textContent = parseInt((document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]);
					let columnColors = options.colors;
					columnColors[4] = tileColor;
					chart.updateOptions({
						colors: columnColors,
					});
					chart.updateOptions({
						series: [
							{
								data: [(document.cookie.match(/^(?:.*;)?\s*solved1\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved2\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved3\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], (document.cookie.match(/^(?:.*;)?\s*solved4\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1], parseInt((document.cookie.match(/^(?:.*;)?\s*numPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]) - parseInt((document.cookie.match(/^(?:.*;)?\s*numWon\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1])],
							},
						],
					});
				}
				letterEl.classList.remove('animate__flipInX');
				letterEl.classList.add('animate__wobble');
				restart.style.pointerEvents = 'fill';
				restart.style.transition = 'opacity 0.5s linear';
				restart.style.opacity = 1;
				restart.style.visibility = 'visible';
				document.getElementById('letter').textContent = letter.toUpperCase();
				document.getElementById('youLose').style.opacity = 1;
				hasFinished = true;
				setTimeout(function () {
					if (document.getElementById('practiceHeader').style.display == 'none') {
						enableEndSplashScreen();
					}
				}, 1500);
			}
			guessedLetters.push([]);
		}
	}

	document.addEventListener('keydown', function (e) {
		if (!document.getElementById('splash-screen').style.opacity || document.getElementById('settings').style.opacity == 1 || document.getElementById('info').style.opacity == 1) return;

		if (!e.repeat && e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
			if (e.key.length === 1) {
				updateGuessedLetters(e.key.toLowerCase());
			}
		}
	});

	for (let i = 0; i < keys.length; i++) {
		keys[i].onclick = ({ target }) => {
			const letter = target.getAttribute('data-key');

			updateGuessedLetters(letter);
		};
	}

	restart.onclick = () => {
		hasFinished = false;

		gamesPlayed++;

		guessedLetters = [[]];
		availableSpace = 1;

		letter = alphabet.charAt(Math.random() * 26);

		guessedLetterCount = 0;

		chart.updateOptions({
			colors: ['#555', '#555', '#555', '#555', '#555'],
		});

		document.getElementById('1').style = '';
		document.getElementById('1').textContent = '';
		document.getElementById('1').className = 'square animate__animated';
		document.getElementById('2').style = '';
		document.getElementById('2').textContent = '';
		document.getElementById('2').className = 'square animate__animated';
		document.getElementById('3').style = '';
		document.getElementById('3').textContent = '';
		document.getElementById('3').className = 'square animate__animated';
		document.getElementById('4').style = '';
		document.getElementById('4').textContent = '';
		document.getElementById('4').className = 'square animate__animated';

		document.getElementById('youLose').style.opacity = 0;

		document.getElementById('practiceHeader').style.display = 'block';
		document.getElementById('body').style.minHeight = '682px';

		restart.style.pointerEvents = 'none';
		restart.style.transition = 'opacity 0s linear';
		restart.style.opacity = 0;
		restart.style.visibility = 'hidden';

		for (let i = 0; i < keys.length; i++) {
			keys[i].style.backgroundColor = '#818384';
			keys[i].style.cursor = 'pointer';
		}

		confetti.stop();
	};

	let practice = document.getElementById('practiceButton');
	practice.onclick = () => {
		if (!hasFinished) {
			return disableEndSplashScreen();
		}

		hasFinished = false;

		gamesPlayed++;

		guessedLetters = [[]];
		availableSpace = 1;

		letter = alphabet.charAt(Math.random() * 26);

		guessedLetterCount = 0;

		chart.updateOptions({
			colors: ['#555', '#555', '#555', '#555', '#555'],
		});

		document.getElementById('1').style = '';
		document.getElementById('1').textContent = '';
		document.getElementById('1').className = 'square animate__animated';
		document.getElementById('2').style = '';
		document.getElementById('2').textContent = '';
		document.getElementById('2').className = 'square animate__animated';
		document.getElementById('3').style = '';
		document.getElementById('3').textContent = '';
		document.getElementById('3').className = 'square animate__animated';
		document.getElementById('4').style = '';
		document.getElementById('4').textContent = '';
		document.getElementById('4').className = 'square animate__animated';

		document.getElementById('youLose').style.opacity = 0;

		document.getElementById('practiceHeader').style.display = 'block';
		document.getElementById('body').style.minHeight = '682px';

		restart.style.pointerEvents = 'none';
		restart.style.transition = 'opacity 0s linear';
		restart.style.opacity = 0;
		restart.style.visibility = 'hidden';

		for (let i = 0; i < keys.length; i++) {
			keys[i].style.backgroundColor = '#818384';
			keys[i].style.cursor = 'pointer';
		}

		confetti.stop();

		disableEndSplashScreen();
	};

	let share = document.getElementById('shareButton');
	share.onclick = () => {
		let statsStr = `Lettle ${day}\n`;
		for (let i = 0; i < guessedLetters.length - 1; i++) {
			if (i === 3 && guessedLetters[i][0].localeCompare(letter) !== 0) {
				statsStr += '🟥\n';
			} else if (guessedLetters[i][0].localeCompare(letter) === 0) {
				statsStr += '🟩\n';
			} else if (guessedLetters[i][0].localeCompare(letter) === -1) {
				statsStr += '🟧\n';
			} else if (guessedLetters[i][0].localeCompare(letter) === 1) {
				statsStr += '🟦\n';
			}
		}

		statsStr += `${(document.cookie.match(/^(?:.*;)?\s*curStreak\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1]}🔥`;
		if (isMobileBrowser()) {
			if (navigator.canShare({ text: statsStr })) {
				navigator.share({ text: statsStr });
			} else {
				navigator.clipboard.writeText(statsStr);
				document.getElementById('copied').style.opacity = 1;
				setTimeout(() => {
					document.getElementById('copied').style.opacity = 0;
				}, 3000);
			}
		} else {
			navigator.clipboard.writeText(statsStr);
			document.getElementById('copied').style.opacity = 1;
			setTimeout(() => {
				document.getElementById('copied').style.opacity = 0;
			}, 3000);
		}
	};
});

function disableEndSplashScreen() {
	let splashscreen = document.getElementById('end-splash-screen');
	let background = document.getElementById('end-splash-background');
	splashscreen.style.opacity = 0;
	splashscreen.style.pointerEvents = 'none';
	background.style.opacity = 0;
	background.style.pointerEvents = 'none';
}

function enableEndSplashScreen() {
	let titles = document.querySelectorAll('title');
	for (let i = 0; i < titles.length; i++) {
		if (titles[i].textContent !== 'Lettle!') {
			titles[i].textContent = '';
		}
	}

	let splashscreen = document.getElementById('end-splash-screen');
	let background = document.getElementById('end-splash-background');
	let share = document.getElementById('shareButton');
	let practice = document.getElementById('practiceHeader');
	if (practice.style.display == 'none' && hasFinished) {
		share.style.display = 'inline';
	} else {
		share.style.display = 'none';
	}
	if ((document.cookie.match(/^(?:.*;)?\s*lastPlayed\s*=\s*([^;]+)(?:.*)?$/) || [, null])[1] < day) {
		document.getElementById('practiceButton').textContent = 'Play!';
	} else {
		document.getElementById('practiceButton').textContent = 'Practice!';
	}
	splashscreen.style.opacity = 1;
	splashscreen.style.pointerEvents = 'auto';
	background.style.opacity = 1;
	background.style.pointerEvents = 'auto';
}

function toggleInfo() {
	let info = document.getElementById('info');

	if (info.style.opacity == 1) {
		info.style.opacity = 0;
		setTimeout(() => {
			info.style.display = 'none';
			document.getElementById('html').style.overflow = 'auto';
			document.getElementById('body').style.overflow = 'auto';
		}, 250);
		info.style.pointerEvents = 'none';
	} else {
		info.style.display = 'block';
		setTimeout(() => {
			info.style.opacity = 1;
			document.getElementById('html').style.overflow = 'hidden';
			document.getElementById('body').style.overflow = 'hidden';
		}, 0);
		info.style.pointerEvents = 'fill';
	}
}

let angle = 180;

function toggleSettings() {
	let settings = document.getElementById('settings');

	let cogs = document.getElementsByClassName('settings-cog');
	cogs[0].style.transform = `rotate(${angle}deg)`;
	cogs[1].style.transform = `rotate(${angle}deg)`;
	angle = angle == 0 ? 180 : 0;

	if (settings.style.opacity == 1) {
		settings.style.opacity = 0;
		settings.style.pointerEvents = 'none';
		document.getElementById('html').style.overflow = 'auto';
		document.getElementById('body').style.overflow = 'auto';
	} else {
		settings.style.opacity = 1;
		settings.style.pointerEvents = 'fill';
		document.getElementById('html').style.overflow = 'hidden';
		document.getElementById('body').style.overflow = 'hidden';
	}
}

function toggleAlphabeticalKeyboard() {
	const keys = document.querySelectorAll('.keyboard-row button');

	let styles = [];
	keys.forEach((key) => {
		styles.push({ letter: key.innerHTML, style: key.style.cssText });
	});

	if (keys[0].innerHTML == 'q') {
		let alphabet = 'abcdefghijklmnopqrstuvwxyz';
		document.getElementById('alphabetical').checked = true;
		let alphabetical = 'alphabetical=true; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = alphabetical;
		for (let i = 0; i < 26; i++) {
			keys[i].setAttribute('data-key', '' + alphabet.charAt(i));
			keys[i].innerHTML = '' + alphabet.charAt(i);
			keys[i].style =
				styles[
					styles.findIndex((key) => {
						return key.letter === alphabet.charAt(i);
					})
				].style;
		}
	} else {
		let alphabet = 'qwertyuiopasdfghjklzxcvbnm';
		document.getElementById('alphabetical').checked = false;
		let alphabetical = 'alphabetical=false; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = alphabetical;
		for (let i = 0; i < 26; i++) {
			keys[i].setAttribute('data-key', '' + alphabet.charAt(i));
			keys[i].innerHTML = '' + alphabet.charAt(i);
			keys[i].style =
				styles[
					styles.findIndex((key) => {
						return key.letter === alphabet.charAt(i);
					})
				].style;
		}
	}

	for (const key of keys) {
		if (keys[0].innerHTML == 'a' && (key.innerHTML == 'a' || key.innerHTML == 'k' || key.innerHTML == 't')) {
			key.style.marginLeft = '6px';
		} else if (keys[0].innerHTML == 'q' && (key.innerHTML == 'q' || key.innerHTML == 'a' || key.innerHTML == 'z')) {
			key.style.marginLeft = '6px';
		} else {
			key.style.marginLeft = '0px';
		}
	}
}

function disableSplashScreen() {
	let splashscreen = document.getElementById('splash-screen');
	if ((splashscreen.style.opacity = 0)) return;
	let background = document.getElementById('splash-background');
	splashscreen.style.opacity = 0;
	splashscreen.style.pointerEvents = 'none';
	setTimeout(() => {
		splashscreen.style.display = 'none';
	}, 250);
	background.style.opacity = 0;
	background.style.pointerEvents = 'none';
	setTimeout(() => {
		background.style.display = 'none';
	}, 250);
}

function toggleHardMode() {
	if (((hardMode = !hardMode), (document.getElementById('hard-mode').checked = hardMode), hardMode)) {
		let hmCookie = 'hardMode=true; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = hmCookie;
	} else {
		let hmCookie = 'hardMode=false; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = hmCookie;
	}
}

function swapInstructionLetters() {
	if (document.getElementById('swap-instruction').checked) {
		document.getElementById('blue').style.backgroundColor = '#ad5713';
		document.getElementById('blue').style.borderColor = '#ad5713';
		document.getElementById('orange').style.backgroundColor = '#1b8ae4';
		document.getElementById('orange').style.borderColor = '#1b8ae4';

		let swapCookie = 'swapInstruction=true; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = swapCookie;
	} else {
		document.getElementById('blue').style.backgroundColor = '#1b8ae4';
		document.getElementById('blue').style.borderColor = '#1b8ae4';
		document.getElementById('orange').style.backgroundColor = '#ad5713';
		document.getElementById('orange').style.borderColor = '#ad5713';

		let swapCookie = 'swapInstruction=false; path=/; expires=' + expirationDate.toUTCString();
		document.cookie = swapCookie;
	}
}

function isMobileBrowser() {
	let check = false;
	(function (a) {
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
}
