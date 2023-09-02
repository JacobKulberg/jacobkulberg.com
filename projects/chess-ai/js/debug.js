function getSquareString(square) {
	return FILES_STRING[FILES_BOARD[square]] + RANKS_STRING[RANKS_BOARD[square]];
}

function getMoveString(move) {
	let fromFile = FILES_BOARD[getFromSquare(move)];
	let fromRank = RANKS_BOARD[getFromSquare(move)];
	let toFile = FILES_BOARD[getToSquare(move)];
	let toRank = RANKS_BOARD[getToSquare(move)];

	let moveStr = FILES_STRING[fromFile] + RANKS_STRING[fromRank] + FILES_STRING[toFile] + RANKS_STRING[toRank];

	let promoted = getPromotedPiece(move);

	if (promoted != PIECES.EMPTY) {
		let pieceChar = 'q';
		if (KNIGHT_PIECES[promoted]) {
			pieceChar = 'n';
		} else if (ROOK_QUEEN_PIECES[promoted] && !BISHOP_QUEEN_PIECES[promoted]) {
			pieceChar = 'r';
		} else if (!ROOK_QUEEN_PIECES[promoted] && BISHOP_QUEEN_PIECES[promoted]) {
			pieceChar = 'b';
		}
		moveStr += pieceChar;
	}

	return moveStr;
}

function getMoveListString() {
	console.log('\nMoveList:\n\n');

	let moveNum = 1;
	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		let move = board.moveList[i];
		console.log(`Move ${moveNum++}: ${getMoveString(move)}`);
	}
}

function printBoard() {
	console.log('\nBoard:\n\n');

	for (let rank = RANKS.EIGHT; rank >= RANKS.ONE; rank--) {
		let line = `${rank + 1}  `;
		for (let file = FILES.A; file <= FILES.H; file++) {
			let curSquare = getSquareAt(file, rank);
			let curPiece = board.pieces[curSquare];
			line += ` ${PIECES_STRING[curPiece]} `;
		}
		console.log(line);
	}

	let line = '   ';
	for (let file = FILES.A; file <= FILES.H; file++) {
		line += ` ${FILES_STRING[file]} `;
	}
	console.log(line);

	line = '';
	if (board.castling & CASTLE_BITS.wK) line += 'K';
	if (board.castling & CASTLE_BITS.wQ) line += 'Q';
	if (board.castling & CASTLE_BITS.bK) line += 'k';
	if (board.castling & CASTLE_BITS.bQ) line += 'q';

	console.log('side: ' + SIDE_STRING[board.side]);
	console.log('castling: ' + (line == '' ? '-' : line));
	console.log('en passant: ' + board.enPassant);
	console.log('position key: ' + board.positionKey.toString(16));
}

function printPiecePlacement() {
	console.log('\nPiece Placement:\n\n');

	for (let piece = PIECES.wP; piece <= PIECES.bK; piece++) {
		for (let pieceNum = 0; pieceNum < board.pieceNum[piece]; pieceNum++) {
			let square = board.pieceList[getPieceIndex(piece, pieceNum)];
			console.log(`Piece ${PIECES_STRING[piece]} on square ${getSquareString(square)}`);
		}
	}
}

function printAttackedSquares() {
	console.log('\nAttacked Squares:\n\n');

	for (let rank = RANKS.EIGHT; rank >= RANKS.ONE; rank--) {
		let line = `${rank + 1}  `;
		for (let file = FILES.A; file <= FILES.H; file++) {
			let curSquare = getSquareAt(file, rank);
			line += ` ${isSquareAttacked(curSquare, board.side) ? 'X' : '-'} `;
		}
		console.log(line);
	}

	let line = '   ';
	for (let file = FILES.A; file <= FILES.H; file++) {
		line += ` ${FILES_STRING[file]} `;
	}
	console.log(line);
}

function checkBoard() {
	let tempPieceNums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let tempMaterial = [0, 0];

	// Check 1
	for (let tempPiece = PIECES.wP; tempPiece <= PIECES.bK; tempPiece++) {
		for (let tempPieceNum = 0; tempPieceNum < board.pieceNum[tempPiece]; tempPieceNum++) {
			let square120 = board.pieceList[getPieceIndex(tempPiece, tempPieceNum)];
			if (board.pieces[square120] != tempPiece) {
				console.error('Piece List Error');
				return;
			}
		}
	}

	// Check 2
	for (let square64 = 0; square64 < 64; square64++) {
		let square120 = getSquare120(square64);
		let tempPiece = board.pieces[square120];
		tempPieceNums[tempPiece]++;
		tempMaterial[PIECE_COLOR[tempPiece]] += PIECE_VALUE[tempPiece];
	}
	for (let tempPiece = PIECES.wP; tempPiece <= PIECES.bK; tempPiece++) {
		if (tempPieceNums[tempPiece] != board.pieceNum[tempPiece]) {
			console.error('Piece Number Error');
			return;
		}
	}

	// Check 3
	if (tempMaterial[COLORS.WHITE] != board.material[COLORS.WHITE] || tempMaterial[COLORS.BLACK] != board.material[COLORS.BLACK]) {
		console.error('Material Error');
		return;
	}

	// Check 4
	if (board.side != COLORS.WHITE && board.side != COLORS.BLACK) {
		console.error('Side Error');
		return;
	}

	// Check 5
	if (generatePositionKey() != board.positionKey) {
		console.log(generatePositionKey().toString(2));
		console.log(board.positionKey.toString(2));
		console.error('Position Key Error');
		return;
	}
}
