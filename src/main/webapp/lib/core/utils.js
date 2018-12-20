/**
 * ##utils模块，包含一些前端的工具方法##
 * @module core/utils
 * @author yisin
 */
define(function(require, exports, module){
var json = require("./json"),
    des = require("./des"),

    utils = {

    /**
     * **将json字符串转换成对象，详细请参考：[www.json.org](http://www.json.org/)，[json项目](https://github.com/douglascrockford/JSON-js)**
     * @method parseJSON
     * @param {string} param 需要转换的json字符串
     * @return {object} 字符串对应的javascript对象
     */
    parseJSON: json.parse,

    /**
     * **将对象转换成json字符串，详细请参考：[www.json.org](http://www.json.org/)，[json项目](https://github.com/douglascrockford/JSON-js)**
     * @method toJSON
     * @param {object} obj 需要转换的javascript对象
     * @return {string} javascript对象对象对应的json字符串
     */
    toJSON: json.stringify,

    /**
     * **使用[DES算法](http://zh.wikipedia.org/wiki/DES)加密字符串**
     * @method encrypt
     * @param {string} str 需要加密的字符串
     * @param {string} key 密钥
     * @return {string} 密文
     */
    encrypt: des.encrypt,

    /**
     * **解密字符串**
     * @method decrypt
     * @param {string} str 密文
     * @param {string} key 密钥
     * @return {string} 明文
     */
    decrypt: des.decrypt,

    /**
     * **使用html的a标签解析URL**
     * @method parseUrl
     * @param {string} url 需要解析的URL地址
     * @return {object} 解析后的URL对象
     */
    parseUrl: function (url){
        var a =  document.createElement('a');
        a.href = url = (url || window.location.href);
        return {
            source: url,
            protocol: a.protocol.replace(':',''),
            host: a.hostname,
            port: (a.port == "0" || a.port == "") ? 80: a.port,  // a.port 可能会解析不一样的
            query: a.search,
            params: (function(){
                var ret = {},
                    seg = a.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = decodeURIComponent(s[1]);
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
            hash: a.hash.replace('#',''),
            path: a.pathname.replace(/^([^\/])/,'/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
            segments: a.pathname.replace(/^\//,'').split('/')
        };
    },

    /**
     * **获取URL的参数信息**
     * @method getUrlParam
     * @param {string} url 需要解析的URL地址
     * @return {object} 解析后的参数对象
     */
    getUrlParam: function(url) {
    	var ret = {},
    		url = url || document.location.href,
    		separa = "&", rep = "=_=_=_=_";
    	url = url.indexOf("?") ? url.substring(url.indexOf("?") + 1): url;
    	if(url.indexOf("#") != -1){
    		if(url.substring(url.indexOf("#")).indexOf("&") == -1){
    			url = url.substring(0, url.indexOf("#"));
    		}
    	}
    	url = url.replace(/^\?/,'').replace(/(^&|&$)/g, "");
    	if(url.indexOf("&") != -1){
    		var seg1 = url.match(/&[a-zA-Z0-9]+=/g);
    		var seg2 = url.match(/&/g);
    		if(seg2.length > seg1.length){
    			for(var i = 0, k = seg1.length; i < k; i++ ){
    				url = url.replace(seg1[i], '' + seg1[i].substring(1));
    			}
    			separa = rep;
    		}
    	}
		var seg = url.split(separa),
		len = seg.length, i = 0, s;
		for (;i<len;i++) {
			if (!seg[i]) { continue; }
			s = seg[i].split('=');
			try {
				ret[s[0]] = decodeURIComponent(this.convertEmpty(s[1]));
			} catch (e) {
			}
		}
	    return ret;
    },

    /**
     * **根据参数构建URL地址**
     * @method buildUrl
     * @param {string} url 需要构建的URL地址
     * @param {object} [params] URL参数, JSON格式: {a=123}
     * @param {string} [hash] 信息片段（hash）
     * @return {string} 构建后的URL地址
     */
    buildUrl: function(url, params, hash) {
        if(!url) {
            return "";
        }

        var that = this,
            parsed = that.parseUrl(url),

            hashStr = (function() {
                if("string" === $.type(hash)) {
                    return hash ? "#" + hash : "";
                }
                return parsed.hash ? "#" + parsed.hash : "";
            })(),

            qryStr = (function() {
                var obj = $.extend({}, parsed.params, params);
                return $.isEmptyObject(obj) ? "" : "?" + that.buildQueryString(obj);
            })();

        return url.replace(/(\?|\#).*/, "") + qryStr + hashStr;
    },

    /**
     * **根据参数构建URL的查询字符串**
     * @method buildQueryString
     * @param {object} obj 参数
     * @return {string} 查询字符串
     */
    buildQueryString: function(obj) {
        var arr = [];
        $.each(obj, function(k, v) {
            arr.push(k + "=" + v);
        });
        return arr.join("&");
    },

    /**
     * **根据格式化字符串将日期对象转成字符串**
     * @method formatDate
     * @param dateTime{date} 需要格式化的日期
     * @param fmt {string} 格式化的格式 默认 yyyy-MM-dd hh:mm:ss
     * @returns {*|string} 格式化后的日期或直接返回格式
     */
    formatDate : function(dateTime, fmt){
    	if(!dateTime) {
            return dateTime;
        }
    	
        fmt = fmt || "yyyy-MM-dd HH:mm:ss";

        if(_.isString(dateTime)) {
            dateTime = this.parseDate(dateTime);
        }
        
        if(/^[0-9]+$/i.test(dateTime)){
        	dateTime = new Date(dateTime);
    	}

        if(!_.isDate(dateTime)) {
            return dateTime;
        }

        var o = {
            "M+" : dateTime.getMonth() + 1,               //月份
            "d+" : dateTime.getDate(),                    //日
            "H+" : dateTime.getHours(),                   //小时
            "m+" : dateTime.getMinutes(),                 //分
            "s+" : dateTime.getSeconds(),                 //秒
            "q+" : Math.floor((dateTime.getMonth()+3)/3), //季度
            "S"  : dateTime.getMilliseconds()             //毫秒
        };

        if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (dateTime.getFullYear()+"").substr(4 - RegExp.$1.length));
        }

        for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }

        return fmt;
    },
    
    formatDateNum : function(datenum, fmt){
    	if(datenum && datenum.length >= 14){
    		var year = datenum.substr(0, 4),
    			month = datenum.substr(4, 2),
    			date = datenum.substr(6, 2),
    			hour = datenum.substr(8, 2),
    			minute = datenum.substr(10, 2),
    			second = datenum.substr(12, 2);
    		datenum = this.format("{0}-{1}-{2} {3}:{4}:{5}", year, month, date, hour, minute, second);
    	}
    	return this.formatDate(datenum, fmt);
    },

    /**
     * **字符串转换成日期对象**
     * @method parseDate
     * @param text  传入的日期字符串 支持yyyy-MM-dd hh:mm:ss、 yyyyMMdd hh:mm:ss 、 yyyy/MM/dd hh:mm:ss格式的字符串
     * @returns {Date} 根据日期字符串返回日期
     */
    parseDate: function(text){
    	if(/[0-9]+T[0-9]+/g.test(text)){
    		var d = new Date(text);
    		if(_.isNaN(d.getFullYear())){
    	        var rx = /^(\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2})/g;
    	        var p = rx.exec(text) || [];
    	        if(p[1]){
    	        	var index = p[1].indexOf('.');
    	        	if(index != -1){
    	        		p[1] = p[1].substring(0, index);
    	        	}
    	        	var days = p[1].replace('T', ' ').replace(/\-/g, ' ').replace(/:/g, ' ');
    	        	days = days.split(' ');
    	        	//                             年                                                                月                                           日                         
    	        	d = new Date(Date.UTC(parseInt(days[0]), parseInt(days[1]) - 1, parseInt(days[2])
    	        			//           时                                                          分                                                              秒
    	        			, parseInt(days[3]), parseInt(days[4]), parseInt(days[5])));  	
    	        }
    	        return d;
    	    }
    		return d;
    	} else if(/ CST [0-9]+/g.test(text)){
    		var d = new Date(text);
	        var rx = {
	        	"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
	        	"Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
	        };
	        var p = text.split(' ') || [];
	        if(p[1]){
	        	var h = p[3].split(":");
	        	d = new Date(parseInt(p[5]), parseInt(rx[p[1]]) - 1, parseInt(p[2])
        			//           时                                                          分                                                              秒
        			, parseInt(h[0]), parseInt(h[1]), parseInt(h[2])); 
	        }
	        return d;
    	}
    	if(/^[0-9]+$/i.test(text)){
    		return new Date(text);
    	}
        var dt = text.split(" "),
            hh = 0,mm = 0,ss = 0,
            matchD,year,month,dd,hmsStr,hms,ymdStr = dt[0];
        if(dt.length == 2) {
            hmsStr = dt[1];
        }

        if(matchD = ymdStr.match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})$/)){
            year = matchD[1];
            month = matchD[2];
            dd = matchD[3];
        }else{
            if(ymdStr.length === 8){
                year = ymdStr.substring(0,4);
                month = ymdStr.substring(4,6);
                dd = ymdStr.substring(6,8);
            }
        }
        if(hmsStr){
            hms = hmsStr.match(/^(\d{2})\D(\d{2})\D(\d{2})$/);
            hh = hms[1];
            mm = hms[2];
            ss = hms[3];
        }
        return new Date(year,month-1,dd,hh,mm,ss);
    },

    getCurrDate: function(format) {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        if (format) {
            switch (format) {
                case ':month_first':
                    d = 1;
                    break;
                case ':month_last':
                    var a = y,
                        b = m;
                    if (m == 12) {
                        a += 1;
                        b = 1;
                    }
                    d = 32 - new Date(a, b - 1, 32).getDate();
                    break;
                case ':week_last':
                    if (d <= 7) {
                        d = 1;
                    } else {
                        d = d - 7;
                    }
                    break;
                case ':curr_date':
                    break;
            }
        }
        return y + '' + (m < 10 ? ('0' + m) : m) + '' + (d < 10 ? ('0' + d) : d);
    },

    valueReplace: function(v) {
        //v = v.toString().replace(new RegExp('(["\"])', 'g'), "\\\"");
        v = v.replace(/\"/g, "&quot;");
        v = v.replace(/</g, "&lt;");
        v = v.replace(/>/g, "&gt;");
        return $.trim(v);
    },

    formatNumber: function(num){
        if(!/^(\+|-)?(\d+)(,\d{3})*(\.|\.\d+)?$/.test(num)){
            return num;
        }
        var a = RegExp.$1,b = RegExp.$2,c = RegExp.$4;
        var re = /(\d)(\d{3})(,|$)/;
        while(re.test(b)){
            b = b.replace(re,"$1,$2$3");
        }
        return  a +""+ b +""+ c;
    },

    /**
     * **将普通参数转换为json格式**
     * @param [string]参数字符串，例如：a=123&b=456
     * @param [string]分隔字符串，例如：&
     * @param [function] 过滤函数，自定义函数
     * @return [json]
     */
    serialize2Json: function(param, seperator, vFilter) {
        seperator = seperator || ",";
        param = (function() {
            try {
                return decodeURIComponent(param);
            } catch(ex) {
                return param;
            }
        })();
        vFilter = vFilter || $.noop;

        var ret = {},
            pairsArr = param.split('&'), pair, idx, key, value;
        $.each(pairsArr, function() {
            idx = this.indexOf("=");
            if(-1 === idx) {
                return true;
            }
            key = this.substring(0, idx);
            value = this.substring(idx + 1, this.length);

            value = vFilter.call(param, key, value) || value;

            if(ret[key]) {
                if(-1 === ret[key].indexOf(value)) {
                    ret[key] = ret[key] + seperator + value;
                }
            } else {
                ret[key] = value;
            }
        });

        return ret;
    },

    quickSort: function(arr,field,useLocaleCompare) {
        if (arr.length <= 1) { return arr; }
        var pivotIndex = Math.floor(arr.length / 2);
        var pivot = arr[pivotIndex];
        var left = [];
        var right = [];
        for (var i = 0; i < arr.length; i++){
            if(i==pivotIndex) continue;
            var flag;
            if(useLocaleCompare) {
                flag = (new String(arr[i][field]).localeCompare(pivot[field])==-1); // 不同版本不同地区实现不一致，不建议使用
            } else {
                flag = (new String(arr[i][field]) < pivot[field]); // 按unicode进行比较
            }
            if (flag) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }
        return utils.quickSort(left,field).concat([pivot], utils.quickSort(right,field));
    },
    
    /**
     * 将金额格式化为 标准3位逗号分隔，两位小数点 格式
     */
    parseMoney: function(num, currency, className){
    	num = num || "0.00";
    	if(/^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(num)){
    		var str = "" + num;
    		if(str.indexOf('.') == -1){
    			str = str + '.00';
    		}
    		var arr = str.split('.'),
    			before = arr[0],
    			after = arr[1];
    		function splitx(s){
    			if(s.length > 3){
    				var index = s.length - 3;
    				s = splitx(s.substring(0, index)) + ',' + s.substring(index);
    			}
    			return s;
    		}
    		function splity(s){
    			if(s.length > 2){
    				s = s.substring(0, 2);
    			}
    			if(s.length==1){
    				s = s+"0";
    			}
    			return s;
    		}
    		str = splitx(before) + '.' + splity(after);
    		num = (currency || "") + '<span class="money-text '+(className || "color-primary")+' ">' + str + '</span>';
    	}
    	return num;
    },
    
    /**
     * 将金额格式化为 标准3位逗号分隔，两位小数点 格式
     */
    formatSearch: function(resStr, skey){
    	if(resStr && skey){
    		var re = new RegExp(skey, 'gi');
    		resStr = resStr.replace(re, '<span class="search-key-flag">' + skey + '</span>');
    	}
    	return resStr;
    },
    
    /**
     * 格式化字符串
     * @param "dwd{0}等我{1}哈哈"
     * @param 22, "张三"
     * return "wdw22等我张三哈哈"
     */
    format: function(){
    	var str = arguments[0],
    		params = arguments;
    	for(var i = 1, k = params.length; i < k; i++){
    		str = str.replace("{" + (i - 1) + "}", params[i]);
    	}
    	return str;
    },
    
    /**
     * 格式化字符串，参数为json
     * 例如：
     * str -> dwd{id}等我{name}哈哈
     * json -> 
     * {
     *   "id": 1,
     *   "name": '张三'
     * }
     * return "dwd1等我张三哈哈"
     */
    formatByJson: function(str, json){
    	if(_.isObject(json)){
    		for(var key in json){
    			eval('var exc = /\{' + key + '\}/g;');
    			str = str.replace(exc, json[key]);
    		}
    	}
    	return str;
    },
    
    /**
     * 自动填充表单数据
     * @param formSelector form元素选择器
     * @param data json数据
     * @param c 子元素选择器(#, @)，默认为@ =>"name",
     */
    fillFormData: function(formSelector, data, c){
    	try{
    		c = c || "@";
        	for(var key in data){
        		if(c == '#'){
        			$(formSelector + ' #' + key).val(data[key]);
        		} else if(c == '@'){
        			$(formSelector + ' [@name="' + key + '"').val(data[key]);
        		}
        	}
    	}catch(e){
    		new Error("填充表单错误，请检查：" + e);
    	}
    },
    
    /**
     * 位数前补零
     * @param str
     * @param size 最终长度
     * @param 补足字符串，默认为 0 
     */
    upzore: function(str, size, c){
		size = size || str.length;
		str = "" + str;
		c = c || "0";
		var len = size - str.length;
		for(var i = 0; i < len; i++){
			str = c + str;
		}
		return str;
    },
    
    /**
     * 解析静态模版
     */
    parsetpl: function(tmpl, data){
	    var format = {
	        name: function(x) {
	            return x;
	        }
	    };
	    return tmpl && tmpl.replace(/{(\w+)}/g, function(m1, m2) {
	        if (!m2)
	            return "";
	        return (format && format[m2]) ? format[m2](data[m2]) : data[m2];
	    });
	},
	
	/**
     * 解析静态模版
     */
    parseHtml: function(html, data){
	    for(var key in data){
	    	eval("var re = /\\{" + key + "\\}/g");
	    	html = html.replace(re, data[key]);
	    }
	    return html;
	},
	
	/**
	 * 转换空对象为其他
	 */
	convertEmpty: function(res, target){
		if(res === null || res === undefined || res === 'null' || res === 'undefined' || res === NaN || res === 'NaN'){
			res = target || '';
		}
		return res;
	},
	
	/**
	 * 转换空数字数据为0
	 */
	empty2Number: function(res, target){
		if(res === null || res === undefined || res === 'null' || res === 'undefined' || res === NaN || res === 'NaN'){
			res = target;
		}
		return res;
	},
	
	/**
	 * 判断input、textarea的值是否改变，必须存在data-original属性时才生效
	 * return true：已改变，false：未改变
	 */
	isChangeValue: function(selector){
		var $ele = $(selector),
			newValue = $ele.val(),
			oldValue = $ele.data('original') || '';
		return newValue != oldValue;
	},
	
	uriEncode: function(str){
		return encodeURIComponent(encodeURIComponent(str));
	}
    
};
return utils;
});