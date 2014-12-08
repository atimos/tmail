'use strict';

import store from 'lib/libweb/db/store';
import lunr from 'js/lunr.min';

let cfg = {
	name: 'store',
	version: 1,
	stores: [
		{name: 'contact', options: {keyPath: 'email'}, index: [{name: 'synced', unique: false}], fulltext: ['email', 'name']},
		{name: 'email', options: {keyPath: 'id', autoIncrement: true}, fulltext: ['subject'], index: [
			{name: 'subject', unique: true},
			{name: 'body', unique: true},
			{name: 'from', unique: false},
			{name: 'to', unique: false},
			{name: 'cc', unique: false},
			{name: 'bcc', unique: false},
			{name: 'tags', unique: false},
			{name: 'synced', unique: false}
		]},
		{name: 'content', options: {keyPath: 'id', autoIncrement: true}, index: [{name: 'synced', unique: false}]},
		{name: 'index', options: {keyPath: 'name'}, index: [{name: 'synced', unique: false}]}
	]
};

export var db = store(cfg);
export var index = {};

cfg.stores.forEach(cfg => {
	if ( Array.isArray(cfg.fulltext) ) {
		index[cfg.name] = lunr(function () {
			cfg.fulltext.forEach(field => {
				this.field(field);
			});
			this.ref(cfg.options.keyPath);
		});
	}
});
