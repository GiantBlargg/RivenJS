export interface StackResourceLocation {
	stack: string;
	ID: number;
	type: string;
}

interface deps {
	(loc: StackResourceLocation, soon?: boolean): void;
}

interface get {
	(loc: StackResourceLocation): Promise<any>;
}

export interface TypeHandler {
	(loc: StackResourceLocation, data: Blob, deps: deps, get: get): Promise<any>;
}
