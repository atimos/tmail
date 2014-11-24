'use strict';

import * as store from 'js/store/store';

let active = true;

function contacts() {
	if ( active === true ) {
		let contact_req = new XMLHttpRequest();

		contact_req.open('get', '/js/store/data/contacts.json');
		contact_req.responseType = "json";

		contact_req.addEventListener('load', result => {
			result.target.response.unshift({
				email: 'alex@timot.se',
				name: 'Alexander Seppälä'
			});

			add_items('contact', result.target.response);
		});

		contact_req.send();
	}
}

function email() {
	if ( active === true ) {
		add_items('email', [
			{
				id: 1,
				subject: 'Fooo alex'
			}
		]);
	}
}

function add_items(store_name, values) {
	return store.db.store(store_name).put(values).then(result => {
		for ( let item of result.values() ) {
			store.index[store_name].update(item);
		}
	}).then(() => {
		console.log('done');
	});
}

contacts();
email();
