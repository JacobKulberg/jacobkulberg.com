let id;

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', function (e) {
		clearTimeout(id);

		e.preventDefault();

		document.querySelector(this.getAttribute('href')).scrollIntoView({
			behavior: 'smooth',
		});

		document.querySelectorAll('a[href^="#"]').forEach((anch) => {
			document.querySelector(anch.getAttribute('href')).classList.remove('selectedAnchor');
		});
		document.querySelector(this.getAttribute('href')).classList.add('selectedAnchor');
		id = setTimeout(() => {
			document.querySelector(this.getAttribute('href')).classList.remove('selectedAnchor');
		}, 1000);
	});
});

let topButton = document.getElementById('go-to-top');

window.onscroll = () => {
	scrollFunction();
};

function scrollFunction() {
	if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
		topButton.style.display = 'block';
	} else {
		topButton.style.display = 'none';
	}
}

function goToTop() {
	document.querySelector('header').scrollIntoView({
		behavior: 'smooth',
	});
}
