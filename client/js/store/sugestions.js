'use strict';

import * as store from '../store';

export function get_sugestions(type_list, query) {
	return store.db.transaction(type_list.map(type => {
		return {
			name: type
		};
	})).then(store_list => {
		return Promise.all(type_list.reduce((result, type) => {
			return result.concat(store.index[type].search(query).map(item => {
				item.type = type;
				return item;
			}));
		}, []).sort((a, b) => {
			if ( a.score < b.score ) {
				return 1;
			} else if ( a.score > b.score ) {
				return -1;
			} else {
				return 0;
			}
		}).slice(0, 10).map(item => {
			if ( !window.isNaN(item.ref) ) {
				item.ref = parseInt(item.ref, 10);
			}
			return store_list[item.type].get(item.ref);
		}));
	});
}
