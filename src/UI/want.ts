import $ from "./doc-help";

interface file {
	name: string;
	disc: number;
	resolve: ((value?: Blob | PromiseLike<Blob> | undefined) => void)[];
}

$("files").input(check);
function check() {
	let files = $("files").files;
	if (!files)
		return;
	for (let w = 0; w < wants.length; w++) {
		for (let f = 0; f < files.length; f++) {
			if (files[f].name.toLowerCase() == wants[w].name.toLowerCase()) {
				for (let resolve of wants[w].resolve) {
					resolve(files[f]);
				}
				wants.splice(w, 1);
				w--;
				break;
			}
		}
	}
	printWants();
};

let wants: file[] = [];
export default function want(file: string, disc = 0) {
	return new Promise<Blob>(function (resolve, reject) {
		for (let f of wants) {
			if (f.name.toLowerCase() == file.toLowerCase()) {
				f.resolve.push(resolve);
				return;
			}
		}
		wants.push({ name: file, disc: disc, resolve: [resolve] });
		check();
		printWants();
	});
}

function printWants() {
	if (wants.length) {
		$("upload").show();
		let wantNames: string[] = [];
		for (let f of wants) {
			wantNames.push(f.name);
		}
		$("want").innerHTML = "Please locate the files " + wantNames.join(", ");
	} else {
		$("upload").hide();
	}
}
