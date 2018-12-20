/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		comm = require('../../common/common');
	
	function PageScript(){
		this.appType = {
			"exe": "本地应用",
			"frame": "外部应用",
			"link": "链接地址"
		};
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
				name: $('#name').val(),
				title: $('#title').val(),
				types: $('#types').val()
			};
			ajax.post({
				url: 'sys/loadAppList',
				data: data,
				pager: pager
			}).done(function(res, rtn, state, msg){
				log.info(res);
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
			
			if(data.numberOfElements && data.content){
				page.RowData = {};
				for(var i = 0; i < data.numberOfElements; i++){
					obj = data.content[i];
					
					page.RowData["row-" + obj.rowId] = obj;
					trHtmls += laytpl('list-tr.tpl').render({
						"rowId": obj.rowId,
						"trclass": '',
						"name": obj.name,
						"title": obj.title,
						"types": page.appType[obj.types] || '',
						"windowWidth": obj.windowWidth || '',
						"windowHeight": obj.windowHeight || '',
						"isdrag": obj.isdrag || 'false',
						"needClose": obj.needClose || 'false',
						"needMin": obj.needMinimize || 'false',
						"needMax": obj.needMaximize || 'false',
						"location": obj.location || '',
						"belong": obj.belong || '',
						"icon": obj.icon ? laytpl('icon-view.tpl').render({src: consts.WEB_BASE + obj.icon}) : '',
						"buttons": (function(){
							var btnHtml = '';
							if(page.user.account == 'admin' || page.user.account == obj.belong){
								if(page.rights.includes("edit")){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn-edit",
										"icon": "icon-edit",
										"title": "修改",
										"rightCode": "edit"
									}) + '&nbsp;';
									btnHtml += laytpl('list-btn.tpl').render({
										"class": obj.types == 'exe' ? "btn-right" : 'disabled',
										"icon": "icon-key",
										"title": "权限",
										"rightCode": "edit"
									}) + '&nbsp;';
								}
								if(page.rights.includes("user")){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn-user",
										"icon": "icon-user",
										"title": "权限用户",
										"rightCode": "user"
									}) + '&nbsp;';
								}
								if(page.rights.includes("del")){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn-del",
										"icon": "icon-remove",
										"title": "删除",
										"rightCode": "del"
									}) + '&nbsp;';
								}
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
		
		bindEvent: function(){			
			
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
				$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/app_add.html?t=add')).on('load', function(){
					zuiLoad.hide();
					$('#subframe').css({
						'left': 0,
						'top': 0,
						'width': '800px',
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
				$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/app_add.html?t=edit')).on('load', function(){
					zuiLoad.hide();
					$('#subframe').css({
						'left': 0,
						'top': 0,
						'width': '800px',
						'height': '100%'
					});
				});
			});
			
			$('.result-panel').on('click', '.btn-right', function(){
				var $tr = $(this).parent().parent(),
					appId = $tr.data('id');
				var $rtr = $('.right-' + appId);
				if($rtr.hasClass('hidden')){
					var zuiLoad = new $.ZuiLoader().show('处理中...');
					ajax.post({
						url: 'appr/rights',
						data: {
							deskIconId: appId
						}
					}).done(function(res, rtn, state, msg){
						if(state && rtn.data){
							var rights = [];
							for(var i = 0; i < rtn.data.length; i++){
								rights.push(laytpl('ritem.tpl').render({
									rowId: rtn.data[i].rowId,
									appId: rtn.data[i].deskIconId,
									name: rtn.data[i].name,
									code: rtn.data[i].code
								}));
							}
							$('#ibox-' + appId).html(rights.join(''));
							$rtr.removeClass('hidden');
						} else {
							error(msg);
						}
					}).fail(function(){
						error('error');
					}).always(function(){
						zuiLoad.hide();
					});
				} else {
					$rtr.addClass('hidden');
				}
			});
			
			$('.result-panel').on('click', '.btn-del', function(){
				var $tr = $(this).parent().parent(),
					rowId = $tr.data('id');
				if(rowId){
					$.confirm({
						title: '温馨提示',
						msg: '您确定要删除此应用吗？',
						yesText: '取消',
						cancelText: '删除',
						yesClick: function($modal){
							$modal.modal('hide');
						}, cancelClick: function($modal){
							var zuiLoad = new $.ZuiLoader().show('数据加载中...');
							ajax.post({
								url: 'sys/delApp',
								data: {rowId: rowId}
							}).done(function(res, rtn, state, msg){
								log.info(res);
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
			
			
			$('.result-panel').on('click', '.del-btn', function(){
				var $btn = $(this),
					$parent = $btn.parent();
				$parent.remove();
			});
			
			$('.result-panel').on('click', '.btn-new', function(){
				var $btn = $(this),
					$form = $btn.parent(),
					appId = $btn.data('id');
				var name = $form.find('.name').val(),
					code = $form.find('.code').val();
				if(name && code){
					var zuiLoad = new $.ZuiLoader().show('处理中...');
					ajax.post({
						url: 'appr/add',
						data: {
							deskIconId: appId,
							name: name,
							code: code
						}
					}).done(function(res, rtn, state, msg){
						log.info(res);
						if(state && rtn.data){
							$('#ibox-' + appId).append(laytpl('ritem.tpl').render({
								rowId: rtn.data.rowId,
								appId: rtn.data.deskIconId,
								name: rtn.data.name,
								code: rtn.data.code
							}));
							$form.find('.name,.code').val('');
						} else {
							error(msg);
						}
					}).fail(function(){
						error('error');
					}).always(function(){
						zuiLoad.hide();
					});
				} else {
					error('请填写权限名称与编码');
				}
			});
			
			$('.result-panel').on('click', '.btn-user', function(){
				$('body').css({'overflow': 'hidden'});
				$('.subpage-box').css({
					'left': $('body').scrollLeft(),
					'top': $('body').scrollTop()
				}).removeClass('hidden');
				var $tr = $(this).parent().parent();
				var obj = page.RowData["row-" + $tr.data('id')];
				window['$obj'] = obj;
				var zuiLoad = new $.ZuiLoader().show('数据加载中...');
				ajax.post({
					url: 'appr/rights',
					data: {
						deskIconId: obj.rowId
					}
				}).done(function(res, rtn, state, msg){
					if(state && rtn.data){
						window['$rights'] = rtn.data;
						$('#subframe').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/auth/app_user.html')).on('load', function(){
							$('#subframe').css({
								'left': 0,
								'top': 0,
								'width': '100%',
								'height': '100%'
							});
						});
					} else {
						error(msg);
					}
				}).fail(function(){
					error('error');
				}).always(function(){
					zuiLoad.hide();
				});
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.closeFrame = page.closeFrame;
});