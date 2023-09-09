const board = {};

board.pieces = [];
board.side = COLORS.WHITE;
board.fiftyMove = 0;
board.historyPly = 0;
board.ply = 0;
board.castling = 0;
board.enPassant = 0;

board.material = [];
board.pieceNum = [];
board.pieceList = [];

board.positionKey = 0;

board.moveList = [];
board.moveScores = [];
board.moveListStart = [];

board.history = [];

board.PVTable = [];
board.PVArray = [];

board.searchHistory = [];
board.searchKillers = [];

board.isFlipped = false;

function updatePieceLists() {
	for (let i = 0; i < 140; i++) {
		board.pieceList[i] = PIECES.EMPTY;
	}

	for (let i = 0; i < 2; i++) {
		board.material[i] = 0;
	}

	for (let i = 0; i < 13; i++) {
		board.pieceNum[i] = 0;
	}

	for (let i = 0; i < 64; i++) {
		let curSquare = getSquare120(i);
		let curPiece = board.pieces[curSquare];
		if (curPiece != PIECES.EMPTY) {
			let color = PIECE_COLOR[curPiece];

			board.material[color] += PIECE_VALUE[curPiece];

			board.pieceList[getPieceIndex(curPiece, board.pieceNum[curPiece])] = curSquare;
			board.pieceNum[curPiece]++;
		}
	}
}

function generatePositionKey() {
	let key = 0;

	for (let curSquare = 0; curSquare < BOARD_SIZE; curSquare++) {
		let curPiece = board.pieces[curSquare];
		if (curPiece != PIECES.EMPTY && curPiece != SQUARES.OFFBOARD) {
			key ^= PIECE_KEYS[curPiece * 120 + curSquare];
		}
	}

	if (board.side == COLORS.WHITE) {
		key ^= SIDE_KEY;
	}

	if (board.enPassant != SQUARES.INVALID) {
		key ^= PIECE_KEYS[board.enPassant];
	}

	key ^= CASTLE_KEYS[board.castling];

	return key;
}

function resetBoard() {
	for (let i = 0; i < BOARD_SIZE; i++) {
		board.pieces[i] = SQUARES.OFFBOARD;
	}

	for (let i = 0; i < BOARD_64_TO_120.length; i++) {
		board.pieces[getSquare120(i)] = PIECES.EMPTY;
	}

	board.side = COLORS.BOTH;
	board.fiftyMove = 0;
	board.historyPly = 0;
	board.ply = 0;
	board.castling = 0;
	board.enPassant = SQUARES.INVALID;

	board.positionKey = 0;
	board.moveListStart[board.ply] = 0;
}

function parseFEN(fen) {
	if (fen == STARTING_FEN) {
		resetBoard();
	}

	let rank = RANKS.EIGHT;
	let file = FILES.A;

	let fenItr;

	for (fenItr = 0; fenItr < fen.length; fenItr++) {
		if (rank < RANKS.ONE) break;

		let piece = PIECES.EMPTY;
		let svg = '';
		let loopCount = 1;

		switch (fen[fenItr]) {
			case 'p':
				svg = 'bP';
				piece = PIECES.bP;
				break;
			case 'n':
				svg = 'bN';
				piece = PIECES.bN;
				break;
			case 'b':
				svg = 'bB';
				piece = PIECES.bB;
				break;
			case 'r':
				svg = 'bR';
				piece = PIECES.bR;
				break;
			case 'q':
				svg = 'bQ';
				piece = PIECES.bQ;
				break;
			case 'k':
				svg = 'bK';
				piece = PIECES.bK;
				break;
			case 'P':
				svg = 'wP';
				piece = PIECES.wP;
				break;
			case 'N':
				svg = 'wN';
				piece = PIECES.wN;
				break;
			case 'B':
				svg = 'wB';
				piece = PIECES.wB;
				break;
			case 'R':
				svg = 'wR';
				piece = PIECES.wR;
				break;
			case 'Q':
				svg = 'wQ';
				piece = PIECES.wQ;
				break;
			case 'K':
				svg = 'wK';
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
				console.log('error parsing FEN string');
				return;
		}

		for (let i = 0; i < loopCount; i++) {
			let square120 = getSquareAt(file, rank);
			board.pieces[square120] = piece;
			file++;

			if (svg != '') {
				let square64 = getMirror64(getSquare64(square120));
				let square = document.querySelector(`[data-id="${square64}"]`);
				let svgElement = document.createElement('img');
				svgElement.src = `images/${svg}.svg`;
				if ($(square).children('img')[0]?.src == svgElement.src) {
					continue;
				}
				svgElement.draggable = false;
				square.appendChild(svgElement);
			} else {
				let square64 = getMirror64(getSquare64(square120));
				let square = document.querySelector(`[data-id="${square64}"]`);
				$(square).children('img').remove();
			}
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
			default:
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

	board.positionKey = generatePositionKey();

	updatePieceLists();
}

function isSquareAttacked(square, side) {
	// pawns
	if (side == COLORS.WHITE) {
		if (board.pieces[square - 11] == PIECES.wP || board.pieces[square - 9] == PIECES.wP) {
			return true;
		}
	} else {
		if (board.pieces[square + 11] == PIECES.bP || board.pieces[square + 9] == PIECES.bP) {
			return true;
		}
	}

	// knights
	for (let i = 0; i < KNIGHT_DIRECTIONS.length; i++) {
		let curPiece = board.pieces[square + KNIGHT_DIRECTIONS[i]];
		if (curPiece != SQUARES.OFFBOARD && PIECE_COLOR[curPiece] == side && KNIGHT_PIECES[curPiece]) {
			return true;
		}
	}

	// rooks/queens
	for (let i = 0; i < ROOK_DIRECTIONS.length; i++) {
		let curSquare = square + ROOK_DIRECTIONS[i];
		let curPiece = board.pieces[curSquare];
		while (curPiece != SQUARES.OFFBOARD) {
			if (curPiece != PIECES.EMPTY) {
				if (ROOK_QUEEN_PIECES[curPiece] && PIECE_COLOR[curPiece] == side) {
					return true;
				}
				break;
			}
			curSquare += ROOK_DIRECTIONS[i];
			curPiece = board.pieces[curSquare];
		}
	}

	// bishops/queens
	for (let i = 0; i < BISHOP_DIRECTIONS.length; i++) {
		let curSquare = square + BISHOP_DIRECTIONS[i];
		let curPiece = board.pieces[curSquare];
		while (curPiece != SQUARES.OFFBOARD) {
			if (curPiece != PIECES.EMPTY) {
				if (BISHOP_QUEEN_PIECES[curPiece] && PIECE_COLOR[curPiece] == side) {
					return true;
				}
				break;
			}
			curSquare += BISHOP_DIRECTIONS[i];
			curPiece = board.pieces[curSquare];
		}
	}

	// KINGS
	for (let i = 0; i < KING_DIRECTIONS.length; i++) {
		let curPiece = board.pieces[square + KING_DIRECTIONS[i]];
		if (curPiece != SQUARES.OFFBOARD && PIECE_COLOR[curPiece] == side && KING_PIECES[curPiece]) {
			return true;
		}
	}

	return false;
}

function isSquareOffboard(square) {
	return FILES_BOARD[square] == SQUARES.OFFBOARD || RANKS_BOARD[square] == SQUARES.OFFBOARD;
}

function hashPiece(piece, square) {
	board.positionKey ^= PIECE_KEYS[piece * 120 + square];
}

function hashCastling() {
	board.positionKey ^= CASTLE_KEYS[board.castling];
}

function hashEnPassant() {
	board.positionKey ^= PIECE_KEYS[board.enPassant];
}

function hashSide() {
	board.positionKey ^= SIDE_KEY;
}

function isEndGame() {
	whiteMinorPieceCount = board.pieceNum[PIECES.wN] + board.pieceNum[PIECES.wB];
	blackMinorPieceCount = board.pieceNum[PIECES.bN] + board.pieceNum[PIECES.bB];

	if (board.pieceNum[PIECES.wQ] == 0 && board.pieceNum[PIECES.bQ] == 0) {
		return true;
	} else if (board.pieceNum[PIECES.wQ] == 1 || board.pieceNum[PIECES.bQ] == 1) {
		let valid = true;
		if (board.pieceNum[PIECES.wQ] == 1) {
			if (whiteMinorPieceCount > 1) {
				valid = false;
			}
		} else if (board.pieceNum[PIECES.bQ] == 1) {
			if (blackMinorPieceCount > 1) {
				valid = false;
			}
		}

		if (valid) {
			return true;
		}
	}

	return false;
}

function isPositionInsufficient() {
	let whiteBishopsOnLight = 0,
		whiteBishopsOnDark = 0;
	let blackBishopsOnLight = 0,
		blackBishopsOnDark = 0;
	let numKnights = 0;

	for (let i = 0; i < 64; i++) {
		const piece = board.pieces[BOARD_64_TO_120[i]];
		const isLightSquare = ((i % 8) + Math.floor(i / 8)) % 2 === 1;

		switch (piece) {
			case PIECES.wB:
				isLightSquare ? whiteBishopsOnLight++ : whiteBishopsOnDark++;
				break;
			case PIECES.bB:
				isLightSquare ? blackBishopsOnLight++ : blackBishopsOnDark++;
				break;
			case PIECES.wN:
			case PIECES.bN:
				numKnights++;
				break;
			case PIECES.wR:
			case PIECES.bR:
			case PIECES.wQ:
			case PIECES.bQ:
			case PIECES.wP:
			case PIECES.bP:
				return false;
		}
	}

	if (numKnights <= 1 && whiteBishopsOnLight + whiteBishopsOnDark + blackBishopsOnLight + blackBishopsOnDark === 0) {
		return true;
	} else if (numKnights === 0 && (whiteBishopsOnLight + blackBishopsOnLight === 0 || whiteBishopsOnDark + blackBishopsOnDark === 0)) {
		return true;
	}

	return false;
}

function generateFEN() {
	let fen = '';

	let emptyCount = 0;

	for (let i = 0; i < 64; i++) {
		if (i % 8 == 0 && i != 0) {
			if (emptyCount != 0) {
				fen += emptyCount;
			}
			fen += '/';
			emptyCount = 0;
		}

		let square = $(`.square[data-id="${i}"]`);
		if (square.has('img').length) {
			if (emptyCount != 0) {
				fen += emptyCount;
				emptyCount = 0;
			}

			switch (square.children('img').attr('src').replace('images/', '').replace('.svg', '')) {
				case 'wP':
					fen += 'P';
					break;
				case 'wN':
					fen += 'N';
					break;
				case 'wB':
					fen += 'B';
					break;
				case 'wR':
					fen += 'R';
					break;
				case 'wQ':
					fen += 'Q';
					break;
				case 'wK':
					fen += 'K';
					break;
				case 'bP':
					fen += 'p';
					break;
				case 'bN':
					fen += 'n';
					break;
				case 'bB':
					fen += 'b';
					break;
				case 'bR':
					fen += 'r';
					break;
				case 'bQ':
					fen += 'q';
					break;
				case 'bK':
					fen += 'k';
					break;
			}
		} else {
			emptyCount++;
		}
	}
	if (emptyCount != 0) fen += emptyCount;

	fen += ' ' + (board.side == COLORS.WHITE ? 'w' : 'b');

	fen += ' ' + (board.castling & CASTLE_BITS.wK ? 'K' : '') + (board.castling & CASTLE_BITS.wQ ? 'Q' : '') + (board.castling & CASTLE_BITS.bK ? 'k' : '') + (board.castling & CASTLE_BITS.bQ ? 'q' : '');

	fen += ' ' + (board.enPassant == SQUARES.INVALID ? '-' : FILES_STRING[FILES_BOARD[board.enPassant]] + RANKS_STRING[RANKS_BOARD[board.enPassant]]);

	fen += ' ' + board.fiftyMove;

	fen += ' ' + (Math.floor(board.historyPly / 2) + 1);

	return fen;
}
