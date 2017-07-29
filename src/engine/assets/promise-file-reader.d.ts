declare module 'promise-file-reader' {
	export function readAsDataURL(file: Blob): Promise<string>;
	export function readAsText(file: Blob): Promise<string>;
	export function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer>;
}
