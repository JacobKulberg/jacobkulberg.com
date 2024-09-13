// Get the div element
let yourTime = $('.time-you h1 div')[0];
let oppTime = $('.time-opponent h1 div')[0];

// Create a function that will be called when text changes
const observerCallback = (mutationsList, observer) => {
	for (let mutation of mutationsList) {
		if (mutation.type === 'childList') {
			let timeFormat = /^[0-9]+:[0-5][0-9]\.[0-9]{1,3}$/;
			let time1 = yourTime.innerText;
			let time2 = oppTime.innerText;

			if ((timeFormat.test(time1) || time1 == 'DNF') && (timeFormat.test(time2) || time2 == 'DNF')) {
				let time1Seconds = time1 == 'DNF' ? Number.MAX_SAFE_INTEGER : time1.split(':')[0] * 60 + parseFloat(time1.split(':')[1]);
				let time2Seconds = time2 == 'DNF' ? Number.MAX_SAFE_INTEGER : time2.split(':')[0] * 60 + parseFloat(time2.split(':')[1]);

				if (time1Seconds < time2Seconds) {
					$('.result-text').text('You win!');
					$('.result-text').addClass('win');
				} else if (time1Seconds > time2Seconds) {
					$('.result-text').text('You lose!');
					$('.result-text').addClass('lose');
				} else {
					$('.result-text').text('Draw!');
				}

				setTimeout(() => {
					$('.result-text').css('opacity', 1);
					$('.end-game-buttons-container').css('opacity', 1);

					$('.rematch').css('pointer-events', 'auto');
					$('.quit').css('pointer-events', 'auto');
				}, 4000);
			}
		}
	}
};

// Create a MutationObserver and pass in the callback
const observer = new MutationObserver(observerCallback);

// Start observing the target node for changes in the child elements (text changes)
observer.observe(yourTime, { childList: true });
observer.observe(oppTime, { childList: true });

$('.quit').on('click tap', function () {
	window.location.href = '/projects/crossword-battles/';
});

$('.rematch').on('click tap', async function (e) {
	e.preventDefault();
	e.stopPropagation();

	$('.rematch').prop('disabled', true);

	let isFirstRematch = (await window.get(window.ref(window.database, `games/${window.code}/rematch`))).val() === null;

	if (isFirstRematch) {
		window.set(window.ref(window.database, `games/${window.code}/rematch`), window.auth.currentUser.uid);

		window.onValue(window.ref(window.database, `games/${window.code}/newCode`), (snapshot) => {
			if (snapshot.exists()) {
				location.hash = snapshot.val() + '?rematch';
				setInterval(() => {
					location.reload();
				}, 500);
			}
		});
	} else {
		let gameMode = (await window.get(window.ref(window.database, `games/${window.code}/gameMode`))).val();
		let numRows = (await window.get(window.ref(window.database, `games/${window.code}/numRows`))).val();
		let numColumns = (await window.get(window.ref(window.database, `games/${window.code}/numColumns`))).val();

		let newCode = await window.createGame({ preventDefault: () => {}, stopPropagation: () => {} }, gameMode, numRows, numColumns, true);
		window.set(window.ref(window.database, `games/${window.code}/newCode`), newCode);

		location.reload();
	}
});
