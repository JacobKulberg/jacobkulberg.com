const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const DEBUG = false;

const originalConsoleLog = console.log;
console.log = function (...args) {
	if (DEBUG) {
		originalConsoleLog.apply(console, args);
	}
};

function errorModal(msg) {
	let modal = $(document.createElement('div'));
	modal.addClass('modal');

	let modalContent = $(document.createElement('div'));
	modalContent.addClass('modal-content');

	let modalHeader = $(document.createElement('div'));
	modalHeader.addClass('modal-header');
	modalHeader.text('Error');

	let modalBody = $(document.createElement('div'));
	modalBody.addClass('modal-body');
	modalBody.text(msg);

	let modalFooter = $(document.createElement('div'));
	modalFooter.addClass('modal-footer');

	let closeButton = $(document.createElement('button'));
	closeButton.addClass('btn btn-primary');
	closeButton.text('Close');
	closeButton.click(() => {
		modal.css('opacity', '0');
		modal.css('pointer-events', 'none');
		setTimeout(() => {
			modal.remove();
		}, 500);
	});

	modalFooter.append(closeButton);
	modalContent.append(modalHeader);
	modalContent.append(modalBody);
	modalContent.append(modalFooter);
	modal.append(modalContent);
	$('body').append(modal);

	setTimeout(() => {
		modal.css('opacity', '1');
	}, 100);
}
