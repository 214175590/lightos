/**
 * 
 */
define(function(require, exports, module) {
	var comm = require("../../common/common");
	
	function PageScript(){
		this.datas = [];
		this.flag = '';
	}
	
	PageScript.prototype = {
		
		init: function(){
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			if(!page.rights.includes("add")){
				$('.btn-add').remove;
			}
			
			$.useModule(['chosen'], function(){
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					
					page.loadDockerList();
				});
				
			});
			
			page.bindEvent();
		},
		
		loadDockerList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'docker/list',
				data: {
					_pageIndex: page.dataIndex,
					_pageSize: page.dataSize
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.datas = rtn.data;
					page.renderDockerList(rtn.data);
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
		
		renderDockerList: function(datas){
			var obj = {}, html = [];
			for(var i = 0; i < datas.numberOfElements; i++){
				obj = datas.content[i];
				html.push(laytpl('node.html').render({
					id: obj.rowId,
					ip: obj.ip,
					port: obj.port,
					desc: obj.remark || '',
					status: '',
					root: consts.WEB_BASE,
					version: obj.version ? obj.version.substring(0, obj.version.indexOf(',')) : '',
					images: obj.images || '0',
					runs: obj.runs || '0',
					edit: page.rights.includes('edit'),
					del: page.rights.includes('edit'),
					cmd: page.rights.includes('cmd')
				}));
			}
			$('.list').html(html.join(''));
			
			setTimeout(function(){
				$('.tools .icon').tooltip();
			}, 300);
			
			page.loadNodeInfo();
		},
		
		loadNodeInfo: function(){
			var obj = null, res = null;
			if(page.datas){
				for(var i = 0; i < page.datas.numberOfElements; i++){
					obj = page.datas.content[i];
					ajax.post({
						url: 'docker/version',
						data: {
							rowId: obj.rowId
						}
					}).done(function(res, rtn, state, msg){
						
					}).fail(function(){
						error("数据加载失败");
						log.error('error：', arguments);
					});
				}
			}
			return res;
		},
		
		linuxData: function(pack){
			//log.info("--->", pack);
			var body = pack.body;
			var doc = page.getDockerByIp(pack.head.serverIp);
			if(doc){
				var $node = $('#docker-' + doc.rowId);
				$node.addClass('ONLINE');
				if(/docker -v\r\n$/g.test(body)){
					page.flag = 'v';
				} else if(/docker images\r\n$/g.test(body)){
					page.flag = 'images';
				} else if(/docker ps\r\n$/g.test(body)){
					page.flag = 'ps';
				}
				
				if(page.flag == 'v' && /^Docker version/g.test(body)){
					var s1 = body.split(',')[0];
					s1 = s1.substring("Docker version ".length);
					$node.find('.box .line.v').text('版本号：' + s1);
				} else if(page.flag == 'images' && /^REPOSITORY/g.test(body)){
					var arr = body.split('\r\n');
					var c = 0;
					for(var i = 0, k = arr.length; i < k; i++){
						if(arr[i].length > 10){
							c++;
						}
					}
					$node.find('.box .line.i').text('镜像数量：' + (c - 1));
				} else if(page.flag == 'ps' && /^CONTAINER ID/g.test(body)){
					var arr = body.split('\r\n');
					var c = 0;
					for(var i = 0, k = arr.length; i < k; i++){
						if(arr[i].length > 10){
							c++;
						}
					}
					$node.find('.box .line.c').text('运行容器数量：' + (c - 1));
				}
			}
		},
		
		getDockerById: function(id){
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
		
		getDockerByIp: function(ip){
			var obj = null, res = null;
			if(page.datas){
				for(var i = 0; i < page.datas.numberOfElements; i++){
					obj = page.datas.content[i];
					if(obj.ip == ip){
						res = obj;
						break;
					}
				}
			}
			return res;
		},
		
		bindEvent: function(){
			if(top['SYSTEM']){
				top['SYSTEM'].regEvent('linux.data', 'docker', page.linuxData);
			}			
			
			$('.btn-prev').on('click', function(){
				if(!page.datas.first && page.datas.number > 0){
					page.dataIndex = page.datas.number - 1;
					page.loadDockerList();
				} else if(top['SYSTEM']){
					top.SYSTEM.speak('已经是第一页了!!!');
				}
			});
			
			$('.btn-next').on('click', function(){
				if(!page.datas.last && page.datas.number < page.datas.totalPages){
					page.dataIndex = page.datas.number + 1;
					page.loadDockerList();
				} else if(top['SYSTEM']){
					top.SYSTEM.speak('已经是最后一页了!!!');
				}
			});
			
			$('.btn-reload').on('click', function(){
				page.loadDockerList();
			});
			
			$('.btn-add').on('click', function(){
				// 创建iframe弹出框
				window['$newDialog'] = new $.zui.ModalTrigger({
					name: 'submitFrame',
					title: '新增Docker节点',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 600,
					height: 450,
					iframe: './docker_add_edit.html?type=add'
				});
				// 显示弹出框
				$newDialog.show();
			});
			
			$('.list').on('click', '.btn-edit', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getDockerById(rowId);
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
						iframe: './docker_add_edit.html?type=edit'
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
				var obj = page.getDockerById(rowId);
				if(obj){
					window['$obj'] = obj;
					$.confirm({
						msg: '确定要删除Docker服务节点【' + obj.ip + ':' + obj.port + '】吗？<br>（只是删除数据库数据，并非删除服务器的Docker节点）',
						yesText: '确认删除',
						yesClick: function($modal){
							$modal.modal('hide');
							
							var zuiLoad = waiting('数据加载中...');
							ajax.post({
								url: 'docker/del',
								data: {
									rowId: rowId
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									page.loadDockerList();
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
			
			$('.list').on('click', '.btn-detail', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var obj = page.getDockerById(rowId);
				if(obj){
					var p = obj.rowId;
					if(top['SYSTEM']){
						top['SYSTEM']['openWindow']({
							title: utils.format("Docker节点控制台 - {0}:{1}", obj.ip, obj.port),
							types: 'exe',
							url: consts.WEB_BASE + 'apps/docker/docker_detail.html?p=' + p,
							width: 1366,
							height: 768,
							needMax: true,
							needMin: true,
							desktopIconId: 'cus-' + new Date().getTime(),
							icon: consts.WEB_BASE + 'content/images/icons/docker.png'
						});
					} else {
						// 创建iframe弹出框
						window['$detailDialog'] = new $.zui.ModalTrigger({
							name: 'submitFrame' + rowId,
							title: utils.format("Docker节点控制台 - {0}:{1}", obj.ip, obj.port),
							backdrop: 'static',
							moveable: true,
							waittime: consts.PAGE_LOAD_TIME,
							width: 1366,
							height: 768,
							iframe: './docker_detail.html?p=' + p
						});
						// 显示弹出框
						$detailDialog.show();
					}
					
				} else {
					error("数据错误，请刷新页面再试");
				}
			});
			
			$('.list').on('click', '.btn-repeat', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				if(rowId){
					ajax.post({
						url: 'docker/reconn',
						data: {
							rowId: rowId
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							document.location.reload();
						} else {
							error("重连失败:" + msg);
						}
					}).fail(function(){
						error("重连失败");
						log.error('error：', arguments);
					});
				}
			});
		}
		
	};
	
	var page = new PageScript();
	window.loadDockerList = page.loadDockerList;
	page.init();
	
});