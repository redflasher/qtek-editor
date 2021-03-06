//==========================
// Hierarchy.js
// 场景对象层级
//==========================
define(function(require, exports, module){
	
	var UIBase = require('../Core/UIBase/index');
	UIBase.Mixin = require('../Core/UIBase/Mixin/index');
	var hub = require('../Core/Hub').getInstance();
	var Assets = require('../Core/Assets/index');
	var FS = Assets.FileSystem;

	var view,
		treeView,
		// save scene;
		scene;

	function getInstance(){
		if(view){
			return {
				view : view
			}
		}

		view = new UIBase.Panel.View;
		view.setName('Hierarchy');
		view.$el.attr('id', 'Hierarchy');

		UIBase.Mixin.Scrollable.applyTo( view );

		treeView = new UIBase.Tree.View;
		treeView.root.owner = 'scene';
		
		view.appendView( treeView );

		handleHubEvent();
		initTreeView();

		return {
			view : view
		}
	}

	function handleHubEvent(){
		hub.on('created:scene', function(_scene){
			scene = _scene;

			treeView.model.set('json', [{
				type : 'folder',	
				name : scene.name,
				icon : 'icon-node icon-small'
			}])
			_.extend(treeView.find('/'+scene.name).acceptConfig, acceptConfig.node);
		})
		// update scene
		hub.on('added:node', function(node, parent){
			var path = parent.getPath();
			var treeNode = treeView.find(path);
			
			if( ! treeNode){
				console.warn('node '+path+' not exist in the scene tree');
				return;
			}
			// recursive add 
			function walk(sceneNode, treeParent){
				var treeNode = createTreeNode(sceneNode);
				treeParent.add(treeNode, true);
				_.each(sceneNode.children, function(_node){
					// ignore helper
					if( ! _node.__helper__){
						walk(_node, treeNode);
					}
				})
			}

			walk(node, treeNode);
		})
		// select object
		hub.on('selected:node', function(node){
			// need to be silent to prevent recursive event call
			treeView.select( node.getPath(), false, true );
		})
		hub.on('removed:node', function(node){
			treeView.remove( node.getPath(), true );
		})
	}

	var acceptConfig = {
		'node' : {
			'prefab' : {
				accept : function(json){
					if( ! (json instanceof FileList) ){
						// data from project assets
						if(json.owner == 'project' && json.dataType == 'prefab'){
							return true;
						}
					}
				},
				accepted : function(json){
					var fsNode = FS.root.find(json.dataSource);
					if( ! fsNode){
						console.warn('file '+json.dataSource+' is not in the project');
						return;
					}
					var node = fsNode.data.getInstance();
					var parentNode = scene.getNode( this.getPath() );
					hub.trigger('add:node', node, parentNode );
				}
			}
		}
	}

	function initTreeView(){

		treeView.on('moved:node', function(parent, parentPrev, node){
			var nodePath = parentPrev.getPath() + '/' + node.name;
			var sceneNode = scene.getNode( nodePath );
			if( ! sceneNode){
				console.warn('scene node '+ nodePath + ' not existed');
				return;
			}
			hub.trigger('add:node', sceneNode, parent.getPath(), true );
		})

		treeView.on('selected:node', function(node){
			var sceneNode = scene.getNode( node.getPath() );
			if( ! sceneNode){
				console.warn('scnen node'+nodePath+' not existed');
				return;
			}
			hub.trigger('select:node', sceneNode );
		})
	}

	function createTreeNode( sceneNode ){
		if( sceneNode instanceof THREE.Camera ){
			var node = new UIBase.Tree.File(sceneNode.name);
			node.icon = 'icon-small icon-camera';
		}
		else if( sceneNode instanceof THREE.Light ){
			var node = new UIBase.Tree.File(sceneNode.name);
			node.icon = 'icon-small icon-light';
		}
		else if( sceneNode instanceof THREE.Mesh ){
			var node = new UIBase.Tree.File(sceneNode.name);
			node.icon = 'icon-small icon-node';
		}
		else if( sceneNode instanceof THREE.Object3D ){
			var node = new UIBase.Tree.Folder(sceneNode.name);
			node.icon = 'icon-small icon-node';
			_.extend(node.acceptConfig, acceptConfig.node);

		}
		return node;
	}


	return {
		getInstance : getInstance
	}
})