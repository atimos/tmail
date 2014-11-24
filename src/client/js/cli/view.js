'use strict';

let input = document.querySelector('header menu:first-child input'),
	sugestions = input.nextElementSibling,
	sugestion_item = sugestions.querySelector('template');

export function update(cmd) {
	let value = cmd_to_string(cmd);

	input.value = value[0];
	input.selectionStart = value[1];
	input.selectionEnd = value[1];
}

function cmd_to_string(cmd) {
	let cursor = 0, cursor_found = false, string;

	cursor += cmd.name.length;

	string = cmd.name + ' ' + cmd.list.map((item, index) => {
		if ( cursor_found === false ) {
			cursor += item.name.length + 2;
		}

		return item.name + ' ' + item.args.map((arg, index, args) => {
			if ( cursor_found === false ) {
				cursor += arg.value.length;

				if ( index < args.length - 1 ) {
					cursor += 2;
				}
			}

			if ( arg.has_cursor ) {
				cursor_found = true;
			}

			return arg.value;
		}).join(', ');
	}).join(' ');
	return [string, cursor];
}

sugestions.addEventListener('render_item', function(evt) {
	evt.detail.node = sugestion_item.content.cloneNode(true).firstElementChild;
	evt.detail.node.children[0].textContent = evt.detail.item.email;
	evt.detail.node.children[1].textContent = evt.detail.item.name;
});
