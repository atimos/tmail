'use strict';

import {get_instance as get_db_instance} from './store';

let active = true;

function fetch(name) {
	return new Promise((resolve, reject) => {
		if ( active === true ) {
			let contact_req = new XMLHttpRequest();

			contact_req.open('get', '/data/' + name + '.json');
			contact_req.responseType = "json";

			contact_req.addEventListener('load', result => {
				add_items(name, result.target.response).then(resolve, reject);
			});

			contact_req.send();
		}
	});
}

function add_items(name, value_list) {
	return get_db_instance().then(db => {
		return db.store(name).put(value_list);
	});
}

/*
fetch('command').then();
console.time('sync command');
fetch('command').then(() => {
	console.timeEnd('sync command');
}, err => {
	console.log(err);
	console.timeEnd('sync command');
});
*/
