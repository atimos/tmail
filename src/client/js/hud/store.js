'use strict';

import * as store from 'js/store/store';
import ResultMap from 'lib/libjs/common/resultmap';

export let sugestions = {
	result: new ResultMap(),

	clear: function() {
		this.result.clear();
	},

	search: function(type_list, query) {
		this.clear();
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

				return store_list[item.type].get(item.ref).then(result => {
					this.result.set(item.ref, {
						type: item.type,
						value: result
					});
				});
			}));
		}).then(() => {
			return this.result;
		});
	}
};

