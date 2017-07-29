class HelpElem {
	constructor(readonly element: Element) {
	}

	click(listener: EventListener) {
		this.element.addEventListener("click", listener);
	}

	input(listener: EventListener) {
		this.element.addEventListener("input", listener);
	}


	get innerHTML() {
		return this.element.innerHTML;
	}
	set innerHTML(value) {
		this.element.innerHTML = value;
	}

	get files() {
		if (this.element instanceof HTMLInputElement) { return this.element.files; }
		else { throw new Error("Element is not an input; Does not have any files"); }
	}

	get value() {
		if (this.element instanceof HTMLInputElement) { return this.element.value; }
		else { throw new Error("Element is not an input; Does not have a value"); }
	}
	set value(value) {
		if (this.element instanceof HTMLInputElement) { this.element.value = value; }
		else { throw new Error("Element is not an input; Does not have a value"); }
	}

	hide() {
		if (this.element instanceof HTMLElement) { this.element.style.display = "none"; }
		else { throw new Error("Element is not an HTMLElement. How did you manage to do that?"); }
	}

	show() {
		if (this.element instanceof HTMLElement) { this.element.style.display = "block"; }
		else { throw new Error("Element is not an HTMLElement. How did you manage to do that?"); }
	}
}

export default function get(ID: string) {
	let elem = document.getElementById(ID)
	if (elem) { return new HelpElem(elem); }
	else { throw new Error("Element of ID " + ID + " does not exist."); }
}
