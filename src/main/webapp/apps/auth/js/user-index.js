/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		comm =  require('../../common/common');
	
	function PageScript(){
		this.rights = [];
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			if(!page.rights.includes("add")){
				$('.add-btn').remove;
			}
			
			// 初始化分页组件
			pager.init(10, page.renderGrid);
			
			$.useModule(['chosen', 'datatable'], function(){
				
				page.loadData();
			});
			
			page.bindEvent();
		},
		
		loadData: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			var data = {
				account: $('#account').val(),
				name: $('#uname').val(),
				company: $('#company').val()
			};
			ajax.post({
				url: 'user/users',
				data: data,
				pager: pager
			}).done(function(res, rtn, state, msg){
				if(state){
					page.renderGrid(rtn.data);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
			
		},
		
		renderGrid: function(data){
			var trHtmls = '', obj = {}, rowId = "";
			var ids = [];
			if(data.numberOfElements && data.content){
				page.RowData = {};
				for(var i = 0; i < data.numberOfElements; i++){
					obj = data.content[i];
					ids.push(obj.account);
					page.RowData["row-" + obj.rowId] = obj;
					trHtmls += laytpl('list-tr.tpl').render({
						"rowId": obj.rowId,
						"trclass": '',
						"account": obj.account,
						"name": obj.name,
						"mobile": obj.mobile || '',
						"email": obj.email || '',
						"company": obj.company || '',
						"dept": obj.dept || '',
						"position": obj.position || '',
						"qq": obj.qq || '',
						"wx": obj.wx || '',
						"buttons": (function(){
							var btnHtml = '';
							if(obj.account == 'admin' || page.user.account == obj.account){
								return '';
							}
							if(page.rights.includes("edit")){
								btnHtml += laytpl('list-btn.tpl').render({
									"class": "btn-edit",
									"icon": "icon-edit",
									"title": "修改",
									"rightCode": "edit"
								});
							}
							if(page.rights.includes("right")){
								btnHtml += laytpl('list-btn.tpl').render({
									"class": "btn-right",
									"icon": "icon-key",
									"title": "权限",
									"rightCode": "edit"
								});
							}
							if(page.rights.includes("del")){
								btnHtml += laytpl('list-btn.tpl').render({
									"class": "btn-del",
									"icon": "icon-remove",
									"title": "删除",
									"rightCode": "del"
								});
							}
							if(page.user.account == 'admin'){
								btnHtml += laytpl('list-btn.tpl').render({
									"class": "btn-kick disabled",
									"icon": "icon-off",
									"title": "踢下线",
									"rightCode": "del"
								});
							}						
							return btnHtml;
						})()
					});
				}
			}
			
			$('#data-body').html(trHtmls);
			setTimeout(function(){
				$('[data-toggle="tooltip"]').tooltip();
			}, 200);
			
			// 设定导出配置
			var expCig = {
				ctlColumn: false,
				showExport: false,
				adjust: true,
				resType: 'array',
				resIndex: []
			};
			// 创建分页条
			pager.create('.pager-box', data, expCig);
			
			page.loadUserStatus(ids);
		},
		
		loadUserStatus: function(ids){
			if(ids && ids.length){
				ajax.post({
					url: 'user/getUserNet',
					data: {ids: ids}
				}).done(function(res, rtn, state, msg){
					if(state && rtn.data){
						for(var id in rtn.data){
							if(rtn.data[id] == 'online'){
								$('#' + id).addClass('online');
								$('#' + id + ' .btn-kick').removeClass('disabled');
							} else {
								$('#' + id).removeClass('online');
								$('#' + id + ' .btn-kick').addClass('disabled');
							}
						}
					}
				}).fail(function(){
					error('error');
				});
			}
		},
		
		closeFrame: function(){
			$('#subframe').css({
				'left': '-450px',
				'width': '450px'
			});
			$('body').css({'overflow': 'auto'});
			$('.subpage-box').addClass('hidden');
			$('#subframe').attr('');
			page.loadData();
		},
		
		wsMessage: function(pack){
			if(pack){
				log.info(pack.head.type, pack);
				if(pack.head.type == "status"){
					var acc = pack.body.user;
					if(pack.body.state == 'online'){
						$('#' + acc).addClass('online');
						$('#' + acc + ' .btn-kick').removeClass('disabled');
					} else {
						$('#' + acc).removeClass('online');
						$('#' + acc + ' .btn-kick').addClass('disabled');
					}
				}
			}
		},
		
		bindEvent: function(){			
			
			if(top['SYSTEM']){
				top['SYSTEM'].regEvent('user.status', 'net', page.wsMessage);
			}
			
			$('.search-btn').on('click', function(){
				page.loadData();
			});
			
			$('.add-btn').on('click', function(){
				$('body').css({'overflow': 'hidden'});
				$('.subpage-box').css({
					'left': $('body').scrollLeft(),
					'top': $('body').scrollTop()
				}).removeClass('hidden');
				var zuiLoad = new $.ZuiLoader().show('页面加载中...');
				$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/user_add.html?t=add')).on('load', function(){
					zuiLoad.hide();
					$('#subframe').css({
						'left': 0,
						'top': 0,
						'width': '450px',
						'height': '100%'
					});
				});
			});
			
			$('.result-panel').on('click', '.btn-edit', function(){
				$('body').css({'overflow': 'hidden'});
				$('.subpage-box').css({
					'left': $('body').scrollLeft(),
					'top': $('body').scrollTop()
				}).removeClass('hidden');
				var $tr = $(this).parent().parent();
				var obj = page.RowData["row-" + $tr.data('id')];
				window['$obj'] = obj;
				var zuiLoad = new $.ZuiLoader().show('数据加载中...');
				$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/user_add.html?t=edit')).on('load', function(){
					zuiLoad.hide();
					$('#subframe').css({
						'left': 0,
						'top': 0,
						'width': '450px',
						'height': '100%'
					});
				});
			});
			
			$('.result-panel').on('click', '.btn-right', function(){
				var $tr = $(this).parent().parent(),
					rowId = $tr.data('id'),
					name = $tr.find('.name-field').text();
				$('body').css({'overflow': 'hidden'});
				$('.subpage-box').css({
					'left': $('body').scrollLeft(),
					'top': $('body').scrollTop()
				}).removeClass('hidden');
				var zuiLoad = new $.ZuiLoader().show('数据加载中...');
				$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/user_desk_icon.html?uid=' + rowId + '&name=' + name)).on('load', function(){
					zuiLoad.hide();
					$('#subframe').css({
						'left': '20%',
						'top': '10%',
						'width': '60%',
						'height': '80%'
					});
				});
			});
			
			$('.result-panel').on('click', '.btn-del', function(){
				var $tr = $(this).parent().parent(),
					rowId = $tr.data('id'),
					name = $tr.find('.name-field').text();
				if(rowId){
					$.confirm({
						title: '温馨提示',
						msg: '您确定要删除【'+name+'】用户吗？',
						yesText: '取消',
						cancelText: '删除',
						yesClick: function($modal){
							$modal.modal('hide');
						}, cancelClick: function($modal){
							var zuiLoad = new $.ZuiLoader().show('数据处理中...');
							ajax.post({
								url: 'user/del',
								data: {rowId: rowId}
							}).done(function(res, rtn, state, msg){
								if(state){
									$modal.modal('hide');
									alert("删除成功");
									page.loadData();
								} else {
									error(msg);
								}
							}).fail(function(){
								error('error');
							}).always(function(){
								zuiLoad.hide();
							});
						}
					});
				}
				
			});
			
			$('.result-panel').on('click', '.btn-kick', function(){
				var that = $(this),
					$tr = that.parent().parent(),
					account = $tr.attr('id'),
					name = $tr.find('.name-field').text();
				if(!that.hasClass('disabled') && account){
					$.confirm({
						title: '温馨提示',
						msg: '您确定要将【'+name+'】用户踢下线吗？',
						yesText: '取消',
						cancelText: '踢出',
						yesClick: function($modal){
							$modal.modal('hide');
						}, cancelClick: function($modal){
							var zuiLoad = new $.ZuiLoader().show('处理中...');
							ajax.post({
								url: 'user/kickout',
								data: {account: account}
							}).done(function(res, rtn, state, msg){
								if(state){
									$modal.modal('hide');
									alert("踢出成功");
									page.loadData();
								} else {
									error(msg);
								}
							}).fail(function(){
								error('error');
							}).always(function(){
								zuiLoad.hide();
							});
						}
					});
				}
			});
			
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.closeFrame = page.closeFrame;
});