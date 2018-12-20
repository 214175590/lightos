/**
 * @module core/ajax-zui
 * @see module:core/ajax-zui
 * @author yisin
 */
define(function(require, exports, module) {
    var loginData = {},
        encKey = "",
        ajax = require("./ajax"),
        tempAjaxJson = {},
        ajaxZui = $.extend({}, ajax, {

            /**
             *
             * 使用方法：
             * ```javascript
             * ajax.ajaxRequest(param).done(function() {
             *  console.log("done");    //绑定执行成功的回调函数，支持多次调用done绑定多个回调函数
             * }).fail(function() {
             *  console.log("fail");    //绑定执行失败的回调函数，支持多次调用fail绑定多个回调函数
             * }).always(function() {
             *  console.log("complete");    //绑定执行完成的回调函数，支持多次调用always绑定多个回调函数
             * });
             * ```
             * @method ajaxRequest
             *
             * @param {object} param 请求参数
             *   @param {object|object[]} param.req  请求数据
             *  @param {string} [param.url] 服务器地址，默认是require("consts").AJAX_URL
             *  @param {string} [param.checkSession=true] 是否检查会话，配置false则不检查并且不会传递公共参数到后台
             *  @param {string} [param.noProcess=false] 是否处理返回数据
             *  @param {string} [param.type] 请求类型，post或get，默认是post
             *  @param {string} [param.reqType] 协议类型，xml或json，默认是json
             *  @param {string} [param.timeout] 超时时间
             * @return {object} **[Deferred Object](http://api.jquery.com/category/deferred-object/)**
             */
            ajaxRequest: function(param) {

                if("object" !== $.type(param)) {
                    throw "请求参数不合法，请检查调用参数！";
                }

                var defObj = $.Deferred(),
                    that = this,

                    proxy = $.proxy(function() {
                        that.ajax(that.buildParam(param)).done(function(ansData) {
                            if(param.noProcess) {
                                defObj.resolveWith(this, [ansData]);
                            } else {
                                that.resolveParam(ansData, defObj);
                            }
                            if(that.isSessionTimeout(ansData)){
                            	if(top['SYSTEM']){
                            		top['SYSTEM'].openLoginPage();
                            	} else {
                            		//top.location.replace(consts.LOGIN_PAGE);
                            	}
                            }
                        }).fail(function() {
                            defObj.rejectWith(this, arguments);
                        });
                    });

                param.checkSession = (undefined == param.checkSession ? true : param.checkSession);

                if(param.checkSession) {
                    that.session(true).done(function(data) {
                        if(!that.isSuccess(data)) {
                        	if(top['SYSTEM']){
                        		top['SYSTEM'].openLoginPage();
                        	} else {
                        		//top.location.replace(consts.LOGIN_PAGE);
                        	}
                        	if(top['FIRST_IN_LOGIN_PAGE']){
                        		if(param.noProcess) {
                        			defObj.resolveWith(this, [data]);
                        		} else {
                        			that.resolveParam(data, defObj);
                        		}
                        	}
                        	top['FIRST_IN_LOGIN_PAGE'] = true;
                        } else {
                            proxy();
                        }
                    }).fail(function() {
                        defObj.rejectWith(this, arguments);
                    });
                } else {
                    proxy();
                }

                return defObj.promise();
            },

            /**
             *
             * **获取会话数据接口**
             *
             * @method session
             * @param {boolean} useCache 是否使用缓存
             * @return {object} **[Deferred Object](http://api.jquery.com/category/deferred-object/)**
             */
            session: function(useCache) {
            	var defObj = $.Deferred(),
            		that = this;
            	
                if(useCache && !$.isEmptyObject(loginData)) {
                    defObj.resolveWith(this, [loginData]);
                } else {
                    this.ajax({
                        url: consts.WEB_BASE + consts.SESSION_URL
                    }).success(function(data) {
                        if(that.isSuccess(data)) {
                            loginData = data;
                        }
                        defObj.resolveWith(this, [data]);
                    }).fail(function() {
                        defObj.rejectWith(this, arguments);
                    });
                }
                return defObj.promise();
            },
            
            /***
             * **获取用户信息**
             * @method getUserInfo
             * @return {string} **json格式的请求串**
             */
            getUserInfo: function(){
            	var defObj = $.Deferred(),
            		that = this;
                
                this.session(true).done(function(res) {
                	var userInfo = null;
                	if(that.isSuccess(res)){
                		userInfo = res.rtn.data || null;
        			}
                    defObj.resolveWith(this, [userInfo]);
                }).fail(function() {
                	defObj.resolveWith(this, [null]);
                });
                return defObj.promise();
            },

            /**
             * **组装请求参数方法**
             * @method buildParam
             * @param {object} param 请求参数
             *   @param {object|object[]} param.req  请求数据
             *  @param {string} [param.url] 服务器地址，默认是require("consts").AJAX_URL
             *  @param {string} [param.type] 请求类型，post或get，默认是post
             *  @param {string} [param.reqType] 协议类型，xml或json，默认是json
             *  @param {string} [param.timeout] 超时时间
             * @return {object} ajax调用参数
             */
            buildParam: function(param){
            	
            	if(param.pager) {
            		param.data._pageIndex = param.pager._pageIndex;
            		param.data._pageSize = param.pager._pageSize;
            		param.pager.startLoad && param.pager.startLoad();
                }
                var jsonParam = {
                    url: param.url ? consts.WEB_ROOT + param.url : consts.AJAX_URL,
                    async: true,
                    type: param.type || "POST",
                    dataType: consts.REQ_TYPE_JSON,
                    data: this.makeJsonRequest(param.data),
                    processData: false,
                    timeout : param.timeout || 30000,
                    contentType: "application/x-www-form-urlencoded; charset=utf-8"
                };
                
                if(param.pager){
            		
            		/*if(tempAjaxJson.url == jsonParam.url && tempAjaxJson.data != jsonParam.data && !param.pager_filter){
            			param.pager._pageIndex = 0;
            			param.data._pageIndex = 0;
            			jsonParam.data = this.makeJsonRequest(param.data);
            		}
            		tempAjaxJson = {
            			url: jsonParam.url,
            			data: jsonParam.data
            		};*/
            		
            		param.pager.data = {
        				url: param.url,
        				checkSession: param.checkSession,
        				data: param.data
            		};
            	}
                return jsonParam;
            },

             /**
             * **解析服务器返回结果方法**
             * @method resolveParam
             * @param {object} param 服务器返回结果
             *  @param {array} [param.ANSWERS] 服务器返回结果
             * @param {object} defObj **[Deferred Object](http://api.jquery.com/category/deferred-object/)**
             * @return undefined
             */
            resolveParam: function(ansData, defObj){
                 var answers = ansData.rtn,
                 	state = this.isSuccess(ansData),
                 	msg = ansData && ansData.message;

                 if (!ansData || !answers) {  //触发fail
                     defObj.rejectWith(this, arguments);
                     return;
                 }

                 defObj.resolveWith(this, [ansData, answers, state, msg]); //触发done
            },
            
            /***
             * **生成请求参数json格式**
             * @method makeJsonRequest
             * @param {object} req 请求参数
             * @return {string} **json格式的请求串**
             */
            makeJsonRequest: function(req){
        		req = $.extend(req, this.getReqHead());
            	var data = "jsonValue=" + utils.toJSON(req);
            	return encodeURI(encodeURI(data));
            },

            /***
             * **获取单次ajaxRequest请求调用的公共参数**
             * @method getReqHead
             * @return {object} **公共参数**
             */
            getReqHead: function() {
                return {
                    "USER_ID": loginData.rtn && loginData.rtn.data.rowId,
                    "_APPID": this.getAppId()
                };
            },

            /**
             * **判断请求是否成功**
             * @method isSuccess
             * @param {object} head 请求返回头
             * @return {boolean} **业务执行成功返回true否则返回false**
             */
            isSuccess: function(head) {
                if(head && head["code"]) {
                    return '000000' == head["code"];
                }
                return false;
            },

            /***
             * **判断请求是否会话超时**
             * @method isSessionTimeout
             * @param {object} head 请求返回头
             * @return {boolean} **会话超时返回true否则返回false**
             */
            isSessionTimeout: function(head) {
                if(head && head["code"]) {
                    return '888888' == head["code"];
                }
                return false;
            },

            /***
             * **判断请求是否超时**
             * @method isTimeout
             * @param {object} head 请求返回头
             * @return {boolean} **请求超时返回true否则返回false**
             */
            isTimeout: function(head) {
                if(head && head["code"]) {
                    return "201100" === head["code"];
                }
                return false;
            },
            
            getAppId: function(){
            	var hash = document.location.hash;
    			if(hash && hash.length > 8){
    				return hash.substring(8);
    			}
    			return "";
            }
            
        });
    return ajaxZui;
});