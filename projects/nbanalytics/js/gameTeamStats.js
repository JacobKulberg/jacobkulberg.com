function updateTeamStats(gameData, currentPlay) {
	updateTeamSummary(gameData, currentPlay);
	updatePlayerStats(gameData, currentPlay);
}

function updateTeamSummary(gameData, currentPlay) {
	let awayLogo = teamLogos[gameData.header.competitions[0].competitors[1].team.id];
	let homeLogo = teamLogos[gameData.header.competitions[0].competitors[0].team.id];

	$('.game-team-view.away .team-summary .team-logo').attr('src', awayLogo);
	$('.game-team-view.away .team-summary .team-logo').attr('title', teamNames[gameData.header.competitions[0].competitors[1].team.id]);
	$('.game-team-view.home .team-summary .team-logo').attr('src', homeLogo);
	$('.game-team-view.home .team-summary .team-logo').attr('title', teamNames[gameData.header.competitions[0].competitors[0].team.id]);

	let labels = ['FGM', '3PM', 'FTM', 'REB', 'AST', 'STL', 'BLK', 'TO', 'DREB', 'OREB', 'POT', 'FBP', 'PIP', 'PF', 'TF'];

	let homeStats = Object.values(gameData.boxscore.teams[1].statistics);
	let awayStats = Object.values(gameData.boxscore.teams[0].statistics);

	$('.game-team-view .team-summary .team-stats').children().remove();
	for (let i = 0; i < homeStats.length; i++) {
		let homeValue = 0;
		let awayValue = 0;

		let homeValueExtra = '&#8205;';
		let awayValueExtra = '&#8205;';

		switch (labels[i]) {
			case 'FGM':
				homeValue = homeStats[0].displayValue.replace('-', '/');
				awayValue = awayStats[0].displayValue.replace('-', '/');

				homeValueExtra = parseInt(homeStats[0].displayValue.substring(0, homeStats[0].displayValue.indexOf('-'))) / parseInt(homeStats[0].displayValue.substring(homeStats[0].displayValue.indexOf('-') + 1));
				homeValueExtra *= 100;
				homeValueExtra = homeValueExtra.toFixed(1) + '%';
				if (homeValueExtra == 'NaN%') homeValueExtra = '0.0%';

				awayValueExtra = parseInt(awayStats[0].displayValue.substring(0, awayStats[0].displayValue.indexOf('-'))) / parseInt(awayStats[0].displayValue.substring(awayStats[0].displayValue.indexOf('-') + 1));
				awayValueExtra *= 100;
				awayValueExtra = awayValueExtra.toFixed(1) + '%';
				if (awayValueExtra == 'NaN%') awayValueExtra = '0.0%';

				break;
			case '3PM':
				homeValue = homeStats[2].displayValue.replace('-', '/');
				awayValue = awayStats[2].displayValue.replace('-', '/');

				homeValueExtra = parseInt(homeStats[2].displayValue.substring(0, homeStats[2].displayValue.indexOf('-'))) / parseInt(homeStats[2].displayValue.substring(homeStats[2].displayValue.indexOf('-') + 1));
				homeValueExtra *= 100;
				homeValueExtra = homeValueExtra.toFixed(1) + '%';
				if (homeValueExtra == 'NaN%') homeValueExtra = '0.0%';

				awayValueExtra = parseInt(awayStats[2].displayValue.substring(0, awayStats[2].displayValue.indexOf('-'))) / parseInt(awayStats[2].displayValue.substring(awayStats[2].displayValue.indexOf('-') + 1));
				awayValueExtra *= 100;
				awayValueExtra = awayValueExtra.toFixed(1) + '%';
				if (awayValueExtra == 'NaN%') awayValueExtra = '0.0%';
				break;
			case 'FTM':
				homeValue = homeStats[4].displayValue.replace('-', '/');
				awayValue = awayStats[4].displayValue.replace('-', '/');

				homeValueExtra = parseInt(homeStats[4].displayValue.substring(0, homeStats[4].displayValue.indexOf('-'))) / parseInt(homeStats[4].displayValue.substring(homeStats[4].displayValue.indexOf('-') + 1));
				homeValueExtra *= 100;
				homeValueExtra = homeValueExtra.toFixed(1) + '%';
				if (homeValueExtra == 'NaN%') homeValueExtra = '0.0%';

				awayValueExtra = parseInt(awayStats[4].displayValue.substring(0, awayStats[4].displayValue.indexOf('-'))) / parseInt(awayStats[4].displayValue.substring(awayStats[4].displayValue.indexOf('-') + 1));
				awayValueExtra *= 100;
				awayValueExtra = awayValueExtra.toFixed(1) + '%';
				if (awayValueExtra == 'NaN%') awayValueExtra = '0.0%';
				break;
			case 'REB':
				homeValue = parseInt(homeStats[6].displayValue);
				awayValue = parseInt(awayStats[6].displayValue);
				break;
			case 'OREB':
				homeValue = parseInt(homeStats[7].displayValue);
				awayValue = parseInt(awayStats[7].displayValue);
				break;
			case 'DREB':
				homeValue = parseInt(homeStats[8].displayValue);
				awayValue = parseInt(awayStats[8].displayValue);
				break;
			case 'AST':
				homeValue = parseInt(homeStats[9].displayValue);
				awayValue = parseInt(awayStats[9].displayValue);
				break;
			case 'STL':
				homeValue = parseInt(homeStats[10].displayValue);
				awayValue = parseInt(awayStats[10].displayValue);
				break;
			case 'BLK':
				homeValue = parseInt(homeStats[11].displayValue);
				awayValue = parseInt(awayStats[11].displayValue);
				break;
			case 'TO':
				homeValue = parseInt(homeStats[12].displayValue);
				awayValue = parseInt(awayStats[12].displayValue);
				break;
			case 'TF':
				homeValue = parseInt(homeStats[15].displayValue);
				awayValue = parseInt(awayStats[15].displayValue);
				break;
			case 'POT':
				homeValue = parseInt(homeStats[18].displayValue);
				awayValue = parseInt(awayStats[18].displayValue);
				break;
			case 'FBP':
				homeValue = parseInt(homeStats[19].displayValue);
				awayValue = parseInt(awayStats[19].displayValue);
				break;
			case 'PIP':
				homeValue = parseInt(homeStats[20].displayValue);
				awayValue = parseInt(awayStats[20].displayValue);
				break;
			case 'PF':
				homeValue = parseInt(homeStats[21].displayValue);
				awayValue = parseInt(awayStats[21].displayValue);
				break;
			default:
				continue;
		}

		let teamSummaryItem = $('<div class="team-summary-item"></div>');
		let teamSummaryItemStat = $('<div class="team-summary-item-stat"></div>');
		let teamSummaryItemLabel = $('<div class="team-summary-item-label"></div>');
		let teamSummaryItemExtra = $('<div class="team-summary-item-extra"></div>');

		teamSummaryItem.append(teamSummaryItemStat);
		teamSummaryItem.append(teamSummaryItemLabel);
		teamSummaryItem.append(teamSummaryItemExtra);

		$('.game-team-view .team-summary .team-stats').append(teamSummaryItem.clone());

		$(`.game-team-view.home .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-stat`).text(homeValue);
		$(`.game-team-view.away .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-stat`).text(awayValue);

		$(`.game-team-view.home .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-label`).text(labels[i]);
		$(`.game-team-view.away .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-label`).text(labels[i]);

		$(`.game-team-view.home .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-extra`).html(homeValueExtra);
		$(`.game-team-view.away .team-summary .team-stats .team-summary-item:nth-child(${i + 1}) .team-summary-item-extra`).html(awayValueExtra);
	}
}

async function updatePlayerStats(gameData, currentPlay) {
	let awayAthletes = gameData.boxscore.players[0].statistics[0].athletes;
	let homeAthletes = gameData.boxscore.players[1].statistics[0].athletes;

	// away team
	let tempPlayerSummaries = $('<div class="player-summaries"></div>');
	await Promise.all(
		awayAthletes.map(async (athlete, i) => {
			let playerSummary = $('<div class="player-summary"></div>');
			let playerSummaryHeadshot = $('<img class="player-summary-headshot">');
			let playerSummaryInfo = $('<div class="player-summary-info"></div>');
			let playerSummaryName = $('<div class="player-summary-name"></div>');
			let playerSummaryStats = $('<div class="player-summary-stats"></div>');

			// Set headshot source and wait for it to load
			playerSummaryHeadshot.attr('src', await getPlayerHeadshot(athlete.athlete.id));
			playerSummaryHeadshot.attr('title', athlete.athlete.displayName);
			await waitForImageLoad(playerSummaryHeadshot[0]); // Wait for the image to load

			playerSummaryName.text(athlete.athlete.displayName);

			let labels = ['MIN', 'FGM', '3PM', 'FTM', 'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF', '+/-', 'PTS'];
			let stats = athlete.stats;

			let reorderedLabels = ['MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', '+/-', 'FGM', '3PM', 'FTM', 'OREB', 'DREB', 'TO', 'PF'];
			let labelIndexMap = labels.reduce((acc, label, j) => {
				acc[label] = j;
				return acc;
			}, {});

			let reorderedStats = reorderedLabels.map((label) => stats[labelIndexMap[label]]);

			$.each(reorderedLabels, (j, label) => {
				let playerSummaryStat = $('<div class="player-summary-stat"></div>');
				let playerSummaryStatLabel = $('<div class="player-summary-stat-label"></div>');
				let playerSummaryStatValue = $('<div class="player-summary-stat-value"></div>');

				if (reorderedLabels[j] == 'FGM' || reorderedLabels[j] == '3PM' || reorderedLabels[j] == 'FTM') {
					reorderedStats[j] = reorderedStats[j]?.replace('-', '/');

					playerSummaryStat.css('width', '9vmax');
				} else if (reorderedLabels[j] == '+/-') {
					if (parseInt(reorderedStats[j]) > 0) {
						playerSummaryStatValue.css('color', '#34e349');
					} else if (parseInt(reorderedStats[j]) < 0) {
						playerSummaryStatValue.css('color', '#ff5959');
					}
				}

				playerSummaryStatLabel.text(label);
				playerSummaryStatValue.text(reorderedStats[j]);

				playerSummaryStat.append(playerSummaryStatValue);
				playerSummaryStat.append(playerSummaryStatLabel);
				playerSummaryStats.append(playerSummaryStat);
			});

			if (reorderedStats.every((stat) => stat === undefined)) {
				let dnpText = gameData.header.competitions[0].status.type.completed ? 'Did not play' : 'Has not played';
				playerSummaryStats.html(`<div class="player-summary-dnp">${dnpText}</div>`);
			}

			playerSummary.data('minutes', parseInt(reorderedStats[0] || 0));

			playerSummaryInfo.append(playerSummaryName);
			playerSummaryInfo.append(playerSummaryStats);

			playerSummary.append(playerSummaryHeadshot);
			playerSummary.append(playerSummaryInfo);

			tempPlayerSummaries.append(playerSummary);
		})
	);

	// Sort the DOM elements based on the 'MIN' data
	let sortedSummaries = tempPlayerSummaries.children('.player-summary').sort((a, b) => {
		const minutesDiff = $(b).data('minutes') - $(a).data('minutes'); // Sort by minutes (descending)
		if (minutesDiff !== 0) {
			return minutesDiff;
		}

		const nameA = $(a).find('.player-summary-name').text().toLowerCase();
		const nameB = $(b).find('.player-summary-name').text().toLowerCase();
		return nameA.localeCompare(nameB); // Sort by name (ascending) if minutes are equal
	});

	// Append the sorted elements back to the container
	tempPlayerSummaries.empty().append(sortedSummaries);

	if ($('.game-team-view.away .player-summaries').html() != tempPlayerSummaries.html()) {
		let currentScroll1 = $('.game-team-view.away .player-summaries').scrollLeft() || 0;

		$('.game-team-view.away .player-summaries').replaceWith(tempPlayerSummaries);

		$('.game-team-view.away .player-summaries').scrollLeft(currentScroll1);
	}

	$('.game-team-view.away').addClass('filled');
	adjustGameViewsHeight();

	// home team
	tempPlayerSummaries = $('<div class="player-summaries"></div>');
	await Promise.all(
		homeAthletes.map(async (athlete, i) => {
			let playerSummary = $('<div class="player-summary"></div>');
			let playerSummaryHeadshot = $('<img class="player-summary-headshot">');
			let playerSummaryInfo = $('<div class="player-summary-info"></div>');
			let playerSummaryName = $('<div class="player-summary-name"></div>');
			let playerSummaryStats = $('<div class="player-summary-stats"></div>');

			// Set headshot source and wait for it to load
			playerSummaryHeadshot.attr('src', await getPlayerHeadshot(athlete.athlete.id));
			playerSummaryHeadshot.attr('title', athlete.athlete.displayName);
			await waitForImageLoad(playerSummaryHeadshot[0]); // Wait for the image to load

			playerSummaryName.text(athlete.athlete.displayName);

			let labels = ['MIN', 'FGM', '3PM', 'FTM', 'OREB', 'DREB', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF', '+/-', 'PTS'];
			let stats = athlete.stats;

			let reorderedLabels = ['MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', '+/-', 'FGM', '3PM', 'FTM', 'OREB', 'DREB', 'TO', 'PF'];
			let labelIndexMap = labels.reduce((acc, label, j) => {
				acc[label] = j;
				return acc;
			}, {});

			let reorderedStats = reorderedLabels.map((label) => stats[labelIndexMap[label]]);

			$.each(reorderedLabels, (j, label) => {
				let playerSummaryStat = $('<div class="player-summary-stat"></div>');
				let playerSummaryStatLabel = $('<div class="player-summary-stat-label"></div>');
				let playerSummaryStatValue = $('<div class="player-summary-stat-value"></div>');

				if (reorderedLabels[j] == 'FGM' || reorderedLabels[j] == '3PM' || reorderedLabels[j] == 'FTM') {
					reorderedStats[j] = reorderedStats[j]?.replace('-', '/');

					playerSummaryStat.css('width', '9vmax');
				} else if (reorderedLabels[j] == '+/-') {
					if (parseInt(reorderedStats[j]) > 0) {
						playerSummaryStatValue.css('color', '#34e349');
					} else if (parseInt(reorderedStats[j]) < 0) {
						playerSummaryStatValue.css('color', '#ff5959');
					}
				}

				playerSummaryStatLabel.text(label);
				playerSummaryStatValue.text(reorderedStats[j]);

				playerSummaryStat.append(playerSummaryStatValue);
				playerSummaryStat.append(playerSummaryStatLabel);
				playerSummaryStats.append(playerSummaryStat);
			});

			if (reorderedStats.every((stat) => stat === undefined)) {
				let dnpText = gameData.header.competitions[0].status.type.completed ? 'Did not play' : 'Has not played';
				playerSummaryStats.html(`<div class="player-summary-dnp">${dnpText}</div>`);
			}

			playerSummary.data('minutes', parseInt(reorderedStats[0] || 0));

			playerSummaryInfo.append(playerSummaryName);
			playerSummaryInfo.append(playerSummaryStats);

			playerSummary.append(playerSummaryHeadshot);
			playerSummary.append(playerSummaryInfo);

			tempPlayerSummaries.append(playerSummary);
		})
	);

	// Sort the DOM elements based on the 'MIN' data
	sortedSummaries = tempPlayerSummaries.children('.player-summary').sort((a, b) => {
		const minutesDiff = $(b).data('minutes') - $(a).data('minutes'); // Sort by minutes (descending)
		if (minutesDiff !== 0) {
			return minutesDiff;
		}

		const nameA = $(a).find('.player-summary-name').text().toLowerCase();
		const nameB = $(b).find('.player-summary-name').text().toLowerCase();
		return nameA.localeCompare(nameB); // Sort by name (ascending) if minutes are equal
	});

	// Append the sorted elements back to the container
	tempPlayerSummaries.empty().append(sortedSummaries);

	if ($('.game-team-view.home .player-summaries').html() != tempPlayerSummaries.html()) {
		let currentScroll2 = $('.game-team-view.home .player-summaries').scrollLeft() || 0;

		$('.game-team-view.home .player-summaries').replaceWith(tempPlayerSummaries);

		$('.game-team-view.home .player-summaries').scrollLeft(currentScroll2);
	}

	$('.game-team-view.home').addClass('filled');
	adjustGameViewsHeight();
}

function adjustGameViewsHeight() {
	let awayHome = $('.game-team-view.home').hasClass('active') ? 'home' : 'away';

	if (!$(`.game-team.option.${awayHome}`).hasClass('active')) return;

	let height = $(`.game-team-view.${awayHome}`).outerHeight(true);

	$('.game-views').css('height', `${height}px`);
}

const gameTeamView = document.querySelector('.game-team-view');
const observer = new ResizeObserver(adjustGameViewsHeight);
observer.observe(gameTeamView);

function waitForImageLoad(img) {
	return new Promise((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject();
	});
}

export { updateTeamStats };
