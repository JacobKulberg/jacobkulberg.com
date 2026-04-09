importScripts('constants.js', 'board.js', 'getMoves.js', 'makeMove.js', 'evaluate.js', 'PVTable.js', 'search.js');

parseFEN = function (fen) {
	resetBoard();

	let rank = RANKS.EIGHT;
	let file = FILES.A;
	let fenItr;

	for (fenItr = 0; fenItr < fen.length; fenItr++) {
		if (rank < RANKS.ONE) break;

		let piece = PIECES.EMPTY;
		let loopCount = 1;

		switch (fen[fenItr]) {
			case 'p':
				piece = PIECES.bP;
				break;
			case 'n':
				piece = PIECES.bN;
				break;
			case 'b':
				piece = PIECES.bB;
				break;
			case 'r':
				piece = PIECES.bR;
				break;
			case 'q':
				piece = PIECES.bQ;
				break;
			case 'k':
				piece = PIECES.bK;
				break;
			case 'P':
				piece = PIECES.wP;
				break;
			case 'N':
				piece = PIECES.wN;
				break;
			case 'B':
				piece = PIECES.wB;
				break;
			case 'R':
				piece = PIECES.wR;
				break;
			case 'Q':
				piece = PIECES.wQ;
				break;
			case 'K':
				piece = PIECES.wK;
				break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
				loopCount = parseInt(fen[fenItr]);
				break;
			case '/':
			case ' ':
				rank--;
				file = FILES.A;
				continue;
			default:
				return;
		}

		for (let i = 0; i < loopCount; i++) {
			board.pieces[getSquareAt(file, rank)] = piece;
			file++;
		}
	}

	board.side = fen[fenItr] == 'w' ? COLORS.WHITE : COLORS.BLACK;
	fenItr += 2;

	for (let i = 0; i < 4; i++) {
		if (fen[fenItr] == ' ') break;
		switch (fen[fenItr]) {
			case 'K':
				board.castling |= CASTLE_BITS.wK;
				break;
			case 'Q':
				board.castling |= CASTLE_BITS.wQ;
				break;
			case 'k':
				board.castling |= CASTLE_BITS.bK;
				break;
			case 'q':
				board.castling |= CASTLE_BITS.bQ;
				break;
		}
		fenItr++;
	}

	fenItr++;

	if (fen[fenItr] != '-') {
		file = fen[fenItr].charCodeAt() - 97;
		rank = fen[fenItr + 1].charCodeAt() - 49;
		board.enPassant = getSquareAt(file, rank);
	}

	let sections = fen.split(' ');
	board.fiftyMove = parseInt(sections[4]);
	board.historyPly = (parseInt(sections[5]) - 1) * 2 + (board.side == COLORS.WHITE ? 0 : 1);
	board.positionKey = generatePositionKey();
	updatePieceLists();
};

function initFilesAndRanks() {
	for (let i = 0; i < BOARD_SIZE; i++) {
		FILES_BOARD[i] = SQUARES.OFFBOARD;
		RANKS_BOARD[i] = SQUARES.OFFBOARD;
	}
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
		board.history.push({ move: NO_MOVE, castling: 0, enPassant: 0, fiftyMove: 0, positionKey: 0 });
	}
	for (let i = 0; i < PV_ENTRIES; i++) {
		board.PVTable.push({ move: NO_MOVE, positionKey: 0 });
	}
}

function initMVVLVA() {
	for (let attacker = PIECES.wP; attacker <= PIECES.bK; attacker++) {
		for (let victim = PIECES.wP; victim <= PIECES.bK; victim++) {
			MVV_LVA_SCORES[victim * 14 + attacker] = MVV_LVA_VALUE[victim] + 6 - MVV_LVA_VALUE[attacker] / 100;
		}
	}
}

initFilesAndRanks();
initKeys();
initBoard120To64();
initBoardVariables();
initMVVLVA();

self.onmessage = function (e) {
	const { fen, depth, time } = e.data;
	search.depth = depth;
	search.time = time;
	parseFEN(fen);
	searchPosition().then(() => {
		self.postMessage({ bestMove: search.best, bestScore: search.bestScore });
	});
};
