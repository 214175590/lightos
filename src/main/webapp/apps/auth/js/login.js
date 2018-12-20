/**
 * 
 */
define(function(require, exports, module) {
	var back1 = require('./back-1.js');
	//require('./curve.js');
	var imgSrcArr = [
	     'content/images/in_top_bj0.jpg',
         'content/images/in_top_bj1.jpg',
         'content/images/in_top_bj2.jpg',
         'content/images/in_top_bj3.jpg',
         'content/images/in_top_bj4.jpg'
    ];
	var backImages = [];
	
	function PageScript(){
		this.isOpen = false;
	}
	
	PageScript.prototype = {
		
		init: function(){
			back1.start();
			
			page.isOpen = document.location.hash === '#open';
			
			$('#logo-box').css('left', ($(window).width() - 855)/2 + 'px');
			$('#login-body').css('left', ($(window).width() - 400)/2 + 'px').show();
			$('.wait-box').css('left', ($(window).width() - 500)/2 + 'px');
			
			if(window['localStorage']){
				var acc = localStorage.getItem("YXOS_USER_ACC");
				$('#account').val(acc);
			}
			
			var index = parseInt(Math.random()*5);
			var temp = index;
			$('.backimg').addClass('b'+ index);
			setInterval(function(){
				index = parseInt(Math.random()*5);
				$('.backimg').removeClass('b' + temp).addClass('b' + index);
				temp = index;
			}, 50000);
			
			page.loginAnimate();
			page.bindEvent();
			
			for(var i = 0; i< imgSrcArr.length ;i++) {
				backImages[i] = new Image();
				backImages[i].src = consts.WEB_BASE + imgSrcArr[i];
	        }
		},
		
		loginAnimate: function(){
			var $card = document.querySelector('#login-body');		
			var cumulativeOffset = function cumulativeOffset(element) {
				var top = 0,
				    left = 0;
				do {
					top += element.offsetTop || 0;
					left += element.offsetLeft || 0;
					element = element.offsetParent;
				} while (element);

				return {
					top: top,
					left: left
				};
			};
			
			document.onmousemove = function (event) {
				var e = event || window.event;
				var x = (e.pageX - cumulativeOffset($card).left - 350 / 2) * -1 / 100;
				var y = (e.pageY - cumulativeOffset($card).top - 350 / 2) * -1 / 100;

				var matrix = [[1, 0, 0, -x * 0.00005], [0, 1, 0, -y * 0.00005], [0, 0, 1, 1], [0, 0, 0, 1]];
				$card.style.transform = 'matrix3d(' + matrix.toString() + ')';
			};
		},
		
		login: function(){
			var $acc = $('#account'),
				$pwd = $('#password'),
				acc = $acc.val(),
				pwd = $pwd.val();
		    if(!acc){
		    	alert('请输入用户名');
		    	return;
		    }
		    if(!pwd){
		    	alert('请输入密码');
		    	return;
		    }
		    var resetForm = function(){
		    	$('.login-body').removeClass('test');
			    $('.wait-box').animate({ top: 180 }, 500).hide();
		    };
		    if(acc && pwd){
		    	$('.login-body').addClass('test');
			    $('.wait-box').show().animate({ top: 250 }, 500);
			    
		    	ajax.post({
		    		url: consts.LOGIN_URL,
		    		data: {account: acc, password: $.md5(pwd)},
		    		type: 'post',
		    		checkSession: false
		    	}).done(function(res, rtn, state, msg){
		    		if(state){
		    			var user = res.rtn.data;
		    			var token = res.rtn.token;
	    				if(window['localStorage']){
	    					localStorage.setItem("LIGHTOS_USER_ACC", acc);
	    					sessionStorage.setItem("LIGHTOS_USER_TOKEN", utils.toJSON(token));
	    				}
	    				$('.wait-box .spinner').hide();
	    				$('.wait-box .msg').html('<' + user.name + '>您好，欢迎回来<br>精彩即将呈现');
	    				if(page.isOpen && top['SYSTEM']){
    						top['SYSTEM'].openOs();
    					}
	    				setTimeout(function(){
	    					if(page.isOpen && top['SYSTEM']){
	    						top['SYSTEM'].closeLoginPage();
	    					} else {
	    						document.location.replace(consts.WEB_BASE + 'apps/home/index.html');
	    					}
					    }, 1500);
	    			} else {
	    				alert(msg);
	    				resetForm();
	    			}
		    	}).fail(function(){
		    		error("登录失败，请稍候重试");
		    		resetForm();
		    	});
		    }
		},		
		
		bindEvent: function(){
			var $acc = $('#account'),
				$pwd = $('#password');
			
			$acc.on('keyup', function(e){
				var acc = $(this).val(),
					$vali = $('.login_fields__user .validation'),
					code = e.keyCode || e.witch;
				if(acc){
					$vali.removeClass('hidden');
				} else {
					$vali.addClass('hidden');
				}
				if(code == 13){
					page.login();
				}
			});
			
			$pwd.on('keyup', function(e){
				var acc = $(this).val(),
					$vali = $('.login_fields__password .validation'),
					code = e.keyCode || e.witch;
				if(acc){
					$vali.removeClass('hidden');
				} else {
					$vali.addClass('hidden');
				}
				if(code == 13){
					page.login();
				}
			});
			
			$('#login-btn').on('click', function(){
			    page.login();			    
			});
			
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});