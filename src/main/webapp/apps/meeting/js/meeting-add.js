/**
 * 发起新会议预约
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
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
		//log.info(treeId, treeNode);
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			
			var param = utils.getUrlParam();
			if(param && param['type'] == 'new'){
				page.newMeetObj = parent['newMeetObj'];
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
				
				var currT = utils.formatDate(new Date(), 'hhmm'), one = null, two = null, inx = 0;
				$('#meetStart').find('option').each(function(){
					var $op = $(this),
						vue = $op.val().replace(':', "");
					if(parseInt(vue) < parseInt(currT)){
						//$op.prop('disabled', true);
					} else if(!one){
						one = "init";
						$op.attr('selected', "selected");
					}
				});	
				$('#meetEnd').find('option').each(function(){
					var $op = $(this),
						vue = $op.val().replace(':', "");
					if(parseInt(vue) < parseInt(currT)){
						//$op.prop('disabled', true);
					} else if(!two){
						if(inx == 0){
							inx = 1;
						} else if(inx == 1){
							two = "init";
							$op.attr('selected', "selected");
						}
					}
				});
				
				if(page.newMeetObj){
					$("#meetDate").val(page.newMeetObj.meetDate);
					$("#meetStart").val(page.newMeetObj.meetStart);
					$("#meetEnd").val(page.newMeetObj.meetEnd);
				}
				
				$('.chosen-select').chosen({});
				
				page.loadBoardroom();
				
			});
			
			
			page.bindEvent();
		},
		
		loadBoardroom: function(){
			var $boardroom = $('#boardroom');
			ajax.post({
				url: 'osBoardroom/loadList',
				data: {"_pageSize": 100}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(rtn.data.numberOfElements && rtn.data.content){
						var obj;
						for(var i = 0; i < rtn.data.numberOfElements; i++){
							obj = rtn.data.content[i];
							$boardroom.append(utils.parsetpl('<option value="{code}" data-text="{name}" {attr}>{name} - 支持人数：{capacity}{projector}{teleconference}{videoconference}{remark}</option>', {
								code: obj.rowId,
								name: obj.roomName,
								capacity: obj.capacity,
								projector: obj.projector == 1 ? ' - 支持投影仪' : '',
								teleconference: obj.teleconference == 1 ? ' - 支持电话会议' : '',
								videoconference: obj.videoconference == 1 ? ' - 支持视频会议' : '',
								remark: "（" + obj.roomRemark + "）",
								attr: (function(){
									var ttr = '';
									if(page.newMeetObj){
										ttr = obj.roomName == page.newMeetObj.roomName ? 'selected' : '';
									}
									return ttr;
								})()
							}));
						}
						$boardroom.trigger('chosen:updated');
						
						page.loadUserList();
					}
				} else {
					error('会议室列表加载失败：' + msg);
				}
			}).fail(function(){
				error('会议室列表加载失败');
			});
			
		},
		
		loadUserList: function(){
			ajax.post({
				url: 'user/alluser',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(rtn.data){
						page.userData = rtn.data;
						page.renderUserList(rtn.data, 1);
					}
				} else {
					error('用戶列表加载失败：' + msg);
				}
			}).fail(function(){
				error('用戶列表加载失败');
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
						checked: false,
						icon: consts.WEB_BASE + "lib/ztree/style/img/diy/11.png"
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
						page.showClash(rtn.data);
					} else {
						callback && callback.call(page);
					}
				} else {
					error('预约失败');
				}
			}).fail(function(){
				error('预约失败');
			});
		},
		
		showClash: function(datas){
			$.confirm({
				title: '时间冲突',
				msg: '此时间段已被以下会议占用，请更改时间段：<br>' + (function(){
					var obj = {}, htmls = '';
					for(var i = 0, k = datas.length; i < k; i++){
						obj = datas[i];
						htmls += laytpl('tr.tpl').render({
							subject: obj.meetSubject,
							user: obj.initiator,
							time: obj.meetDate + " " + page.formatTime(obj.meetStart) + "--" + page.formatTime(obj.meetEnd)
						});
					}
					var table = laytpl('table.tpl').render({
						trlist: htmls
					});
					return table;
				})(),
				showCancel: false,
				yesText: '知道了',
				yesClick: function($modal){
					$modal.modal('hide');
				}
			});
		},
		
		formatTime: function(t){
			return t.substring(0, 2) + ":" + t.substring(2);
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
								url: 'meet/add',
								data: data					
							}).done(function(res, rtn, state, msg){
								if(state){
									$.confirm({
										title: '温馨提示',
										msg: '恭喜，会议预约成功.',
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