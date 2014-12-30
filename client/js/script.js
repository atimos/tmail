'use strict';

import './sync';

let cli = document.querySelector('tm-cli');
let email = document.querySelector('tm-email');

email = {clear: () => {}};

cli.addEventListener('command', evt => {
	let command = evt.detail.value;

	switch ( command.name ) {
		case 'write':
			email.clear();

			command.list.forEach(command => {
				if ( command.name === 'subject' ) {
					email[command.name] = command.args[0].value;
				} else {
					email[command.name] = command.args.map(arg => {
						return arg.value;
					});
				}
			});
	}

	console.log(email);
});
