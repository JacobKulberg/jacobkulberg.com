import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, get, set, onValue, onDisconnect, remove } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const firebaseConfig = {
	apiKey: 'AIzaSyAgjbKos0U0yjMZrg-YNkWbrso1WydnqlA',
	authDomain: 'crossword-7817d.firebaseapp.com',
	databaseURL: 'https://crossword-7817d-default-rtdb.firebaseio.com',
	projectId: 'crossword-7817d',
	storageBucket: 'crossword-7817d.appspot.com',
	messagingSenderId: '635238600547',
	appId: '1:635238600547:web:04fef989a96d16531fcd56',
	measurementId: 'G-XWMHZFW5RP',
};

let app, database, auth;

async function init() {
	// Initialize Firebase
	app = initializeApp(firebaseConfig);
	database = getDatabase(app);
	auth = getAuth(app);

	window.app = app;
	window.database = database;
	window.auth = auth;
	window.get = get;
	window.set = set;
	window.ref = ref;
	window.onValue = onValue;
	window.remove = remove;

	try {
		await signInAnonymously(auth);
		console.log('Authenticated anonymously');

		onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log('User signed in:', user.uid);
			} else {
				console.log('User signed out');
			}
		});

		startGame();
	} catch (error) {
		console.error('Authentication failed:', error);
	}
}

//* INITIALIZE FIREBASE *//
$(window).load(init);

let code = '';

function startGame() {
	code = window.location.hash.slice(1, 5);

	window.code = code;

	let player1Ref = ref(database, `games/${code}/player1`);
	let player2Ref = ref(database, `games/${code}/player2`);
	onValue(player2Ref, (snapshot) => {
		if (snapshot.exists()) {
			$('.waiting-for-opponent').addClass('opponent-found');
			$('.waiting-for-opponent').text('Opponent found!');

			setTimeout(async () => {
				$('.waiting-for-opponent').hide();
				$('.waiting-for-opponent-code').hide();

				$('.crossword-loading-anim-container h1').css('display', 'block');

				let numRows = (await get(ref(database, `games/${code}/numRows`))).val();
				let numColumns = (await get(ref(database, `games/${code}/numColumns`))).val();

				crosswordLoadingAnimation(numRows, numColumns);

				if ((await get(player1Ref)).val() === auth.currentUser.uid) {
					buildCrosswordInWorker(numRows, numColumns)
						.then(async (grid) => {
							console.log('Crossword grid:', grid);
							set(ref(database, `games/${code}/grid`), grid);
							set(ref(database, `games/${code}/lastWrite`), Date.now());

							let acrossClues = [];
							let downClues = [];

							for (let i = 0; i < numRows; i++) {
								for (let j = 0; j < numColumns; j++) {
									if (i != 0 && j != 0) continue;

									let acrossClue = null;
									let downClue = null;

									if (j == 0) {
										let word = getWordFromGrid(grid, i, j, 'across');
										let randClueIndex = Math.floor(Math.random() * CLUES[word].length);
										acrossClue = CLUES[word][randClueIndex];
									}
									if (i == 0) {
										let word = getWordFromGrid(grid, i, j, 'down');
										let randClueIndex = Math.floor(Math.random() * CLUES[word].length);
										downClue = CLUES[word][randClueIndex];
									}

									if (acrossClue) acrossClues.push(acrossClue);
									if (downClue) downClues.push(downClue);
								}
							}

							set(ref(database, `games/${code}/acrossClues`), acrossClues);
							set(ref(database, `games/${code}/downClues`), downClues);
							set(ref(database, `games/${code}/lastWrite`), Date.now());
						})
						.catch((error) => {
							console.error('Error:', error);
						});
				}
			}, 2000);
		}
	});

	let gameRef = ref(database, `games/${code}`);
	onDisconnect(gameRef).remove();

	onValue(gameRef, async (snapshot) => {
		if (!snapshot.exists()) {
			console.error('Game does not exist');

			if (window.location.pathname !== '/projects/crossword-battles/' && window.location.hash.slice(5) !== '?rematch') {
				window.location.href = '/projects/crossword-battles/';
			}

			window.location.hash = window.location.hash.slice(0, 5);
		}
	});

	let downCluesRef = ref(database, `games/${code}/downClues`);
	onValue(downCluesRef, async (snapshot) => {
		if (snapshot.exists()) {
			let grid = (await get(ref(database, `games/${code}/grid`))).val();
			let acrossClues = (await get(ref(database, `games/${code}/acrossClues`))).val();
			let downClues = (await get(ref(database, `games/${code}/downClues`))).val();

			finishCrosswordLoadingAnimation(grid, acrossClues, downClues, database, ref, set, code);
		}
	});
}

function getWordFromGrid(grid, row, col, direction) {
	let word = '';
	let rows = grid.length;
	let cols = grid[0].length;

	if (direction === 'across') {
		while (col < cols && grid[row][col] !== '') {
			word += grid[row][col];
			col++;
		}
	} else {
		while (row < rows && grid[row][col] !== '') {
			word += grid[row][col];
			row++;
		}
	}

	return word;
}
