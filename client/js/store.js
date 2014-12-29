'use strict';

import {get_instance as get_db_instance} from '../lib/libweb/db/store';

let cfg = {
	name: 'tmail',
	version: 1,
	stores: [
		{name: 'contact', options: {keyPath: 'uuid', autoIncrement: false}, index: [
			{name: 'email', unique: false},
			{name: 'synced', unique: false}
		]},
		{name: 'email', options: {keyPath: 'uuid', autoIncrement: false}, index: [
			{name: 'subject', unique: false},
			{name: 'body', unique: true},
			{name: 'from', unique: false},
			{name: 'to', unique: false},
			{name: 'cc', unique: false},
			{name: 'bcc', unique: false},
			{name: 'tags', unique: false},
			{name: 'synced', unique: false}
		]},
		{name: 'content', options: {keyPath: 'uuid', autoIncrement: false}, index: [{name: 'synced', unique: false}]},
		{name: 'command', options: {keyPath: 'name', autoIncrement: false}}
	],
	fulltext: [
		{name: 'contact', ref: 'uuid', fields: ['email', 'name']},
		{name: 'email', ref: 'uuid', fields: ['subject']}
	]
};

export function get_instance() {
	return get_db_instance(cfg);
}
