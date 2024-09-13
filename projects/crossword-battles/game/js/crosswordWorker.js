let crosswordRows = 5;
let crosswordCols = 5;

class WordDictionary {
	constructor(words) {
		this.prefixes = Array.from({ length: crosswordRows }, () => new Set());
		this.vertical = new Set();
		this.horizontal = new Set();

		words.forEach((word) => {
			if (word.length === crosswordRows) {
				for (let i = 1; i < word.length; i++) {
					this.prefixes[i].add(word.substring(0, i));
				}
				this.vertical.add(word);
			}

			if (word.length === crosswordCols) {
				this.horizontal.add(word);
			}
		});
	}
}

const buildCrossword = (rows = 5, cols = 5, words) => {
	crosswordRows = rows;
	crosswordCols = cols;

	const grid = Array.from({ length: crosswordRows }, () => Array(crosswordCols).fill(''));
	const wordDictionary = new WordDictionary(words);

	console.log('Generating crossword...');
	if (generateCrossword(grid, wordDictionary)) {
		return grid;
	} else {
		return null;
	}
};

const generateCrossword = (grid, wordDictionary) => {
	let rowIndex = 0;
	const usedWords = [];
	const generators = Array.from({ length: crosswordRows }, () => makeGenerator(wordDictionary.horizontal));

	while (true) {
		try {
			const gen = generators[rowIndex];
			const word = gen.next().value;

			if (!word) throw 'StopIteration';
			if (usedWords.includes(word)) continue;

			placeWord(grid, rowIndex, word, usedWords);

			if (usedWords.length < crosswordRows) {
				if (isPossible(grid, wordDictionary)) {
					rowIndex++;
				} else {
					unplaceWord(grid, rowIndex, usedWords);
				}
			} else {
				if (isValid(grid, wordDictionary)) {
					return true;
				} else {
					unplaceWord(grid, rowIndex, usedWords);
				}
			}
		} catch (e) {
			if (rowIndex === 0) {
				return false;
			} else {
				unplaceWord(grid, rowIndex, usedWords);

				generators[rowIndex] = makeGenerator(wordDictionary.horizontal);
				rowIndex--;
			}
		}
	}
};

const placeWord = (grid, rowIndex, word, usedWords) => {
	grid[rowIndex] = tokenize(word);
	usedWords.push(word);
};

const unplaceWord = (grid, rowIndex, usedWords) => {
	grid[rowIndex] = Array(crosswordCols).fill('');
	usedWords.pop();
};

const makeGenerator = function* (set) {
	for (const item of set) {
		yield item;
	}
};

const isValid = (grid, wordDictionary) => {
	for (let col = 0; col < crosswordCols; col++) {
		let word = '';

		for (let row = 0; row < crosswordRows; row++) {
			word += grid[row][col];
		}

		if (!wordDictionary.vertical.has(word)) return false;
	}

	const usedWords = new Set();
	for (let row = 0; row < crosswordRows; row++) {
		const horizontalWord = grid[row].join('');
		const verticalWord = grid.map((r) => r[row]).join('');

		if (usedWords.has(horizontalWord) || usedWords.has(verticalWord)) {
			return false;
		}

		usedWords.add(horizontalWord);
		usedWords.add(verticalWord);
	}

	return true;
};

const tokenize = (s) => s.split('');

const isPossible = (grid, wordDictionary) => {
	for (let col = 0; col < crosswordCols; col++) {
		let prefix = '';

		for (let row = 0; row < crosswordRows; row++) {
			prefix += grid[row][col];
		}

		if (!wordDictionary.prefixes[prefix.length]?.has(prefix)) {
			return false;
		}
	}

	return true;
};

// Listen for messages from the main thread
self.addEventListener('message', (e) => {
	const { rows, cols, words } = e.data;
	const crossword = buildCrossword(rows, cols, words);
	self.postMessage(crossword);
});
