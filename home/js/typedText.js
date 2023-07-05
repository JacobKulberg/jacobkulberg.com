window.addEventListener('load', function () {
	let spacer = document.getElementById('header-spacer');

	let typedTexts = document.querySelectorAll('.typed-text-container');
	[...typedTexts].forEach((typedText) => {
		let text = typedText.getElementsByClassName('typed-text')[0];
		let cursor = typedText.getElementsByClassName('typed-text-cursor')[0];
		let unfinished = typedText.getElementsByClassName('unfinished')[0];

		let mostRecentTimeoutId = NaN;
		let mostRecentTimeout = null;

		let spedUp = false;

		mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
			cursor.style.height = '';
			mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
				cursor.style.animation = `blink ${spedUp ? 120 : 600}ms step-end infinite`;

				mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
					cursor.style.animation = 'none';

					let value = text.getAttribute('text-value');
					let index = 0;

					function typeLetter() {
						if (index < value.length) {
							text.innerHTML += value[index];
							cursor.style.left = `calc(51% + ${text.offsetWidth / 2}px)`;
							index++;
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = typeLetter, 100);
						} else {
							window.addEventListener('resize', (cursorResize = () => {
								cursor.style.left = `calc(51% + ${text.offsetWidth / 2}px)`;
							}));

							cursor.style.animation = `blink ${spedUp ? 120 : 600}ms step-end infinite`;
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
								cursor.style.height = '0px';
								cursor.style.animation = 'none';
								mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
									window.removeEventListener('resize', cursorResize);
									cursor.parentNode.removeChild(cursor);

									let scale = window.innerWidth > window.innerHeight ? 0.45 : 0.75;
									text.style.transformOrigin = 'top center';
									text.style.transform = `translateX(-50%) scale(${scale})`;
									text.style.top = `0px`;

									mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
										typedText.style.backgroundColor = 'transparent';
										text.style.transition = 'unset';

										let textBounds = text.getBoundingClientRect();
										spacer.style.height = `${textBounds.y + textBounds.height}px`;

										mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
											document.querySelector('header hr').style.transform = 'scaleX(1)';

											mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
												if (unfinished.parentNode) unfinished.parentNode.removeChild(unfinished);

												decelerateTimeouts();
											}, 300);
										}, 200);
									}, 800);

									window.addEventListener('resize', () => {
										let scale = window.innerWidth > window.innerHeight ? 0.45 : 0.75;
										text.style.transform = `translateX(-50%) scale(${scale})`;

										let textBounds = text.getBoundingClientRect();
										spacer.style.height = `${textBounds.y + textBounds.height}px`;
									});
								}, 600);
							}, 800);
						}
					}

					typeLetter();
				}, 1400);
			}, 400);
		}, 1000);

		unfinished.addEventListener('click', () => {
			unfinished.parentNode.removeChild(unfinished);
			accelerateTimeouts();
		});
		unfinished.addEventListener('touchstart', () => {
			unfinished.parentNode.removeChild(unfinished);
			accelerateTimeouts();
		});

		let originalSetTimeout = setTimeout;
		function accelerateTimeouts() {
			spedUp = true;

			typedText.style.transition = 'transition: background-color 160ms ease-in-out';
			text.style.transition = 'top 160ms ease-in-out, transform 160ms ease-in-out';
			cursor.style.transition = 'height 50ms cubic-bezier(0.4, 0, 0.2, 1)';

			window.setTimeout = function (callback, delay, ...args) {
				return originalSetTimeout(callback, delay / 5, ...args);
			};

			clearTimeout(mostRecentTimeoutId);
			mostRecentTimeout();
		}

		function decelerateTimeouts() {
			spedUp = false;

			typedText.style.transition = 'unset';
			text.style.transition = 'unset';

			window.setTimeout = originalSetTimeout;
		}
	});
});
