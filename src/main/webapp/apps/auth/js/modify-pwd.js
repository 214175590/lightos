/**
 * 
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.$formValodate = null;
	}
	
	PageScript.prototype = {
		
		init: function(){
			page.winid = document.location.hash.substring(1);
			
			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					oldpwd: { required: true },
					newpwd: { required: true, minlength: 6, maxlength: 30 },
					renewpwd: { required: true, minlength: 6, maxlength: 30, equalTo: '#newpwd' }
				},
				message: {
					newpwd: {
						maxlength: "密码长度不能超过{0}个字符",
						minlength: "密码长度不能少于{0}个字符"
					},
					renewpwd: {
						maxlength: "密码长度不能超过{0}个字符",
						minlength: "密码长度不能少于{0}个字符",
						equalTo: "两次密码输入的不一致，请检查"
					}
				}
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){		
			$('.btn-cancel').on('click', function(){
				if(top['SYSTEM'] && top['SYSTEM'].os){
					top['SYSTEM'].os.control.closeWindow(page.winid);
				}
			});
			
			$('.btn-submit').on('click', function(){
				var $btn = $(this),
					$form = $('#form');
				if(page.$formValodate.validate()){
					
					$btn.prop('disabled', true);
					var zuiLoad = new $.ZuiLoader().show('处理中...');
					ajax.post({
						url: 'user/mp',
						data: {
							oldpwd: $.md5($('#oldpwd').val()), 
							newpwd: $.md5($('#newpwd').val()),
							renewpwd: $.md5($('#renewpwd').val())
						}					
					}).done(function(res, rtn, state, msg){
						if(state){
							$.confirm({
								title: '温馨提示',
								msg: '恭喜，密码修改成功，请妥善保管新密码.',
								showCancel: false,
								yesText: '好的',
								yesClick: function($modal){
									$modal.modal('hide');
									if(top['SYSTEM'] && top['SYSTEM'].os){
										top['SYSTEM'].os.control.closeWindow(page.winid);
									}
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
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});