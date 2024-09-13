const buildCrosswordInWorker = (rows = 5, cols = 5) => {
	return new Promise((resolve, reject) => {
		const worker = new Worker('js/crosswordWorker.js');
		const words = Object.keys(CLUES).sort(() => Math.random() - 0.5);

		worker.postMessage({ rows, cols, words });

		worker.onmessage = (e) => {
			const grid = e.data;
			if (grid) {
				console.log('Crossword generated successfully.');
				resolve(grid);
			} else {
				console.error('Crossword generation failed.');
				reject('Crossword generation failed.');
			}
			worker.terminate(); // Terminate the worker once done
		};

		worker.onerror = (e) => {
			console.error('Worker error:', e);
			reject(e.message);
			worker.terminate(); // Terminate the worker if there's an error
		};
	});
};
