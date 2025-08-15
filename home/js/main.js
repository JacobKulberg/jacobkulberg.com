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
})();
