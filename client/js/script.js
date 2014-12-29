'use strict';

import './sync';

document.querySelector('tmail-cli').addEventListener('command', evt => {
	console.log(evt.detail);
});
