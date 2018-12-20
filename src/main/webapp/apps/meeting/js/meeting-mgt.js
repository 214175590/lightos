/**
 * 
 */
define(function(require, exports, module) {
	var pager = require('../../../lib/zuiplugin/zui.pager'),
		comm =  require('../../common/common');
	
	function PageScript(){
		this.iconData = null;
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
			if(page.rights.includes("add")){
				$('.menu-item.item1').removeClass('hidden');
			} else {
				$('.menu-item.item1').remove();
			}
			
			page.bindEvent();
		},
		
		bindEvent: function(){		
			$('#right-frame').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/meeting/meeting_list.html'));
			
			var $item = $('.menu-item');
			$item.on('click', function(){
				var $this = $(this);
				$item.removeClass('active');
				$this.addClass('active');
				$('#right-frame').attr('src', comm.getSubPageUrl(consts.WEB_BASE + $this.data('url')));
			});
			
			window.jumpListMenu = function(){
				var $this = $('.menu-item.item2');
				$item.removeClass('active');
				$this.addClass('active');
				$('#right-frame').attr('src', comm.getSubPageUrl(consts.WEB_BASE + $this.data('url')));
			};
			
			window.jumpUpdatePage = function(id){
				var $this = $('.menu-item.item1');
				$item.removeClass('active');
				$this.addClass('active');
				$('#right-frame').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/meeting/meeting_edit.html?rid=' + id));
			};
			
			window.jumpNewPage = function(room, date, start, end){
				var $this = $('.menu-item.item1');
				$item.removeClass('active');
				$this.addClass('active');
				window['newMeetObj'] = {
					roomName: room,
					meetDate: date,
					meetStart: start,
					meetEnd: end,
				};
				$('#right-frame').attr('src', comm.getSubPageUrl(consts.WEB_BASE + 'apps/meeting/meeting_add.html?type=new'));
			};
			
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});