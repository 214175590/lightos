/**
 * ##模块加载器##
 * board 看板
 * calendar 日历
 * chart 图标
 * chosen 下拉选择框
 * datatable 数据表格
 * datetimepicker 日期选择器
 * droppable 拖动
 * hotkey 热键
 * imgcutter 图片剪切器
 * kindeditor 富文本编辑器
 * migrate 图片放大
 * markdown 
 * array 数组扩展
 * bootbox 弹出框组件
 * clipboard 粘贴板
 * colorpicker 颜色选择器
 * colorset 颜色设置
 * dashboard 
 * imgready 图片加载
 * selectable 数据表格滑动多选组件
 * sortable 数据表格排序组件
 * ueditor 富文本编辑器
 * validate 验证框架
 * ztree 
 * sockjs websocket框架
 * websocket websocket封装 
 * contextmenu 右键菜单 
 * uploadify 文件上传控件
 * waves 
 * yxos yxos
 * clippy clippy
 *
 * 使用方法：
 * ```javascript
 *
 *  //使用datatable模块
 *  $.useModule(['datatable']);
 * 
 *  //使用datatable 与 calendar 模块
 *  $.useModule(['datatable', 'calendar']);
 * 
 *  //加载模块后执行回调函数
 *  $.useModule(['datatable', 'calendar'], function(){
 *  
 *  });
 *
 * ```
 * @module core
 */
define(function(require, exports, module) {
	var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
	
	$.useLocalModule = function(){
		var mods = arguments[0];
		var callback = arguments[1];
		
		$.useModule(mods, callback, 'local');
	};
	
	$.useModule = function(){
		
		var mods = arguments[0];
		
		var callback = arguments[1];
		var resp = arguments[2] || 'local';
		
		if(mods && _.isArray(mods) && mods.length > 0){
			var fileArr = [],
				jsfile, cssfile;
				try{
				
				$.each(mods, function(i, name) {
					
					switch(name){
						
						case 'board': 
							cssfile = getCss('lib/board/zui.board.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/board/zui.board.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'calendar': 
							cssfile = getCss('lib/calendar/zui.calendar.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/calendar/zui.calendar.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'chart': 
							jsfile = getScript('lib/chart/zui.chart.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'chosen': 
							cssfile = getCss('lib/chosen/chosen.css', resp);
							cssfile && fileArr.push(({name: name, src: cssfile, type: 'css'}));
							cssfile = getCss('lib/chosenicons/zui.chosenicons.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/chosen/chosen.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							jsfile = getScript('lib/chosenicons/zui.chosenicons.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'datatable': 
							cssfile = getCss('lib/datatable/zui.datatable.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/datatable/zui.datatable.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;	
						case 'datetimepicker': 
							cssfile = getCss('lib/datetimepicker/datetimepicker.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/datetimepicker/datetimepicker.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'droppable': 
							jsfile = getScript('lib/droppable/droppable.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'hotkey': 
							jsfile = getScript('lib/hotkey/hotkey.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'imgcutter': 
							cssfile = getCss('lib/imgcutter/zui.imgcutter.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/imgcutter/zui.imgcutter.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'kindeditor': 
							cssfile = getCss('lib/kindeditor/kindeditor.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/kindeditor/kindeditor.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'migrate': 
							jsfile = getScript('lib/migrate/migrate1.2.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'array': 
							jsfile = getScript('lib/array/zui.array.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'bootbox': 
							cssfile = getCss('lib/bootbox/bootbox.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/bootbox/bootbox.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'chosenicons': 
							cssfile = getCss('lib/chosenicons/zui.chosenicons.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/chosenicons/zui.chosenicons.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'clipboard': 
							jsfile = getScript('lib/clipboard/clipboard.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'colorpicker': 
							cssfile = getCss('lib/colorpicker/zui.chosenicons.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/colorpicker/zui.colorpicker.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'colorset': 
							jsfile = getScript('lib/colorset/colorset.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'dashboard': 
							cssfile = getCss('lib/dashboard/zui.dashboard.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/dashboard/zui.dashboard.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'imgready': 
							jsfile = getScript('lib/imgready/imgready.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'selectable': 
							jsfile = getScript('lib/selectable/zui.selectable.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'sortable': 
							jsfile = getScript('lib/selectable/zui.sortable.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'ueditor': 
							cssfile = getCss('lib/ueditor/ueditor.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							break;
						case 'yswebsocket': 
							jsfile = getScript('lib/websocket/yswebsocket-1.0.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'markdown': 
							jsfile = getScript('lib/markdown/remarkable.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'validate': 
							jsfile = getScript('lib/zuiplugin/zui.validate.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'sjs'});
							break;
						case 'ztree': 
							cssfile = getCss('lib/ztree/style/ztree.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/ztree/ztree.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'sockjs': 
							jsfile = getScript('lib/websocket/sockjs/sockjs.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'websocket': 
							jsfile = getScript('lib/websocket/websocket.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'contextmenu': 
							jsfile = getScript('lib/zuiplugin/zui.contextmenu.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'uploadify': 
							jsfile = getScript('lib/uploadify/uploadify.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'sjs'});
							break;
						case 'zuipager': 
							jsfile = getScript('lib/zuiplugin/zui.pager.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'sjs'});
							break;
						case 'waves': 
							cssfile = getCss('lib/waves/0.7.5/waves.min.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/waves/0.7.5/waves.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
						case 'yxos': 
							cssfile = getCss('lib/yxos/yxos.1.0.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/yxos/yxos.all.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'sjs'});
							break;
						case 'yxmos': 
							cssfile = getCss('lib/yxos/yxmos.1.0.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/yxos/yxos.m.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'sjs'});
							break;
						case 'clippy': 
							cssfile = getCss('lib/clippy/clippy.css', resp);
							cssfile && fileArr.push({name: name, src: cssfile, type: 'css'});
							
							jsfile = getScript('lib/clippy/clippy.min.js', resp);
							jsfile && fileArr.push({name: name, src: jsfile, type: 'js'});
							break;
					}
				});
				
			}catch(e){
				console.error("useModule 1：", e);
			}
			$.loadScriptCss(fileArr, callback);
			
		}
		
	};
	
	function getScript(path, resp){
		var result = null;
		if(resp == 'local'){
			$('script').each(function(i, scr){
				var url = scr.src.substring(scr.src.indexOf("://") + 3);
				if(url.indexOf(path) == -1){
					result = path;
					return result;
				}
			});
		} else {
			result = seajs.REMOTE_RESP_URL + path;
		}
		return result;
	}
	
	function getCss(path, resp){
		var result = null;
		if(resp == 'local'){
			$('link').each(function(i, scr){
				var url = scr.href.substring(scr.href.indexOf("://") + 3);
				if(url.indexOf(path) == -1){
					result = path;
					return result;
				}
			});
		} else {
			result = seajs.REMOTE_RESP_URL + path;
		}
		return result;
	}
	
	function resole(path){
		return consts.WEB_BASE + path + "#";
	}
	
	function addOnload(node, callback) {
        var supportOnload = "onload" in node;

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function() {
                onload();
            }
        }
        else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            }
        }

        function onload() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;
            // Remove the script to reduce memory leak
            head.removeChild(node);
            // Dereference the node
            node = null;
            callback();
        }
    }
	
	$.loadScriptCss = function(){
		if(arguments.length > 0){
			var fileArr = arguments[0];
			var callback = arguments[1];
			var all = 0, node = null, loadCount = 0, item = {},
				callArg = {};
			for(var i = 0, k = fileArr.length; i < k; i++){
				item = fileArr[i];
				if(item.type == 'css'){
					$("<link>").attr({ rel: "stylesheet", href: resole(item.src) }).appendTo("head");
				} else if(item.type == 'js'){
					//$("<script>").attr({src: resole(fileArr[i]) }).appendTo("head");
					node = document.createElement("script");
					node.async = true;
			        node.src = resole(item.src);
			        addOnload(node, function(){
			        	loadCount++;
			        });
			        head.appendChild(node);
			        all++;
				} else if(item.type == 'sjs'){
					var useCaller = function(obj, name){
						callArg[name] = obj;
						loadCount++;
					};
					seajs.use(item.src, useCaller, item.name);
			        all++;
				}
			}
			var inter = setInterval(function(){
				if(all == loadCount && callback && _.isFunction(callback)){
					clearInterval(inter);
					callback.call(window, callArg);
					$.useModuleCaller && $.useModuleCaller.call(window, callArg);
				}
			}, 10);
		}
	};
	
	// 禁用IE的兼容模式
	/*if(!$('meta[http-equiv="X-UA-Compatible"]').length){
		var meta = document.createElement("meta");
		meta.setAttribute("http-equiv", "X-UA-Compatible");
		meta.setAttribute("content", "IE=edge");
		head.appendChild(meta);
	}*/
	
});