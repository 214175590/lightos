/**
 * 
 */
define(function(require, exports, module) {
	
	function PageScript(){
		this.statusText = {
			"S1": "待执行",
			"S2": "已取消",
			"S3": "已完成"
		}
		this.rowId = '';
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			
			var param = utils.getUrlParam();
			if(param['rid']){
				page.rowId = param['rid'];
				page.loadMeetingInfo(page.rowId);
			}
			
			page.bindEvent();
		},
		
		formatTime: function(timsStr){
			if(timsStr && timsStr.length == 4){
				timsStr = timsStr.substring(0, 2) + ':' + timsStr.substring(2); 
			}
			return timsStr;
		},
		
		loadMeetingInfo: function(rowId){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'meet/get',
				data: {id: rowId}
			}).done(function(res, rtn, state, msg){
				if(state){
					log.info(rtn);
					if(rtn.data){
						$('#meetSubject').html(rtn.data.meetSubject + ' （' + laytpl('status.tpl').render({
							status: page.statusText['S' + rtn.data.status] + 
								page.checkStatus(rtn.data.status, rtn.data.meetDate, rtn.data.meetEnd),
							value: rtn.data.status
						}) + '）');
						$('#meetDate').html(rtn.data.meetDate);
						$('#meetStart').html(page.formatTime(rtn.data.meetStart));
						$('#meetEnd').html(page.formatTime(rtn.data.meetEnd));
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
						$('#mailReminder').html(rtn.data.mailReminder == 1 ? '是' : '否');
						$('#meetMinutes').html((function(){
							var m = '未记录';
							if(rtn.data.meetMinutes){
								m = rtn.data.meetMinutes.replace(/[\n]+/g, '<br>');
							}
							return m;
						})());
					}
					
					$('[data-toggle="tooltip"]').tooltip();
					
					if(page.user){
						if(rtn.data.status == 1 && (page.user.userPurview == 5 || page.user.userId == rtn.data.initiator)){
							$('.btn-cancel').removeClass('hidden');
						} else {
							$('.btn-cancel').remove();
						}
					} else {
						$('.btn-cancel').remove();
					}
				} else {
					error('会议数据加载失败：' + msg);
				}
			}).fail(function(){
				error('会议数据加载失败');
			}).always(function(){
				setTimeout(function(){ zuiLoad.hide(); }, 200);
			});
		},
		
		checkStatus: function(state, date, end){
			var res = '';
			if(state == 1){
				var num1 = parseInt(date.replace(/[-]/g, '') + end);
				var num2 = parseInt(utils.formatDate(new Date().getTime(), 'yyyyMMddhhmm'));
				if(num2 >= num1){
					res = '<font color="red"> [过期未执行或未填写会议纪要]</font>';
				}
			}
			return res;
		},
		
		bindEvent: function(){		
			
			$('.btn-close').on('click', function(){
				parent.$detailDialog.close();
				delete parent.$detailDialog;
			});
			
			$('.btn-cancel').on('click', function(){
				var $btn = $(this);
				if(page.rowId){
					$.confirm({
						title: '提示',
						yesText: '确认取消',
						cancelText: '关闭',
						msg: '您确定要取消此次会议吗？',
						yesClick: function($modal){
							$btn.attr('disabled', true);
							var zuiLoad = new $.ZuiLoader().show('处理中...');
							ajax.post({
								url: 'meet/cancelMeeting',
								data: {
									id: page.rowId
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									alert("取消成功");
									
									setTimeout(function(){
										parent.$detailDialog.close();
										delete parent.$detailDialog;
									}, 1000);
								} else {
									$btn.attr('disabled', false);
									error("取消失败：" + msg);
								}
							}).fail(function(){
								$btn.attr('disabled', false);
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
	
});