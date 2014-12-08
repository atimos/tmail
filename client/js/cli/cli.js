'use strict';

import * as cmd from 'js/cli/cmd';
import * as store from 'js/cli/store';
import * as view from 'js/cli/view';

console.log(cmd);

let input = document.querySelector('header menu:first-child input'),
	sugestions = input.nextElementSibling;

input.addEventListener('input', evt => {
	cmd.parse(evt.target.value, evt.target.selectionStart).then(cmd => {
		if ( cmd !== null ) {
			cmd.list.some(cmd => {
				if ( cmd.sugestions.length === 0 ) {
					return false;
				} else {
					cmd.args.some(arg => {
						if ( arg.has_cursor === true ) {
							store.get_sugestions(cmd.sugestions, arg.value).then(sugestions.set.bind(sugestions));
							return true;
						}
						return false;
					});
				}
			});
		}
	});
});

input.addEventListener('keydown', function(evt) {
	if ( evt.keyCode === 13 && sugestions.value === undefined ) {
		this.blur();
		sugestions.reset();
		cmd.parse(evt.target.value).then(cmd => { console.log(cmd); });
	}
});

sugestions.addEventListener('select', function(evt) {
	this.reset();
	cmd.update(evt.detail.target.value, evt.detail.value.email, evt.detail.target.selectionStart).then(view.update);
});
