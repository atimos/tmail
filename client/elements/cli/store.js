'use strict';

import {get_instance as get_db_instance} from '../../js/store';

let _hdata = '_hdata_';

export function get_sugestions(store_list, query) {
	return get_db_instance().then(db => {
		return Promise.all(store_list.map(store_name => {
			return db.store(store_name).search(query).then(result => {
				return result.map(item => {
					item.template = store_name;
					return item;
				});
			});
		}));
	}).then(result_list => {
		return result_list.reduce((result_list, result) => {
			return result_list.concat(result.reduce((list, item) => {
				list.push(item);
				return list;
			}, []));
		}, []).sort((a, b) => {
			if ( a.score < b.score ) {
				return 1;
			} else if ( a.score > b.score ) {
				return -1;
			} else {
				return 0;
			}
		}).slice(0, 10);
	});
}

export function get_command(input, cursor_pos) {
	return get_db_instance().then(db => {
		return db.store('command').range();
	}).then(cmd_group_list => {
		return cmd_group_list.filter(cmd_group_cfg => {
			return (input.indexOf(cmd_group_cfg.name) === 0);
		}).map(cmd_cfg => {
			let focused_cmd = null, focused_arg = null, last_cmd_index = cmd_cfg.cmd_list.length - 1;

			let cmd_list = cmd_cfg.cmd_list.map(cfg => {
				let start = input.indexOf(cfg.name + ' ');

				if ( start > -1 && input.slice(start - 1, start) === ' ') {
					return Object.assign({start: start}, cfg);
				}
			}).filter(cmd => {
				return cmd !== undefined;
			}).sort((a, b) => {
				return a.start - b.start;
			}).filter((cmd, index) => {
				if ( index < last_cmd_index && cmd.last_cmd === true ) {
					last_cmd_index = index;
				}

				return index <= last_cmd_index;
			}).map((cmd, index, list) => {
				let start = cmd.start + (cmd.name + ' ').length,
					end = (index === list.length - 1 ? input.length : list[index + 1].start),
					args = input.slice(start, end);

				if ( cmd.split_args !== undefined && cmd.split_args !== false ) {
					let arg_start = start;

					cmd.args = args.split(cmd.split_args).map(arg => {
						let focused = (cursor_pos >= arg_start && cursor_pos <= arg_start + arg.length);

						if ( focused ) {
							focused_cmd = cmd;
							focused_arg = arg;
						}

						arg_start += arg.length + cmd.split_args.length;

						return {
							value: arg.trim(),
							focused: focused
						};
					});
				} else {
					cmd.args = [{
						value: args.trim(),
						focused: (cursor_pos >= start && cursor_pos <= end)
					}];
				}

				return {
					name: cmd.name,
					args: cmd.args,
					sugestions: (Array.isArray(cmd.sugestions)? cmd.sugestions : null),
					[_hdata]: {
						split_args: cmd.split_args || false
					}
				};
			});

			return {
				name: cmd_cfg.name,
				list: cmd_list,
				focused: {
					cmd: focused_cmd,
					arg: focused_arg
				}
			};
		});
	}).then(cmd_list => {
		return cmd_list.value(0);
	});
}

export function update_input(input, new_value) {
	if ( new_value !== undefined ) {
		return get_command(input.value, input.selectionStart).then(cmd => {
			let cursor_pos = 0;

			input.value = cmd.list.reduce((new_input, cmd) => {
				new_input = cmd.args.reduce((new_input, arg) => {
					if ( arg.focused === true ) {
						new_input += new_value;
						cursor_pos = new_input.length + new_value.length;
					} else {
						new_input += arg.value;
					}

					if ( cmd[_hdata].split_args && arg.value.length > 0 ) {
						new_input += cmd[_hdata].split_args;
						new_input += ' ';
					}

					return new_input;
				}, new_input + cmd.name + ' ');

				if ( cmd.args.length > 0 && cmd[_hdata].split_args ) {
					new_input = new_input.slice(0, -(cmd[_hdata].split_args.length + 1));
				}

				return new_input + ' ';
			}, cmd.name + ' ').slice(0, -1);

			input.setSelectionRange(cursor_pos, cursor_pos);
		});
	} else {
		return new Promise(resolve => {
			resolve();
		});
	}
}
