/** globalizer.js
 * 
 * Makes require.js modules available on the global scope.
 * 
 * !!THIS SHOULD ONLY BE USED FOR DEBUGGING PURPOSES!!
 * 
 * Usage: globalize("mod1", "mod2", ..., "modn")
 */
function globalize() {
	for (a in arguments) {
		var arg = arguments[a];
		require([arguments[a]],function(mod){
			window[arg] = mod;
		});
	}
}
