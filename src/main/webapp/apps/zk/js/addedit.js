/**
 * 
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.dataIndex = 0;
		this.dataSize = 10;
		this.datas = {};
		
		this.$formValodate = null;
	}
	
	PageScript.prototype = {
		
		init: function(){
			var params = utils.getUrlParam(),
				type = params['type'];
			if(type == 'edit' && parent.$obj){
				$('#rowId').val(parent.$obj.rowId);
				$('#ip').val(parent.$obj.ip);
				$('#port').val(parent.$obj.port);
				$('#configPath').val(parent.$obj.configPath);
				$('#desc').val(parent.$obj.desc);
			}

			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					ip: {
						required: true
					},
					port: {
						required: true
					},
					configPath: {
						required: true
					}
				},
				message: {
					ip: {
						required: "不能为空"
					},
					port: {
						required: "不能为空"
					},
					configPath: {
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
						url: 'zk/save',
						data: data
					}).done(function(res, rtn, state, msg){
						if(state){
							if(top['SYSTEM']){
								top.SYSTEM.speak('保存成功');
							} else {
								alert("保存成功");
							}
							if(parent['$newDialog']){
								parent['$newDialog'].close();
								parent.loadZkServerList();
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