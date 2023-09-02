function getMove(from, to, captured, promoted, flag) {
	return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
}

function getAllMoves() {
	board.moveListStart[board.ply + 1] = board.moveListStart[board.ply];

	if (board.side == COLORS.WHITE) {
		for (let i = 0; i < board.pieceNum[PIECES.wP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.wP, i)];

			if (board.pieces[curSquare + 10] == PIECES.EMPTY) {
				addWhitePawnCaptureMove(curSquare, curSquare + 10);
				if (RANKS_BOARD[curSquare] == RANKS.TWO && board.pieces[curSquare + 20] == PIECES.EMPTY) {
					addQuietMove(getMove(curSquare, curSquare + 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START));
				}
			}

			if (!isSquareOffboard(curSquare + 9) && PIECE_COLOR[board.pieces[curSquare + 9]] == COLORS.BLACK) {
				addWhitePawnCaptureMove(curSquare, curSquare + 9, board.pieces[curSquare + 9]);
			}

			if (!isSquareOffboard(curSquare + 11) && PIECE_COLOR[board.pieces[curSquare + 11]] == COLORS.BLACK) {
				addWhitePawnCaptureMove(curSquare, curSquare + 11, board.pieces[curSquare + 11]);
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare + 9 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare + 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare + 11 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare + 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}

		if (board.castling & CASTLE_BITS.wK) {
			if (board.pieces[SQUARES.F1] == PIECES.EMPTY && board.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.E1, COLORS.BLACK) && !isSquareAttacked(SQUARES.F1, COLORS.BLACK)) {
					addQuietMove(getMove(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}

		if (board.castling & CASTLE_BITS.wQ) {
			if (board.pieces[SQUARES.B1] == PIECES.EMPTY && board.pieces[SQUARES.C1] == PIECES.EMPTY && board.pieces[SQUARES.D1] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.D1, COLORS.BLACK) && !isSquareAttacked(SQUARES.E1, COLORS.BLACK)) {
					addQuietMove(getMove(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}
	} else {
		for (let i = 0; i < board.pieceNum[PIECES.bP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.bP, i)];

			if (board.pieces[curSquare - 10] == PIECES.EMPTY) {
				addBlackPawnCaptureMove(curSquare, curSquare - 10);
				if (RANKS_BOARD[curSquare] == RANKS.SEVEN && board.pieces[curSquare - 20] == PIECES.EMPTY) {
					addQuietMove(getMove(curSquare, curSquare - 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START));
				}
			}

			if (!isSquareOffboard(curSquare - 9) && PIECE_COLOR[board.pieces[curSquare - 9]] == COLORS.WHITE) {
				addBlackPawnCaptureMove(curSquare, curSquare - 9, board.pieces[curSquare - 9]);
			}

			if (!isSquareOffboard(curSquare - 11) && PIECE_COLOR[board.pieces[curSquare - 11]] == COLORS.WHITE) {
				addBlackPawnCaptureMove(curSquare, curSquare - 11, board.pieces[curSquare - 11]);
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare - 9 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare - 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare - 11 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare - 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}

		if (board.castling & CASTLE_BITS.bK) {
			if (board.pieces[SQUARES.F8] == PIECES.EMPTY && board.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.F8, COLORS.WHITE) && !isSquareAttacked(SQUARES.E8, COLORS.WHITE)) {
					addQuietMove(getMove(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}

		if (board.castling & CASTLE_BITS.bQ) {
			if (board.pieces[SQUARES.B8] == PIECES.EMPTY && board.pieces[SQUARES.C8] == PIECES.EMPTY && board.pieces[SQUARES.D8] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.D8, COLORS.WHITE) && !isSquareAttacked(SQUARES.E8, COLORS.WHITE)) {
					addQuietMove(getMove(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}
	}

	let pieceIndex = LOOP_NON_SLIDE_PIECE_INDEX[board.side];
	let curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				if (isSquareOffboard(nextSquare)) {
					continue;
				}

				if (board.pieces[nextSquare] != PIECES.EMPTY) {
					if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
						addCaptureMove(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
					}
				} else {
					addQuietMove(getMove(square, nextSquare, PIECES.EMPTY, PIECES.EMPTY, 0));
				}
			}
		}

		curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];
	}

	pieceIndex = LOOP_SLIDE_PIECE_INDEX[board.side];
	curPiece = LOOP_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				while (!isSquareOffboard(nextSquare)) {
					if (board.pieces[nextSquare] != PIECES.EMPTY) {
						if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
							addCaptureMove(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
						}
						break;
					}

					addQuietMove(getMove(square, nextSquare, PIECES.EMPTY, PIECES.EMPTY, 0));

					nextSquare += direction;
				}
			}
		}

		curPiece = LOOP_SLIDE_PIECE[pieceIndex++];
	}
}

function getAllCaptures() {
	board.moveListStart[board.ply + 1] = board.moveListStart[board.ply];

	if (board.side == COLORS.WHITE) {
		for (let i = 0; i < board.pieceNum[PIECES.wP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.wP, i)];

			if (!isSquareOffboard(curSquare + 9) && PIECE_COLOR[board.pieces[curSquare + 9]] == COLORS.BLACK) {
				addWhitePawnCaptureMove(curSquare, curSquare + 9, board.pieces[curSquare + 9]);
			}

			if (!isSquareOffboard(curSquare + 11) && PIECE_COLOR[board.pieces[curSquare + 11]] == COLORS.BLACK) {
				addWhitePawnCaptureMove(curSquare, curSquare + 11, board.pieces[curSquare + 11]);
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare + 9 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare + 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare + 11 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare + 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}
	} else {
		for (let i = 0; i < board.pieceNum[PIECES.bP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.bP, i)];

			if (!isSquareOffboard(curSquare - 9) && PIECE_COLOR[board.pieces[curSquare - 9]] == COLORS.WHITE) {
				addBlackPawnCaptureMove(curSquare, curSquare - 9, board.pieces[curSquare - 9]);
			}

			if (!isSquareOffboard(curSquare - 11) && PIECE_COLOR[board.pieces[curSquare - 11]] == COLORS.WHITE) {
				addBlackPawnCaptureMove(curSquare, curSquare - 11, board.pieces[curSquare - 11]);
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare - 9 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare - 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare - 11 == board.enPassant) {
					addEnPassantMove(getMove(curSquare, curSquare - 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}
	}

	let pieceIndex = LOOP_NON_SLIDE_PIECE_INDEX[board.side];
	let curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				if (isSquareOffboard(nextSquare)) {
					continue;
				}

				if (board.pieces[nextSquare] != PIECES.EMPTY) {
					if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
						addCaptureMove(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
					}
				}
			}
		}

		curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];
	}

	pieceIndex = LOOP_SLIDE_PIECE_INDEX[board.side];
	curPiece = LOOP_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				while (!isSquareOffboard(nextSquare)) {
					if (board.pieces[nextSquare] != PIECES.EMPTY) {
						if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
							addCaptureMove(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
						}
						break;
					}

					nextSquare += direction;
				}
			}
		}

		curPiece = LOOP_SLIDE_PIECE[pieceIndex++];
	}
}

function addCaptureMove(move) {
	board.moveList[board.moveListStart[board.ply + 1]] = move;
	board.moveScores[board.moveListStart[board.ply + 1]++] = MVV_LVA_SCORES[getCapturedPiece(move) * 14 + board.pieces[getFromSquare(move)]] + 1000000;
}

function addQuietMove(move) {
	board.moveList[board.moveListStart[board.ply + 1]] = move;

	if (move == board.searchKillers[board.ply]) {
		board.moveScores[board.moveListStart[board.ply + 1]] = 900000;
	} else if (move == board.searchKillers[MAX_DEPTH + board.ply]) {
		board.moveScores[board.moveListStart[board.ply + 1]] = 800000;
	} else {
		board.moveScores[board.moveListStart[board.ply + 1]] = board.searchHistory[board.pieces[getFromSquare(move)] * BOARD_SIZE + getToSquare(move)];
	}

	board.moveListStart[board.ply + 1]++;
}

function addEnPassantMove(move) {
	board.moveList[board.moveListStart[board.ply + 1]] = move;
	board.moveScores[board.moveListStart[board.ply + 1]++] = 1000105;
}

function addWhitePawnQuietMove(from, to) {
	if (RANKS_BOARD[from] == RANKS.SEVEN) {
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.wQ, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.wR, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.wB, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.wN, 0));
	} else {
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}

function addWhitePawnCaptureMove(from, to, capture) {
	if (RANKS_BOARD[from] == RANKS.SEVEN) {
		addCaptureMove(getMove(from, to, capture, PIECES.wQ, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.wR, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.wB, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.wN, 0));
	} else {
		addCaptureMove(getMove(from, to, capture, PIECES.EMPTY, 0));
	}
}

function addBlackPawnQuietMove(from, to) {
	if (RANKS_BOARD[from] == RANKS.TWO) {
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.bQ, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.bR, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.bB, 0));
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.bN, 0));
	} else {
		addCaptureMove(getMove(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}

function addBlackPawnCaptureMove(from, to, capture) {
	if (RANKS_BOARD[from] == RANKS.TWO) {
		addCaptureMove(getMove(from, to, capture, PIECES.bQ, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.bR, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.bB, 0));
		addCaptureMove(getMove(from, to, capture, PIECES.bN, 0));
	} else {
		addCaptureMove(getMove(from, to, capture, PIECES.EMPTY, 0));
	}
}

function doesMoveExist(move) {
	getAllMoves();

	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		let moveFound = board.moveList[i];

		if (makeMove(moveFound)) {
			unmakeMove();
			if (moveFound == move) {
				return true;
			}
		}
	}

	return false;
}

function getAllMovesArr() {
	let allMoves = [];

	if (board.side == COLORS.WHITE) {
		for (let i = 0; i < board.pieceNum[PIECES.wP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.wP, i)];

			if (board.pieces[curSquare + 10] == PIECES.EMPTY) {
				allMoves.push(getMove(curSquare, curSquare + 10, PIECES.EMPTY, PIECES.EMPTY, 0));
				if (RANKS_BOARD[curSquare] == RANKS.TWO && board.pieces[curSquare + 20] == PIECES.EMPTY) {
					allMoves.push(getMove(curSquare, curSquare + 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START));
				}
			}

			if (!isSquareOffboard(curSquare + 9) && PIECE_COLOR[board.pieces[curSquare + 9]] == COLORS.BLACK) {
				allMoves.push(getMove(curSquare, curSquare + 9, PIECES.EMPTY, PIECES.EMPTY, 0));
			}

			if (!isSquareOffboard(curSquare + 11) && PIECE_COLOR[board.pieces[curSquare + 11]] == COLORS.BLACK) {
				allMoves.push(getMove(curSquare, curSquare + 11, PIECES.EMPTY, PIECES.EMPTY, 0));
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare + 9 == board.enPassant) {
					allMoves.push(getMove(curSquare, curSquare + 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare + 11 == board.enPassant) {
					allMoves.push(getMove(curSquare, curSquare + 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}

		if (board.castling & CASTLE_BITS.wK) {
			if (board.pieces[SQUARES.F1] == PIECES.EMPTY && board.pieces[SQUARES.G1] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.E1, COLORS.BLACK) && !isSquareAttacked(SQUARES.F1, COLORS.BLACK)) {
					allMoves.push(getMove(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}

		if (board.castling & CASTLE_BITS.wQ) {
			if (board.pieces[SQUARES.B1] == PIECES.EMPTY && board.pieces[SQUARES.C1] == PIECES.EMPTY && board.pieces[SQUARES.D1] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.D1, COLORS.BLACK) && !isSquareAttacked(SQUARES.E1, COLORS.BLACK)) {
					allMoves.push(getMove(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}
	} else {
		for (let i = 0; i < board.pieceNum[PIECES.bP]; i++) {
			let curSquare = board.pieceList[getPieceIndex(PIECES.bP, i)];

			if (board.pieces[curSquare - 10] == PIECES.EMPTY) {
				allMoves.push(getMove(curSquare, curSquare - 10, PIECES.EMPTY, PIECES.EMPTY, 0));
				if (RANKS_BOARD[curSquare] == RANKS.SEVEN && board.pieces[curSquare - 20] == PIECES.EMPTY) {
					allMoves.push(getMove(curSquare, curSquare - 20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_PAWN_START));
				}
			}

			if (!isSquareOffboard(curSquare - 9) && PIECE_COLOR[board.pieces[curSquare - 9]] == COLORS.WHITE) {
				allMoves.push(getMove(curSquare, curSquare - 9, PIECES.EMPTY, PIECES.EMPTY, 0));
			}

			if (!isSquareOffboard(curSquare - 11) && PIECE_COLOR[board.pieces[curSquare - 11]] == COLORS.WHITE) {
				allMoves.push(getMove(curSquare, curSquare - 11, PIECES.EMPTY, PIECES.EMPTY, 0));
			}

			if (board.enPassant != SQUARES.INVALID) {
				if (curSquare - 9 == board.enPassant) {
					allMoves.push(getMove(curSquare, curSquare - 9, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}

				if (curSquare - 11 == board.enPassant) {
					allMoves.push(getMove(curSquare, curSquare - 11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_EN_PASSANT));
				}
			}
		}

		if (board.castling & CASTLE_BITS.bK) {
			if (board.pieces[SQUARES.F8] == PIECES.EMPTY && board.pieces[SQUARES.G8] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.F8, COLORS.WHITE) && !isSquareAttacked(SQUARES.E8, COLORS.WHITE)) {
					allMoves.push(getMove(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}

		if (board.castling & CASTLE_BITS.bQ) {
			if (board.pieces[SQUARES.B8] == PIECES.EMPTY && board.pieces[SQUARES.C8] == PIECES.EMPTY && board.pieces[SQUARES.D8] == PIECES.EMPTY) {
				if (!isSquareAttacked(SQUARES.D8, COLORS.WHITE) && !isSquareAttacked(SQUARES.E8, COLORS.WHITE)) {
					allMoves.push(getMove(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG_CASTLING));
				}
			}
		}
	}

	let pieceIndex = LOOP_NON_SLIDE_PIECE_INDEX[board.side];
	let curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				if (isSquareOffboard(nextSquare)) {
					continue;
				}

				if (board.pieces[nextSquare] != PIECES.EMPTY) {
					if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
						allMoves.push(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
					}
				} else {
					allMoves.push(getMove(square, nextSquare, PIECES.EMPTY, PIECES.EMPTY, 0));
				}
			}
		}

		curPiece = LOOP_NON_SLIDE_PIECE[pieceIndex++];
	}

	pieceIndex = LOOP_SLIDE_PIECE_INDEX[board.side];
	curPiece = LOOP_SLIDE_PIECE[pieceIndex++];

	while (curPiece != 0) {
		for (let i = 0; i < board.pieceNum[curPiece]; i++) {
			let square = board.pieceList[getPieceIndex(curPiece, i)];

			for (let j = 0; j < PIECE_NUM_DIRECTIONS[curPiece]; j++) {
				let direction = PIECE_DIRECTIONS[curPiece][j];
				let nextSquare = square + direction;

				while (!isSquareOffboard(nextSquare)) {
					if (board.pieces[nextSquare] != PIECES.EMPTY) {
						if (PIECE_COLOR[board.pieces[nextSquare]] != board.side) {
							allMoves.push(getMove(square, nextSquare, board.pieces[nextSquare], PIECES.EMPTY, 0));
						}
						break;
					}

					allMoves.push(getMove(square, nextSquare, PIECES.EMPTY, PIECES.EMPTY, 0));

					nextSquare += direction;
				}
			}
		}

		curPiece = LOOP_SLIDE_PIECE[pieceIndex++];
	}

	return allMoves;
}

function isLegalMove(move) {
	let from = getFromSquare(move);
	let to = getToSquare(move);
	let prevTo = board.pieces[to];
	let piece = board.pieces[from];

	removePiece(from);
	removePiece(to);
	addPiece(to, piece);

	let enPassantPiece;
	if (move & MOVE_FLAG_EN_PASSANT) {
		if (board.side == COLORS.WHITE) {
			enPassantPiece = board.pieces[to - 10];
			removePiece(to - 10);
		} else {
			enPassantPiece = board.pieces[to + 10];
			removePiece(to + 10);
		}
	}

	let isLegal = !isSquareAttacked(board.pieceList[getPieceIndex(KINGS[board.side], 0)], board.side ^ 1);

	if (move & MOVE_FLAG_EN_PASSANT) {
		if (board.side == COLORS.WHITE) {
			addPiece(to - 10, enPassantPiece);
		} else {
			addPiece(to + 10, enPassantPiece);
		}
	}

	removePiece(to);
	addPiece(from, piece);
	addPiece(to, prevTo);

	return isLegal;
}
