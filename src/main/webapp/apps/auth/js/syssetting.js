/**
 * 
 */
define(function(require, exports, module) {
	var comm = require("../../common/common");
	
	function PageScript(){
		this.userData = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			page.winid = document.location.hash.substring(1);
			
			ajax.getUserInfo().done(function(user){
				page.user = user;
				
				page.userData = comm.getUserData(page.user.account);
				
				if(page.userData["syssetting"]){
					var clippy = page.userData.syssetting.clippy;
					if(clippy){
						$('#clippy').val(clippy);
					}
					var wapper = page.userData.syssetting.wapper;
					if(wapper){
						$('input[name="wapper"]').val([wapper.type]);
						if(wapper.type == 'auto'){
							$('#time').attr('disabled', false);
						}
						$('#time').val(wapper.time || "30");
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
				var $btn = $(this);
				$btn.prop('disabled', true);
				var zuiLoad = new $.ZuiLoader().show('处理中...');
				
				var clippy = $('#clippy').val(),
					wapper = $('input[name="wapper"]:checked').val(),
					time = $('#time').val();
				page.userData["syssetting"] = {
					clippy: clippy,
					wapper: {
						type: wapper,
						time: time
					}
				};
				comm.saveUserData(page.user.account, page.userData);
				zuiLoad.hide();
				
				if(top['SYSTEM'] && top['SYSTEM'].os){
					top['SYSTEM'].os.control.closeWindow(page.winid);
				}
			});
			
			$('input[name="wapper"]').on('click', function(){
				var $this = $(this),
					wap = $this.val();
				if(wap == 'auto'){
					$('#time').attr('disabled', !$this.is(":checked"));
				} else {
					$('#time').attr('disabled', true);
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});