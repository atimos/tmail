'use strict';

import load_store from '../lib/libweb/db/store';

let store = null;

export default function() {
	return new Promise((resolve, reject) => {
		if ( store !== null ) {
			resolve(store);
		} else {
			load_store('tmail', 4)
				.store('command', {keyPath: 'uuid', autoIncrement: false, index: [
					{name: 'name', unique: false},
				]})
				.store('contact', {keyPath: 'uuid', autoIncrement: false, index: [
					{name: 'email', unique: false},
					{name: 'synced', unique: false}
				]})
				.store('email', {keyPath: 'uuid', autoIncrement: false, index: [
					{name: 'subject', unique: false},
					{name: 'body', unique: true},
					{name: 'from', unique: false},
					{name: 'to', unique: false},
					{name: 'cc', unique: false},
					{name: 'bcc', unique: false},
					{name: 'tags', unique: false},
					{name: 'synced', unique: false}
				]})
				.index('contact',  {ref: 'uuid', fields: [{name: 'email'}, {name: 'name'}]})
				.index('email',  {ref: 'uuid', fields: [{name: 'subject'}]})
				.then(instance => {
					store = instance;
					return store;
				})
				.then(resolve, reject);
		}
	});
}

