'use strict';

let tpl = {
	contact: document.querySelector('#tpl_hud_contact'),
	email: document.querySelector('#tpl_hud_email'),
};

export let hud = {
	list: [],
	root: document.querySelector('header[role="hud"] ul'),
	push: function(item, type) {
		this.list.push({value: item, type: type});
	},
	reset: function() {
		this.list = [];
		this.render();
	},
	render: function() {
		render_list(this.list, this.root, tpl.contact);
	}
};

function render_list(list, root, tpl) {
	let node_list = document.createDocumentFragment();

	list.forEach(item => {
		let node = tpl.content.cloneNode(true);
		node.children[0].dataset[item.ref] = item.value[item.ref];

		for ( let key in item.value ) {
			let node_item = node.querySelector('[data-key="' + key + '"]');

			if ( node_item ) {
				node_item.textContent = item.value[key];
			}
		}

		node_list.appendChild(node);
	});

	root.innerHTML = '';
	root.appendChild(node_list);
}
