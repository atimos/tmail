'use strict';
import parse from './command';

let _sugestions = Symbol('sugestions'),
	_timeout = Symbol('timeout'),
	self_document = window.document.currentScript.ownerDocument;

class Cli extends window.HTMLInputElement {
	createdCallback() {
		this.appendChild(self_document.querySelector('template').content.cloneNode(true));
	}

	attachedCallback() {
		this[_sugestions] = this.nextElementSibling;
		this[_sugestions].addEventListener('select', select);
		this.firstElementChild.addEventListener('input', input);
		this.firstElementChild.addEventListener('keydown', key_press);
	}

	detachedCallback() {
		this[_sugestions].removeEventListener('select', select);
		this.firstElementChild.removeEventListener('input', input);
		this.firstElementChild.removeEventListener('keyup', key_press);
	}

	command() {
		return parse(this.children[0].value, this.children[0].selectionStart);
	}
}

function select(evt) {
	let input = evt.explicitOriginalTarget,
		cli = input.parentNode;

	cli.command()
		.then(command => {
			if (command !== null ) {
				let caret;

				switch ( evt.detail.tpl ) {
					case 'contact':
						command.focused_value = evt.detail.value.email;
						break;
				}

				caret = command.caret;

				input.value = command;
				input.setSelectionRange(caret, caret);
			}
		});

}

function input(evt) {
	let cli = evt.target.parentNode;

	clearTimeout(cli[_timeout]);

	cli[_timeout] = setTimeout(() => {
		parse(evt.target.value, evt.target.selectionStart)
			.then(command => {
				if ( command !== null ) {
					command.get_sugestions().then(result => {
						cli[_sugestions].options = result
							.map(item => {
								return {
									value: {name: item.name},
									options: item.email.map(email => {
										return {email: email, tpl: item.type};
									})
								};
							}).toArray();
					});
				}
			});
	}, 300);
}

function key_press(evt) {
	let cli = evt.target.parentNode,
		sugestions = cli[_sugestions];

	if ( ['Tab', 'ArrowUp', 'ArrowDown', 'Escape'].indexOf(evt.key) !== -1 || ( evt.keyCode === 9 && evt.shiftKey ) || ( evt.key === 'Enter' && sugestions.value !== undefined ) ) {
		evt.preventDefault();
		sugestions.dispatchEvent(new window.KeyboardEvent('keydown', {
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
	} else if ( evt.key === 'Enter' ) {
		cli.command()
			.then(command => {
				if ( command !== null ) {
					cli.dispatchEvent(new CustomEvent('command', {detail:command}));
				}
			});
	}
}

window.document.registerElement('tm-cli', {prototype: Cli.prototype});
