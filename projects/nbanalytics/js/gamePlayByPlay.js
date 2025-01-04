let playerNames = {};
let playerImages = {};

let scrollTimeoutId = null;

async function updatePlayByPlay(gameData, currentPlay) {
	let plays = gameData.plays.slice(0, currentPlay + 1);
	let playByPlay = $('.game-play-by-play-view');
	let playByPlayTemp = $('<div></div>').addClass('game-play-by-play-view');

	for (let i = plays.length - 1; i >= 0; i--) {
		let play = plays[i];

		let playDiv = $('<div></div>');
		playDiv.addClass('game-play-by-play-item');

		let playObject = await getPlayObject(gameData, play, i, plays);

		if (playObject === null) continue;

		if (!playObject.permanent && i != plays.length - 1) continue;

		applyReplacements(playObject);

		if (playObject.permanent) {
			playDiv.addClass('permanent');
		}

		if (playObject.minified || !(play.participants?.[0]?.athlete.id || play.team?.id)) {
			playDiv.addClass('minified');

			let playContainer = $('<div></div>');

			if (playObject.team) {
				let playImage = $('<img></img>');
				playImage.addClass('game-play-by-play-item-minified-image');
				playImage.attr('src', teamLogos[playObject.team]);
				playImage.attr('title', teamNames[playObject.team]);
				playContainer.append(playImage);
			}

			let playText = $('<div></div>');
			playText.html(playObject.text);
			playContainer.append(playText);

			playDiv.append(playContainer);

			playByPlayTemp.append(playDiv);
			continue;
		}

		let playImageDiv = $('<div></div>');
		if (play.participants?.[0]?.athlete.id) {
			let playImage = $('<img></img>');
			playImage.addClass('game-play-by-play-item-image');
			playImage.attr('src', await _getPlayerHeadshot(play.participants?.[0]?.athlete.id));
			playImage.attr('title', await _getPlayerName(play.participants?.[0]?.athlete.id));
			playImageDiv.append(playImage);

			if (play.participants?.[1]?.athlete.id) {
				let playSubImage = $('<img></img>');
				playSubImage.addClass('game-play-by-play-item-sub-image');
				playSubImage.attr('src', await _getPlayerHeadshot(play.participants?.[1]?.athlete.id));
				playSubImage.attr('title', await _getPlayerName(play.participants?.[1]?.athlete.id));
				playImageDiv.append(playSubImage);

				if (play.participants?.[2]?.athlete.id) {
					let playSubImage = $('<img></img>');
					playSubImage.addClass('game-play-by-play-item-sub-image-secondary');
					playSubImage.attr('src', await _getPlayerHeadshot(play.participants?.[2]?.athlete.id));
					playSubImage.attr('title', await _getPlayerName(play.participants?.[2]?.athlete.id));
					playImageDiv.append(playSubImage);
				} else if (play.team?.id) {
					let playSubImage = $('<img></img>');
					playSubImage.addClass('game-play-by-play-item-sub-image-secondary');
					playSubImage.attr('src', teamLogos[play.team?.id]);
					playSubImage.attr('title', teamNames[play.team?.id]);
					playImageDiv.append(playSubImage);
				}
			} else if (play.team?.id) {
				let playSubImage = $('<img></img>');
				playSubImage.addClass('game-play-by-play-item-sub-image');
				playSubImage.attr('src', teamLogos[play.team?.id]);
				playSubImage.attr('title', teamNames[play.team?.id]);
				playImageDiv.append(playSubImage);
			}
		} else if (play.team?.id) {
			let playImage = $('<img></img>');
			playImage.addClass('game-play-by-play-item-team-image');
			playImage.attr('src', teamLogos[play.team?.id]);
			playImage.attr('title', teamNames[play.team?.id]);
			playImageDiv.append(playImage);
		}

		let playTextDiv = $('<div></div>');
		let playText = $('<div></div>');
		playText.addClass('game-play-by-play-item-main-text');
		playText.html(playObject.text);
		playTextDiv.append(playText);

		if (playObject.subtext) {
			let playSubText = $('<div></div>');
			playSubText.addClass('game-play-by-play-item-sub-text');
			playSubText.html(playObject.subtext);
			playTextDiv.append(playSubText);
		}

		if (playObject.subsubtext) {
			let playSubSubText = $('<div></div>');
			playSubSubText.addClass('game-play-by-play-item-sub-sub-text');
			playSubSubText.html(playObject.subsubtext);
			playTextDiv.append(playSubSubText);
		}

		if (play.shootingPlay) {
			let gameInfoText = $('<div></div>');
			gameInfoText.addClass('game-play-by-play-item-game-info');

			let awayImage = $('<img></img>');
			awayImage.addClass('game-play-by-play-item-game-info-image');
			awayImage.attr('src', teamLogos[gameData.header.competitions[0].competitors[1].id]);
			awayImage.attr('title', teamNames[gameData.header.competitions[0].competitors[1].id]);
			gameInfoText.append(awayImage);

			let scores = $('<div></div>');
			scores.addClass('game-play-by-play-item-game-info-scores');
			scores.html(`${play.awayScore} - ${play.homeScore}`);
			let scoringPlay = play.scoringPlay || ([97, 99, 102, 103, 105, 106, 108, 166].includes(parseInt(play.type.id)) && getCurrentFreeThrows(play.participants?.[0]?.athlete.id, i, plays) > 0);
			if (scoringPlay && play.team?.id === gameData.header.competitions[0].competitors[1].id) {
				scores.html(`<u>${play.awayScore}</u> - ${play.homeScore}`);
			} else if (scoringPlay && play.team?.id === gameData.header.competitions[0].competitors[0].id) {
				scores.html(`${play.awayScore} - <u>${play.homeScore}</u>`);
			}
			gameInfoText.append(scores);

			let homeImage = $('<img></img>');
			homeImage.addClass('game-play-by-play-item-game-info-image');
			homeImage.attr('src', teamLogos[gameData.header.competitions[0].competitors[0].id]);
			homeImage.attr('title', teamNames[gameData.header.competitions[0].competitors[0].id]);
			gameInfoText.append(homeImage);

			let clock = $('<div></div>');
			clock.addClass('game-play-by-play-item-game-info-clock');
			let period = play.period.number;
			if (period == 5) period = 'OT';
			else if (period >= 6) period = `${period - 4}OT`;
			else period = `Q${period}`;
			let seconds = play.clock.displayValue.split(':');
			if (seconds.length == 1 && seconds[0] <= 45) {
				clock.html(`${period} - <span style="color: red;">${play.clock.displayValue}</span>`);
			} else {
				clock.html(`${period} - ${play.clock.displayValue}`);
			}
			gameInfoText.append(clock);

			playTextDiv.prepend(gameInfoText);
		}

		playDiv.append(playImageDiv);
		playDiv.append(playTextDiv);

		playByPlayTemp.append(playDiv);
	}

	// for each play in playByPlayTemp, change playByPlay play if it's different. or add new plays if there are more in playByPlayTemp
	let playByPlayItems = [...playByPlay.find('.game-play-by-play-item')].reverse();
	let playByPlayTempItems = [...playByPlayTemp.find('.game-play-by-play-item')].reverse();

	for (let i = 0; i < playByPlayTempItems.length; i++) {
		let playByPlayItem = $(playByPlayItems[i]);
		let playByPlayTempItem = $(playByPlayTempItems[i]);

		if (playByPlayItem.prop('outerHTML') != playByPlayTempItem.prop('outerHTML')) {
			await playByPlayItem.replaceWith(await playByPlayTempItem.prop('outerHTML'));

			await $('body').append(playByPlayItem);
			await $('body').append(playByPlayTempItem);
			let heightDifference = (await playByPlayTempItem.outerHeight(true)) - (await playByPlayItem.outerHeight(true));

			await playByPlayItem.remove();
			await playByPlayTempItem.remove();
			await scroll(heightDifference);

			// remove all items after this one if they dont have the class "permanent"
			if (!playByPlayTempItem.hasClass('permanent')) {
				playByPlayItems = [...playByPlay.find('.game-play-by-play-item')].reverse();
				for (let j = i + 1; j < playByPlayItems.length; j++) {
					if (!$(playByPlayItems[j]).hasClass('permanent')) {
						heightDifference = (await $(playByPlayItems[j]).outerHeight(true)) + 15; /* gap */
						await scroll(-heightDifference);

						$(playByPlayItems[j]).remove();
					}
				}
				break;
			}
		}
	}

	if (playByPlayItems.length < playByPlayTempItems.length) {
		let numLoaded = 0;

		for (let i = playByPlayItems.length; i < playByPlayTempItems.length; i++) {
			clearTimeout(scrollTimeoutId);

			await playByPlay.prepend($(playByPlayTempItems[i]));

			let heightDifference = (await $(playByPlayTempItems[i]).outerHeight(true)) + 15; /* gap */
			await scroll(heightDifference);

			numLoaded++;

			if ((await $('#court').outerHeight(true)) + 100 >= window.scrollY) {
				await playByPlay.css('translate', `0px -${heightDifference}px`);

				scrollTimeoutId = setTimeout(async () => {
					await playByPlay.css('transition', 'translate 500ms ease-in-out, opacity 300ms ease-in-out');
					scrollTimeoutId = setTimeout(async () => {
						await playByPlay.css('translate', '');
						scrollTimeoutId = setTimeout(async () => {
							await playByPlay.css('transition', '');
						}, 500);
					}, 0);
				}, 0);
			}
		}

		if (numLoaded > 1) {
			clearTimeout(scrollTimeoutId);
			await playByPlay.css('transition', '');
			await playByPlay.css('translate', '');
		}
	}

	playByPlay.addClass('filled');

	if ($('.game-play-by-play-view').hasClass('active')) {
		let height = $(`.game-play-by-play-view`).height();
		$('.game-views').css('height', height + 'px');
	}
}

$(window).on('resize orientationchange', async () => {
	if ($('.game-play-by-play-view').hasClass('active')) {
		let height = $(`.game-play-by-play-view`).height();
		$('.game-views').css('height', height + 'px');
	}
});

async function scroll(distance) {
	if (!$('.game-play-by-play-view').hasClass('active')) return;

	if ((await $('#court').outerHeight(true)) + 100 < window.scrollY) {
		let scrollLimit = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

		if (window.scrollY + window.innerHeight + distance > scrollLimit) {
			await $('.game-views').css('transition', 'height 0ms linear');

			requestAnimationFrame(async () => {
				window.scrollBy(0, distance);
				await $('.game-views').css('transition', '');
			});
		} else {
			window.scrollBy(0, distance);
		}
	}
}

async function getPlayObject(gameData, play, playNum, plays) {
	let playObject = null;

	switch (parseInt(play.type.id)) {
		case 9:
			playObject = {
				permanent: false,
				text: ':player1:defensive goaltending',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 11:
			playObject = {
				permanent: true,
				text: 'Jump Ball',
				subtext: ':player1: vs :player2:',
				subsubtext: ':player3:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':player2:': await _getPlayerName(play.participants?.[1]?.athlete.id),
					':player3:': play.participants?.[2]?.athlete.id ? `${await _getPlayerName(play.participants?.[2]?.athlete.id)} gains possession` : '',
				},
			};
			break;
		case 16:
			playObject = {
				permanent: true,
				text: ':team: timeout',
				team: play.team?.id,
				minified: true,
				replacements: {
					':team:': teamNamesShort[play.team?.id],
				},
			};
			break;
		case 17:
			playObject = {
				permanent: true,
				text: ':team: timeout',
				team: play.team?.id,
				minified: true,
				replacements: {
					':team:': teamNamesShort[play.team?.id],
				},
			};
			break;
		case 21:
			playObject = {
				permanent: false,
				text: 'Blocking foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 22:
			playObject = {
				permanent: false,
				text: 'Personal take foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 23:
			playObject = {
				permanent: false,
				text: 'Personal block foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 24:
			playObject = {
				permanent: false,
				text: 'Personal charge foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 25:
			playObject = {
				permanent: false,
				text: ':team: excess timeout technical',
				replacements: {
					':team:': teamNamesShort[play.team?.id],
				},
			};
			break;
		case 27:
			playObject = {
				permanent: false,
				text: 'Taunting technical foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 29:
			playObject = {
				permanent: false,
				text: 'Defensive 3-seconds technical foul:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 30:
			playObject = {
				permanent: false,
				text: 'Double technical foul:bothPlayers:',
				replacements: {
					':bothPlayers:': play.participants?.[0]?.athlete.id && play.participants?.[1]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)} and ${await _getPlayerName(play.participants?.[1]?.athlete.id)}` : '',
				},
			};
			break;
		case 31:
			playObject = {
				permanent: false,
				text: 'Flagrant type 2 foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 32:
			playObject = {
				permanent: false,
				text: 'Flagrant type 1 foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 33:
			playObject = {
				permanent: false,
				text: 'Hanging technical foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 34:
			playObject = {
				permanent: false,
				text: 'Non-unsportsmanlike technical foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 35:
			playObject = {
				permanent: false,
				text: 'Technical foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 36:
			playObject = {
				permanent: false,
				text: 'Double personal foul:bothPlayers:',
				replacements: {
					':bothPlayers:': play.participants?.[0]?.athlete.id && play.participants?.[1]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)} and ${await _getPlayerName(play.participants?.[1]?.athlete.id)}` : '',
				},
			};
			break;
		case 37:
			playObject = {
				permanent: false,
				text: 'Clear path foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 40:
			playObject = {
				permanent: false,
				text: 'Away from play foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 41:
			playObject = {
				permanent: false,
				text: 'Inbound foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 42:
			playObject = {
				permanent: false,
				text: 'Offensive foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 43:
			playObject = {
				permanent: false,
				text: 'Loose ball foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 44:
			playObject = {
				permanent: false,
				text: 'Shooting foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 45:
			playObject = {
				permanent: false,
				text: 'Personal foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 46:
			playObject = {
				permanent: false,
				text: 'Defensive foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 62:
			playObject = {
				permanent: true,
				text: ':player1:bad pass',
				subtext: ':player2::STL:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
					':player2:': play.participants?.[1]?.athlete.id ? await _getPlayerName(play.participants?.[1]?.athlete.id) : '',
					':STL:': play.participants?.[1]?.athlete.id ? ` ● ${getCurrentSteals(play.participants?.[1]?.athlete.id, playNum, plays)} STL` : '',
				},
			};
			break;
		case 63:
			playObject = {
				permanent: true,
				text: ':player1:lost ball',
				subtext: ':player2::STL:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
					':player2:': play.participants?.[1]?.athlete.id ? await _getPlayerName(play.participants?.[1]?.athlete.id) : '',
					':STL:': play.participants?.[1]?.athlete.id ? ` ● ${getCurrentSteals(play.participants?.[1]?.athlete.id, playNum, plays)} STL` : '',
				},
			};
			break;
		case 64:
			playObject = {
				permanent: false,
				text: ':player1:traveling',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 65:
			playObject = {
				permanent: false,
				text: ':player1:double dribble',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 66:
			playObject = {
				permanent: false,
				text: ':player1:discontinued dribble',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 67:
			playObject = {
				permanent: false,
				text: ':player1:3 second violation',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 68:
			playObject = {
				permanent: false,
				text: ':player1:5 second violation',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 69:
			playObject = {
				permanent: false,
				text: ':player1:8 second violation',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 70:
			playObject = {
				permanent: false,
				text: 'Shot clock violation',
			};
			break;
		case 71:
			playObject = {
				permanent: false,
				text: ':player1:inbound turnover',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 72:
			playObject = {
				permanent: false,
				text: 'Backcourt violation:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 73:
			playObject = {
				permanent: true,
				text: ':player1:offensive goaltending',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 74:
			playObject = {
				permanent: false,
				text: 'Lane violation:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 75:
			playObject = {
				permanent: false,
				text: 'Jumpball violation:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 76:
			playObject = {
				permanent: false,
				text: 'Kicked ball violation:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 77:
			playObject = {
				permanent: false,
				text: ':player1:illegal assist',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 78:
			playObject = {
				permanent: false,
				text: 'Palming violation:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 83:
			playObject = {
				permanent: false,
				text: ':player1:illegal screen',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} ` : '',
				},
			};
			break;
		case 84:
			playObject = {
				permanent: false,
				text: 'Offensive foul:player1:',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` on ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 86:
			playObject = {
				permanent: true,
				text: 'Out-of-bounds:player1:',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` off of ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 87:
			playObject = {
				permanent: true,
				text: 'Out-of-bounds:player1: (lost ball)',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` off of ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 88:
			playObject = {
				permanent: false,
				text: ':team: excess timeout',
				replacements: {
					':team:': teamNamesShort[play.team?.id],
				},
			};
			break;
		case 90:
			playObject = {
				permanent: true,
				text: 'Out-of-bounds:player1: (bad pass)',
				replacements: {
					':player1:': play.participants?.[0]?.athlete.id ? ` off of ${await _getPlayerName(play.participants?.[0]?.athlete.id)}` : '',
				},
			};
			break;
		case 91:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)}`,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 92:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 93:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:hook shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 94:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:tip shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 95:
			playObject = {
				permanent: true,
				text: ':isMade:layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 96:
			playObject = {
				permanent: true,
				text: ':isMade:dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 97:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/1 free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 98:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/1 free throws (of 2)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 99:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/2 free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 100:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/1 free throws (of 3)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 101:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/2 free throws (of 3)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 102:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/3 free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 103:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/1 technical free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 104:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/1 flagrant free throws (of 2)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 105:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/2 flagrant free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 106:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/1 flagrant free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 107:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/1 free throws (of 2)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 108:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/2 free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 109:
			playObject = {
				permanent: true,
				text: ':isMade:running layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 110:
			playObject = {
				permanent: true,
				text: ':isMade:driving layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 111:
			playObject = {
				permanent: true,
				text: ':isMade:alley-oop layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 112:
			playObject = {
				permanent: true,
				text: ':isMade:reverse layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 113:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:running jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 114:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 115:
			playObject = {
				permanent: true,
				text: ':isMade:driving dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 116:
			playObject = {
				permanent: true,
				text: ':isMade:running dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 117:
			playObject = {
				permanent: true,
				text: ':isMade:reverse dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 118:
			playObject = {
				permanent: true,
				text: ':isMade:alley-oop dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 119:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:driving hook shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 120:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround hook shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 121:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:fadeaway jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 122:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 123:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 124:
			playObject = {
				permanent: true,
				text: ':isMade:finger roll layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 125:
			playObject = {
				permanent: true,
				text: ':isMade:putback layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 126:
			playObject = {
				permanent: true,
				text: ':isMade:driving reverse layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 127:
			playObject = {
				permanent: true,
				text: ':isMade:running reverse layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 128:
			playObject = {
				permanent: true,
				text: ':isMade:driving finger roll layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 129:
			playObject = {
				permanent: true,
				text: ':isMade:running finger roll layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 130:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:floater',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 131:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:pullup jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 132:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:step back jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 133:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:pullup bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 134:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:driving bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 135:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:fadeaway bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 136:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 137:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround fadeaway jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 138:
			playObject = {
				permanent: true,
				text: ':isMade:putback dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 139:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:driving bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 140:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 141:
			playObject = {
				permanent: true,
				text: ':isMade:cutting layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 142:
			playObject = {
				permanent: true,
				text: ':isMade:cutting finger roll layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 143:
			playObject = {
				permanent: true,
				text: ':isMade:running alley-oop layup',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 144:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:driving floater',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 145:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:driving floater',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 146:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:running pullup jump shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 147:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:step back bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 148:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:turnaround fadeaway bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 149:
			playObject = {
				permanent: true,
				text: ':isMade:running alley-oop dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 150:
			playObject = {
				permanent: true,
				text: ':isMade:tip dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 151:
			playObject = {
				permanent: true,
				text: ':isMade:cutting dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 152:
			playObject = {
				permanent: true,
				text: ':isMade:driving reverse dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 153:
			playObject = {
				permanent: true,
				text: ':isMade:running reverse dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 157:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/1 flagrant free throws (of 3)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 165:
			playObject = {
				permanent: false,
				text: ':freeThrowsMade:/2 flagrant free throws (of 3)',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 166:
			playObject = {
				permanent: true,
				text: ':freeThrowsMade:/3 flagrant free throws',
				subtext: ':player1: ● :FTMR::PTS:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':freeThrowsMade:': getCurrentFreeThrows(play.participants?.[0]?.athlete.id, playNum, plays),
					':FTMR:': getCurrentFTMRatio(play.participants?.[0]?.athlete.id, playNum, plays),
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)}`,
				},
			};
			break;
		case 209:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 210:
			playObject = {
				permanent: true,
				text: ':isMade::dist::3pt:running bank shot',
				subtext: ':player1: ● :FGMR::PTS::3PM:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':dist:': getShotDistance(play.text),
					':3pt:': play.scoreValue === 3 ? '3-pt ' : '',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':3PM:': play.scoreValue === 3 ? ` ● ${getCurrent3PM(play.participants?.[0]?.athlete.id, playNum, plays)}` : '',
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 211:
			playObject = {
				permanent: true,
				text: ':isMade:putback dunk',
				subtext: ':player1: ● :FGMR::PTS:',
				subsubtext: ':REB::AST::BLK:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':isMade:': play.scoringPlay ? 'Made ' : 'Missed ',
					':FGMR:': `${getCurrentFGMRatio(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':PTS:': ` ● ${getPointsStr(play.participants?.[0]?.athlete.id, playNum, plays)} `,
					':REB:': await getReboundStr(playNum, plays),
					':AST:': await getAssistStr(play.participants?.[1]?.athlete.id, playNum, plays),
					':BLK:': await getBlockStr(play.participants?.[1]?.athlete.id, playNum, plays),
				},
			};
			break;
		case 213:
			playObject = {
				permanent: false,
				text: 'Official Review',
				minified: true,
			};
			break;
		case 214:
			playObject = {
				permanent: false,
				text: 'Official Review',
				minified: true,
			};
		case 215:
			playObject = {
				permanent: false,
				text: 'Official Review - Call Overturned',
				minified: true,
			};
			break;
		case 216:
			playObject = {
				permanent: false,
				text: 'Official Review - Call Stands',
				minified: true,
			};
			break;
		case 257:
			playObject = {
				permanent: false,
				text: ':player1: transition take foul',
				subtext: ':foulDrawn:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':foulDrawn:': play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[1]?.athlete.id)} draws the foul` : '',
				},
			};
			break;
		case 277:
			playObject = {
				permanent: false,
				text: 'Official Review',
				minified: true,
			};
			break;
		case 278:
			playObject = {
				permanent: false,
				text: 'Official Review',
				minified: true,
			};
			break;
		case 279:
			playObject = {
				permanent: false,
				text: 'Official Review - Call Overturned',
				minified: true,
			};
			break;
		case 280:
			playObject = {
				permanent: false,
				text: 'Official Review - Call Stands',
				minified: true,
			};
			break;
		case 411:
			playObject = {
				permanent: true,
				text: 'Start of :period: (:awayImg::score1: - :score2::homeImg:)',
				minified: true,
				replacements: {
					':period:': getPeriodName(play.period.number),
					':score1:': play.awayScore,
					':score2:': play.homeScore,
					':awayImg:': `<img class="game-play-by-play-item-minified-image-score" src="${teamLogos[gameData.header.competitions[0].competitors[1].id]}" />`,
					':homeImg:': `<img class="game-play-by-play-item-minified-image-score" src="${teamLogos[gameData.header.competitions[0].competitors[0].id]}" />`,
				},
			};
			break;
		case 412:
			playObject = {
				permanent: true,
				text: 'End of :period: (:awayImg::score1: - :score2::homeImg:)',
				minified: true,
				replacements: {
					':period:': getPeriodName(play.period.number),
					':score1:': play.awayScore,
					':score2:': play.homeScore,
					':awayImg:': `<img class="game-play-by-play-item-minified-image-score" src="${teamLogos[gameData.header.competitions[0].competitors[1].id]}" />`,
					':homeImg:': `<img class="game-play-by-play-item-minified-image-score" src="${teamLogos[gameData.header.competitions[0].competitors[0].id]}" />`,
				},
			};
			break;
		case 517:
			playObject = {
				permanent: false,
				text: ':player1: ejected',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
				},
			};
			break;
		case 580:
			playObject = {
				permanent: true,
				text: 'TV Timeout',
				minified: true,
			};
			break;
		case 581:
			playObject = {
				permanent: true,
				text: 'Official Timeout',
				minified: true,
			};
			break;
		case 584:
			playObject = {
				permanent: false,
				text: ':substitution:',
				replacements: {
					':substitution:': !play.participants?.[1]?.athlete.id ? `${await _getPlayerName(play.participants?.[0]?.athlete.id)} substitution` : `${await _getPlayerName(play.participants?.[0]?.athlete.id)} enters the game for ${await _getPlayerName(play.participants?.[1]?.athlete.id)}`,
				},
			};
			break;
		case 592:
			playObject = {
				permanent: false,
				text: 'Illegal pick turnover',
			};
			break;
		case 615:
			playObject = {
				permanent: true,
				text: 'Jump Ball',
				subtext: ':player1: vs :player2:',
				subsubtext: ':player3:',
				replacements: {
					':player1:': await _getPlayerName(play.participants?.[0]?.athlete.id),
					':player2:': await _getPlayerName(play.participants?.[1]?.athlete.id),
					':player3:': play.participants?.[2]?.athlete.id ? `${await _getPlayerName(play.participants?.[2]?.athlete.id)} gains possession` : '',
				},
			};
			break;
	}

	return playObject;
}

// search for word that has -ft or -foot and return the number before it
function getShotDistance(str) {
	let re = /(\d+)-ft|(\d+)-foot/g;
	let distance = str.match(re);
	if (distance) {
		return distance[0].split('-')[0] + "' ";
	} else {
		return '';
	}
}

function getCurrentFreeThrows(playerId, playNum, plays) {
	let freeThrowPlays = plays.slice(0, playNum + 1).filter((play) => [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 157, 165, 166].includes(parseInt(play.type.id)) && play.participants?.[0]?.athlete.id == playerId);

	let lastSequenceIndex = freeThrowPlays.findLastIndex((play) => [97, 98, 100, 103, 104, 106, 107, 157].includes(parseInt(play.type.id)));
	if (lastSequenceIndex == -1) {
		return null;
	}

	let lastSequence = freeThrowPlays.slice(lastSequenceIndex);

	let made = lastSequence.filter((play) => play.scoringPlay).length;
	return made;
}

function getCurrentFGMRatio(playerId, playNum, plays) {
	let shotPlays = plays.slice(0, playNum + 1).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)) && play.participants?.[0]?.athlete.id == playerId);

	let made = shotPlays.filter((play) => play.scoringPlay).length;
	let total = shotPlays.length;
	return `${made}/${total} FGM`;
}

function getCurrentFTMRatio(playerId, playNum, plays) {
	let freeThrowPlays = plays.slice(0, playNum + 1).filter((play) => [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 157, 165, 166].includes(parseInt(play.type.id)) && play.participants?.[0]?.athlete.id == playerId);

	let made = freeThrowPlays.filter((play) => play.scoringPlay).length;
	let total = freeThrowPlays.length;
	return `${made}/${total} FTM`;
}

function getPointsStr(playerId, playNum, plays) {
	let shotPlays = plays.slice(0, playNum + 1).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)) && play.participants?.[0]?.athlete.id == playerId);
	let freeThrowPlays = plays.slice(0, playNum + 1).filter((play) => [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 157, 165, 166].includes(parseInt(play.type.id)) && play.participants?.[0]?.athlete.id == playerId);

	let points = shotPlays.filter((play) => play.scoringPlay).reduce((acc, play) => acc + play.scoreValue, 0);
	points += freeThrowPlays.filter((play) => play.scoringPlay).reduce((acc, play) => acc + play.scoreValue, 0);

	return `${points} PTS`;
}

function getCurrent3PM(playerId, playNum, plays) {
	let shotPlays = plays.slice(0, playNum + 1).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)) && play.scoreValue === 3 && play.participants?.[0]?.athlete.id == playerId);

	let made = shotPlays.filter((play) => play.scoringPlay).length;
	return `${made} three${made > 1 ? 's' : ''}`;
}

function getCurrentSteals(playerId, playNum, plays) {
	let stealPlays = plays.slice(0, playNum + 1).filter((play) => [62, 63].includes(parseInt(play.type.id)) && play.participants?.[1]?.athlete.id == playerId);

	let total = stealPlays.length;
	return total;
}

async function getReboundStr(playNum, plays) {
	// the current shot play is at playNum, go forward until you find a rebound play and return the string: [player] - [num] REB
	// offensive or defensive does not matter

	if (plays[playNum].scoringPlay || plays[playNum].participants[1]?.athlete.id) return '';

	let shotPlays = plays.slice(playNum).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)));
	let reboundPlays = plays.slice(playNum).filter((play) => [155, 156].includes(parseInt(play.type.id)));
	if (reboundPlays.length == 0) {
		return '';
	}

	let rebounder = null;
	let reboundPlayIndex = null;
	for (let i = 0; i < reboundPlays.length; i++) {
		if (reboundPlays[i].participants?.[0].athlete) {
			rebounder = reboundPlays[i].participants[0].athlete.id;
			reboundPlayIndex = i;
			break;
		}
	}
	if (!rebounder) return '';

	let endIndex = plays.indexOf(reboundPlays[reboundPlayIndex]);
	let inbetween = plays.slice(playNum + 1, endIndex);
	if (shotPlays.some((play) => inbetween.includes(play))) return '';

	let rebounderName = await _getPlayerName(rebounder);

	let reboundPlaysBefore = plays.slice(0, playNum + 1).filter((play) => [155, 156].includes(parseInt(play.type.id)));
	let numRebs = reboundPlaysBefore.filter((play) => play.participants?.[0].athlete.id == rebounder).length + 1;

	return `${rebounderName} ● ${numRebs} REB`;
}

async function getAssistStr(playerId, playNum, plays) {
	if (!plays[playNum].scoringPlay || !playerId) return '';

	let assisterName = await _getPlayerName(playerId);

	let shotPlays = plays.slice(0, playNum + 1).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)));
	let numAssists = shotPlays.filter((play) => play.scoringPlay && play.participants?.[1]?.athlete.id == playerId).length;

	return `${assisterName} ● ${numAssists} AST`;
}

async function getBlockStr(playerId, playNum, plays) {
	if (plays[playNum].scoringPlay || !playerId) return '';

	let blockerName = await _getPlayerName(playerId);

	let shotPlays = plays.slice(0, playNum + 1).filter((play) => [91, 92, 93, 94, 95, 96, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 209, 210, 211].includes(parseInt(play.type.id)));
	let numBlocks = shotPlays.filter((play) => !play.scoringPlay && play.participants?.[1]?.athlete.id == playerId).length;

	return `${blockerName} ● ${numBlocks} BLK`;
}

function getPeriodName(period) {
	if (period == 1) period = '1st';
	else if (period == 2) period = '2nd';
	else if (period == 3) period = '3rd';
	else if (period == 4) period = '4th';
	else if (period == 5) period = 'OT';
	else period = `OT${period - 4}`;

	return period;
}

function applyReplacements(obj) {
	let replacements = obj.replacements;

	let text = obj.text;
	for (let key in replacements) {
		text = text.replace(key, replacements[key]);
	}
	obj.text = text;

	let subtext = obj.subtext;
	if (subtext) {
		for (let key in replacements) {
			subtext = subtext.replace(key, replacements[key]);
		}
		obj.subtext = subtext;
	}

	let subsubtext = obj.subsubtext;
	if (subsubtext) {
		for (let key in replacements) {
			subsubtext = subsubtext.replace(key, replacements[key]);
		}
		obj.subsubtext = subsubtext;
	}
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

export { updatePlayByPlay };
