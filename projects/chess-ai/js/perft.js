let nodes = 0;

function perft(depth) {
	if (depth == 0) {
		nodes++;
		return;
	}

	getAllMoves();

	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		if (!makeMove(board.moveList[i])) {
			continue;
		}

		perft(depth - 1);
		unmakeMove();
	}

	return nodes;
}

function perftDivide(depth) {
	console.log(`%cCurrent position at depth ${depth}:`, 'color: #73a6ff; font-weight: bold; text-decoration: underline;');

	nodes = 0;

	if (depth == 0) {
		nodes++;
		return;
	}

	getAllMoves();

	for (let i = board.moveListStart[board.ply]; i < board.moveListStart[board.ply + 1]; i++) {
		let move = board.moveList[i];

		if (!makeMove(move)) {
			continue;
		}

		let curNodes = nodes;

		perft(depth - 1);
		unmakeMove();

		let prevNodes = nodes - curNodes;

		console.log(`%c${getMoveString(move)}: ${prevNodes}`, 'color: #5492ff;');
	}

	console.log(`%cTotal nodes: ${nodes}`, 'color: #42d660;');

	return nodes;
}

function runAllPerftPositions() {
	let start = $.now();

	fetch('../perftsuite.epd')
		.then((res) => res.text())
		.then((data) => {
			console.log(`%cReading file: perftsuite.epd | Total positions: ${data.split('\n').length}`, 'color: #73a6ff; font-weight: bold; text-decoration: underline;');

			let lines = data.split('\n');

			let move = 0;
			lines.forEach((line) => {
				move++;
				let parts = line.split(';');
				let position = parts[0].trim();
				let depths = parts.slice(1).map((d) => {
					let [depth, moves] = d.trim().split(' ');
					return {
						depth: parseInt(depth.slice(1)),
						moves: parseInt(moves),
					};
				});

				console.log(`%cPosition #${move}: ${position}`, 'color: #5492ff; font-weight: bold;');
				for (let { depth, moves } of depths) {
					parseFEN(position);

					nodes = 0;

					let perftResult = perft(depth);
					if (perftResult !== moves) {
						console.log(`%cDepth ${depth} failed: ${perftResult}`, 'color: #ff5e5e;');
						break;
					}
					console.log(`%cDepth ${depth} passed: ${moves}`, 'color: #42d660;');
				}
			});

			let end = $.now();
			let formattedTime = new Date(end - start).toISOString().substring(11, 23);

			console.log(`%cFinished in ${formattedTime}ms`, 'color: #73a6ff; font-weight: bold; text-decoration: underline;');
		});
}
