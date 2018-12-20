/***
 * ##插件和扩展模块##
 * @module core/addons
 * @author yisin
 */
define(function(require, exports, module) {
    $.fn._outerWidth = function(width){
        if (width == undefined){
            if (this[0] == window){
                return this.width() || document.body.clientWidth;
            }
            return this.outerWidth()||0;
        }
        return this.each(function(){
            if (!$.support.boxModel && $.browser.msie){
                $(this).width(width);
            } else {
                $(this).width(width - ($(this).outerWidth() - $(this).width()));
            }
        });
    };

    $.fn._outerHeight = function(height){
        if (height == undefined){
            if (this[0] == window){
                return this.height() || document.body.clientHeight;
            }
            return this.outerHeight()||0;
        }
        return this.each(function(){
            if (!$.support.boxModel && $.browser.msie){
                $(this).height(height);
            } else {
                $(this).height(height - ($(this).outerHeight() - $(this).height()));
            }
        });
    };

    $.fn._scrollLeft = function(left){
        if (left == undefined){
            return this.scrollLeft();
        } else {
            return this.each(function(){$(this).scrollLeft(left)});
        }
    }

    $.fn._propAttr = $.fn.prop || $.fn.attr;

    $.fn._fit = function(fit){
        fit = fit == undefined ? true : fit;
        var p = this.parent()[0];
        var t = this[0];
        var fcount = p.fcount || 0;
        if (fit){
            if (!t.fitted){
                t.fitted = true;
                p.fcount = fcount + 1;
                $(p).addClass('panel-noscroll');
                if (p.tagName == 'BODY'){
                    $('html').addClass('panel-fit');
                }
            }
        } else {
            if (t.fitted){
                t.fitted = false;
                p.fcount = fcount - 1;
                if (p.fcount == 0){
                    $(p).removeClass('panel-noscroll');
                    if (p.tagName == 'BODY'){
                        $('html').removeClass('panel-fit');
                    }
                }
            }
        }
        return {
            width: $(p).width(),
            height: $(p).height()
        }
    }
    
    $.fn.fillForm = function(obj){
    	var $form = $(this), item;
    	for (var property in obj) {
    		if (obj.hasOwnProperty(property) == true) {
    			item = $form.find("[name='" + property + "']");
    			if (item.length > 0) {
    				item.each(function () {
    					var dom = this;
    					if ($(dom).attr("type") == "radio") {
    						$(dom).filter("[value='" + obj[property] + "']").attr("checked", true);
    					}
    					if ($(dom).attr("type") == "checkbox") {
    						(obj[property] == true || obj[property] == 'true') ? $(dom).attr("checked", "checked") : $(dom).attr("checked", "checked").removeAttr("checked");
    					}
    					if ($(dom).prop("tagName") == "INPUT" || $(dom).prop("tagName") == "SELECT" || $(dom).prop("tagName") == "TEXTAREA") {
    						$(dom).val(obj[property]);
    					}
    				});
    			}
    		}
    	}
    };

    $.cookie = function (key, value, options) {
        var pluses = /\+/g;

        function encode(s) {
            return config.raw ? s : encodeURIComponent(s);
        }

        function decode(s) {
            return config.raw ? s : decodeURIComponent(s);
        }

        function stringifyCookieValue(value) {
            return encode(config.json ? JSON.stringify(value) : String(value));
        }

        function parseCookieValue(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape...
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }

            try {
                // Replace server-side written pluses with spaces.
                // If we can't decode the cookie, ignore it, it's unusable.
                // If we can't parse the cookie, ignore it, it's unusable.
                s = decodeURIComponent(s.replace(pluses, ' '));
                return config.json ? JSON.parse(s) : s;
            } catch(e) {}
        }

        function read(s, converter) {
            var value = config.raw ? s : parseCookieValue(s);
            return $.isFunction(converter) ? converter(value) : value;
        }
        var config = {};
        config.defaults = {};

        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    }

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

    if(!String.prototype.startsWith) {
        String.prototype.startsWith = function(str) {
            if(!str || !str.length || str.length > this.length) {
                return false;
            }
            return this.substr(0, str.length) === str;
        }
    }

    if(!String.prototype.endsWith) {
        String.prototype.endsWith = function(str) {
            if(!str || !str.length || str.length > this.length) {
                return false;
            }
            return this.substring(this.length - str.length) === str;
        }
    }

    if(!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/(^\s*)|(\s*$)/g, "");
        }
    }
    
    /**
     * ```
     * 增加公共的loadding弹出层组件
     * @param text
     * ```
     */
    $.ZuiLoader = function(){
    	this.$zuiLoad = $('body .zui-loadding-box');
    	
    	this.show = function(text, delay){
    		if(!this.$zuiLoad.length){
    			this.$zuiLoad = $('<div class="zui-loadding-box"><div class="zui-loadding"><i class="icon icon-spin icon-spinner"></i> <span></span></div></div>');
    			$('body').append(this.$zuiLoad);
        	}
    		var $load = this.$zuiLoad.find('.zui-loadding');
    		$load.find('span').html(text);
    		var swid = this.$zuiLoad.width(),
				shei = this.$zuiLoad.height(),
				mywid = $load.width() + 60,
				myhei = $load.height() + 20;
    		$load.css({"margin-top": (shei - myhei)/2 + "px", "margin-left": (swid - mywid)/2 + "px"});
    		this.$zuiLoad.show();
    		if(delay && _.isNumber(delay)){
    			var that = this;
    			setTimeout(function(){
    				that.$zuiLoad.hide();
    			}, delay);
    		}
    		return this;
    	};
    	
        this.hide = function(){
        	this.$zuiLoad.hide();
        	return this;
        };
    };
    
    $.confirm = function(ops){
    	var obj = $.extend({
    		id: 'confirm-modal',
    		title: '提示',
    		msg: '',
    		showCancel: true,
    		showYes: true,
    		showNo: false,
    		cancelText: '取消',
    		yesText: '同意',
    		noText: '拒绝',
    		yesClick: $.noop,
    		noClick: $.noop,
    		cancelClick: $.noop,
    		size: 'modal-sm'
    	}, ops),
    	$modal = $('body #' + obj.id);
    	if(!$modal.length){
    		var html = '<div class="modal fade custom" id="{id}">';
	    		html += '  <div class="modal-dialog {size}">';
	    		html += '    <div class="modal-content">';
	    		html += '      <div class="modal-header">';
	    		html += '        <h4 class="modal-title">{title}</h4>';
	    		html += '      </div>';
	    		html += '      <div class="modal-body">{msg}</div>';
	    		html += '      <div class="modal-footer">';
	    		html += obj.showCancel ? ('<button type="button" class="btn btn-default btn-cancel" data-dismiss="modal">{cancelText}</button>') : '';
	    		html += obj.showNo ?     ('<button type="button" class="btn btn-waring btn-no" data-dismiss="modal">{noText}</button>') : '';
	    		html += obj.showYes ?    ('<button type="button" class="btn btn-primary btn-yes" data-dismiss="modal">{yesText}</button>') : '';
	    		html += '      </div>';
		      	html += '    </div>';
		      	html += '  </div>';
			  	html += '</div>';
			$modal = $(utils.formatByJson(html, obj));
			$('body').append($modal);
			
			$modal.find('.btn-cancel').on('click', function(e){
				obj.cancelClick && obj.cancelClick.call(this, $modal, e);
				$modal.modal('hide');
			});
			$modal.find('.btn-no').on('click', function(e){
				obj.noClick && obj.noClick.call(this, $modal, e);
			});
			$modal.find('.btn-yes').on('click', function(e){
				obj.yesClick && obj.yesClick.call(this, $modal, e);
			});
    	}
    	return $modal.modal({backdrop: 'static'});
    };
    
    window.alert = function(text){
    	new $.zui.Messager(text, {
    		icon: "info-sign",
		    type: 'info',
		    placement: 'center'
		}).show();
    };
    
    window.error = function(text){
    	new $.zui.Messager(text, {
    		icon: "warning-sign",
    		type: 'danger',
    		placement: 'top'
    	}).show();
    };
    
    window.waiting = function(text){
    	return new $.ZuiLoader().show(text || '处理中，请稍候...');
    };
    
    window.onerror = function(e){
    	log.error(e);
    	//error(e);
    };
    
    /**
     * 浮点数相加，解决js浮点数计算bug，例如：100 + 12.29 = 112.28999999999999 的问题
     * 使用方法：
     *     Number(100).add(12.29), 结果为：112.29
     *     --------------------------------------
     *     var a = 100; 
     *     a.add(12.29), 结果为：112.29
     */
    Number.prototype.add = function(arg){
    	function accAdd(arg1, arg2){ 
    		var r1,r2,m; 
    		try{
    			r1 = arg1.toString().split(".")[1].length;
    		} catch(e) {
    			r1 = 0;
    		} 
    		try{
    			r2 = arg2.toString().split(".")[1].length;
    		} catch(e) {
    			r2 = 0;
    		} 
    		m = Math.pow(10, Math.max(r1, r2)); 
    		return (arg1*m + arg2*m)/m;
    	} 
    	return parseFloat(accAdd(this, arg));
    };
    
    /**
     * 浮点数相减，解决js浮点数计算bug，例如：100 - 30.46 = 69.53999999999999 的问题
     * 使用方法：
     *     Number(100).subtract(30.46), 结果为：69.54
     *     --------------------------------------
     *     var a = 100; 
     *     a.subtract(11.10), 结果为：69.54
     */
    Number.prototype.subtract = function(arg){
    	function accSubtr(arg1, arg2){
    		var r1, r2, m, n;
    		try{
    			r1 = arg1.toString().split(".")[1].length;
    		}catch(e){
    			r1 = 0;
    		}
    		try{
    			r2 = arg2.toString().split(".")[1].length;
    		}catch(e){
    			r2 = 0;
    		}
    		m = Math.pow(10,Math.max(r1, r2));
    		//动态控制精度长度
    		n = (r1 >= r2) ? r1 : r2;
    		return ((arg1*m - arg2*m)/m).toFixed(n);
    	};
    	return parseFloat(accSubtr(this, arg));
    };
    
    /**
     * 浮点数相乘，解决js浮点数计算bug，例如：10.01 * 11.10 = 111.11099999999999 的问题
     * 使用方法：
     *     Number(10.01).mult(11.10), 结果为：111.111
     *     --------------------------------------
     *     var a = 10.01; 
     *     a.mult(11.10), 结果为：111.111
     */
    Number.prototype.mult = function(arg){
    	function accMul(arg1, arg2){
    		var m = 0,
    			s1 = arg1.toString(),
    			s2 = arg2.toString(); 
	    	try{
	    		m += s1.split(".")[1].length;
	    	}catch(e){} 
	    	try{
	    		m += s2.split(".")[1].length;
	    	}catch(e){} 
	    	return Number(s1.replace(".", "")) * Number(s2.replace(".",""))/Math.pow(10, m);
    	}
    	return accMul(this, arg);
    };
    
    /**
     * 浮点数相除，解决js浮点数计算bug，例如：2.1 / 0.3 = 7.000000000000001 的问题
     * 使用方法：
     *     Number(2.1).division(0.3), 结果为：7
     *     --------------------------------------
     *     var a = 2.1; 
     *     a.division(0.3), 结果为：7
     */
    Number.prototype.division = function(arg){
    	function accDiv(arg1, arg2){ 
    		var t1 = 0, t2 = 0, r1, r2; 
    		try{
    			t1 = arg1.toString().split(".")[1].length;
    		}catch(e){} 
    		try{
    			t2 = arg2.toString().split(".")[1].length;
    		}catch(e){} 
    		with(Math){ 
    			r1 = Number(arg1.toString().replace(".", "")); 
    			r2 = Number(arg2.toString().replace(".", ""));
    			return (r1/r2)*pow(10, t2 - t1); 
    		} 
		} 
    	return accDiv(this, arg);
    };
    
    
});