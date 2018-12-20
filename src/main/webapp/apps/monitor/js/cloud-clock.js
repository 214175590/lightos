/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		ZV = require('../../../lib/zuiplugin/zui.validate');
	function PageScript(){
		this.datas = {};
		this.users = {};
		this.flag = '';
		this.rootPath = "";
		this.cycleText = {
			"time": "定时",	
			"day": "每天",	
			"week": "每周",	
			"month": "每月",	
			"year": "每年"
		};
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$.useModule(['chosen', 'datetimepicker'], function(){
				
				$('.chosen').chosen();
				
				$('#date').datetimepicker({
				    language:  "zh-CN",
				    weekStart: 1,
				    todayBtn:  1,
				    autoclose: 1,
				    todayHighlight: 1,
				    startView: 2,
				    minView: 2,
				    forceParse: 0,
				    format: "yyyy-mm-dd"
				}).on('change', function(){
					var cycle = $('#cycle').val();
					var $date = $('#date'),
						value = $date.val();
					if(cycle == 'month'){
						$date.val(utils.formatDate(value, 'dd'));
					} else if(cycle == 'year'){
						$date.val(utils.formatDate(value, 'MM-dd'));
					}
					$('#date').datetimepicker('hide');
				});
				
				// 选择时间
				$("#time").datetimepicker({
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
				});
				
				page.$formValodate = ZV('#form');
				
				page.$formValodate.validate({
					rules: {
						cycle: { required: true },
						date: { required: true },
						time: { required: true },
						title: { required: true },
						content: { required: true },
					},
					message: {
						cycle: { required: "不能为空" },
						date: { required: "不能为空" },
						time: { required: "不能为空" },
						title: { required: "不能为空" },
						content: { required: "不能为空" }
					}
				});
				
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					
					page.loginOA();
				});
				
				page.countdownThread();
			});
			
			// 初始化分页组件
			pager.init(10, page.renderClockList);
			
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
				page.loadClockList();
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
		
		loadClockList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'clock/list',
				data: {},
				pager: pager
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.renderClockList(rtn.data);
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
		
		renderClockList: function(datas){
			var obj = {}, html = [];
			page.datas = {};
			for(var i = 0; i < datas.numberOfElements; i++){
				obj = datas.content[i];
				page.datas['tr-' + obj.rowId] = obj;
				html.push(laytpl('tr.html').render({
					rowId: obj.rowId,
					typed: obj.scope == 'private' ? '私有' : '公共',
					title: obj.title,
					time: utils.formatDate(Number(obj.execTime), ''),
					countdown: page.getCountdownTime(obj.execTime),
					cycle: (function(){
						var text = page.cycleText[obj.cycle];
						if(obj.cycle == 'day'){
							text = text + " " + obj.time;
						} else if(obj.cycle == 'week'){
							text = text + " " + obj.date;
						} else if(obj.cycle == 'month'){
							text = text + " " + obj.date;
						} else if(obj.cycle == 'month'){
							text = text + " " + obj.date + " " + obj.time;
						}
						return text;
					})(),
					notice: obj.status == 1 ? 'icon-toggle-on' : 'icon-toggle-off',
					noticeText: obj.status == 1 ? '关闭闹钟' : '开启通知',
					close: obj.status == 3 || obj.userId != page.user.rowId,
					show: obj.userId == page.user.rowId ? '' : 'hidden',
					statusClass: obj.status == 1 ? '' : (obj.status == 2 ? 'danger' : 'success'),
					typeClass: obj.scope == 'private' ? 'pri' : 'pub'
				}));
			}
			$('#dataBody').html(html.join(''));
			
			setTimeout(function(){
				$('.result-panel .icon').tooltip();
			}, 300);
			
			// 创建分页条
			pager.create('.pager-box', datas, {ctlColumn: false});
		},
		
		countdownThread: function(){
			var inter = setInterval(function(){
				if(page.datas){
					for(var id in page.datas){
						$('#' + id + ' .td4').text(page.getCountdownTime(page.datas[id].execTime))
					}
				}
			}, 1000);
		},
		
		getCountdownTime: function(et){
			var ct = new Date().getTime(),
				cd = et - ct;
			if(et <= ct){
				return "已执行 / 已过期";
			} else {
				cd = cd / 1000;
				var s = parseInt(cd%60),
					m = parseInt((cd/60)%60),
					h = parseInt((cd/(60 * 60))%24),
					d = parseInt(cd/(60 * 60 * 24));
				return "待执行 / " + utils.format('{0}天{1}时{2}分{3}秒', utils.upzore(d, 3), utils.upzore(h, 2), utils.upzore(m, 2), utils.upzore(s, 2));
			}
		},
		
		wsMessage: function(pack){
			if(pack){
				if(pack.head.type == 'check'){
					log.info(pack.head.type, pack);
					//$('#tr-' + pack.body.rowId).removeClass('').removeClass('danger').addClass('danger');
				} else if(pack.head.type == "process"){
					$('.process-' + pack.body.rowId).html(laytpl('progress.html').render({
						max: pack.body.max,
						now: pack.body.now,
						width: parseInt((pack.body.now/pack.body.max) * 100) || 1
					}));
				}
			}
		},
		
		bindEvent: function(){
			
			if(top['SYSTEM']){
				top['SYSTEM'].regEvent('monitor.clock', 'clock', page.wsMessage);
			}
			
			$('.btn-save').on('click', function(){
				if(page.$formValodate.validate()){
					var param = $('#form').serializeJson();
					if(_.isArray(param.users)){
						param.users = param.users.join(',');
					}
					if(!/(,)$/.test(param.users)){
						param.users = param.users + ',';
					}
					if(param.rowId){
						var item = page.datas['tr-' + param.rowId];
						param['execTime'] = item.execTime;
						param['lastTime'] = item.lastTime;
						param['status'] = item.status;
						param['userId'] = item.userId;
					}
					if(param.cycle == 'week'){
						if(_.isArray(param.week)){
							param.date = param.week.join(',')
						} else {
							param.date = param.week
						}
					}
					var zuiLoad = waiting('数据保存中...');
					ajax.post({
						url: 'clock/save',
						data: param
					}).done(function(res, rtn, state, msg){
						if(state){
							$('.panel-left').addClass('hid');
							$('.panel-cover').addClass('hidden');
							page.loadClockList();
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
			
			$('.btn-cancel').on('click', function(){
				$('.panel-left').addClass('hid');
				$('.panel-cover').addClass('hidden');
			});
			
			$('.btn-add').on('click', function(){
				$('#form')[0].reset();
				$('#rowId').val('');
				$('#typed,#cycle,#users').val('').trigger('chosen:updated');
				$('.week-box').addClass('hidden');
				$('#date').removeClass('hidden');
				$('.btn-save').removeClass('hidden');
				$('.panel-left').removeClass('hid');
				$('.panel-cover').removeClass('hidden');
			});
			
			$('#cycle').on('change', function(){
				var $this = $(this),
					type = $this.val();
				var $date = $('#date');
				$date.val('');
				if(type == 'time'){
					$date.attr('disabled', false).removeClass('hidden');
					$('.week-box').addClass('hidden');
				} else if(type == 'day'){
					$date.val(utils.formatDate(new Date(), 'yyyy-MM-dd')).removeClass('hidden').attr('disabled', true)
					$('.week-box').addClass('hidden');
				} else if(type == 'week'){
					$date.addClass('hidden')
					$('.week-box').removeClass('hidden');
					$('input[name="week"]').val([]);
				} else if(type == 'month'){
					$date.attr('disabled', false).removeClass('hidden');
					$('.week-box').addClass('hidden');
				} else if(type == 'year'){
					$date.attr('disabled', false).removeClass('hidden');
					$('.week-box').addClass('hidden');
				}
			});
			
			$('input[name="week"]').on('click', function(e){
				var v = $('input[name="week"]:checked').val();
				$('#date').val(v ? v : '')
			});
			
			$('#dataBody').on('click', '.btn-edit', function(){
				var $this = $(this),
					rowId = $this.parent().data('id');
				var item = page.datas['tr-' + rowId];
				if(item){
					$('#rowId').val(item.rowId);
					$('#scope').val(item.scope).trigger('chosen:updated');
					$('#cycle').val(item.cycle).trigger('chosen:updated');
					$('#title').val(item.title);
					$('#content').val(item.content);
					$('#date').val(item.date);
					$('#time').val(item.time);
					if(item.cycle == 'week'){
						var ws = item.date.split(',');
						$('input[name="week"]').val(ws || []);
						$('.week-box').removeClass('hidden');
						$('#date').addClass('hidden').val(item.date);
					} else {
						$('.week-box').addClass('hidden');
						$('#date').removeClass('hidden');
					}
					$('#email').val(item.email);
					$('#users').val((item.users || "").split(',')).trigger('chosen:updated');
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
						cycle: (function(){
							var text = page.cycleText[item.cycle];
							if(item.cycle == 'day'){
								text = text + " " + item.time;
							} else if(item.cycle == 'week'){
								text = text + " " + item.date;
							} else if(item.cycle == 'month'){
								text = text + " " + item.date;
							} else if(item.cycle == 'month'){
								text = text + " " + item.date + " " + item.time;
							}
							return text;
						})(),
						typed: item.scope == 'private' ? '私有' : '公共',
						title: item.title,
						content: item.content,
						date: item.date,
						time: item.time,
						execTime: utils.formatDate(Number(item.execTime)),
						title: item.title,
						content: item.content,
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
						title: item.title + " 明细",
						msg: html,
						showYes: false,
						cancelText: '关闭'
					});
				}
			});
			
			$('#dataBody').on('click', '.btn-notice', function(){
				var $this = $(this),
				rowId = $this.parent().data('id');
				var item = page.datas['tr-' + rowId];
				if(item){
					if(item.status == 1){
						item.status = 2;
					} else if(item.status == 2){
						item.status = 1;
					}
					var zuiLoad = waiting('数据保存中...');
					ajax.post({
						url: 'clock/save',
						data: item
					}).done(function(res, rtn, state, msg){
						if(state){
							if(item.status == 1){
								$this.removeClass('icon-toggle-off').addClass('icon-toggle-on').attr('关闭闹钟');
							} else if(item.status == 2){
								$this.removeClass('icon-toggle-on').addClass('icon-toggle-off').attr('开启闹钟');
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
				var item = page.datas['tr-' + rowId]
				if(item){
					$.confirm({
						msg: '确定要删除此监控项【' + item.title + '】吗？',
						yesText: '确认删除',
						yesClick: function($modal){
							$modal.modal('hide');
							
							var zuiLoad = waiting('数据加载中...');
							ajax.post({
								url: 'clock/del',
								data: {
									rowId: rowId
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									page.loadClockList();
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