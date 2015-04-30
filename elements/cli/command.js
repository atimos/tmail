'use strict';

import get_store from '../../js/store';

let _name = Symbol('name'),
	_arg_list = Symbol('cmd_list'),
	_arg = Symbol('cmd'),
	_value = Symbol('attr');

class Command {
	constructor(name, cmd_list, cmd, attr) {
		this[_name] = name;
		this[_arg_list] = cmd_list;
		this[_arg] = cmd;
		this[_value] = attr;
	}
}

export default function(str, caret) {
	get_store()
		.then(store => {
			return store.get('command').range()
				.then(range => {
					console.log(range);
				});
		})
		.catch(err => {
			console.log(err);
		});
	return new Command();
}

/*
export function get_command(input_value, input_cursor_pos) {
	return get_store()
		.then(store => {
			return store.get('command').get_db_transaction()
				.then(transaction => {
					return transaction.range().cursor((cursor, result) => {
						if ( cursor !== null ) {
							let { name: name, args: args, alias: alias } = cursor.value;

							if ( input_value.indexOf(name + ' ') !== 0 ) {
								let found = alias.some(alias => {
									if ( input_value.indexOf(alias + ' ') === 0 ) {
										input_value = name + input_value.slice(alias.length);
										input_cursor_pos += name.length - alias.length;

										return true;
									}
								});

								if ( found === false ) {
									return cursor.continue();
								}
							}

							args = args
								.map(arg_cfg => {
									let start_pos = input_value.indexOf(' ' + arg_cfg.name + ' ');

									if ( start_pos > -1 ) {
										return Object.assign({start_pos: start_pos + 1}, arg_cfg);
									} else {
										return false;
									}
								})
								.filter(item => { return (item !== false);})
								.sort((a, b) => { return a.start_pos - b.start_pos;})
								.reduce((args, arg) => {
									if ( args.length === 0 || args[args.length - 1].last_arg !== true ) {
										args.push(arg);
									}
									return args;
								}, [])
								.map((arg, index, list) => {
									let value_range = [arg.start_pos + arg.name.length + 1],
										current_pos = value_range[0],
										split_str_length = 0,
										value;

									if ( index < list.length - 1 ) {
										value_range.push(list[index + 1].start_pos - 1);
									} else {
										value_range.push(input_value.length);
									}

									if ( Object.prototype.toString.call(arg.split) === '[object String]' ) {
										value = input_value.slice(value_range[0], value_range[1]).split(arg.split);
										split_str_length = arg.split.length;
									} else {
										value = [input_value.slice(value_range[0], value_range[1])];
									}

									value = value
										.map(value => {
											let current_value = false, value_start = current_pos;

											if ( input_cursor_pos > current_pos && input_cursor_pos <= current_pos + value.length ) {
												current_value = true;
											}

											current_pos += value.length + split_str_length;

											return {
												[_pos]: value_start,
												value: value.trim(),
												current: current_value
											};
										});

									return {
										name: arg.name,
										value: value,
										[_search]: arg.search,
										[_split]: arg.split
									};
								});

							result.set(name, args);
						}
					});
				});
		});
}

export function update_command(input, new_value) {
	return get_command(input.value, input.selectionStart)
		.then(command => {
			if ( command.size > 0 ) {
				let value,
					input_cursor_pos = input.selectionStart,
					[name, args] = command.entries().next().value;

				value =  name + ' ' + args
					.map(arg => {
						return arg.name + ' ' +  arg.value
							.map((value, index, list) => {
								if ( value.current === true ) {
									input_cursor_pos = value[_pos] + new_value.length + arg[_split].length;
									return new_value;
								} else {
									return value.value;
								}
							})
							.join(arg[_split] + ' ');
					})
					.join(' ');

				input.value = value;
				input.setSelectionRange(input_cursor_pos, input_cursor_pos);
			}
		});
}

export function get_sugestions(input) {
	return get_command(input.value, input.selectionStart)
		.then(command => {
			if ( command.size > 0 ) {
				return command.value(0)
					.map(arg => {
						if ( !Array.isArray(arg[_search]) ) {
							return false;
						}

						arg.value = arg.value
							.map(value => {
								if ( value.current === true ) {
									return value.value;
								} else {
									return false;
								}
							})
							.filter(item => { return item !== false; })
							.shift();

						if ( arg.value === undefined ) {
							return false;
						}

						return arg;
					})
					.filter(arg => {
						return arg;
					})
					.shift();
			}
		})
		.then(query => {
			if ( query === undefined ) {
				return [];
			}

			return get_store()
				.then(store => {
					return Promise.all(query[_search]
						.map(store_name => {
							return store.get(store_name).search(query.value)
								.then(result => {
									result.type = store_name;
									return result;
								});
						}));
				})
				.then(result => {
					result = result
						.reduce((list, store) => {
							store.forEach(item => {
								list.push({type: store.type, value: item.value});
							});

							return list;
						}, [])
						.sort((a, b) => {
							return b.score - a.score;
						});

					return result
						.map(item => {
							return item;
						})
						.slice(0, 5);
				});
		});
}
*/
