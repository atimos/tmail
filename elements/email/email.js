'use strict';

let _from = Symbol('from'),
	_to = Symbol('to'),
	_cc = Symbol('cc'),
	_bcc = Symbol('bcc'),
	_subject = Symbol('subject');

let self_document = window.document.currentScript.ownerDocument;

class Email extends window.HTMLDivElement {
	createdCallback() {
		this.appendChild(self_document.querySelector('template').content.cloneNode(true));
		this.clear();
	}

	set from(value) {
		this[_from] = value;
		this.children[0].value = (value||[]).join(', ');
	}

	get from() {
		return this[_from];
	}

	set to(value) {
		this[_to] = value;
		this.children[1].value = (value||[]).join(', ');
	}

	get to() {
		return this[_to];
	}

	set cc(value) {
		this[_cc] = value;
		this.children[2].value = (value||[]).join(', ');
	}

	get cc() {
		return this[_cc];
	}

	set bcc(value) {
		this[_bcc] = value;
		this.children[3].value = (value||[]).join(', ');
	}

	get bcc() {
		return this[_bcc];
	}

	set subject(value) {
		this[_subject] = value;
		this.children[4].value = (value||[]).join(' ');
	}

	get subject() {
		return this[_subject];
	}

	clear() {
		this.from = [];
		this.to = [];
		this.cc = [];
		this.bcc = [];
		this.subject = [];
	}

	write(data) {
		this.clear();
		this.from = data.from;
		this.to = data.to;
		this.cc = data.cc;
		this.bcc = data.bcc;
		this.subject = data.subject;
	}
}

window.document.registerElement('tm-email', {prototype: Email.prototype});
