/**
 * ==============================================
 * YXOS 移动版 1.0
 * Author: Yisin
 * Email : admin@yinsin.net 
 * ==============================================
 */

+ function($, win){
	var DIRNAME_RE = /[^?#]*\//;
	
	function dirname(path) {
        return path.match(DIRNAME_RE)[0];
    }
	
	var doc = document;
    var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href);
    var scripts = doc.scripts;
    var root = (function(){
    	var urls = cwd.substring(cwd.indexOf("//") + 2),
    		one = urls.indexOf("/");
    	if(one != -1){
    		urls = urls.substring(one, urls.indexOf('/', one + 1) + 1);
    		if(urls){
    			return urls;
    		}
    	}
    	return "/";
    })();
    
    var yxosScript = doc.getElementById("seajsnode") || scripts[scripts.length - 1];
    
    var yxosDir = dirname(getScriptAbsoluteSrc(yxosScript) || cwd);
    
    var eventStore = {};
	
	function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? node.src : node.getAttribute("src", 4);
    }
	
	win.YXOs = {
		name: "YXOs",
		version: "1.0",
		
		base: cwd,
		
		root: root,
		
		path: yxosDir,
		
		script: yxosScript,
		
		globalConfig : {
						
			theme: 'default',
			
			desktopIconWidth: 90,
			
			desktopIconHeight: 90
		},
		
		addEvent: function(key, callback){
			if(!eventStore[key]){
				eventStore[key] = [];	
			}
			eventStore[key].push(callback);
		},
		
		callEvent: function(key, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10){
			if(eventStore[key]){
				var evs = eventStore[key];
				for(var i = 0, k = evs.length; i < k; i++){
					if(Object.prototype.toString.call(evs[i]) === '[object Function]'){
						evs[i].call(this, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10);
					}
				}
			}
		},
		
		screenWidth: function(){
			return $(this.desktop.body).width();
		},
		
		screenHeight: function(){
			return $(this.desktop.body).height();
		},
		
		clientHeight: function(){
			return $(this.desktop.body).height() - $(this.desktop.taskbar.body).height();
		},
		
		initStartMenu: function(itemList, callback){
			this.desktop.startMenu.init(itemList, callback);
		},
		
		utils: {
			
			is: function(value, type){
				return Object.prototype.toString.call(value) === "[object " + type + "]";
			},
			
			format: function(){
				var res = arguments[0],
					l = arguments.length;
				if(res && l > 1){
					for(var i = 1; i < l; i++){
						res = res.replace('{' + (i - 1) + '}', arguments[i]);
					}
				}
				return res;
			},
			
			formatByJson: function(str, json){
		    	if(this.is(json, 'Object')){
		    		for(var key in json){
		    			str = str.replace("{" + key + "}", json[key]);
		    		}
		    	}
		    	return str;
		   },
			
			/**
			 * 创建UUID
			 * @param Number l 长度
			 * @param Number r
			 */
			UUID: function(l, r) {
				var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
						.split('');
				var createUUID = function(len, radix) {
					var chars = CHARS, uuid = [], i;
					radix = radix || chars.length;
					if (len) {
						// Compact form
						for (i = 0; i < len; i++)
							uuid[i] = chars[0 | Math.random() * radix];
					} else {
						// rfc4122, version 4 form
						var r;
						// rfc4122 requires these characters
						uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
						uuid[14] = '4';
						// Fill in random data. At i==19 set the high bits of clock sequence
						// as
						// per rfc4122, sec. 4.1.5
						for (i = 0; i < 36; i++) {
							if (!uuid[i]) {
								r = 0 | Math.random() * 16;
								uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
							}
						}
					}
					return uuid.join('');
				};
				return createUUID(l, r);
			},
			
			/**
			 * 获取参数值，若没有则给定默认值
			 * @param {JSON} ops
			 * @param {String} field
			 * @param {Object} val
			 * @param {String} type 类型：Object、Function、String、Number、Date、Array、Boolean、Window
			 */
			getOptionValue: function(ops, field, val, type) {
				ops = ops == undefined || ops == null ? {} : ops;
				if (type) {
					if (ops[field] != undefined && Object.prototype.toString.call(ops[field]) !== ('[object ' + type + ']')) {
						throw new Error('无效参数');
					} else {
						val = ops[field] == undefined ? val : ops[field];
					}
				} else {
					val = ops[field] == undefined ? val : ops[field];
				}
				return val;
			},
			
			stopEvent: function(e){
				try{
					if(e){
						e.stopPropagation();
						e.preventDefault();
					}
				}catch(ex){}				
			},
			
			// 根据对象属性排序
			objSort: function(name){
				return function(o, p){
				  	var a, b;
				   	if (typeof o === "object" && typeof p === "object" && o && p) {
				     	a = o[name];
				     	b = p[name];
				     	if (a === b) {
				       		return 0;
				     	}
				     	if (typeof a === typeof b) {
				       		return a < b ? -1 : 1;
				     	}
				     	return typeof a < typeof b ? -1 : 1;
				   	} else {
				     	throw ("error");
				   	}
				}
			},
			
			requestFullScreen: function (element) {
			    // 判断各种浏览器，找到正确的方法
			    var requestMethod = element.requestFullScreen || //W3C
			    element.webkitRequestFullScreen ||    //Chrome等
			    element.mozRequestFullScreen || //FireFox
			    element.msRequestFullScreen; //IE11
			    if (requestMethod) {
			        requestMethod.call(element);
			    }
			    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
			        var wscript = new ActiveXObject("WScript.Shell");
			        if (wscript !== null) {
			            wscript.SendKeys("{F11}");
			        }
			    }
			}, 

			//退出全屏 判断浏览器种类
			exitFull: function() {
			    // 判断各种浏览器，找到正确的方法
			    var exitMethod = document.exitFullscreen || //W3C
			    document.mozCancelFullScreen ||    //Chrome等
			    document.webkitExitFullscreen || //FireFox
			    document.webkitExitFullscreen; //IE11
			    if (exitMethod) {
			        exitMethod.call(document);
			    }
			    else if (typeof window.ActiveXObject !== "undefined") {//for Internet Explorer
			        var wscript = new ActiveXObject("WScript.Shell");
			        if (wscript !== null) {
			            wscript.SendKeys("{F11}");
			        }
			    }
			}
			
			
			//
			
		},
		
		/**
		 * 控制器
		 * 桌面图标控制器、任务栏控制器、桌面控制器...
		 */
		control: {			
			
			// 桌面图标层级
			dtIconZIndex: {
				value: 10,
				next: function(){
					return this.value ++;
				}
			},
			
			dtIconReset: function(dtIconId, flag){
				var DIcon = null,
					flag = flag == undefined ? true : flag,
					DIconSet = YXOs.desktop.DesktopIconMap.valueSet();
				for(var index in DIconSet){					
					DIcon = DIconSet[index];
					if(DIcon){
						if(dtIconId){
							if(flag){
								if(dtIconId === DIcon.id){
									DIcon.reset();
									break;
								}
							} else if(dtIconId !== DIcon.id){
								DIcon.reset();
							}														
						} else {
							DIcon.reset();
						}
					}		
				}
			},
			
			
			// 窗口层级
			windowZIndex: {
				value: 10000,
				next: function(){
					return this.value ++;
				}
			},
			
			// 获得窗口
			getDesktopIcon: function(iconid){
				return YXOs.desktop.DesktopIconMap.get(iconid);
			},
			
			// 获得窗口
			getWindow: function(windowId){
				return YXOs.desktop.WindowMap.get(windowId);
			},
			
			// 根据桌面图标获得窗口
			getWindowBy: function(iconid){
				var icon = YXOs.desktop.DesktopIconMap.get(iconid);
				if(icon){
					return icon.window;
				}
				return null;
			},
			
			// 关闭窗口
			closeWindow: function(windowId){
				var win = YXOs.desktop.WindowMap.get(windowId);
				if(win){
					win.close();
				}
			},
			
			// 窗口失去焦点
			windowBlur: function(windowId, flag){
				var YXWin = null,
					flag = flag == undefined ? true : flag,
					YXWinSet = YXOs.desktop.WindowMap.valueSet();
				for(var index in YXWinSet){					
					YXWin = YXWinSet[index];
					if(YXWin){
						if(windowId){
							if(flag){
								if(windowId === YXWin.id){
									YXWin.blur();
									break;
								}
							} else if(windowId !== YXWin.id){
								YXWin.blur();
							}														
						} else {
							YXWin.blur();
						}
					}		
				}
			},
			
			// 获得新窗口坐标
			getWindowPosition: function(winW, winH) {
				var screenWidth = YXOs.screenWidth(),
					screenHeight = YXOs.screenHeight();
					
				var winX = (screenWidth - winW)/2,
					winY = (screenHeight - winH)/2,
					taskbarHeight = YXOs.desktop.taskbar.getHeight(),
					tempX = winX,
					tempY = winY - taskbarHeight,
					
					has = false,
					tempLeft = winX,
					tempTop = winY, 
					minleft = 30, 
					mintop = 20,
					winobj = null;
								
				var objset = YXOs.desktop.WindowMap.valueSet(),
					size = objset.length;
				if(size){
					for(var i = 0; i < 15; i++){
						tempX = tempX + minleft;
						tempY = tempY + mintop;
						has = false;
						
						if(tempX + winW > screenWidth - minleft){
							tempX = minleft;
						}
						if(tempY + winH > screenHeight - taskbarHeight){
							tempY = mintop;
						}
						for ( var j = 0; j < size; j++) {
							winobj = objset[j];
							if(Math.abs(tempX - winobj.left) <= minleft/2 && Math.abs(tempY - winobj.top) <= mintop/2){
								has = true;
								if(Math.abs(tempX - winobj.left) <= minleft/2 ){
									tempLeft = tempX + minleft;
								}
								if(Math.abs(tempY - winobj.top) <= mintop/2 ){
									tempTop = tempY + mintop;
								}
								break;
							}
						}
						if(!has){
							tempLeft = tempX;
							tempTop = tempY;
							break;
						}
					}
				}
				return {
					left : tempLeft,
					top : tempTop
				};
			},
			
			// 获取上一个窗口
			getPreviousWindow: function(wid){
				var yxwin = null,
					winSet = YXOs.desktop.WindowMap.valueSet();
				if(winSet.length){
					var winArr = [], win;
					for(var i = 0, k = winSet.length; i < k; i++){
						win = winSet[i];
						if(win && win.id != wid && win.status != 'Minimize'){
							winArr.push(win);	
						}						
					}
					winArr.sort(YXOs.utils.objSort('index'));
					yxwin = winArr[winArr.length - 1];
				}
				return yxwin;
			},
			
			// 右键菜单层级
			contextMenuZIndex: {
				value: 70000,
				next: function(){
					return this.value ++;
				}
			},
			
			// 窗口句柄失效
			windowHandleBlur: function(winHandId, flag){
				var winHand = null,
					flag = flag == undefined ? true : flag,
					winHandSet = YXOs.desktop.taskbar.WindowHandleMap.valueSet();
				for(var index in winHandSet){					
					winHand = winHandSet[index];
					if(winHand){
						if(winHandId){
							if(flag){
								if(winHandId === winHand.id){
									winHand.blur();
									break;
								}
							} else if(winHandId !== winHand.id){
								winHand.blur();
							}														
						} else {
							winHand.blur();
						}
					}		
				}
			}
			
			
			
		}
		
	};
	
	/**
	 * 自定义List对象，模仿java中的ArrayList
	 */
	win.YList = function() {
		(function(yl) {
			var array = new Array();
			// 0：表示最新状态， 非0 表示有更改状态
			yl.status = 0;
			// 添加一项
			yl.add = function(obj) {
				if (obj != undefined) {
					array.push(obj);
					yl.status++;
				} else {
					throw new Error('无效参数');
				}
				return yl;
			};
			// 刷新List,去除undefined和null
			yl.fush = function() {
				var len = array.length;
				var temp = null;
				for ( var i = 0; i < len; i++) {
					for ( var j = i + 1; j < len; j++) {
						if (array[i] == undefined || array[i] == null) {
							temp = array[i];
							array[i] = array[j];
							array[j] = temp;
						}
					}
					;
				}
				;
				for ( var i = 0; i < len; i++) {
					if (array[i] == undefined || array[i] == null) {
						array.length = i;
						break;
					}
				}
				yl.status = 0;
				return yl;
			};
			// 获取总数量
			yl.size = function() {
				if (yl.status > 0) {
					yl.fush();
					yl.status = 0;
				}
				return array.length;
			};
			// 获取某一项值
			yl.get = function(index) {
				if (typeof (index) != 'number') {
					throw new Error('无效参数');
				} else if (index < 0 || index >= array.length) {
					throw new Error('索引值超出范围');
				} else {
					return array[index];
				}
			};
			// 移出某一项
			yl.remove = function(index) {
				if (typeof (index) != 'number') {
					throw new Error('无效参数');
				} else if (index < 0 || index >= array.length) {
					throw new Error('索引值超出范围');
				} else {
					array[index] = undefined;
					yl.status++;
				}
				return yl;
			};
			// 清空List
			yl.clear = function() {
				array.length = 0;
				yl.status = 0;
				return yl;
			};
		})(this);
	}

	/**
	 * 自定义Map对象，模仿java中的 HashMap
	 */
	win.YMap = function() {
		(function(ym) {
			var map = function(k, v) {
				this.key = k;
				this.value = v;
			};
	
			ym.list = new YList();
			// 获取总数量
			ym.size = function() {
				return ym.list.size();
			};
			// 往容器中填充对象
			ym.put = function(k, v) {
				if (k != undefined && k != null) {
					var mp = new map(k, v);
					ym.list.add(mp);
				} else {
					throw new Error('无效参数');
				}
				return ym;
			};
	
			// 移出某项
			ym.remove = function(k) {
				if (k != undefined && k != null) {
					for ( var i = 0; i < ym.list.size(); i++) {
						var mp = ym.list.get(i);
						if (mp != null && mp.key == k) {
							ym.list.remove(i);
							ym.list.fush();
						}
						;
					}
					;
				} else {
					throw new Error('无效参数');
				}
				return ym;
			};
	
			// 根据key值获取对象
			ym.get = function(k) {
				var result = null;
				if (k != undefined && k != null) {
					for ( var i = 0; i < ym.size(); i++) {
						var mp = ym.list.get(i);
						if (mp != null && mp.key == k) {
							result = mp.value;
							break;
						}
						;
					}
					;
				} else {
					throw new Error('无效参数');
				}
				return result;
			};
			// 移出所有项
			ym.removeAll = function() {
				ym.list.clear();
				return ym;
			};
			// 判断是否存在K项
			ym.contant = function(k) {
				var result = false;
				if (k != undefined && k != null) {
					for ( var i = 0; i < ym.size(); i++) {
						var mp = ym.list.get(i);
						if (mp != null && mp.key == k) {
							result = true;
							break;
						}
					}
				} else {
					throw new Error('无效参数');
				}
				return result;
			};
			// 获取到所有Key集合
			ym.keySet = function() {
				var arry = new Array();
				for ( var i = 0; i < ym.size(); i++) {
					var mp = ym.list.get(i);
					if (mp != undefined && mp != null) {
						arry.push(mp.key);
					}
				}
				return arry;
			};
			// 获取到所有value集合
			ym.valueSet = function() {
				var arry = new Array();
				for ( var i = 0; i < ym.size(); i++) {
					var mp = ym.list.get(i);
					if (mp != undefined && mp != null) {
						arry.push(mp.value);
					}
				}
				return arry;
			};
		})(this);
	}
	
	
	/**
	 * 拖动元素方法
	 */
	win.YXOs.dragDom = function(ops){
		var $handle = ops.handle,
			$target = ops.target,
			custom = ops.custom,
			clicked = "Nope.",
	        mausx = "0",
	        mausy = "0",
	        winx = "0",
	        winy = "0",
	        difx = mausx - winx,
	        dify = mausy - winy,
	        newx = 0, newy = 0,
	        timeoutHandle = -1;

        $("html").mousemove(function (event) {        	
            mausx = event.pageX;
            mausy = event.pageY;
            winx = $target.offset().left;
            winy = $target.offset().top;
            
            if (clicked == "Nope.") {
                difx = mausx - winx;
                dify = mausy - winy;
			}
            
            newx = event.pageX - difx - $target.css("marginLeft").replace('px', '');
            newy = event.pageY - dify - $target.css("marginTop").replace('px', '');
            $target.css({ top: newy, left: newx });    
            
            // 图标拖动事件
            if (clicked == "Yeah.") {
            	if(type == 'DesktopIcon'){
            		win.YXOs.callEvent('DesktopIconMoveing', $target, { top: newy, left: newx }, custom);
            	} else if(type == 'Window'){
            		win.YXOs.callEvent('WindowMoveing', $target, { top: newy, left: newx }, custom);
            	}
            }
        });

        $handle.mousedown(function (event) {
        	timeoutHandle = setTimeout(function(){
        		clicked = "Yeah.";
        	}, 30);
        	if(type == 'DesktopIcon'){
        		win.YXOs.callEvent('DesktopIconMoveStart', $target, { top: newy, left: newx }, custom);
        	} else if(type == 'Window'){
        		win.YXOs.callEvent('WindowMoveStart', $target, { top: newy, left: newx }, custom);
        	}
        });

        $handle.mouseup(function (event) {
            clicked = "Nope.";
            if(timeoutHandle != -1){
            	clearTimeout(timeoutHandle);
            	timeoutHandle = -1;
            }
            if(type == 'DesktopIcon'){
        		win.YXOs.callEvent('DesktopIconMoveEnd', $target, { top: newy, left: newx }, custom);
        	} else if(type == 'Window'){
        		win.YXOs.callEvent('WindowMoveEnd', $target, { top: newy, left: newx }, custom);
        	}
        });
		
	};
	
}(jQuery, window);


/**
 * ==============================================
 * YSOs Window.js
 * ==============================================
 */

+ function($, win, os){
	
	os.YXWindow = function(ops){
		this.body = $('<div class="yxos-window dialog-can-resize hidden"><div class="window aui_outer"></div><div class="move_cover hidden"></div></div>');
		this.window = this.body.find('.window');
		this.moveCover = this.body.find('.move_cover');
		
		this.appId = ops.appId || YXOs.utils.UUID(20);
		this.id = "window-" + this.appId;
		this.body.attr('id', this.id);
		this.body.data('id', this.appId);
		
		this.width = ops.width || 360;
		this.height = ops.height || 460;
		this.needMax = ops.needMax == undefined ? true : ops.needMax;
		this.needMin = ops.needMin == undefined ? true : ops.needMin;
		this.needClose = ops.needClose == undefined ? true : ops.needClose;
		
		if(this.width >= os.screenWidth() - 10){
			this.width = os.screenWidth() - 10;
			ops.left = 5;
		}
		if(this.height >= (os.clientHeight() - 10)){
			this.height = os.clientHeight() - 12,
			ops.top = 5;
		}
		
		this.index = os.control.windowZIndex.next();
		
		var pos = os.control.getWindowPosition(this.width, this.height);
		
		this.left = ops.left || pos.left;
		this.top = ops.top || pos.top;
		this.title = ops.title;
		this.url = ops.url;
		this.html = ops.html;
		this.types = ops.types;
		
		this.icon = ops.icon;
		
		// 是否为获得焦点状态
		this.isfocus = os.utils.getOptionValue(ops, 'isfocus', true, 'Boolean');
		// 窗口的窗口图标ID
		this.desktopIconId = ops.desktopIconId;
		// 窗口的任务栏句柄ID
		this.winHandId = "";
		// 窗口状态 'Minimize', 'Maximize', 'Nomal'
		this.status = 'Nomal';
		this.tempStatus = '';
		
		this.headHeight = 31;
		this.footerHeight = ops.hasFooter ? 32 : 0;
		this.bodyHeight = this.height - this.headHeight - this.footerHeight;
		
		this.titlebar = null;
		this.contextMenu = null;
				
		this.init(ops);
	};
	
	os.YXWindow.prototype = {
		
		init: function(ops){
			if(ops.types != 'link'){
				var self = this,
				html =  '<div class="aui_mark load"><div class="spinner"></div></div>';
				html += '<div class="aui_inner">';
				html += '	 <div class="aui_header">';
				html += '	     <div class="aui_titleBar dialog_menu">';
				html += '		      <div class="aui_title" style="cursor: move;">';
				html += '		         {0}<span class="title_name">{1}</span>';
				html += '		      </div>';
				if(self.needMin){
					html += '		     <a class="aui_min' + (self.needMax ? '' : ' nomax') + '"></a>';
				}
				if(self.needMax){
					html += '		     <a class="aui_max"></a>';
				}
				if(self.needClose){
					html += '		     <a class="aui_close"></a>';
				}
				html += '	     </div>';
				html += '	 </div>';
				html += '	 <div class="aui_main">';
				html += '	      <div class="aui_content aui_state_full" style="display: block;">';
				html += '		      <iframe src="{2}" id="frame-{3}" name="frame-{4}" frameborder="0" allowtransparency="true" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" style="width: 100%; border: 0px none;"></iframe>';
				html += '	      </div>';
				html += '	 </div>';
				html += '</div>';			
				
				var icon = os.utils.format('<img class="win-icon" src="{0}" />', self.icon);
				self.window.html(os.utils.format(html, icon, self.title, self.url + '#' + self.id, self.id, self.id));
				
				self.iframe = self.body.find('#frame-' + self.id);
				self.iframe.css('height', self.bodyHeight);
				
				self.body.css({
					"width": self.width,
					"height": self.height,
					"left": self.left,
					"top": self.top,
					"z-index": self.index
				});
				
				self.body.find('.aui_main').css({
					"width": self.width,
					"height": self.bodyHeight
				});
				
				self.body.find('.aui_mark .spinner').css({
					"margin-top": self.bodyHeight/2 - 40
				});
				
				self.titlebar = self.window.find('.aui_titleBar');
				
				os.desktop.addWindow(self);
				
				self.focus();
				
				self.bindEvent();
			}
		},
		
		bindEvent: function(){
			var self = this,
				iframe = self.body.find('#frame-' + self.id),
				mark = self.body.find('.aui_mark'),
				min = self.body.find('.aui_min'),
				max = self.body.find('.aui_max'),
				close = self.body.find('.aui_close'),
				
				resizeTop = self.body.find('.resize-handle.resize-top'),
				resizeRight = self.body.find('.resize-handle.resize-right'),
				resizeBottom = self.body.find('.resize-handle.resize-bottom'),
				resizeLeft = self.body.find('.resize-handle.resize-left'),
				resizeTopRight = self.body.find('.resize-handle.resize-top-right'),
				resizeBottomRight = self.body.find('.resize-handle.resize-bottom-right'),
				resizeBottomLeft = self.body.find('.resize-handle.resize-bottom-left'),
				resizeTopLeft = self.body.find('.resize-handle.resize-top-left');
				
			self.minBtn = min;
			self.maxBtn = max;
			self.closeBtn = close;
				
			var mausx, mausy, winx, winy, difw, difh, way, dpx = 3, clicked = 'Nope.', timeoutHandle = -1;
			
			// 窗口右键弹起事件
			self.window.on('mouseup', function(e){
				// 显示菜单
				if(e.button == 2){ // 右键点击
					self.showContextMenu(e.clientX, e.clientY);
				}
				
				os.utils.stopEvent(e);
			});
			
			// 窗口标题栏鼠标事件
			self.titlebar.on('mousedown', function(e){
				self.index = os.control.windowZIndex.next();
				self.body.css({
					"z-index": self.index
				});
				os.control.windowBlur();
				os.utils.stopEvent(e);
			}).on('mouseup', function(e){
				self.index = os.control.windowZIndex.next();
				self.body.css({
					"z-index": self.index
				});
				self.focus();
				
				if(self.status === 'Nomal'){
					self.left = self.body.offset().left;
					self.top = self.body.offset().top;
				}
				
				// 显示菜单
				if(e.button == 2){ // 右键点击
					self.showContextMenu(e.clientX, e.clientY);
				}
				
				os.utils.stopEvent(e);
			}).on('dblclick', function(e){ // 窗口标题栏双击事件
				if(self.status === 'Nomal'){
					self.maximize();
				} else {
					self.nomal();
				}
				
				os.utils.stopEvent(e);
			});
			
			// 窗口遮罩层点击事件
			mark.on('mousedown', function(e){
				self.focus(); // 本窗口获得焦点
				os.desktop.hideOtherContextMenu(); // 隐藏桌面菜单
				os.utils.stopEvent(e);
			});
			
			// 窗口页面加载完成
			iframe.on('load', function(e){
				mark.removeClass('load').addClass('hidden');
				mark.find('.spinner').addClass('hidden');
			});
			
			// 最小化按钮点击
			min.on('mousedown', function(e){
				os.utils.stopEvent(e);
			}).on('mouseup', function(e){
				if(e.button == 0){ // 0左键点击、1中键、2右键
					self.minimize();
				}
				os.utils.stopEvent(e);
			});
			
			// 最大化按钮点击
			max.on('mousedown', function(e){
				os.utils.stopEvent(e);
			}).on('mouseup', function(e){
				if(e.button == 0){ // 左键点击
					if(self.status === 'Nomal'){
						self.maximize();
					} else {
						self.nomal();
					}
				}
				
				os.utils.stopEvent(e);
			});
			
			// 关闭按钮点击
			close.on('mousedown', function(e){
				os.utils.stopEvent(e);
			}).on('mouseup', function(e){
				if(e.button == 0){ // 左键点击
					self.close();
				}
				os.utils.stopEvent(e);
			});
			
			os.dragDom({
				custom: self,
				type: 'Window',
				handle: self.titlebar,
				target: self.body
			});
		},
		
		open: function() {
			var self = this;
			if(self.types == 'link'){
				window.open(self.url);
				self.close();
			} else {
				self.body.animate(
						{
							width: self.width,
							height: self.height,
							top: self.top,
							left: self.left,
							opacity: 1
						}, 100, function(){
							
						});
				self.body.removeClass('hidden');
				self.status = 'Nomal';
				self.focus();
			}
		},
		
		show: function() {
			var self = this;
			if(self.tempStatus){
				if(self.tempStatus == 'Maximize'){
					self.maximize();
				} else if(self.tempStatus == 'Nomal'){
					self.nomal();
				}
				self.tempStatus = "";
			}
			self.body.removeClass('hidden');
			self.focus();
		},
		
		hide: function() {
			this.body.addClass('hidden');
		},
		
		blur: function(){
			var self = this,
				mark = self.body.find('.aui_mark');
			self.isfocus = false;
			mark.removeClass('hidden').addClass('cover');
			// 失去焦点时隐藏菜单
			self.hideContextMenu();
		},
		
		moveStart: function(){
			var self = this;
			self.moveCover.removeClass('hidden');
		},
		
		moveEnd: function(){
			var self = this;
			self.moveCover.addClass('hidden');
		},
		
		focus: function(){
			var self = this,
				mark = self.body.find('.aui_mark');
			self.isfocus = true;
			self.index = os.control.windowZIndex.next();
			self.body.css({
				"z-index": self.index
			});
			if(!mark.hasClass('load') && mark.hasClass('cover')){
				mark.addClass('hidden').removeClass('cover');
			}
			os.control.windowBlur(self.id, false);			
			
			os.desktop.taskbar.setWinHandFocus(self.winHandId);
		},
		
		minimize: function(){
			var self = this;
			self.body.animate(
			{
				width: 0,
				height: 0,
				top: os.screenHeight(),
				opacity: 0
			}, 100, function(){
				self.tempStatus = self.status;
				self.status = 'Minimize';					
				self.hide();
				
				// 获得下一个窗口
				var yxwin = os.control.getPreviousWindow(self.id);
				if(yxwin){
					yxwin.focus();
				} else {
					var winHand = os.desktop.taskbar.WindowHandleMap.get(self.winHandId);
					if(winHand){
						winHand.blurHand();
					}
				}
			});
		},
		
		maximize: function(){
			var self = this,
				newHeight = os.clientHeight() - 2;
			self.body.animate(
			{
				width: os.screenWidth(),
				height: newHeight,
				left: 0,
				top: 0,
				opacity: 1
			}, 100, function(){
				self.status = 'Maximize';
			});
			self.bodyHeight = newHeight - self.headHeight - self.footerHeight;
			
			if(self.contextMenu){
				self.contextMenu.disableItem('nomal', false);
				self.contextMenu.disableItem('max', true);
			}			
			
			self.body.find('.aui_main').css({
				"width": os.screenWidth(),
				"height": self.bodyHeight
			});
			
			self.body.find('.aui_mark .spinner').css({
				"margin-top": self.bodyHeight/2 - 40
			});
			
			self.iframe.css('height', self.bodyHeight);
		},
		
		nomal: function(){
			var self = this;
			self.body.animate(
				{
					width: self.width,
					height: self.height,
					left: self.left,
					top: self.top,
					opacity: 1
				}, 100, function(){
					self.status = 'Nomal';
			});
			self.bodyHeight = self.height - self.headHeight - self.footerHeight;
			if(self.contextMenu){
				self.contextMenu.disableItem('nomal', true);
				self.contextMenu.disableItem('max', false);
			}
			
			self.body.find('.aui_main').css({
				"width": self.width,
				"height": self.bodyHeight
			});
			
			self.body.find('.aui_mark .spinner').css({
				"margin-top": self.bodyHeight/2 - 40
			});
			
			self.iframe.css('height', self.bodyHeight);
		},
		
		close: function(){
			var self = this;
			self.body.animate(
			{
				width: 0,
				height: 0,
				top: os.screenHeight(),
				opacity: 0
			}, 100, function(){
				// 从桌面图标中移除
				os.desktop.delWindow(self); // 从窗口中移除
				
				// 获得下一个窗口
				var yxwin = os.control.getPreviousWindow();
				if(yxwin){
					yxwin.focus();
				}				
			});
		},
		
		resize: function(){
			var self = this;
			
			self.bodyHeight = self.height - self.headHeight - self.footerHeight;
			self.body.find('.aui_main').css({
				"width": self.width,
				"height": self.bodyHeight
			});
			
			self.body.find('.aui_mark .spinner').css({
				"margin-top": self.bodyHeight/2 - 40
			});
		},
		
		initContextMenu: function(x, y){
			var self = this;
			self.contextMenu = new os.YXContextMenu({
				cssClass: 'window-context-menu'
			});
			
			self.contextMenu.addItem([
				{
					icon: 'icon-undo',
					cssClass: 'nomal',
					title: '还原',
					click: function(){
						self.nomal();
					}
				},
				{
					icon: 'icon-expand-full',
					cssClass: 'max',
					title: '最大化',
					click: function(){
						self.maximize();
					}
				},
				{
					icon: 'icon-minus',
					cssClass: 'min',
					title: '最小化',
					click: function(){
						self.minimize();
					}
				},
				{
					icon: 'icon-expand-full',
					cssClass: 'fullscreen',
					title: '全屏显示',
					click: function(){
						os.utils.requestFullScreen(self.body[0]);
					}
				},
				{
					icon: 'icon-refresh',
					cssClass: 'min',
					title: '重新加载',
					click: function(){
						self.iframe.attr('src', self.iframe.attr('src'));
					}
				},
				{
					icon: 'icon-times',
					cssClass: 'close',
					title: '关闭',
					click: function(){
						self.close();
					}
				}
			]);
			self.contextMenu.disableItem('nomal', true);
			self.contextMenu.show(x, y);
		},
		
		showContextMenu: function(x, y){
			var self = this;
			
			if(self.contextMenu == null){
				self.initContextMenu(x, y);
			} else {
				self.contextMenu.show(x, y);
			}
		},
		
		hideContextMenu: function(){
			var self = this;
			if(self.contextMenu){
				self.contextMenu.hide();
			}
		},
		
		isMax: function(){
			return this.status === 'Maximize';
		},
		
		isMin: function(){
			return this.status === 'Minimize';
		},
		
		isNomal: function(){
			return this.status === 'Nomal';
		},
		
		setTitle: function(title){
			this.titlebar.find('.title_name').text(title);
		}
		
	};
}(jQuery, window, YXOs);


/**
 * ==============================================
 * YSOs TaskBar.js
 * ==============================================
 */

+ function($, win, os){
	
	os.YXTaskBar = function(){
		this.body = $('<div id="yxos-taskbar" class="yxos-taskbar"><div class="taskbar-start"><div class="window-start-menu"><i class="icon icon-apple"></i></div></div><div class="taskbar-tab"></div><div class="taskbar-func"></div></div>');
		
		this.taskbar_tabs = this.body.find('.taskbar-tab');
		this.taskbar_start = this.body.find('.taskbar-start');
		this.taskbar_func = this.body.find('.taskbar-func');
		this.start_menu = this.body.find('.window-start-menu');
		
		this.WindowHandleMap = new YMap();
		
		this.contextMenu = null;
		
		this.init();
	};
	
	os.YXTaskBar.prototype = {
		
		init: function(){
			
			this.body.css({
				"background-image": os.utils.format("url('{0}lib/yxos/skin/{1}/img/taskbarbg.png')",
				os.path, os.globalConfig.theme)
			});
			
			this.bindEvent();
		},
		
		bindEvent: function(){
			var self = this;
			
			// 窗口右键弹起事件
			self.body.on('mouseup', function(e){
				os.utils.stopEvent(e);
			});
			
			self.start_menu.on('click', function(){
				// 全部最小化
				var winHand = null,
					winHandSet = os.desktop.taskbar.WindowHandleMap.valueSet();
				for(var index in winHandSet){					
					winHand = winHandSet[index];
					if(winHand && winHand.window){
						winHand.window.minimize();
					}		
				}
			});
		},
		
		addWindowHandle: function(winHand){
			var self = this;
			
			self.taskbar_tabs.append(winHand.body);
			
			self.WindowHandleMap.put(winHand.id, winHand);
		},
		
		delWindowHandle: function(yxwin){
			var self = this;
			
			var winHand = self.WindowHandleMap.get(yxwin.winHandId);
			if(winHand){
				self.WindowHandleMap.remove(winHand.id);
				winHand.body.remove();
			}
		},
		
		setWinHandFocus: function(handId){
			var self = this,
				winHand = self.WindowHandleMap.get(handId);
			if(winHand){
				winHand.focusHand();
			}
		},
				
		getHeight: function(){
			return this.body.height();
		},
		
		hideStartMenu: function(){
			var self = this;
			
			self.start_menu.removeClass('active');
		}
		
		
	};
}(jQuery, window, YXOs);

/**
 * ==============================================
 * YSOs StartMenu.js
 * ==============================================
 */
+ function($, win, os){
	
	var ul_html = '<div class="yxos-start-menu {cssClass} hidden" id="{id}"></div>',
	li_html = '<div class="yxos-start-menu-item {cssClass}" data-ename="{cssClass}"><i class="icon {icon}"></i>{title}</div>';

	os.YXStartMenu = function(ops){
		ops = $.extend({
			cssClass: '',
			id: "start-menu-" + YXOs.utils.UUID(20)
		}, ops);
		this.id = ops.id;
		this.body = $(os.utils.formatByJson(ul_html, ops));
		this.cssClass = ops.cssClass;
	};
	
	os.YXStartMenu.prototype = {
			
		init: function(itemList, callback){
			var self = this;
			
			if(itemList){
				var item = {}, $item = {};
				for(var i = 0, k = itemList.length; i < k; i++){
					item = itemList[i];
					$item = $(os.utils.formatByJson(li_html, item));
					self.body.append($item);
					
					$item.bind('click', function(e){
						if(callback && Object.prototype.toString.call(callback) === '[object Function]'){
							callback.call(os, self, e);
						}
					})
				}
			}
			
		},
		
		show: function(){
			var self = this;
			if(self.body.hasClass('hidden')){
				self.body.removeClass('hidden');
			} else {
				self.body.addClass('hidden');
				os.desktop.taskbar.hideStartMenu();
			}
		}
	};
	
}(jQuery, window, YXOs);


/**
 * ==============================================
 * YSOs Desktop.js
 * ==============================================
 */

+ function($, w, os){
	
	var YXDesktop = function(){
		this.body = $('<div id="yxos-desktop" class="yxos-desktop"></div>');
		this.loading = $('<div id="yxos-desktop-loading" class="yxos-desktop-loading"><div class="spinner"></div></div>');
		
		this.wallpaperStore = [
			"lib/yxos/skin/wallpaper/001.jpg",
			"lib/yxos/skin/wallpaper/002.jpg",
			"lib/yxos/skin/wallpaper/003.jpg",
			"lib/yxos/skin/wallpaper/004.jpg",
			"lib/yxos/skin/wallpaper/005.jpg",
			"lib/yxos/skin/wallpaper/006.jpg",
			"lib/yxos/skin/wallpaper/007.jpg",
			"lib/yxos/skin/wallpaper/008.jpg",
			"lib/yxos/skin/wallpaper/009.jpg",
			"lib/yxos/skin/wallpaper/010.jpg",
			"lib/yxos/skin/wallpaper/011.jpg",
			"lib/yxos/skin/wallpaper/012.jpg",
			"lib/yxos/skin/wallpaper/013.jpg",
			"lib/yxos/skin/wallpaper/014.jpg",
			"lib/yxos/skin/wallpaper/015.jpg",
			"lib/yxos/skin/wallpaper/016.jpg",
			"lib/yxos/skin/wallpaper/017.jpg",
			"lib/yxos/skin/wallpaper/018.jpg",
			"lib/yxos/skin/wallpaper/019.jpg",
			"lib/yxos/skin/wallpaper/020.jpg",
			"lib/yxos/skin/wallpaper/021.jpg",
			"lib/yxos/skin/wallpaper/022.jpg",
			"lib/yxos/skin/wallpaper/023.jpg",
			"lib/yxos/skin/wallpaper/024.jpg"
		];
		
		this.DesktopIconMap = new YMap();
		
		this.WindowMap = new YMap();
		
		this.taskbar = null;
		
		this.startMenu = null;
		
		this.contextMenu = null;
		
		this.contextMenuStore = {};
		
		this.preClick = 0;
	};
	
	YXDesktop.prototype = {
		
		init: function(){
			this.taskbar = new YXOs.YXTaskBar();
			this.startMenu = new YXOs.YXStartMenu();
			this.body.append(this.taskbar.body);
			this.body.append(this.startMenu.body);
			
			this.loading.find('.spinner').css({
				"margin-top": os.clientHeight()/2 - 30
			});
			
			return this;
		},
		
		open: function(){
			var self = this;
			setTimeout(function(){
				self.loading.hide();
			}, 200);
		},
		
		setWallpaper: function(paper){
			var self = this;
			self.body.css({
				"background-image": YXOs.utils.format("url('{0}')", 
				(paper || (YXOs.path + self.wallpaperStore[(Math.ceil(Math.random() * self.wallpaperStore.length) - 1)]) ) )
			});
			return this;
		},
		
		changeWallpager: function(){
			var self = this;
			var index = parseInt(Math.random() * self.wallpaperStore.length);
			var wallpaper = YXOs.path + self.wallpaperStore[index];
			var img = new Image();
			img.src = wallpaper;
			img.onload = function(e){
				self.setWallpaper(wallpaper);
				localStorage.setItem("USER_WALLPAPER", wallpaper);
			};
		},
		
		bindEvent: function(){
			var self = this;
			self.body.on('mouseup', function(e){
				var buttons = e.button;
				os.control.windowBlur(); // 使得所有窗口失去焦点				
			});
			
			// 桌面被左键点击时
			self.body.on('click', function(e){
				os.control.dtIconReset(); // 重置桌面图标
				self.hideOtherContextMenu(); // 隐藏桌面菜单
				os.control.windowBlur(); // 使得所有窗口失去焦点
				
				var ct = new Date().getTime();
				if(ct - self.preClick < 300){
					self.changeWallpager();
				}
				self.preClick = ct;
				
				os.utils.stopEvent(e);
			});
			
			self.body.on('blur', function(e){
				
			});
			
			return self;
		},
		
		addWindow: function(yxwin){
			this.WindowMap.put(yxwin.id, yxwin);		
			this.body.append(yxwin.body);
			
		},
		
		delWindow: function(yxwin){
			var self = this;
			// 将窗口从容器中移除
			self.WindowMap.remove(yxwin.id);
			// 将桌面图标绑定的窗口解除
			var desktopIcon = self.DesktopIconMap.get(yxwin.desktopIconId);
			if(desktopIcon){
				desktopIcon.window = null;
			}
			// 移除任务栏的窗口句柄
			self.taskbar.delWindowHandle(yxwin);
			// 将窗口彻底移除
			yxwin.body.remove();
		},
		
		addDesktopIcon: function(yxDIcon){
			this.DesktopIconMap.put(yxDIcon.id, yxDIcon);
			this.body.append(yxDIcon.body);
		},
		
		initContextMenu: function(x, y){
			var self = this;
			self.contextMenu = new os.YXContextMenu({
				cssClass: 'desktop-context-menu'
			});
			
			self.contextMenu.addItem([
				{
					icon: 'icon-refresh',
					title: '重新加载',
					click: function(){
						document.location.reload();
					}
				},
				{
					icon: 'icon-chrome',
					title: '应用中心',
					click: function(){
						
					}
				},
				{
					icon: 'icon-expand-full',
					title: '全屏显示',
					click: function(){
						os.utils.requestFullScreen(self.body[0]);
					}
				},
				{
					icon: 'icon-picture',
					title: '更换壁纸',
					click: function(){
						self.changeWallpager();
					}
				}
			]);
			
			self.contextMenu.show(x, y);
		},
		
		addContextMenu: function(cmenu){
			var self = this;
			if(!cmenu.parent){
				self.contextMenuStore[cmenu.id] = cmenu;
				self.body.append(cmenu.body);
			}
		},
		
		showContextMenu: function(x, y){
			var self = this;
			if(self.contextMenu){
				self.contextMenu.show(x, y);
			} else {
				self.initContextMenu(x, y);
			}
		},
		
		hideContextMenu: function(){
			var self = this;
			if(self.contextMenu){
				self.contextMenu.hide();
			}
		},
		
		hideOtherContextMenu: function(cid){
			var self = this;
			for(var id in self.contextMenuStore){
				if(id != cid){
					self.contextMenuStore[id].hide();
				}
			}
		},
		
		getDesktopIcon: function(did){
			return this.DesktopIconMap.get(did);
		}
		
	};
	
	os.desktop = new YXDesktop();
	
	$(document).ready(function(e){
		var $body = $('body');
		$body.append(os.desktop.body);
		$body.append(os.desktop.loading);
		
		// 禁止浏览器右键菜单
		$(document).on('contextmenu', function(){
			return false;
		}).on("selectstart", function(){
			return false;
		});
		
		var wallpaper = localStorage.getItem("USER_WALLPAPER");
		os.desktop.init().setWallpaper(wallpaper).bindEvent();
	});
	
}(jQuery, window, YXOs);


/**
 * ==============================================
 * YSOs WindowHandle.js
 * ==============================================
 */

+ function($, win, os){
	
	os.YXWindowHandle = function(options){
		this.body = $('<div id="" class="yxos-window-handle active" title=""></div>');
		
		// 窗口句柄ID
		this.id = "window-handle-" + os.utils.UUID(20);
		
		this.body.attr('id', this.id);
		
		this.body.data('id', options.id || '');
		
		this.title = os.utils.getOptionValue(options, 'title', '应用程序', 'String');
		
		this.body.attr('title', this.title);
		
		this.types = os.utils.getOptionValue(options, 'types', 'program', 'String');
		
		this.icon = os.utils.getOptionValue(options, 'icon', os.base + 'img/i01.png', 'String');
		// 状态
		this.status = os.utils.getOptionValue(options, 'status', 0, 'Number');
		// 桌面图标级别 0：所有，1：个人，2：系统
		this.levels = os.utils.getOptionValue(options, 'levels', 0, 'Number');
		// 是否为获得焦点状态
		this.isfocus = os.utils.getOptionValue(options, 'isfocus', true, 'Boolean');		
		// 打开窗口
		this.window = null;
		// 右键菜单
		this.contextMenu = null;
		
		this.init();
		
	};
	
	os.YXWindowHandle.prototype = {
		
		init: function(){
			var self = this;
			
			os.desktop.taskbar.addWindowHandle(self);
			
			var boxHtml = '<div class="box"></div>',
				iconHtml = '<img src="{0}" width="24" height="24" />',
				titleHtml = '<div class="title blur">{0}</div>';
			
			self.body.append(os.utils.format(iconHtml, this.icon));
			//self.body.append(os.utils.format(titleHtml, this.title));
			
			// 其他窗口句柄都失去焦点
			os.control.windowHandleBlur(self.id, false);
			
			self.bindEvent();
		},
		
		bindEvent: function(){
			var self = this;
			
			self.body.on('mousedown', function(e){
				os.utils.stopEvent(e);
			}).on('mouseup', function(e){
				
				if(e.button == 2){ // 右键
					os.control.windowBlur(); // 使得所有窗口失去焦点
					self.showContextMenu(e.clientX, e.clientY);
				} else if(e.button == 0 || e.button == 1){ // 左键
					
					// 其他窗口句柄都失去焦点
					os.control.windowHandleBlur(self.id, false);
					// 激活当前窗口
					if(self.window.isMin()){
						self.window.nomal();
						self.window.show();
					} else {
						self.window.focus();
					}
				}
				
				os.utils.stopEvent(e);
			});
			
		},
		
		openWindow: function(){
			var self = this;
			self.window.show();
		},
		
		focus: function(){
			var self = this;			
			self.body.addClass('active');
			self.isfocus = true;
		},
		
		blur: function(){
			var self = this;
			self.isfocus = false;
			self.body.removeClass('active');
			self.window.blur();
		},
		
		blurHand: function(){
			var self = this;
			self.isfocus = false;
			self.body.removeClass('active');
		},
		
		focusHand: function(){
			var self = this;
			os.desktop.body.find('.yxos-window-handle').removeClass('active');
			
			self.body.addClass('active');
			self.isfocus = true;
		},
		
		initContextMenu: function(x, y){
			var self = this;
			self.contextMenu = new os.YXContextMenu({
				cssClass: 'window-context-menu'
			});
			
			self.contextMenu.addItem([
				{
					icon: 'icon-eye-open',
					cssClass: 'open',
					title: '显示',
					click: function(){
						self.openWindow();
					}
				},
				{
					icon: 'icon-undo',
					cssClass: 'nomal',
					title: '还原',
					click: function(){
						if(self.window){
							if(self.window.isMin()){
								self.window.show();									
							} 
							self.window.nomal();
						}
					}
				},
				{
					icon: 'icon-expand-full',
					cssClass: 'max',
					title: '最大化',
					click: function(){
						if(self.window){
							if(self.window.isMin()){
								self.window.show();								
							}
							self.window.maximize();
						}
					}
				},
				{
					icon: 'icon-minus',
					cssClass: 'min',
					title: '最小化',
					click: function(){
						self.window && self.window.minimize();
					}
				},
				{
					icon: 'icon-times',
					cssClass: 'close',
					title: '关闭',
					click: function(){
						self.window && self.window.close();
						self.window = null;
					}
				}
			]);
			self.contextMenu.disableItem('open', true);
			self.contextMenu.disableItem('nomal', true);
			
			self.contextMenu.show(x, y);
		},
		
		showContextMenu: function(x, y){
			var self = this;
			
			if(self.contextMenu == null){
				self.initContextMenu(x, y);
			} else {
				self.contextMenu.show(x, y);
				if(self.window){
					self.contextMenu.disableItem('open', true);
					self.contextMenu.disableItem('close', false);
					if(self.window.status === 'Nomal'){
						self.contextMenu.disableItem('nomal', true);
						self.contextMenu.disableItem('max', false);
						self.contextMenu.disableItem('min', false);
					} else if(self.window.status === 'Minimize'){
						self.contextMenu.disableItem('open', false);
						self.contextMenu.disableItem('nomal', false);
						self.contextMenu.disableItem('max', false);
						self.contextMenu.disableItem('min', true);
					} else if(self.window.status === 'Maximize'){
						self.contextMenu.disableItem('nomal', false);
						self.contextMenu.disableItem('max', true);
						self.contextMenu.disableItem('min', false);
					}
				} else {
					self.contextMenu.disableItem('open', false);
					self.contextMenu.disableItem('nomal', true);
					self.contextMenu.disableItem('max', true);
					self.contextMenu.disableItem('min', true);
					self.contextMenu.disableItem('close', true);
				}
			}
		},
		
		hideContextMenu: function(){
			var self = this;
			if(self.contextMenu){
				self.contextMenu.hide();
			}
		}
		
	};
}(jQuery, window, YXOs);


/**
 * ==============================================
 * YSOs DesktopIcon.js
 * ==============================================
 */

+ function($, win, os){
	
	os.YXDesktopIcon = function(options){
		this.body = $('<div id="" class="yxos-tasktop-icon"><div class="body"></div></div>');
		// 应用ID
		this.appId = options.id || os.utils.UUID(20);
		// 桌面图标ID
		this.id = "tasktop-icon-" + this.appId;
		
		this.body.attr('id', this.id);
		
		this.body.data('id', this.appId);
		// 桌面图标名称
		this.name = os.utils.getOptionValue(options, 'name', '应用', 'String');
		
		this.title = os.utils.getOptionValue(options, 'title', '应用程序', 'String');
		
		this.types = os.utils.getOptionValue(options, 'types', 'program', 'String');
		
		this.width = os.utils.getOptionValue(options, 'width', os.globalConfig.desktopIconWidth, 'Number');
		
		this.minHeight = os.utils.getOptionValue(options, 'height', os.globalConfig.desktopIconHeight, 'Number');
		
		this.windowWidth = os.utils.getOptionValue(options, 'windowWidth', 800, 'Number');
		
		this.windowHeight = os.utils.getOptionValue(options, 'windowHeight', 500, 'Number');
		
		this.hosts = os.utils.getOptionValue(options, 'hosts', 1, 'Number');
		
		this.location = os.utils.getOptionValue(options, 'location', 'void 0', 'String');
		
		this.X = os.utils.getOptionValue(options, 'X', 10, 'Number');
		
		this.Y = os.utils.getOptionValue(options, 'Y', 10, 'Number');
		
		this.index = os.control.dtIconZIndex.next();
		
		this.isDrag = os.utils.getOptionValue(options, 'isDrag', true, 'Boolean');
		
		this.isShow = os.utils.getOptionValue(options, 'isShow', true, 'Boolean');
		
		this.needClose = os.utils.getOptionValue(options, 'needClose', true, 'Boolean');
		
		this.needMinimize = os.utils.getOptionValue(options, 'needMinimize', true, 'Boolean');
		
		this.needMaximize = os.utils.getOptionValue(options, 'needMaximize', true, 'Boolean');

		this.icon = os.utils.getOptionValue(options, 'icon', os.base + 'img/i01.png', 'String');
		// 桌面图标状态 0:失去焦点，1：鼠标进入，2：获得焦点
		this.status = os.utils.getOptionValue(options, 'status', 0, 'Number');
		// 桌面图标级别 0：所有，1：个人，2：系统
		this.levels = os.utils.getOptionValue(options, 'levels', 0, 'Number');
		// 是否为获得焦点状态
		this.isfocus = os.utils.getOptionValue(options, 'isfocus', true, 'Boolean');
		// 桌面图标UI对象
		this.dticonUI = null;
		// 打开窗口
		this.window = null;
		// 属性窗口
		this.attrWindow = null;
		// 右键菜单
		this.contextMenu = null;
		// 自定义数据
		this.custom = options.custom;
		
		this.init();
		
	};
	
	os.YXDesktopIcon.prototype = {
		
		init: function(){
			
			this.body.css({
				"width": this.width,
				"min-height": this.minHeight,
				"left": this.X,
				"top": this.Y,
				"z-index": this.index
			});
			
			var $body = this.body.find('.body');
			
			var boxHtml = '<div class="box"></div>',
				iconHtml = '<img src="{0}" width="64" height="64" />',
				titleHtml = '<div class="title blur">{0}</div>';
			
			$body.append(os.utils.format(iconHtml, this.icon));
			$body.append(os.utils.format(titleHtml, this.title));
			
			this.bindEvent();
		},
		
		bindEvent: function(){
			var self = this,
				self_title = self.body.find('.title');
			self.body.on('mousedown', function(e){
				self.body.addClass('press');
				
				self.index = os.control.dtIconZIndex.next();
				self.body.css({
					"z-index": self.index
				});
				
				e.stopPropagation();
				e.preventDefault();
			});
			
			self.body.on('mouseup', function(e){
				self.body.removeClass('press');
				
				os.control.dtIconReset(self.id, false);
				
				os.utils.stopEvent(e);
			});
			
			self.body.on('click', function(e){
				self.body.addClass('active');
				self_title.removeClass('blur');
				os.utils.stopEvent(e);
			});
			
			// 桌面图标双击打开窗口
			self.body.on('click', function(e){
				// 打开窗口
				if(os.desktop.WindowMap.size() < 15){
					self.openWindow();					
				} else {
					alert("打开窗口过多，请先关闭部分窗口");	
				}
				
				os.utils.stopEvent(e);
			})
			
			.on('mouseup', function(e){
				if(e.button == 2){ // 右键点击
					os.control.windowBlur(); // 使得所有窗口失去焦点
					self.showContextMenu(e.clientX, e.clientY);
				}
				os.utils.stopEvent(e);
			});
			
			os.dragDom({
				custom: self,
				type: 'DesktopIcon',
				handle: self.body,
				target: self.body
			});
		},
		
		reset: function(){
			var self = this,
				self_title = self.body.find('.title');;
			self.body.removeClass('active');
			self_title.addClass('blur');
		},
		
		openWindow: function(){
			var self = this;
			if(self.window === null){
				self.window = new YXOs.YXWindow({
					appId: self.appId,
					title: self.title,
					types: self.types,
					url: self.location,
					width: self.windowWidth,
					height: self.windowHeight,
					desktopIconId: self.id,
					icon: self.icon
				});
				
				var winHand = new YXOs.YXWindowHandle(self);
				winHand.window = self.window;
				self.window.winHandId = winHand.id;
			}
			
			self.window.open();
		},
		
		getWindowPosition: function(){
			
		},
		
		initContextMenu: function(x, y){
			var self = this;
			self.contextMenu = new os.YXContextMenu({
				cssClass: 'window-context-menu'
			});
			
			self.contextMenu.addItem([
				{
					icon: 'icon-ok',
					cssClass: 'open',
					title: '打开',
					click: function(){
						self.openWindow();
					}
				},
				{
					icon: 'icon-ok',
					cssClass: 'nomal',
					title: '还原',
					click: function(){
						if(self.window){
							if(self.window.isMin()){
								self.window.show();
								self.window.nomal();
							} else {
								self.window.focus();	
							}							
						}
					}
				},
				{
					icon: 'icon-refresh',
					cssClass: 'max',
					title: '最大化',
					click: function(){
						if(self.window){
							if(self.window.isMin()){
								self.window.show();
								self.window.maximize();
							} else {
								self.window.focus();	
							}
						}
					}
				},
				{
					icon: 'icon-file-o',
					cssClass: 'min',
					title: '最小化',
					click: function(){
						self.window && self.window.minimize();
					}
				},
				{
					icon: 'icon-file-o',
					cssClass: 'close',
					title: '关闭',
					click: function(){
						self.window && self.window.close();
						self.window = null;
					}
				}
			]);
			self.contextMenu.disableItem('nomal', true);
			self.contextMenu.disableItem('max', true);
			self.contextMenu.disableItem('min', true);
			self.contextMenu.disableItem('close', true);
			self.contextMenu.show(x, y);
		},
		
		showContextMenu: function(x, y){
			var self = this;
			
			if(self.contextMenu == null){
				self.initContextMenu(x, y);
			} else {
				self.contextMenu.show(x, y);
				if(self.window){
					self.contextMenu.disableItem('open', true);
					self.contextMenu.disableItem('close', false);
					if(self.window.status === 'Nomal'){
						self.contextMenu.disableItem('nomal', true);
						self.contextMenu.disableItem('max', false);
						self.contextMenu.disableItem('min', false);
					} else if(self.window.status === 'Minimize'){
						self.contextMenu.disableItem('nomal', false);
						self.contextMenu.disableItem('max', false);
						self.contextMenu.disableItem('min', true);
					} else if(self.window.status === 'Maximize'){
						self.contextMenu.disableItem('nomal', false);
						self.contextMenu.disableItem('max', true);
						self.contextMenu.disableItem('min', false);
					}
				} else {
					self.contextMenu.disableItem('open', false);
					self.contextMenu.disableItem('nomal', true);
					self.contextMenu.disableItem('max', true);
					self.contextMenu.disableItem('min', true);
					self.contextMenu.disableItem('close', true);
				}
			}
		},
		
		hideContextMenu: function(){
			var self = this;
			if(self.contextMenu){
				self.contextMenu.hide();
			}
		}
		
		
	};
}(jQuery, window, YXOs);


/**
 * ==============================================
 * YSOs ContextMenu.js
 * ==============================================
 */

+ function($, win, os){
	var ul_html = '<ul class="yxos-context-menu {cssClass}" id="{id}"></ul>',
		li_html = '<li class="yxos-context-menu-item {cssClass}"><i class="icon {icon}"></i> {title}</li>',
		li_line = '<li class="yxos-context-menu-line {cssClass}"><hr/></li>';
	
	os.YXContextMenu = function(ops){
		ops = $.extend({
			cssClass: '',
			id: "cmenu-" + YXOs.utils.UUID(20)
		}, ops);
		this.id = ops.id;
		this.parent = ops.parent;
		this.body = $(os.utils.formatByJson(ul_html, ops));
		this.cssClass = ops.cssClass;
		this.init();
	};
	
	os.YXContextMenu.prototype = {
		
		init: function(){
			var self = this;
			self.body.css({
				"z-index": os.control.contextMenuZIndex.next()
			});
			os.desktop.addContextMenu(self);
		},
		
		addItem: function(){
			var items = arg = arguments[0];
			var self = this;
			if(Object.prototype.toString.call(arg) === "[object Object]"){
				items = [arg];
			}
			var createItem = function(menu, item){
				var $li, subMenu, it;
				if(item.subItem && item.subItem.length){ // 有子集
					$li = $(os.utils.formatByJson(li_html, item));
					$li.addClass('yxos-has-submenu');
					subMenu = new os.YXContextMenu({
						cssClass: 'yxos-context-submenu',
						parent: menu
					});
					$li.append(subMenu.body);
					$li.on('click', function(e){
						if(!$li.hasClass('disabled')){
							item.click && item.click.call(self, e);
							self.hide();
						}
						os.utils.stopEvent(e);
					}).on('mousedown', function(e){
						if(!$li.hasClass('disabled')){
							item.mousedown && item.mousedown.call(self, e);
						}
						os.utils.stopEvent(e);
					}).on('mouseup', function(e){
						if(!$li.hasClass('disabled')){
							item.mouseup && item.mouseup.call(self, e);
							self.hide();
						}
						os.utils.stopEvent(e);
					});
					menu.body.append($li);
					
					subMenu.addItem(item.subItem);
				} else {
					$li = $(os.utils.formatByJson(li_html, item));
					$li.on('click', function(e){
						if(!$li.hasClass('disabled')){
							item.click && item.click.call(self, e);
							self.hide();
						}
						os.utils.stopEvent(e);
					}).on('mousedown', function(e){
						if(!$li.hasClass('disabled')){
							item.mousedown && item.mousedown.call(self, e);
						}
						os.utils.stopEvent(e);
					}).on('mouseup', function(e){
						if(!$li.hasClass('disabled')){
							item.mouseup && item.mouseup.call(self, e);
							self.hide();
						}
						os.utils.stopEvent(e);
					});
					menu.body.append($li);
				}
			};
			if(items){
				var item = null;
				for(var i = 0; i < items.length; i++){
					item = new os.YXContextMenu.ContextMenuItem(items[i]);
					createItem(self, item);
				}
			}
		},
		
		height: function(){
			var self = this;
			return self.body.height();
		},
		
		width: function(){
			var self = this;
			return self.body.width();
		},
		
		show: function(x, y){
			var self = this,
				screenWidth = YXOs.screenWidth(),
				screenHeight = YXOs.screenHeight(),
				height = self.height() + 15,
				width = self.width();
			if(x + width >= screenWidth){
				x = x - width;
			}
			if(y + height >= screenHeight){
				y = y - height;
			}
			self.body.css({
				left: x,
				top: y,
				display: 'inline-block'
			});
			/*if(os.desktop.contextMenu && self.cssClass !== os.desktop.contextMenu.cssClass){
				os.desktop.contextMenu.hide();
			} else if(os.desktop.contextMenu && self.cssClass === os.desktop.contextMenu.cssClass){
				
			}*/
			os.desktop.hideOtherContextMenu(self.id);
		},
		
		hide: function(){
			var self = this;
			if(self.parent){
				self.parent.hide();
			} else {
				self.body.css({
					display: 'none'
				});
			}			
		},
		
		disableItem: function(css, is){
			var self = this,
				$item = self.body.find('.yxos-context-menu-item.' + css);
			if($item.length){
				$item.attr('disabled', is === true);
				if(is === true){
					$item.addClass('disabled');
				} else {
					$item.removeClass('disabled');
				}
			}
		}
		
	};
	
	os.YXContextMenu.ContextMenuItem = function(ops){
		this.icon = os.utils.getOptionValue(ops, 'icon', 'icon-angle-right', 'String');
		this.title = os.utils.getOptionValue(ops, 'title', '', 'String');
		this.cssClass = os.utils.getOptionValue(ops, 'cssClass', '', 'String');
		this.click = os.utils.getOptionValue(ops, 'click', $.noop, 'Function');
		this.mousedown = os.utils.getOptionValue(ops, 'mousedown', $.noop, 'Function');
		this.mouseup = os.utils.getOptionValue(ops, 'mouseup', $.noop, 'Function');
		this.subItem = os.utils.getOptionValue(ops, 'subItem', [], 'Array');
		this.parent = null;
	};
	
	
}(jQuery, window, YXOs);