let moved = 0;

$(window).on('load', () => {
	let cursor = document.createElement('div');
	cursor.classList.add('cursor');
	cursor.style.opacity = 0;

	let icon = document.createElement('i');
	icon.setAttribute('id', 'cursor-icon');
	icon.classList.add('fa-solid');
	icon.classList.add('fa-arrow-up-right-from-square');

	cursor.append(icon);
	$('body').append(cursor);

	window.onmousemove = (e) => {
		if ('ontouchstart' in window || navigator.maxTouchPoints) {
			cursor.style.opacity = 0;
			return;
		}

		cursor.style.opacity = 1;

		let interactable = e.target.closest('.cursor-interactable'),
			interacting = interactable !== null;

		animateCursor(e, interacting, interacting ? parseInt(interactable.getAttribute('data-cursor-size')) : 1);

		cursor.dataset.type = interacting ? 'interactable' : '';

		moved = true;
	};

	$(window)
		.on('mouseenter', (e) => {
			if ('ontouchstart' in window || navigator.maxTouchPoints) {
				cursor.style.opacity = 0;
				return;
			} else {
				cursor.style.opacity = 1;
			}

			cursor.style.transform = `translate${e.pageX - 10}px, ${e.pageY - 10}px)`;
		})
		.on('mouseleave', () => {
			cursor.style.opacity = 0;
		});

	function animateCursor(e, interacting, size = 1) {
		const x = e.pageX - 10,
			y = e.pageY - 10;

		const keyframes = {
			transform: `translate(${x}px, ${y}px) scale(${interacting ? size : 1})`,
		};

		cursor.style.backgroundColor = interacting && size != 1 ? 'white' : '';
		cursor.style.color = interacting && size != 1 ? 'black' : 'var(--main-gold)';

		cursor.animate(keyframes, { duration: moved ? 100 : 0, fill: 'forwards' });
	}
});
