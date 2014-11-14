'use strict';

import * as store from 'js/cmd/store';

let input_node = document.querySelector('header menu:first-child input'),
	fn_list = {command: []};

export function addEventListener(type, fn) {
	if ( fn_list[type] === undefined ) {
		fn_list[type] = [];
	}
	fn_list[type].push(fn);
}

input_node.addEventListener('keypress', function(evt) {
	let cmd, input = evt.target.value;

	if ( evt.keyCode >= 37 && evt.keyCode <= 39 ) { return; }

	if ( evt.keyCode === 8 ) {
		input = input.slice(0, evt.target.selectionStart -1) + input.slice(evt.target.selectionStart);
	} else if ( evt.keyCode === 0 ) {
		input = input.slice(0, evt.target.selectionStart) + String.fromCharCode(evt.which) + input.slice(evt.target.selectionStart);
	}

	cmd = store.parse(input);

	if ( cmd !== null ) {
		let return_data = {
			shift: evt.shiftKey,
			enter: (evt.keyCode === 13),
			tab: (evt.keyCode === 9),
			keyDown: (evt.keyCode === 9),
			evt: evt,
			type: 'command',
			target: cmd
		};

		fn_list.command.forEach(fn => {
			fn.call(this, return_data);
		});
	}
});
