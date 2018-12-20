/**
 * 发起新会议预约
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.$formValodate = null;
		this.type = 'add';
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
		log.info(treeId, treeNode);
	}
	
	PageScript.prototype = {
		
		init: function(){
			var param = utils.getUrlParam();
			if(param && param.t == 'edit'){
				page.type = 'edit';
				var obj = parent.$obj;
				$('#form').fillForm(obj);
				$('.chosen-select').trigger('chosen:updated');
				$('#account').attr('disabled', true);
			}
			
			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					account: { required: true, maxlength: 20 },
					name: { required: true, maxlength: 20 },
					mobile: { mobile: true },
					company: { required: true },
					dept: { required: true },
					email: { email: true }
				},
				message: {
					account: {
						maxlength: "账号字符数不能超过{0}个"
					}
				}
			});
			
			$.useModule(['chosen'], function(){
				
				$('.chosen-select').chosen({});
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){
			$('.btn-submit').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					$btn.prop('disabled', true);
					var zuiLoad = new $.ZuiLoader().show('数据处理中...');
					ajax.post({
						url: page.type == 'add' ? 'user/add' : 'user/update',
						data: data					
					}).done(function(res, rtn, state, msg){
						if(state){
							$('.alert').removeClass('alert-warning').addClass('alert-success').text("添加成功");
							$.confirm({
								title: '温馨提示',
								msg: '恭喜，添加成功.',
								yesText: '关闭',
								cancelText: '继续添加',
								yesClick: function($modal){
									$modal.modal('hide');
									parent.closeFrame && parent.closeFrame();
								}, cancelClick: function($modal){
									$modal.modal('hide');
									$form[0].reset();
									$('.chosen-select').trigger('chosen:updated');
									$('.alert').removeClass('alert-warning').removeClass('alert-success').text("");
								}
							});
						} else {
							$('.alert').removeClass('alert-success').addClass('alert-warning').text(msg);
						}
					}).fail(function(e, m){
						log.error(e);
						$('.alert').removeClass('alert-success').addClass('alert-warning').text(m);
					}).always(function(){
						$btn.prop('disabled', false);
						zuiLoad.hide();
					});
				}
			});
			
			$('.btn-cancel').on('click', function(){
				parent.closeFrame && parent.closeFrame();
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});