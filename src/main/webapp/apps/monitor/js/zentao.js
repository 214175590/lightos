/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		comm = require("../../common/common");
	
	function PageScript(){
		this.datas = {};
		this.users = {};
		this.flag = '';
		this.rootPath = "";
		this.dataStatus = 0;
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			
			$.useModule(['chosen', 'datetimepicker'], function(){
				
				$('.chosen').chosen();
				
				$('#firstTime').datetimepicker({
					language:  "zh-CN",
				    weekStart: 1,
				    todayBtn:  1,
				    autoclose: 1,
				    todayHighlight: 1,
				    startView: 1,
				    minView: 0,
				    maxView: 1,
				    forceParse: 0,
				    format: 'hh:ii:ss'
				}).on('change', function(){
					
				});
				
			});
			
			// 初始化分页组件
			pager.init(10, page.renderClockList);
			
			page.loginOA();
			
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
				page.loadDataList();
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
				$('#manager').html(ops.join('')).trigger('chosen:updated');
			}
		},
		
		loadDataList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'zentao/list',
				data: {status: page.dataStatus}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.renderTaskList(rtn.data);
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
		
		renderTaskList: function(datas){
			var obj = {}, html = [];
			page.datas = {};
			for(var i = 0; i < datas.length; i++){
				obj = datas[i];
				page.datas['tr-' + obj.rowId] = obj;
				html.push(laytpl('tr.html').render({
					rowId: obj.rowId,
					proId: obj.proId,
					name: obj.name,
					manager: obj.manager ? (function(){
						var s = [], u;
						var arr = obj.manager.split(',');
						for(var j = 0; j < arr.length; j++){
							u = page.users[arr[j]];
							if(u){
								s.push(u);
							}
						}
						return s.join(',');
					})() : '未设置',
					firstTime: obj.firstTime || '',
					timeInterval: obj.timeInterval ? (obj.timeInterval/(60 * 1000)) + '分钟': '',
					notice: obj.status == 2 ? 'icon-toggle-on' : 'icon-toggle-off',
					noticeText: obj.status == 2 ? '关闭提醒' : '开启提醒',
					statusClass: obj.status == 1 ? '' : 'success',
					edit: page.rights.includes("edit")
				}));
			}
			$('#dataBody').html(html.join(''));
			
			setTimeout(function(){
				$('.result-panel .icon').tooltip();
			}, 300);
			
		},
		
		bindEvent: function(){
			
			$('.btn-save').on('click', function(){
				var param = $('#form').serializeJson();
				if(_.isArray(param.manager)){
					param.manager = param.manager.join(',');
				}
				if(!/(,)$/.test(param.manager)){
					param.manager = param.manager + ',';
				}
				if(param.rowId){
					var item = page.datas['tr-' + param.rowId];
					param['proId'] = item.proId;
					param['name'] = item.name;
					param['status'] = item.status;
				}
				if(param.time != ''){
					param.timeInterval = parseInt(param.time) * 60 * 1000
				}
				var zuiLoad = waiting('数据保存中...');
				ajax.post({
					url: 'zentao/save',
					data: param
				}).done(function(res, rtn, state, msg){
					if(state){
						$('.panel-left').addClass('hid');
						$('.panel-cover').addClass('hidden');
						page.loadDataList();
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
			
			$('.btn-reset').on('click', function(){
				var zuiLoad = waiting('数据加载中...');
				ajax.post({
					url: 'zentao/reset',
					data: {}
				}).done(function(res, rtn, state, msg){
					if(state && rtn.data){
						page.renderTaskList(rtn.data);
					} else {
						error("数据加载失败:" + msg);
					}
				}).fail(function(){
					error("数据加载失败");
					log.error('error：', arguments);
				}).always(function(){
					zuiLoad.hide();
				});
			});
			
			$('.btn-cancel').on('click', function(){
				$('.panel-left').addClass('hid');
				$('.panel-cover').addClass('hidden');
			});
			
			$('#dataBody').on('click', '.btn-edit', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['tr-' + rowId];
				if(item){
					$('#rowId').val(item.rowId);
					$('#proId').text(item.proId);
					$('#name').text(item.name);
					$('#firstTime').val(item.firstTime);
					$('#time').val(item.timeInterval/(60 * 1000));
					$('#manager').val((item.manager || "").split(',')).trigger('chosen:updated');
				}
				$('.btn-save').removeClass('hidden');
				$('.panel-left').removeClass('hid');
				$('.panel-cover').removeClass('hidden');
			});
			
			$('#dataBody').on('click', '.btn-detail', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['tr-' + rowId];
				if(item){
					var html = laytpl('info.html').render({
						proId: item.proId,
						name: item.name,
						firstTime: item.firstTime || "",
						timeInterval: item.timeInterval/(60 * 1000),
						manager: (function(){
							var names = [];
							if(item.manager){
								var us = item.manager.split(',');
								for(var i = 0, k = us.length; i < k; i++){
									if(us[i]){
										names.push(page.users[us[i]]);
									}
								}
							}
							return names.join('，');
						})()
					});
					$.confirm({
						title: item.name + " 明细",
						msg: html,
						showYes: false,
						cancelText: '关闭'
					});
				}
			});
			
			$('#dataBody').on('click', '.btn-notice', function(){
				var $this = $(this),
					rowId = $this.parent().data('id'),
					$tr = $('#tr-' + rowId);
				var item = page.datas['tr-' + rowId];
				if(item){
					if(item.status == 1){
						item.status = 2;
					} else if(item.status == 2){
						item.status = 1;
					}
					var zuiLoad = waiting('数据保存中...');
					ajax.post({
						url: 'zentao/save',
						data: item
					}).done(function(res, rtn, state, msg){
						if(state){
							if(item.status == 2){
								$this.removeClass('icon-toggle-off').addClass('icon-toggle-on').attr('关闭提醒');
								$tr.addClass('success');
							} else if(item.status == 1){
								$this.removeClass('icon-toggle-on').addClass('icon-toggle-off').attr('开启提醒');
								$tr.removeClass('success');
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
			
			
			$('.btn-status').on('click', function(){
				var $btn = $(this),
					status = $btn.data('status');
				$('.btn-status').removeClass('btn-success').addClass('btn-primary');
				$btn.removeClass('btn-primary').addClass('btn-success');
				page.dataStatus = status;
				page.loadDataList();
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});