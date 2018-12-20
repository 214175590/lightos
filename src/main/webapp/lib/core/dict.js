/**
 * ##dict模块##
 * @module core/dict
 * @author yisin
 */
define(function(require, exports, module){
    var dataDict = {};

    return {
        /**
         * **根据数据字典key 获取对应的数据字典项**
         *
         * 使用方法：
         * ```javascript
         * require("dict").getDictByKey("INPUT_TYPE").done(function() {
         *  console.log("done");    //绑定执行成功的回调函数，支持多次调用done绑定多个回调函数
         * }).fail(function() {
         *  console.log("fail");    //绑定执行失败的回调函数，支持多次调用fail绑定多个回调函数
         * }).always(function() {
         *  console.log("complete");    //绑定执行完成的回调函数，支持多次调用always绑定多个回调函数
         * });
         * ```
         * @method getDictByKey
         * @param {string} key 数据字典的key
         * @param {string} url 数据字典接口的url(非必填)
         * @return {Object} **[Deferred Object](http://api.jquery.com/category/deferred-object/)**
         */
        getDictByKey: function(key,url){
            var dtd = $.Deferred(); //在函数内部，新建一个Deferred对象

            url = url ? url : consts.CACHE_URL +"?cacheType=dictCache&keyCode=";
            if(dataDict[key]){
                dtd.resolve(dataDict[key]); // 改变Deferred对象的执行状态
            }else{
                ajax.get({
                    url: url + key,
                    dataType: "json"
                }).done(function(data){
                    if(data[key]){
                        dataDict = $.extend(dataDict,data);
                        dtd.resolve(data[key]);    //改变Deferred对象的执行状态
                    }else{
                        dtd.resolve();    //改变Deferred对象的执行状态
                    }
                }).fail(function() {
                    dtd.rejectWith(this, arguments);
                });
            }
            return dtd.promise(); // 返回promise对象
        },
        /**
         * **批量获取数据字典**
         *
         * 使用方法：
         * ```javascript
         * require("dict").getBatchDictByKeys("INPUT_TYPE,VAL_TYPE,CONT_TYPE").done(function() {
         *  console.log("done");    //绑定执行成功的回调函数，支持多次调用done绑定多个回调函数
         * }).fail(function() {
         *  console.log("fail");    //绑定执行失败的回调函数，支持多次调用fail绑定多个回调函数
         * }).always(function() {
         *  console.log("complete");    //绑定执行完成的回调函数，支持多次调用always绑定多个回调函数
         * });
         * ```
         * @method getBatchDictByKeys
         * @param {string} keys 数据字典key 多个字典key用逗号分隔
         * @param {string} url 数据字典接口的url(非必填)
         * @return {Object} **[Deferred Object](http://api.jquery.com/category/deferred-object/)**
         */
        getBatchDictByKeys: function(keys,url){
            var dtd = $.Deferred(), //在函数内部，新建一个Deferred对象
                arrKey = keys.split(/[,]/),
                strKeys = "",
                key,
                objDict = {};

            url = url ? url : consts.CACHE_URL +"?cacheType=dictCache&keyCode=";
            //过滤掉当前页面缓存的数据字典
            while(arrKey.length > 0){
                key = arrKey.shift();
                if(dataDict[key]){
                    objDict[key] = dataDict[key];
                }else{
                    strKeys += (strKeys.length > 0) ? ("," + key) : key;
                }
            }
            if(0 === strKeys.length){
                dtd.resolve(objDict); // 改变Deferred对象的执行状态
            }else{
                ajax.get({
                    type: "get",
                    url: url + strKeys,
                    dataType: "json"
                }).done(function(data){
                    objDict = $.extend({},objDict,data);
                    dataDict = $.extend({},dataDict,objDict);
                    dtd.resolve(objDict);    //改变Deferred对象的执行状态
                }).fail(function() {
                    dtd.rejectWith(this, arguments);
                });
            }
            return dtd.promise(); // 返回promise对象
        },

        /**
         * **ajax同步调用，获取到字典数据**
         *
         * @method requestDict
         * @param {string} dictCode 数据字典的key
         * @return {Array} 字典数据
         */
        requestDict : function(dictCode){
            if(!dictCode) return null;
            var dicts = [];
            ajax.ajax({
                async:false,
                url:"../../../kjdp_cache?cacheType=dictCache&keyCode="+dictCode,
                noProcess:true,
                success:function(data){
                    var ret = data[dictCode];
                    for (var i = 0;ret && i < ret.length; i++) {
                        dicts.push({"dict_val":ret[i]["DICT_ITEM"],"dict_des":ret[i]["DICT_ITEM_NAME"],"dict_org":ret[i]["INT_ORG"]});
                    }
                }
            });
            return dicts;
        },

        /**
         * ** 根据获取字典项的val获取对应的文本，当val为undefine时获取字典数据
         * @method getSysDict
         * @param {string} dictCode 数据字典的key
         * @param {string} val 数据字典项的key
         * @return {Array|String} 数组为数据字典集合，当val有有效时为对应的文本数据
         */
        getSysDict : function(dictCode, val) {
            var dictCodeName = dictCode;
            var rexp = "";
            var comString = "";
            if(dictCode.indexOf('[')>-1){
                dictCodeName = dictCode.substring(0, dictCode.indexOf("["))
                rexp = dictCode.substring(dictCode.indexOf("[")+1,dictCode.indexOf("]"));
                if(rexp.substr(0,1) == "!"){
                    comString = rexp.substr(1);
                }else{
                    comString = rexp;
                }
            }
            try{
                window.g_dicts = top.window.g_dicts||{};
            }catch(e){}
            var dicts;
            if(window.g_dicts[dictCodeName]){
                dicts = window.g_dicts[dictCodeName];
            }else{
                dicts = dict.requestDict(dictCodeName);
                window.g_dicts[dictCodeName] = dicts;
                try{
                    top.window.g_dicts = top.window.g_dicts || {};
                    $.extend(top.window.g_dicts,window.g_dicts);
                }catch(e){}
            }
            if(!val){
                if(rexp != ""){
                    var finaldicts = new Array();
                    for (var i = 0; i < dicts.length; i++) {
                        if(rexp.substr(0,1) == "!"){
                            if(dicts[i]['dict_val'].substr(0,comString.length)!=comString){
                                finaldicts.push(dicts[i]);
                            }
                        }else{
                            if(dicts[i]['dict_val'].substr(0,comString.length)==comString){
                                finaldicts.push(dicts[i]);
                            }
                        }
                    }
                    dicts = finaldicts;
                }

                return dicts;
            }
            if (dicts) {
                for (var i = 0; i < dicts.length; i++) {
                    if (dicts[i]['dict_val'] == val) {
                        return dicts[i]['dict_des'];
                    }
                }
            }
            return val;
        }
    };
});