window.addEventListener('load', () => {
	let links = document.querySelectorAll('header nav a');
	let pages = document.getElementsByClassName('page');

	let underline = document.querySelector('#selectedPage');

	let selected = window.location.hash || '#home';

	selectPage(document.querySelector(`header nav a[href="${selected}"]`));

	[...links].forEach((link) => {
		link.addEventListener('click', () => {
			selectPage(link);
			selected = link.getAttribute('href');
		});
	});

	window.addEventListener('resize', () => {
		underline.style.transition = 'none';
		selectPage(document.querySelector(`header nav a[href="${selected}"]`));
		underline.style.transition = '';
	});

	function selectPage(link) {
		underline.style.left = `${link.offsetLeft}px`;
		underline.style.width = `${link.offsetWidth}px`;

		[...pages].forEach((page) => {
			page.style.display = 'none';
		});
		document.getElementById(link.getAttribute('href').substring(1)).style.display = '';
	}
});
