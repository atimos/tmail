'use strict';

const CMD = [
	{name: 'search', subcmd: ['folder', 'to', 'from', 'cc', 'bcc', 'subject']},
	{name: 'write', subcmd: ['to', 'from', 'cc', 'bcc', 'subject']},
	{name: 'add', subcmd: ['tags']},
	{name: 'remove', subcmd: ['tags']}
];

export function parse(input) {
	let cmd = null;

	CMD.some(cmd_cfg => {
		if  ( input.indexOf(cmd_cfg.name) === 0 ) {
			cmd = cmd_cfg;
			return true;
		}
	});
	if ( cmd !== null ) {
		cmd = {
			name: cmd.name,
			value: get_subcmd_list(cmd.subcmd.slice(0), input)
		};
	}
	return cmd;
}

function get_subcmd_list(subcmd_name_list, input) {
	let subcmd, subcmd_list = [];

	subcmd = subcmd_name_list.reduce((subcmd, name) => {
		let pos = input.indexOf(name + ' ');

		if ( pos > -1 && ( subcmd.pos === null || pos < subcmd.pos ) ) {
			return {
				name: name,
				str: input.slice(pos + name.length),
				pos: pos,
				args: []
			};
		}

		return subcmd;
	}, {name: null, str: '', pos: null, args: []});

	if ( subcmd.name !== null ) {
		subcmd_name_list.splice(subcmd_name_list.indexOf(subcmd.name), 1);

		subcmd_list = get_subcmd_list(subcmd_name_list, subcmd.str);

		if ( subcmd_list.length > 0 ) {
			subcmd.str = subcmd.str.slice(0, subcmd_list[0].pos).trim();
			delete subcmd_list[0].pos;
		}

		subcmd.args = subcmd.str.split(',').map(arg => {return arg.trim();});

		subcmd_list.unshift(subcmd);
	}

	return subcmd_list;
}
