'use strict';

import * as store from 'js/hud/store';
import * as view from 'js/hud/view';
import * as cmd from 'js/cmd/cmd';

let delay = {
	write: null
};

cmd.addEventListener('command', evt => {
	let last_subcmd = evt.target.value.pop();

	if ( evt.tab ) {
		evt.evt.preventDefault();
	}

	if ( !evt.enter && last_subcmd !== undefined && last_subcmd.name !== 'subject' ) {
		clearTimeout(delay.write);

		delay.write = setTimeout(() => {
			store.sugestions.search(['contact'], last_subcmd.args.pop()).then(view.sugestions);
		}, 300);
	} else {
		store.sugestions.clear();
		view.sugestions(store.sugestions.result);
	}
});
