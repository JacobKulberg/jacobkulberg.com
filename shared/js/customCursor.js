$(window).on('load', () => {
	let cursor = document.createElement('div');
	cursor.classList.add('cursor');

	let icon = document.createElement('i');
	icon.setAttribute('id', 'cursor-icon');
	icon.classList.add('fa-solid');
	icon.classList.add('fa-arrow-up-right-from-square');

	cursor.append(icon);
	$('body').append(cursor);

	window.onmousemove = (e) => {
		let interactable = e.target.closest('.cursor-interactable'),
			interacting = interactable !== null;

		animateCursor(e, interacting);

		cursor.dataset.type = interacting ? 'interactable' : '';
	};

	function animateCursor(e, interacting) {
		const x = e.pageX - 10,
			y = e.pageY - 10;

		const keyframes = {
			transform: `translate(${x}px, ${y}px) scale(${interacting ? 5 : 1})`,
		};

		cursor.style.backgroundColor = interacting ? 'white' : '';

		cursor.animate(keyframes, { duration: 300, fill: 'forwards' });
	}
});
