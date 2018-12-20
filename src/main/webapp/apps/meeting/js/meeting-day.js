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
		};
		this.canAdd = false;
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
			if(page.rights.includes("add")){
				page.canAdd = true;
			}
			
			// 初始化分页组件
			pager.init(10, function(){});
			
			$.useModule(['datetimepicker', 'chosen'], function(){
				
				$("#meetDate").datetimepicker({
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
					page.renderMeetItem();
				});
				
				$("#meetDate").val(utils.formatDate(new Date(), 'yyyy-MM-dd')).datetimepicker('update');
				
				page.loadBoardroom();
			});
			
			page.bindEvent();
		},
		
		loadBoardroom: function(){
			ajax.post({
				url: 'osBoardroom/loadList',
				data: {"_pageSize": 1000}
			}).done(function(res, rtn, state, msg){
				if(state){
					var total = rtn.data.numberOfElements;
					if(total && rtn.data.content){
						var obj, tabs = '', boxs = '';
						for(var i = 0; i < total; i++){
							obj = rtn.data.content[i];
							
							tabs += laytpl('room.tpl').render({
								id: obj.rowId,
								roomName: obj.roomName
							});
							
							boxs += laytpl('room-box.tpl').render({
								name: obj.roomName
							});
						}
						
						$('.result-panel').css('width', ((total + 2) * 142) + 'px');
						$('.title-room-box,.meet-panel').css('width', (total * 142) + 'px');
						
						
						$('.title-room-box').html(tabs);
						$('.meet-panel').html(boxs);
						
						page.renderMeetItem();
					}
				} else {
					error('会议室列表加载失败：' + msg);
				}
			}).fail(function(){
				error('会议室列表加载失败');
			});
			
		},
		
		renderMeetItem: function(){
			var html = [], arr = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24],
				p = 8, hour = '', time = '', timeto = '', time1 = '00', time2 = '30';
			for(var i = 0, k = arr.length; i < k; i++){
				p = arr[i];
				hour = p < 10 ? '0' + p : '' + p;
				if(hour == '24'){
					hour = '00';
				}
				time = hour + (i%2==0 ? time1 : time2);
				timeto = hour + (i%2==0 ? time1 : time2);
				html.push(laytpl('meet-none.tpl').render({
					time: time,
					timeStr: time.substring(0, 2) + ':' + time.substring(2),
					timeStr2: (function(){
						var timeto = time;
						var t1 = parseInt(timeto.substring(0, 2)),
							t2 = parseInt(timeto.substring(2)) + 30;
						if(t2 == 60){
							t2 = '00';
							t1++;
						}
						timeto = (t1 < 10 ? '0' : '') + t1 + ":" + t2;
						return timeto;
					})()
				}));
			}
			$('.meet-box').html(html.join(''));
			
			var clearSelect = function($ele){
				$ele.removeClass('select');
				if($ele.next().hasClass('select')){
					clearSelect($ele.next());
				}
			};
			
			var isselect = false, ismove = false, $meet;
			$('.meet-none').on('mousedown', function(e){
				$('#cmenu').hide();
				$meet = $(this);
				if(e.button != 2 && page.canAdd){
					if(!$meet.hasClass('meet')){
						isselect = true;
						ismove = false;
						$('.meet-none').removeClass('select');
						$meet.addClass('select');
					}
				}
			}).on('mouseover', function(){
				if(isselect && page.canAdd){
					$meet = $(this);
					$meet.addClass('select');
				}
			}).on('mouseout', function(){
				/*if(isselect){
					$meet = $(this);
					if(!$meet.next().hasClass('select')){
						$meet.removeClass('select');
					}
				}*/
			}).on('mousemove', function(){
				if(page.canAdd){
					ismove = true;
				}
			}).on('mouseup', function(e){
				isselect = false;
				if(page.canAdd){
					if(!ismove){
						$meet = $(this);
						if($('.meet-none.select').length > 1){
							clearSelect($meet);
						}
						page.showStartMeet(e);
					} else if(e.button != 2 && !$(this).hasClass('meet')){
						var tempt = -1, continuous = true;
						$('.meet-none.select').each(function(){
							var time = $(this).data('time');
							if(tempt != -1){
								if(parseInt(time) - tempt >= 100){
									continuous = false;
									return;
								}
							}
							tempt = time;
						});
						if(continuous){
							page.showStartMeet(e);
						} else {
							clearSelect($meet);
							$('.meet-none').removeClass('select');
						}
					}
				}
			});
			
			page.loadMeeting();
		},
		
		showStartMeet: function(e){
			if($('.meet-none.select').length){
				try{
					var start, end, times = 0, inx = 0, $ex, isshow = true;
					$('.meet-none.select').each(function(i, ex){
						$ex = $(ex);
						if($ex.hasClass('meet')){
							isshow = false;
						}
						if(!start){
							start = '' + $ex.data('time');
							start = start.substring(0, 2) + ':' + start.substring(2);
						}
						end = '' + $ex.next().data('time');
						times += 0.5;
						if(inx > 0){
							if(!$ex.prev().hasClass('select')){
								isshow = false;
							}
						}
						inx++;
					});
					end = end.substring(0, 2) + ':' + end.substring(2);
					$('.start-menu').text(start + ' - ' + end);
					$('.end-menu').text("时长：" + times + "小时");
					if(isshow){
						var stop = $('body').scrollTop();
						var sleft = $('body').scrollLeft();
						$('#cmenu').show().css({
							left: e.clientX + (sleft || 0),
							top: e.clientY + (stop || 0)
						});
					}
				}catch(e){}
			}
		},
		
		clearMeetNone: function($ele, end){
			var time = parseInt($ele.data('time'));
			if(time < end){
				var $next = $ele.next();
				$ele.remove();
				page.clearMeetNone($next, end);
			}
		},
		
		culateHeight: function(start, end){
			var hour1 = parseInt(start.substring(0, 2)),
				time1 = parseInt(start.substring(2)),
				hour2 = parseInt(end.substring(0, 2)),
				time2 = parseInt(end.substring(2));
			var hour = hour2 - hour1,
				time = time2 - time1;
			if(time > 0){
				hour = hour + 0.5;
			} else if(time < 0){
				hour = hour - 0.5;
			}
			return parseInt(hour * 2);
		},
		
		loadMeeting: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'meet/loadMeetList',
				data: {
					date: $("#meetDate").val(),
					status: 0
				},
				pager: pager
			}).done(function(res, rtn, state, msg){
				if(state){
					log.info(rtn);
					var htmls = '', obj = {}, $ele, th = 1;
					for(var i = 0; i < rtn.data.numberOfElements; i++){
						obj = rtn.data.content[i];
						if(obj.status != 2){ // 已取消会议不显示
							$ele = $('#room-' + obj.boardroomName + ' .time-' + obj.meetStart);
							$ele.addClass('meet').data('id', obj.rowId);
							$ele.addClass('theme' + th);
							$ele.addClass('row-' + page.culateHeight(obj.meetStart, obj.meetEnd));
							$ele.html(laytpl('meet-item.tpl').render({
								subject: obj.meetSubject,
								user: obj.initiatorName,
								start: page.formatTime(obj.meetStart),
								end: page.formatTime(obj.meetEnd)
							}));
							page.clearMeetNone($ele.next(), parseInt(obj.meetEnd));
							th++;
							if(th > 6){
								th = 1;
							}
						}
					}
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		formatTime: function(t){
			return t.substring(0, 2) + ":" + t.substring(2);
		},
		
		bindEvent: function(){
			$('body').on('mouseup', function(e){
				if(e.button == 2){
					$('#cmenu').hide();
					$('.meet-none').removeClass('select');
				}
			});
			
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
			
			$('.meet-panel').on('click', '.meet', function(){
				var rid = $(this).data('id');
				if(rid){
					// 创建iframe弹出框
					window['$detailDialog'] = new $.zui.ModalTrigger({
						name: 'detailFrame',
						title: '会议明细',
						backdrop: 'static',
						moveable: true,
						timeout: consts.PAGE_LOAD_TIME,
						width: $(window).width() - 20,
						height: $(window).height() - 10,
						iframe: comm.getSubPageUrl(consts.WEB_BASE + 'apps/meeting/meeting_detail.html?rid=' + rid)
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
			
			
			$('#cmenu').on('click', function(){
				$('#cmenu').hide();
				var start, end, room;
				$('.meet-none.select').each(function(i, e){
					if(!start){
						start = $(e).data('time');
						room = $(e).parent().data('name');
					}
					end = $(e).next().data('time');
				});
				var date = $('#meetDate').val();
				
				parent.jumpNewPage(room, date, start, end);
			});
			
			$('.meet-panel').on('click', function(e){
				if($(e.target).hasClass('meet-panel')){
					$('.meet-none').removeClass('select');
					$('#cmenu').hide();
				}
			});
			
			$('.search-panel,.time-panel').on('click', function(e){
				$('#cmenu').hide();
				$('.meet-none').removeClass('select');
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});