/**
 * yisin websocket
 */
(function() {
	
	var DEFAILT_OPTION = {
		url: '',
		success: null,
		error: null,
		close: null,
		message: null,
		debug: false,
		interval: 100
	},
	options = {},
	ysws = {},
	JSWebSocket = window.WebSocket || window.MozWebSocket,
	notLoadFlash = !!JSWebSocket,
	needLoadFlash = false;
	
	var logger;
	if (window.WEB_SOCKET_LOGGER) {
		logger = WEB_SOCKET_LOGGER;
	} else if (window.console && window.console.log && window.console.error) {
		logger = window.console;
	} else {
		logger = {
			log: function() {},
			error: function() {}
		};
	}
	var __log = function(message) {
		logger.log(decodeURIComponent(message));
	};
	var __error = function(message) {
		logger.error(decodeURIComponent(message));
	};

	/************** 自定义WebSocket **************/
	if(!JSWebSocket){
		window.console && window.console.log('Enable Flash WebSocket Mode.');
		/** 获取flash对象*/
		var getSwfInstance = function(movieName) { 
			if (navigator.appName.indexOf("Microsoft") != -1) { 
			    return window[movieName]; 
			} else { 
				return document[movieName]; 
			}
		};
		var webpath = '';
		var getFileUrl = function(name){
			if(!webpath){
				var scriptList = document.getElementsByTagName('script');
				var src;
				for (var i = 0, k = scriptList.length; i < k; i++) {
					src = scriptList[i].src;
					if(src.indexOf('yswebsocket') != -1){
						webpath = src.substring(src.indexOf('/', 8), src.indexOf('yswebsocket'));
						break;
					}
				}
			}
			return webpath + name;
		};
		
		window.WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
			var self = this;
			self.__id = WebSocket.__nextId++;
			WebSocket.__instances[self.__id] = self;
			self.readyState = WebSocket.CONNECTING;
			self.bufferedAmount = 0;
			self.__events = {};
			if (!protocols) {
				protocols = [];
			} else if (typeof protocols == "string") {
				protocols = [protocols];
			}
			self.__createTask = setTimeout(function() {
				WebSocket.__addTask(function() {
					self.__createTask = null;
					WebSocket.__flash.create(
						self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
				});
			}, 0);
		};
		WebSocket.prototype.send = function(data) {
			if (this.readyState == WebSocket.CONNECTING) {
				throw "INVALID_STATE_ERR: Web Socket connection has not been established";
			}
			var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
			if (result < 0) { // success
				return true;
			} else {
				this.bufferedAmount += result;
				return false;
			}
		};
		WebSocket.prototype.close = function() {
			if (this.__createTask) {
				clearTimeout(this.__createTask);
				this.__createTask = null;
				this.readyState = WebSocket.CLOSED;
				return;
			}
			if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
				return;
			}
			this.readyState = WebSocket.CLOSING;
			WebSocket.__flash.close(this.__id);
		};
		WebSocket.prototype.dispatchEvent = function(event) {
			var events = this.__events[event.type] || [];
			for (var i = 0; i < events.length; ++i) {
				events[i](event);
			}
			var handler = this["on" + event.type];
			if (handler) handler.apply(this, [event]);
		};
		WebSocket.prototype.__handleEvent = function(flashEvent) {
			if ("readyState" in flashEvent) {
				this.readyState = flashEvent.readyState;
			}
			if ("protocol" in flashEvent) {
				this.protocol = flashEvent.protocol;
			}
			var jsEvent;
			if (flashEvent.type == "open" || flashEvent.type == "error") {
				jsEvent = this.__createSimpleEvent(flashEvent.type);
			} else if (flashEvent.type == "close") {
				jsEvent = this.__createSimpleEvent("close");
				jsEvent.wasClean = flashEvent.wasClean ? true : false;
				jsEvent.code = flashEvent.code;
				jsEvent.reason = flashEvent.reason;
			} else if (flashEvent.type == "message") {
				var data = decodeURIComponent(flashEvent.message);
				jsEvent = this.__createMessageEvent("message", data);
			} else {
				throw "unknown event type: " + flashEvent.type;
			}
			this.dispatchEvent(jsEvent);
		};
		WebSocket.prototype.__createSimpleEvent = function(type) {
			if (document.createEvent && window.Event) {
				var event = document.createEvent("Event");
				event.initEvent(type, false, false);
				return event;
			} else {
				return {
					type: type,
					bubbles: false,
					cancelable: false
				};
			}
		};
		WebSocket.prototype.__createMessageEvent = function(type, data) {
			if (window.MessageEvent && typeof(MessageEvent) == "function" && !window.opera) {
				return new MessageEvent("message", {
					"view": window,
					"bubbles": false,
					"cancelable": false,
					"data": data
				});
			} else if (document.createEvent && window.MessageEvent && !window.opera) {
				var event = document.createEvent("MessageEvent");
				event.initMessageEvent("message", false, false, data, null, null, window, null);
				return event;
			} else {
				return {
					type: type,
					data: data,
					bubbles: false,
					cancelable: false
				};
			}
		};
		WebSocket.CONNECTING = 0;
		WebSocket.OPEN = 1;
		WebSocket.CLOSING = 2;
		WebSocket.CLOSED = 3;
		WebSocket.__id = "WS_" + new Date().getTime();
		WebSocket.__domid = "div_" + new Date().getTime();
		WebSocket.__isFlashImplementation = true;
		WebSocket.__initialized = false;
		WebSocket.__initFlash = true;
		WebSocket.__flash = null;
		WebSocket.__instances = {};
		WebSocket.__tasks = [];
		WebSocket.__nextId = 0;
		WebSocket.loadFlashPolicyFile = function(url) {
			WebSocket.__addTask(function() {
				WebSocket.__flash.loadManualPolicyFile(url);
			});
		};
		WebSocket.__initialize = function() {
			if (WebSocket.__initialized) return;
			WebSocket.__initialized = true;
			if (WebSocket.__swfLocation) {
				window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
			}
		};
		WebSocket.__onFlashInitialized = function() {
			var flashInter = setInterval(function() {
				WebSocket.__flash = getSwfInstance(WebSocket.__id);
				if(WebSocket.__flash.setCallerUrl){
					WebSocket.__flash.setCallerUrl(location.href);
					WebSocket.__flash.setDebug(!!options.debug);
					for (var i = 0; i < WebSocket.__tasks.length; ++i) {
						WebSocket.__tasks[i]();
					}
					WebSocket.__tasks = [];
					WebSocket.__initFlash = true;
					clearInterval(flashInter);
				}
			}, 10);
		};
		WebSocket.__onFlashEvent = function() {
			setTimeout(function() {
				try {
					var events = WebSocket.__flash.receiveEvents();
					for (var i = 0; i < events.length; ++i) {
						WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
					}
				} catch (e) {
					logger.error(e);
				}
			}, 0);
			return true;
		};
		
		WebSocket.__log = function(message) {
			__log(message);
		};
		WebSocket.__error = function(message) {
			__error(message);
		};
		
		WebSocket.__addTask = function(task) {
			if (WebSocket.__flash) {
				task();
			} else {
				WebSocket.__tasks.push(task);
			}
		};

		$(function(){
			var $div = $('<div>').attr('id', WebSocket.__domid)
				.css({"width":'1px',"height":'1px','position':'absolute','top':'-500px'});
			$(document.body).append($div);
			
			// 加载依赖js
			$.getScript(getFileUrl('swfobject.js'), function(){
				swfobject && swfobject.embedSWF(
					getFileUrl("WebSocket.swf"),
					WebSocket.__domid,
					"1" /* width */,
					"1" /* height */,
					"11.1.0" /* SWF version */,
					null,
					null,
					{hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
					{id: WebSocket.__id}
				);
				// 重新定义
				JSWebSocket = window.WebSocket;
				setTimeout(function(){
					needLoadFlash = true;
				}, 500);
			});
		});
		
	}
	
	/**
	 * yisin websocket
	 * @param url websocket服务器地址
	 */
	window.YSWebSocket = function(ops) {
		options = $.extend(DEFAILT_OPTION, ops);
		var _self = this;
		var inter = setInterval(function(){
			if(notLoadFlash || (needLoadFlash && WebSocket.__initFlash)){
				if (!!JSWebSocket) {
					ysws = new JSWebSocket(options.url);
					// 绑定事件
					ysws && bindEvent(_self);
					clearInterval(inter);
				} else {
					throw('JSWebSocket is undefined.');
				}
			}
		}, options.interval);
		
		// 发送数据
		_self.send = function(){
			if(arguments.length){
				var req = arguments.length > 1 ? arguments[0] : "msg";
				var data = arguments.length > 1 ? arguments[1] : arguments[0];
				var msg = {
					"req": req,
					"type": "TEXT",
					"value": data
				};
				if(JSON && JSON.stringify){
					msg = JSON.stringify(msg);
					ysws.send(msg);
				}
			}
		};
		
		_self.upload = function(){
			if(arguments.length){
				var req = arguments.length > 1 ? arguments[0] : "file";
				var data = arguments.length > 1 ? arguments[1] : arguments[0];
				var msg = {
					"req": req,
					"type": "BYTE",
					"value": data
				};
				if(JSON && JSON.stringify){
					msg = JSON.stringify(msg);
					ysws.send(msg);
				}
			}
		};
		
		_self.close = function(){
			ysws.close();
		};
	}
	
	/** 事件绑定及处理 */
	var bindEvent = function(ws){
		
		ysws.onopen = function(e){
			options.success && options.success.call(ws, e);
		};
		
		ysws.onclose = function(e){
			options.close && options.close.call(ws, e);
		};
		
		ysws.onerror = function(e){
			options.error && options.error.call(ws, e);
		};
		
		ysws.onmessage = function(e){
			if(e && e.data){
				options.message && options.message.call(ws, e.data);
			}
		};
	};
	
})();