//=================
// Select.js
// todo 是否需要重构一下？
//=================
define(function(require, exports, module){

	var Model = Backbone.Model.extend({
		defaults : {
			value : '', 
			html : '',	// 每个option的html
			selected : false
		}
	});

	var Collection = Backbone.Collection.extend({
		
		select : function(value){
			this.forEach(function(model){
				if(model.get('value') == value){
					model.set('selected', true);
				}else{
					model.set('selected', false);
				}
			})
		}
	})

	var View = Backbone.View.extend({

		type : 'SELECT',

		tagName : 'div',

		className : 'lblend-select',

		template : '<label class="lblend-select-label">{{name}}</label><a class="lblend-select-button lblend-common-button"></a>',

		collection : null,

		events : {
			'click .lblend-select-button' : 'toggle'
		},

		inSelect : false,

		initialize : function(){

			if( ! this.collection){
				this.collection = new Collection;
			}
			var self = this;

			this.collection.on('add', this.add, this);
			this.collection.on('change:selected', function(item, value){
				if( value ){
					
					this.trigger('change', item);		
				}
			}, this)

			this.on('disposed', function(){
				$('.lblend-select-dropdown-list').remove();
			})

			this.render();
		},

		render : function(){
			var self = this;
			this.$el.html(_.template(this.template, {
				name : this.name || ''
			}));
			
		},

		setName : function(name){
			this.name = name;
			this.$el.children('label.lblend-select-label').html(name);
		},

		add : function(model){
			if(this.collection.where({
				selected :true
			}).length == 0){
				this.select(model.get('value'));
			}
		},

		toggle : function(){
			if( this.inSelect){
				
				$('.lblend-select-dropdown-list').remove();
				this.inSelect = false;
			}else{

				var self = this;
				$('.lblend-select-dropdown-list').remove();
				
				$ul = $('<ul class="lblend-select-dropdown-list"></ul>');
				this.collection.forEach(function(model){
					$ul.append(self.createItem(model));
				});

				var $button = this.$el.find('.lblend-select-button'),
					offset = $button.offset();
				$(document.body).append($ul);
				$ul.css({
					'position' : 'absolute'
				})
				$ul.offset({
					left : offset.left,
					top : offset.top+$button.outerHeight()+3
				})
				
				this.inSelect = true;
			}
		},

		createItem : function(model){
			var self = this;
			var $li = $('<li></li>');
			$li.data('value', model.get('value'));
			$li.html(model.get('html'));
			$li.click(function(){
				self.select(model.get('value'));
				self.toggle();
			});
			if(model.get('selected')){
				$li.addClass('selected');
			}
			return $li;
		},

		select : function(value){

			this.collection.select(value);

			var $ul = $('.lblend-select-dropdown-list'),
				$lis = $ul.children('li'),
				self = this;

			$lis.removeClass('selected');
			$ul.children('li').each(function(){
				var $this = $(this);
				if( $this.data('value') == value ){
					$this.addClass('selected');
				}
			})
			
			var model = this.collection.where({
				value : value
			})[0];
			if(model){
				this.$el.find('.lblend-select-button').html(model.get('html'));
			}
		}
		
	})

	Collection.prototype.__viewconstructor__ = View;

	return {
		Collection : Collection,
		View : View
	}
})