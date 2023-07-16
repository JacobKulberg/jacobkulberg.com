function resizeAboutMe() {
	let headerHeight = $('header').outerHeight() + 5;

	$('#about-me').css('padding-top', `${headerHeight}px`);

	if ($(window).innerWidth() > $(window).innerHeight()) {
		$('#about-me-container').css('flexDirection', `row`);
		$('#about-me-container p').css('maxWidth', '50vw');
		$('#about-me-container p').css('fontSize', 'min(4.5vw, 3.75vh)');
		$('#about-me-container img').css('width', '30vw');
		$('#about-me-container img').css('maxWidth', '40vmin');
	} else {
		$('#about-me-container').css('flexDirection', `column`);
		$('#about-me-container p').css('maxWidth', '100%');
		$('#about-me-container p').css('fontSize', '');
		$('#about-me-container img').css('width', '45vw');
		$('#about-me-container img').css('maxWidth', '55vmin');
	}
}
