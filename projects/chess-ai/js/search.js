let search = {};

search.nodes;
search.fh;
search.fhf;
search.depth = MAX_DEPTH;
search.time = 1000;
search.start;
search.stop;
search.best;
search.thinking;

function pickNextMove(moveNum) {
	let bestScore = -1;
	let bestNum = moveNum;

	for (let i = moveNum; i < board.moveListStart[board.ply + 1]; i++) {
		if (board.moveScores[i] > bestScore) {
			bestScore = board.moveScores[i];
			bestNum = i;
		}
	}

	if (bestNum != moveNum) {
		let temp = board.moveScores[moveNum];
		board.moveScores[moveNum] = board.moveScores[bestNum];
		board.moveScores[bestNum] = temp;

		temp = board.moveList[moveNum];
		board.moveList[moveNum] = board.moveList[bestNum];
		board.moveList[bestNum] = temp;
	}
}

function refreshTimeout() {
	if ($.now() - search.start > search.time) {
		search.stop = true;
	}
}

function isRepetition() {
	for (let i = board.historyPly - board.fiftyMove; i < board.historyPly - 1; i++) {
		if (board.positionKey == board.history[i].positionKey) {
			return true;
		}
	}

	return false;
}

function quiescenseSearch(alpha, beta) {
	if (search.nodes % 2048 == 0) {
		refreshTimeout();
	}

	search.nodes++;

	if ((isRepetition() || board.fiftyMove >= 100 || isPositionInsufficient()) && board.ply != 0) {
		return 0;
	}

	if (board.ply > MAX_DEPTH - 1) {
		return evaluatePosition();
	}

	let score = evaluatePosition();

	if (score >= beta) {
		return beta;
	}

	if (score > alpha) {
		alpha = score;
	}

	getAllCaptures();

	let legalMoves = 0;
	let oldAlpha = alpha;
	let bestMove = NO_MOVE;
	let move = NO_MOVE;

	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		pickNextMove(i);

		move = board.moveList[i];

		if (!makeMove(move)) {
			continue;
		}

		legalMoves++;
		score = -quiescenseSearch(-beta, -alpha);

		unmakeMove();

		if (search.stop) {
			return 0;
		}

		if (score > alpha) {
			if (score >= beta) {
				if (legalMoves == 1) {
					search.fhf++;
				}
				search.fh++;

				return beta;
			}

			alpha = score;
			bestMove = move;
		}
	}

	if (alpha != oldAlpha) {
		storePVMove(bestMove);
	}

	return alpha;
}

function alphaBeta(depth, alpha, beta) {
	if (depth <= 0) {
		return quiescenseSearch(alpha, beta);
	}

	if (search.nodes % 2048 == 0) {
		refreshTimeout();
	}

	search.nodes++;

	if ((isRepetition() || board.fiftyMove >= 100 || isPositionInsufficient()) && board.ply != 0) {
		return 0;
	}

	if (board.ply > MAX_DEPTH - 1) {
		return evaluatePosition();
	}

	let isInCheck = isSquareAttacked(board.pieceList[getPieceIndex(KINGS[board.side], 0)], board.side ^ 1);
	if (isInCheck) {
		depth++;
	}

	let score = -INF;

	getAllMoves();

	let legalMoves = 0;
	let oldAlpha = alpha;
	let bestMove = NO_MOVE;
	let move = NO_MOVE;

	let PVMove = probePVTable();
	if (PVMove != NO_MOVE) {
		for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
			if (board.moveList[i] == PVMove) {
				board.moveScores[i] = 2000000;
				break;
			}
		}
	}

	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		pickNextMove(i);

		move = board.moveList[i];

		if (!makeMove(move)) {
			continue;
		}

		legalMoves++;
		score = -alphaBeta(depth - 1, -beta, -alpha);

		unmakeMove();

		if (search.stop) {
			return 0;
		}

		if (score > alpha) {
			if (score >= beta) {
				if (legalMoves == 1) {
					search.fhf++;
				}
				search.fh++;

				if ((move & MOVE_FLAG_CAPTURED) == 0) {
					board.searchKillers[MAX_DEPTH + board.ply] = board.searchKillers[board.ply];
					board.searchKillers[board.ply] = move;
				}

				return beta;
			}

			if ((move & MOVE_FLAG_CAPTURED) == 0) {
				board.searchHistory[board.pieces[getFromSquare(move)] * BOARD_SIZE + getToSquare(move)] += depth * depth;
			}

			alpha = score;
			bestMove = move;
		}
	}

	if (legalMoves == 0) {
		if (isInCheck) {
			return -MATE + board.ply;
		} else {
			return 0;
		}
	}

	if (alpha != oldAlpha) {
		storePVMove(bestMove);
	}

	return alpha;
}

function clearForSearch() {
	for (let i = 0; i < BOARD_SIZE * 14; i++) {
		board.searchHistory[i] = 0;
	}

	for (let i = 0; i < MAX_DEPTH * 3; i++) {
		board.searchKillers[i] = 0;
	}

	clearPVTable();

	board.ply = 0;

	search.nodes = 0;
	search.fh = 0;
	search.fhf = 0;
	search.start = $.now();
	search.stop = false;
}

async function searchPosition() {
	return new Promise((res) => {
		let bestMove = NO_MOVE;
		let bestScore = -INF;

		clearForSearch();

		for (let currentDepth = 1; currentDepth <= search.depth; currentDepth++) {
			bestScore = alphaBeta(currentDepth, -INF, INF);

			if (search.stop) {
				break;
			}

			bestMove = probePVTable();

			// console.log(`Depth: ${currentDepth}\nBest Move: ${getMoveString(bestMove)}\nScore: ${bestScore}\nNodes: ${search.nodes}\nTime: ${$.now() - search.start}ms`);

			// let str = '';
			// for (let i = 0; i < getPVLine(currentDepth); i++) {
			// 	str += `${getMoveString(board.PVArray[i])} `;
			// }
			// console.log(`PV: ${str}`);

			// if (currentDepth != 1) {
			// 	console.log(`Ordering: ${((search.fhf / search.fh) * 100).toFixed(2)}%`);
			// }
		}

		search.best = bestMove;
		search.thinking = false;

		res(search.best);
	});
}
