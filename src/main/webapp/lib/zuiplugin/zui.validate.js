/**
 * zui.validate.js 
 * form表单验证组件
 * @author yisin
 * @date 2016-12-20
 */
define(function(require, exports, module) {
	
	function FormDom (){
		this.eleName = '';
		this.element = null;
		this.parent = null;
		this.rule = {};
		this.message = {};
	}
	
	function ZuiValidator(selector){
		var that = this;
		that.$form = $(selector);
		that.$form.data('ZuiValidator', that);
		that.defaultMsg = "输入值不符合要求";
		that.settings = {
			rules: {
				
            },
			message: {
				required: "必填项",
				email: "邮箱格式不正确",
				charnum: "只能输入英文字母、数字、特殊字符等",
				phone: "电话号码格式不正确",
				mobile: "手机号码格式不正确",
				maxlenth: "长度不能大于{0}位",
				minlenth: "长度不能小于{0}位",
				length: "长度必须在{0}到{1}位之间",
				value: "数值必须在{0}到{1}之间",
				min: "值不能小于{0}",
				max: "值不能大于{0}",
				url: "URL地址格式不正确",
				date: "日期格式不正确",
				equalTo: "两次输入不正确",
				number: "此项必须为数值类型",
				isExist: "已存在记录，请更换其他",
				float: "数值整数位必须在1到{0}之间，小数位必须在1到{1}之间",
				idcard: "身份证号码格式化不正确，应是15或者18位",
				emailOrPhone: "只支持电子邮箱或者手机号码"
			}
		}
		
		that.eleStore = {};
		that.errorStore = {};
		
		that.init();
	}
	
	ZuiValidator.prototype = {
		
		init: function(){
			// 初始化
			//var formJson = this.$form.serializeJson();
			var that = this;
			that.$form.find('input,select,textarea').each(function(i, e){
				var $ele = $(e);
				var datas = $ele.data();
				var formDom = new FormDom();
				formDom.eleName = e.name || e.id;
				formDom.element = e;
				formDom.parent = that.checkable(e) ? $ele.parent().parent('.form-control').parent() : $ele.parent();
				var rule = $ele.data('rule');
				var message = $ele.data('message');
				if(rule){
					rule = rule.substring(1, rule.length - 1);
					var rules = rule.split(';'), kv, key, value;
					for(var i = 0, k = rules.length; i < k; i++){
						kv = rules[i].split('='),
						key = kv[0],
						value = kv[1];
						switch(key){
							case 'required':
								value = typeof(value) == 'string' ? value == 'true' : value; break;
							case 'length':
								value = typeof(value) == 'string' ? $.parseJSON(value) : value; break;
							case 'value':
								value = typeof(value) == 'string' ? $.parseJSON(value) : value; break;
							case 'minlength':
								value = typeof(value) == 'string' ? Number(value) || 0 : value; break;
							case 'maxlength':
								value = typeof(value) == 'string' ? Number(value) || 0 : value; break;
							case 'min':
								value = typeof(value) == 'string' ? Number(value) || 0 : value; break;
							case 'max':
								value = typeof(value) == 'string' ? Number(value) || 0 : value; break;
							case 'float':
								value = typeof(value) == 'string' ? $.parseJSON(value) : value; break;
						}
						formDom.rule[key] = value;
					}
				}
				
				if(message){
					message = message.substring(1, message.length - 1);
					var msgs = message.split(';'), kv;
					for(var i = 0, k = msgs.length; i < k; i++){
						kv = msgs[i].split('=');
						formDom.message[kv[0]] = kv[1];
					}
				}
				
				if(!that.eleStore[formDom.eleName]){
					that.eleStore[formDom.eleName] = formDom; 
				}
				
				if(formDom.element.tagName == 'SELECT'){
					that.bindEvent(formDom.eleName, 'change', 'focusout');
				} else {
					that.bindEvent(formDom.eleName, 'focusin', 'focusin');
					that.bindEvent(formDom.eleName, 'focusout', 'focusout');
				}
			});
		},
		
		updateRule: function(key, newRule){
			var formDom = this.eleStore[key];
			if(formDom && formDom.rule){
				formDom.rule = newRule;
				this.eleStore[key] = formDom;
			}
		},
		
		bindEvent: function(name, event, func){
			var that = this,
				dom = that.eleStore[name];
			$(dom.element).on(event, function(){
				that[func].call(that, name);
			});
		},
			
		validate: function( arg ){
			var that = this;
			if(typeof(arg) == 'string'){
				
				if(arg === 'show'){
					that.methods.showErrors();
				} else if(arg === 'hide'){
					that.methods.hideErrors();
				} else if(arg === 'init'){
					that.init();
				}
				
			} else if(typeof(arg) == 'object') {
				
				if(arg.rules){
					var dom = {}, rule;
					for(var key in that.eleStore){
						dom = that.eleStore[key];
						rule = arg.rules[dom.eleName];
						if(rule){
							$.extend(dom.rule, rule);
						}
					}
				}
				
				if(arg.message){
					var dom = {}, msg;
					for(var key in that.eleStore){
						dom = that.eleStore[key];
						msg = arg.message[dom.eleName];
						if(msg){
							$.extend(dom.message, msg);
						}
					}
				}
				
			} else {
				// 验证
				var that = this,
					dom,
					formJson = that.$form.serializeJson(),
					result,
					num = 0;
				that.errorStore = {};
				for(var key in that.eleStore){
					dom = that.eleStore[key],
					
					result = that.valid(dom, formJson[dom.eleName]);
					if(result){
						dom.parent.removeClass('has-error').addClass('has-success');
					} else {
						num++;
						dom.parent.removeClass('has-success').addClass('has-error');
					}
				}
				
				that.showErrors();
				
				return num == 0;
			}
		},
		
		valid: function(formDom, value){
			var that = this, rv, method, flag;
			for(var r in formDom.rule){
				rv = formDom.rule[r];
				method = that.methods[r];
				if(method){
					flag = method.call(that, value, formDom.element, rv);
					if(flag != true){
						that.errorStore[formDom.eleName] = {
							dom: formDom,
							rule: r,
							message: formDom.message[r] || that.settings.message[r]
						}
						return false;
					}
				}
			}
			return true;
		},
		
		showErrors: function(){
			var that = this, ele;
			for(var k in that.errorStore){
				ele = that.errorStore[k];
				that.showError(ele);
			}
		},
		
		showError: function(ele){
			var that = this, $ele;
				$ele = $(ele.dom.element);
			var msg = ele.message;
			if(msg && msg.indexOf('{') != -1){
				var value = ele.dom.rule[ele.rule];
				if(Object.prototype.toString.call(value) == '[object Array]'){
					for(var i = 0, k = value.length; i < k; i++){
						msg = msg.replace('{' + i + '}', value[i]);
					}
				} else {
					msg = msg.replace('{0}', value);
				}
			}
				
			ele.dom.parent.tooltip('destroy')
				.data('toggle', 'tooltip')
				.data('placement', 'bottom')
				.attr('title', msg || that.defaultMsg)
				.tooltip('show');
		},
		
		hideErrors: function(){
			var that = this, ele;
			for(var k in that.errorStore){
				ele = that.errorStore[k];
				that.hideError(ele);
			}
		},
		
		hideError: function(dom){
			var that = this, $ele;
			$ele = $(dom.element);
			dom.parent.data('toggle', '').data('placement', '').removeAttr('title').tooltip('destroy');
		},
		
		focusin: function(name){
			delete this.errorStore[name];
		},
		
		focusout: function(name){
			var that = this,
				dom = that.eleStore[name],
				parent = dom.element.type == 'radio' || dom.element.type == 'checkbox' ? $(dom.element).parent().parent('.form-control').parent() : $(dom.element).parent();
			setTimeout(function(){
				
				var formJson = that.$form.serializeJson();				
				var result = that.valid(dom, formJson[dom.eleName]);
				if(result){
					parent.removeClass('has-error').addClass('has-success');
					that.hideError(dom);
				} else {
					parent.removeClass('has-success').addClass('has-error');
					that.errorStore[dom.eleName] && that.showError(that.errorStore[dom.eleName]);
				}
			}, 100);
		},
			
		methods: {
			
			required: function( value, element, param ) {
				if(param === false){
					return true;
				}
				// check if dependency is met
				if ( !this.depend( param, element ) ) {
					return "dependency-mismatch";
				}
				if ( element.nodeName.toLowerCase() === "select" ) {
					// could be an array for select-multiple or a string, both are fine this way
					var val = $( element ).val();
					return val && val.length > 0;
				}
				if ( this.checkable( element ) ) {
					return this.getLength( value, element ) > 0;
				}
				//log.info("required:", typeof value,  value.length > 0);
				return value && value.length > 0;
			},

			// http://jqueryvalidation.org/email-method/
			email: function( value, element ) {
				// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
				// Retrieved 2014-01-14
				// If you have a problem with this implementation, report a bug against the above spec
				// Or use custom methods to implement your own email validation
				return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
			},
			
			// 只允许英文 +数字 +字符（_.@）
			charnum: function( value, element ){
				return this.optional( element ) || /^[a-zA-Z0-9_@\.]+$/.test(value);
			},

			// http://jqueryvalidation.org/url-method/
			url: function( value, element ) {

				// Copyright (c) 2010-2013 Diego Perini, MIT licensed
				// https://gist.github.com/dperini/729294
				// see also https://mathiasbynens.be/demo/url-regex
				// modified to allow protocol-relative URLs
				return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
			},

			// http://jqueryvalidation.org/date-method/
			date: function( value, element ) {
				return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
			},

			// http://jqueryvalidation.org/dateISO-method/
			dateISO: function( value, element ) {
				return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
			},

			// http://jqueryvalidation.org/number-method/
			number: function( value, element ) {
				return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
			},

			// http://jqueryvalidation.org/digits-method/
			digits: function( value, element ) {
				return this.optional( element ) || /^\d+$/.test( value );
			},

			// http://jqueryvalidation.org/creditcard-method/
			// based on http://en.wikipedia.org/wiki/Luhn_algorithm
			creditcard: function( value, element ) {
				if ( this.optional( element ) ) {
					return "dependency-mismatch";
				}
				// accept only spaces, digits and dashes
				if ( /[^0-9 \-]+/.test( value ) ) {
					return false;
				}
				var nCheck = 0,
					nDigit = 0,
					bEven = false,
					n, cDigit;

				value = value.replace( /\D/g, "" );

				// Basing min and max length on
				// http://developer.ean.com/general_info/Valid_Credit_Card_Types
				if ( value.length < 13 || value.length > 19 ) {
					return false;
				}

				for ( n = value.length - 1; n >= 0; n--) {
					cDigit = value.charAt( n );
					nDigit = parseInt( cDigit, 10 );
					if ( bEven ) {
						if ( ( nDigit *= 2 ) > 9 ) {
							nDigit -= 9;
						}
					}
					nCheck += nDigit;
					bEven = !bEven;
				}

				return ( nCheck % 10 ) === 0;
			},

			// http://jqueryvalidation.org/minlength-method/
			minlength: function( value, element, param ) {
				var length = $.isArray( value ) ? value.length : this.getLength( value, element );
				return this.optional( element ) || length >= parseInt(param);
			},

			// http://jqueryvalidation.org/maxlength-method/
			maxlength: function( value, element, param ) {
				var length = $.isArray( value ) ? value.length : this.getLength( value, element );
				return this.optional( element ) || length <= parseInt(param);
			},

			// http://jqueryvalidation.org/rangelength-method/
			length: function( value, element, param ) {
				var length = $.isArray( value ) ? value.length : this.getLength( value, element );
				return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
			},

			// http://jqueryvalidation.org/min-method/
			min: function( value, element, param ) {
				return this.optional( element ) || value >= param;
			},

			// http://jqueryvalidation.org/max-method/
			max: function( value, element, param ) {
				return this.optional( element ) || value <= param;
			},

			// http://jqueryvalidation.org/range-method/
			value: function( value, element, param ) {
				return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
			},

			// http://jqueryvalidation.org/equalTo-method/
			equalTo: function( value, element, param ) {
				// bind to the blur event of the target in order to revalidate whenever the target field is updated
				// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
				var target = $( param );
				if ( this.settings.onfocusout ) {
					target.off( ".validate-equalTo" ).on( "blur.validate-equalTo", function() {
						$( element ).valid();
					});
				}
				return value === target.val();
			},

			// http://jqueryvalidation.org/remote-method/
			isExist: function( value, element, param ) {
				if ( this.optional( element ) ) {
					return "dependency-mismatch";
				}
				var result = true,
					oldValue = $(element).data('oldValue');
				if(oldValue === value){
					return true;
				}
				if(typeof param == 'string' && param.indexOf("{") != -1){
					param = $.parseJSON(param);
				}
				if(param.url && param.data){
					param.data[element.name] = value;
					ajax.syncAjax({
						url: param.url,
						data: param.data,
						success: function(data){
							if(ajax.isSuccess(data)){
								if(data.rtn.data){
									result = false;
								}
							} else {
								result = false;
							}
						}, error: function(){
							result = false;
						}
					});
				} else {
					result = false;
				}
				return result;
			},
			
			// 
			float: function( value, element, param ) {
				var result = false;
				if(param && _.isArray(param)){
					//              /^([\d]{1,*}|[\d]{1,*}.[\d]{1,*})$/g
					var exc = eval('/^([\\d]{1,' + param[0] + '}|[\\d]{1,' + param[0] + '}.[\\d]{1,' + param[1] + '})$/g');
					result = this.optional( element ) || exc.test( value )
				}
				return result;
			},
			
			mobile: function(value, element){
				return this.optional( element ) || /^1(3|4|5|6|7|8|9)[0-9]{9}$/.test( value );
			},
			
			phone: function(value, element){
				return this.optional( element ) || /^((\+?86)|(\(\+86\)))?\d{3,4}-\d{7,8}(-\d{3,4})?$/.test( value );
			},
			
			idcard: function(value, element){
				return this.optional( element ) || /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test( value );
			},
			
			emailOrPhone: function(value, element){
				var phoneExc = /^1(3|4|5|6|7|8|9)[0-9]{9}$/;
				var emailExc = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
				return this.optional( element ) || (phoneExc.test( value ) || emailExc.test( value ));
			}
		},
		
		addMethod: function(methodName, func){
			this.methods[methodName] = func;
		},
			
		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.$form ).find( "[name='" + name + "']" );
		},
		
		optional: function( element ) {
			var val = this.elementValue( element );
			var key = element.name || element.id; 
			if(key && this.eleStore[key]){
				var rule = this.eleStore[key].rule;
				if(!rule.required && !val){
					return true;
				}
			}
			return !ZuiValidator.prototype.methods.required.call( this, val, element ) && "dependency-mismatch";
		},
		
		elementValue: function( element ) {
			var val,
				$element = $( element ),
				type = element.type;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter(":checked").val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? false : $element.val();
			}

			val = $element.val();
			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "" );
			}
			return val;
		},
		
		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},
		
		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		}
			
	};
	
	
	return function(s){
		var ZV = $(s).data('ZuiValidator');
		return ZV || new ZuiValidator(s);
	};
});
