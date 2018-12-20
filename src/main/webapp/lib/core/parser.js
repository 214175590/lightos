/**
 * ##parser模块，用于bui组件界面解析##
 * @module core/parser
 * @author yisin
 */
define(function(require, exports, module) {
	
	var PageScript = function(){
		
	}
	
	PageScript.prototype.init = function(){
		$(function(){
			initParse();
		});
	};
	
	PageScript.prototype.lazyLoadImage = function(){
		if(window['IntersectionObserver']){
			var observer = new IntersectionObserver(
				function(changes) {
					changes.forEach(function(change) {
						var container = change.target,
							that = $(container),
							src = that.data('src');
						if(src){
							that.attr('src', src.substring(0, 4) == 'http' ? src : seajs.data.base + src).removeAttr('data-src');
						}
						observer.unobserve(container);
					});
				}
			);
			$('img').each(function(){
				observer.observe(this);
			});
		} else {
			$('img').each(function(){
				var that = $(this),
				src = that.data('src');
				if(src){
					that.attr('src', src.substring(0, 4) == 'http' ? src : seajs.data.base + src).removeAttr('data-src');
				}
			});
		}
		
		$('[data-toggle="tooltip"]').tooltip();
	};
	
	var initParse = function(){
		/**
		 * 页面包含解析
		 */
		$('[data-toggle=import]').each(function(i, e){
			var $ele = $(e),
				id = $ele.attr('id');
			if($ele.data('init') != 'complate' && id){
				$('#' + id).load(seajs.data.base + 'apps/' + $ele.data('url'), function(){
					$ele.attr('data-init', 'complate')
						.removeAttr('data-toggle')
						.removeAttr('data-url');
					
					page.lazyLoadImage();
				});
			}
		});
		
		page.lazyLoadImage();
	};
	
	var page = new PageScript();
	page.init();
	return page;
});