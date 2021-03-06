//========================
// Texture.js
//
// Texture Asset
// Save an texture instance, which can be imported and exported as a json format asset and images
// file extension texture
//
// getInstance 	: get a copy for the same context
// getCopy		: get a copy for different context
//========================
define(function(require, exports, module){

	var imageCache = {};

	var guid = 0;

	function create(texture){

		var name = texture && texture.name;
		
		var ret = {

			type : 'texture',

			name : name || 'Texture_' + guid++,

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
			// config for inspector
			getConfig : function(){
				return getConfig(this.data );
			},
			getThumb : function(size){
				return getThumb(this.data, size);
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

		var imgSrc = json.image
		// don't cache base 64 format
		if( imgSrc.indexOf('data:image/')==0 ){
			var img = new Image();
			img.onload = function(){
				texture.needsUpdate = true;
			}
			img.src = imageSrc;
			texture.image = img;
		}
		else if( imgSrc ){
			if( imageCache[ imgSrc ] ){
				texture.image = imageCache[ imgSrc];
			}else{
				var img = new Image();
				img.onload = function(){
					texture.needsUpdate = true;
				}
				img.src = imageSrc;
				texture.image = img;
				imageCache[imgSrc] = img;
			}

		}

		return texture;
	}

	function toJSON( texture ){
		
		var json = {};

		// todo cube texture?
		_.extend(json, {
			'image' : texture.image.src,	//data url todo needs save texture depedently
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

		return json;
	}

	function getInstance( texture ){
		texture.needsUpdate = true;
		return texture;
	}
	
	function getCopy( texture ){
		return texture.clone();
	}

	function getThumb( texture, size ){
		if( texture instanceof THREE.DataTexture ||
			texture instanceof THREE.CompressedTexture){
			return;
		}
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		if(texture.image && texture.image.src){
			canvas.getContext('2d').drawImage(texture.image, 0, 0, size, size);	
		}
		return canvas.toDataURL();
	}

	function getConfig( texture ){
		return {
			'Texture' : {
				type : 'layer',
				'class' : 'texture',
				sub : {
					'name' : {
						type : 'input',
						value : texture.name,
						onchange : function(value){
							texture.name = value;
							// set asset name
							texture.host.name = value;
							// set file name
							texture.host.host.setName(value);
						}
					},
					'image' : {
						type : 'image',
						value : texture.image,
						onchange : function(value, updatePartial){
							// image must be loaded before calling this onchange method
							texture.image = value;
							texture.needsUpdate = true;

						},
						// for drag and drop
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
					},
					'mapping' : {
						type : 'select',
						value : texture.mapping,
						options : [{
							value : 1000,
							description : 'Repeat'
						}, {
							value : 1001,
							description : 'Clamp to edge'
						}, {
							value : 1002,
							description : 'Mirror'
						}],
						onchange : function(value){
							texture.mapping = value;
							texture.needsUpdate = true;
						}
					},
					'magFilter' : {
						type : 'select',
						value : texture.magFilter,
						options : filterOptions,
						onchange : function(value){
							texture.magFilter = value;
						}
					},
					'minFilter' : {
						type : 'select',
						value : texture.minFilter,
						options : filterOptions,
						onchange : function(value){
							texture.minFilter = value;
						}
					},
					'anisotropy' : {
						type : 'boolean',
						value : texture.anisotropy,
						onchange : function(value){
							texture.anisotropy = value;
						}
					},
					// need to move the offset and repeat to material
					'offset' : {
						type : 'vector',
						value : {
							x : texture.offset.x,
							y : texture.offset.y
						},
						min : -100,
						max : 100,
						step : 0.01,
						onchange : function(key, value){
							texture.offset[key] = value;
						}
					},
					'repeat' : {
						type : 'vector',
						value : {
							x : texture.repeat.x,
							y : texture.repeat.y
						},
						min : 0,
						max : 1000,
						step : 0.1,
						onchange : function(key, value){
							texture.repeat[key] = value;
						}
					},
					'flipY' : {
						type : 'boolean',
						value : texture.flipY,
						onchange : function(value){
							texture.flipY = value;
							texture.needsUpdate = true;
						}
					}
				}
			}
			
		}
	}

	var filterOptions = [{
		value : 1003,
		description : 'Nearst'
	},
	{
		value : 1004,
		description : 'Nearest MipMapNearest'
	},
	{
		value : 1005,
		description : 'Nearest MipMapLinear'
	},
	{
		value : 1006,
		description : 'Linear'
	},
	{
		value : 1007,
		description : 'Linear MipMapNearest'
	},
	{
		value : 1008,
		description : 'Linear MipMapLinear'
	}]

	exports.create = create;
	// static functions
	exports.toJSON = toJSON;

	exports.getCopy = getCopy;

	exports.getConfig = getConfig;
})