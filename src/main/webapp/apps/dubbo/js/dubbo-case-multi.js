/**
 * 
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.datas = [];
		this.$obj = {};
		
		this.$formValodate = null;
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			if(parent['$_dcobj']){
				page.$obj = parent['$_dcobj'];
				log.info(page.$obj);
				if(page.$obj.param){
					$('#param').val(page.$obj.param);
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
			
			$('.btn-save-multi').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					$btn.attr('disabled', true);
					// 
					page.datas = [];
					$('.item-box').each(function(i, e){
						var $box = $(this),
							name = $box.find('.pi').val(),
							param = $box.find('.pv').val();
						page.datas.push({
							name: name,
							param: param
						});
					});
					
					ajax.post({
						url: 'dubbo/case/savemulti',
						data: {
							name: page.$obj.name,
							server: page.$obj.address,
							interfaceName: page.$obj.interfaceName,
							methodName: page.$obj.method,
							caseList: page.datas
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							if(top['SYSTEM']){
								top.SYSTEM.speak('保存成功');
							} else {
								alert("保存成功");
							}
							if(parent['$multiAddDialog']){
								parent['$multiAddDialog'].close();
								parent.loadCaseList();
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
				if(parent['$multiAddDialog']){
					parent['$multiAddDialog'].close();
				}
			});
			
			$('#name,#splitchar,#param,#index').on('input propertychange', function(e){
				var namefix = $('#name').val() || "测试用例",
					splitchar = $('#splitchar').val(),
					param = $('#param').val(),
					index = $('#index').val();
				if(splitchar && param){
					try{
						if(!/^[0-9]+$/.test(index)){
							$('#index').val('1');
							index = 1;
						} else {
							index = parseInt(index);
						}
						var arr = param.split(splitchar);
						if(arr && arr.length){
							var html = [];
							var json = {};
							for(var i = 0, k = arr.length; i < k; i++){
								json = {
									name: namefix + (index++),
									param: arr[i]
								};
								html.push(laytpl('item.html').render(json));
							}
							$('.itembox').html(html.join(''));
						}
					}catch(e1){}
				}				
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});