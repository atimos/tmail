'use strict';

import get_store from './store';

get_store().then(store => {
	function fetch(name) {
		return new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();

			req.open('get', '/data/' + name + '.json');
			req.responseType = "json";

			req.addEventListener('load', result => {
				store.get(name).put(result.target.response).then(resolve, reject);
			});

			req.send();
		});
	}

	store.get('contact').count().then(count => {
		if ( count > 0 ) {
			return store.get('contact').rebuild_index();
		} else {
			return fetch('contact');
		}
	});

	store.get('command').count().then(count => {
		if ( count === 0 ) {
			return fetch('command');
		}
	});
});
