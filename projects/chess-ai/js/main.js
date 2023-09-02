$(function () {
	setupBoard();
	initFilesAndRanks();
	initKeys();
	initBoard120To64();
	initBoardVariables();
	initMVVLVA();

	parseFEN(STARTING_FEN);
});

function initFilesAndRanks() {
	// set all squares to offboard
	for (let i = 0; i < BOARD_SIZE; i++) {
		FILES_BOARD[i] = SQUARES.OFFBOARD;
		RANKS_BOARD[i] = SQUARES.OFFBOARD;
	}

	// init playable squares
	for (let rank = RANKS.ONE; rank <= RANKS.EIGHT; rank++) {
		for (let file = FILES.A; file <= FILES.H; file++) {
			let curSquare = getSquareAt(file, rank);
			FILES_BOARD[curSquare] = file;
			RANKS_BOARD[curSquare] = rank;
		}
	}
}

function initKeys() {
	for (let i = 0; i < BOARD_SIZE * 14; i++) {
		PIECE_KEYS[i] = getRand31BitInt();
	}

	for (let i = 0; i < 16; i++) {
		CASTLE_KEYS[i] = getRand31BitInt();
	}
}

function initBoard120To64() {
	for (let i = 0; i < BOARD_SIZE; i++) {
		BOARD_120_TO_64[i] = 64;
	}

	for (let i = 0; i < 64; i++) {
		BOARD_64_TO_120[i] = 120;
	}

	let board64Index = 0;
	for (let rank = RANKS.ONE; rank <= RANKS.EIGHT; rank++) {
		for (let file = FILES.A; file <= FILES.H; file++) {
			let curSquare = getSquareAt(file, rank);
			BOARD_64_TO_120[board64Index] = curSquare;
			BOARD_120_TO_64[curSquare] = board64Index;
			board64Index++;
		}
	}
}

function initBoardVariables() {
	for (let i = 0; i < MAX_GAME_MOVES; i++) {
		board.history.push({
			move: NO_MOVE,
			castling: 0,
			enPassant: 0,
			fiftyMove: 0,
			positionKey: 0,
		});
	}

	for (let i = 0; i < PV_ENTRIES; i++) {
		board.PVTable.push({
			move: NO_MOVE,
			positionKey: 0,
		});
	}
}

function initMVVLVA() {
	for (let attacker = PIECES.wP; attacker <= PIECES.bK; attacker++) {
		for (let victim = PIECES.wP; victim <= PIECES.bK; victim++) {
			MVV_LVA_SCORES[victim * 14 + attacker] = MVV_LVA_VALUE[victim] + 6 - MVV_LVA_VALUE[attacker] / 100;
		}
	}
}
