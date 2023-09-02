// prettier-ignore
const PAWN_TABLE = [
	 0,  0,   0,   0,   0,   0,  0,  0,
	 5, 10,  10, -20, -20,  10, 10,  5,
	 5, -5, -10,   0,   0, -10, -5,  5,
	 0,  0,   0,  20,  20,   0,  0,  0,
	 5,  5,  10,  25,  25,  10,  5,  5,
	10, 10,  20,  30,  30,  20, 10, 10,
	50, 50,  50,  50,  50,  50, 50, 50,
	 0,  0,   0,   0,   0,   0,  0,  0
];

// prettier-ignore
const KNIGHT_TABLE = [
	-50, -40, -30, -30, -30, -30, -40, -50,
	-40, -20,   0,   5,   5,   0, -20, -40,
	-30,   5,  10,  15,  15,  10,   5, -30,
	-30,   0,  15,  20,  20,  15,   0, -30,
	-30,   5,  15,  20,  20,  15,   5, -30,
	-30,   0,  10,  15,  15,  10,   0, -30,
	-40, -20,   0,   0,   0,   0, -20, -40,
	-50, -40, -30, -30, -30, -30, -40, -50
];

// prettier-ignore
const BISHOP_TABLE = [
	-20, -10, -10, -10, -10, -10, -10, -20,
	-10,   5,   0,   0,   0,   0,   5, -10,
	-10,  10,  10,  10,  10,  10,  10, -10,
	-10,   0,  10,  10,  10,  10,   0, -10,
	-10,   5,   5,  10,  10,   5,   5, -10,
	-10,   0,   5,  10,  10,   5,   0, -10,
	-10,   0,   0,   0,   0,   0,   0, -10,
	-20, -10, -10, -10, -10, -10, -10, -20
];

// prettier-ignore
const ROOK_TABLE = [
	 0,  0,  0,  5,  5,  0,  0,  0,
	-5,  0,  0,  0,  0,  0,  0, -5,
	-5,  0,  0,  0,  0,  0,  0, -5,
	-5,  0,  0,  0,  0,  0,  0, -5,
	-5,  0,  0,  0,  0,  0,  0, -5,
	-5,  0,  0,  0,  0,  0,  0, -5,
	 5, 10, 10, 10, 10, 10, 10,  5,
	 0,  0,  0,  0,  0,  0,  0,  0
];

// prettier-ignore
const QUEEN_TABLE = [
	-20, -10, -10, -5, -5, -10, -10, -20,
	-10,   0,   0,  0,  0,   0,   0, -10,
	-10,   0,   5,  5,  5,   5,   0, -10,
	 -5,   0,   5,  5,  5,   5,   0,  -5,
	  0,   0,   5,  5,  5,   5,   0,  -5,
	-10,   5,   5,  5,  5,   5,   0, -10,
	-10,   0,   5,  0,  0,   0,   0, -10,
	-20, -10, -10, -5, -5, -10, -10, -20
];

// prettier-ignore
const KING_EARLY_MIDDLE_GAME_TABLE = [
	 20,  30,  10,   0,   0,  10,  30,  20,
	 20,  20,   0,   0,   0,   0,  20,  20,
	-10, -20, -20, -20, -20, -20, -20, -10,
	-20, -30, -30, -40, -40, -30, -30, -20,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30,
	-30, -40, -40, -50, -50, -40, -40, -30
];

// prettier-ignore
const KING_END_GAME_TABLE = [
	-50, -40, -30, -20, -20, -30, -40, -50,
	-30, -30,   0,   0,   0,   0, -30, -30,
	-30, -10,  20,  30,  30,  20, -10, -30,
	-30, -10,  30,  40,  40,  30, -10, -30,
	-30, -10,  30,  40,  40,  30, -10, -30,
	-30, -10,  20,  30,  30,  20, -10, -30,
	-30, -20, -10,   0,   0, -10, -20, -30,
	-50, -40, -30, -20, -20, -30, -40, -50
];

const BISHOP_PAIR_BONUS = 40;

function evaluatePosition() {
	let score = board.material[COLORS.WHITE] - board.material[COLORS.BLACK];

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wP]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wP, pieceNum)];
		score += PAWN_TABLE[getSquare64(curSquare)];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bP]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bP, pieceNum)];
		score -= PAWN_TABLE[getMirror64(getSquare64(curSquare))];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wN]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wN, pieceNum)];
		score += KNIGHT_TABLE[getSquare64(curSquare)];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bN]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bN, pieceNum)];
		score -= KNIGHT_TABLE[getMirror64(getSquare64(curSquare))];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wB]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wB, pieceNum)];
		score += BISHOP_TABLE[getSquare64(curSquare)];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bB]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bB, pieceNum)];
		score -= BISHOP_TABLE[getMirror64(getSquare64(curSquare))];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wR]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wR, pieceNum)];
		score += ROOK_TABLE[getSquare64(curSquare)];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bR]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bR, pieceNum)];
		score -= ROOK_TABLE[getMirror64(getSquare64(curSquare))];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wQ]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wQ, pieceNum)];
		score += QUEEN_TABLE[getSquare64(curSquare)];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bQ]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bQ, pieceNum)];
		score -= QUEEN_TABLE[getMirror64(getSquare64(curSquare))];
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.wK]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.wK, pieceNum)];
		if (!isEndGame()) {
			score += KING_EARLY_MIDDLE_GAME_TABLE[getSquare64(curSquare)];
		} else {
			score += KING_END_GAME_TABLE[getSquare64(curSquare)];
		}
	}

	for (let pieceNum = 0; pieceNum < board.pieceNum[PIECES.bK]; pieceNum++) {
		let curSquare = board.pieceList[getPieceIndex(PIECES.bK, pieceNum)];
		if (!isEndGame()) {
			score -= KING_EARLY_MIDDLE_GAME_TABLE[getMirror64(getSquare64(curSquare))];
		} else {
			score -= KING_END_GAME_TABLE[getMirror64(getSquare64(curSquare))];
		}
	}

	if (board.pieceNum[PIECES.wB] >= 2) {
		let hasLight = false,
			hasDark = false;

		for (let file = FILES.A; file <= FILES.H; file++) {
			for (let rank = RANKS.ONE; rank <= RANKS.EIGHT; rank++) {
				let square = getSquareAt(file, rank);
				if (board.pieces[square] == PIECES.wB) {
					if ((FILES_BOARD[square] + RANKS_BOARD[square]) % 2 == 0) {
						hasLight = true;

						if (hasDark) {
							break;
						}
					} else {
						hasDark = true;

						if (hasLight) {
							break;
						}
					}
				}
			}
		}

		if (hasLight && hasDark) {
			score += BISHOP_PAIR_BONUS;
		}
	}

	if (board.pieceNum[PIECES.bB] >= 2) {
		let hasLight = false,
			hasDark = false;

		for (let file = FILES.A; file <= FILES.H; file++) {
			for (let rank = RANKS.ONE; rank <= RANKS.EIGHT; rank++) {
				let square = getSquareAt(file, rank);
				if (board.pieces[square] == PIECES.bB) {
					if ((FILES_BOARD[square] + RANKS_BOARD[square]) % 2 == 0) {
						hasLight = true;

						if (hasDark) {
							break;
						}
					} else {
						hasDark = true;

						if (hasLight) {
							break;
						}
					}
				}
			}
		}

		if (hasLight && hasDark) {
			score -= BISHOP_PAIR_BONUS;
		}
	}

	if (board.side == COLORS.BLACK) {
		score = -score;
	}

	return score;
}
