'use strict';

import get_store from './store';

get_store().then(store => {
	function fetch(name) {
		return new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();

			req.open('get', '/data/' + name + '.json');
			req.responseType = "json";

			req.addEventListener('load', result => {
				store(name, 'readwrite').then(store => {
					store.put(result.target.response).then(resolve, reject);
				});
			});

			req.send();
		});
	}

	/*
	store(['contact', 'command']).then(store_map => {
		for ( let entry of store_map.entries() ) {
			let [name, store] = entry;

			store.range().count().then(count => {
				if ( count === 0 ) {
					fetch(name).then(() => {
						console.log(name + ' done');
					});
				}
			});
		}
	});
	setTimeout(() => {
		store('command').then(store => {
			store.search('write').then(result => {
				console.log(result.limit(1).toArray());
			});
		}, err => {
			console.log(err);
		});
	}, 5000);
   */
});
