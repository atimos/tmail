import store from 'lib/db/store';


let db = store(window.config.db);

let content = db.store('content'), email = db.store('email');

function fill_database(count) {
	'use strict';
	content.put({
		html: 'foooooooooo oooooooooooooooooooooooooo',
		text: 'foooooooooo oooooooooooooooooooooooooo'
	}).then(result => {
		let content = result.entries().next().value;
		return email.put({
			from: 'alex@timot.se',
			to: 'alex@timot.se',
			subject: 'subject',
			preview: content[1].html.slice(0, 100),
			body: content[0]
		});
	}).then(result => {
		console.log(result.values().next().value);
		return db.store('content').get(result.values().next().value.body);
	}).then(result => {
		console.log(result);
		if ( count > 0 ) {
			fill_database(count - 1);
		}
	}).catch(err => {
		console.log(err);
	});
}

fill_database(10);
