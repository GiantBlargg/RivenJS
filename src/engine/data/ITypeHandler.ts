interface StackResourceLocation {
	stack: string;
	name: string;
	type: string;
}

interface Resource {
	self: StackResourceLocation;
	deps: StackResourceLocation[];
	soon: StackResourceLocation[];
	stage: number;
	data: any;
}

interface TypeHandler {
	(hdr: Resource, ...deps: Resource[]): Resource;
}
