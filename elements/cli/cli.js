'use strict';
import parse from './command';

parse('w to alex@timot.se subject moegel', 18);

let _dl = Symbol('datalist'),
	self_document = window.document.currentScript.ownerDocument;

class Cli extends window.HTMLInputElement {
	createdCallback() {
	}

	attachedCallback() {
	}

	detachedCallback() {
	}

	command() {
		return parse(this.children[0].value, this.children[0].selectionStart);
	}
}
/*
function keydown_event(evt) {
	let dl = evt.target.parentNode[_dl],
		key = evt.keyCode;

	if ( dl !== undefined && ( key === 38 || key === 40 || key === 9 || ( ( key === 13 || key === 27 ) && dl.options.length > 0 ) ) ) {
		evt.preventDefault();
		dl.dispatchEvent(new window.KeyboardEvent('keydown', {
			bubbles : evt.bubbles,
			cancelable : evt.cancelable,
			key: evt.key,
			code: evt.code,
			location: evt.location,
			ctrlKey: evt.ctrlKey,
			shiftKey: evt.shiftKey,
			altKey: evt.altKey,
			metaKey: evt.metaKey,
			repeat: evt.repeat,
			isComposing: evt.isComposing,
			charCode: evt.charCode,
			keyCode: evt.keyCode,
			which: evt.which
		}));
	} else if ( key === 13 ) {
		evt.target.parentNode.parse(evt.target.value, evt.target.selectionStart)
			.then(command => {
				console.log(command);
				if ( command.size > 0 ) {
					evt.target.value = '';

					let [name, args] = command.entries().next().value;
					evt.target.parentNode.dispatchEvent(new CustomEvent('command', {detail:{name: name, args: args}}));
				}
			});
	}
}

function input_event(evt) {
	get_sugestions(evt.target)
		.then(sugestions => {
			evt.target.parentNode[_dl].options = sugestions
				.map(item => {
					let { type: type, value: value } = item;

					switch ( type ) {
						case 'contact':
							return value;
					}
				});
		});
}
*/

window.document.registerElement('tm-cli', {prototype: Cli.prototype});
