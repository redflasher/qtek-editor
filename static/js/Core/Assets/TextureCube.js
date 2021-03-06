//========================
// TextureCube.js
//
// TextureCube Asset
// Save an geometry instance
// Unlike texture asset, texture cube will pack all sides images in a zip file
// file extension texturecube
//========================
define(function(require, exports, module){

	var TextureAsset = require('./Texture');

	var imageCache = {};

	var guid = 0;

	function create(texture){

		var name = texture && texture.name;

		var ret = {

			type : 'texturecube',

			name : name || 'TextureCube_' + guid++,

			data : texture || null,

			host : null,

			import : function(json){
				this.data = read(json);

				this.data.host = this;

				if( json.name ){
					this.name = json.name;
				}

				return this.data;
			},

			toJSON : function(){
				return toJSON( this.data );
			},
			getInstance : function(){
				return getInstance(this.data);
			},
			getCopy : function(){
				return getCopy( this.data );
			},
			getConfig : function(){
				return getConfig( this.data );
			},
			getPath : function(){
				if( this.host){
					return this.host.getPath();
				}
			}
		}

		texture && (texture.host = ret);

		return ret;
	}

	function read(json){

		var texture = new THREE.Texture({
			wrapS : t.wrapS,
			wrapT : t.wrapT,
			magFilter : t.magFilter,
			minFilter : t.minFilter,
			anisotropy : t.anisotropy,
			format : t.format,
			type : t.type,
			offset : new THREE.Vector2( t.offset[0], t.offset[1] ),
			repeat : new THREE.Vector2( t.repeat[1], t.repeat[1] )
		});

		var imgLoadCount = 0;
		_.each( json.image.length, function(imgSrc, index){
			// don't cache base 64 format
			if( imgSrc.indexOf('data:image/')==0 ){
				var img = new Image();
				img.onload = function(){
					imgLoadCount--;
					if( imgLoadCount == 0){
						texture.needsUpdate = true;
					}
				}
				img.src = imageSrc;
				imgLoadCount++;
				texture.image[index] = img;
			}
			else if( imgSrc ){
				if( imageCache[ imgSrc ] ){
					texture.image[index] = imageCache[ imgSrc];
				}else{
					var img = new Image();
					img.onload = function(){
						imgLoadCount--;
						if( imgLoadCount == 0 ){
							texture.needsUpdate = true;
						}
					}
					img.src = imageSrc;
					imgLoadCount++;
					texture.image[index] = img;
					imageCache[imgSrc] = img;
				}
			}

		} )

		return texture;
	}

	function toJSON(texture){

		var json = {};

		// todo cube texture?
		_.extend(json, {
			'image' : [],	//data url todo needs save texture depedently
			'wrapS' : texture.wrapS,
			'wrapT' : texture.wrapT,
			'magFilter' : texture.magFilter,
			'minFilter' : texture.minFilter,
			'anisotropy' : texture.anisotropy,
			'format' : texture.format,
			'type' : texture.type,
			'offset' : [texture.offset.x, texture.offset.y],
			'repeat' : [texture.repeat.x, texture.repeat.y]
		});

		_.each(texture.image.length, function(img){
			json.image.push(img.src);
		} )

		return json;
	}

	function getConfig(texture){
		var config = TextureAsset.getConfig(texture);
		config['Texture']['class'] = 'texturecube';
		// replace the image item with px, nx, py, ny, pz, nz
		delete config['Texture'].sub['image'];

		_.extend(config['Texture'].sub, {
			'px' : _genSubImageConfig(texture, 'px', 0),
			'nx' : _genSubImageConfig(texture, 'nx', 1),
			'py' : _genSubImageConfig(texture, 'py', 2),
			'ny' : _genSubImageConfig(texture, 'ny', 3),
			'pz' : _genSubImageConfig(texture, 'pz', 4),
			'nz' : _genSubImageConfig(texture, 'nz', 5)
		})

		return config;
	}

	function _genSubImageConfig(texture, d, idx){

		return {
			type : 'image',
			value : texture.image[idx],
			onchange : function(value){
				texture.image[idx] = value;
				texture.needsUpdate = true;
			},
			acceptConfig : {
				'image' : {
					'accept' : function(files){
						if(files instanceof FileList){
							return true;
						}
					},
					'accepted' : function(files, setModel){
						_.each(files, function(file){
							if(file.type.match(/image.*/) ||
								file.name.match(/\.dds$/)){
								var reader = new FileReader();
								reader.onload = function(e){
									setModel({
										src : e.target.result
									})
								}
								reader.readAsDataURL(file);
							}
						})
					}
				}
			}
		}
	}

	function getInstance( texture ){
		texture.needsUpdate = true;
		return texture;
	}

	function getCopy( texture ){
		return texture.clone();
	}

	exports.create = create;
	// static functions
	exports.toJSON = toJSON;

	exports.getCopy = getCopy;

	exports.getConfig = getConfig;
})