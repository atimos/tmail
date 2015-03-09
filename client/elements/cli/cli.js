'use strict';
import {get_sugestions, get_command, update_command} from './store';
//import ty from 'then-yield';

let _dl = Symbol('datalist');
var self_document = window.document.currentScript.ownerDocument;

class Cli extends window.HTMLElement {
	createdCallback() {
		this.appendChild(self_document.querySelector('template').content.cloneNode(true));
		this.children[0].addEventListener('keydown', keydown_event);
		this.children[0].addEventListener('input', input_event);
	}

	attachedCallback() {
		this[_dl] = this.nextElementSibling;
		this[_dl].addEventListener('select', update_input);
	}

	detachedCallback() {
	}

	parse(input = '', pos = 0) {
		return get_command(input, pos);
	}
}

function update_input(evt) {
	update_command(evt.explicitOriginalTarget, evt.detail.value).then();
}

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
							return {name: value.name, value: value.email};
					}
				});
		});
}

window.document.registerElement('tm-cli', {prototype: Cli.prototype});
