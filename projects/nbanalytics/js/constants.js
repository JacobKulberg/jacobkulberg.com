const gameEvents = {
	'nba in-season tournament - group play': 'In-Season Tournament',
	'nba in-season tournament - quarterfinals': 'In-Season Tournament',
	'nba in-season tournament - semifinals': 'In-Season Tournament',
	'nba in-season tournament championship': 'In-Season Tournament',
	'nba cup - group play': 'NBA Cup - Group Play',
	'nba cup - quarterfinals': 'NBA Cup Quarterfinals',
	'nba cup - semifinals': 'NBA Cup Semifinals',
	'nba cup championship': 'NBA Cup Championship',
	playoffs: 'Playoffs',
	finals: 'NBA Finals',
	'nba play-in - east - 7th place vs 8th place': 'Play-In',
	'nba play-in - east - 9th place vs 10th place': 'Play-In',
	'nba play-in - west - 7th place vs 8th place': 'Play-In',
	'nba play-in - west - 9th place vs 10th place': 'Play-In',
	'nba play-in - east - 8th seed game': 'Play-In',
	'nba play-in - west - 8th seed game': 'Play-In',
	'east 1st round - game 1': 'First Round - Game 1',
	'east 1st round - game 2': 'First Round - Game 2',
	'east 1st round - game 3': 'First Round - Game 3',
	'east 1st round - game 4': 'First Round - Game 4',
	'east 1st round - game 5': 'First Round - Game 5',
	'east 1st round - game 6': 'First Round - Game 6',
	'east 1st round - game 7': 'First Round - Game 7',
	'west 1st round - game 1': 'First Round - Game 1',
	'west 1st round - game 2': 'First Round - Game 2',
	'west 1st round - game 3': 'First Round - Game 3',
	'west 1st round - game 4': 'First Round - Game 4',
	'west 1st round - game 5': 'First Round - Game 5',
	'west 1st round - game 6': 'First Round - Game 6',
	'west 1st round - game 7': 'First Round - Game 7',
	'eastern conference 1st round - game 1': 'First Round - Game 1',
	'eastern conference 1st round - game 2': 'First Round - Game 2',
	'eastern conference 1st round - game 3': 'First Round - Game 3',
	'eastern conference 1st round - game 4': 'First Round - Game 4',
	'eastern conference 1st round - game 5': 'First Round - Game 5',
	'eastern conference 1st round - game 6': 'First Round - Game 6',
	'eastern conference 1st round - game 7': 'First Round - Game 7',
	'western conference 1st round - game 1': 'First Round - Game 1',
	'western conference 1st round - game 2': 'First Round - Game 2',
	'western conference 1st round - game 3': 'First Round - Game 3',
	'western conference 1st round - game 4': 'First Round - Game 4',
	'western conference 1st round - game 5': 'First Round - Game 5',
	'western conference 1st round - game 6': 'First Round - Game 6',
	'western conference 1st round - game 7': 'First Round - Game 7',
	'east semifinals - game 1': 'East Semifinals - Game 1',
	'east semifinals - game 2': 'East Semifinals - Game 2',
	'east semifinals - game 3': 'East Semifinals - Game 3',
	'east semifinals - game 4': 'East Semifinals - Game 4',
	'east semifinals - game 5': 'East Semifinals - Game 5',
	'east semifinals - game 6': 'East Semifinals - Game 6',
	'east semifinals - game 7': 'East Semifinals - Game 7',
	'west semifinals - game 1': 'West Semifinals - Game 1',
	'west semifinals - game 2': 'West Semifinals - Game 2',
	'west semifinals - game 3': 'West Semifinals - Game 3',
	'west semifinals - game 4': 'West Semifinals - Game 4',
	'west semifinals - game 5': 'West Semifinals - Game 5',
	'west semifinals - game 6': 'West Semifinals - Game 6',
	'west semifinals - game 7': 'West Semifinals - Game 7',
	'eastern conference semifinals - game 1': 'East Semifinals - Game 1',
	'eastern conference semifinals - game 2': 'East Semifinals - Game 2',
	'eastern conference semifinals - game 3': 'East Semifinals - Game 3',
	'eastern conference semifinals - game 4': 'East Semifinals - Game 4',
	'eastern conference semifinals - game 5': 'East Semifinals - Game 5',
	'eastern conference semifinals - game 6': 'East Semifinals - Game 6',
	'eastern conference semifinals - game 7': 'East Semifinals - Game 7',
	'western conference semifinals - game 1': 'West Semifinals - Game 1',
	'western conference semifinals - game 2': 'West Semifinals - Game 2',
	'western conference semifinals - game 3': 'West Semifinals - Game 3',
	'western conference semifinals - game 4': 'West Semifinals - Game 4',
	'western conference semifinals - game 5': 'West Semifinals - Game 5',
	'western conference semifinals - game 6': 'West Semifinals - Game 6',
	'western conference semifinals - game 7': 'West Semifinals - Game 7',
	'east finals - game 1': 'East Finals - Game 1',
	'east finals - game 2': 'East Finals - Game 2',
	'east finals - game 3': 'East Finals - Game 3',
	'east finals - game 4': 'East Finals - Game 4',
	'east finals - game 5': 'East Finals - Game 5',
	'east finals - game 6': 'East Finals - Game 6',
	'east finals - game 7': 'East Finals - Game 7',
	'west finals - game 1': 'West Finals - Game 1',
	'west finals - game 2': 'West Finals - Game 2',
	'west finals - game 3': 'West Finals - Game 3',
	'west finals - game 4': 'West Finals - Game 4',
	'west finals - game 5': 'West Finals - Game 5',
	'west finals - game 6': 'West Finals - Game 6',
	'west finals - game 7': 'West Finals - Game 7',
	'eastern conference finals - game 1': 'East Finals - Game 1',
	'eastern conference finals - game 2': 'East Finals - Game 2',
	'eastern conference finals - game 3': 'East Finals - Game 3',
	'eastern conference finals - game 4': 'East Finals - Game 4',
	'eastern conference finals - game 5': 'East Finals - Game 5',
	'eastern conference finals - game 6': 'East Finals - Game 6',
	'eastern conference finals - game 7': 'East Finals - Game 7',
	'western conference finals - game 1': 'West Finals - Game 1',
	'western conference finals - game 2': 'West Finals - Game 2',
	'western conference finals - game 3': 'West Finals - Game 3',
	'western conference finals - game 4': 'West Finals - Game 4',
	'western conference finals - game 5': 'West Finals - Game 5',
	'western conference finals - game 6': 'West Finals - Game 6',
	'western conference finals - game 7': 'West Finals - Game 7',
	'finals - game 1': 'NBA Finals - Game 1',
	'finals - game 2': 'NBA Finals - Game 2',
	'finals - game 3': 'NBA Finals - Game 3',
	'finals - game 4': 'NBA Finals - Game 4',
	'finals - game 5': 'NBA Finals - Game 5',
	'finals - game 6': 'NBA Finals - Game 6',
	'finals - game 7': 'NBA Finals - Game 7',
	'nba finals - game 1': 'NBA Finals - Game 1',
	'nba finals - game 2': 'NBA Finals - Game 2',
	'nba finals - game 3': 'NBA Finals - Game 3',
	'nba finals - game 4': 'NBA Finals - Game 4',
	'nba finals - game 5': 'NBA Finals - Game 5',
	'nba finals - game 6': 'NBA Finals - Game 6',
	'nba finals - game 7': 'NBA Finals - Game 7',
};

const teamNames = {
	1: 'Atlanta Hawks',
	2: 'Boston Celtics',
	3: 'New Orleans Pelicans',
	4: 'Chicago Bulls',
	5: 'Cleveland Cavaliers',
	6: 'Dallas Mavericks',
	7: 'Denver Nuggets',
	8: 'Detroit Pistons',
	9: 'Golden State Warriors',
	10: 'Houston Rockets',
	11: 'Indiana Pacers',
	12: 'Los Angeles Clippers',
	13: 'Los Angeles Lakers',
	14: 'Miami Heat',
	15: 'Milwaukee Bucks',
	16: 'Minnesota Timberwolves',
	17: 'Brooklyn Nets',
	18: 'New York Knicks',
	19: 'Orlando Magic',
	20: 'Philadelphia 76ers',
	21: 'Phoenix Suns',
	22: 'Portland Trail Blazers',
	23: 'Sacramento Kings',
	24: 'San Antonio Spurs',
	25: 'Oklahoma City Thunder',
	26: 'Utah Jazz',
	27: 'Washington Wizards',
	28: 'Toronto Raptors',
	29: 'Memphis Grizzles',
	30: 'Charlotte Hornets',
};

const teamNamesShort = {
	1: 'Hawks',
	2: 'Celtics',
	3: 'Pelicans',
	4: 'Bulls',
	5: 'Cavaliers',
	6: 'Mavericks',
	7: 'Nuggets',
	8: 'Pistons',
	9: 'Warriors',
	10: 'Rockets',
	11: 'Pacers',
	12: 'Clippers',
	13: 'Lakers',
	14: 'Heat',
	15: 'Bucks',
	16: 'Timberwolves',
	17: 'Nets',
	18: 'Knicks',
	19: 'Magic',
	20: '76ers',
	21: 'Suns',
	22: 'Trail Blazers',
	23: 'Kings',
	24: 'Spurs',
	25: 'Thunder',
	26: 'Jazz',
	27: 'Wizards',
	28: 'Raptors',
	29: 'Grizzles',
	30: 'Hornets',
};

const teamColors = {
	1: 'c8102e', // Atlanta Hawks
	2: '008348', // Boston Celtics
	3: '0a2240', // New Orleans Pelicans
	4: 'ce1141', // Chicago Bulls
	5: '860038', // Cleveland Cavaliers
	6: '0064b1', // Dallas Mavericks
	7: 'fec524', // Denver Nuggets
	8: '1d428a', // Detroit Pistons
	9: 'fdb927', // Golden State Warriors
	10: 'ce1141', // Houston Rockets
	11: '002d62', // Indiana Pacers
	12: '1d428a', // Los Angeles Clippers
	13: '552583', // Los Angeles Lakers
	14: '98002e', // Miami Heat
	15: '00471b', // Milwaukee Bucks
	16: '266092', // Minnesota Timberwolves
	17: '171819', // Brooklyn Nets
	18: 'f58426', // New York Knicks
	19: '0077c0', // Orlando Magic
	20: '1d428a', // Philadelphia 76ers
	21: '29127a', // Phoenix Suns
	22: 'e03a3e', // Portland Trail Blazers
	23: '5a2d81', // Sacramento Kings
	24: 'c2ccd2', // San Antonio Spurs
	25: '007ac1', // Oklahoma City Thunder
	26: '4e008e', // Utah Jazz
	27: '002b5c', // Washington Wizards
	28: 'd91244', // Toronto Raptors
	29: '5d76a9', // Memphis Grizzles
	30: '008ca8', // Charlotte Hornets
};

const teamColorsAlt = {
	1: 'fdb927', // Atlanta Hawks
	2: 'ffffff', // Boston Celtics
	3: 'b4975a', // New Orleans Pelicans
	4: '000000', // Chicago Bulls
	5: 'bc945c', // Cleveland Cavaliers
	6: 'bbc4ca', // Dallas Mavericks
	7: 'fec524', // Denver Nuggets
	8: 'c8102e', // Detroit Pistons
	9: '1d428a', // Golden State Warriors
	10: '000000', // Houston Rockets
	11: 'fdbb30', // Indiana Pacers
	12: 'c8102e', // Los Angeles Clippers
	13: 'fdb927', // Los Angeles Lakers
	14: '000000', // Miami Heat
	15: 'eee1c6', // Milwaukee Bucks
	16: '79bc43', // Minnesota Timberwolves
	17: 'ffffff', // Brooklyn Nets
	18: 'f58426', // New York Knicks
	19: 'c4ced4', // Orlando Magic
	20: 'e01234', // Philadelphia 76ers
	21: 'e56020', // Phoenix Suns
	22: '000000', // Portland Trail Blazers
	23: '6a7a82', // Sacramento Kings
	24: '000000', // San Antonio Spurs
	25: 'ef3b24', // Oklahoma City Thunder
	26: 'fff21f', // Utah Jazz
	27: '002b5c', // Washington Wizards
	28: '000000', // Toronto Raptors
	29: '12173f', // Memphis Grizzles
	30: '1d1060', // Charlotte Hornets
};

const teamLogos = {
	1: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png', // Atlanta Hawks
	2: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg', // Boston Celtics
	3: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png', // New Orleans Pelicans
	4: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', // Chicago Bulls
	5: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png', // Cleveland Cavaliers
	6: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', // Dallas Mavericks
	7: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', // Denver Nuggets
	8: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png', // Detroit Pistons
	9: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png', // Golden State Warriors
	10: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png', // Houston Rockets
	11: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png', // Indiana Pacers
	12: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png', // Los Angeles Clippers
	13: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', // Los Angeles Lakers
	14: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', // Miami Heat
	15: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', // Milwaukee Bucks
	16: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', // Minnesota Timberwolves
	17: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png', // Brooklyn Nets
	18: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png', // New York Knicks
	19: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png', // Orlando Magic
	20: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png', // Philadelphia 76ers
	21: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png', // Phoenix Suns
	22: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png', // Portland Trail Blazers
	23: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png', // Sacramento Kings
	24: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png', // San Antonio Spurs
	25: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg', // Oklahoma City Thunder
	26: 'https://logos.logofury.com/logo_src/20dba3b5841d7dc92dc0c589c08493f7.png', // Utah Jazz
	27: 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png', // Washington Wizards
	28: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png', // Toronto Raptors
	29: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png', // Memphis Grizzles
	30: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png', // Charlotte Hornets
};

const teamAbbrs = {
	1: 'ATL', // Atlanta Hawks
	2: 'BOS', // Boston Celtics
	3: 'NOP', // New Orleans Pelicans
	4: 'CHI', // Chicago Bulls
	5: 'CLE', // Cleveland Cavaliers
	6: 'DAL', // Dallas Mavericks
	7: 'DEN', // Denver Nuggets
	8: 'DET', // Detroit Pistons
	9: 'GSW', // Golden State Warriors
	10: 'HOU', // Houston Rockets
	11: 'IND', // Indiana Pacers
	12: 'LAC', // Los Angeles Clippers
	13: 'LAL', // Los Angeles Lakers
	14: 'MIA', // Miami Heat
	15: 'MIL', // Milwaukee Bucks
	16: 'MIN', // Minnesota Timberwolves
	17: 'BKN', // Brooklyn Nets
	18: 'NYK', // New York Knicks
	19: 'ORL', // Orlando Magic
	20: 'PHI', // Philadelphia 76ers
	21: 'PHX', // Phoenix Suns
	22: 'POR', // Portland Trail Blazers
	23: 'SAC', // Sacramento Kings
	24: 'SAS', // San Antonio Spurs
	25: 'OKC', // Oklahoma City Thunder
	26: 'UTA', // Utah Jazz
	27: 'WAS', // Washington Wizards
	28: 'TOR', // Toronto Raptors
	29: 'MEM', // Memphis Grizzles
	30: 'CHA', // Charlotte Hornets
};

async function playToText(playID, participants, team, description) {
	playID = parseInt(playID);
	switch (playID) {
		// jump ball
		case 11: {
			let player1Name = await getPlayerName(participants[0].athlete.id);
			let player2Name = await getPlayerName(participants[1].athlete.id);
			if (participants.length > 2) {
				let player3Name = await getPlayerName(participants[2].athlete.id);
				return `Jump Ball: ${player1Name} vs ${player2Name} (${player3Name} gains possession)`;
			} else {
				return `Jump Ball: ${player1Name} vs ${player2Name}`;
			}
		}
		case 615: {
			let player1Name = await getPlayerName(participants[0].athlete.id);
			let player2Name = await getPlayerName(participants[1].athlete.id);
			if (participants.length > 2) {
				let player3Name = await getPlayerName(participants[2].athlete.id);
				return `Jump Ball: ${player1Name} vs ${player2Name} (${player3Name} gains possession)`;
			} else {
				return `Jump Ball: ${player1Name} vs ${player2Name}`;
			}
		}

		// challenge
		case 213: {
			return `${teamNamesShort[team.id]} Coach's Challenge`;
		}
		case 214: {
			return `${teamNamesShort[team.id]} Coach's Challenge`;
		}
		case 215: {
			return `${teamNamesShort[team.id]} Coach's Challenge: Call Overturned`;
		}
		case 216: {
			return `${teamNamesShort[team.id]} Coach's Challenge: Call Stands`;
		}
		case 277: {
			return `${teamNamesShort[team.id]} Coach's Challenge`;
		}

		// ref review
		case 278: {
			return `Ref-Initiated Review`;
		}
		case 279: {
			return `Ref-Initiated Review: Call Overturned`;
		}
		case 280: {
			return `Ref-Initiated Review: Call Stands`;
		}

		// shot clock
		case 70: {
			return 'Shot Clock Violation';
		}

		// timeout
		case 16: {
			return `${teamNamesShort[team.id]} timeout`;
		}

		// substitution
		case 584: {
			let player1Name = await getPlayerName(participants[0].athlete.id);
			if (participants.length > 1) {
				let player2Name = await getPlayerName(participants[1].athlete.id);
				return `${player1Name} substitutes for ${player2Name}`;
			} else {
				return `${player1Name} substitution`;
			}
		}
	}

	return description;
}

function getPlayerHeadshot(playerID) {
	return new Promise((resolve, reject) => {
		$.get(`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerID}.png`)
			.done(() => {
				resolve(`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerID}.png`);
			})
			.fail(() => {
				resolve('/assets/images/silhouette.png');
			});
	});
}

function getAllGames(date) {
	return new Promise((resolve, reject) => {
		fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error fetching games! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				let games = [];
				data.events.forEach((game) => {
					if (game.competitions[0].competitors[0].id >= 1 && game.competitions[0].competitors[0].id <= 30 && game.competitions[0].competitors[1].id >= 1 && game.competitions[0].competitors[1].id <= 30) {
						games.push(game);
					}
				});
				resolve(games);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

function getSpecificGameData(gameID) {
	return new Promise((resolve, reject) => {
		fetch(`https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameID}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error fetching specific game! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(error);

				if (error.toString().includes('404')) {
					window.location.href = '/projects/nbanalytics/';
				}
			});
	});
}

function getPlayerName(playerID) {
	if (playerID === undefined) {
		return '';
	}

	return new Promise((resolve, reject) => {
		fetch(`https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${playerID}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error fetching player name! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				resolve(data.displayName);
			})
			.catch((error) => {
				reject(error);
			});
	});
}

// are two colors 10% different from each other
function areColorsSimilar(rgb1, rgb2) {
	let r1 = parseInt(rgb1.substring(0, 2), 16);
	let g1 = parseInt(rgb1.substring(2, 4), 16);
	let b1 = parseInt(rgb1.substring(4, 6), 16);
	let r2 = parseInt(rgb2.substring(0, 2), 16);
	let g2 = parseInt(rgb2.substring(2, 4), 16);
	let b2 = parseInt(rgb2.substring(4, 6), 16);

	let d = Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
	let p = d / Math.sqrt(3 * Math.pow(255, 2));
	return p <= 0.15;
}
