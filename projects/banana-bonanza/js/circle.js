const bananaCircle = $('#banana-circle');
const bananaCircleOverlay = $('#banana-circle-overlay');
const bananaCircleCtx = bananaCircle[0].getContext('2d');
const bananaCircleOverlayCtx = bananaCircleOverlay[0].getContext('2d');
const ratio = window.devicePixelRatio || 1;

let centerX = 0,
	centerY = 0,
	angle = 0;

let banana = new Image();
banana.src = 'images/banana.png';

let circlePath = new Path2D();

bananaCircle.attr('width', $window.width() * ratio);
bananaCircle.attr('height', $window.height() * ratio);
bananaCircleOverlay.attr('width', $window.width() * ratio);
bananaCircleOverlay.attr('height', $window.height() * ratio);

drawUserLine({
	pageX: bananaCircle.width() / 2,
	pageY: 0,
});

function resizeCanvas() {
	bananaCircle.attr('width', $window.width() * ratio);
	bananaCircle.attr('height', $window.height() * ratio);
	bananaCircleOverlay.attr('width', $window.width() * ratio);
	bananaCircleOverlay.attr('height', $window.height() * ratio);

	drawCircle();
	drawCircleOverlay();
}

function drawCircle() {
	circlePath = new Path2D();

	const radius = ((Math.min(bananaCircle.width(), bananaCircle.height()) * 0.675) / 2) * ratio;
	centerX = (bananaCircle.width() / 2) * ratio;
	centerY = (bananaCircle.height() / 2) * ratio;

	// draw circle
	bananaCircleCtx.beginPath();
	circlePath.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	bananaCircleCtx.lineWidth = Math.min(bananaCircle.width(), bananaCircle.height()) * 0.005 * ratio;
	bananaCircleCtx.fillStyle = '#15408a';
	bananaCircleCtx.strokeStyle = '#000000';
	bananaCircleCtx.fill(circlePath);
	bananaCircleCtx.stroke(circlePath);

	// draw x-axis
	bananaCircleCtx.beginPath();
	circlePath.moveTo(centerX, centerY);
	circlePath.lineTo(centerX + radius, centerY);
	bananaCircleCtx.stroke(circlePath);
}

function drawCircleOverlay() {
	bananaCircleOverlayCtx.clearRect(0, 0, bananaCircle.width() * ratio, bananaCircle.height() * ratio);

	const radius = ((Math.min(bananaCircle.width(), bananaCircle.height()) * 0.675) / 2) * ratio;

	// draw user line
	bananaCircleOverlayCtx.beginPath();
	bananaCircleOverlayCtx.moveTo(centerX, centerY);
	bananaCircleOverlayCtx.lineWidth = Math.min(bananaCircle.width(), bananaCircle.height()) * 0.005 * ratio;
	bananaCircleOverlayCtx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
	bananaCircleOverlayCtx.stroke();

	// draw big arc
	bananaCircleOverlayCtx.beginPath();
	bananaCircleOverlayCtx.arc(centerX, centerY, radius, 0, angle, true);
	bananaCircleOverlayCtx.lineTo(centerX, centerY);
	bananaCircleOverlayCtx.closePath();
	bananaCircleOverlayCtx.fillStyle = '#1d55b5';
	bananaCircleOverlayCtx.fill();
	bananaCircleOverlayCtx.stroke();

	// draw small arc
	bananaCircleOverlayCtx.beginPath();
	bananaCircleOverlayCtx.arc(centerX, centerY, radius / 3, 0, angle, true);
	bananaCircleOverlayCtx.lineTo(centerX, centerY);
	bananaCircleOverlayCtx.closePath();
	bananaCircleOverlayCtx.fillStyle = '#6ea3ff';
	bananaCircleOverlayCtx.lineJoin = 'round';
	bananaCircleOverlayCtx.fill();
	bananaCircleOverlayCtx.stroke();

	// add banana
	bananaCircleOverlayCtx.save();
	bananaCircleOverlayCtx.translate(centerX, centerY);
	bananaCircleOverlayCtx.rotate(angle + Math.PI / 2);
	bananaCircleOverlayCtx.translate(-centerX, -centerY);
	bananaCircleOverlayCtx.drawImage(banana, centerX - radius / 4, centerY - radius / 4, radius / 2, radius / 2);
	bananaCircleOverlayCtx.restore();
}

function drawUserLine(e) {
	centerX = (bananaCircle.width() / 2) * ratio;
	centerY = (bananaCircle.height() / 2) * ratio;
	angle = Math.atan2(e.pageY * ratio - centerY, e.pageX * ratio - centerX);

	drawCircleOverlay();
}

$window.on('load resize', resizeCanvas);

let mousemove = (e) => {
	drawUserLine(e);
};
bananaCircle.on('mousedown', (e) => {
	if (bananaCircleCtx.isPointInPath(circlePath, e.pageX * ratio, e.pageY * ratio)) {
		drawUserLine(e);
		$window.on('mousemove', mousemove);
	}
});
$window.on('mouseup', () => {
	$window.off('mousemove', mousemove);
});

let endCoords = [];
let touchmove = (e) => {
	e.pageX = e.originalEvent.touches[0].pageX;
	e.pageY = e.originalEvent.touches[0].pageY;
	endCoords = [e.pageX, e.pageY];
	drawUserLine(e);
};
bananaCircle.on('touchstart', (e) => {
	clearInterval(reposition);

	e.pageX = e.originalEvent.touches[0].pageX;
	e.pageY = e.originalEvent.touches[0].pageY;
	endCoords = [e.pageX, e.pageY];

	if (bananaCircleCtx.isPointInPath(circlePath, e.pageX * ratio, e.pageY * ratio)) {
		drawUserLine(e);
		$window.on('touchmove', touchmove);
	}
});

let reposition = null;
$window.on('touchend', (e) => {
	reposition = setInterval(() => {
		e.pageX = endCoords[0];
		e.pageY = endCoords[1];
		drawUserLine(e);
	}, 0);

	setTimeout(() => {
		clearInterval(reposition);
	}, 50);

	$window.off('touchmove', touchmove);
});
