'use strict';

class Email extends window.HTMLDivElement {
	createdCallback() {
	}

	attachedCallback() {
	}

	detachedCallback() {
	}
}

export default function(document) {
	Email.prototype.document = document;
	window.document.registerElement('tm-email', {prototype: Email.prototype});
}

