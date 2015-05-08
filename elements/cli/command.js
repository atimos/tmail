'use strict';

import get_store from '../../js/store';
import IterExt from '../../lib/libweb/iterext/iterext';

let _cmd = Symbol('command'),
	_arg = Symbol('arg'),
	_value = Symbol('value');

class Command {
	constructor(cmd, arg_pos, value_pos) {
		this[_cmd] = cmd;
		this[_arg] = arg_pos;
		this[_value] = value_pos;
	}

	get caret() {
		let value = this[_cmd].args[this[_arg]].value[this[_value]];
		return value.pos + value.value.length;
	}

	set focused_value(value) {
		return this[_cmd].args[this[_arg]].value[this[_value]].value = value;
	}

	get focused_value() {
		return this[_cmd].args[this[_arg]].value[this[_value]].value;
	}

	get value() {
		let cmd = {
			name: this[_cmd].name
		};

		return this[_cmd].args
			.map(arg => {
				return {
					name: arg.name,
					value: arg.value.map(value => {
						return value.value;
					})
				};
			})
			.reduce((cmd, arg) => {
				cmd[arg.name] = arg.value;
				return cmd;
			}, cmd);
	}

	get_sugestions() {
		return get_store()
			.then(db => {
				let store = this[_cmd].args[this[_arg]].search;

				if ( store === undefined ) {
					return new IterExt([]);
				}

				return db.get(store)
					.search(this.focused_value)
					.then(result => {
						return result.map(item => {
							item.type = store;
							return item;
						}).take(10);
					});
			});
	}

	toString() {
		let command = this[_cmd];

		return command.name + ' ' + command.args
			.map(arg => {
				return arg.name + ' ' + arg.value
					.map(value => {
						return value.value;
					}).join(', ');
			})
			.join(' ');
	}
}

export default function(input, caret) {
	return get_store()
		.then(db => {
			return db.get('command').iter()
				.filter(command => {
					if ( input.indexOf(command.name + ' ') === 0 ) {
						return true;
					}
					return command.alias.some(name => {
						return input.indexOf(name + ' ') === 0;
					});
				});
		})
		.then(command => {
			command = command.nth(0);

			if ( command !== null ) {
				let {args} = command, arg_focused = 0, value_focused = 0;

				args = args
					.filter(arg => {
						return input.indexOf(' ' + arg.name + ' ') !== -1;
					})
					.map(arg => {
						return Object.assign({start: input.indexOf(' ' + arg.name + ' ') + arg.name.length + 2}, arg);
					});

				args
					.sort((a, b) => {
						return a.start - b.start;
					});

				command.args = args
					.reduce((args, arg) => {
						if ( args.length === 0 || args[args.length - 1].last !== true ) {
							args.push(arg);
						}

						return args;
					}, [])
					.map((arg, index, list) => {
						if ( index < list.length - 1 ) {
							let next = list[index +1];
							arg.end = next.start - next.name.length -1;
						} else {
							arg.end = input.length;
						}
						return arg;
					})
					.map((arg, arg_index) => {
						let start = arg.start;

						if ( arg.split !== undefined ) {
						arg.value = input.slice(arg.start, arg.end).split(arg.split)
							.map((value, value_index) => {
								let end = start + value.length;

								if ( start <= caret && caret <= end ) {
									arg_focused = arg_index;
									value_focused = value_index;
								}

								start = end + 1;

								return {
									value: value.trim(),
									pos: start
								};
							});
						} else {
							let value = input.slice(arg.start, arg.end),
								end = start + value.length;

							if ( start <= caret && caret <= end ) {
								arg_focused = arg_index;
								value_focused = 0;
							}

							arg.value = [{
								value: value.trim(),
								pos: start
							}];
						}

						return arg;
					});

				return new Command(command, arg_focused, value_focused);
			}

			return null;
		});
}
