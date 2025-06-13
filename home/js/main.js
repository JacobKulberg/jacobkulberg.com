// scroll event jquery
$(document).ready(function () {
	$(window).scroll(updateHeaderOpacity);
	updateHeaderOpacity();

	function updateHeaderOpacity() {
		if ($(window).scrollTop() > 0) {
			$('#header').css('opacity', 1);
		} else {
			$('#header').css('opacity', 0);
		}
	}
});
