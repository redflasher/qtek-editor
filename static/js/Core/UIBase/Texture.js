//=======================================
//	Texture.js
//	纹理编辑组件
//=======================================

define(function(require, exports, module){

	var Float = require('./Float');

	var textureID = 0;

	var Model = Backbone.Model.extend({
		defaults : {
			path : 'none',	//文件位置
			texture : null	//THREE.Texture
		}
	});

	var View = Backbone.View.extend({

		type : 'TEXTURE',

		tagName : 'div',

		className : 'lblend-texture',

		template : '<label class="lblend-texture-label">{{name}}</label>\
					<span class="lblend-texture-path" data-html="model.path"></span>',

		popupTemplate : '<div class="lblend-texture-popup"><div class="lblend-texture-popup-image"></div></div>',

		model : null,

		$popup : null,
		popup : null,

		textureID : 0,

		events : {
			'click .lblend-texture-path' : 'toggleImage'
		},
		
		initialize : function(){

			if( ! this.model){
				this.model = new Model;
			}
			this.textureID = textureID++;

			this.render();

			this.model.on('change:texture', function(model, value){
				this.updateTexture();
			}, this);

			this.on('dispose', function(){
				$('#texturepopup_'+this.textureID).remove();
			})
		},

		render : function(){

			this.$el.html( _.template(this.template, {
				name : this.name
			} ) );

			rivets.bind(this.$el, {model:this.model});

			this.$popup = $(this.popupTemplate);
			this.popup = this.$popup[0];

			this.$popup.attr('id', 'texturepopup_'+this.textureID);
			this.updateTexture();
		},

		setName : function(name){
			this.$el.children('label').html(name);
			this.name = name;
		},

		toggleImage : function(){
			var $el = $('#texturepopup_'+this.textureID);
			if( $el.length ){
				$el.remove();
			}
			else{
				var offset = this.$el.offset();

				this.$popup.css({
					left : offset.left+20,
					top : offset.top+this.$el.height()+5
				})
				$(document.body).append(this.$popup);
			}

		},

		updateTexture : function(){
			var $el = this.$popup.find('.lblend-texture-popup-image')
			$el.find('img').remove();
			if(this.model.get('texture')){
				$el.append(this.model.get('texture').image)
			}
			else{
				$el.append('<img class="lblend-texture-default" />');
			}
		},


	})

	exports.View = View;

	exports.Model = Model;

	Model.prototype.__viewconstructor__ = View;
})