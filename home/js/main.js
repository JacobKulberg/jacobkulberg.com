// scroll event jquery
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

	$('#header').on('click', function () {
		window.location.href = '#';
	});
});
