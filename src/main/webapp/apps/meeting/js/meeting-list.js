/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		comm = require("../../common/common");
	
	function PageScript(){
		this.statusText = {
			"S1": "待执行",
			"S2": "已取消",
			"S3": "已完成"
		}
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
			
			// 初始化分页组件
			pager.init(10, page.renderGrid);
			
			$.useModule(['datetimepicker'], function(){
				
				$("#date").datetimepicker({
				    language:  "zh-CN",
				    weekStart: 1,
				    todayBtn:  1,
				    autoclose: 1,
				    todayHighlight: 1,
				    startView: 2,
				    minView: 2,
				    forceParse: 0,
				    format: "yyyy-mm-dd"
				}).on('changeDate', function(ev){
					if(ev.date){
						$('#status').prop('checked', false);
					}
					page.loadData();
				});
				
				//page.loadData();
				
			});
			
			
			page.bindEvent();
		},
		
		loadData: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'meet/loadUserMeetingList',
				data: {
					date: $('#date').val(),
					status: $('#status').is(":checked") ? 'now' : '',
					mycreate: $('#mycreate').is(":checked") ? 'yes' : ''
				},
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
			var stateErr = '';
			if(data.numberOfElements && data.content){
				page.RowData = {};
				for(var i = 0; i < data.numberOfElements; i++){
					obj = data.content[i];
					
					page.RowData["row-" + obj.rowId] = obj;
					stateErr = page.checkStatus(obj.status, obj.meetDate, obj.meetEnd);
					trHtmls += laytpl('meet-list.html').render({
						"rowId": obj.rowId,
						"subject": obj.meetSubject,
						"boardroom": obj.boardroomName || obj.boardroom,
						"initiator": obj.initiatorName,
						"conferenceClerk": obj.conferenceClerkName || '<i>未指定</i>',
						"start": page.formatTime(obj.meetDate, obj.meetStart),
						"end": page.formatTime(obj.meetDate, obj.meetEnd),
						"state": stateErr ? 4 : obj.status,
						"status": laytpl('status.tpl').render({
							status: page.statusText["S" + obj.status] + stateErr,
						}),
						"statusValue": obj.status,
						"buttons": (function(){
							var btnHtml = '';
							if(obj.status == 1){
								if(obj.conferenceClerk == page.user.rowId || obj.initiator == page.user.rowId || 'admin' == page.user.account){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn btn-minutes",
										"icon": "icon-file-text-o",
										"title": "会议纪要",
										"rightCode": "edit"
									}) + '&nbsp;';
								}
							}
							btnHtml += laytpl('list-btn.tpl').render({
								"class": "btn-info btn-query",
								"icon": "icon-info-sign",
								"title": "详情",
								"rightCode": "query"
							}) + '&nbsp;';
							if(obj.status == 1){
								if((obj.initiator == page.user.rowId && page.rights.includes("edit")) || 'admin' == page.user.account){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn-primary btn-edit",
										"icon": "icon-edit",
										"title": "修改",
										"rightCode": "edit"
									}) + '&nbsp;';
								}
								if((obj.initiator == page.user.rowId  && page.rights.includes("edit")) || 'admin' == page.user.account){
									btnHtml += laytpl('list-btn.tpl').render({
										"class": "btn-warning btn-del",
										"icon": "icon-remove",
										"title": "取消",
										"rightCode": "del"
									}) + '&nbsp;';
								}
							}
							if('admin' == page.user.account){
								btnHtml += laytpl('list-btn.tpl').render({
									"class": "btn-danger btn-remove",
									"icon": "icon-trash",
									"title": "删除",
									"rightCode": "del"
								}) + '&nbsp;';
							}
							return btnHtml;
						})()
					});
				}
			} else {
				trHtmls = ':( 没有任何与您有关的会议';
			}
			
			$('#list-box').html(trHtmls);
			
			setTimeout(function(){
				$('[data-toggle="tooltip"]').tooltip();
			}, 200);
			
			// 设定导出配置
			var expCig = {
				showExport: false,
				ctlColumn: false
			};
			// 创建分页条
			pager.create('.pager-box', data, expCig);
		},
		
		formatTime: function(d, t){
			return d + " " + t.substring(0, 2) + ":" + t.substring(2);
		},
		
		checkStatus: function(state, date, end){
			var res = '';
			if(state == 1){
				var num1 = parseInt(date.replace(/[-]/g, '') + end);
				var num2 = parseInt(utils.formatDate(new Date().getTime(), 'yyyyMMddHHmm'));
				if(num2 >= num1){
					res = '<font color="red">[过期未执行或未填写会议纪要]</font>';
				}
			}
			return res;
		},
		
		monitor: function(){
			
		},
		
		bindEvent: function(){			
			$('.clear-btn').on('click', function(){
				$('#date').val('');
				page.loadData();	
			});
			
			$('#status').on('click', function(){
				if($('#status').is(":checked")){
					$('#date').val('');
				}
				page.loadData();			
			});
			
			$('#mycreate').on('click', function(){
				if($('#mycreate').is(":checked")){
					$('#date').val('');
				}
				page.loadData();			
			});
			
			$('#list-box').on('click', '.btn-query', function(){
				var rid = $(this).parent().data('id');
				if(rid){
					// 创建iframe弹出框
					window['$detailDialog'] = new $.zui.ModalTrigger({
						name: 'detailFrame',
						title: '会议明细',
						backdrop: 'static',
						moveable: true,
						timeout: consts.PAGE_LOAD_TIME,
						width: $(window).width() - 20,
						height: $(window).height() - 20,
						iframe: './meeting_detail.html?rid=' + rid
					});
					// 显示弹出框
					$detailDialog.show();
				}
			});
			
			$('#list-box').on('click', '.btn-edit', function(){
				var rid = $(this).parent().data('id');
				if(rid){
					parent.jumpUpdatePage(rid);
				}
			});
			
			$('#list-box').on('click', '.btn-del', function(){
				var rid = $(this).parent().data('id');
				if(rid){
					$.confirm({
						title: '提示',
						yesText: '确认取消',
						cancelText: '关闭',
						msg: '您确定要取消此次会议吗？',
						yesClick: function($modal){
							var zuiLoad = new $.ZuiLoader().show('处理中...');
							ajax.post({
								url: 'meet/cancelMeeting',
								data: {
									id: rid
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									alert("取消成功");
									page.loadData();
								} else {
									error("取消失败：" + msg);
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
			
			$('#list-box').on('click', '.btn-remove', function(){
				var rid = $(this).parent().data('id');
				if(rid){
					$.confirm({
						title: '操作警告',
						yesText: '确认删除',
						cancelText: '关闭',
						msg: '您确定要删除此次会议记录吗？',
						yesClick: function($modal){
							var zuiLoad = new $.ZuiLoader().show('处理中...');
							ajax.post({
								url: 'meet/del',
								data: {
									rowId: rid
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									alert("删除成功");
									page.loadData();
								} else {
									error("删除失败：" + msg);
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
			
			$('#list-box').on('click', '.btn-minutes', function(e){
				var rid = $(this).parent().data('id');
				if(rid){
					// 创建iframe弹出框
					window['$minutesDialog'] = new $.zui.ModalTrigger({
						name: 'minutesFrame',
						title: '填报会议纪要',
						backdrop: 'static',
						moveable: true,
						timeout: consts.PAGE_LOAD_TIME,
						width: $(window).width() - 20,
						height: $(window).height() - 20,
						iframe: './meeting_minutes.html?rid=' + rid
					});
					// 显示弹出框
					$minutesDialog.show();
				}
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.loadMeetList = page.loadData();
	
});