/**
 * 公共组件
 */
define(function(require, exports, module) {
	
	return {
		
		getUserAppRights: function(appId){
			var result = [];
			if(top.SYSTEM && top.SYSTEM.RIGHTS){
				var data = null;
				for(var i = 0, k = top.SYSTEM.RIGHTS.length; i < k; i++){
					data = top.SYSTEM.RIGHTS[i];
					if(data.deskIconId == appId){
						result.push(data.rightCode || data.code);
					}
				}
			}
			return result;
		},
		
		saveUserData: function(acc, data){
			$.zui.store.setItem(acc, utils.toJSON(data));
		},
		
		getUserData: function(acc){
			var userData = $.zui.store.getItem(acc);
			if(userData){
				userData = utils.parseJSON(userData);
			} else {
				userData = {};
			}
			return userData;
		},
		
		getSubPageUrl: function(url){
			if(url.indexOf("?") == -1){
				url += "?t=1";
			}
			return url + '&rdmt=' + (new Date().getTime()) + document.location.hash;
		}
		
	};
});