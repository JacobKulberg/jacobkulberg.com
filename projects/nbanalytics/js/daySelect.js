let searchParams = new URLSearchParams(window.location.search);
let date = searchParams.get('date');

if (!date || !moment(date, 'YYYYMMDD', true).isValid()) {
	date = moment().format('YYYYMMDD');
	history.pushState(null, null, `?date=${date}`);
	$(`div[value="${date}"]`).attr('selected', true);
}

$(window).on('load', () => {
	$('.day').css('transition', 'unset');
	setTimeout(() => {
		$(`.day[value="${date}"]`).attr('selected', true);
		setTimeout(() => {
			$('.day').css('transition', '');
		}, 10);
	}, 0);

	setTimeout(() => {
		$('.day-selector').css('transition', 'transform 750ms ease');
	}, 0);
});

$('.custom-date').val(moment(date).format('YYYY-MM-DD'));

const daySelect = $('.day-selector');

setDaySelector(date);
centerDay($(`.day[value="${date}"]`));

function setDaySelector(currentDay) {
	for (let i = -30; i < 30; i++) {
		const day = moment(currentDay).add(i, 'days');

		const dateEl = $(`<div value="${day.format('YYYYMMDD')}"><div class="day-date">${day.format('MMM Do')}</div></div>`);
		$(dateEl).addClass('day');

		if (day.format('YYYYMMDD') === searchParams.get('date')) {
			$(dateEl).attr('selected', true);
		}

		if (day.format('YYYYMMDD') === moment().format('YYYYMMDD')) {
			$(dateEl).find('.day-date').text('Today');
			$(dateEl).find('.day-date').addClass('day-today');
		}

		if (day.format('YYYY') !== moment().format('YYYY')) {
			let year = $(`<div class="day-year">${day.format('YYYY')}</div>`);
			$(dateEl).append(year);
		}

		$(daySelect).append(dateEl);

		$(dateEl).on('mousedown touchstart', (e) => {
			changeDay(e, dateEl);
		});
	}
}

function centerDay(currentDay) {
	let childLeft = $(currentDay).position().left;
	let childWidth = $(currentDay).outerWidth();
	let parentWidth = $($('.day-selector')).outerWidth() / 10;
	$(daySelect).css('transform', `translateX(${-(childLeft - parentWidth / 2 + childWidth / 2)}px)`);

	for (let i = -30; i < 30; i++) {
		const day = moment(date).add(i, 'days').format('YYYYMMDD');
		if (!$(`.day[value="${day}"]`).length) {
			let dateEl, addedDayEl;
			if (date < day) {
				dateEl = $(`<div value="${day}" class="day"><div class="day-date">${moment(day).format('MMM Do')}</div></div>`);

				let prevDay = moment($(daySelect).find('>:first-child').attr('value')).subtract(1, 'days').format('YYYYMMDD');
				addedDayEl = $(`<div value="${prevDay}" class="day"><div class="day-date">${moment(prevDay).format('MMM Do')}</div></div>`);

				$(daySelect).append(dateEl).prepend(addedDayEl);
			} else {
				dateEl = $(`<div value="${day}" class="day"><div class="day-date">${moment(day).format('MMM Do')}</div></div>`);

				let nextDay = moment($(daySelect).find('>:last-child').attr('value')).add(1, 'days').format('YYYYMMDD');
				addedDayEl = $(`<div value="${nextDay}" class="day"><div class="day-date">${moment(nextDay).format('MMM Do')}</div></div>`);

				$(daySelect).prepend(dateEl).append(addedDayEl);
			}

			if (day === moment().format('YYYYMMDD')) {
				$(dateEl).find('.day-date').text('Today');
				$(dateEl).find('.day-date').addClass('day-today');
			}

			if (dateEl.attr('value').substring(0, 4) !== moment().format('YYYY')) {
				let year = $(`<div class="day-year">${dateEl.attr('value').substring(0, 4)}</div>`);
				$(dateEl).append(year);
			}
			if (addedDayEl.attr('value').substring(0, 4) !== moment().format('YYYY')) {
				let year = $(`<div class="day-year">${addedDayEl.attr('value').substring(0, 4)}</div>`);
				$(addedDayEl).append(year);
			}

			$(dateEl).on('mousedown touchstart', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (e.which && e.which !== 1) return;

				if ($(this).attr('selected')) return;

				$('.day').removeAttr('selected');
				$(this).attr('selected', true);

				$('body').css('pointer-events', 'none');

				date = $(this).attr('value');
				history.pushState(null, null, `?date=${date}`);

				$('.custom-date').val(moment(dateEl.attr('value')).format('YYYY-MM-DD'));
				centerDay(dateEl);

				$('.games').css('opacity', 0);
				setTimeout(async () => {
					$('.games').empty();
					await createGames();

					window.scrollTo(0, 0);

					adjustTextSizes();
					let intervalID = setInterval(() => {
						adjustTextSizes();
					}, 100);

					setTimeout(() => {
						clearInterval(intervalID);
					}, 500);
				}, 300);
			});

			$(addedDayEl).on('mousedown touchstart', function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (e.which && e.which !== 1) return;

				if ($(this).attr('selected')) return;

				$('.day').removeAttr('selected');
				$(this).attr('selected', true);

				$('body').css('pointer-events', 'none');

				date = $(this).attr('value');
				history.pushState(null, null, `?date=${date}`);

				$('.custom-date').val(moment(addedDayEl.attr('value')).format('YYYY-MM-DD'));
				centerDay(addedDayEl);

				$('.games').css('opacity', 0);
				setTimeout(async () => {
					$('.games').empty();
					await createGames();

					window.scrollTo(0, 0);

					adjustTextSizes();
					let intervalID = setInterval(() => {
						adjustTextSizes();
					}, 100);

					setTimeout(() => {
						clearInterval(intervalID);
					}, 500);
				}, 300);
			});
		}
	}
}

function changeDay(e, dateEl) {
	e.preventDefault();
	e.stopPropagation();
	if (e.which && e.which !== 1) return;

	if ($(dateEl).attr('selected')) return;

	$('.day').removeAttr('selected');
	$(dateEl).attr('selected', true);

	$('body').css('pointer-events', 'none');

	date = $(dateEl).attr('value');
	history.pushState(null, null, `?date=${date}`);

	$('.custom-date').val(moment(dateEl.attr('value')).format('YYYY-MM-DD'));
	centerDay(dateEl);

	$('.games').css('opacity', 0);
	$('body').css('min-height', `${$('body').outerHeight(true)}px`);
	setTimeout(async () => {
		$('.games').empty();
		await createGames();
		$('body').css('min-height', '');

		window.scrollTo(0, 0);

		adjustTextSizes();
		let intervalID = setInterval(() => {
			adjustTextSizes();
		}, 100);

		setTimeout(() => {
			clearInterval(intervalID);
		}, 500);
	}, 300);
}

$('.custom-date').on('mousedown touchstart', function (e) {
	if (window.navigator.maxTouchPoints) return;
	e.preventDefault();
});

$('.custom-date').on('change', function () {
	window.location.href = `?date=${moment($(this).val()).format('YYYYMMDD')}`;
});

$('body').on('click', function (e) {
	// if they clicked .custom-date
	if ($(e.target).closest('.custom-date').length) {
		$('.custom-date').toggleClass('deactive');
		return;
	}
	$('.custom-date').removeClass('deactive');
});

$(window)
	.on('resize', () => {
		$('.day-selector').css('transition', 'unset');
		centerDay($(`.day[value="${date}"]`));
		setTimeout(() => {
			$('.day-selector').css('transition', 'transform 750ms ease');
		}, 0);
	})
	.on('popstate hashchange', (e) => {
		searchParams = new URLSearchParams(window.location.search);
		let d = searchParams.get('date');
		if (d && d !== 'undefined') {
			changeDay(e, $(`.day[value="${d}"]`));
		} else {
			location.reload();
		}
	});

export { date };
