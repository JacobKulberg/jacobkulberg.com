//* HEADER OPACITY ON SCROLL *//
$(document).ready(function () {
	$(window).scroll(updateHeaderOpacity);
	updateHeaderOpacity();

	function updateHeaderOpacity() {
		if ($(window).scrollTop() > $('#header').height() + $('#home').height()) {
			$('#header').removeClass('invisible');
		} else {
			$('#header').addClass('invisible');
		}
	}

	$('#header .name').on('click', function () {
		window.location.href = '#';
	});
});

//* GITHUB CONTRIBUTIONS *//
$(document).ready(async function () {
	const username = 'JacobKulberg';
	const startYear = 2021;
	const today = new Date();
	const currentYear = today.getFullYear();

	// format to YYYY-MM-DD
	const pad = (num) => String(num).padStart(2, '0');
	const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

	async function fetchYearTotal(year) {
		const from = ymd(year, 1, 1);
		const to = year === currentYear ? ymd(today.getFullYear(), today.getMonth() + 1, today.getDate()) : ymd(year, 12, 31);

		const url = `https://github-contributions-api.deno.dev/${username}.json?from=${from}&to=${to}`;
		const res = await fetch(url, { headers: { Accept: 'application/json' } });
		if (!res.ok) throw new Error(`API ${year} returned ${res.status}`);
		const data = await res.json();

		return data.totalContributions;
	}

	try {
		const yearPromises = [];
		for (let i = startYear; i <= currentYear; i++) {
			yearPromises.push(fetchYearTotal(i));
		}
		const totals = await Promise.all(yearPromises);
		const grandTotal = totals.reduce((a, b) => a + b);

		$('#github-contributions').text(grandTotal.toLocaleString());
	} catch (err) {
		console.error(err);
		$('#github-contributions').text('Failed to load');
	}
});

//* SKILLS SECTION SLIDE-IN ANIMATIONS *//
$(document).ready(function () {
	const $skillsSection = $('#skills');
	if ($skillsSection.length === 0) return;

	const $groups = $skillsSection.find('.skills-group');
	if ($groups.length === 0) return;

	const $first = $groups.eq(0);
	const $second = $groups.eq(1);

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					$first.addClass('visible');
					$second.addClass('visible');
				} else {
					$first.css('transition', 'unset');
					$second.css('transition', 'unset');
					$first.removeClass('visible');
					$second.removeClass('visible');
					$first.css('transition', '');
					$second.css('transition', '');
				}
			});
		},
		{ root: null, threshold: 0.1 }
	);

	observer.observe($skillsSection.get(0));
});

//* ABOUT ME SECTION ANIMATIONS *//
$(document).ready(function () {
	const $about = $('#about-me');
	if ($about.length === 0) return;

	const $headshot = $about.find('.headshot-container img');
	const $para = $about.find('.main-content-container > .p');
	const $infoLinks = $about.find('.info-boxes > a');

	if ($headshot.length) $headshot.addClass('animate');
	if ($para.length) $para.addClass('animate');
	$infoLinks.each(function () {
		const $box = $(this).find('.info-box');
		if ($box.length) $box.addClass('animate');
	});

	const reveal = () => {
		if ($headshot.length) $headshot.addClass('visible');
		if ($para.length) $para.addClass('visible');

		$infoLinks.each(function (i) {
			const $box = $(this).find('.info-box');
			if (!$box.length) return;
			setTimeout(() => $box.addClass('visible'), i * 120);
		});
	};

	const hide = () => {
		[$headshot, $para].forEach(($el) => {
			if (!$el || !$el.length) return;

			$el.css('transition', 'unset');
			$el.removeClass('visible');
			$el.css('transition', '');
		});
		$infoLinks.each(function () {
			const $box = $(this).find('.info-box');
			if (!$box.length) return;

			$box.css('transition', 'unset');
			$box.removeClass('visible');
			$box.css('transition', '');
		});
	};

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					reveal();
				} else {
					hide();
				}
			});
		},
		{ root: null, threshold: 0.1 }
	);

	observer.observe($about.get(0));
});

//* PROJECTS SECTION ANIMATIONS *//
$(document).ready(function () {
	const $projectsSection = $('#projects');
	if ($projectsSection.length === 0) return;

	const $container = $projectsSection.find('.project-container').first();
	const $cards = $container.find('.project');
	if ($cards.length === 0) return;

	function getCols() {
		let cols = 2;
		const el = $container.get(0);
		if (!el) return cols;
		const style = getComputedStyle(el);
		const template = style.getPropertyValue('grid-template-columns');
		if (template) {
			const count = template.split(' ').filter((t) => t.trim().length).length;
			if (count > 0) cols = count;
		}
		return cols;
	}

	let cols = getCols();
	$(window).on('resize', () => {
		cols = getCols();
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const $el = $(entry.target);
				const i = $cards.index($el);
				const row = Math.floor(i / cols);
				const col = i % cols;
				const delay = (row + col) * 120;

				if (entry.isIntersecting) {
					setTimeout(() => $el.addClass('visible'), delay);
				} else {
					$el.css('transition', 'unset');
					$el.removeClass('visible');
					$el.css('transition', '');
				}
			});
		},
		{ threshold: 0.1 }
	);

	$cards.each(function () {
		observer.observe(this);
	});
});
