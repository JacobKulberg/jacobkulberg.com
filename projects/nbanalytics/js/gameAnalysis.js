let playerNames = {};
let playerImages = {};

let cumulativeScoreGraph = null;
let winProbabilityGraph = null;
let teamStatsComparisonGraph = null;

let playsUntilNow = [];
let playsUntilNowAll = [];

let leaderIds = {
	awayPoints: null,
	awayRebounds: null,
	awayAssists: null,
	homePoints: null,
	homeRebounds: null,
	homeAssists: null,
};

let lastGameData = null;
let lastCurrentPlay = null;

let awayColor = '';
let homeColor = '';

function updateAnalysis(gameData, currentPlay) {
	lastGameData = gameData;
	lastCurrentPlay = currentPlay;

	awayColor = teamColors[gameData.header.competitions[0].competitors[1].team.id];
	homeColor = teamColors[gameData.header.competitions[0].competitors[0].team.id];
	if (areColorsSimilar(awayColor, homeColor)) {
		awayColor = teamColorsAlt[gameData.header.competitions[0].competitors[1].team.id];
	}

	if (areColorsSimilar(awayColor, '020026')) {
		awayColor = 'ffffff';
	}
	if (areColorsSimilar(homeColor, '020026')) {
		homeColor = 'ffffff';
	}

	updateQuarterlyScore(gameData, currentPlay);
	updateTeamLeaders(gameData, currentPlay);
	updateCumulativeScoreGraph(gameData, currentPlay);
	updateWinProbabilityGraph(gameData, currentPlay);
	updateShotChart(gameData, currentPlay);
	updateTeamStatsComparison(gameData, currentPlay);

	adjustGameViewsHeight();
}

function updateQuarterlyScore(gameData, currentPlay) {
	let awayAbbr = teamAbbrs[gameData.header.competitions[0].competitors[1].team.id];
	let homeAbbr = teamAbbrs[gameData.header.competitions[0].competitors[0].team.id];

	$('.quarterly-score .away-team-abbr').text(awayAbbr);
	$('.quarterly-score .home-team-abbr').text(homeAbbr);

	// add periods
	let period = parseInt(gameData.plays[currentPlay]?.period.number);
	$('.quarterly-score tr:first-child').html('<th></th>');
	$('.quarterly-score tr:nth-child(2)').html(`<th style="color: #${awayColor}; text-shadow: 0 0 3px #${awayColor};">${awayAbbr}</th>`);
	$('.quarterly-score tr:nth-child(3)').html(`<th style="color: #${homeColor}; text-shadow: 0 0 3px #${homeColor};">${homeAbbr}</th>`);
	for (let i = 1; i <= period; i++) {
		let periodStr = i;
		if (periodStr == 5) periodStr = 'OT';
		else if (periodStr >= 6) periodStr = `${periodStr - 4}OT`;
		else periodStr = `Q${periodStr}`;

		$('.quarterly-score tr:first-child').append(`<th>${periodStr}</th>`);

		$('.quarterly-score tr:nth-child(2)').append(`<td class="away-team-score"></td>`);
		$('.quarterly-score tr:nth-child(3)').append(`<td class="home-team-score"></td>`);
	}
	$('.quarterly-score tr:first-child').append('<th>T</th>');

	let homeScores = [];
	let awayScores = [];

	playsUntilNow = gameData.plays.slice(0, currentPlay + 1);
	playsUntilNow = playsUntilNow.filter((play) => play.scoringPlay);

	for (let quarter = 0; quarter < period; quarter++) {
		awayScores.push(0);
		homeScores.push(0);

		let quarterPlays = playsUntilNow.filter((play) => play.period.number == quarter + 1);
		quarterPlays.forEach((play) => {
			let team = play.team.id == gameData.header.competitions[0].competitors[1].team.id ? 0 : 1;
			if (team == 0) {
				awayScores[quarter] += play.scoreValue;
			} else {
				homeScores[quarter] += play.scoreValue;
			}
		});
	}

	for (let i = 0; i < period; i++) {
		$(`.quarterly-score .away-team-score:nth-child(${i + 2})`).text(awayScores[i]);
		$(`.quarterly-score .home-team-score:nth-child(${i + 2})`).text(homeScores[i]);
	}

	let awayTotal = awayScores.reduce((a, b) => a + b, 0);
	let homeTotal = homeScores.reduce((a, b) => a + b, 0);
	$('.quarterly-score tr:nth-child(2)').append(`<td style="color: #${awayColor}; text-shadow: 0 0 3px #${awayColor};" class="away-team-score"></td>`);
	$('.quarterly-score tr:nth-child(3)').append(`<td style="color: #${homeColor}; text-shadow: 0 0 3px #${homeColor};" class="home-team-score"></td>`);
	$('.quarterly-score .away-team-score:last-child').text(awayTotal);
	$('.quarterly-score .home-team-score:last-child').text(homeTotal);

	$('.game-analysis-view').addClass('filled');
}

async function updateTeamLeaders(gameData, currentPlay) {
	let leaders = getAllLeadersUntilNow(gameData, currentPlay);

	// remove children until first-child remains
	$('.team-leaders .leader').each((index, element) => {
		if ($(element).children().length > 1) {
			$(element).children().slice(1).remove();
		}
	});

	$('.team-leaders.away').css('background', `linear-gradient(90deg, #${awayColor}91 0%, #${awayColor}1A 97%, transparent 100%)`);
	$('.team-leaders.home').css('background', `linear-gradient(90deg, transparent 0%, #${homeColor}1A 3%, #${homeColor}91 100%)`);

	// away
	let awayPointLeader = leaders.points.find((leader) => leader.team == gameData.header.competitions[0].competitors[1].team.id);
	if (awayPointLeader?.player != leaderIds.awayPoints) {
		$('.team-leaders.away .leader.points').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(awayPointLeader?.player)}" title="${await _getPlayerName(awayPointLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[1].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[1].team.id]}">`);
		$('.team-leaders.away .leader.points').append(imageDiv);
	}
	if (awayPointLeader?.player) {
		leaderIds.awayPoints = awayPointLeader?.player;
		$('.team-leaders.away .leader.points').append(`<div>${await _getPlayerName(awayPointLeader?.player)}</div>`);
		$('.team-leaders.away .leader.points').append(`<div>${awayPointLeader?.points} PTS</div>`);
	}

	let awayReboundLeader = leaders.rebounds.find((leader) => leader.team == gameData.header.competitions[0].competitors[1].team.id);
	if (awayReboundLeader?.player != leaderIds.awayRebounds) {
		$('.team-leaders.away .leader.rebounds').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(awayReboundLeader?.player)}" title="${await _getPlayerName(awayReboundLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[1].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[1].team.id]}">`);
		$('.team-leaders.away .leader.rebounds').append(imageDiv);
	}
	if (awayReboundLeader?.player) {
		leaderIds.awayRebounds = awayReboundLeader?.player;
		$('.team-leaders.away .leader.rebounds').append(`<div>${await _getPlayerName(awayReboundLeader?.player)}</div>`);
		$('.team-leaders.away .leader.rebounds').append(`<div>${awayReboundLeader?.rebounds} REB</div>`);
	}

	let awayAssistLeader = leaders.assists.find((leader) => leader.team == gameData.header.competitions[0].competitors[1].team.id);
	if (awayAssistLeader?.player != leaderIds.awayAssists) {
		$('.team-leaders.away .leader.assists').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(awayAssistLeader?.player)}" title="${await _getPlayerName(awayAssistLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[1].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[1].team.id]}">`);
		$('.team-leaders.away .leader.assists').append(imageDiv);
	}
	if (awayAssistLeader?.player) {
		leaderIds.awayAssists = awayAssistLeader?.player;
		$('.team-leaders.away .leader.assists').append(`<div>${await _getPlayerName(awayAssistLeader?.player)}</div>`);
		$('.team-leaders.away .leader.assists').append(`<div>${awayAssistLeader?.assists} AST</div>`);
	}

	// home
	let homePointLeader = leaders.points.find((leader) => leader.team == gameData.header.competitions[0].competitors[0].team.id);
	if (homePointLeader?.player != leaderIds.homePoints) {
		$('.team-leaders.home .leader.points').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(homePointLeader?.player)}" title="${await _getPlayerName(homePointLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[0].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[0].team.id]}">`);
		$('.team-leaders.home .leader.points').append(imageDiv);
	}
	if (homePointLeader?.player) {
		leaderIds.homePoints = homePointLeader?.player;
		$('.team-leaders.home .leader.points').append(`<div>${await _getPlayerName(homePointLeader?.player)}</div>`);
		$('.team-leaders.home .leader.points').append(`<div>${homePointLeader?.points} PTS</div>`);
	}

	let homeReboundLeader = leaders.rebounds.find((leader) => leader.team == gameData.header.competitions[0].competitors[0].team.id);
	if (homeReboundLeader?.player != leaderIds.homeRebounds) {
		$('.team-leaders.home .leader.rebounds').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(homeReboundLeader?.player)}" title="${await _getPlayerName(homeReboundLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[0].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[0].team.id]}">`);
		$('.team-leaders.home .leader.rebounds').append(imageDiv);
	}
	if (homeReboundLeader?.player) {
		leaderIds.homeRebounds = homeReboundLeader?.player;
		$('.team-leaders.home .leader.rebounds').append(`<div>${await _getPlayerName(homeReboundLeader?.player)}</div>`);
		$('.team-leaders.home .leader.rebounds').append(`<div>${homeReboundLeader?.rebounds} REB</div>`);
	}

	let homeAssistLeader = leaders.assists.find((leader) => leader.team == gameData.header.competitions[0].competitors[0].team.id);
	if (homeAssistLeader?.player != leaderIds.homeAssists) {
		$('.team-leaders.home .leader.assists').children().remove();
		let imageDiv = $('<div></div>');
		imageDiv.append(`<img src="${await _getPlayerHeadshot(homeAssistLeader?.player)}" title="${await _getPlayerName(homeAssistLeader?.player)}">`);
		imageDiv.append(`<img src="${teamLogos[gameData.header.competitions[0].competitors[0].team.id]}" title="${teamNames[gameData.header.competitions[0].competitors[0].team.id]}">`);
		$('.team-leaders.home .leader.assists').append(imageDiv);
	}
	if (homeAssistLeader?.player) {
		leaderIds.homeAssists = homeAssistLeader?.player;
		$('.team-leaders.home .leader.assists').append(`<div>${await _getPlayerName(homeAssistLeader?.player)}</div>`);
		$('.team-leaders.home .leader.assists').append(`<div>${homeAssistLeader?.assists} AST</div>`);
	}
}

function updateCumulativeScoreGraph(gameData, currentPlay) {
	playsUntilNow = gameData.plays.slice(0, currentPlay + 1);
	playsUntilNow = playsUntilNow.filter((play) => play.scoringPlay);

	if (playsUntilNow.length == 0) {
		$('.cumulative-score-graph').css('opacity', 0);
	} else {
		$('.cumulative-score-graph').css('opacity', 1);
	}

	let labels = playsUntilNow.map(() => '');

	let newPeriodIndexes = [];
	for (let i = 0; i < playsUntilNow.length; i++) {
		if (playsUntilNow[i]?.period.number != playsUntilNow[i - 1]?.period.number) {
			newPeriodIndexes.push(i - newPeriodIndexes.length);
		}
	}
	newPeriodIndexes.shift();

	let teamScores = [];
	let scoreColors = [];
	for (let i = 0; i < playsUntilNow.length; i++) {
		if (playsUntilNow[i].awayScore == 0) {
			teamScores.push(playsUntilNow[i].homeScore);
		} else if (playsUntilNow[i].homeScore == 0) {
			teamScores.push(playsUntilNow[i].awayScore);
		} else {
			if (playsUntilNow[i].awayScore == playsUntilNow[i - 1].awayScore) {
				teamScores.push(playsUntilNow[i].homeScore);
			} else {
				teamScores.push(playsUntilNow[i].awayScore);
			}
		}

		let isHomeTeam = playsUntilNow[i].team.id == gameData.header.competitions[0].competitors[0].team.id;
		isHomeTeam ? scoreColors.push(`#${homeColor}`) : scoreColors.push(`#${awayColor}`);

		if (newPeriodIndexes.includes(i)) {
			teamScores.push(0);
			scoreColors.push('transparent');
			labels.push('');
		}
	}

	const periodMarkers = {
		id: 'periodMarkers',
		afterDraw: (chart) => {
			const ctx = chart.ctx;
			const xAxis = chart.scales.x;
			const yAxis = chart.scales.y;

			let periodPlays = playsUntilNow.filter((play) => play.period.number != 0);
			let periods = periodPlays.map((play) => play.period.number);
			periods = [...new Set(periods)];

			periods.forEach((period) => {
				let periodPlays = playsUntilNow.filter((play) => play.period.number == period);
				let periodStart = playsUntilNow.indexOf(periodPlays[0]);
				let periodEnd = playsUntilNow.indexOf(periodPlays[periodPlays.length - 1]);

				let xStart = xAxis.getPixelForValue(periodStart);
				let xEnd = xAxis.getPixelForValue(periodEnd + period - 1);

				if (period != 1) {
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(xStart, yAxis.top);
					ctx.lineTo(xStart, yAxis.bottom);
					ctx.lineWidth = 2;
					ctx.strokeStyle = 'white';
					ctx.stroke();
					ctx.closePath();
					ctx.restore();
				}

				let periodStr = period;
				if (period == 5) periodStr = 'OT';
				else if (period >= 6) periodStr = `${period - 4}OT`;
				else periodStr = `Q${periodStr}`;

				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px "Poppins", "Calibri", sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				ctx.fillText(periodStr, (xStart + xEnd) / 2, yAxis.bottom + 10);
			});
		},
	};

	if (cumulativeScoreGraph) {
		cumulativeScoreGraph.data.labels = labels;
		cumulativeScoreGraph.data.datasets[1].data = teamScores;
		cumulativeScoreGraph.data.datasets[1].backgroundColor = scoreColors;
		cumulativeScoreGraph.data.datasets[1].hoverBackgroundColor = scoreColors;

		cumulativeScoreGraph.update();
	} else {
		const ctx = $('.cumulative-score-graph');
		ctx.height(500);

		cumulativeScoreGraph = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						label: teamAbbrs[gameData.header.competitions[0].competitors[1].team.id],
						data: [],
						hidden: true,
					},
					{
						label: teamAbbrs[gameData.header.competitions[0].competitors[0].team.id],
						data: teamScores,
						backgroundColor: scoreColors,
						hoverBackgroundColor: scoreColors,
					},
				],
			},
			options: {
				scales: {
					x: {
						grid: {
							display: false,
						},
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'white',
							drawOnChartArea: false,
							tickLength: 0,
							lineWidth: 0,
						},
						ticks: {
							precision: 0,
							color: 'white',
							font: {
								size: 15,
								family: "'Poppins', 'Calibri', sans-serif",
								weight: 'bold',
							},
						},
						position: 'right',
					},
				},
				plugins: {
					legend: {
						display: true,
						labels: {
							color: 'white',
							font: {
								size: 15,
								family: "'Poppins', 'Calibri', sans-serif",
								weight: 'bold',
							},
							generateLabels: (chart) => {
								let labelColors = [`#${awayColor}`, `#${homeColor}`];

								const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
								labels.forEach((label, index) => {
									label.hidden = false;
									label.fillStyle = labelColors[index];
								});
								return labels;
							},
						},
						onClick: () => {},
					},
					tooltip: {
						enabled: false,
					},
					events: null,
				},
			},
			plugins: [periodMarkers],
		});
	}
}

function updateWinProbabilityGraph(gameData, currentPlay) {
	if (!gameData.winprobability) return;

	playsUntilNowAll = gameData.plays.slice(0, currentPlay + 1);

	if (playsUntilNowAll.length <= 1) {
		$('.win-probability-graph').css('opacity', 0);
	} else {
		$('.win-probability-graph').css('opacity', 1);
	}

	let winProbabilities = gameData.winprobability.slice(0, currentPlay + 1).map((wp) => 2 * 100 * (0.5 - wp.homeWinPercentage));
	let labels = winProbabilities.map(() => '');

	const periodMarkers = {
		id: 'periodMarkers',
		afterDraw: (chart) => {
			const ctx = chart.ctx;
			const xAxis = chart.scales.x;
			const yAxis = chart.scales.y;

			let periodPlays = playsUntilNowAll.filter((play) => play.period.number != 0);
			let periods = periodPlays.map((play) => play.period.number);
			periods = [...new Set(periods)];

			periods.forEach((period) => {
				let periodPlays = playsUntilNowAll.filter((play) => play.period.number == period);
				let periodStart = playsUntilNowAll.indexOf(periodPlays[0]);
				let periodEnd = playsUntilNowAll.indexOf(periodPlays[periodPlays.length - 1]);

				let xStart = xAxis.getPixelForValue(periodStart);
				let xEnd = xAxis.getPixelForValue(periodEnd + period - 1);

				if (period != 1) {
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(xStart, yAxis.top);
					ctx.lineTo(xStart, yAxis.bottom);
					ctx.lineWidth = 2;
					ctx.strokeStyle = 'white';
					ctx.stroke();
					ctx.closePath();
					ctx.restore();
				}

				let periodStr = period;
				if (period == 5) periodStr = 'OT';
				else if (period >= 6) periodStr = `${period - 4}OT`;
				else periodStr = `Q${periodStr}`;

				ctx.fillStyle = 'white';
				ctx.font = 'bold 15px "Poppins", "Calibri", sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(periodStr, (xStart + xEnd) / 2, yAxis.bottom + 10);
			});
		},
	};

	if (winProbabilityGraph) {
		winProbabilityGraph.data.labels = labels;
		winProbabilityGraph.data.datasets[0].data = winProbabilities;

		winProbabilityGraph.update();
	} else {
		const ctx = $('.win-probability-graph');
		ctx.height(500);

		winProbabilityGraph = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						data: winProbabilities,
						pointRadius: 0,
						pointHitRadius: 0,
						cubicInterpolationMode: 'monotone',
						fill: true,
						borderWidth: 4,
						borderColor: 'rgba(0, 0, 0, 0.25)',
						backgroundColor: (context) => {
							const { chart } = context;
							const { ctx, chartArea } = chart;
							if (!chartArea) return null;

							const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
							gradient.addColorStop(0, `#${awayColor}`);
							gradient.addColorStop(0.5, `#${awayColor}`);
							gradient.addColorStop(0.5, 'transparent');
							gradient.addColorStop(0.5, `#${homeColor}`);
							gradient.addColorStop(1, `#${homeColor}`);
							return gradient;
						},
					},
				],
			},
			axisY: {
				tickLength: 0,
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						min: -100,
						max: 100,
						ticks: {
							maxTicksLimit: 2,
							color: 'white',
							font: {
								size: 15,
								family: "'Poppins', 'Calibri', sans-serif",
								weight: 'bold',
							},
							callback: function (value) {
								// Define custom tick text
								if (value === 100) return `${teamAbbrs[gameData.header.competitions[0].competitors[1].team.id]} 100%`;
								if (value === -100) return `${teamAbbrs[gameData.header.competitions[0].competitors[0].team.id]} 100%`;
								return ''; // Hide other tick marks
							},
						},
						position: 'right',
					},
				},
				plugins: {
					legend: {
						display: false,
					},
				},
			},
			plugins: [periodMarkers],
		});
	}

	let homeWinPercentage = gameData.winprobability[currentPlay]?.homeWinPercentage;
	if (!homeWinPercentage) homeWinPercentage = gameData.header.competitions[0].competitors[0].winner ? 1 : 0;
	else if (currentPlay == gameData.plays.length - 1) homeWinPercentage = gameData.header.competitions[0].competitors[0].winner ? 1 : gameData.header.competitions[0].competitors[1].winner ? 0 : homeWinPercentage;

	let winningTeam = homeWinPercentage >= 0.5 ? gameData.header.competitions[0].competitors[0] : gameData.header.competitions[0].competitors[1];
	let winningPercentage = homeWinPercentage >= 0.5 ? homeWinPercentage : 1 - homeWinPercentage;

	$('.win-probability-percent-img').attr('src', `${teamLogos[winningTeam.id]}`);
	$('.win-probability-percent-img').attr('title', `${teamNames[winningTeam.id]}`);
	$('.win-probability-percent').text(`${Math.round(1000 * winningPercentage) / 10}%`);

	let isHomeTeam = winningTeam.id == gameData.header.competitions[0].competitors[0].team.id;
	let teamColor = isHomeTeam ? homeColor : awayColor;
	$('.win-probability-percent').css('color', `#${teamColor}`);
	$('.win-probability-percent').css('text-shadow', `0 0 7px #${teamColor}`);
}

function updateShotChart(gameData, currentPlay) {
	let awayTeamLogo = teamLogos[gameData.header.competitions[0].competitors[1].team.id];
	$('.shot-chart-toggles-container.away.wide img').attr('src', awayTeamLogo);
	$('.shot-chart-toggles-container.away.wide img').attr('title', teamNames[gameData.header.competitions[0].competitors[1].team.id]);
	$('.shot-chart-toggles-container.away.wide img').css('border-bottom', `3px solid #${awayColor}`);
	$('.shot-chart-toggles-container.away.wide').css('border', `3px solid #${awayColor}`);
	$('.shot-chart-toggles-container.away .toggle input').css('accent-color', `#${areColorsSimilar(awayColor, 'ffffff') ? '555555' : awayColor}`);

	let homeTeamLogo = teamLogos[gameData.header.competitions[0].competitors[0].team.id];
	$('.shot-chart-court-logo img').attr('src', homeTeamLogo);
	$('.shot-chart-toggles-container.home.wide img').attr('src', homeTeamLogo);
	$('.shot-chart-toggles-container.home.wide img').attr('title', teamNames[gameData.header.competitions[0].competitors[0].team.id]);
	$('.shot-chart-toggles-container.home.wide img').css('border-bottom', `3px solid #${homeColor}`);
	$('.shot-chart-toggles-container.home.wide').css('border', `3px solid #${homeColor}`);
	$('.shot-chart-toggles-container.home .toggle input').css('accent-color', `#${areColorsSimilar(homeColor, 'ffffff') ? '555555' : homeColor}`);

	$('.shot-chart-toggles-container.home:not(.wide) .abbr').text(teamAbbrs[gameData.header.competitions[0].competitors[0].team.id]);
	$('.shot-chart-toggles-container.home:not(.wide) .abbr').css({
		color: `#${homeColor}`,
		'text-shadow': `0 0 5px #${homeColor}`,
		'text-decoration-color': `#${homeColor}`,
	});

	$('.shot-chart-toggles-container.away:not(.wide) .abbr').text(teamAbbrs[gameData.header.competitions[0].competitors[1].team.id]);
	$('.shot-chart-toggles-container.away:not(.wide) .abbr').css({
		color: `#${awayColor}`,
		'text-shadow': `0 0 5px #${awayColor}`,
		'text-decoration-color': `#${awayColor}`,
	});

	let playsUntilNow = gameData.plays.slice(0, currentPlay + 1);
	let shotPlays = playsUntilNow.filter((play) => play.shootingPlay);

	let ctx = $('.shot-chart-canvas')[0].getContext('2d');

	let dpi = window.devicePixelRatio || 1;
	let height = $('.shot-chart-canvas').height() * dpi;
	let width = $('.shot-chart-canvas').width() * dpi;

	$('.shot-chart-canvas').attr('height', height);
	$('.shot-chart-canvas').attr('width', width);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	shotPlays.sort((a, b) => a.scoringPlay - b.scoringPlay);

	shotPlays.forEach((play) => {
		let x = play.coordinate.x;
		let y = play.coordinate.y;

		if (play.type.id == 97 || play.type.id == 98 || play.type.id == 99 || play.type.id == 100 || play.type.id == 101 || play.type.id == 102 || play.type.id == 103 || play.type.id == 104 || play.type.id == 105 || play.type.id == 106 || play.type.id == 107 || play.type.id == 108 || play.type.id == 157 || play.type.id == 165 || play.type.id == 166) {
			x = 25;
			y = 18;
		}

		y = 40 - y;
		x *= 15 / 50;
		y *= 14 / 40;
		x -= 7.5;

		let isHomeTeam = play.team?.id === gameData.header.competitions[0].competitors[0].team.id;
		if (!isHomeTeam) {
			x *= -1;
			y *= -1;
		}

		if (x < -100 || x > 100 || y < -100 || y > 100) return;

		x = Math.min(7, Math.max(-7, x));
		y = Math.min(13.5, Math.max(-13.5, y));

		x *= (height / 100) * 6.75;
		y *= (width / 100) * 3.5;

		let made = play.scoringPlay || play.scoreValue > 0;
		let awayMade = $('.game-analysis-view:not(.single-column) .shot-chart-toggles-container.away.wide .toggle.made input').is(':checked') || $('.game-analysis-view.single-column .shot-chart-toggles-container.away:not(.wide) .toggle.made input').is(':checked');
		let homeMade = $('.game-analysis-view:not(.single-column) .shot-chart-toggles-container.home.wide .toggle.made input').is(':checked') || $('.game-analysis-view.single-column .shot-chart-toggles-container.home:not(.wide) .toggle.made input').is(':checked');
		let awayMissed = $('.game-analysis-view:not(.single-column) .shot-chart-toggles-container.away.wide .toggle.missed input').is(':checked') || $('.game-analysis-view.single-column .shot-chart-toggles-container.away:not(.wide) .toggle.missed input').is(':checked');
		let homeMissed = $('.game-analysis-view:not(.single-column) .shot-chart-toggles-container.home.wide .toggle.missed input').is(':checked') || $('.game-analysis-view.single-column .shot-chart-toggles-container.home:not(.wide) .toggle.missed input').is(':checked');

		// change both sets of toggles
		$('.shot-chart-toggles-container.away .toggle.made input').prop('checked', awayMade);
		$('.shot-chart-toggles-container.away .toggle.missed input').prop('checked', awayMissed);
		$('.shot-chart-toggles-container.home .toggle.made input').prop('checked', homeMade);
		$('.shot-chart-toggles-container.home .toggle.missed input').prop('checked', homeMissed);

		if (made && ((isHomeTeam && homeMade) || (!isHomeTeam && awayMade))) {
			ctx.beginPath();
			ctx.arc(y + width / 2, x + height / 2, 7 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()), 0, 2 * Math.PI);
			ctx.fillStyle = isHomeTeam ? `#${homeColor}` : `#${awayColor}`;
			ctx.fill();
			ctx.closePath();

			// border
			ctx.beginPath();
			ctx.arc(y + width / 2, x + height / 2, 7 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()), 0, 2 * Math.PI);
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1.5 * dpi * 0.00065 * Math.max($(window).width(), $(window).height());
			ctx.stroke();
			ctx.closePath();
		} else if (!made && ((isHomeTeam && homeMissed) || (!isHomeTeam && awayMissed))) {
			// square
			ctx.beginPath();
			ctx.rect(y + width / 2 - 7, x + height / 2 - 7, 14 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()), 14 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()));
			ctx.fillStyle = isHomeTeam ? `#${homeColor}` : `#${awayColor}`;
			ctx.fill();
			ctx.closePath();

			// border
			ctx.beginPath();
			ctx.rect(y + width / 2 - 7, x + height / 2 - 7, 14 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()), 14 * dpi * 0.00065 * Math.max($(window).width(), $(window).height()));
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1.5 * dpi * 0.00065 * Math.max($(window).width(), $(window).height());
			ctx.stroke();
			ctx.closePath();
		}
	});
}

function updateTeamStatsComparison(gameData, currentPlay) {
	let labels = ['FGM', '3PM', 'FTM', 'Rebounds', 'Defensive Rebounds', 'Offensive Rebounds', 'Assists', 'Steals', 'Blocks', 'Turnovers', 'Points off Turnovers', 'Fastbreak Points', 'Points in Paint', 'Personal Fouls', 'Technical Fouls'];

	let homeStats = Object.values(gameData.boxscore.teams[1].statistics);
	let awayStats = Object.values(gameData.boxscore.teams[0].statistics);

	$('.team-stats-comparison-container span').remove();
	$('.team-stats-comparison-container div').remove();

	for (let i = 0; i < homeStats.length; i++) {
		let homeValue = 0;
		let awayValue = 0;

		let parentNum = 0;

		switch (labels[i]) {
			case 'FGM':
				homeValue = parseInt(homeStats[0].displayValue.substring(0, homeStats[0].displayValue.indexOf('-')));
				awayValue = parseInt(awayStats[0].displayValue.substring(0, awayStats[0].displayValue.indexOf('-')));
				break;
			case '3PM':
				homeValue = parseInt(homeStats[2].displayValue.substring(0, homeStats[2].displayValue.indexOf('-')));
				awayValue = parseInt(awayStats[2].displayValue.substring(0, awayStats[2].displayValue.indexOf('-')));
				break;
			case 'FTM':
				homeValue = parseInt(homeStats[4].displayValue.substring(0, homeStats[4].displayValue.indexOf('-')));
				awayValue = parseInt(awayStats[4].displayValue.substring(0, awayStats[4].displayValue.indexOf('-')));
				break;
			case 'Rebounds':
				homeValue = parseInt(homeStats[6].displayValue);
				awayValue = parseInt(awayStats[6].displayValue);
				break;
			case 'Offensive Rebounds':
				homeValue = parseInt(homeStats[7].displayValue);
				awayValue = parseInt(awayStats[7].displayValue);
				parentNum = 1;
				break;
			case 'Defensive Rebounds':
				homeValue = parseInt(homeStats[8].displayValue);
				awayValue = parseInt(awayStats[8].displayValue);
				parentNum = 1;
				break;
			case 'Assists':
				homeValue = parseInt(homeStats[9].displayValue);
				awayValue = parseInt(awayStats[9].displayValue);
				break;
			case 'Steals':
				homeValue = parseInt(homeStats[10].displayValue);
				awayValue = parseInt(awayStats[10].displayValue);
				break;
			case 'Blocks':
				homeValue = parseInt(homeStats[11].displayValue);
				awayValue = parseInt(awayStats[11].displayValue);
				break;
			case 'Turnovers':
				homeValue = parseInt(homeStats[12].displayValue);
				awayValue = parseInt(awayStats[12].displayValue);
				break;
			case 'Technical Fouls':
				homeValue = parseInt(homeStats[15].displayValue);
				awayValue = parseInt(awayStats[15].displayValue);
				parentNum = 1;
				break;
			case 'Points off Turnovers':
				homeValue = parseInt(homeStats[18].displayValue);
				awayValue = parseInt(awayStats[18].displayValue);
				parentNum = 1;
				break;
			case 'Fastbreak Points':
				homeValue = parseInt(homeStats[19].displayValue);
				awayValue = parseInt(awayStats[19].displayValue);
				parentNum = 1;
				break;
			case 'Points in Paint':
				homeValue = parseInt(homeStats[20].displayValue);
				awayValue = parseInt(awayStats[20].displayValue);
				parentNum = 1;
				break;
			case 'Personal Fouls':
				homeValue = parseInt(homeStats[21].displayValue);
				awayValue = parseInt(awayStats[21].displayValue);
				parentNum = 1;
				break;
			default:
				continue;
		}

		let awayValueSpan = $(`<span>${awayValue}</span>`);
		let homeValueSpan = $(`<span>${homeValue}</span>`);

		if (awayValue == 0 && homeValue == 0) {
			awayValue = 1;
			homeValue = 1;
		}

		let span = $(`<span>${labels[i]}</span>`);
		let progressBarContainer = $('<div class="progress-bar-container"></div>');
		let progressBar = $('<div class="progress-bar"></div>');
		progressBar.css('color', `#fff`);
		if (awayValue == 0) {
			progressBar.css('background', `#${homeColor}`);
		} else if (homeValue == 0) {
			progressBar.css('background', `#${awayColor}`);
		} else {
			progressBar.css('background', `linear-gradient(to right, #${awayColor} ${(awayValue / (homeValue + awayValue)) * 100}%, white ${(awayValue / (homeValue + awayValue)) * 100}%, white ${(awayValue / (homeValue + awayValue)) * 100 + 0.5}%, #${homeColor} ${(awayValue / (homeValue + awayValue)) * 100 + 0.5}%)`);
		}

		awayValueSpan.css('color', `#${awayColor}`);
		awayValueSpan.css('text-shadow', `0 0 5px #${awayColor}`);

		homeValueSpan.css('color', `#${homeColor}`);
		homeValueSpan.css('text-shadow', `0 0 5px #${homeColor}`);

		progressBarContainer.prepend(awayValueSpan);
		progressBarContainer.append(progressBar);
		progressBarContainer.append(homeValueSpan);

		if (parentNum == 1) {
			$('.team-stats-comparison-container.second').append(span);
			$('.team-stats-comparison-container.second').append(progressBarContainer);
		} else {
			$('.team-stats-comparison-container.first').append(span);
			$('.team-stats-comparison-container.first').append(progressBarContainer);
		}
	}
}

// helpers
function getAllLeadersUntilNow(gameData, currentPlay) {
	let pointLeaders = {};
	let reboundLeaders = {};
	let assistLeaders = {};

	playsUntilNow = gameData.plays.slice(0, currentPlay + 1);
	playsUntilNow.forEach((play) => {
		if (play.scoringPlay) {
			// points
			let player = play.participants[0].athlete.id;
			let team = parseInt(play.team.id);
			let points = play.scoreValue;

			if (pointLeaders[player]) {
				pointLeaders[player].points += points;
			} else {
				pointLeaders[player] = {
					player: player,
					team: team,
					points: points,
				};
			}

			// assists
			player = play.participants[1]?.athlete.id;
			if (!player) return;
			team = parseInt(play.team.id);

			if (assistLeaders[player]) {
				assistLeaders[player].assists += 1;
			} else {
				assistLeaders[player] = {
					player: player,
					team: team,
					assists: 1,
				};
			}
		}
	});

	// rebounds
	let reboundPlays = gameData.plays.slice(0, currentPlay + 1).filter((play) => [155, 156].includes(parseInt(play.type.id)));
	reboundPlays.forEach((play) => {
		let player = play.participants?.[0].athlete.id;
		if (!player) return;
		let team = parseInt(play.team.id);

		if (reboundLeaders[player]) {
			reboundLeaders[player].rebounds += 1;
		} else {
			reboundLeaders[player] = {
				player: player,
				team: team,
				rebounds: 1,
			};
		}
	});

	// points
	pointLeaders = Object.values(pointLeaders);
	pointLeaders.sort((a, b) => b.points - a.points);
	let teamIds = [];
	let uniquePointLeaders = [];
	pointLeaders.forEach((leader) => {
		if (!teamIds.includes(leader.team)) {
			teamIds.push(leader.team);
			uniquePointLeaders.push(leader);
		}
	});

	// rebounds
	reboundLeaders = Object.values(reboundLeaders);
	reboundLeaders.sort((a, b) => b.rebounds - a.rebounds);
	teamIds = [];
	let uniqueReboundLeaders = [];
	reboundLeaders.forEach((leader) => {
		if (!teamIds.includes(leader.team)) {
			teamIds.push(leader.team);
			uniqueReboundLeaders.push(leader);
		}
	});

	// assists
	assistLeaders = Object.values(assistLeaders);
	assistLeaders.sort((a, b) => b.assists - a.assists);
	teamIds = [];
	let uniqueAssistLeaders = [];
	assistLeaders.forEach((leader) => {
		if (!teamIds.includes(leader.team)) {
			teamIds.push(leader.team);
			uniqueAssistLeaders.push(leader);
		}
	});

	return {
		points: uniquePointLeaders,
		rebounds: uniqueReboundLeaders,
		assists: uniqueAssistLeaders,
	};
}

async function _getPlayerName(playerId) {
	let name = playerNames[playerId];
	if (!name) {
		name = await getPlayerName(playerId);
		playerNames[playerId] = name;
	}

	return name;
}

async function _getPlayerHeadshot(playerId) {
	let image = playerImages[playerId];
	if (!image) {
		image = await getPlayerHeadshot(playerId);
		playerImages[playerId] = image;
	}

	return image;
}

function adjustGameViewsHeight() {
	if (!$('.game-analysis.option').hasClass('active')) return;

	let height = $('.game-analysis-view').outerHeight(true);
	$('.game-views').css('height', `${height}px`);
}

$('.shot-chart-toggles-container .toggle input').on('change', () => {
	updateShotChart(lastGameData, lastCurrentPlay);
});

// apply different styles when only 1 column
const gameAnalysisView = document.querySelector('.game-analysis-view');

const observer = new ResizeObserver(() => {
	adjustGameViewsHeight();

	const columnCount = getComputedStyle(gameAnalysisView).getPropertyValue('grid-template-columns').split(' ').length;

	if (columnCount === 1) {
		gameAnalysisView.classList.add('single-column');
	} else {
		gameAnalysisView.classList.remove('single-column');
	}
});

observer.observe(gameAnalysisView);

export { updateAnalysis };
