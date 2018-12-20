/**
 * 
 */
define(function(require, exports, module) {
	var comm = require("../../common/common");
	
	function PageScript(){
		this.datas = {};
		this.users = {};
		this.flag = '';
		this.rootPath = "";
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
				$('.chosen').chosen();
				
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					
					page.loginOA();
				});
			});
			
			page.bindEvent();
		},
		
		loginOA: function(){
			ajax.post({
				url: 'oa/login',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.rootPath = rtn.rootPath;
					page.loadUserList();
				} 
			}).fail(function(){
				log.error('error：', arguments);
			});
		},
		
		loadUserList: function(){
			ajax.post({
				url: 'oa/personnel',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.renderUserList(rtn.data);
				} else {
					error("数据加载失败:" + msg);
				}
			}).fail(function(){
				error("数据加载失败");
				log.error('error：', arguments);
			}).always(function(){
				page.loadMonitorList();
			});
		},
		
		renderUserList: function(data){
			var ops = [];
			if(_.isObject(data)){
				page.users = {};
				function getChildren(list){
					var obj = {};
					for(var i = 0, k = list.length; i < k; i++){
						obj = list[i];
						if(obj.children && obj.isFolder){
							getChildren(obj.children);
						} else if(!obj.isFolder){
							page.users[obj.user_id] = obj.title;
							///static/images/org/
							ops.push(laytpl('option.html').render({
								uid: obj.uid,
								text: obj.title,
								value: obj.user_id,
								icon: page.rootPath + '/static/images/org/' + obj.icon
							}));
						}
					}
				}
				if(data.children && data.isFolder){
					getChildren(data.children);
				}
				$('#users').html(ops.join('')).trigger('chosen:updated');
			}
		},
		
		loadMonitorList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'sm/list',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.renderMonitorList(rtn.data);
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
		
		renderMonitorList: function(datas){
			var obj = {}, html = [];
			page.datas = {};
			for(var i = 0; i < datas.length; i++){
				obj = datas[i];
				page.datas['id' + obj.rowId] = obj;
				html.push(laytpl('tr.html').render({
					rowId: obj.rowId,
					statusClass: (function(){
						var c = 'success';
						if(obj.code == ''){
							c = 'warning';
						} else if(obj.code != 200 && (obj.code < 300 || obj.code >= 400)){
							c = 'danger';
						}
						return c;
					})(),
					types: obj.typed,
					status: obj.code || '',
					statusText: obj.error || (obj.code ? '服务不可用' : '待检测'),
					address: obj.address,
					remark: obj.remark || '',
					notice: obj.notice == 1 ? 'icon-toggle-on' : 'icon-toggle-off',
					noticeText: obj.notice == 1 ? '关闭通知' : '开启通知',
					process: laytpl('progress.html').render({
						max: obj.times,
						now: 1,
						width: 1
					}),
					edit: page.rights.includes("edit"),
					del: page.rights.includes("del")
				}));
			}
			$('#dataBody').html(html.join(''));
			
			setTimeout(function(){
				$('.result-panel .icon').tooltip();
			}, 300);
		},
		
		wsMessage: function(pack){
			if(pack){
				if(pack.head.type == 'check'){
					log.info(pack.head.type, pack);
					if(pack.body.code){
						var code = pack.body.code;
						var c = 'success';
						if(code == ''){
							c = 'warning';
						} else if(code != 200 && (code < 300 || code >= 400)){
							c = 'danger';
						}
						$('#tr-' + pack.body.rowId)
							.removeClass('success').removeClass('danger').removeClass('warning')
							.addClass(c);
						$('#tr-' + pack.body.rowId + ' .td3').text(code);
						$('#tr-' + pack.body.rowId + ' .td4').text(pack.body.msg);
					}
					//page.loadMonitorList();
				} else if(pack.head.type == "process"){
					if(pack.body && pack.body.length){
						var obj = {};
						for(var i = 0, k = pack.body.length; i < k; i++){
							obj = pack.body[i];
							$('.process-' + obj.rowId).html(laytpl('progress.html').render({
								max: obj.max,
								now: obj.now,
								width: parseInt((obj.now/obj.max) * 100) || 1
							}));
						}
					}
				}
			}
		},
		
		bindEvent: function(){
			
			if(top['SYSTEM']){
				top['SYSTEM'].regEvent('monitor.check', 'monitor', page.wsMessage);
			}
			
			$('.btn-save').on('click', function(){
				var param = $('#form').serializeJson();
				if(_.isArray(param.users)){
					param.users = param.users.join(',');
				}
				if(!/(,)$/.test(param.users)){
					param.users = param.users + ',';
				}
				if(param.rowId){
					var item = page.datas['id' + param.rowId];
					param['code'] = item.code;
					param['error'] = item.error;
					param['notice'] = item.notice;
				}
				var zuiLoad = waiting('数据保存中...');
				ajax.post({
					url: 'sm/save',
					data: param
				}).done(function(res, rtn, state, msg){
					if(state){
						$('.panel-left').addClass('hid');
						$('.panel-cover').addClass('hidden');
						page.loadMonitorList();
					} else {
						error("数据保存失败:" + msg);
					}
				}).fail(function(){
					error("数据保存失败");
					log.error('error：', arguments);
				}).always(function(){
					zuiLoad.hide();
				});
				
			});
			
			$('.btn-load').on('click', function(){
				page.loadMonitorList();
			});
			
			$('.btn-cancel').on('click', function(){
				$('.panel-left').addClass('hid');
				$('.panel-cover').addClass('hidden');
			});
			
			$('.btn-add').on('click', function(){
				$('#form')[0].reset();
				$('#rowId').val('');
				$('#typed').val('http').trigger('chosen:updated');;
				$('#users').val('').trigger('chosen:updated');;
				$('.btn-save').removeClass('hidden');
				$('.panel-left').removeClass('hid');
				$('.panel-cover').removeClass('hidden');
			});
			
			$('#typed').on('change', function(){
				var $this = $(this),
					type = $this.val();
				if(type == 'http'){
					$('#address').attr('placeholder', "http(s)://，例如：http://www.baidu.com");
				} else {
					$('#address').attr('placeholder', "ip:port，例如：192.168.20.32:8082");
				}
			});
			
			$('#dataBody').on('click', '.btn-check', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				if(rowId){
					var zuiLoad = waiting('检测中...');
					ajax.post({
						url: 'sm/check',
						data: {
							rowId: rowId
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							
						} else {
							error("数据保存失败:" + msg);
						}
					}).fail(function(){
						error("数据保存失败");
						log.error('error：', arguments);
					}).always(function(){
						zuiLoad.hide();
					});
				}
			});
			
			$('#dataBody').on('click', '.btn-edit', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['id' + rowId];
				if(item){
					$('#rowId').val(item.rowId);
					$('#typed').val(item.typed).trigger('chosen:updated');
					$('#address').val(item.address);
					$('#remark').val(item.remark);
					$('#times').val(item.times);
					$('#email').val(item.email);
					$('#users').val(item.users.split(',')).trigger('chosen:updated');
				}
				$('.btn-save').removeClass('hidden');
				$('.panel-left').removeClass('hid');
				$('.panel-cover').removeClass('hidden');
			});
			
			$('#dataBody').on('click', '.btn-detail', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['id' + rowId];
				if(item){
					var html = laytpl('info.html').render({
						typed: item.typed,
						address: item.address,
						remark: item.remark,
						times: item.times,
						email: item.email,
						users: (function(){
							var names = [];
							var us = item.users.split(',');
							for(var i = 0, k = us.length; i < k; i++){
								if(us[i]){
									names.push(page.users[us[i]]);
								}
							}
							return names.join('，');
						})()
					});
					$.confirm({
						title: item.remark + " 明细",
						msg: html,
						showYes: false,
						cancelText: '关闭'
					});
				}
			});
			
			$('#dataBody').on('click', '.btn-notice', function(){
				var $this = $(this),
				rowId = $this.parent().data('id');
				var item = page.datas['id' + rowId];
				if(item){
					if(item.notice == 1){
						item.notice = 2;
					} else if(item.notice == 2){
						item.notice = 1;
					}
					var zuiLoad = waiting('数据保存中...');
					ajax.post({
						url: 'sm/save',
						data: item
					}).done(function(res, rtn, state, msg){
						if(state){
							if(item.notice == 1){
								$this.removeClass('icon-toggle-off').addClass('icon-toggle-on').attr('关闭通知');
							} else if(item.notice == 2){
								$this.removeClass('icon-toggle-on').addClass('icon-toggle-off').attr('开启通知');
							}
						} else {
							error("数据保存失败:" + msg);
						}
					}).fail(function(){
						error("数据保存失败");
						log.error('error：', arguments);
					}).always(function(){
						zuiLoad.hide();
					});
				}
			});

			$('#dataBody').on('click', '.btn-del', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['id' + rowId]
				if(item){
					$.confirm({
						msg: '确定要删除此监控项【' + item.remark + '】吗？',
						yesText: '确认删除',
						yesClick: function($modal){
							$modal.modal('hide');
							
							var zuiLoad = waiting('数据加载中...');
							ajax.post({
								url: 'sm/del',
								data: {
									rowId: rowId
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									page.loadMonitorList();
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
			
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});