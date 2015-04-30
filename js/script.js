'use strict';

import './sync';

/*
let data = {
	group: [
		{
			value: {
				name: 'foo'
			},
			children: {
				group: [
					{value: { email: 'bar'}},
					{value: { email: 'bar'}},
					{value: { email: 'bar'}}
				]
			}
		},
		{
			value: {
				name: 'foo'
			},
			children: {
				group: [
					{value: { email: 'bar'}},
					{value: { email: 'bar'}},
					{value: { email: 'bar'}}
				]
			}
		}
	]
};

let node = render_template(document.querySelector('lw-datalist > template'), data);
document.body.appendChild(node);

let datalist = document.querySelector('lw-datalist');
let cli = document.querySelector('tm-cli');
let email = document.querySelector('tm-email');

cli.addEventListener('command', evt => {
	if ( evt.detail.name === 'write' ) {
		email.clear();
		email.write(evt.detail.args
			.map(item => {
				return {name: item.name, value: item.value.map(item => {
					return item.value;
				})};
			})
			.reduce((object, item) => {
				object[item.name] = item.value;
				return object;
			}, {}));
	}
});

setTimeout(() => {
	document.querySelector('lw-datalist').options = [
		{
			name: 'foo',
			options: [
				{email: 'foo@foo.foo'}
			]
		}
	];
}, 1000);

email = {clear: () => {}};

cli.addEventListener('command', evt => {
	let command = evt.detail.value;

	switch ( command.name ) {
		case 'write':
			email.clear();

			command.list.forEach(command => {
				if ( command.name === 'subject' ) {
					email[command.name] = command.args[0].value;
				} else {
					email[command.name] = command.args.map(arg => {
						return arg.value;
					});
				}
			});
	}

	console.log(email);
});
*/
