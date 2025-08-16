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

//* WORK/EDUCATION TOGGLE *//
$(document).ready(function () {
	let loading = false;

	const $workButton = $('#work-button');
	const $educationButton = $('#education-button');

	$workButton.on('click', enableWork);
	$('.info-box.work').on('click', enableWork);

	$educationButton.on('click', enableEducation);
	$('.info-box.education').on('click', enableEducation);

	$('#experience').css('height', $('.experience-container .work').height() + $('#experience > h2').outerHeight() + $('#experience > .work-education-toggle').outerHeight() + $('#contact-me > h2').outerHeight() + 48 + 'px');

	$(window).on('resize orientationchange', () => {
		if ($workButton.hasClass('active')) {
			$('#experience').css('height', $('.experience-container .work').height() + $('#experience > h2').outerHeight() + $('#experience > .work-education-toggle').outerHeight() + $('#contact-me > h2').outerHeight() + 48 + 'px');
		} else {
			$('#experience').css('height', $('.experience-container .education').height() + $('#experience > h2').outerHeight() + $('#experience > .work-education-toggle').outerHeight() + $('#contact-me > h2').outerHeight() + 48 + 'px');
		}
	});

	function enableWork() {
		if (!loading && !$workButton.hasClass('active')) {
			loading = true;

			$workButton.addClass('active');
			$educationButton.removeClass('active');

			$('#experience .education').addClass('invisible');

			setTimeout(() => {
				$('#experience .work').removeClass('invisible');
				loading = false;
			}, 150);

			$('#experience').css('height', $('.experience-container .work').height() + $('#experience > h2').outerHeight() + $('#experience > .work-education-toggle').outerHeight() + $('#contact-me > h2').outerHeight() + 48 + 'px');
		}
	}

	function enableEducation() {
		if (!loading && !$educationButton.hasClass('active')) {
			loading = true;

			$educationButton.addClass('active');
			$workButton.removeClass('active');

			$('#experience .work').addClass('invisible');

			setTimeout(() => {
				$('#experience .education').removeClass('invisible');
				loading = false;
			}, 150);

			$('#experience').css('height', $('.experience-container .education').height() + $('#experience > h2').outerHeight() + $('#experience > .work-education-toggle').outerHeight() + $('#contact-me > h2').outerHeight() + 48 + 'px');
		}
	}
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
		{ root: null, threshold: 0 }
	);

	observer.observe($about.get(0));
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
		{ root: null, threshold: 0.3 }
	);

	observer.observe($skillsSection.get(0));
});

//* PROJECTS SECTION ANIMATIONS *//
$(document).ready(function () {
	const $projectsSection = $('#projects');
	if ($projectsSection.length === 0) return;

	const $container = $projectsSection.find('.project-container').first();
	const $cards = $container.find('.project');
	if ($cards.length === 0) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const $el = $(entry.target);

				if (entry.isIntersecting) {
					$el.addClass('visible');
				} else {
					$el.css('transition', 'unset');
					$el.removeClass('visible');
					$el.css('transition', '');
				}
			});
		},
		{ threshold: 0 }
	);

	$cards.each(function () {
		observer.observe(this);
	});
});

//* EXPERIENCE SECTION ANIMATIONS *//
$(document).ready(function () {
	const $experience = $('#experience');
	if ($experience.length === 0) return;

	const $toggle = $experience.find('.work-education-toggle');
	const $work = $experience.find('.experience-container .work');
	const $edu = $experience.find('.experience-container .education');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					$toggle.addClass('visible');
					$work.addClass('visible');
					$edu.addClass('visible');
				} else {
					$toggle.css('transition', 'unset');
					$work.css('transition', 'unset');
					$edu.css('transition', 'unset');
					$toggle.removeClass('visible');
					$work.removeClass('visible');
					$edu.removeClass('visible');
					$toggle.css('transition', '');
					$work.css('transition', '');
					$edu.css('transition', '');
				}
			});
		},
		{ threshold: 0 }
	);

	observer.observe($experience.get(0));
});

//* CONTACT SECTION ANIMATIONS *//
$(document).ready(function () {
	const $contactSection = $('#contact-me');
	if ($contactSection.length === 0) return;

	const $contacts = $contactSection.find('.contact');
	if ($contacts.length === 0) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					$contacts.addClass('visible');
				} else {
					$contacts.each(function () {
						const $el = $(this);
						$el.css('transition', 'unset');
						$el.removeClass('visible');
						$el.css('transition', '');
					});
				}
			});
		},
		{ root: null, threshold: 0 }
	);

	observer.observe($contactSection.get(0));
});
