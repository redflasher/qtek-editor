//==========================================
//index.js
//加载当前目录下的所有组件
//==========================================
define(function(require, exports, module){

	var modules = ['Camera', 
					'Scene',
					'Texture', 
					'Video',
					'Timer',
					'Value'];

	var modulesPath = [];
	for(var i = 0; i < modules.length; i++){
		modulesPath.push('./'+modules[i]);
	}

	require.async(modulesPath, function(){

		for(var i = 0; i < arguments.length; i++){
			
			exports[ modules[i] ] = arguments[i];
		}
	})
})
