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
			
			if(parent['$_dcobj']){
				page.$obj = parent['$_dcobj'];
				if(page.$obj.param){
					$('#param').val(page.$obj.param);
				}
				if(page.$obj.rowId){
					$('#rowId').val(page.$obj.rowId);
				}
				if(page.$obj.caseName){
					$('#name').val(page.$obj.caseName);
				}
			}
			
			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					name: {
						required: true
					},
					param: {
						required: true
					}
				},
				message: {
					name: {
						required: "不能为空"
					},
					param: {
						required: "不能为空"
					}
				}
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){
			
			$('.btn-save').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					$btn.attr('disabled', true);
					ajax.post({
						url: 'dubbo/case/save',
						data: {
							rowId: data.rowId || '0',
							name: page.$obj.name,
							server: page.$obj.address,
							interfaceName: page.$obj.interfaceName,
							methodName: page.$obj.method,
							caseName: data.name,
							param: data.param
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							if(top['SYSTEM']){
								top.SYSTEM.speak('保存成功');
							} else {
								alert("保存成功");
							}
							if(parent['$newDialog']){
								parent['$newDialog'].close();
								parent.addCaseNode(rtn.data);
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
				if(parent['$newDialog']){
					parent['$newDialog'].close();
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});