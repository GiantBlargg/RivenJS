export default function assert(cond: any, text?: string) {
	if (cond) return;
	debugger;
	throw new Error(text || "Assertion failed!");
}
