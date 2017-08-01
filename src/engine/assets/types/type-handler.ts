export interface StackResourceLocation {
	stack: string;
	ID: number;
	type: string;
}

interface deps {
	(loc: StackResourceLocation): void;
	(stack: string, ID: number, type: string): void;
	(ID: number, type: string): void;
}

interface get {
	(loc: StackResourceLocation): Promise<any>;
	(stack: string, ID: number, type: string): Promise<any>;
	(ID: number, type: string): Promise<any>;
}

export interface TypeHandler {
	(data: Blob, deps: deps, soon: deps, get: get): Promise<any>;
}
