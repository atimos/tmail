'use strict';

import * as parser from 'js/cmd/parser';
import * as store from 'js/cmd/store';
import * as view from 'js/cmd/view';

let input = document.querySelector('header menu:first-child input'),
	sugestions = input.nextElementSibling;

input.addEventListener('input', evt => {
	parser.parse(evt.target.value, evt.target.selectionStart).then(cmd => {
		if ( cmd !== null ) {
			cmd.list.some(cmd => {
				if ( cmd.sugestions.length === 0 ) {
					return false;
				} else {
					cmd.args.some(arg => {
						if ( arg.has_cursor === true ) {
							store.get_sugestions(cmd.sugestions, arg.value).then(sugestions.set_list.bind(sugestions));
							return true;
						}
						return false;
					});
				}
			});
		}
	});
});

input.addEventListener('keydown', evt => {
	if ( evt.keyCode === 13 && sugestions.value === undefined ) {
		parser.parse(evt.target.value).then(cmd => { console.log(cmd); });
	}
});

sugestions.addEventListener('select', function(evt) {
	this.reset();
	parser.update(evt.detail.target.value, evt.detail.value.email, evt.detail.target.selectionStart).then(view.update);
});
