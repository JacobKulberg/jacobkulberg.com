const BOARD_SIZE = 120;

const PIECES = {
	EMPTY: 0,
	wP: 1,
	wN: 2,
	wB: 3,
	wR: 4,
	wQ: 5,
	wK: 6,
	bP: 7,
	bN: 8,
	bB: 9,
	bR: 10,
	bQ: 11,
	bK: 12,
};

const FILES = {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	F: 5,
	G: 6,
	H: 7,
};

const RANKS = {
	ONE: 0,
	TWO: 1,
	THREE: 2,
	FOUR: 3,
	FIVE: 4,
	SIX: 5,
	SEVEN: 6,
	EIGHT: 7,
};

const COLORS = {
	WHITE: 0,
	BLACK: 1,
	BOTH: 2,
};

const CASTLE_BITS = {
	wK: 1,
	wQ: 2,
	bK: 4,
	bQ: 8,
};

const SQUARES = {
	A1: 21,
	B1: 22,
	C1: 23,
	D1: 24,
	E1: 25,
	F1: 26,
	G1: 27,
	H1: 28,

	A8: 91,
	B8: 92,
	C8: 93,
	D8: 94,
	E8: 95,
	F8: 96,
	G8: 97,
	H8: 98,

	INVALID: 99,
	OFFBOARD: 100,
};

const END_GAME_STATUS = {
	STALEMATE: 0,
	CHECKMATE: 1,
};

const INF = 50000;
const MATE = 30000;

const MAX_GAME_MOVES = 5949;
const MAX_DEPTH = 64;

const PV_ENTRIES = 10000;

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const MOVE_FLAG_EN_PASSANT = 0x40000;
const MOVE_FLAG_PAWN_START = 0x80000;
const MOVE_FLAG_CASTLING = 0x1000000;
const MOVE_FLAG_CAPTURED = 0x7c000;
const MOVE_FLAG_PROMOTION = 0xf00000;

const NO_MOVE = 0;

const PIECES_STRING = '.PNBRQKpnbrqk';
const RANKS_STRING = '12345678';
const FILES_STRING = 'abcdefgh';
const SIDE_STRING = 'wb-';

const PIECE_VALUE = [0, 100, 320, 330, 500, 900, 20000, 100, 320, 330, 500, 900, 20000];
const PIECE_COLOR = [COLORS.BOTH, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK];

const PAWN_PIECES = [false, true, false, false, false, false, false, true, false, false, false, false, false];
const KNIGHT_PIECES = [false, false, true, false, false, false, false, false, true, false, false, false, false];
const ROOK_QUEEN_PIECES = [false, false, false, false, true, true, false, false, false, false, true, true, false];
const BISHOP_QUEEN_PIECES = [false, false, false, true, false, true, false, false, false, true, false, true, false];
const KING_PIECES = [false, false, false, false, false, false, true, false, false, false, false, false, true];

const KNIGHT_DIRECTIONS = [-8, -19, -21, -12, 8, 19, 21, 12];
const ROOK_DIRECTIONS = [-1, -10, 1, 10];
const BISHOP_DIRECTIONS = [-9, -11, 11, 9];
const KING_DIRECTIONS = [-1, -10, 1, 10, -9, -11, 11, 9];

const PIECE_NUM_DIRECTIONS = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];
const PIECE_DIRECTIONS = [0, 0, KNIGHT_DIRECTIONS, BISHOP_DIRECTIONS, ROOK_DIRECTIONS, KING_DIRECTIONS, KING_DIRECTIONS, 0, KNIGHT_DIRECTIONS, BISHOP_DIRECTIONS, ROOK_DIRECTIONS, KING_DIRECTIONS, KING_DIRECTIONS];

const LOOP_NON_SLIDE_PIECE = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0];
const LOOP_NON_SLIDE_PIECE_INDEX = [0, 3];
const LOOP_SLIDE_PIECE = [PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
const LOOP_SLIDE_PIECE_INDEX = [0, 4];

const PIECE_KEYS = [];
const CASTLE_KEYS = [];
const SIDE_KEY = getRand31BitInt();

const FILES_BOARD = [];
const RANKS_BOARD = [];

const BOARD_120_TO_64 = [];
const BOARD_64_TO_120 = [];

const KINGS = [PIECES.wK, PIECES.bK];

// prettier-ignore
const CASTLING_PERMISSIONS = [
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

// prettier-ignore
const MIRROR_64 = [
	56, 57, 58, 59, 60, 61, 62, 63,
	48, 49, 50, 51, 52, 53, 54, 55,
	40, 41, 42, 43, 44, 45, 46, 47,
	32, 33, 34, 35, 36, 37, 38, 39,
	24, 25, 26, 27, 28, 29, 30, 31,
	16, 17, 18, 19, 20, 21, 22, 23,
	 8,  9, 10, 11, 12, 13, 14, 15,
	 0,  1,  2,  3,  4,  5,  6, 7
];

const MVV_LVA_VALUE = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
const MVV_LVA_SCORES = [];

function getMirror64(square) {
	return MIRROR_64[square];
}

function getSquareAt(f, r) {
	return f + r * 10 + 21;
}

function getPieceIndex(piece, pieceNum) {
	return piece * 10 + pieceNum;
}

function getRand31BitInt() {
	return Math.floor(Math.random() * 2 ** 31);
}

function getSquare64(square120) {
	return BOARD_120_TO_64[square120];
}

function getSquare120(square64) {
	return BOARD_64_TO_120[square64];
}

function getFromSquare(move) {
	return move & 0x7f;
}

function getToSquare(move) {
	return (move >> 7) & 0x7f;
}

function getCapturedPiece(move) {
	return (move >> 14) & 0xf;
}

function getPromotedPiece(move) {
	return (move >> 20) & 0xf;
}
