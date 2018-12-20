/**
 * ##lib模块，用于导出框架核心库##
 *
 * 使用方法：
 * ```javascript
 * define(function(require, exports, module) {
 *
 *  //在loader.js中已经把导出的对象暴露在全局环境中，使用核心库不需要单独require
 *
 *  //使用jQuery
 *  $("#id").show();
 *
 *  //使用underscore
 *  _.pick(obj, function() {
 *  //do something else
 *
 * });
 *
 * ```
 * @module lib
 * @author yisin
 */
define(function(require, exports, module) {

    var $ = require("./jquery/jquery-1.8.3"),
        _ = require("./underscore/underscore"),
      tpl = require("./laytpl/1.1/laytpl");
    		require("./jquery/jquery.md5");
    
    return {  //导出核心库
    	
        /**
         * ****[jQuery对象](http://api.jquery.com/)****
         * @type function
         */
        $: $,

        /**
         * ****[jQuery对象](http://api.jquery.com/)****
         * @type function
         */
        jQuery: $,

        /**
         * ****[underscore对象](http://underscorejs.org/)****
         * @type object
         */
        _: _,

        /**
         * ****[underscore对象](http://underscorejs.org/)****
         * @type object
         */
        underscore: _,

        /**
         * ****[laytpl对象](http://laytpl.layui.com/)****
         */
        tpl: tpl
    };
});