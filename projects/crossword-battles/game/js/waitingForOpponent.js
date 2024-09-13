// update text
let increment = 0;

$('.waiting-for-opponent-code').text('Game code: ' + window.location.hash.slice(1, 5));

setInterval(() => {
	$('.waiting-for-opponent:not(.opponent-found)').text('Waiting for opponent' + '.'.repeat(increment));
	increment = (increment + 1) % 4;
}, 400);
