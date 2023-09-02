function removePiece(square) {
	let piece = board.pieces[square];
	let color = PIECE_COLOR[piece];

	hashPiece(piece, square);

	board.pieces[square] = PIECES.EMPTY;
	board.material[color] -= PIECE_VALUE[piece];

	let tempPieceNum = -1;
	for (let i = 0; i < board.pieceNum[piece]; i++) {
		if (board.pieceList[getPieceIndex(piece, i)] == square) {
			tempPieceNum = i;
			break;
		}
	}

	board.pieceNum[piece]--;
	board.pieceList[getPieceIndex(piece, tempPieceNum)] = board.pieceList[getPieceIndex(piece, board.pieceNum[piece])];
}

function addPiece(square, piece) {
	let color = PIECE_COLOR[piece];

	hashPiece(piece, square);

	board.pieces[square] = piece;
	board.material[color] += PIECE_VALUE[piece];
	board.pieceList[getPieceIndex(piece, board.pieceNum[piece])] = square;
	board.pieceNum[piece]++;
}

function movePiece(from, to) {
	let piece = board.pieces[from];

	hashPiece(piece, from);
	board.pieces[from] = PIECES.EMPTY;

	hashPiece(piece, to);
	board.pieces[to] = piece;

	for (let i = 0; i < board.pieceNum[piece]; i++) {
		if (board.pieceList[getPieceIndex(piece, i)] == from) {
			board.pieceList[getPieceIndex(piece, i)] = to;
			break;
		}
	}
}

function makeMove(move) {
	let from = getFromSquare(move);
	let to = getToSquare(move);

	board.history[board.historyPly].positionKey = board.positionKey;

	if ((move & MOVE_FLAG_EN_PASSANT) != 0) {
		if (board.side == COLORS.WHITE) {
			removePiece(to - 10);
		} else {
			removePiece(to + 10);
		}
	} else if ((move & MOVE_FLAG_CASTLING) != 0) {
		switch (to) {
			case SQUARES.C1:
				movePiece(SQUARES.A1, SQUARES.D1);
				break;
			case SQUARES.C8:
				movePiece(SQUARES.A8, SQUARES.D8);
				break;
			case SQUARES.G1:
				movePiece(SQUARES.H1, SQUARES.F1);
				break;
			case SQUARES.G8:
				movePiece(SQUARES.H8, SQUARES.F8);
				break;
		}
	}

	if (board.enPassant != SQUARES.INVALID) {
		hashEnPassant();
	}

	hashCastling();

	board.history[board.historyPly].move = move;
	board.history[board.historyPly].fiftyMove = board.fiftyMove;
	board.history[board.historyPly].enPassant = board.enPassant;
	board.history[board.historyPly].castling = board.castling;

	board.castling &= CASTLING_PERMISSIONS[from];
	board.castling &= CASTLING_PERMISSIONS[to];

	board.enPassant = SQUARES.INVALID;

	hashCastling();

	let captured = getCapturedPiece(move);
	board.fiftyMove++;

	if (captured != PIECES.EMPTY) {
		removePiece(to);
		board.fiftyMove = 0;
	}

	board.historyPly++;
	board.ply++;

	if (PAWN_PIECES[board.pieces[from]]) {
		board.fiftyMove = 0;

		if ((move & MOVE_FLAG_PAWN_START) != 0) {
			if (board.side == COLORS.WHITE) {
				board.enPassant = from + 10;
			} else {
				board.enPassant = from - 10;
			}

			hashEnPassant();
		}
	}

	movePiece(from, to);

	let promotedPiece = getPromotedPiece(move);
	if (promotedPiece != PIECES.EMPTY) {
		removePiece(to);
		addPiece(to, promotedPiece);
	}

	board.side ^= 1;
	hashSide();

	let legalMove = !isSquareAttacked(board.pieceList[getPieceIndex(KINGS[board.side ^ 1], 0)], board.side);

	if (!legalMove) {
		unmakeMove();
	}

	return legalMove;
}

function unmakeMove() {
	board.historyPly--;
	board.ply--;

	let move = board.history[board.historyPly].move;
	let from = getFromSquare(move);
	let to = getToSquare(move);

	if (board.enPassant != SQUARES.INVALID) {
		hashEnPassant();
	}

	hashCastling();

	board.castling = board.history[board.historyPly].castling;
	board.fiftyMove = board.history[board.historyPly].fiftyMove;
	board.enPassant = board.history[board.historyPly].enPassant;

	if (board.enPassant != SQUARES.INVALID) {
		hashEnPassant();
	}

	hashCastling();

	board.side ^= 1;
	hashSide();

	if ((move & MOVE_FLAG_EN_PASSANT) != 0) {
		if (board.side == COLORS.WHITE) {
			addPiece(to - 10, PIECES.bP);
		} else {
			addPiece(to + 10, PIECES.wP);
		}
	} else if ((move & MOVE_FLAG_CASTLING) != 0) {
		switch (to) {
			case SQUARES.C1:
				movePiece(SQUARES.D1, SQUARES.A1);
				break;
			case SQUARES.C8:
				movePiece(SQUARES.D8, SQUARES.A8);
				break;
			case SQUARES.G1:
				movePiece(SQUARES.F1, SQUARES.H1);
				break;
			case SQUARES.G8:
				movePiece(SQUARES.F8, SQUARES.H8);
				break;
		}
	}

	movePiece(to, from);

	let captured = getCapturedPiece(move);
	if (captured != PIECES.EMPTY) {
		addPiece(to, captured);
	}

	if (getPromotedPiece(move) != PIECES.EMPTY) {
		removePiece(from);
		addPiece(from, PIECE_COLOR[getPromotedPiece(move)] == COLORS.WHITE ? PIECES.wP : PIECES.bP);
	}
}
