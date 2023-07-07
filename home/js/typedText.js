window.addEventListener('load', function () {
	let spacer = document.getElementById('header-spacer');

	let typedTexts = document.querySelectorAll('.typed-text-container');
	[...typedTexts].forEach((typedText) => {
		let text = typedText.getElementsByClassName('typed-text')[0];
		let cursor = typedText.getElementsByClassName('typed-text-cursor')[0];
		let unfinished = typedText.getElementsByClassName('unfinished')[0];

		let mostRecentTimeout = null;

		let spedUp = false;

		let mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
			cursor.style.height = '';
			mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
				cursor.style.transition = 'none';
				cursor.style.animation = `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`;

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

							cursor.style.animation = `blink ${spedUp ? 600 / 7 : 600}ms step-end infinite`;
							mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
								cursor.style.transition = '';
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
										text.style.transition = 'none';

										let textBounds = text.getBoundingClientRect();
										spacer.style.height = `${textBounds.y + textBounds.height}px`;

										mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
											document.querySelector('header hr').style.transform = 'scaleX(1)';

											mostRecentTimeoutId = setTimeout(mostRecentTimeout = () => {
												if (unfinished.parentNode) unfinished.parentNode.removeChild(unfinished);

												decelerateTimeouts();
											}, 300);
										}, 200);
									}, 850);

									window.addEventListener('resize', () => {
										let scale = window.innerWidth > window.innerHeight ? 0.45 : 0.75;
										text.style.transform = `translateX(-50%) scale(${scale})`;

										spacer.style.height = `${text.getBoundingClientRect().height}px`;
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

			typedText.style.transition = `transition: background-color ${800 / 7}ms ease-in-out`;
			text.style.transition = `top ${800 / 7}ms ease-in-out, transform ${800 / 7}ms ease-in-out`;

			window.setTimeout = function (callback, delay, ...args) {
				return originalSetTimeout(callback, delay / 7, ...args);
			};

			clearTimeout(mostRecentTimeoutId);
			mostRecentTimeout();
		}

		function decelerateTimeouts() {
			spedUp = false;

			typedText.style.transition = 'none';
			text.style.transition = 'none';

			window.setTimeout = originalSetTimeout;
		}
	});
});
