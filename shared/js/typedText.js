$(window).on('load', () => {
	let spacer = $('#header-spacer');

	let typedTexts = $('.typed-text-container');
	typedTexts.each((index, typedText) => {
		let text = $('.typed-text').first();
		let cursor = $('.typed-text-cursor').first();
		let unfinished = $('.unfinished').first();

		$('#ff-text').css('opacity', '1');

		let mostRecentTimeout = null;

		let spedUp = false;

		let mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
			$(cursor).css('height', '');

			mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
				$(cursor).css({
					transition: 'none',
					animation: `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`
				});

				mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
					$(cursor).css('animation', 'none');

					$('#ff-text').css('opacity', '0');

					let value = text.attr('text-value');
					let index = 0;

					function typeLetter() {
						if (index < value.length) {
							text.html(text.html() + value[index]);
							$(cursor).css('left', `calc(51% + ${$(text).width() / 2}px)`);
							index++;
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = typeLetter, 100);
						} else {
							window.addEventListener('resize', (cursorResize = () => {
								$(cursor).css('left', `calc(51% + ${$(text).width() / 2}px)`);
							}));

							$(cursor).css('animation', `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`);
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
								$(cursor).css({
									transition: '',
									height: '0',
									animation: 'none'
								});

								mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
									$(window).off('resize', cursorResize);
									cursor.remove();

									let scale = $(window).innerWidth() > $(window).innerHeight() ? 0.45 : 0.75;
									$(text).css({
										transformOrigin: 'top center',
										transform: `translateX(-50%) scale(${scale})`,
										top: `0`
									})

									mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
										$(typedText).css('backgroundColor', 'transparent');
										$(text).css('transition', 'none');
										$('.content').css('display', 'block');
										setTimeout(() => {
											window.dispatchEvent(new Event('resize'));
										}, 0);

										$(spacer).css('height', `${text[0].getBoundingClientRect().height}px`);
										if (typeof resizeAboutMe === "function") resizeAboutMe();

										mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
											$('header hr').css('transform', 'scaleX(1)');

											mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
												if (unfinished.parent()) {
													unfinished.remove();
												}

												$(typedText).css('pointerEvents', 'none');

												decelerateTimeouts();
											}, 300);
										}, 200);
									}, 850);

									$(window).on('resize', () => {
										let scale = $(window).innerWidth() > $(window).innerHeight() ? 0.45 : 0.75;
										$(text).css('transform', `translateX(-50%) scale(${scale})`);

										$(spacer).css('height', `${text[0].getBoundingClientRect().height}px`);

										if (typeof resizeAboutMe === "function") resizeAboutMe();
									});
								}, 600);
							}, 800);
						}
					}

					typeLetter();
				}, 1400);
			}, 400);
		}, 1000);

		$(unfinished).on('click touchstart', () => {
			unfinished.remove();
			accelerateTimeouts();
		});

		let originalSetTimeout = setTimeout;
		function accelerateTimeouts() {
			spedUp = true;

			$(typedText).css('transition', `background-color ${800 / 7}ms ease-in-out`);
			$(text).css('transition', `top ${800 / 7}ms ease-in-out, transform ${800 / 7}ms ease-in-out`);
			$('#ff-text').css('transition', 'opacity 400ms ease-in-out');

			window.setTimeout = function (callback, delay, ...args) {
				return originalSetTimeout(callback, delay / 7, ...args);
			};

			clearTimeout(mostRecentTimeoutId);
			mostRecentTimeout();
		}

		function decelerateTimeouts() {
			spedUp = false;

			$(typedText).css('transition', 'none');
			$(text).css('transition', 'none');

			window.setTimeout = originalSetTimeout;
		}
	});
});