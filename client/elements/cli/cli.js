'use strict';

import {get_sugestions, get_command, update_input} from './store';

let _datalist = '_datalist_';

class Cli extends window.HTMLDivElement {
	createdCallback() {
		this.appendChild(this.document.querySelector('template').content.cloneNode(true));
	}

	attachedCallback() {
		this[_datalist] = this.nextElementSibling;
		this.is_attached = true;

		this.children[0].addEventListener('keydown', keydown_event.bind(this));
		this.children[0].addEventListener('input', input_event.bind(this));
	}

	detachedCallback() {
		this.children[0].removeEventListener('keydown', keydown_event.bind(this));
		this.children[0].removeEventListener('input', input_event.bind(this));
	}
}

function keydown_event(evt) {
	let cli = this;

	if ( cli[_datalist].hidden !== true ) {
		if ( evt.keyCode === 38 || ( evt.keyCode === 9 && evt.shiftKey === true ) ) {
			cli[_datalist].previous();
		} else if ( evt.keyCode === 40 || ( evt.keyCode === 9 && evt.shiftKey === false ) ) {
			cli[_datalist].next();
		} else if ( evt.keyCode === 13 ) {
			evt.preventDefault();

			let selected = cli[_datalist].select();
			if ( selected !== null ) {
				update_input(cli.children[0], selected.value).then();
			}
		}
	} else if ( evt.keyCode === 13 ) {
		get_command(cli.children[0].value, cli.children[0].selectionStart).then(cmd => {
			if ( cmd !== undefined ) {
				this.dispatchEvent(new CustomEvent('command', {
					detail: {
						value: cmd
					},
					bubbles: true,
					cancelable: true
				}));
			}
		});
	}
}

function input_event() {
	let cli = this;

	get_command(cli.children[0].value, cli.children[0].selectionStart).then(cmd => {
		if ( cmd !== undefined && cmd.cmd !== null && cmd.cmd.sugestions !== null && cmd.arg !== null ) {
			get_sugestions(cmd.cmd.sugestions, cmd.arg).then(result => {
				cli[_datalist].options = result.map(item => {
					return {
						value: item.email,
						name: item.name
					};
				});
			});
		}
	});
}

export default function(document) {
	Cli.prototype.document = document;
	window.document.registerElement('tmail-cli', {prototype: Cli.prototype});
}
