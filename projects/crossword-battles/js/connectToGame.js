import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, get, set, remove } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

import { getJoinCode } from './enterCode.js';

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

	try {
		await signInAnonymously(auth);
		console.log('Authenticated anonymously');

		await removeInactiveGames();
		await removeInvalidGames();

		onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log('User signed in:', user.uid);
			} else {
				console.log('User signed out');
			}
		});

		// Create game button
		$('.play-button').on('click tap', (e) => createGame(e));

		// Join game button
		$('.join-game-button').on('click tap', (e) => joinGame(e));

		// Join game from link
		if (window.location.pathname === '/projects/crossword-battles/game/') {
			if (window.location.hash) {
				joinGameFromLink(window.location.hash.slice(1, 5));
			} else {
				redirectToHome();
			}
		}
	} catch (error) {
		console.error('Authentication failed:', error);
	}
}

/*
 * CREATE GAME FLOW:
 * 1. User selects race/battle mode and sets number of rows/columns
 * 2. User clicks "Create Game" button
 * 3. Unique game code is generated, checked with other current game codes
 * 4. Game is created in DB with
 *    - player1 as anonymous user1 id
 *    - game mode as "race" or "battle"
 *    - rows and columns as integers 3-6
 * 5. User is redirected to game page with game code in URL
 */

//! Step 2
async function createGame(e, gameMode = '', numRows = 0, numColumns = 0, overrideCurrentGame = false) {
	e.preventDefault();
	e.stopPropagation();

	//! Step 1
	// Get input
	if (!gameMode || !numRows || !numColumns) {
		gameMode = $('.race-mode').hasClass('selected') ? 'race' : $('.battle-mode').hasClass('selected') ? 'battle' : null;
		numRows = parseInt($('.num-rows').attr('size'));
		numColumns = parseInt($('.num-columns').attr('size'));
	}

	if (!isValidInput(gameMode, numRows, numColumns)) return;

	//! Step 3
	let code = '';
	do {
		code = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, '0');
	} while (
		// Check if game code already exists in DB
		await isValidGame(code, false)
	);

	// Check if game code is a 4 digit number
	if (!isValidCode(code)) return;

	const userId = auth.currentUser ? auth.currentUser.uid : null;

	if (!userId) {
		console.error('User not authenticated');
		return;
	}

	const gameRef = ref(database, 'games/' + code);

	try {
		// Check if user is already in a game
		if (!overrideCurrentGame && (await isInGame(code))) return;

		//! Step 4
		await set(gameRef, {
			player1: userId,
			gameMode: gameMode,
			numRows: numRows,
			numColumns: numColumns,
			lastWrite: Date.now(),
		});
		console.log('Connected as Player 1');

		//! Step 5
		window.location.href = `/projects/crossword-battles/game/#${code}?createGame`;

		return code;
	} catch (err) {
		console.error('Error creating game:', err);
	}
}

/*
 * JOIN GAME FLOW:
 * 1. User enters game code
 * 2. User clicks "Join Game" button
 * 3. Game code is checked to ensure it is a valid code
 * 4. DB is updated with player2 as anonymous user2 id
 * 5. User is redirected to game page with game code in URL
 */

//! Step 2
async function joinGame(e, code = null, setDB = false) {
	e.preventDefault();
	e.stopPropagation();

	//! Step 1
	code = code || getJoinCode();

	//! Step 3
	// Check if game code is a 4 digit number
	if (!isValidCode(code)) return;

	// Check if game exists
	if (!(await isValidGame(code))) {
		redirectToHome();
		return;
	}

	const userId = auth.currentUser ? auth.currentUser.uid : null;

	if (!userId) {
		console.error('User not authenticated');
		return;
	}

	const player2Ref = ref(database, 'games/' + code + '/player2');
	const lastWriteRef = ref(database, 'games/' + code + '/lastWrite');

	try {
		if ((await get(player2Ref)).val()) {
			errorModal('Game is full!');
			return;
		}

		// Check if user is already in a game
		if (await isInGame(code)) return;

		//! Step 4
		if (setDB) {
			await set(player2Ref, userId);
			await set(lastWriteRef, Date.now());
			console.log('Connected as Player 2');
		}

		//! Step 5
		window.location.href = `/projects/crossword-battles/game/#${code}`;
	} catch (err) {
		console.error('Error joining game:', err);
	}
}

async function joinGameFromLink(code) {
	joinGame({ preventDefault: () => {}, stopPropagation: () => {} }, code, true);
}

//* VALIDATION FUNCTIONS *//
async function isInGame(code) {
	const gamesRef = ref(database, 'games');
	const gamesSnapshot = await get(gamesRef);
	const userId = auth.currentUser ? auth.currentUser.uid : null;

	if (gamesSnapshot.exists()) {
		const games = gamesSnapshot.val();
		for (const [gameCode, gameData] of Object.entries(games)) {
			if (gameData.player1 === userId || gameData.player2 === userId) {
				if (window.location.hash.slice(5) !== '?createGame') {
					if (gameCode === code) {
						console.warn(`User already in this game\nNot rejoining game: ${code}`);
						errorModal('You are already in this game!');
					} else {
						remove(ref(database, 'games/' + gameCode));
						return false;
					}
				}

				// Remove createGame flag from URL
				if (window.location.hash.slice(5) === '?createGame') {
					window.location.hash = window.location.hash.slice(0, 5);
				}

				return true;
			}
		}
	}

	return false;
}

function isValidCode(code) {
	if (!/^\d{4}$/.test(code)) {
		console.error('Invalid game code');

		redirectToHome();

		return false;
	}

	return true;
}

async function isValidGame(code, printError = true) {
	if (!(await get(ref(database, 'games/' + code)).then((snapshot) => snapshot.exists()))) {
		if (printError) {
			console.error('Game does not exist');
			errorModal('Game does not exist!');
		}

		return false;
	}

	return true;
}

function isValidInput(gameMode, numRows, numColumns) {
	if (!gameMode || !numRows || !numColumns) {
		console.error('Invalid input');
		return false;
	}

	return true;
}

function redirectToHome() {
	if (window.location.pathname !== '/projects/crossword-battles/' && window.location.hash.slice(5) !== '?rematch') {
		window.location.href = '/projects/crossword-battles/';
	}

	window.location.hash = window.location.hash.slice(0, 5);
}

//* INITIALIZE FIREBASE *//
$(window).load(init);

// Remove games that have not been updated in the last hour
async function removeInactiveGames() {
	let gamesRef = ref(database, 'games');
	let gamesSnapshot = await get(gamesRef);
	let currentTime = Date.now();
	for (let game in gamesSnapshot.val()) {
		let lastWrite = gamesSnapshot.val()[game].lastWrite;
		if (currentTime - lastWrite > 60 * 60 * 1000) {
			remove(ref(database, 'games/' + game));
		}
	}
}

// Remove games that have fields that shouldn't exist
async function removeInvalidGames() {
	let validFields = ['player1', 'player2', 'gameMode', 'numRows', 'numColumns', 'lastWrite', 'grid', 'startedAt', 'loserTime', 'finishedAt', 'downClues', 'acrossClues', 'newCode', 'forfeit'];

	let gamesRef = ref(database, 'games');
	let gamesSnapshot = await get(gamesRef);
	for (let game in gamesSnapshot.val()) {
		for (let field in gamesSnapshot.val()[game]) {
			if (!validFields.includes(field)) {
				remove(ref(database, 'games/' + game));
			}
		}
	}
}

window.createGame = createGame;
