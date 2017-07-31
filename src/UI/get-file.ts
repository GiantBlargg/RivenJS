import $ from "./doc-help";

interface pendingFile {
	name: string;
	disc: number;
	resolve: ((value?: Blob | PromiseLike<Blob> | undefined) => void);
}
interface promisedFile {
	name: string;
	disc: number;
	promise: Promise<Blob>;
}

$("files").input(check);
function check() {
	let files = $("files").files;
	if (!files)
		return;
	for (let w = 0; w < pending.length; w++) {
		for (let f = 0; f < files.length; f++) {
			if (files[f].name.toLowerCase() == pending[w].name.toLowerCase()) {
				pending[w].resolve(files[f]);
				pending.splice(w, 1);
				w--;
				break;
			}
		}
	}
	printPending();
};

let pending: pendingFile[] = [];
let promises: promisedFile[] = [];
export default function getFile(file: string, disc = 0) {
	for (let f of promises) {
		if (f.name.toLowerCase() == file.toLowerCase() && f.disc == disc) {
			return f.promise;
		}
	}
	let p = new Promise<Blob>(function (this: any, resolve, reject) {
		pending.push({ name: file, disc: disc, resolve: resolve });
		check();
		printPending();
	});
	promises.push({ name: file, disc: disc, promise: p });
	return p;
}

function printPending() {
	if (pending.length) {
		$("upload").show();
		let pendingNames: string[] = [];
		for (let f of pending) {
			pendingNames.push(f.name);
		}
		$("pending").innerHTML = "Please locate the files " + pendingNames.join(", ");
	} else {
		$("upload").hide();
	}
}
