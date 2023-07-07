window.addEventListener('load', () => {
	let underline = document.querySelector('#selectedPage');
	let links = document.querySelectorAll('header nav a');
	let selected = window.location.hash || '#home';

	updateUnderline(document.querySelector(`header nav a[href="${selected}"]`));

	[...links].forEach((link) => {
		link.addEventListener('click', () => {
			updateUnderline(link);
			selected = link.getAttribute('href');
		});
	});

	window.addEventListener('resize', () => {
		underline.style.transition = 'none';
		updateUnderline(document.querySelector(`header nav a[href="${selected}"]`));
		underline.style.transition = '';
	});

	function updateUnderline(l) {
		underline.style.left = `${l.offsetLeft}px`;
		underline.style.width = `${l.offsetWidth}px`;
	}
});
