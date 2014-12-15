'use strict';

import * as store from '../store';
console.log(store);

let cli = document.querySelector('tmail-cli'),
	sugestions = document.querySelector('tt-datalist');

cli.addEventListener('command', evt => {
	sugestions.data = [
		{value: 'id'},
		{value: 'name'},
		{value: 'age'},
		{value: 'sum'},
		{value: 'gender'}
	];
});

sugestions.addEventListener('select', evt => {
	if ( evt.detail.value !== undefined ) {
		cli.update(evt.detail.value.value).then(cmd => {
			console.log(cmd);
		});
	} else {
		console.log('foo');
	}
});
