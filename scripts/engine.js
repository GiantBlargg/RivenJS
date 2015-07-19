define(["engine/stack"], function(stack) {

	function go(card) {

	}

	function goStack(stack, card) {
		console.log(stack, card);
	}

	return {
		init : function(ini, gimme) {
			stack.init(ini, gimme);
		},
		goStack : goStack,
		go : go
	};
});
