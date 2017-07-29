export interface StackResourceLocation {
	stack: string;
	ID: number;
	type: string;
}

export interface Resource {
	self: StackResourceLocation;
	deps: StackResourceLocation[];
	soon: StackResourceLocation[];
	stage: number;
	data: any;
}

export interface TypeHandler {
	(hdr: Resource, ...deps: Resource[]): Resource;
}
