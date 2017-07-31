export interface StackResourceLocation {
	stack: string;
	ID: number;
	type: string;
}

export interface Resource {
	self: StackResourceLocation;
	deps: StackResourceLocation[];
	soon: StackResourceLocation[];
	data: Promise<any>;
}

export interface TypeHandler {
	(hdr: Resource, ...deps: Resource[]): Resource;
}
