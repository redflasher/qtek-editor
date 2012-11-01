//=========================
//	Image.js
//	import from image files
//==========================

define(function(require, exports, module){

	var TextureAsset = require('../Texture');

	exports.import = function(name, data, folder){

		var image = new Image;
		image.src = data;

		var texture = new THREE.Texture(image);
		texture.name = name;
		
		var texFolder = folder.createFolder('textures');
		var texAsset = TextureAsset.create(texture);

		texFolder.createFile(texAsset.name, texAsset);

		return texAsset;
	}

	exports.importFromFile = function(file, folder, callback){

		var reader = new FileReader();
		reader.onload = function(evt){

			if( evt.target.readyState == FileReader.DONE ){

				var res = exports.import( file.name, evt.target.result, folder);
				callback && callback(res);
			}
		}
		reader.readAsDataURL( file );
	}

	exports.importFromURL = function(url, folder, callback){
		
	}
})