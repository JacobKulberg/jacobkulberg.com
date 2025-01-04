import { scene, world, playerGroup, ball, ballBody, redX, trajectoryTube, shootBasket, addPlayer, setCourtLogo, jumpBall, disableJumpBall, trajectoryPoints } from './court.js';
import { updatePlayByPlay } from './gamePlayByPlay.js';
import { updateAnalysis } from './gameAnalysis.js';
import { updateTeamStats } from './gameTeamStats.js';

let searchParams = new URLSearchParams(window.location.search);
let gameID = searchParams.get('id');

if (!gameID) {
	window.location.href = '/projects/nbanalytics/';
}

let gameData = await getSpecificGameData(gameID);

if (gameData.header.competitions[0].competitors[0].id < 1 || gameData.header.competitions[0].competitors[0].id > 30 || gameData.header.competitions[0].competitors[1].id < 1 || gameData.header.competitions[0].competitors[1].id > 30) {
	window.location.href = '/projects/nbanalytics/';
}

if (!window.location.hash) {
	history.replaceState(null, null, '#play-by-play');
}

let awayColor = teamColors[gameData.header.competitions[0].competitors[1].team.id];
let homeColor = teamColors[gameData.header.competitions[0].competitors[0].team.id];
if (areColorsSimilar(awayColor, homeColor)) {
	awayColor = teamColorsAlt[gameData.header.competitions[0].competitors[1].team.id];
}

if (areColorsSimilar(awayColor, '020026')) {
	awayColor = 'ffffff';
}
if (areColorsSimilar(homeColor, '020026')) {
	homeColor = 'ffffff';
}

let title = `${teamAbbrs[gameData.header.competitions[0].competitors[1].team.id]} @ ${teamAbbrs[gameData.header.competitions[0].competitors[0].team.id]}`;
document.title = title;

if (window.location.hash == '#play-by-play') {
	$('.game-play-by-play').addClass('active');
	$('.game-play-by-play-view').addClass('active');
} else if (window.location.hash == '#analysis') {
	$('.game-analysis').addClass('active');
	$('.game-analysis-view').addClass('active');
} else if (window.location.hash == '#away') {
	$('.game-team.away').addClass('active');
	$('.game-team-view.away').addClass('active');

	$('.game-team.away').css('color', `#${awayColor}`);
	$('.game-team.away').css('text-shadow', `0 0 7px #${awayColor}`);
} else if (window.location.hash == '#home') {
	$('.game-team.home').addClass('active');
	$('.game-team-view.home').addClass('active');

	$('.game-team.home').css('color', `#${homeColor}`);
	$('.game-team.home').css('text-shadow', `0 0 7px #${homeColor}`);
}

let currentPlay = gameData.plays?.length - 1 || -1;

let updateCourtRunner;
$(async () => {
	await updateCourt();
	updateCourtRunner = async function () {
		gameData = await getSpecificGameData(gameID);

		setTimeout(() => {
			updateScoreboard();
			updateStats();
		}, 0);

		updateGameNotStartedText(gameData.header.competitions[0].date);

		if (!(gameData.plays && gameData.plays.at(currentPlay))) return;

		if (currentPlay < gameData.plays.length - 1) {
			currentPlay = Math.min(currentPlay + 1, gameData.plays.length - 1);
			await updateCourt();
		}

		if (gameData.plays.at(currentPlay)) {
			$('.play-text').text(await playToText(parseInt(gameData.plays.at(currentPlay).type.id), gameData.plays.at(currentPlay).participants, gameData.plays.at(currentPlay).team, gameData.plays.at(currentPlay).text));
		}

		if ($('.game-play-by-play-view').hasClass('active')) updatePlayByPlay(gameData, currentPlay);
		if ($('.game-analysis-view').hasClass('active')) updateAnalysis(gameData, currentPlay);
		if ($('.game-team-view.away').hasClass('active') || $('.game-team-view.home').hasClass('active')) updateTeamStats(gameData, currentPlay);
	};

	updateCourtRunner();
	setInterval(updateCourtRunner, 2500);

	let courtData = await getSpecificGameData(gameID);
	let homeTeamLogo = teamLogos[courtData.header.competitions[0].competitors[0].team.id];
	setCourtLogo(homeTeamLogo);

	setScoreboard();

	updateScoreboard();
	updateStats();
	updateOptions();
});

async function updateCourt() {
	let plays = gameData.plays || [];

	scene.remove(playerGroup);
	scene.remove(ball);
	scene.remove(redX);
	scene.remove(trajectoryTube);
	world.remove(ballBody);

	playerGroup?.children.forEach((child) => {
		if (child.geometry) child.geometry.dispose();
		if (child.material) child.material.dispose();
	});
	if (ball) {
		ball.geometry.dispose();
		ball.material.dispose();
	}
	redX?.children.forEach((child) => {
		if (child.geometry) child.geometry.dispose();
		if (child.material) child.material.dispose();
	});
	trajectoryTube?.children.forEach((child) => {
		if (child.geometry) child.geometry.dispose();
		if (child.material) child.material.dispose();
	});

	if (plays && plays.at(currentPlay) && plays.at(currentPlay).shootingPlay) {
		let play = plays.at(currentPlay);

		let x = play.coordinate.x,
			y = play.coordinate.y;

		if (play.type.id == 97 || play.type.id == 98 || play.type.id == 99 || play.type.id == 100 || play.type.id == 101 || play.type.id == 102 || play.type.id == 103 || play.type.id == 104 || play.type.id == 105 || play.type.id == 106 || play.type.id == 107 || play.type.id == 108 || play.type.id == 157 || play.type.id == 165 || play.type.id == 166) {
			x = 25;
			y = 18;
		}

		y = 40 - y;
		x *= 15 / 50;
		y *= 14 / 40;
		x -= 7.5;

		let isHomeTeam = play.team?.id === gameData.header.competitions[0].competitors[0].team.id;
		let basket = isHomeTeam ? 1 : 0;
		if (!isHomeTeam) {
			x *= -1;
			y *= -1;
		}
		if (play.period.number > 2) {
			x *= -1;
			y *= -1;
			basket = basket == 1 ? 0 : 1;
		}

		if (x < -100 || x > 100 || y < -100 || y > 100) return;

		x = Math.min(7, Math.max(-7, x));
		y = Math.min(13.5, Math.max(-13.5, y));

		let made = play.scoringPlay || play.scoreValue > 0;

		let playerID = play?.participants?.[0].athlete.id;
		if (!playerID) return;
		let headshot = playerID;

		shootBasket(y, x, basket, made, headshot);
	} else if (plays && plays.at(currentPlay) && plays.at(currentPlay).participants && plays.at(currentPlay).coordinate) {
		let play = plays.at(currentPlay);

		if (play.type.id == 11 || play.type.id == 615) {
			let homePlayerHeadshot = play.participants[0].athlete.id;
			let awayPlayerHeadshot = play.participants[1].athlete.id;

			jumpBall(homePlayerHeadshot, awayPlayerHeadshot);

			return;
		}

		let x = play.coordinate.x,
			y = play.coordinate.y;

		if (play.type.id == 154 || play.type.id == 155 || play.type.id == 156) {
			x = 20 + Math.random() * 10;
			y = 2 + Math.random() * 5;
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
		if (play.type.id == 155 || play.type.id == 43 || play.type.id == 44 || play.type.id == 45) {
			x *= -1;
			y *= -1;
		}
		if (play.period.number > 2) {
			x *= -1;
			y *= -1;
		}

		if (x < -100 || x > 100 || y < -100 || y > 100) return;

		x = Math.min(7, Math.max(-7, x));
		y = Math.min(13.5, Math.max(-13.5, y));

		let playerID = play.participants[0].athlete.id;
		let headshot = playerID;

		addPlayer(y, x, headshot);
	}
}

function setScoreboard() {
	let awayColor = teamColors[gameData.header.competitions[0].competitors[1].team.id];
	let homeColor = teamColors[gameData.header.competitions[0].competitors[0].team.id];

	if (areColorsSimilar(awayColor, homeColor)) {
		awayColor = teamColorsAlt[gameData.header.competitions[0].competitors[1].team.id];
	}

	$('.scoreboard > .team.away').css('background', `linear-gradient(90deg, #${awayColor}90 0%, #${awayColor}40 100%`);
	$('.scoreboard > .info').css('background', `linear-gradient(90deg, #${awayColor}40 0%, #${homeColor}40 100%)`);
	$('.scoreboard > .team.home').css('background', `linear-gradient(90deg, #${homeColor}40 0%, #${homeColor}90 100%)`);

	let awayLogo = teamLogos[gameData.header.competitions[0].competitors[1].team.id];
	let homeLogo = teamLogos[gameData.header.competitions[0].competitors[0].team.id];
	$('.scoreboard > .team.away > .logo').attr('src', awayLogo);
	$('.scoreboard > .team.home > .logo').attr('src', homeLogo);

	$('.scoreboard > .team.away > .name > .name-text').text(teamNamesShort[gameData.header.competitions[0].competitors[1].team.id]);
	$('.scoreboard > .team.home > .name > .name-text').text(teamNamesShort[gameData.header.competitions[0].competitors[0].team.id]);

	let intervalID = setInterval(() => {
		adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[1].team.id], $('.scoreboard > .team.away > .name').width(), '.scoreboard > .team.away > .name > .name-text');
		adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[0].team.id], $('.scoreboard > .team.home > .name').width(), '.scoreboard > .team.home > .name > .name-text');
	}, 100);

	setTimeout(() => {
		clearInterval(intervalID);
	}, 500);
}

let hasBeenLoaded = false;
function updateScoreboard() {
	if (!gameData.plays || gameData.plays.length == 0) {
		requestAnimationFrame(() => {
			$('#court').css('transition', 'unset');
			$('#court canvas').css('transition', 'unset');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '0px');
			$('#court canvas').css('height', '0px');
		});

		$('.game-options-container').css('opacity', '0');
		$('.game-options-container').css('pointer-events', 'none');
		$('.game-views').css('opacity', '0');
		$('.game-not-started').css('opacity', '1');
	} else if (currentPlay == gameData.plays.length - 1 && gameData.header.competitions[0].status.type.shortDetail.includes('Final')) {
		requestAnimationFrame(() => {
			$('#court').css('transition', 'unset');
			$('#court canvas').css('transition', 'unset');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '0px');
			$('#court canvas').css('height', '0px');
		});

		$('.game-options-container').css('opacity', '');
		$('.game-options-container').css('pointer-events', '');
		$('.game-views').css('opacity', '');
		$('.game-not-started').css('opacity', '');
	} else {
		requestAnimationFrame(() => {
			$('#court').css('transition', '');
			$('#court canvas').css('transition', '');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '');
			$('#court canvas').css('height', '');
		});

		$('.game-options-container').css('opacity', '');
		$('.game-options-container').css('pointer-events', '');
		$('.game-views').css('opacity', '');
		$('.game-not-started').css('opacity', '');
	}

	let play = gameData.plays?.at(currentPlay);

	if ((!play && moment().isBefore(moment(gameData.header.competitions[0].date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone))) || gameData.header.competitions[0].status.type.name == 'STATUS_POSTPONED') {
		let time = moment(gameData.header.competitions[0].date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('M/D [-] h:mm A');
		if (gameData.header.competitions[0].status.type.name == 'STATUS_POSTPONED') {
			$('.scoreboard > .info > .time').css('transition', 'unset');
			$('.scoreboard > .info > .time').addClass('postponed');
			time = 'Postponed';
		}
		$('.scoreboard > .info > .time').text(`${time}`);
		return;
	} else if (!play && (!gameData.plays || gameData.plays.length == 0)) {
		$('.scoreboard > .info > .live-status').addClass('pregame');
		$('.scoreboard > .info > .live-status > .text').text('PREGAME');
		$('.scoreboard > .info > .time').text('');
		$('.scoreboard > .info > .live-status > .dot').css('display', 'block');
		return;
	} else if (!play) {
		return;
	}

	$('.scoreboard > .info > .live-status').removeClass('pregame');

	$('.scoreboard > .team.away > .score').text(play ? play.awayScore : 0);
	$('.scoreboard > .team.home > .score').text(play ? play.homeScore : 0);

	let period = play.period.number;
	if (period == 5) period = 'OT';
	else if (period >= 6) period = `${period - 4}OT`;
	else period = `Q${period}`;

	if (play.type.id == 402 && !hasBeenLoaded) {
		$('.play-text').css('opacity', '0');

		$('.scoreboard > .info > .live-status').css('transition', 'unset');
		$('.scoreboard > .info > .time').css('transition', 'unset');

		requestAnimationFrame(() => {
			$('#court').css('transition', 'unset');
			$('#court canvas').css('transition', 'unset');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '0px');
			$('#court canvas').css('height', '0px');
		});
	}

	hasBeenLoaded = true;

	let clock = play.clock.displayValue;
	if (play.type.id == 412) {
		clock = `End of ${period}`;
		if (period == 'Q2') clock = 'Halftime';
		$('.scoreboard > .info > .live-status').css('opacity', '');
		$('.scoreboard > .info > .live-status').css('max-height', '');
		$('.scoreboard > .info > .time').css('color', '');
		$('.scoreboard > .info > .time').css('text-shadow', '');
		$('.play-text').css('opacity', '0');
	} else if (play.type.id == 402 && gameData.header.competitions[0].status.type.shortDetail.includes('Final')) {
		clock = gameData.header.competitions[0].status.type.shortDetail;
		$('.scoreboard > .info > .live-status').css('opacity', '0');
		$('.scoreboard > .info > .live-status').css('max-height', '0px');
		$('.scoreboard > .info > .time').css('color', '#d4a017');
		$('.scoreboard > .info > .time').css('text-shadow', '0 0 7px #96761c');
		$('.play-text').css('opacity', '0');

		if (gameData.header.competitions[0].competitors[0].winner && currentPlay == gameData.plays.length - 1) {
			$('.scoreboard > .team.home .score').css('text-shadow', '0 0 10px white');
			$('.scoreboard > .team.home .name .name-text').css('text-shadow', '0 0 10px white');
			$('.scoreboard > .team.home .name .record').css('text-shadow', '0 0 10px white');

			$('.scoreboard > .team.away .score').css('color', '#ddd');
			$('.scoreboard > .team.away .name .name-text').css('color', '#ddd');
			$('.scoreboard > .team.away .name .record').css('color', '#ddd');
		} else if (gameData.header.competitions[0].competitors[1].winner && currentPlay == gameData.plays.length - 1) {
			$('.scoreboard > .team.home .score').css('color', '#ddd');
			$('.scoreboard > .team.home .name .name-text').css('color', '#ddd');
			$('.scoreboard > .team.home .name .record').css('color', '#ddd');

			$('.scoreboard > .team.away .score').css('text-shadow', '0 0 10px white');
			$('.scoreboard > .team.away .name .name-text').css('text-shadow', '0 0 10px white');
			$('.scoreboard > .team.away .name .record').css('text-shadow', '0 0 10px white');
		}

		if ($('#court').height() > 0) {
			$('html, body').scrollTop($('html, body').scrollTop() - $('#court').outerHeight(true));
		}

		requestAnimationFrame(() => {
			$('#court').css('transition', 'unset');
			$('#court canvas').css('transition', 'unset');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '0px');
			$('#court canvas').css('height', '0px');
		});
	} else {
		$('.scoreboard > .info > .live-status').css('opacity', '');
		$('.scoreboard > .info > .live-status').css('max-height', '');
		$('.scoreboard > .info > .time').css('color', '');
		$('.scoreboard > .info > .time').css('text-shadow', '');
		$('.play-text').css('opacity', '');
		let minutes = parseInt(clock.split(':')[0]);
		let seconds = parseInt(clock.split(':')[1]);
		if (isNaN(seconds)) {
			seconds = minutes;
			minutes = 0;
		}
		seconds = seconds.toString().padStart(2, '0');

		clock = `${period} - ${minutes}:${seconds}`;

		requestAnimationFrame(() => {
			$('#court').css('transition', '');
			$('#court canvas').css('transition', '');
			$('#court')[0].offsetHeight; // flush css changes
			$('#court').css('height', '');
			$('#court canvas').css('height', '');
		});
	}

	$('.scoreboard > .info > .time').text(clock);

	setTimeout(() => {
		let intervalID = setInterval(() => {
			adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[1].team.id], $('.scoreboard > .team.away > .name').width(), '.scoreboard > .team.away > .name > .name-text');
			adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[0].team.id], $('.scoreboard > .team.home > .name').width(), '.scoreboard > .team.home > .name > .name-text');
		}, 10);

		setTimeout(() => {
			clearInterval(intervalID);
		}, 50);
	}, 0);
	if (gameData.plays.length - 2 > currentPlay) {
		$('.skip-replay').css('display', 'flex');
		$('.scoreboard > .info > .live-status > .text').text('REPLAY');
		$('.scoreboard > .info > .live-status > .dot').css('display', 'block');
	} else {
		$('.skip-replay').css('display', 'none');
		$('.scoreboard > .info > .live-status > .text').text('LIVE');
		$('.scoreboard > .info > .live-status > .dot').css('display', 'block');
	}
}

function adjustTeamNameTextSize(text, maxWidth, element) {
	maxWidth -= 10;

	const $span = $('<span></span>').text(text).css('visibility', 'hidden').appendTo('body');
	$span.css('font-weight', 'bold');

	let fontSize = 100;
	$span.css('font-size', fontSize + 'px');

	while ($span.outerWidth(true) > maxWidth && fontSize > 1) {
		fontSize--;
		$span.css('font-size', fontSize + 'px');
	}

	$span.remove();

	if ($(element).css('font-size') != `min(min(max(2vh, 4.5vw), ${fontSize}px), 80px)`) {
		$(element).css('font-size', `min(min(max(2vh, 4.5vw), ${fontSize}px), 80px)`).text(text);
	}
}

function updateStats() {
	if (gameData.header.competitions[0].competitors[0].record && gameData.header.competitions[0].competitors[1].record) {
		$('.scoreboard > .team.away > .name > .record').text(`(${gameData.header.competitions[0].competitors[1].record?.[0].summary})`);
		$('.scoreboard > .team.home > .name > .record').text(`(${gameData.header.competitions[0].competitors[0].record?.[0].summary})`);
	}
}

function updateOptions() {
	let awayAbbr = teamAbbrs[gameData.header.competitions[0].competitors[1].team.id];
	let homeAbbr = teamAbbrs[gameData.header.competitions[0].competitors[0].team.id];

	$('.game-team.away').text(awayAbbr);
	$('.game-team.home').text(homeAbbr);
}

$('.skip-replay').on('click', () => {
	currentPlay = gameData.plays.length - 1;
	trajectoryPoints.length = 0;
	disableJumpBall();
	updateCourt();
	updateCourtRunner();
});

let windowWidth = $(window).width();
$(window).on('resize orientationchange', () => {
	if (windowWidth == $(window).width()) return;
	windowWidth = $(window).width();

	adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[1].team.id], $('.scoreboard > .team.away > .name').width(), '.scoreboard > .team.away > .name > .name-text');
	adjustTeamNameTextSize(teamNamesShort[gameData.header.competitions[0].competitors[0].team.id], $('.scoreboard > .team.home > .name').width(), '.scoreboard > .team.home > .name > .name-text');
});

$('.game-options > .option').on('click', scrollToTop);
$('.game-view-scroll-up').on('click touchstart', scrollToTop);

let isScrolling = false;
function scrollToTop() {
	// scroll to header
	if (!isScrolling) {
		$('html, body').animate(
			{
				scrollTop: $('#court').height() + 1,
			},
			300
		);

		isScrolling = true;

		setTimeout(() => {
			isScrolling = false;
		}, 300);
	}

	if (!$(this).hasClass('option')) return;
	if ($(this).hasClass('active')) return;

	switch ($(this)[0].className.split(' ')[0]) {
		case 'game-play-by-play':
			history.replaceState(null, null, '#play-by-play');
			updatePlayByPlay(gameData, currentPlay);
			break;
		case 'game-analysis':
			history.replaceState(null, null, '#analysis');
			updateAnalysis(gameData, currentPlay);
			break;
		case 'game-team':
			if ($(this).hasClass('away')) {
				history.replaceState(null, null, '#away');
				updateTeamStats(gameData, currentPlay);
				break;
			}
		case 'game-team':
			if ($(this).hasClass('home')) {
				history.replaceState(null, null, '#home');
				updateTeamStats(gameData, currentPlay);
				break;
			}
	}

	$('.game-options > .option').removeClass('active');
	$('.game-options > .option').css({
		color: '',
		'text-shadow': '',
	});

	$(this).addClass('active');

	if ($(this).hasClass('game-team away')) {
		$(this).css('color', `#${awayColor}`);
		$(this).css('text-shadow', `0 0 7px #${awayColor}`);
	} else if ($(this).hasClass('game-team home')) {
		$(this).css('color', `#${homeColor}`);
		$(this).css('text-shadow', `0 0 7px #${homeColor}`);
	}

	$('.game-view').removeClass('active');
	let c = $(this).attr('class').split(' ')[0];

	if (c == 'game-team') {
		if ($(this).hasClass('away')) c = 'away.game-team';
		if ($(this).hasClass('home')) c = 'home.game-team';
	}

	$(`.${c}-view`).addClass('active');

	let height = $(`.${c}-view`).height();
	$('.game-views').css('height', height + 'px');
}

function updateGameNotStartedText(dateString) {
	let date = moment(dateString).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);

	let now = moment();
	let totalSeconds = date.diff(now, 'seconds');

	// Calculate time components
	let diffDays = Math.floor(totalSeconds / (24 * 3600)); // Total days
	let diffHours = Math.floor((totalSeconds % (24 * 3600)) / 3600); // Remaining hours
	let diffMinutes = Math.ceil((totalSeconds % 3600) / 60); // Remaining minutes (rounded up)

	// Handle edge cases where minutes roll into hours
	if (diffMinutes === 60) {
		diffHours++;
		diffMinutes = 0;
	}
	if (diffHours === 24) {
		diffDays++;
		diffHours = 0;
	}

	if (date.isBefore(now)) {
		$('.game-not-started span').text('Starting soon...');
	} else if (diffDays == 0) {
		if (diffHours == 0) {
			$('.game-not-started span').html(`Starting in ${diffMinutes % 60}<span>min</span>...`);
		} else {
			$('.game-not-started span').html(`Starting in ${diffHours % 24}<span>hr</span> ${diffMinutes % 60}<span>min</span>...`);
		}
	} else {
		$('.game-not-started span').html(`Starting in ${diffDays}<span>d</span> ${diffHours % 24}<span>hr</span> ${diffMinutes % 60}<span>min</span>...`);
	}
}

$(window)
	.on('scroll', async () => {
		if ((await $('#court').outerHeight(true)) + 500 >= window.scrollY) {
			$('.game-view-scroll-up').css('display', 'none');
		} else {
			$('.game-view-scroll-up').css('display', 'flex');
		}
	})
	.on('popstate', () => {
		let hash = window.location.hash;

		if (!hash) {
			history.replaceState(null, null, '#play-by-play');
			return;
		}

		$('.game-options > .option').removeClass('active');
		$('.game-view').removeClass('active');
		if (hash == '#play-by-play') {
			$('.game-play-by-play').addClass('active');
			$('.game-play-by-play-view').addClass('active');
		} else if (hash == '#analysis') {
			$('.game-analysis').addClass('active');
			$('.game-analysis-view').addClass('active');
		} else if (hash == '#away') {
			$('.game-team.away').addClass('active');
			$('.game-team-view.away').addClass('active');
		} else if (hash == '#home') {
			$('.game-team.home').addClass('active');
			$('.game-team-view.home').addClass('active');
		}
	});
