/**
 * 
 */
define(function(require, exports, module) {
	var comm =  require('../../common/common');
	
	function PageScript(){
		this.rights = [];
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			if(!page.rights.includes("add")){
				$('.add-btn').remove;
			}

			$.useModule(['chosen', 'datatable'], function(){
				
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){
			
			$('.btn-status').on('click', function(){
				var that = $(this),
					url = that.data('url'),
					id = that.data('id');
				if(that.hasClass('btn-primary')){
					$('.btn-status').removeClass('btn-success').addClass('btn-primary');
					that.addClass('btn-success').removeClass('btn-primary');
					
					var $frame = $('#subpage-' + id);
					if(!$frame.length){
						var zuiLoad = waiting('页面加载中...');	
						$('.subframe').addClass('hidden');
						$frame = $(laytpl('frame.tpl').render({
							id: id,
							src: url
						}));
						$('.page-body').append($frame);
						$frame.on('load', function(){
							zuiLoad.hide();
						});
					} else {
						$('.subframe').addClass('hidden');
						$frame.removeClass('hidden');
					}
				}
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.closeFrame = page.closeFrame;
});