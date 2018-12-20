/**
 * ##core模块，用于导出业务核心库##
 *
 * 使用方法：
 * ```javascript
 * define(function(require, exports, module) {
 *
 *  //使用ajax模块
 *  ajax.ajaxRequest();
 *
 *  //使用utils模块
 *  utils.getUrlParam();
 *
 *  //使用dict模块
 *  dict.getDictByKey("USER_TYPE");
 *
 *  //使用consts模块
 *  consts.WEB_BASE;
 *
 *  });
 *
 * });
 * ```
 * @module core
 */
define(function(require, exports, module) {

    require("./core/addons");
    require("./module-loader");
    require("./zui/zui.min.1.5.0");

    return {
        /**
         * ****框架常量模块****
         * @type function
         */
        consts: require("./core/consts"),

        /**
         * ****ajax模块****
         * @type object
         */
        ajax: require("./core/ajax-zui"),

        /**
         * ****dict模块****
         * @type object
         */
        dict: require("./core/dict"),

        /**
         * ****utils模块****
         * @type object
         */
        utils: require("./core/utils"),
        
        /**
         * ****自动解析模块****
         */
        parse: require("./core/parser")
    }
});