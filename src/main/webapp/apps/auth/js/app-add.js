/**
 * 发起新会议预约
 */
define(function(require, exports, module) {
	var ZV = require('../../../lib/zuiplugin/zui.validate');
	
	function PageScript(){
		this.$formValodate = null;
		this.type = 'add';
		this.iconInited = false;
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
			var param = utils.getUrlParam();
			if(param && param.t == 'edit'){
				page.type = 'edit';
				var obj = parent.$obj;
				$('#form').fillForm(obj);
				$('#icon-img').attr('src', consts.WEB_BASE + obj.icon);
				$('.chosen-select').trigger('chosen:updated');
				$('#account').attr('disabled', true);
			}
			
			page.$formValodate = ZV('#form');
			
			page.$formValodate.validate({
				rules: {
					title: { required: true, maxlength: 50 },
					name: { required: true, maxlength: 20, charnum: true},
					closeFunction: { maxlength: 1000 },
					minFunction: { maxlength: 1000 },
					maxFunction: { maxlength: 1000 }
				},
				message: {
					name: {maxlength: "名称字符数不能超过{0}个"},
					title: {maxlength: "标题字符数不能超过{0}个"},
					closeFunction: {maxlength: "函数代码数不能超过{0}个"},
					minFunction: {maxlength: "函数代码数不能超过{0}个"},
					maxFunction: {maxlength: "函数代码数不能超过{0}个"}
				}
			});
			
			$.useModule(['chosen'], function(){
				
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					if(user.account != 'admin'){
						$('#exe-op').attr('disabled', true);
					}
					$('.chosen-select').chosen({});
				});
				
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){
			$('.btn-submit').on('click', function(){
				var $btn = $(this),
					$form = $('#form'),
					data = $form.serializeJson();
				if(page.$formValodate.validate()){
					data.isdrag = $('#isdrag').is(':checked') ? 'true' : 'false';
					data.needClose = $('#needClose').is(':checked') ? 'true' : 'false';
					data.needMaximize = $('#needMaximize').is(':checked') ? 'true' : 'false';
					data.needMinimize = $('#needMinimize').is(':checked') ? 'true' : 'false';
					log.info(data);
					$btn.prop('disabled', true);
					var zuiLoad = new $.ZuiLoader().show('数据处理中...');
					ajax.post({
						url: page.type == 'add' ? 'sys/addApp' : 'sys/editAppInfo',
						data: data					
					}).done(function(res, rtn, state, msg){
						if(state){
							$('.alert').removeClass('alert-warning').addClass('alert-success').text("添加成功");
							if(page.type == 'add'){
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
								parent.closeFrame && parent.closeFrame();
							}
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
			
			$('.btn-choose-icon').on('click', function(e){
				var icon = $('#icon').val();
				if(!page.iconInited){
					var icons = [], p = '';
					for(var i = 1; i <= 112; i++){
						p = 'content/images/icons/icon_' + i + '.png';
						icons.push(laytpl('icon.tpl').render({
							src: consts.WEB_BASE + p,
							path: p,
							css: icon == p ? 'choose' : ''
						}));
					}
					$('.icon-panel').html(icons.join(''));
					page.iconInited = true;
				} else {
					$('.icon-box').removeClass('choose').each(function(){
						var path = $(this).data('path');
						if(path == icon){
							$(this).addClass('choose');
						}
					});
				}
				$('.icon-panel').removeClass('hidden');
			});
			
			$('.icon-panel').on('click', '.icon-box', function(e){
				$('.icon-box').removeClass('choose');
				var $this = $(this),
					path = $this.data('path');
				$this.addClass('choose');
				$('#icon').val(path);
				$('#icon-img').attr('src', consts.WEB_BASE + path);
				$('.icon-panel').addClass('hidden');
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});