'use strict';

const CMD_GROUPS = [
	{name: 'search email', cmd_list: [
		{name: 'folder'},
		{name: 'to', sugestions: ['contact'], split_args: ','},
		{name: 'from', sugestions: ['contact'], split_args: ','},
		{name: 'cc', sugestions: ['contact'], split_args: ','},
		{name: 'bcc', sugestions: ['contact'], split_args: ','},
		{name: 'subject', last_cmd: true}
	]},
	{name: 'write', cmd_list: [
		{name: 'to', sugestions: ['contact'], split_args: ','},
		{name: 'from', sugestions: ['contact'], split_args: ','},
		{name: 'cc', sugestions: ['contact'], split_args: ','},
		{name: 'bcc', sugestions: ['contact'], split_args: ','},
		{name: 'subject', last_cmd: true}
	]},
	{name: 'add', cmd_list: [
		{name: 'tags', sugestions: ['tags']}
	]},
	{name: 'remove', cmd_list: [
		{name: 'tags', sugestions: ['tags']}
	]}
];

let _cmd_list = '_cmd_list_', _hidden_data = '_hidden_data_';

class Cli extends window.HTMLDivElement {
	attachedCallback() {
		this.contentEditable = true;
		this.is_attached = true;

		this[_cmd_list] = [];

		this.innerHTML = '.';
		this.style.height = this.offsetHeight + 'px';
		this.innerHTML = '';

		this.addEventListener('input', this.input_event.bind(this));
		this.addEventListener('keydown', evt => {
			if ( evt.keyCode === 13 ) {
				evt.preventDefault();

				parse_input(this).then(cmd_list => {
					if ( cmd_list.length > 0 ) {
						this.dispatchEvent(new CustomEvent('execute', {
							detail: {
								value: cmd_list[0]
							},
							bubbles: true,
							cancelable: true
						}));
					}
				});
			}
		});
	}

	update(value) {
		return new Promise(resolve => {
			let new_string = '';
			let cursor_pos = 0;

			this[_cmd_list] = this[_cmd_list].map(cmd => {
				new_string += cmd.name + ' ';

				cmd.list = cmd.list.map(cmd => {
					new_string += cmd.name + ' ';

					cmd.args = cmd.args.map(arg => {
						if ( arg.current === true ) {
							arg.value = value;
							cursor_pos = new_string.length + value.length;
						}

						new_string += arg.value;

						if ( cmd[_hidden_data].split_args ) {
							new_string += cmd[_hidden_data].split_args;
							new_string += ' ';
						}

						return arg;
					});

					if ( cmd.args.length > 0 && cmd[_hidden_data].split_args ) {
						new_string = new_string.slice(0, -(cmd[_hidden_data].split_args.length + 1));
					}

					new_string += ' ';

					return cmd;
				});

				new_string = new_string.slice(0, -1);

				return cmd;
			});

			if ( this[_cmd_list].length > 0 ) {
				let range, selection;
				this.textContent = new_string;

				range = document.createRange();
				selection = window.getSelection();

				range.setStart(this.firstChild, cursor_pos);
				range.collapse(true);
				selection.removeAllRanges();
				selection.addRange(range);

				resolve(this[_cmd_list][0]);
			}
		});
	}

	detachedCallback() {
		window.removeEventListener('input', this.input_event.bind(this));
	}

	input_event(evt) {
		parse_input(this).then(cmd_list => {
			this[_cmd_list] = cmd_list;

			if ( cmd_list.length > 0 ) {
				this.dispatchEvent(new CustomEvent('command', {
					detail: {
						value: cmd_list[0]
					},
					bubbles: true,
					cancelable: true
				}));
			}
		});
	}
}


function parse_input(cli) {
	let cursor_pos = window.getSelection().anchorOffset,
		input = cli.textContent;

	return new Promise((resolve) => {
		let cmd_list = CMD_GROUPS.filter(cmd_cfg => {
			return (input.indexOf(cmd_cfg.name) === 0);
		}).map(cmd_cfg => {
			let cmd_list = cmd_cfg.cmd_list.map(cfg => {
				return Object.assign({start: input.indexOf(cfg.name + ' ')}, cfg);
			}).filter(cmd => {
				return cmd.start !== -1;
			}).sort((a, b) => {
				return a.start - b.start;
			}).filter((cmd, index, list) => {
				return ( index === 0 || list[index - 1].last_cmd !== true );
			}).map((cmd, index, list) => {
				let start = cmd.start + (cmd.name + ' ').length,
					end = (index === list.length - 1 ? input.length : list[index + 1].start),
					args = input.slice(start, end);

				if ( cmd.split_args !== undefined && cmd.split_args !== false ) {
					let arg_start = start;

					cmd.args = args.split(cmd.split_args).map(arg => {
						let _arg_start = arg_start;

						arg_start += arg.length + cmd.split_args.length;

						return {
							value: arg.trim(),
							current: (cursor_pos >= _arg_start && cursor_pos <= _arg_start + arg.length)
						};
					});
				} else {
					cmd.args = [{
						value: args.trim(),
						current: (cursor_pos >= start && cursor_pos <= end)
					}];
				}

				return cmd;
			}).map(cmd => {
				let result = {
					name: cmd.name,
					args: cmd.args
				};

				result[_hidden_data] = {
					split_args: cmd.split_args || false
				};

				return result;
			});

			return {
				name: cmd_cfg.name,
				list: cmd_list
			};
		});

		resolve(cmd_list);
	});
}

export default function(document) {
	Cli.prototype.document = document;
	window.document.registerElement('tmail-cli', {prototype: Cli.prototype});
}
