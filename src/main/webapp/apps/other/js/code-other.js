/**
 * 
 */
define(function(require, exports, module) {
	var comm =  require('../../common/common');
	require("../../../lib/prettify/prettify.js");
	
	function PageScript(){
		this.rights = [];
	}
	
	PageScript.prototype = {
		
		init: function(){
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			
			page.bindEvent();
		},
		
		bindEvent: function(){
			
			$('.btn-conver1').on('click', function(){
				var that = $(this);
				var str = $('#str1').val(),
					isFillEmpty = $('#fillEmptyLine').is(":checked"),
					plusBr = $('#plusBr').is(":checked");
				var sb = [];
				if(str){
					var arr = str.split('\n'), br = '';
					sb.push("StringBuffer sb = new StringBuffer();");
					for(var i = 0, k = arr.length; i < k; i++){
						if(!isFillEmpty || arr[i].replace(/^[\s\t\r\n]+$/g, "")){
							br = plusBr ? (i < k - 1 ? '\\n' : '') : '';
							sb.push('sb.append("' + arr[i].replace(/[\\]/g, '\\\\').replace(/["]/g, '\\"') + '' + br + '");');
						}
					}
				}
				$('#res1').removeClass('prettyprinted').text(sb.join('\n'));
				
				setTimeout(prettyPrint, 100);
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.closeFrame = page.closeFrame;
});