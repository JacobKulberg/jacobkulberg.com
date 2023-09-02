$('#fen-button').on('click', function () {
	let newFen = $('#fen input').val();
	parseFEN(newFen);
	printBoard();
});

function setupBoard() {
	let boardEl = document.getElementById('board');

	for (let i = 0; i < 64; i++) {
		let square = document.createElement('div');
		square.classList.add('square');
		square.setAttribute('data-id', `${i}`);

		if (i % 8 == 0) {
			let rank = document.createElement('div');
			rank.classList.add('board-rank');
			rank.innerText = RANKS_STRING[Math.floor(getMirror64(i) / 8)];
			square.appendChild(rank);
		}
		if (i >= 56) {
			let file = document.createElement('div');
			file.classList.add('board-file');
			file.innerText = FILES_STRING[i - 56];
			square.appendChild(file);
		}

		if (((i % 8) + Math.floor(i / 8)) % 2 == 1) {
			square.classList.add('dark');
		} else {
			square.classList.add('light');
		}

		boardEl.appendChild(square);
	}

	const mouse = {
		x: 0,
		y: 0,
	};

	$('.square').on('mousedown touchstart', (e) => {
		e.stopPropagation();
		e.preventDefault();

		if ($(e.currentTarget).has('.legal-circle').length) {
			return;
		}

		mouse.x = e.pageX || e.originalEvent.touches?.[0].pageX || mouse.x;
		mouse.y = e.pageY || e.originalEvent.touches?.[0].pageY || mouse.y;

		let square = $(e.currentTarget);
		let piece = square.children('img')[0];
		if (piece) {
			piece = $(piece);

			$('.square').removeClass('selected-square');

			square.addClass('selected-square hovered-square');

			piece.css({
				position: 'absolute',
				top: Math.min(Math.max(mouse.y - piece.height() / 2, 0), $(window).height() - piece.height()),
				left: Math.min(Math.max(mouse.x - piece.width() / 2, 0), $(window).width() - piece.width()),
				width: 'calc(100vmin / 8 * 0.9)',
				height: 'calc(100vmin / 8 * 0.9)',
				pointerEvents: 'none',
				zIndex: 1,
			});
			piece.remove();
			$('body').append(piece);
			$('body').css('cursor', 'grabbing');

			clearHints();

			let moves = getAllMovesArr();
			for (let i = 0; i < moves.length; i++) {
				if (!isLegalMove(moves[i])) {
					moves.splice(i, 1);
					i--;
					continue;
				}

				let from = getFromSquare(moves[i]);
				let squareNum = BOARD_64_TO_120[getMirror64(square.attr('data-id'))];
				if (from == squareNum) {
					let to = getToSquare(moves[i]);
					let toSquareEl = $(`.square[data-id="${getMirror64(BOARD_120_TO_64[to])}"]`);
					let circle = document.createElement('div');
					circle.classList.add('legal-circle');
					toSquareEl.append(circle);
				}
			}

			$(window).on('mousemove touchmove', (e) => {
				e.stopPropagation();
				e.preventDefault();

				mouse.x = e.pageX || e.originalEvent.touches?.[0].pageX || mouse.x;
				mouse.y = e.pageY || e.originalEvent.touches?.[0].pageY || mouse.y;

				piece.css({
					top: Math.min(Math.max(mouse.y - piece.height() / 2, 0), $(window).height() - piece.height()),
					left: Math.min(Math.max(mouse.x - piece.width() / 2, 0), $(window).width() - piece.width()),
				});

				$('.square').each((index, square) => {
					$(square).removeClass('hovered-square');
				});

				let nearestSquare = getNearestSquare(mouse.x, mouse.y);
				if (nearestSquare) {
					nearestSquare.addClass('hovered-square');
				}
			});

			$(window).one('mouseup touchend', async (e) => {
				e.stopPropagation();
				e.preventDefault();
				$(window).off('mousemove touchmove');

				$('.square').removeClass('hovered-square');

				$('body').css('cursor', '');

				let nearestSquare = getNearestSquare(mouse.x, mouse.y);
				if (!nearestSquare || !nearestSquare.has('.legal-circle') || nearestSquare[0] == square[0]) {
					square.removeClass('hovered-square');
					piece.removeAttr('style');
					square.append(piece);
					return;
				}

				square.removeClass('selected-square');
				$('.square').children('.check-square').remove();

				let aiMoveTimeout = null;

				if (!nearestSquare || !nearestSquare.has('.legal-circle').length) {
					nearestSquare = square;
				} else {
					$('.square').removeClass('previously-moved-square');

					$(square).addClass('previously-moved-square');
					$(nearestSquare).addClass('previously-moved-square');
					$('#cover').css('display', 'block');

					let pieceFrom = BOARD_64_TO_120[getMirror64(square.attr('data-id'))];
					let pieceTo = BOARD_64_TO_120[getMirror64(nearestSquare.attr('data-id'))];
					for (let i = 0; i < moves.length; i++) {
						if (getFromSquare(moves[i]) == pieceFrom && getToSquare(moves[i]) == pieceTo) {
							if ((board.pieces[pieceFrom] == PIECES.wP || board.pieces[pieceFrom] == PIECES.bP) && (board.side == COLORS.WHITE ? RANKS_BOARD[pieceTo] == RANKS.EIGHT : RANKS_BOARD[pieceTo] == RANKS.ONE)) {
								let pieceNum = await getPromotedPieceGUI();
								switch (pieceNum) {
									case '5':
										board.pieces[pieceFrom] = PIECES.wQ;
										[0].src = 'images/wQ.svg';
										break;
									case '4':
										board.pieces[pieceFrom] = PIECES.wR;
										piece[0].src = 'images/wR.svg';
										break;
									case '2':
										board.pieces[pieceFrom] = PIECES.wN;
										piece[0].src = 'images/wN.svg';
										break;
									case '3':
										board.pieces[pieceFrom] = PIECES.wB;
										piece[0].src = 'images/wB.svg';
										break;
									case '11':
										board.pieces[pieceFrom] = PIECES.bQ;
										piece[0].src = 'images/bQ.svg';
										break;
									case '10':
										board.pieces[pieceFrom] = PIECES.bR;
										piece[0].src = 'images/bR.svg';
										break;
									case '8':
										board.pieces[pieceFrom] = PIECES.bN;
										piece[0].src = 'images/bN.svg';
										break;
									case '9':
										board.pieces[pieceFrom] = PIECES.bB;
										piece[0].src = 'images/bB.svg';
										break;
								}
							}

							makeMove(moves[i]);
							break;
						}
					}

					$('.square').addClass('hovered-square-off');

					aiMoveTimeout = setTimeout(aiMove, 500);
				}

				clearHints();
				piece.removeAttr('style');
				nearestSquare.children('img').remove();
				nearestSquare.removeClass('hovered-square');
				nearestSquare.append(piece);

				refreshBoardGUI();

				if (board.fiftyMove >= 100) {
					clearTimeout(aiMoveTimeout);
					$('#cover').css('display', 'block');
					return endGame(END_GAME_STATUS.STALEMATE, 'Fifty move rule!');
				} else if (isPositionInsufficient()) {
					clearTimeout(aiMoveTimeout);
					$('#cover').css('display', 'block');
					return endGame(END_GAME_STATUS.STALEMATE, 'Insufficient material!');
				}

				let samePositionCount = 0;
				for (let j = 0; j < board.historyPly; j++) {
					if (board.history[j].positionKey == board.positionKey) {
						samePositionCount++;
					}

					if (samePositionCount >= 2) {
						clearTimeout(aiMoveTimeout);
						$('#cover').css('display', 'block');
						return endGame(END_GAME_STATUS.STALEMATE, 'Threefold repetition!');
					}
				}
			});
		}
	});

	$('*:not(.square:has(.selected-square))').on('mousedown touchstart', (e) => {
		e.stopPropagation();
		e.preventDefault();

		if ($(e.currentTarget).children('.legal-circle').length) {
			return;
		}

		if ($(e.currentTarget).hasClass('selected-square')) {
			$('.square').each((index, square) => {
				if (square != e.currentTarget) {
					$(square).removeClass('selected-square');
				}
			});
		} else {
			$('.square').removeClass('selected-square');
			clearHints();
		}
	});

	$('.square').on('mousedown touchstart', async (e) => {
		e.stopPropagation();
		e.preventDefault();

		if (!$(e.currentTarget).has('.legal-circle').length) {
			return;
		}

		$('.square').removeClass('previously-moved-square');
		$('.square').children('.check-square').remove();

		$('.selected-square').addClass('previously-moved-square');
		$(e.currentTarget).addClass('previously-moved-square');
		$('#cover').css('display', 'block');

		let piece = $('.selected-square').children('img');
		let pieceFrom = BOARD_64_TO_120[getMirror64($('.selected-square').attr('data-id'))];
		let pieceTo = BOARD_64_TO_120[getMirror64($(e.currentTarget).attr('data-id'))];

		let moves = getAllMovesArr();
		for (let i = 0; i < moves.length; i++) {
			if (getFromSquare(moves[i]) == pieceFrom && getToSquare(moves[i]) == pieceTo) {
				if ((board.pieces[pieceFrom] == PIECES.wP || board.pieces[pieceFrom] == PIECES.bP) && (board.side == COLORS.WHITE ? RANKS_BOARD[pieceTo] == RANKS.EIGHT : RANKS_BOARD[pieceTo] == RANKS.ONE)) {
					let pieceNum = await getPromotedPieceGUI();
					switch (pieceNum) {
						case '5':
							board.pieces[pieceFrom] = PIECES.wQ;
							piece[0].src = 'images/wQ.svg';
							break;
						case '4':
							board.pieces[pieceFrom] = PIECES.wR;
							piece[0].src = 'images/wR.svg';
							break;
						case '2':
							board.pieces[pieceFrom] = PIECES.wN;
							piece[0].src = 'images/wN.svg';
							break;
						case '3':
							board.pieces[pieceFrom] = PIECES.wB;
							piece[0].src = 'images/wB.svg';
							break;
						case '11':
							board.pieces[pieceFrom] = PIECES.bQ;
							piece[0].src = 'images/bQ.svg';
							break;
						case '10':
							board.pieces[pieceFrom] = PIECES.bR;
							piece[0].src = 'images/bR.svg';
							break;
						case '8':
							board.pieces[pieceFrom] = PIECES.bN;
							piece[0].src = 'images/bN.svg';
							break;
						case '9':
							board.pieces[pieceFrom] = PIECES.bB;
							piece[0].src = 'images/bB.svg';
							break;
					}
				}

				makeMove(moves[i]);
				break;
			}
		}

		$('.square').addClass('hovered-square-off');

		let aiMoveTimeout = setTimeout(aiMove, 500);

		clearHints();
		piece.removeAttr('style');
		$(e.currentTarget).children('img').remove();
		$(e.currentTarget).removeClass('hovered-square');
		$(e.currentTarget).append(piece);
		$('.selected-square').removeClass('selected-square');

		refreshBoardGUI();

		if (board.fiftyMove >= 100) {
			clearTimeout(aiMoveTimeout);
			$('#cover').css('display', 'block');
			return endGame(END_GAME_STATUS.STALEMATE, 'Fifty move rule!');
		} else if (isPositionInsufficient()) {
			clearTimeout(aiMoveTimeout);
			$('#cover').css('display', 'block');
			return endGame(END_GAME_STATUS.STALEMATE, 'Insufficient material!');
		}

		let samePositionCount = 0;
		for (let j = 0; j < board.historyPly; j++) {
			if (board.history[j].positionKey == board.positionKey) {
				samePositionCount++;
			}

			if (samePositionCount >= 2) {
				clearTimeout(aiMoveTimeout);
				$('#cover').css('display', 'block');
				return endGame(END_GAME_STATUS.STALEMATE, 'Threefold repetition!');
			}
		}
	});
}

async function aiMove() {
	$('#cover').css('display', '');

	let fen = generateFEN();
	parseFEN(fen);

	let bestAIMove = await searchPosition();

	let allLegalMoves = getAllMovesArr().filter((move) => isLegalMove(move));
	if (allLegalMoves.length == 0) {
		$('#cover').css('display', 'block');
		if (isSquareAttacked(board.pieceList[getPieceIndex(KINGS[board.side], 0)], board.side ^ 1)) {
			return endGame(END_GAME_STATUS.CHECKMATE, 'Checkmate!');
		} else {
			return endGame(END_GAME_STATUS.STALEMATE, 'Stalemate!');
		}
	}

	makeMove(bestAIMove);

	$('.square').removeClass('hovered-square-off previously-moved-square');
	$('.square').children('.check-square').remove();

	$(`.square[data-id="${getMirror64(BOARD_120_TO_64[getFromSquare(bestAIMove)])}"]`).addClass('previously-moved-square');
	$(`.square[data-id="${getMirror64(BOARD_120_TO_64[getToSquare(bestAIMove)])}"]`).addClass('previously-moved-square');

	refreshBoardGUI();

	allLegalMoves = getAllMovesArr().filter((move) => isLegalMove(move));
	if (allLegalMoves.length == 0) {
		$('#cover').css('display', 'block');
		if (isSquareAttacked(board.pieceList[getPieceIndex(KINGS[board.side], 0)], board.side ^ 1)) {
			return endGame(END_GAME_STATUS.CHECKMATE, 'Checkmate!');
		} else {
			return endGame(END_GAME_STATUS.STALEMATE, 'Stalemate!');
		}
	}

	if (board.fiftyMove >= 100) {
		$('#cover').css('display', 'block');
		return endGame(END_GAME_STATUS.STALEMATE, 'Fifty move rule!');
	} else if (isPositionInsufficient()) {
		$('#cover').css('display', 'block');
		return endGame(END_GAME_STATUS.STALEMATE, 'Insufficient material!');
	}

	let samePositionCount = 0;
	for (let j = 0; j < board.historyPly; j++) {
		if (board.history[j].positionKey == board.positionKey) {
			samePositionCount++;
		}

		if (samePositionCount >= 2) {
			$('#cover').css('display', 'block');
			return endGame(END_GAME_STATUS.STALEMATE, 'Threefold repetition!');
		}
	}
}

function endGame(status, message) {
	if (status === END_GAME_STATUS.STALEMATE) {
		console.log('The game ended in a stalemate: ' + message);
	} else if (status === END_GAME_STATUS.CHECKMATE) {
		console.log('The game ended in a checkmate!');
	}
}

async function getPromotedPieceGUI() {
	return new Promise((res) => {
		$('.promotion-piece img').each((index, piece) => {
			let pieceType = piece.src[piece.src.length - 5];
			if (board.side == COLORS.WHITE) {
				$(piece).parent().css('background-color', 'rgba(0, 0, 0, 0.25)');
				$(piece).attr('src', `images/w${pieceType}.svg`);
			} else {
				$(piece).parent().css('background-color', 'rgba(255, 255, 255, 0.25)');
				$(piece).attr('src', `images/b${pieceType}.svg`);
			}
		});

		$('#promotion').css('display', 'flex');

		$('.promotion-piece').on('click', (e) => {
			let piece = $(e.currentTarget)
				.children('img')
				.attr(`data-piece-${board.side == COLORS.WHITE ? 'white' : 'black'}`);
			$('#promotion').css('display', 'none');

			res(piece);

			$('.promotion-piece').off('click');
		});
	});
}

function refreshBoardGUI() {
	for (let i = 0; i < board.pieces.length; i++) {
		if (board.pieces[i] != SQUARES.INVALID && board.pieces[i] != SQUARES.OFFBOARD) {
			let pieceNum = board.pieces[i];
			switch (pieceNum) {
				case PIECES.wP:
					pieceNum = 'wP';
					break;
				case PIECES.wN:
					pieceNum = 'wN';
					break;
				case PIECES.wB:
					pieceNum = 'wB';
					break;
				case PIECES.wR:
					pieceNum = 'wR';
					break;
				case PIECES.wQ:
					pieceNum = 'wQ';
					break;
				case PIECES.wK:
					pieceNum = 'wK';
					break;
				case PIECES.bP:
					pieceNum = 'bP';
					break;
				case PIECES.bN:
					pieceNum = 'bN';
					break;
				case PIECES.bB:
					pieceNum = 'bB';
					break;
				case PIECES.bR:
					pieceNum = 'bR';
					break;
				case PIECES.bQ:
					pieceNum = 'bQ';
					break;
				case PIECES.bK:
					pieceNum = 'bK';
					break;
			}

			let boardPiece;
			$('.square').each((index, square) => {
				if ($(square).attr('data-id') == getMirror64(BOARD_120_TO_64[i]) && $(square).has('img').length) {
					boardPiece = $(square).children('img')[0].src;
					boardPiece = boardPiece.substring(boardPiece.lastIndexOf('/') + 1).replace('.svg', '');
				}
			});

			if (boardPiece != pieceNum) {
				$('.square').each((index, square) => {
					if (pieceNum && $(square).attr('data-id') == getMirror64(BOARD_120_TO_64[i])) {
						$(square).children('img').remove();
						let piece = document.createElement('img');
						piece.src = `images/${pieceNum}.svg`;
						$(square).append(piece);
					} else {
						if ($(square).attr('data-id') == getMirror64(BOARD_120_TO_64[i])) {
							$(square).children('img').remove();
						}
					}
				});
			}

			if (boardPiece == 'wK') {
				if (isSquareAttacked(i, COLORS.BLACK)) {
					let checkSquare = document.createElement('div');
					$(checkSquare).addClass('check-square');
					$(`.square[data-id="${getMirror64(BOARD_120_TO_64[i])}"]`).append(checkSquare);
				}
			} else if (boardPiece == 'bK') {
				if (isSquareAttacked(i, COLORS.WHITE)) {
					let checkSquare = document.createElement('div');
					$(checkSquare).addClass('check-square');
					$(`.square[data-id="${getMirror64(BOARD_120_TO_64[i])}"]`).append(checkSquare);
				}
			}
		}
	}
}

function getNearestSquare(x, y) {
	let square = document.elementFromPoint(x, y);

	if (!square || !square.classList.contains('square')) {
		if (!$(square).is('img')) {
			return null;
		} else {
			square = $(square).parent();
		}
	}

	return $(square);
}

function clearHints() {
	$('.legal-circle').remove();
}
