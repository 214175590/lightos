/**
 * 修改会议预约
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	var zuiLoad = new $.ZuiLoader();
	function PageScript(){
		this.$formValodate = null;
		
		this.setting = {
		        check: {
		            enable: true,
		            chkStyle: "checkbox",
		            radioType: "level"
		        },
		        data: {
		            simpleData: {
		                enable: true,
		                idKey: "id",
		    			pIdKey: "pId"
		            }
		        },
		        callback: {
					onCheck: zTreeOnCheck
				}
		    };
	}
	
	function zTreeOnCheck(event, treeId, treeNode){
		
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			
			var param = utils.getUrlParam();
			if(param['rid']){
				page.meetId = param['rid'];
			} else {
				error("数据错误");
				return null;
			}
			
			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					meetSubject: { required: true, maxlength: 64 },
					meetDate: { required: true },
					meetStart: { required: true },
					meetEnd: { required: true },
					boardroom: { required: true },
					member: { required: true }
				},
				message: {
					meetSubject: {
						maxlength: "主题字符数不能超过{0}个"
					}
				}
			});
			
			$.useModule(['datetimepicker', 'chosen', 'ztree'], function(){
				
				$("#meetDate").datetimepicker({
				    language:  "zh-CN",
				    weekStart: 1,
				    todayBtn:  1,
				    autoclose: 1,
				    todayHighlight: 1,
				    startView: 2,
				    minView: 2,
				    forceParse: 0,
				    format: "yyyy-mm-dd",
				    startDate: utils.formatDate(new Date(), 'yyyy-MM-dd')
				});
				
				$('.chosen-select').chosen({});
				
				page.loadBoardroom();
				
			});
			
			
			page.bindEvent();
		},
		
		loadBoardroom: function(){
			zuiLoad.show('数据加载中...')
			var $boardroom = $('#boardroom');
			ajax.post({
				url: 'osBoardroom/loadList',
				data: {"_pageSize": 1000}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(rtn.data.numberOfElements && rtn.data.content){
						var obj;
						for(var i = 0; i < rtn.data.numberOfElements; i++){
							obj = rtn.data.content[i];
							$boardroom.append(utils.parsetpl('<option value="{code}" data-text="{name}">{name} - 支持人数：{capacity}{projector}{teleconference}{videoconference}</option>', {
								code: obj.rowId,
								name: obj.roomName,
								capacity: obj.capacity,
								projector: obj.projector == 1 ? ' - 支持投影仪' : '',
								teleconference: obj.teleconference == 1 ? ' - 支持电话会议' : '',
								videoconference: obj.videoconference == 1 ? ' - 支持视频会议' : ''
							}));
						}
						$boardroom.trigger('chosen:updated');
						
						page.loadUserList();
					}
				} else {
					error('会议室列表加载失败：' + msg);
					zuiLoad.hide();
				}
			}).fail(function(){
				error('会议室列表加载失败');
				zuiLoad.hide();
			});
			
		},
		
		loadUserList: function(){
			var $member = $('#member'),
				$conference = $('#conferenceClerk');
			ajax.post({
				url: 'user/alluser',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(rtn.data){
						page.userData = rtn.data;
						page.renderUserList(rtn.data, 1);
					}
					
					page.loadMeeting();
				} else {
					error('用戶列表加载失败：' + msg);
					zuiLoad.hide();
				}
			}).fail(function(){
				error('用戶列表加载失败');
				zuiLoad.hide();
			});
		},
		
		renderUserList: function(data, flag){
			var $member = $('#member'),
				$conference = $('#conferenceClerk');
			var obj, groupUserHtmlJson1 = {}, groupHtmlJson1 = {}, userHtmlArray1 = [],
				groupUserHtmlJson2 = {}, groupHtmlJson2 = {}, userHtmlArray2 = [];
	
			for(var i = 0; i < data.length; i++){
				obj = data[i];
				
				userHtmlArray1 = groupUserHtmlJson1[obj.company + obj.dept];
				if(!userHtmlArray1){
					userHtmlArray1 = [];
					groupHtmlJson1[obj.company + obj.dept] = utils.parseHtml('<optgroup label="{label}">{optionList}</optgroup>', {
						label: (obj.company || "-") + ' / ' + (obj.dept || '-')
					});
					groupUserHtmlJson1[obj.company + obj.dept] = userHtmlArray1;
				}
				if(page.user.rowId != obj.rowId){
					userHtmlArray1.push(utils.parsetpl('<option value="{code}" data-text="{name}">{name}</option>', {
						code: obj.rowId,
						name: obj.name
					}));
				}
				
				groupUserHtmlJson1[obj.company + obj.dept] = userHtmlArray1;
			}
			
			var html1 = [];
			if(flag == 2){
				html1.push(utils.parsetpl('<option value="{code}" data-text="{name}">{name}</option>', {
					code: page.user.rowId,
					name: page.user.name + '（自己）'
				}));
			}
			for(var key in groupHtmlJson1){
				userHtmlArray1 = groupUserHtmlJson1[key];
				html1.push(utils.parsetpl(groupHtmlJson1[key], {
					optionList: userHtmlArray1.join('')
				}));
			}
			if(flag == 1){
				$member.html(html1.join(''));
				$member.trigger('chosen:updated');
			} else if(flag == 2){
				$conference.html(html1.join(''));
				$conference.trigger('chosen:updated');
			}
			
			if(!page.initTreeFlag){
				page.initTree(data);
				page.initTreeFlag = true;
				$('.btn-submit').prop('disabled', false);
			}
		},
		
		initTree: function(data){
			var obj = {}, companyJson = {}, deptJson = {}, idIndex = 100;
			var zNodes = [], companyNode = {}, deptNode = {} , userNode = {};
			var baseNode = {
				id: 0,
				pId: 0,
				name: '所有人员',
				open: true
			};
			zNodes.push(baseNode);
			for(var i = 0; i < data.length; i++){
				obj = data[i];
				
				companyNode = companyJson[obj.company];
				if(!companyNode){
					companyNode = {
						id: idIndex++,
						pId: 0,
						name: obj.company ,
						open: true ,
						checked: false
					};
					zNodes.push(companyNode);
					companyJson[obj.company] = companyNode;
				}
				deptNode = deptJson[companyNode.id + obj.dept];
				if(!deptNode){
					deptNode = {
						id: idIndex++,
						pId: companyNode.id,
						name: obj.dept ,
						open: true ,
						checked: false
					};
					zNodes.push(deptNode);
					deptJson[companyNode.id + obj.dept] = deptNode;
				}
				if(obj.rowId != page.user.rowId){
					userNode = {
						id: obj.rowId,
						pId: deptNode.id,
						name: obj.name,
						open: true,
						checked: false
					};							
					zNodes.push(userNode);
				}
			}
			
			page.zTreeObj = $.fn.zTree.init($('#treeBody'), page.setting, zNodes);
		},
		
		// 是否与其他会议冲突
		isHasClash: function(date, start, end, boardroom, callback){
			ajax.post({
				url: 'meet/loadTimeMeeting',
				data: {meetDate: date, meetStart: start, meetEnd: end, boardroom: boardroom}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(rtn.data && rtn.data.length){
						page.showClash(rtn.data, callback);
					} else if(callback){
						callback.call(page);
					}
				} else {
					error('预约失败');
				}
			}).fail(function(){
				error('预约失败');
			});
		},
		
		showClash: function(datas, callback){
			var editId = $('#id').val(),
			    count = 0;
			var content = (function(){
				var obj = {}, htmls = '';
				for(var i = 0, k = datas.length; i < k; i++){
					obj = datas[i];
					if(obj.rowId != editId){
						count++;
						htmls += laytpl('tr.tpl').render({
							subject: obj.meetSubject,
							user: obj.initiator,
							time: obj.meetDate + " " + page.formatTime(obj.meetStart) + "--" + page.formatTime(obj.meetEnd)
						});
					}
				}
				var table = laytpl('table.tpl').render({
					trlist: htmls
				});
				return table;
			})();
			if(count == 0){
				callback && callback.call(page);
			} else {
				$.confirm({
					title: '时间冲突',
					msg: '此时间段已被以下会议占用，请更改时间段：<br>' + content,
					showCancel: false,
					yesText: '知道了',
					yesClick: function($modal){
						$modal.modal('hide');
					}
				});
			}
		},
		
		formatTime: function(t){
			return t.substring(0, 2) + ":" + t.substring(2);
		},
		
		loadMeeting: function(){
			ajax.post({
				url: 'meet/get',
				data: {id: page.meetId}
			}).done(function(res, rtn, state, msg){
				if(state){
					$('#id').val(rtn.data.rowId);
					$('#status').val(rtn.data.status);
					$('#initiator').val(rtn.data.initiator);
					$('#meetSubject').val(rtn.data.meetSubject);
					$('#meetDate').val(rtn.data.meetDate).datetimepicker('update');
					$('#meetStart').val(rtn.data.meetStart).trigger('chosen:updated');
					$('#meetEnd').val(rtn.data.meetEnd).trigger('chosen:updated');
					$('#boardroom').val(rtn.data.boardroom).trigger('chosen:updated');
					var member = [], ulist = [];
					for(var i = 0, k = rtn.member.length; i < k; i++){
						member.push(rtn.member[i].userId);
						for(var j = 0, o = page.userData.length; j < o; j++){
							if(page.userData[j].rowId == rtn.member[i].userId){
								ulist.push(page.userData[j]);
								break;
							}
						}
					}
					$('#member').val(member).trigger('chosen:updated');
					page.renderUserList(ulist, 2);
					
					$('#conferenceClerk').val(rtn.data.conferenceClerk).trigger('chosen:updated');
					$('#meetRemark').val(rtn.data.meetRemark);
					
					$('#mailNotification' + rtn.data.mailNotification).prop('checked', true);
					$('#mailReminder' + rtn.data.mailReminder).prop('checked', true);
					
				} else {
					error('会议数据加载失败：' + msg);
				}
			}).fail(function(){
				error('会议数据加载失败');
			}).always(function(){
				setTimeout(function(){ zuiLoad.hide(); }, 200);
			});
		},
		
		isValidateMeeting: function(data){
			var res = false;
			if(data.meetStart){
				var d = data.meetDate + " " + page.formatTime(data.meetStart) + ":00";
				var s = utils.parseDate(d).getTime();
				var e = new Date().getTime();
				res = s >= e;
			}
			return res;
		},
		
		bindEvent: function(){			
			$('.btn-submit').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					var isValid = page.isValidateMeeting(data);
					if(isValid){
						page.isHasClash(data.meetDate, data.meetStart, data.meetEnd, data.boardroom, function(){
							$btn.prop('disabled', true);
							var zuiLoad = new $.ZuiLoader().show('数据处理中...');
							ajax.post({
								url: 'meet/edit',
								data: data					
							}).done(function(res, rtn, state, msg){
								if(state){
									$.confirm({
										title: '温馨提示',
										msg: '恭喜，会议预约信息修改成功.',
										showCancel: false,
										yesText: '好的',
										yesClick: function($modal){
											$modal.modal('hide');
											parent.jumpListMenu();
										}
									});
								} else {
									if(rtn.data && rtn.data.length){
										page.showClash(rtn.data);
									} else {
										$('.alert').addClass('alert-warning').text(msg);
									}
								}
							}).fail(function(e, m){
								log.error(e);
								$('.alert').addClass('alert-warning').text(m);
							}).always(function(){
								$btn.prop('disabled', false);
								zuiLoad.hide();
							});
						});
					} else {
						error("会议时间无效，请检查");
					}
				}
			});
			
			$('.btn-cancel').on('click', function(){
				parent.jumpListMenu();
			});
			
			var $start = $('#meetStart');
				$end = $('#meetEnd');
			$start.on('change', function(){
				var start = $start.val(); 
					end = $end.val();
				if(parseInt(end) <= parseInt(start)){
					var s1 = parseInt(start.substring(0, 2)),
						s2 = parseInt(start.substring(2));
					s2 = s2 + 30;
					if(s2 == 60){
						s2 = '00';
						s1++;
					}
					end = (s1 < 10 ? '0' : '') + s1 + '' + s2;
					$end.val(end).trigger('chosen:updated');
				}
			});
			$end.on('change', function(){
				var start = $start.val(); 
					end = $end.val();
				if(parseInt(end) <= parseInt(start)){
					var s1 = parseInt(start.substring(0, 2)),
						s2 = parseInt(start.substring(2));
					s2 = s2 + 30;
					if(s2 == 60){
						s2 = '00';
						s1++;
					}
					end = (s1 < 10 ? '0' : '') + s1 + '' + s2;
					$end.val(end).trigger('chosen:updated');
					
					error('结束时间不能早于开始时间');
				}
			});
			
			// 
			$('.conferenceClerk-box').on('click', '.chosen-container', function(){
				$('.conferenceClerk-box .chosen-search input').attr('placeholder', '请先选择与会人员，然后再选择会议记录员');
			});
			
			$('.member-box').on('click', '.chosen-container', function(){
				$('#treePanel').removeClass('hidden').css({
					left: ($(window).width() - $('#treePanel').width())/2,
					top: ($(window).height() - $('#treePanel').height())/2
				});
				var idarr = $('#member').val();
				if(idarr){
					var companyNodes = page.zTreeObj.getNodes()[0].children, node;
					function checkNode(no){
						if(no.children){
							for(var i = 0, k = no.children.length; i < k; i++){
								checkNode(no.children[i]);
							}
						} else {
							for(var j = 0, o = idarr.length; j < o; j++){
								if(no.id == idarr[j]){
									page.zTreeObj.checkNode(no, true, false);
									break;
								}
							}
						}
					}
					if(companyNodes && companyNodes.length){
						for(var i = 0, k = companyNodes.length; i < k; i++){
							checkNode(companyNodes[i]);
						}
					}
				}
			});
			
			$('.btn-ok').on('click', function(){
				var nodes = page.zTreeObj.getCheckedNodes(true),
					idarr = [];
				if(nodes && nodes.length){
					for(var i = 0, k = nodes.length; i < k; i++ ){
						if(!nodes[i].children){
							idarr.push(nodes[i].id);
						}
					}
					$('#member').val(idarr).trigger('chosen:updated');
					$('#treePanel').addClass('hidden');
					
					page.zTreeObj.checkAllNodes(false);
				}
				
				// 
				var datas = [];
				for(var i = 0, k = idarr.length; i < k; i++ ){
					for(var j = 0, p = page.userData.length; j < p; j++ ){
						if(idarr[i] == page.userData[j].rowId){
							datas.push(page.userData[j]);
							break;
						}
					}
				}
				
				if(datas.length){
					page.renderUserList(datas, 2);
				} else {
					$('#conferenceClerk').html('').trigger('chosen:updated');
				}
				
			});
			
			$('.btn-no').on('click', function(){
				$('#treePanel').addClass('hidden');
			});
			
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});