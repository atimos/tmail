'use strict';

import load_store from '../lib/libweb/db/store';

let store;

export default function() {
	if ( store !== undefined ) {
		return Promise.resolve(store);
	} else {
		return load_store('tmail', 'idx', 2)
			.store('command', {key: 'uuid', index: [
				{name: 'name', unique: false},
			]})
			.store('contact', {key: 'uuid', key_gen: 'uuid', index: [
				{name: 'email', unique: false, multiEntry: true},
				{name: 'alias', unique: false, multiEntry: true},
				{name: 'synced', unique: false}
			]})
			.store('email', {keyPath: 'uuid', index: [
				{name: 'subject', unique: false},
				{name: 'body', unique: true},
				{name: 'from', unique: false},
				{name: 'to', unique: false},
				{name: 'cc', unique: false},
				{name: 'bcc', unique: false},
				{name: 'tags', unique: false},
				{name: 'synced', unique: false}
			]})
			.store('idx', {key: 'name'})
			.index('command',  {ref: 'uuid', fields: [{name: 'name'}], store: 'command'})
			.index('contact',  {ref: 'uuid', fields: [{name: 'email'}, {name: 'name'}], store: 'contact'})
			.index('email',  {ref: 'uuid', fields: [{name: 'subject'}], store: 'email'})
			.then(instance => {
				return store = instance;
			});
	}
}
