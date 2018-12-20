/**
 * 修改会议预约
 */
define(function(require, exports, module) {
	var zuiLoad = new $.ZuiLoader();
	function PageScript(){
		this.statusText = {
			"S1": "待执行",
			"S2": "已取消",
			"S3": "已完成"
		};
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
			
			page.loadMeetingInfo(page.meetId);
			
			page.bindEvent();
		},
		
		loadMeetingInfo: function(rowId){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'meet/get',
				data: {id: rowId}
			}).done(function(res, rtn, state, msg){
				if(state){
					
					if(rtn.data){
						$('#meetSubject').html(rtn.data.meetSubject);
						$('#meetDate').html(rtn.data.meetDate);
						$('#meetStart').html(rtn.data.meetStart);
						$('#meetEnd').html(rtn.data.meetEnd);
						// 会议室
						$('#boardroom').html(
							utils.parsetpl('{name} (支持人数：{capacity}{projector}{teleconference}{videoconference})', {
								name: rtn.boardroom.roomName,
								capacity: rtn.boardroom.capacity,
								projector: rtn.boardroom.projector == 1 ? ' - 支持投影仪' : '',
								teleconference: rtn.boardroom.teleconference == 1 ? ' - 支持电话会议' : '',
								videoconference: rtn.boardroom.videoconference == 1 ? ' - 支持视频会议' : ''
							})
						);
						// 与会人员
						var memberHtml = '';
						if(rtn.member && rtn.member.length){
							memberHtml = '';
							for(var i = 0, k = rtn.member.length; i < k; i++){
								memberHtml += laytpl('member.tpl').render({
									initiator:  rtn.data.initiator == rtn.member[i].userId ? '<i class="icon icon-user" data-toggle="tooltip" title="会议发起人"></i>' : '',
									name: rtn.member[i].userName,
									conferenceClerk: rtn.data.conferenceClerk == rtn.member[i].userId ? '<i class="icon icon-pencil" data-toggle="tooltip" title="会议记录员"></i>' : ''
								});
							}
						}
						$('#member').html(memberHtml);
						
						$('#meetRemark').html(rtn.data.meetRemark);
						$('#mailNotification').html(rtn.data.mailNotification == 1 ? '是' : '否');
						$('#mailReminder').html(rtn.data.mailReminder ? '是' : '否');
						$('#meetMinutes').html(rtn.data.meetMinutes || '');
					}
					
					$('[data-toggle="tooltip"]').tooltip();
				} else {
					error('会议数据加载失败：' + msg);
				}
			}).fail(function(){
				error('会议数据加载失败');
			}).always(function(){
				setTimeout(function(){ zuiLoad.hide(); }, 200);
			});
		},
		
		bindEvent: function(){			
			$('.btn-submit').on('click', function(){
				var $btn = $(this),
					meetMinutes = $('#meetMinutes').val();
				if(meetMinutes){
					$btn.prop('disabled', true);
					var zuiLoad = new $.ZuiLoader().show('数据处理中...');
					ajax.post({
						url: 'meet/fillMinutes',
						data: {id: page.meetId, meetMinutes: meetMinutes}					
					}).done(function(res, rtn, state, msg){
						if(state){
							$.confirm({
								title: '温馨提示',
								msg: '恭喜，会议纪要保存成功.',
								showCancel: false,
								yesText: '好的',
								yesClick: function($modal){
									$modal.modal('hide');
									parent.$minutesDialog.close();
									parent.loadMeetList && parent.loadMeetList();
									delete parent.$minutesDialog;
								}
							});
						} else {
							$('.alert').addClass('alert-warning').text(msg);
						}
					}).fail(function(e, m){
						log.error(e);
						$('.alert').addClass('alert-warning').text(m);
					}).always(function(){
						$btn.prop('disabled', false);
						zuiLoad.hide();
					});
				} else {
					alert("请填写会议纪要");
				}
			});
			
			$('.btn-cancel').on('click', function(){
				if(parent.$minutesDialog){
					parent.$minutesDialog.close();
					parent.loadMeetList && parent.loadMeetList();
					delete parent.$minutesDialog;
				}
			});
		}
	};
	
	var page = new PageScript();
	page.init();
	
});