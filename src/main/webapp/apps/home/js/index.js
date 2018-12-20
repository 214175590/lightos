/**
 * 
 */
define(function(require, exports, module) {
	var comm = require("../../common/common");
	
	var startMenu;
	function PageScript(){
		this.events = {};
		this.user = {};
		this.os = {};
		this.isOpen = false;
		this.loaded = false;
		this.iconData = [];
		this.userConfig = null;
		this.timeArr = [3, 2, 3, 3, 4, 4, 3, 4, 4, 3, 4, 4, 8, 2, 6, 10, 20, 30];
	}
	
	PageScript.prototype = {
		
		init: function(){
			$.useModule(['yxos', 'clippy', 'websocket'], function(){
				page.os = YXOs;
				// 禁用窗口拉伸
				page.os.globalConfig.disabledWindowResize = true;
				// 初始化开始菜单
				page.os.initStartMenu([
					{
						title: '修改密码',
						icon: 'icon-lock',
						cssClass: 'modify-pwd'
					},
					{
						title: '系统设置',
						icon: 'icon-cog',
						cssClass: 'system-setting'
					},
					{
						title: '应用中心',
						icon: 'icon-chrome',
						cssClass: 'app-center'
					},
					{
						title: '退出系统',
						icon: 'icon-off',
						cssClass: 'logout'
					}
				], function(sm, e){
					startMenu = sm;
					var $menu = $(e.target);
					if($menu.hasClass('modify-pwd')){
						page.openWindow({
							title: "修改密码",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/auth/modify_pwd.html',
							width: 600,
							height: 450,
							needMax: false,
							needMin: false,
							desktopIconId: 'cus-' + new Date().getTime(),
							icon: consts.WEB_BASE + 'content/images/icons/icon_55.png'
						});
					} else if($menu.hasClass('logout')){
						$.confirm({
							title: '温馨提示',
							msg: '您确定要退出Light OS吗？',
							yesText: '取消',
							cancelText: '确定退出',
							yesClick: function($modal){
								$modal.modal('hide');
							}, cancelClick: function($modal){
								ajax.post({
									url: 'api/logout',
									data: {}
								}).done(function(){
									document.location.replace(consts.WEB_BASE + consts.LOGIN_PAGE);
								});
							}
						});
						
					} else if($menu.hasClass('system-setting')){
						page.openWindow({
							title: "系统设置",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/auth/syssetting.html',
							width: 600,
							height: 450,
							needMax: false,
							needMin: false,
							desktopIconId: 'cus-' + new Date().getTime(),
							icon: consts.WEB_BASE + 'content/images/icons/icon_47.png'
						});
					} else {
						alert("建设中...");
					}
					startMenu.show();
				});
				
				if(page.os.addEvent){
					
					page.os.addEvent('WindowStartMenuClick', function(sm){
						if(!startMenu){
							startMenu = sm;
						}
						startMenu.show();					
					});
					
					page.os.addEvent('DesktopClick', function(desktop){
						if(startMenu){
							startMenu.hide();
						}
					});
					
					page.os.addEvent('DesktopIconMoveEnd', function(icon, pos, data){
						if(data){
							var param = data.custom;
							/*ajax.post({
								url: 'sys/editAppInfo',
								data: param
							}).done(function(res, rtn, state, msg){
								if(state){
								}
							});*/
							if(!page.userConfig.appInfo){
								page.userConfig.appInfo = {};
							}
							page.userConfig.appInfo[param.rowId] = {
								sleft: pos.left,
								top: pos.top
							};
							comm.saveUserData(page.user.account, page.userConfig);
						}
					});
				}
				
				var su = consts.WEB_BASE.replace("http", "ws") + "websocket";
				page.wsurl = su;
				
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					page.copyright(user);
					if(page.user && page.user.rowId){
						$('#user-panel').text(page.user.account + '/' + page.user.name);
						//创建socket对象
					  	page.socket = new YSWebSocket({
							success: page.wsSuccess, 
							error: page.wsError,
							close: page.wsClose,
							message: page.wsMessage
						});
					  	
					  	page.userConfig = page.userConfig || comm.getUserData(page.user.account);
						if(page.userConfig.syssetting){
							if(page.userConfig.syssetting.wapper){
								if(!page.userConfig.syssetting.wapper.type){
									page.os.desktop.changeWallpager();
								} else if(page.userConfig.syssetting.wapper.type == 'auto'){
									page.autoChangeWallpaper(page.userConfig.syssetting.wapper.time);
								}
							}
						}
					} else {
						page.openLoginPage();
					}
				});
				
			});
			
		},
		
		wsSuccess: function(){
			page.connstate = true;
			var token = sessionStorage.getItem("LIGHTOS_USER_TOKEN");
			try {
				if (token) {
					token = utils.parseJSON(token);
					page.user.token = token;
					page.socket.send('user.login', {
						account: page.user.account, 
						userToken: page.user.token.access_token
					});
				} else {
					page.openOs();
					error("非法登录");
				}
			} catch (e) {
			}			
		},
		
		wsError: function(){
			alert("error");
		},
		
		wsClose: function(){
			document.location.reload();
		},
		
		wsMessage: function(message){
			var data = JSON.parse(message);
	      	if(data.url == "user.login"){
	      		if(data.body.code == '000000'){
	      			page.sid = data.body.data.sid;
	      			
	      			page.loadDesktopIcon();
	      			
	      			page.loadClippy();
	      			
	      			page.startHeartThread();
	      		} else {
	      			page.openOs();
	      			error(data.body.msg);
	      		}
	      	} else if(data.url == "user.kickout"){
	      		ajax.post({
					url: 'api/logout',
					data: {}
				}).done(function(){
					document.location.replace(consts.WEB_BASE + consts.LOGIN_PAGE);
				});
	      	} else {
	      		for(var k in page.events){
	      			if(page.events[k] && (page.events[k].flag == data.head.flag)){
	      				try{
	      					page.events[k].call(data);
	      				}catch(e){}
	      			}
	      		}
	      	}
		},
		
		copyright: function(user){
			if(user && user.name){
				console.info("%c" + user.name + '%c欢迎使用%c<Light OS>', "color:#ffffff;font-size:50px;background:#236582;padding:10px 5px;text-shadow: 0 0 1px currentColor, -1px -1px 1px hsl(200,75%,45%), 0 -1px 1px hsl(200,75%,40%), -1px 0 1px hsl(200,75%,35%), 1px -1px 1px hsl(200,75%,35%), 1px 0 1px hsl(200,75%,30%), 1px 1px 1px hsl(200,75%,30%), 0 1px 1px hsl(200,75%,30%), -1px 1px 1px hsl(200,75%,30%), -2px -2px 1px hsl(200,75%,75%), -2px -1px 1px hsl(200,75%,60%), -2px 0 1px hsl(200,75%,60%), -1px -2px 1px hsl(200,75%,50%), 0 -2px 1px hsl(200,75%,50%), 1px -2px 1px hsl(200,75%,50%), 2px -2px 1px hsl(200,75%,35%), 2px -1px 1px hsl(200,75%,35%), 2px 0 1px hsl(200,75%,30%), 2px 1px 1px hsl(200,75%,10%), 2px 2px 1px hsl(200,75%,10%), 1px 2px 1px hsl(200,75%,15%), 0 2px 1px hsl(200,75%,10%), -1px 2px 1px hsl(200,75%,20%), -2px 2px 1px hsl(200,75%,20%), -2px 1px 1px hsl(200,75%,10%), -3px -3px 1px #006, -2px -3px 1px #006, -1px -3px 1px #006, 0 -3px 1px #006, 1px -3px 1px #006, 2px -3px 1px #006, 3px -3px 1px #006, 3px -2px 1px #006, 3px -1px 1px #006, 3px 0 1px #006, 3px 1px 1px #006, 3px 2px 1px #006, 3px 3px 2px #006, 2px 3px 1px #006, 1px 3px 1px #006, 0 3px 1px #006, -1px 3px 1px #006, -2px 3px 1px #006, -3px 3px 1px #006, -3px 2px 1px #006, -3px 1px 1px #006, -3px 0 1px #006, -3px -1px 1px #006, -3px -2px 1px #006;", "color:#ffffff;font-size:50px;background:#236582;padding:10px 5px;text-shadow: 0 0 1px currentColor,-1px -1px 1px #030,0 -1px 1px #030,1px -1px 1px #030,1px 0 1px #030,1px 1px 1px #030,0 1px 1px #030,-1px 1px 1px #030,-1px 0 1px #030;", "color:#ffffff;font-size:50px;background:#236582;padding:10px 5px;text-shadow: 0 0 1px currentColor,-1px -1px 1px #000,0 -1px 1px #000,1px -1px 1px #000,1px 0 1px #000,1px 1px 1px #000,0 1px 1px #000,-1px 1px 1px #000,-1px 0 1px #000;");
			}
		},
		
		startHeartThread: function(){
			page.heartThread = setInterval(function(){
				page.socket.send('user.heart', {
					account: page.user.account,
					userToken: page.user.token.access_token,
					sid: page.sid
				});
			}, 30000);			
		},
		
		regEvent: function(key, flag, callback){
			page.events[key] = {
				flag: flag,
				call: callback
			};
		},
		
		openWindow: function(ops){
			var pwdWin = new YXOs.YXWindow(ops);
			var winHand = new YXOs.YXWindowHandle({
				id: ops.desktopIconId,
				title: ops.title,
				icon: ops.icon
			});
			winHand.window = pwdWin;
			pwdWin.winHandId = winHand.id;
			pwdWin.open();
		},
		
		/** 加载做面图标 */
		loadDesktopIcon: function(){
			ajax.post({
	    		url: "sys/loadUserApps",
	    		data: {}
	    	}).done(function(res, rtn, state, msg){
	    		if(state && rtn){
	    			page.loaded = true;
	    			if(rtn.data && rtn.data && rtn.data.length){
	    				var deskIcon, obj, w = 0, h = 0;
	    				page.userConfig = page.userConfig || comm.getUserData(page.user.account);
						if(!page.userConfig.appInfo){
							page.userConfig.appInfo = {};
						}
	    				for(var i = 0, k = rtn.data.length; i < k; i++){
	    					obj = rtn.data[i];
	    					deskIcon = new YXOs.YXDesktopIcon({
	    						id: obj.rowId,
	    						name : obj.name,
	    						types : obj.types,
	    						windowWidth: obj.windowWidth,
	    						windowHeight: obj.windowHeight,
	    						X: page.userConfig.appInfo[obj.rowId] ? page.userConfig.appInfo[obj.rowId].sleft : obj.sleft,
	    						Y: page.userConfig.appInfo[obj.rowId] ? page.userConfig.appInfo[obj.rowId].top : obj.top,
	    						icon : consts.WEB_BASE + obj.icon,
	    						title : obj.title,
	    						hosts: obj.hosts,
	    						location: (function(){
	    							var url = obj.location;
	    							if(!/^(http)/.test(url)){
	    								url = consts.WEB_BASE + url; 
	    							}
	    							return url;
	    						})(),
	    						levels: obj.levels,
	    						isDrag: obj.isdrag == 'true',
	    						isShow: obj.isshow == 'true',
	    						needClose: obj.needClose == 'true',
	    						needMinimize: obj.needMinimize == 'true',
	    						needMaximize: obj.needMaximize == 'true',
	    						closeFunction : function(win) {
    								eval(obj.closeFunction);
    							},
	    						minFunction : function(win) {
    								eval(obj.minFunction);
    							},
	    						maxFunction : function(win) {
    								eval(obj.maxFunction);
    							},
    							openFunction: function(win){
    							},
	    						status: obj.status,
	    						createTime: obj.createTime,
	    						belong: obj.belong,
	    						custom: obj
	    					});
	    					
	    					page.os.desktop.addDesktopIcon(deskIcon);
	    					
	    					h++;
	    					if(h > 5){
	    						w++;
	    						h = 0;
	    					}
	    				}
	    				
	    				page.loadAppRight();
	    			}
	    		} else {
		    		error("数据加载失败:" + res.msg);
	    		}	    		
	    	}).fail(function(){
	    		log.error("失败:", arguments);
	    		error("数据加载失败");
	    	}).always(function(){
	    		page.openOs();
	    	});
			
		},
		
		loadAppRight: function(){
			ajax.post({
	    		url: "userApp/loadUserAppList",
	    		data: {},
	    		dataType: 'json',
	    		type: 'post'
	    	}).done(function(res, rtn, state, msg){
	    		if(state){
	    			page.RIGHTS = rtn.data;
	    		}
	    	}).fail(function(){
	    		log.error("失败:", arguments);
	    		error("数据加载失败");
	    	});
		},
		
		loadClippy: function(){
			if(page.clippyAgent){
				return;
			}
			page.userConfig = page.userConfig || comm.getUserData(page.user.account);
  			if(page.userConfig['syssetting'] && page.userConfig['syssetting'].clippy == 'disabled'){
  				return;
  			}
			var clippyArr = ['Bonzi', 'Clippy', 'F1', 'Genie', 'Genius', 'Links'
				, 'Merlin', 'Peedy', 'Rocky', 'Rover'];
			var index = parseInt(Math.random() * clippyArr.length + 1) - 1;
			var clippyName = clippyArr[index];
			if(page.userConfig['syssetting']){
				clippyName = page.userConfig.syssetting['clippy'];
			}
			clippy.BASE_PATH = consts.WEB_BASE + 'lib/clippy/agents/'
		    clippy.load(clippyName, function(agent) {
		    	page.clippyAgent = agent;
		    	/*
		    	 // play a given animation
				agent.play('Searching');
				
				// play a random animation
				agent.animate();
				
				// get a list of all the animations
				agent.animations();
				// => ["MoveLeft", "Congratulate", "Hide", "Pleased", "Acknowledge", ...]
				
				// Show text balloon
				agent.speak('When all else fails, bind some paper together. My name is Clippy.');
				
				// move to the given point, use animation if available
				agent.moveTo(100,100);
				
				// gesture at a given point (if gesture animation is available)
				agent.gestureAt(200,200);
				
				// stop the current action in the queue
				agent.stopCurrent();
				
				// stop all actions in the queue and go back to idle mode
				agent.stop();
		    	 */
		        agent.show();
		        
	        	setTimeout(function(){
	        		agent.moveTo($(window).width() - 180, $(window).height() - 170);
	        		page.speak(page.user.name + " 欢迎进入LightOs");
	        	}, 1000);
	        	
		        setTimeout(alippyAnimate, 2000);
		        //alippyAnimate();
		    });
		},
		
		speak: function(msg){
			try {
				if (page.clippyAgent) {
					page.clippyAgent.stop();
					page.clippyAgent.speak(msg);
				} else {
					alert(msg);
				}
			} catch (e) {
			}
		},
		
		openOs: function(){
			if(!page.isOpen){
				page.isOpen = true;
				page.os.desktop.open();
			}
		},
		
		autoChangeWallpaper: function(time){
			if(!page.autoWallTimer){
				time = parseFloat(time || 30);
				page.autoWallTimer = setInterval(function(){
					page.os.desktop.changeWallpager();
				}, parseInt(time * 60 * 1000));
			}
		},
		
		/** 打开登录页 */
		openLoginPage: function(){
			var $login = $('#loginFrame');
			$login
			.removeClass('cirle')
			.css({
				display: 'block',
				left: 0,
				top: 0,
				width: '100%',
				height: '100%',
				opacity: 0
			})
			.attr('src', consts.WEB_BASE + consts.LOGIN_PAGE + '#open')
			.on('load', function(){
				$login.animate({opacity: 1}, 800);
			});
		},
		
		/** 关闭登录页 */
		closeLoginPage: function(){
			var sw = $(window).width(),
				sh = $(window).height(),
				$login = $('#loginFrame');
			
			$login.addClass('cirle').animate({
				opacity: 0,
				left: (sw/2) + 'px',
				top: (sh/2) + 'px',
				width: 0,
				height: 0
			}, 500, function(){
				$login.attr('src', '').hide();
			});
			
			if(!page.loaded){
				// 获取到用户信息
				ajax.getUserInfo().done(function(user){
					page.user = user;
					page.copyright(user);
					if(page.user && page.user.rowId){
						$('#user-panel').text(page.user.account + '/' + page.user.name);
						//创建socket对象
					  	page.socket = new YSWebSocket({
							success: page.wsSuccess, 
							error: page.wsError,
							close: page.wsClose,
							message: page.wsMessage
						});
					}
				});
				
			}
		}
		
	};
	
	function alippyAnimate(){		
		var index = parseInt(Math.random() * page.timeArr.length + 1) - 1;
		page.clippyAgent.animate();		
		setTimeout(alippyAnimate, page.timeArr[index] * 1000);
	}
	
	var page = new PageScript();
	page.init();
	
	top['SYSTEM'] = page;
	
});