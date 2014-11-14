'use strict';

let root = {
	sugestions: document.querySelector('header menu:first-child ul'),
	cmd: document.querySelector('header menu:first-child input'),
};

let tpl = {
	sugestions: root.sugestions.querySelector('template').content
};

export function cmd(string) {
	cmd.value = string;
}

export function sugestions(list) {
	let node_list = document.createDocumentFragment();

	list.forEach((item, key) => {
		let node = tpl.sugestions.cloneNode(true).firstElementChild;

		node.dataset.type = item.type;
		node.dataset.ref = key;

		switch ( item.type ) {
			case 'contact':
				sugestions_contact(node, item.value);
				break;
		}

		node_list.appendChild(node);
	});

	root.sugestions.innerHTML = '';
	root.sugestions.appendChild(node_list);
}

function sugestions_contact(node, item) {
	node.dataset.value = item.email;
	node.children[0].textContent = item.email;
	node.children[1].textContent = item.name;
}
