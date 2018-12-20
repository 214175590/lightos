/**
 * 
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.dataIndex = 0;
		this.dataSize = 10;
		this.$obj = {};
		
		this.$formValodate = null;
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			page.$formValodate = ZV('#form');			
			page.$formValodate.validate({
				rules: {
					url: {required: true},
					name: {required: true},
					username: {required: true},
					password: {required: true},
				},
				message: {
					url: {required: "不能为空"},
					name: {required: "不能为空"},
					username: {required: "不能为空"},
					password: {required: "不能为空"}
				}
			});
			
			page.loadData();
			
			page.bindEvent();
		},
		
		loadData: function(){
			ajax.post({
				url: 'svn/get/user',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state){
					var user = rtn.data;
					$('#username').val(user.username);
					$('#password').val("__");
				}
			}).fail(function(){
				
			});
		},
		
		bindEvent: function(){
			
			$('.btn-save').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					$btn.attr('disabled', true);
					ajax.post({
						url: 'svn/save',
						data: data
					}).done(function(res, rtn, state, msg){
						if(state){
							if(top['SYSTEM']){
								top.SYSTEM.speak('保存成功');
							} else {
								alert("保存成功");
							}
							if(parent['$addDialog']){
								parent['$addDialog'].close();
								parent.loadProject();
							}
						} else {
							error(msg);
						}
					}).fail(function(){
						if(top['SYSTEM']){
							top.SYSTEM.speak('保存失败');
						} else {
							error("保存失败");
						}
					}).always(function(){
						$btn.attr('disabled', false);
					});
				}
			});
			
			$('.btn-cancel').on('click', function(){
				if(parent['$addDialog']){
					parent['$addDialog'].close();
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});