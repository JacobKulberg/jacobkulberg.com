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
	color: '#538d4e', // lettle green
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

$('.link div')
	.on('touchstart', (e) => {
		let end = $(e.currentTarget).one('touchend', () => {
			window.location = $(e.currentTarget).attr('value');
		});

		$(e.currentTarget).one('touchmove', () => {
			end.off('touchend');
		});
	})
	.on('click', (e) => {
		if (!('ontouchstart' in window || navigator.maxTouchPoints || navigator.msMaxTouchPoints)) {
			window.location = $(e.currentTarget).attr('value');
		}
	});

$('.project-container').on('touchstart', (e) => {
	let end = $(e.currentTarget).one('touchend', () => {
		if (!$(e.currentTarget).hasClass('clicked')) {
			setTimeout(() => {
				$(e.currentTarget).addClass('clicked');
			}, 0);
		}
	});

	$(e.currentTarget).one('touchmove', () => {
		end.off('touchend');
	});
});

$(window).on('touchstart', () => {
	let end = $(window).one('touchend', () => {
		$('.project-container').removeClass('clicked');
	});

	$(window).one('touchmove', () => {
		end.off('touchend');
	});
});
