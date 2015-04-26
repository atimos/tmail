'use strict';

import get_store from './store';

get_store().then(store => {
	function fetch(name) {
		return new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();

			req.open('get', '/data/' + name + '.json');
			req.responseType = "json";

			req.addEventListener('load', result => {
				store.get(name, 'readwrite').put(result.target.response).then(resolve, reject);
			});

			req.send();
		});
	}

	store.raw_db.get(['command', 'contact'])
		.then(store => {
			let work_queue = [];

			for ( let entry of store.entries() ) {
				let [name, store] = entry;

				work_queue.push(store.range().count()
					.then(result => {
						if ( result === 0 ) {
							return fetch(name);
						}
					}));
			}
			return Promise.all(work_queue);
		});
});
