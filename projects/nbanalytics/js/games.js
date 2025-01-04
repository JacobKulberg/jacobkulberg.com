import { date } from './daySelect.js';

let games;
let t1, t2;

async function createGames() {
	games = await getAllGames(date);

	// move finished games to end, latest to earliest
	let finishedGames = [];
	for (let i = 0; i < games.length; i++) {
		if (games[i].status.type.completed) {
			finishedGames.push(games.splice(i, 1)[0]);
			i--;
		}
	}
	finishedGames.sort((a, b) => {
		return new Date(a.date) - new Date(b.date);
	});
	games = games.concat(finishedGames);

	// move postponed games to back
	for (let i = games.length - 1; i >= 0; i--) {
		if (games[i].status.type.name == 'STATUS_POSTPONED') {
			games.push(games.splice(i, 1)[0]);
		}
	}

	if (games.length == 0) {
		$('.no-games').css('opacity', '1');
	} else {
		$('.no-games').css('opacity', '0');
	}
	setTimeout(() => {
		$('.no-games').css('transition', 'opacity 300ms ease-in');
	}, 300);

	setTimeout(() => {
		$('.games').css('opacity', '1');
		setTimeout(() => {
			$('body').css('pointer-events', '');
		}, 100);
	}, 500);

	await games.forEach(async (game) => {
		let gameDiv = document.createElement('div');
		$(gameDiv).addClass('game');
		$(gameDiv).attr('id', game.id);

		$(gameDiv).on('click', function (e) {
			$('body').css('pointer-events', 'none');
			if (e.pointerType === 'mouse') {
				window.location.href = `/projects/nbanalytics/game/?id=${game.id}`;
				$('body').css('pointer-events', '');
			} else {
				$(gameDiv).addClass('game-hovered');
				setTimeout(() => {
					window.location.href = `/projects/nbanalytics/game/?id=${game.id}`;
					$('body').css('pointer-events', '');
					setTimeout(() => {
						$(gameDiv).removeClass('game-hovered');
					}, 10);
				}, 500);
			}
		});

		let gameScores = document.createElement('div');
		$(gameScores).addClass('game-scores');
		$(gameDiv).append(gameScores);

		let awayTeam = document.createElement('div');
		$(awayTeam).addClass('team-home');
		if (areColorsSimilar(teamColors[game.competitions[0].competitors[1].team.id], teamColors[game.competitions[0].competitors[0].team.id])) {
			$(awayTeam).css('background', `linear-gradient(90deg, #${teamColorsAlt[game.competitions[0].competitors[1].team.id]} 0%, transparent 100%)`);
		} else {
			$(awayTeam).css('background', `linear-gradient(90deg, #${teamColors[game.competitions[0].competitors[1].team.id]} 0%, transparent 100%)`);
		}
		$(gameScores).append(awayTeam);

		let homeTeam = document.createElement('div');
		$(homeTeam).addClass('team-away');
		$(homeTeam).css('background', `linear-gradient(90deg, #${teamColors[game.competitions[0].competitors[0].team.id]} 0%, transparent 100%)`);
		$(gameScores).append(homeTeam);

		let awayTeamID = document.createElement('div');
		$(awayTeamID).addClass('team-id');
		$(awayTeam).append(awayTeamID);

		let homeTeamID = document.createElement('div');
		$(homeTeamID).addClass('team-id');
		$(homeTeam).append(homeTeamID);

		let awayTeamLogo = document.createElement('div');
		$(awayTeamLogo).addClass('team-logo');
		$(awayTeamID).append(awayTeamLogo);

		let homeTeamLogo = document.createElement('div');
		$(homeTeamLogo).addClass('team-logo');
		$(homeTeamID).append(homeTeamLogo);

		let awayTeamLogoImg = document.createElement('img');
		$(awayTeamLogoImg).attr('src', teamLogos[game.competitions[0].competitors[1].team.id] || `${game.competitions[0].competitors[1].team.logo}`);
		$(awayTeamLogoImg).attr('title', teamNames[game.competitions[0].competitors[1].team.id]);
		$(awayTeamLogoImg).attr('draggable', false);
		$(awayTeamLogo).append(awayTeamLogoImg);

		let homeTeamLogoImg = document.createElement('img');
		$(homeTeamLogoImg).attr('src', teamLogos[game.competitions[0].competitors[0].team.id] || `${game.competitions[0].competitors[0].team.logo}`);
		$(homeTeamLogoImg).attr('title', teamNames[game.competitions[0].competitors[0].team.id]);
		$(homeTeamLogoImg).attr('draggable', false);
		$(homeTeamLogo).append(homeTeamLogoImg);

		let awayTeamName = document.createElement('div');
		$(awayTeamName).addClass('team-name');
		$(awayTeamID).append(awayTeamName);

		let homeTeamName = document.createElement('div');
		$(homeTeamName).addClass('team-name');
		$(homeTeamID).append(homeTeamName);

		let awayTeamNameText = document.createElement('div');
		$(awayTeamNameText).addClass('team-name-text');
		$(awayTeamNameText).text(game.competitions[0].competitors[1].team.shortDisplayName);
		$(awayTeamName).append(awayTeamNameText);

		let homeTeamNameText = document.createElement('div');
		$(homeTeamNameText).addClass('team-name-text');
		$(homeTeamNameText).text(game.competitions[0].competitors[0].team.shortDisplayName);
		$(homeTeamName).append(homeTeamNameText);

		if ($(gameDiv).find('.team-name .team-record-sub').length == 0) {
			let awayTeamRecordSub = document.createElement('div');
			$(awayTeamRecordSub).addClass('team-record-sub');
			$(awayTeamName).append(awayTeamRecordSub);

			let homeTeamRecordSub = document.createElement('div');
			$(homeTeamRecordSub).addClass('team-record-sub');
			$(homeTeamName).append(homeTeamRecordSub);

			if (game.status.type.name != 'STATUS_SCHEDULED' && game.status.type.name != 'STATUS_POSTPONED') {
				if (game.competitions[0].competitors[0].records && game.competitions[0].competitors[1].records) {
					$(awayTeamRecordSub).text(`(${game.competitions[0].competitors[1].records[0].summary})`);
					$(homeTeamRecordSub).text(`(${game.competitions[0].competitors[0].records[0].summary})`);
				}
			}
		}

		if (game.status.type.name == 'STATUS_SCHEDULED' || game.status.type.name == 'STATUS_POSTPONED') {
			let awayTeamRecord = document.createElement('div');
			$(awayTeamRecord).addClass('team-record');
			$(awayTeamRecord).text(game.competitions[0].competitors[1].records?.[0].summary);
			$(awayTeam).append(awayTeamRecord);

			let homeTeamRecord = document.createElement('div');
			$(homeTeamRecord).addClass('team-record');
			$(homeTeamRecord).text(game.competitions[0].competitors[0].records?.[0].summary);
			$(homeTeam).append(homeTeamRecord);
		} else {
			let awayTeamScore = document.createElement('div');
			$(awayTeamScore).addClass('team-score');
			$(awayTeamScore).text(game.competitions[0].competitors[1].score);
			$(awayTeam).append(awayTeamScore);

			let homeTeamScore = document.createElement('div');
			$(homeTeamScore).addClass('team-score');
			$(homeTeamScore).text(game.competitions[0].competitors[0].score);
			$(homeTeam).append(homeTeamScore);

			if (game.status.type.completed) {
				if (game.competitions[0].competitors[1].winner) {
					$(awayTeam).addClass('game-winner');
					$(homeTeam).addClass('game-loser');
				} else {
					$(homeTeam).addClass('game-winner');
					$(awayTeam).addClass('game-loser');
				}
			}
		}

		let gameInfo = document.createElement('div');
		$(gameInfo).addClass('game-info');
		$(gameDiv).append(gameInfo);

		let gameWhereWhen = document.createElement('div');
		$(gameWhereWhen).addClass('game-where-when');
		$(gameInfo).append(gameWhereWhen);

		if (game.status.type.name == 'STATUS_SCHEDULED') {
			let gameTime = document.createElement('div');
			$(gameTime).addClass('game-time');
			if (moment().isAfter(moment(game.date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone))) {
				$(gameTime).text('Pregame');
				$(gameTime).addClass('pregame');
			} else {
				$(gameTime).text(moment(game.date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('h:mm A'));

				let clock = document.createElement('i');
				$(clock).addClass('fa-solid fa-clock fa-sm');
				$(gameTime).prepend(clock);
			}
			$(gameWhereWhen).append(gameTime);
		} else if (game.status.type.name == 'STATUS_POSTPONED') {
			let gameStatus = document.createElement('div');
			$(gameStatus).addClass('postponed');
			$(gameStatus).text('Postponed');
			$(gameWhereWhen).append(gameStatus);
		} else {
			let gameStatus = document.createElement('div');
			$(gameStatus).addClass('game-status');

			let status = '';
			if ((game.status.clock == 0 || game.status.type.name == 'STATUS_FINAL') && (game.status.type.shortDetail.includes('End of 1st') || game.status.type.shortDetail.includes('Halftime') || game.status.type.shortDetail.includes('End of 3rd') || game.status.type.shortDetail.includes('Final'))) {
				status = game.status.type.shortDetail;
			} else {
				let seconds = Math.ceil(game.status.clock);
				let minutes = Math.floor(seconds / 60);
				seconds -= minutes * 60;

				let period = game.status.period;
				if (period == 5) period = 'OT';
				else if (period >= 6) period = `OT${period - 4}`;
				else period = `Q${period}`;

				status = `${period} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
			}
			$(gameStatus).text(status);

			$(gameDiv).find('.team-record-sub').css('margin-top', '7px');

			$(gameWhereWhen).append(gameStatus);
		}

		if (!game.status.type.completed) {
			let gameNetwork = document.createElement('div');
			$(gameNetwork).addClass('game-network');
			let broadcast = game.competitions[0].broadcasts[0]?.names[0];
			$(gameNetwork).text(broadcast);
			$(gameNetwork).attr('title', broadcast);
			$(gameWhereWhen).append(gameNetwork);
		}

		let gameEvent = document.createElement('div');
		$(gameEvent).addClass('game-event');
		$(gameEvent).text(gameEvents[game.competitions[0].notes[0]?.headline.toLowerCase()]);
		$(gameInfo).append(gameEvent);

		$('.games').append(gameDiv);

		let gameData = await getSpecificGameData(game.id);

		let gameHighlight = document.createElement('div');
		$(gameHighlight).addClass('game-highlight');
		$(gameInfo).append(gameHighlight);

		let gameHighlightImg = document.createElement('div');
		$(gameHighlightImg).addClass('game-highlight-img');
		$(gameHighlight).append(gameHighlightImg);

		let gameHighlightImgImg = document.createElement('img');
		$(gameHighlightImgImg).addClass('game-highlight-img-big');
		$(gameHighlightImgImg).attr('draggable', false);
		$(gameHighlightImg).append(gameHighlightImgImg);

		let gameHighlightImgImgSmall = document.createElement('img');
		$(gameHighlightImgImgSmall).addClass('game-highlight-img-small');
		$(gameHighlightImgImgSmall).attr('draggable', false);
		$(gameHighlightImg).append(gameHighlightImgImgSmall);

		let gameHighlightText = document.createElement('div');
		$(gameHighlightText).addClass('game-highlight-text');
		$(gameHighlight).append(gameHighlightText);

		let gameHighlightTextText = document.createElement('p');
		$(gameHighlightText).append(gameHighlightTextText);

		let plays = gameData.plays || [];
		let lastHighlight = plays ? plays[plays.length - 1] : null;

		if (lastHighlight && !game.status.type.completed) {
			let text = await playToText(lastHighlight.type.id, lastHighlight.participants, lastHighlight.team, lastHighlight.text);

			if (lastHighlight.participants) {
				let headshot = await getPlayerHeadshot(lastHighlight.participants[0].athlete.id);
				$(gameHighlight).css('opacity', '1');
				$(gameHighlightImgImgSmall).attr('opacity', '1');
				$(gameHighlightImgImgSmall).attr('src', `${teamLogos[lastHighlight.team.id]}`);
				$(gameHighlightImgImgSmall).attr('title', teamNames[lastHighlight.team.id]);
				$(gameHighlightImgImg).attr('src', `${headshot}`);
				$(gameHighlightImgImg).attr('title', lastHighlight.participants[0].athlete.displayName);
				$(gameHighlightTextText).text(text);
			} else if (lastHighlight.team) {
				$(gameHighlight).css('opacity', '1');
				$(gameHighlightImgImgSmall).attr('opacity', '0');
				$(gameHighlightImgImgSmall).attr('title', '');
				$(gameHighlightImgImg).attr('src', `${teamLogos[lastHighlight.team.id]}`);
				$(gameHighlightImgImg).attr('title', teamNames[lastHighlight.team.id]);
				$(gameHighlightTextText).text(text);
			} else if (lastHighlight.type.id == 412 || lastHighlight.type.id == 402) {
				$(gameHighlight).css('opacity', '0');
			}
		} else if (game.status.type.completed) {
			let leaders = getAllLeaders(gameData);

			let id = Math.floor(Math.random() * leaders.length);

			$(gameHighlight).attr('id', 0);

			$(gameHighlight).css('opacity', '1');
			if (leaders[id].headshot) {
				if (teamLogos[leaders[id].team]) {
					$(gameHighlightImgImgSmall).attr('src', `${teamLogos[leaders[id].team]}`);
					$(gameHighlightImgImgSmall).css('opacity', 1);
				} else {
					$(gameHighlightImgImgSmall).css('opacity', 0);
				}
				$(gameHighlightImgImgSmall).attr('title', teamNames[leaders[id].team]);
				$(gameHighlightImgImg).attr('src', `${leaders[id].headshot}`);
				$(gameHighlightImgImg).attr('title', leaders[id].name);
				$(gameHighlightImgImgSmall).css('display', '');
			} else {
				$(gameHighlightImgImg).attr('src', `${teamLogos[leaders[id].team]}`);
				$(gameHighlightImgImg).attr('title', teamNames[leaders[id].team]);
				$(gameHighlightImgImgSmall).css('display', 'none');
			}
			$(gameHighlightTextText).html(`<u>${leaders[id].name}</u><br />${leaders[id].category}: <b>${leaders[id].value}</b>`);
		}
	});
}
await createGames();
window.createGames = createGames;

adjustTextSizes();
let intervalID = setInterval(() => {
	adjustTextSizes();
}, 100);

setTimeout(() => {
	clearInterval(intervalID);
}, 500);

function adjustTeamNameTextSize(text, maxWidth, element) {
	const $span = $('<span></span>').text(text).css('visibility', 'hidden').appendTo('body');
	$span.css('font-weight', 'bold');

	let fontSize = 100;
	$span.css('font-size', fontSize + 'px');

	while ($span.outerWidth(true) > maxWidth && fontSize > 1) {
		fontSize--;
		$span.css('font-size', fontSize + 'px');
	}

	$span.remove();

	if ($(element).css('font-size') != `min(max(1.75vmax, 30px), ${fontSize}px)`) {
		$(element).css('font-size', `min(max(1.75vmax, 30px), ${fontSize}px)`).text(text);
	}
}

function adjustEventTextSize(text, maxWidth, element) {
	const $span = $('<span></span>').text(text).css('visibility', 'hidden').appendTo('body');
	$span.css({
		'font-weight': 'bold',
	});

	let fontSize = 100;
	$span.css('font-size', fontSize + 'px');

	while ($span.outerWidth(true) > maxWidth && fontSize > 1) {
		fontSize--;
		$span.css('font-size', fontSize + 'px');
	}

	$span.remove();

	if ($(element).css('font-size') != `min(max(1.25vmax, 20px), ${fontSize}px)`) {
		$(element).css('font-size', `min(max(1.25vmax, 20px), ${fontSize}px)`).text(text);
	}
}

function adjustTextSizes() {
	$('.team-name-text').each((index, teamName) => {
		let team = $(teamName).parent().parent().parent();
		if ($(team).find('.team-record').length > 0) {
			adjustTeamNameTextSize($(teamName).text(), $(team).outerWidth(true) - $(team).find('.team-logo').outerWidth(true) - $(team).find('.team-record').outerWidth(true), $(teamName));
		} else {
			adjustTeamNameTextSize($(teamName).text(), $(team).outerWidth(true) - $(team).find('.team-logo').outerWidth(true) - $(team).find('.team-score').outerWidth(true), $(teamName));
		}
	});
	$('.game-event').each((index, gameEvent) => {
		adjustEventTextSize($(gameEvent).text(), $('.game-info').outerWidth(true) - 30, $(gameEvent));
	});
}
window.adjustTextSizes = adjustTextSizes;

$(window).on('resize orientationchange', adjustTextSizes);

async function updateGameData() {
	games = await getAllGames(date);

	games.forEach(async (game) => {
		let gameDiv = $(`#${game.id}`);

		if (game.status.type.name != 'STATUS_SCHEDULED' && !game.status.type.completed && game.status.type.name != 'STATUS_POSTPONED') {
			if ($(gameDiv).find('.team-record').length > 0) {
				$(gameDiv).find('.team-record').remove();

				let awayTeamScore = document.createElement('div');
				$(awayTeamScore).addClass('team-score');
				$(awayTeamScore).text(0);
				$(gameDiv).find('.team-home').append(awayTeamScore);

				let homeTeamScore = document.createElement('div');
				$(homeTeamScore).addClass('team-score');
				$(homeTeamScore).text(0);
				$(gameDiv).find('.team-away').append(homeTeamScore);
			}

			if (gameDiv.find('.game-time').length > 0) {
				$(gameDiv).find('.game-time').remove();

				let gameStatus = document.createElement('div');
				$(gameStatus).addClass('game-status');
				$(gameDiv).find('.game-where-when').prepend(gameStatus);
			}

			let status = '';
			if ((game.status.clock == 0 || game.status.type.name == 'STATUS_FINAL') && (game.status.type.shortDetail.includes('End of 1st') || game.status.type.shortDetail.includes('Halftime') || game.status.type.shortDetail.includes('End of 3rd') || game.status.type.shortDetail.includes('Final'))) {
				status = game.status.type.shortDetail;
			} else {
				let seconds = Math.ceil(game.status.clock);
				let minutes = Math.floor(seconds / 60);
				seconds -= minutes * 60;

				let period = game.status.period;
				if (period == 5) period = 'OT';
				else if (period >= 6) period = `${period - 4}OT`;
				else period = `Q${period}`;

				status = `${period} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
			}
			$(gameDiv).find('.game-status').text(status);
		} else if (game.status.type.completed) {
			$(gameDiv).find('.game-network').remove();
			$(gameDiv).find('.game-status').text(game.status.type.shortDetail);

			if (game.competitions[0].competitors[1].winner) {
				$(gameDiv).find('.team-home').addClass('game-winner');
				$(gameDiv).find('.team-home').removeClass('game-loser');
				$(gameDiv).find('.team-away').addClass('game-loser');
				$(gameDiv).find('.team-away').removeClass('game-winner');
			} else {
				$(gameDiv).find('.team-away').addClass('game-winner');
				$(gameDiv).find('.team-away').removeClass('game-loser');
				$(gameDiv).find('.team-home').addClass('game-loser');
				$(gameDiv).find('.team-home').removeClass('game-winner');
			}
		}

		if (game.status.type.name != 'STATUS_SCHEDULED' && game.status.type.name != 'STATUS_POSTPONED') {
			$(gameDiv).find('.game-time').removeClass('pregame');

			if ($(gameDiv).find('.team-name .team-record-sub').length == 0) {
				let awayTeamRecordSub = document.createElement('div');
				$(awayTeamRecordSub).addClass('team-record-sub');
				$(gameDiv).find('.team-home .team-name').append(awayTeamRecordSub);

				let homeTeamRecordSub = document.createElement('div');
				$(homeTeamRecordSub).addClass('team-record-sub');
				$(gameDiv).find('.team-away .team-name').append(homeTeamRecordSub);
			}

			let awayTeamScore = $(gameDiv).find('.team-home .team-score');
			$(awayTeamScore).text(game.competitions[0].competitors[1].score);

			let homeTeamScore = $(gameDiv).find('.team-away .team-score');
			$(homeTeamScore).text(game.competitions[0].competitors[0].score);

			if (game.competitions[0].competitors[0].records && game.competitions[0].competitors[1].records) {
				$(gameDiv).find('.team-record-sub').css('margin-top', '7px');

				$(gameDiv).find('.team-home .team-record-sub').text(`(${game.competitions[0].competitors[1].records[0].summary})`);
				$(gameDiv).find('.team-away .team-record-sub').text(`(${game.competitions[0].competitors[0].records[0].summary})`);
			}
		} else {
			$(gameDiv).find('.team-home .team-record').text(game.competitions[0].competitors[1].records[0].summary);
			$(gameDiv).find('.team-away .team-record').text(game.competitions[0].competitors[0].records[0].summary);

			if (moment().isAfter(moment(game.date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone))) {
				$(gameDiv).find('.game-time').text('Pregame');
				$(gameDiv).find('.game-time').addClass('pregame');
			} else {
				$(gameDiv).find('.game-time').text(moment(game.date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('h:mm A'));

				let clock = document.createElement('i');
				$(clock).addClass('fa-solid fa-clock fa-sm');
				$(gameDiv).find('.game-time').prepend(clock);
			}
		}

		let gameData = await getSpecificGameData(game.id);

		let plays = gameData.plays || [];
		let lastHighlight = plays ? plays[plays.length - 1] : null;

		if (lastHighlight && !game.status.type.completed) {
			let text = await playToText(lastHighlight.type.id, lastHighlight.participants, lastHighlight.team, lastHighlight.text);

			if (lastHighlight.participants) {
				let headshot = await getPlayerHeadshot(lastHighlight.participants[0].athlete.id);
				$(gameDiv).find('.game-highlight').css('opacity', '1');
				$(gameDiv).find('.game-highlight-img-small').css('opacity', '1');
				$(gameDiv).find('.game-highlight-img-small').attr('src', `${teamLogos[lastHighlight.team.id]}`);
				$(gameDiv).find('.game-highlight-img-small').attr('title', teamNames[lastHighlight.team.id]);
				$(gameDiv).find('.game-highlight-img-big').attr('src', `${headshot}`);
				$(gameDiv).find('.game-highlight-img-big').attr('title', lastHighlight.participants[0].athlete.displayName);
				$(gameDiv).find('.game-highlight-text p').text(text);
			} else if (lastHighlight.team) {
				$(gameDiv).find('.game-highlight').css('opacity', '1');
				$(gameDiv).find('.game-highlight-img-small').css('opacity', '0');
				$(gameDiv).find('.game-highlight-img-small').attr('title', '');
				$(gameDiv).find('.game-highlight-img-big').attr('src', `${teamLogos[lastHighlight.team.id]}`);
				$(gameDiv).find('.game-highlight-img-big').attr('title', teamNames[lastHighlight.team.id]);
				$(gameDiv).find('.game-highlight-text p').text(text);
			} else if (lastHighlight.type.id == 412 || lastHighlight.type.id == 402) {
				$(gameDiv).find('.game-highlight').css('opacity', '0');
			}
		} else if (game.status.type.completed) {
			$(gameDiv).find('.game-highlight').addClass('completed');

			let leaders = getAllLeaders(gameData);
			let itr = $('body').attr('highlight-itr');

			if (itr % 6 == 0) {
				let id = Math.floor(Math.random() * leaders.length);
				while (`<u>${leaders[id].name}</u><br>${leaders[id].category}: <b>${leaders[id].value}</b>` == $(gameDiv).find('.game-highlight-text p').html()) {
					id = Math.floor(Math.random() * leaders.length);
				}

				t1 = setTimeout(() => {
					t2 = setTimeout(() => {
						$('.games').removeClass('invis-highlights');
						$(gameDiv).find('.game-highlight').css('opacity', '1');
						clearTimeout(t1);
						clearTimeout(t2);
					}, 200);

					if (leaders[id].headshot) {
						if (teamLogos[leaders[id].team]) {
							$(gameDiv).find('.game-highlight-img-small').attr('src', `${teamLogos[leaders[id].team]}`);
							$(gameDiv).find('.game-highlight-img-small').css('opacity', 1);
						} else {
							$(gameDiv).find('.game-highlight-img-small').css('opacity', 0);
						}
						$(gameDiv).find('.game-highlight-img-small').attr('title', teamNames[leaders[id].team]);
						$(gameDiv).find('.game-highlight-img-big').attr('src', `${leaders[id].headshot}`);
						$(gameDiv).find('.game-highlight-img-big').attr('title', leaders[id].name);
						$(gameDiv).find('.game-highlight-img-small').css('display', '');
					} else {
						$(gameDiv).find('.game-highlight-img-big').attr('src', `${teamLogos[leaders[id].team]}`);
						$(gameDiv).find('.game-highlight-img-big').attr('title', teamNames[leaders[id].team]);
						$(gameDiv).find('.game-highlight-img-small').css('display', 'none');
					}
					$(gameDiv).find('.game-highlight-text p').html(`<u>${leaders[id].name}</u><br />${leaders[id].category}: <b>${leaders[id].value}</b>`);
				}, 250);
			}
		}
	});

	let itr = $('body').attr('highlight-itr');
	if (!itr || itr >= 36) {
		itr = 1;
	} else {
		itr++;
	}
	$('body').attr('highlight-itr', itr);
	if (itr % 6 == 0) {
		$('.games').addClass('invis-highlights');
	}
}

setInterval(() => {
	updateGameData();
}, 1000);

function getAllLeaders(gameData) {
	let leaders = [];

	gameData.leaders.forEach((team) => {
		team.leaders.forEach((category) => {
			if (category.leaders) {
				category.leaders.forEach((leader) => {
					leaders.push({
						team: team.team.id,
						name: leader.athlete.displayName,
						category: category.displayName,
						value: leader.displayValue,
						headshot: leader.athlete.headshot?.href,
					});
				});
			}
		});
	});

	return leaders;
}
