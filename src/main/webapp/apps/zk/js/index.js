/**
 * 
 */
define(function(require, exports, module) {
	var comm = require("../../common/common");
	
	function PageScript(){
		this.dataIndex = 0;
		this.dataSize = 10;
		this.datas = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			if(!page.rights.includes("add")){
				$('.btn-add').remove;
			}
			
			page.loadZkServerList();
			
			page.bindEvent();
		},
		
		loadZkServerList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'zk/all',
				data: {
					_pageIndex: page.dataIndex,
					_pageSize: page.dataSize
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.numberOfElements){
					page.renderZkList(rtn);
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
		
		renderZkList: function(datas){
			var obj = {}, html = [];
			for(var i = 0; i < datas.numberOfElements; i++){
				obj = datas.content[i];
				html.push(laytpl('node.html').render({
					id: obj.rowId,
					ip: obj.ip,
					port: obj.port,
					desc: obj.desc,
					status: obj.serverStatusEnum,
					root: consts.WEB_BASE,
					version: obj.version ? obj.version.substring(0, obj.version.indexOf(',')) : '',
					connections: obj.connections,
					nodeCount: obj.nodeCount,
					edit: page.rights.includes("edit"),
					del: page.rights.includes("del"),
					cmd: page.rights.includes("cmd")
				}));
			}
			page.datas = datas;
			$('.list').html(html.join(''));
			
			setTimeout(function(){
				$('.tools .icon').tooltip();
			}, 300);
		},
		
		getZkById: function(id){
			var obj = null, res = null;
			if(page.datas){
				for(var i = 0; i < page.datas.numberOfElements; i++){
					obj = page.datas.content[i];
					if(obj.rowId == id){
						res = obj;
						break;
					}
				}
			}
			return res;
		},
		
		showDetailPage: function(rowId){
			var obj = page.getZkById(rowId);
			if(obj){
				window['$obj'] = obj;
				// 创建iframe弹出框
				window['$nodeDialog'] = new $.zui.ModalTrigger({
					name: 'submitFrame',
					title: 'Zookeeper节点',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 1080,
					height: 768,
					iframe: comm.getSubPageUrl(consts.WEB_BASE + 'apps/zk/zk_nodes.html')
				});
				// 显示弹出框
				$nodeDialog.show();
			} else {
				error("数据错误，请刷新页面再试");
			}
		},
		
		bindEvent: function(){
			
			$('.btn-prev').on('click', function(){
				if(!page.datas.first && page.datas.number > 0){
					page.dataIndex = page.datas.number - 1;
					page.loadZkServerList();
				} else if(top['SYSTEM']){
					top.SYSTEM.speak('已经是第一页了!!!');
				}
			});
			
			$('.btn-next').on('click', function(){
				if(!page.datas.last && page.datas.number < page.datas.totalPages){
					page.dataIndex = page.datas.number + 1;
					page.loadZkServerList();
				} else if(top['SYSTEM']){
					top.SYSTEM.speak('已经是最后一页了!!!');
				}
			});
			
			$('.btn-reload').on('click', function(){
				page.loadZkServerList();
			});
			
			$('.btn-add').on('click', function(){
				// 创建iframe弹出框
				window['$newDialog'] = new $.zui.ModalTrigger({
					name: 'submitFrame',
					title: '新增Zookeeper服务节点',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 600,
					height: 450,
					iframe: comm.getSubPageUrl(consts.WEB_BASE + 'apps/zk/zk_add_edit.html?type=add')
				});
				// 显示弹出框
				$newDialog.show();
			});
			
			$('.list').on('click', '.btn-detail', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				page.showDetailPage(rowId);
			});
			
			$('.list').on('click', '.zk-node .name', function(){
				var $this = $(this),
					rowId = $this.data('id');
				page.showDetailPage(rowId);
			});
			
			$('.list').on('click', '.btn-edit', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getZkById(rowId);
				if(obj){
					window['$obj'] = obj;
					// 创建iframe弹出框
					window['$newDialog'] = new $.zui.ModalTrigger({
						name: 'submitFrame',
						title: '修改Zookeeper服务节点',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 600,
						height: 450,
						iframe: comm.getSubPageUrl(consts.WEB_BASE + 'apps/zk/zk_add_edit.html?type=edit')
					});
					// 显示弹出框
					$newDialog.show();
				} else {
					error("数据错误，请刷新页面再试");
				}
			});

			$('.list').on('click', '.btn-del', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getZkById(rowId);
				if(obj){
					window['$obj'] = obj;
					$.confirm({
						msg: '确定要删除ZK服务节点【' + obj.ip + ':' + obj.port + '】吗？<br>（只是删除数据库数据，并非删除服务器的ZK服务）',
						yesText: '确认删除',
						yesClick: function($modal){
							$modal.modal('hide');
							
							var zuiLoad = waiting('数据加载中...');
							ajax.post({
								url: 'zk/del',
								data: {
									rowId: rowId
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									page.loadZkServerList();
								} else {
									error(msg);
								}
							}).fail(function(){
								error("删除失败");
								log.error('error：', arguments);
							}).always(function(){
								zuiLoad.hide();
							});
						}
					});
				} else {
					error("数据错误，请刷新页面再试");
				}
			});
			
			$('.list').on('click', '.btn-cmd', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getZkById(rowId);
				if(obj){
					window['$obj'] = obj;
					// 创建iframe弹出框
					window['$4cmdDialog'] = new $.zui.ModalTrigger({
						name: 'submitFrame',
						title: 'Zookeeper服务4字命令',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 1080,
						height: 650,
						iframe: comm.getSubPageUrl(consts.WEB_BASE + 'apps/zk/zk_cmd.html')
					});
					// 显示弹出框
					$4cmdDialog.show();
				} else {
					error("数据错误，请刷新页面再试");
				}
			});
			
			$('.list').on('click', '.btn-play', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getZkById(rowId);
				if(obj){
					var zuiLoad = waiting('服务启动中...');
					ajax.post({
						url: 'zk/start',
						data: {
							rowId: rowId
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							alert('启动成功');
							page.loadZkServerList();
						} else {
							error(msg);
						}
					}).fail(function(){
						error("启动失败");
						log.error('error：', arguments);
					}).always(function(){
						zuiLoad.hide();
					});
				} else {
					error("数据错误，请刷新页面再试");
				}
			});
			
		}
		
	};
	
	var page = new PageScript();
	window.loadZkServerList = page.loadZkServerList;
	page.init();
	
});