'use strict';

const CMD_GROUPS = [
	{name: 'search email', cmd_list: [
		{name: 'folder'},
		{name: 'to', sugestions: ['contact']},
		{name: 'from', sugestions: ['contact']},
		{name: 'cc', sugestions: ['contact']},
		{name: 'bcc', sugestions: ['contact']},
		{name: 'subject'}
	]},
	{name: 'write', cmd_list: [
		{name: 'to', sugestions: ['contact'], split_args: true},
		{name: 'from', sugestions: ['contact'], split_args: true},
		{name: 'cc', sugestions: ['contact'], split_args: true},
		{name: 'bcc', sugestions: ['contact'], split_args: true},
		{name: 'subject', last_cmd: true}
	]},
	{name: 'add', cmd_list: [
		{name: 'tags', sugestions: ['tags']}
	]},
	{name: 'remove', cmd_list: [
		{name: 'tags', sugestions: ['tags']}
	]}
];

export function parse(input, cursor_pos) {
	return new Promise((resolve) => {
		let cmd = null;

		CMD_GROUPS.some(cmd_cfg => {
			if  ( input.indexOf(cmd_cfg.name) === 0 ) {
				cmd = cmd_cfg;
				return true;
			}
		});

		if ( cmd !== null ) {
			resolve({
				name: cmd.name,
				list: get_cmd_list(cmd.cmd_list.slice(0), input, cursor_pos)
			});
		} else {
			resolve(null);
		}
	});
}

export function update(input, string, cursor_pos) {
	return parse(input, cursor_pos).then(cmd => {
		if ( cmd !== null ) {
			cmd.list = cmd.list.map(cmd => {
				cmd.args = cmd.args.map(arg => {
					if ( arg.has_cursor === true ) {
						arg.value = string;
					}

					return arg;
				});

				return cmd;
			});
		}

		return cmd;
	});
}

function get_cmd_list(cfg_list, input, cursor_pos) {
	return cfg_list.map(cfg => {
		let pos = input.indexOf(cfg.name + ' ');

		if ( pos === -1 ) { return false; }

		cfg.pos = pos;

		return cfg;
	}).filter(item => {
		return item;
	}).sort((a, b) => {
		if ( a.score > b.score ) {
			return 1;
		} else if ( a.score < b.score ) {
			return -1;
		} else {
			return 0;
		}
	}).map((cfg, index, list) => {
		let pos = cfg.pos + (cfg.name + ' ').length, next_pos, cmd, cmd_input;

		if ( list.length === index + 1 || cfg.last_cmd === true ) {
			next_pos = input.length;
		} else {
			next_pos = list[index + 1].pos;
		}

		cmd_input = input.slice(pos, next_pos);

		cmd = {
			name: cfg.name,
			sugestions: cfg.sugestions || [],
			args: get_args(cfg, input, pos, next_pos, cursor_pos)
		};

		return cmd;
	});
}

function get_args(cfg, input, start_pos, end_pos, cursor_pos) {
	let args = [];
	input = input.slice(start_pos, end_pos);

	if ( cfg.split_args !== true ) {
		if ( cursor_pos > start_pos && cursor_pos <= end_pos ) {
			args = [{
				has_cursor: true,
				value: input
			}];
		} else {
			args = [{
				has_cursor: false,
				value: input
			}];
		}
	} else if ( cursor_pos > start_pos && cursor_pos <= end_pos ) {
		let arg_end = start_pos, found_cursor = false;
		args = input.split(' ').map(item => {
			let has_cursor = false;

			arg_end += item.length + 1;

			if ( found_cursor === false && arg_end >= cursor_pos ) {
				has_cursor = true;
				found_cursor = true;
			}

			return {
				has_cursor: has_cursor,
				value: item.trim()
			};
		});
	} else {
		args = input.split(',').map(item => {
			return {
				has_cursor: false,
				value: item.trim()
			};
		});
	}

	return args;
}
