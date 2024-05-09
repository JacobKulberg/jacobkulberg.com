// Lettle Cube

let lettle = new Zdog.Illustration({
	element: '#lettle',
});

let lettleCube = new Zdog.Box({
	addTo: lettle,
	width: 250,
	height: 250,
	depth: 250,
	stroke: 15,
	fill: true,
	color: $(':root').css('--lettle-green'),
	rotate: { x: Zdog.TAU / 72 },
});

// Front L
new Zdog.Box({
	addTo: lettleCube,
	width: 30,
	height: 125,
	depth: 15,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: -30, z: 180 },
});

new Zdog.Box({
	addTo: lettleCube,
	width: 75,
	height: 25,
	depth: 15,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: 8, y: 50, z: 180 },
});

// Back L
new Zdog.Box({
	addTo: lettleCube,
	width: 30,
	height: 125,
	depth: 15,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: 30, z: -180 },
});

new Zdog.Box({
	addTo: lettleCube,
	width: 75,
	height: 25,
	depth: 15,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: 8, y: 50, z: -180 },
});

// Left L
new Zdog.Box({
	addTo: lettleCube,
	width: 15,
	height: 125,
	depth: 30,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: -180, z: -30 },
});

new Zdog.Box({
	addTo: lettleCube,
	width: 15,
	height: 25,
	depth: 75,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: -180, y: 50, z: 8 },
});

// Right L
new Zdog.Box({
	addTo: lettleCube,
	width: 15,
	height: 125,
	depth: 30,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: 180, z: 30 },
});

new Zdog.Box({
	addTo: lettleCube,
	width: 15,
	height: 25,
	depth: 75,
	stroke: 20,
	fill: true,
	color: 'white',
	translate: { x: 180, y: 50, z: 8 },
});

lettle.updateRenderGraph();

function animateLettle() {
	lettle.rotate.y += 0.005;
	lettle.updateRenderGraph();
	requestAnimationFrame(animateLettle);
}

animateLettle();

// Banana Bonanza Monkeys

let monkeyImages = ['crying_monkey.svg', 'dead_monkey.svg', 'excited_monkey.svg', 'goofy_monkey.svg', 'sad_monkey.svg', 'winking_monkey.svg'];

function changeMonkeyImage() {
	$('#banana-bonanza').addClass('animating');

	let monkeyImage = monkeyImages[Math.floor(Math.random() * monkeyImages.length)];

	// add current to pool
	if ($('#banana-bonanza').attr('src')) {
		let currentImage = $('#banana-bonanza').attr('src').split('/').pop();
		monkeyImages.push(currentImage);
	}

	// remove new from pool
	monkeyImages.splice(monkeyImages.indexOf(monkeyImage), 1);

	$('#banana-bonanza').animate({ opacity: 0 }, 250, function () {
		$(this)
			.attr('src', `projects/banana-bonanza/images/${monkeyImage}`)
			.on('load', function () {
				$(this).css('opacity', 0).animate({ opacity: 1 }, 250);
				setTimeout(() => {
					$('#banana-bonanza').removeClass('animating');
				}, 250);
			});
	});
}

$('.project-container:has(#banana-bonanza)').on('mouseenter', () => {
	if (!$('#banana-bonanza').hasClass('animating')) {
		changeMonkeyImage();
	}
});

$('.link div')
	.on('touchstart', (e) => {
		$(e.currentTarget).parents('.link').addClass('clicked');

		let end = $(e.currentTarget).one('touchend', () => {
			window.location = $(e.currentTarget).attr('value');
		});

		$(window).one('touchmove visibilitychange blur', () => {
			$('.link').removeClass('clicked');
			end.off('touchend');
		});
	})
	.on('mousedown', (e) => {
		if (e.which != 1) return;

		let end = $(e.currentTarget).one('mouseup', (ev) => {
			if (ev.which != 1) return;

			window.location = $(e.currentTarget).attr('value');
		});

		$(window).one('mouseup visibilitychange blur', (ev) => {
			if (ev.which != 1) return;

			end.off('mouseup');
		});
	});

$('.project-container').on('touchstart', (e) => {
	let end = $(e.currentTarget).one('touchend', () => {
		if (!$(e.currentTarget).hasClass('clicked')) {
			setTimeout(() => {
				$(e.currentTarget).addClass('clicked');

				if ($('.project-container:has(#banana-bonanza)').hasClass('clicked')) {
					if ($('#banana-bonanza').hasClass('animating')) return;
					changeMonkeyImage();
				}
			}, 0);
		}
	});

	$(e.currentTarget).one('touchmove', () => {
		end.off('touchend');
	});
});

$(window).on('touchstart', (e) => {
	if ($(e.target).parents('.link').length) return;
	$('.link').removeClass('clicked');

	let end = $(window).one('touchend', () => {
		$('.project-container').removeClass('clicked');
	});

	$(window).one('touchmove', () => {
		end.off('touchend');
	});
});

$('.project a').on('touchstart', (e) => {
	e.stopPropagation();
});
