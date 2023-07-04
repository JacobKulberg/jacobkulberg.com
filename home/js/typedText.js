window.addEventListener('load', function () {
	let spacer = document.getElementById('header-spacer');

	let typedTexts = document.querySelectorAll('.typed-text-container');
	[...typedTexts].forEach((typedText) => {
		let text = typedText.getElementsByClassName('typed-text')[0];
		let cursor = typedText.getElementsByClassName('typed-text-cursor')[0];

		setTimeout(() => {
			cursor.style.height = '';
			setTimeout(() => {
				cursor.style.animation = 'blink 600ms step-end infinite';
			}, 400);
		}, 1000);

		setTimeout(() => {
			cursor.style.animation = 'none';

			let value = text.getAttribute('text-value');
			let index = 0;

			function typeLetter() {
				if (index < value.length) {
					text.innerHTML += value[index];
					cursor.style.left = `calc(51% + ${text.offsetWidth / 2}px)`;
					index++;
					setTimeout(typeLetter, 100);
				} else {
					window.addEventListener(
						'resize',
						(cursorResize = () => {
							cursor.style.left = `calc(51% + ${text.offsetWidth / 2}px)`;
						})
					);

					cursor.style.animation = 'blink 600ms step-end infinite';
					setTimeout(() => {
						cursor.style.height = '0px';
						cursor.style.animation = 'none';
						setTimeout(() => {
							window.removeEventListener('resize', cursorResize);
							cursor.parentNode.removeChild(cursor);

							let scale = window.innerWidth > window.innerHeight ? 0.45 : 0.75;
							text.style.transformOrigin = 'top center';
							text.style.transform = `translateX(-50%) scale(${scale})`;
							text.style.top = `0px`;

							setTimeout(() => {
								typedText.style.backgroundColor = 'transparent';
								text.style.transition = 'unset';

								let textBounds = text.getBoundingClientRect();
								spacer.style.height = `${textBounds.y + textBounds.height}px`;

								setTimeout(() => {
									document.querySelector('header hr').style.transform = 'scaleX(1)';
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
		}, 2800);
	});
});
