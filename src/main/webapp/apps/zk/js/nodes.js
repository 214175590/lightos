/**
 * 
 */
define(function(require, exports, module) {
	var zTree = {};
	var fillterNodes = {
		word: '',
		nodes: [],
		index: 0
	};
	
	function PageScript(){
		this.$obj = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			if(parent['$obj']){
				page.$obj = parent['$obj'];
				$.useModule(['ztree'], function(){
					
					page.loadTrees();
				});
			}
			
			page.bindEvent();
		},
		
		loadTrees: function(){
			
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'zknode/nodes',
				data: {
					ip: page.$obj.ip,
					port: page.$obj.port
				}
			}).done(function(res, rtn, state, msg){
				if(state ){
					page.renderTree(rtn.data);
				} else {
					error("数据加载失败:" + msg);
				}
			}).fail(function(){
				error("数据加载失败");
				log.error('error：', arguments);
			}).always(function(){
				zuiLoad.hide();
			});
			
		},
		
		renderTree: function(data){
			var setting = {
				check: {
					enable: false
				},
				async:{
					autoParam: ["id"],
					contentType: "application/x-www-form-urlencoded",
					enable: true,
					type: "post",
					url: consts.WEB_BASE + 'zknode/childs',
					otherParam: ['ip', page.$obj.ip, 'port', page.$obj.port]
				},
				data: {
					simpleData: {
					   enable: true
					}
				},
				callback: {
					onClick: function(event, treeId, treeNode, clickFlag){
						if(!treeNode.isParent && clickFlag == 1){
							page.showNodeInfo(treeNode);
						} else {
							page.hideNodeInfo();
						}
					},
					onRightClick : function(event, treeId, treeNode){
						if(treeNode){
							zTree.selectNode(treeNode);
							page.showRMenu("node", event.clientX, event.clientY);
						}
					}
					
				}
			};
			zTree = $.fn.zTree.init($('#ztree'), setting, data);
		},
		
		loadChildTrees: function(node){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'zknode/childs',
				data: {
					rowId: page.$obj.obj,
					ip: page.$obj.ip,
					port: page.$obj.port,
					node: node
				}
			}).done(function(res, rtn, state, msg){
				if(state ){
					log.info(rtn);
					page.renderChildTree(rtn.data);
				} else {
					error("数据加载失败:" + msg);
				}
			}).fail(function(){
				error("数据加载失败");
				log.error('error：', arguments);
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		/**
		   * 显示数节点菜单
		   * @param type
		   * @param x
		   * @param y
		   */
		showRMenu: function(type, x, y) {
			$("#rMenu ul").show();
			var rMenu = $("#rMenu");
			rMenu.css({"top": y + "px", "left": x + "px", "visibility": "visible"});
			
			$("body").bind("mousedown", function(event){
				if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
					page.hideMenu();
				}
			});
		 },
		  /**
		   * 隐藏树节点菜单
		   */
		hideMenu: function(){
			$("#rMenu").css({"visibility" : "hidden"});
		},
		
		bindEvent: function(){
			
			$('#m_add').on('click', function(){
				page.hideMenu();
				var html = laytpl('addnode.html').render({
					name: '', data: ''
				});
				$.confirm({
					title: '添加子节点',
					id: 'add',
					msg: html,
					yesText: '确定',
					yesClick: function(){
						var selectNode = zTree.getSelectedNodes()[0];
						var nodeId = $('#node_name').val();
						var nodeData = $('#node_data').val();
						var param = {
							pId : selectNode.id,
							id : nodeId,
							data : nodeData,
							ip: page.$obj.ip,
							port: page.$obj.port
						};
						ajax.post({
							url: 'zknode/add',
							data: param
						}).done(function(res, rtn, state, msg){
							if(state){
								alert('添加成功');
								zTree.reAsyncChildNodes(selectNode, "new");
								zTree.reAsyncChildNodes(selectNode, "refresh");
								zTree.selectNode(selectNode);
								zTree.setting.callback.onClick(null, zTree.setting.treeId, selectNode);
							} else {
								error(msg);
							}
						}).fail(function(){
							error("添加失败");
						});
				    }
				});
			});
			
			//删除子节点
			$('#m_del').on('click',function(){
				page.hideMenu();
				var selectNode = zTree.getSelectedNodes()[0];
				var fullId = selectNode.id;
				$.confirm({
					title: '警告',
					id: 'del',
					msg: '您确定要删除节点吗？<br>删除后将无法恢复，请谨慎操作.',
					yesText: '确定',
					yesClick: function(){
						var param = {
							fullId : fullId,
							ip: page.$obj.ip,
							port: page.$obj.port
						};
						ajax.post({
							url: 'zknode/del',
							data: param
						}).done(function(res, rtn, state, msg){
							if(state){
								alert('删除成功');
								var parentNode = selectNode.getParentNode();
								zTree.reAsyncChildNodes(parentNode, "new");
								zTree.reAsyncChildNodes(parentNode, "refresh");
							} else {
								error(msg);
							}
						}).fail(function(){
							error("删除失败");
						});
					}
				});
			});
			
			//修改子节点
			$('#m_edit').on('click',function(){
				page.hideMenu();
				var selectNode = zTree.getSelectedNodes()[0];
				var fullId = selectNode.id;
				log.info(selectNode);
				page.getNodeData(fullId, function(state, node){
					if(state){
						var html = laytpl('addnode.html').render({
							name: selectNode.name, data: node.data
						});
						$.confirm({
							title: '修改节点数据',
							id: 'edit',
							msg: html,
							yesText: '确定',
							yesClick: function(){
								var nodeId = $('#node_name').val();
								var nodeData = $('#node_data').val();
								var param = {
									fullId : fullId,
									id : nodeId,
									data : nodeData,
									ip: page.$obj.ip,
									port: page.$obj.port
								};
								ajax.post({
									url: 'zknode/edit',
									data: param
								}).done(function(res, rtn, state, msg){
									if(state){
										var parentNode = selectNode.getParentNode();
										zTree.selectNode(parentNode);
										zTree.setting.callback.onClick(null, zTree.setting.treeId, parentNode);
										alert('修改成功');
									} else {
										error(msg);
									}
								}).fail(function(){
									error("修改失败");
								});
							}
						});
					}
				});
			});
			
			$('#words').on('keyup', function(e){
				var code = e.witch || e.keyCode;
				if(code == 13){
					var $this = $(this),
					word = $this.val();
					if(word){
						if(fillterNodes.word == word && fillterNodes.nodes.length){
							if(fillterNodes.index < (fillterNodes.nodes.length - 1)){
								fillterNodes.index = fillterNodes.index + 1;
							} else {
								fillterNodes.index = 0;
							}
							var node = fillterNodes.nodes[fillterNodes.index];
							zTree.selectNode(node);
							if(node.isParent){
								zTree.expandNode(node, true, false, true);
							}
						} else {
							fillterNodes = {
								word: word,
								nodes: [],
								index: 0
							};
							page.getFilterNode(zTree.getNodes(), word);
							if(fillterNodes.nodes.length){
								var node = fillterNodes.nodes[fillterNodes.index];
								zTree.selectNode(node);
								if(node.isParent){
									zTree.expandNode(node, true, false, true);
								}
							}
						}
					}
				}
			});
			
			$('.btn-reload').on('click', function(){
				page.loadTrees();
			});
		},
		
		getFilterNode: function(nodes, word){
			var node;
			for(var i = 0, k = nodes.length; i < k; i++){
				node = nodes[i];				
				if(node.name.indexOf(word) != -1){
					fillterNodes.nodes.push(node);
				} else if(node.children){
					page.getFilterNode(node.children, word);
				}
			}
		},
		
		getNodeData: function(fullId, func){
			ajax.post({
				url: 'zknode/info',
				data: {
					fullId: fullId,
					ip: page.$obj.ip,
					port: page.$obj.port
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					func && func.call(page, true, rtn);
				} else {
					func && func.call(page, false);
				}
			}).fail(function(){
				func && func.call(page, false);
			});
		},
		
		showNodeInfo: function(node){
			if(node && node.id){
				page.getNodeData(node.id, function(state, zNode){
					if(zNode){
						var html = laytpl('info.html').render({
							id: decodeURIComponent(zNode.id),
							fullId: decodeURIComponent(zNode.fullId),
							nodeModel: zNode.nodeModel,
							data: zNode.data
						});
						$('.node-info').html(html).removeClass('hidden');
					} else {
						var html = laytpl('info.html').render({
							id: decodeURIComponent(node.id),
							fullId: '',
							nodeModel: '',
							data: ''
						});
						$('.node-info').html(html).removeClass('hidden');
					}
				});
			}
		},
		
		hideNodeInfo: function(){
			$('.node-info').addClass('hidden');
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});