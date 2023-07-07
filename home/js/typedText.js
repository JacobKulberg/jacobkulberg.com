$(window).on('load', function() {
	let spacer = $('#header-spacer');

	$('.typed-text-container').each(function() {
		let typedText = $(this);
		let text = typedText.find('.typed-text:first');
		let cursor = typedText.find('.typed-text-cursor:first');
		let unfinished = typedText.find('.unfinished:first');

		let mostRecentTimeout = null;

		let spedUp = false;

		let mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
			cursor.css('height', '');
			mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
				cursor.css({
					'transition': 'none',
					'animation': `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`
				});

				mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
					cursor.css('animation', 'none');

					let value = text.attr('text-value');
					let index = 0;

					function typeLetter() {
						if (index < value.length) {
							text.html(text.html() + value[index]);
							cursor.css('left', `calc(51% + ${text.width() / 2}px)`);
							index++;
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = typeLetter, 100);
						} else {
							let cursorResize = function() {
								cursor.css('left', `calc(51% + ${text.width() / 2}px)`);
							}

							$(window).on('resize', cursorResize);

							cursor.css({
								'animation': `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`,
								'transition': '',
								'height': '0'
							});

							mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
								$(window).off('resize', cursorResize);
								cursor.remove();

								let scale = $(window).innerWidth() > $(window).innerHeight() ? 0.45 : 0.75;
								text.css({
									'transformOrigin': 'top center',
									'transform': `translateX(-50%) scale(${scale})`,
									'top': '0'
								});

								mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
									typedText.css('backgroundColor', 'transparent');
									text.css('transition', 'none');

									let textBounds = text[0].getBoundingClientRect();
									spacer.css('height', `${textBounds.y + textBounds.height}px`);

									mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
										$('header hr:first').css('transform', 'scaleX(1)');

										mostRecentTimeoutId = setTimeout(mostRecentTimeout = function() {
											if (unfinished.parent().length) unfinished.remove();

											decelerateTimeouts();
										}, 300);
									}, 200);
								}, 850);

								$(window).on('resize', function() {
									let scale = $(window).innerWidth() > $(window).innerHeight() ? 0.45 : 0.75;
									text.css('transform', `translateX(-50%) scale(${scale})`);

									spacer.css('height', `${text[0].getBoundingClientRect().height}px`);
								});
							}, 600);
						}
					}

					typeLetter();
				}, 1400);
			}, 400);
		}, 1000);

		unfinished.on('click touchstart', function() {
			$(this).remove();
			accelerateTimeouts();
		});

		let originalSetTimeout = setTimeout;
		function accelerateTimeouts() {
			spedUp = true;

			typedText.css('transition', `background-color ${800 / 7}ms ease-in-out`);
			text.css('transition', `top ${800 / 7}ms ease-in-out, transform ${800 / 7}ms ease-in-out`);

			window.setTimeout = function(callback, delay, ...args) {
				return originalSetTimeout(callback, delay / 7, ...args);
			};

			clearTimeout(mostRecentTimeoutId);
			mostRecentTimeout();
		}

		function decelerateTimeouts() {
			spedUp = false;

			typedText.css('transition', 'none');
			text.css('transition', 'none');

			window.setTimeout = originalSetTimeout;
		}
	});
});
