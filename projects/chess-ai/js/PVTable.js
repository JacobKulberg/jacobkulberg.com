function probePVTable() {
	let index = board.positionKey % PV_ENTRIES;

	if (board.PVTable[index].positionKey == board.positionKey) {
		return board.PVTable[index].move;
	}

	return NO_MOVE;
}

function storePVMove(move) {
	let index = board.positionKey % PV_ENTRIES;

	board.PVTable[index].move = move;
	board.PVTable[index].positionKey = board.positionKey;
}

function clearPVTable() {
	for (let i = 0; i < PV_ENTRIES; i++) {
		board.PVTable[i].move = NO_MOVE;
		board.PVTable[i].positionKey = 0;
	}
}

function getPVLine(depth) {
	let move = probePVTable();
	let count = 0;

	while (move != NO_MOVE && count < depth) {
		if (doesMoveExist(move)) {
			makeMove(move);
			board.PVArray[count++] = move;
		} else {
			break;
		}
		move = probePVTable();
	}

	while (board.ply > 0) {
		unmakeMove();
	}

	return count;
}
