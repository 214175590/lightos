/**
 * Sea.js 2.3.0 | seajs.org/LICENSE.md
 */
!(function(global, undefined) {

// Avoid conflicting when `sea.js` is loaded multiple times
    if (global.seajs) {
        return;
    }

    var seajs = global.seajs = {
        // The current version of Sea.js being used
        version: "2.3.0"
    };

    var data = seajs.data = {};

    /**
     * util-lang.js - The minimal language enhancement
     */

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        }
    }

    var isObject = isType("Object");
    var isString = isType("String");
    var isArray = Array.isArray || isType("Array");
    var isFunction = isType("Function");

    var _cid = 0;
    function cid() {
        return _cid++;
    }


    /**
     * util-events.js - The minimal events support
     */

    var events = data.events = {};

// Bind event
    seajs.on = function(name, callback) {
        var list = events[name] || (events[name] = []);
        list.push(callback);
        return seajs;
    };

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
    seajs.off = function(name, callback) {
        // Remove *all* events
        if (!(name || callback)) {
            events = data.events = {};
            return seajs;
        }

        var list = events[name];
        if (list) {
            if (callback) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] === callback) {
                        list.splice(i, 1);
                    }
                }
            }
            else {
                delete events[name];
            }
        }

        return seajs;
    };

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
    var emit = seajs.emit = function(name, data) {
        var list = events[name];
        //var fn;

        if (list) {
            // Copy callback lists to prevent modification
            list = list.slice();

            // Execute event callbacks, use index because it's the faster.
            for(var i = 0, len = list.length; i < len; i++) {
                list[i](data);
            }
        }

        return seajs;
    };


    /**
     * util-path.js - The utilities for operating path such as id, uri
     */

    var DIRNAME_RE = /[^?#]*\//;

    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
    var MULTI_SLASH_RE = /([^:/])\/+\//g;

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
    function dirname(path) {
        return path.match(DIRNAME_RE)[0];
    }

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        /*
         @author wh1100717
         a//b/c ==> a/b/c
         a///b/////c ==> a/b/c
         DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
         */
        path = path.replace(MULTI_SLASH_RE, "$1/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        return path;
    }

// Normalize an id
// normalize("path/to/a") ==> "path/to/a.js"
// NOTICE: substring is faster than negative slice and RegExp
    function normalize(path) {
        var last = path.length - 1;
        var lastC = path.charAt(last);

        // If the uri ends with `#`, just return it without '#'
        if (lastC === "#") {
            return path.substring(0, last);
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 ||
            lastC === "/") ? path : path + ".js"
    }


    var PATHS_RE = /^([^/:]+)(\/.+)$/;
    var VARS_RE = /{([^{]+)}/g;

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id;
    }

    function parsePaths(id) {
        var paths = data.paths;
        var m;

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2];
        }

        return id;
    }

    function parseVars(id) {
        var vars = data.vars;

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m;
            })
        }

        return id;
    }

    function parseMap(uri) {
        var map = data.map;
        var ret = uri;

        if (map) {
            for (var i = 0, len = map.length; i < len; i++) {
                var rule = map[i];

                ret = isFunction(rule) ?
                    (rule(uri) || uri) :
                    uri.replace(rule[0], rule[1]);

                // Only apply the first matched rule
                if (ret !== uri) break;
            }
        }

        return ret;
    }


    var ABSOLUTE_RE = /^\/\/.|:\//;
    var ROOT_DIR_RE = /^.*?\/\/.*?\//;

    function addBase(id, refUri) {
        var ret;
        var first = id.charAt(0);

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id
        }
        // Relative
        else if (first === ".") {
            ret = realpath((refUri ? dirname(refUri) : data.cwd) + id);
        }
        // Root
        else if (first === "/") {
            var m = data.cwd.match(ROOT_DIR_RE);
            ret = m ? m[0] + id.substring(1) : id
        }
        // Top-level
        else {
            ret = data.base + id;
        }

        // Add default protocol when uri begins with "//"
        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret;
        }

        return ret;
    }

    function id2Uri(id, refUri) {
        if (!id) return "";

        id = parseAlias(id);
        id = parsePaths(id);
        id = parseVars(id);
        id = normalize(id);

        var uri = addBase(id, refUri);
        uri = parseMap(uri);

        return uri;
    }


    var doc = document;
    var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href);
    var scripts = doc.scripts;

// Recommend to add `seajsnode` id for the `sea.js` script element
    var loaderScript = doc.getElementById("seajsnode") ||
        scripts[scripts.length - 1];

// When `sea.js` is inline, set loaderDir to current working directory
    var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd);

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }


// For Developers
    seajs.resolve = id2Uri;

    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
    var baseElement = head.getElementsByTagName("base")[0];

    var currentlyAddingScript;
    var interactiveScript;

    function request(url, callback, charset) {
        var node = doc.createElement("script");

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        addOnload(node, callback, url);

        node.async = true;
        node.src = url;

        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = node;

        // ref: #185 & http://dev.jquery.com/ticket/2709
        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);

        currentlyAddingScript = null;
    }

    function addOnload(node, callback, url) {
        var supportOnload = "onload" in node;

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function() {
                emit("error", { uri: url, node: node });
                onload();
            }
        }
        else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            }
        }

        function onload() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            // Remove the script to reduce memory leak
            if (!data.debug) {
                head.removeChild(node);
            }

            // Dereference the node
            node = null;

            callback();
        }
    }

    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript;
        }

        var scripts = head.getElementsByTagName("script");

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    }


// For Developers
    seajs.request = request;

    /**
     * util-deps.js - The parser for dependencies
     * ref: tests/research/parse-dependencies/test.html
     */

    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    var SLASH_RE = /\\\\/g;

    function parseDependencies(code) {
        var ret = [];

        code.replace(SLASH_RE, "")
            .replace(REQUIRE_RE, function(m, m1, m2) {
                if (m2) {
                    ret.push(m2)
                }
            });

        return ret;
    }


    /**
     * module.js - The core of module loader
     */

    var cachedMods = seajs.cache = {};
    var anonymousMeta;

    var fetchingList = {};
    var fetchedList = {};
    var callbackList = {};

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6
    };


    function Module(uri, deps) {
        this.uri = uri;
        this.dependencies = deps || [];
        this.exports = null;
        this.status = 0;

        // Who depends on me
        this._waitings = {};

        // The number of unloaded dependencies
        this._remain = 0;
    }

// Resolve module.dependencies
    Module.prototype.resolve = function() {
        var mod = this;
        var ids = mod.dependencies;
        var uris = [];

        for (var i = 0, len = ids.length; i < len; i++) {
            uris[i] = Module.resolve(ids[i], mod.uri);
        }
        return uris;
    };

// Load module.dependencies and fire onload when all done
    Module.prototype.load = function() {
        var mod = this;

        // If the module is being loaded, just wait it onload call
        if (mod.status >= STATUS.LOADING) {
            return;
        }

        mod.status = STATUS.LOADING;

        // Emit `load` event for plugins such as combo plugin
        var uris = mod.resolve();
        emit("load", uris);

        var len = mod._remain = uris.length;
        var m;

        // Initialize modules and register waitings
        for (var i = 0; i < len; i++) {
            m = Module.get(uris[i]);

            if (m.status < STATUS.LOADED) {
                // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
                m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1;
            }
            else {
                mod._remain--;
            }
        }

        if (mod._remain === 0) {
            mod.onload();
            return;
        }

        // Begin parallel loading
        var requestCache = {};

        for (i = 0; i < len; i++) {
            m = cachedMods[uris[i]];

            if (m.status < STATUS.FETCHING) {
                m.fetch(requestCache);
            }
            else if (m.status === STATUS.SAVED) {
                m.load();
            }
        }

        // Send all requests at last to avoid cache bug in IE6-9. Issues#808
        for (var requestUri in requestCache) {
            if (requestCache.hasOwnProperty(requestUri)) {
                requestCache[requestUri]()
            }
        }
    };

// Call this method when module is loaded
    Module.prototype.onload = function() {
        var mod = this;
        mod.status = STATUS.LOADED;

        if (mod.callback) {
            mod.callback();
        }

        // Notify waiting modules to fire onload
        var waitings = mod._waitings;
        var uri, m;

        for (uri in waitings) {
            if (waitings.hasOwnProperty(uri)) {
                m = cachedMods[uri];
                m._remain -= waitings[uri];
                if (m._remain === 0) {
                    m.onload()
                }
            }
        }

        // Reduce memory taken
        delete mod._waitings;
        delete mod._remain
    };

// Fetch a module
    Module.prototype.fetch = function(requestCache) {
        var mod = this;
        var uri = mod.uri;

        mod.status = STATUS.FETCHING;

        // Emit `fetch` event for plugins such as combo plugin
        var emitData = { uri: uri };
        emit("fetch", emitData);
        var requestUri = emitData.requestUri || uri;

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList[requestUri]) {
            mod.load();
            return
        }

        if (fetchingList[requestUri]) {
            callbackList[requestUri].push(mod);
            return
        }

        fetchingList[requestUri] = true;
        callbackList[requestUri] = [mod];

        // Emit `request` event for plugins such as text plugin
        emit("request", emitData = {
            uri: uri,
            requestUri: requestUri,
            onRequest: onRequest,
            charset: data.charset
        });

        if (!emitData.requested) {
            requestCache ?
                requestCache[emitData.requestUri] = sendRequest :
                sendRequest();
        }

        function sendRequest() {
            seajs.request(emitData.requestUri, emitData.onRequest, emitData.charset);
        }

        function onRequest() {
            delete fetchingList[requestUri];
            fetchedList[requestUri] = true;

            // Save meta data of anonymous module
            if (anonymousMeta) {
                Module.save(uri, anonymousMeta);
                anonymousMeta = null;
            }

            // Call callbacks
            var m, mods = callbackList[requestUri];
            delete callbackList[requestUri];
            while ((m = mods.shift())) m.load()
        }
    };

// Execute a module
    Module.prototype.exec = function () {
        var mod = this;

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports;
        }

        mod.status = STATUS.EXECUTING;

        // Create require
        var uri = mod.uri;

        function require(id) {
            return Module.get(require.resolve(id)).exec()
        }

        require.resolve = function(id) {
            return Module.resolve(id, uri)
        };

        require.async = function(ids, callback) {
            Module.use(ids, callback, uri + "_async_" + cid())
            return require
        }

        // Exec factory
        var factory = mod.factory

        var exports = isFunction(factory) ?
            factory(require, mod.exports = {}, mod) :
            factory;

        if (exports === undefined) {
            exports = mod.exports
        }

        // Reduce memory leak
        delete mod.factory;

        mod.exports = exports;
        mod.status = STATUS.EXECUTED;

        // Emit `exec` event
        emit("exec", mod);

        return exports;
    };

// Resolve id to uri
    Module.resolve = function(id, refUri) {
        // Emit `resolve` event for plugins such as text plugin
        var emitData = { id: id, refUri: refUri };
        emit("resolve", emitData);

        return emitData.uri || seajs.resolve(emitData.id, refUri);
    };

// Define a module
    Module.define = function (id, deps, factory) {
        var argsLen = arguments.length;

        // define(factory)
        if (argsLen === 1) {
            factory = id;
            id = undefined
        }
        else if (argsLen === 2) {
            factory = deps;

            // define(deps, factory)
            if (isArray(id)) {
                deps = id;
                id = undefined
            }
            // define(id, factory)
            else {
                deps = undefined
            }
        }

        // Parse dependencies according to the module factory code
        if (!isArray(deps) && isFunction(factory)) {
            deps = parseDependencies(factory.toString())
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        };

        // Try to derive uri in IE6-9 for anonymous modules
        if (!meta.uri && doc.attachEvent) {
            var script = getCurrentScript();

            if (script) {
                meta.uri = script.src
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        // Emit `define` event, used in nocache plugin, seajs node version etc
        emit("define", meta);

        meta.uri ? Module.save(meta.uri, meta) :
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta
    };

// Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri);

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri;
            mod.dependencies = meta.deps || [];
            mod.factory = meta.factory;
            mod.status = STATUS.SAVED;

            emit("save", mod)
        }
    };

// Get an existed module or create a new one
    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
    };

// Use function is equal to load a anonymous module
    Module.use = function (ids, callback, uri) {
        var mod = Module.get(uri, isArray(ids) ? ids : [ids]);

        mod.callback = function() {
            var exports = [];
            var uris = mod.resolve();

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exec()
            }

            if (callback) {
                callback.apply(global, exports)
            }

            delete mod.callback
        };

        mod.load()
    };


// Public API

    seajs.use = function(ids, callback) {
        Module.use(ids, callback, data.cwd + "_use_" + cid());
        return seajs
    };

    Module.define.cmd = {};
    global.define = Module.define;


// For Developers

    seajs.Module = Module;
    data.fetchedList = fetchedList;
    data.cid = cid;

    seajs.require = function(id) {
        var mod = Module.get(Module.resolve(id));
        if (mod.status < STATUS.EXECUTING) {
            mod.onload();
            mod.exec()
        }
        return mod.exports
    };


    /**
     * config.js - The configuration for the loader
     */

// The root path to use for id2uri parsing
    data.base = loaderDir;
    
 // The root path to use for id2uri parsing
    data.root = (function(){
    	var root = "/", 
    		str = loaderDir;
    	if(str && str.length > 1){
    		str += /[/]$/.test(str) ? "" : "/";
    		var index = str.indexOf('//');
    		if(index != -1){
    			str = str.substring(index + 2),
    			index = str.indexOf('/');
        		if(index != -1){
        			root = index == str.length - 1 ? str.substring(index) : str.substring(index, str.indexOf("/", index + 1));
        		}
    		} else {
				index = str.indexOf('/');
        		if(index != -1){
        			root = index == str.length - 1 ? str.substring(index) : str.substring(index, str.indexOf("/", index + 1));
        		}
    		}    		
    	}
    	if(root != '/' && !/[/]$/.test(root)){
    		root += "/";
    	}
    	return root;
    })();

// The loader directory
    data.dir = loaderDir;

// The current working directory
    data.cwd = cwd;

// The charset for requesting files
    data.charset = "utf-8";

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

    seajs.config = function(configData) {

        for (var key in configData) {
            var curr = configData[key];
            var prev = data[key];

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k]
                }
            }
            else {
                // Concat array config such as map
                if (isArray(prev)) {
                    curr = prev.concat(curr)
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    // Make sure end with "/"
                    if (curr.slice(-1) !== "/") {
                        curr += "/"
                    }
                    curr = addBase(curr)
                }

                // Set config
                data[key] = curr
            }
        }

        emit("config", configData);
        return seajs
    }

})(this);

/**
 * seajs配置，方法扩展，页面入口模块加载
 * @author yisin
 */
!(function(global, undefined) {
	
	// 增加对浏览器的判断，低于IE9的浏览器都不允许访问
	var agent = navigator && navigator.userAgent;
	if(agent){
		var ies = agent.split('; ')[1];
		if(ies && ies.indexOf("MSIE") != -1){
			var v = ies.substring(5);
			if(Number(v) < 9){
				document.write("<center><h1>浏览器版本过低，请更换浏览器</h1><p>建议使用：谷歌浏览器、火狐浏览器、IE9及以上版本浏览器、360浏览器、QQ浏览器、搜狗浏览器等等</p></center>");
				return;
			}
		}
	}
	
    var use = seajs.use,

        localeConf = {
            "en": "lib/i18n/en",
            "zh_CN": "lib/i18n/zh_CN"
        },

        bootstrapThemeConf = {
        	"zui": "lib/zui/zui.min.1.5.0.css#",
            "default": "lib/zui/zui-theme-default.css#",
            "bluegrey": "lib/zui/zui-theme-bluegrey.css#",
            "blue": "lib/zui/zui-theme-blue.css#",
            "red": "lib/zui/zui-theme-red.css#",
            "green": "lib/zui/zui-theme-green.css#",
            "brown": "lib/zui/zui-theme-brown.css#",
            "indigo": "lib/zui/zui-theme-indigo.css#",
            "yellow": "lib/zui/zui-theme-yellow.css#",
            "purple": "lib/zui/zui-theme-purple.css#",
            "black": "lib/zui/zui-theme-black.css#"
        },

        loaderScript = document.getElementById("seajsnode") || document.scripts[document.scripts.length - 1],

        main = loaderScript.getAttribute("data-js"),  //入口模块JS配置
        mainCss = loaderScript.getAttribute("data-css"),  //入口模块CSS配置
        zuiTheme = loaderScript.getAttribute("data-theme") || "default",//主题

        locale = getUrlParam("locale"), //语言类型
        isDebug = "true" === getUrlParam("debug"),  //是否开启调试模式

        link, head;

    //seajs.use = null;   //禁止外部程序使用seajs.use
    gExpose("resolve", seajs.resolve);
    
    seajs.getCookie = function(name) {
    	var arr, reg= new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    	if(arr = document.cookie.match(reg)){
    		return unescape(arr[2]);
    	} else {
    		return null;
    	}
    }

    if(window.localStorage){
    	zuiTheme = localStorage.getItem('theme') || zuiTheme;
    } else if(seajs.getCookie('theme')){
    	zuiTheme = seajs.getCookie('theme') || zuiTheme;
    }

    //定义ZUI全局对象
    gExpose("zui", {
        name: "zui",
        version: "1.5",
        theme: bootstrapThemeConf[(zuiTheme ? zuiTheme : "default")],
        locale: (locale = locale && localeConf[locale] ? locale : "zh_CN")
    });

    //加载UI框架样式
    head = document.head || document.getElementsByTagName("head")[0];
    link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", resolve(bootstrapThemeConf[zuiTheme]));
    head.insertBefore(link, head.firstChild);
    
    link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", resolve(bootstrapThemeConf["zui"]));
    head.insertBefore(link, head.firstChild);
    
    if(mainCss){
    	link = document.createElement("link");
    	link.setAttribute("rel", "stylesheet");
    	link.setAttribute("href", resolve(mainCss + "#"));
    	head.appendChild(link);
    }
    

    //配置seajs
    seajs.config({
        "alias": (function() {
            var retObj = {
                "lib": "lib/lib",
                "core": "lib/core",
                "log4javascript": "lib/log4javascript/log4javascript"
            };

            for(var k in localeConf) {
                retObj[k] = localeConf[k];
            }
            return retObj;
        })()
    });

    //加载核心库，加载业务框架库
    use(["lib", "core"], function(lib, core) {
        //暴露核心库到全局环境
        gExpose("$", lib.$, "jQuery");
        gExpose("_", lib._, "underscore");
        gExpose("tpl", lib.tpl, "laytpl");

        //暴露业务框架库到全局环境
        gExpose("consts", core.consts);
        gExpose("ajax",  core.ajax);
        gExpose("dict", core.dict);
        gExpose("utils", core.utils);
        gExpose("right", core.right);

        //装载log插件
        loadLogger(isDebug, function() {
            //装载UI插件
            loadUIPlugins(locale, function() {
                $(function() {
                    use(main, function(obj) {
                                                
                    });
                    
                    var firstKey = {
                    	code: 0,
                    	time: 0
                    };
                    var FuncKey = {
                    	"Shift": 'shiftKey',
                    	"Control": 'ctrlKey',
                    	"Alt": 'altKey',
                    	"Meta": 'metaKey'
                    }
                    function getFuncKey(e){
                    	var fkey = "";
                    	for(var key in FuncKey){
                    		if(e[FuncKey[key]] === true){
                    			fkey = key;
                    			break;
                    		}
                    	}
                    	return fkey;
                    }
                    // 快捷键处理，8=回退键,116=F5键
                    $(document).bind("keydown", function(e) {
                    	var hurl = "" + document.location.href;
                    	var key = "" + (e.keyCode || e.which);
                    	if("8" == key && e.target.tagName.toLowerCase() === "body") {
                            e.preventDefault();
                        }
                    }).bind("keyup", function(e) {
                    	var kcode = "" + (e.keyCode || e.which),
                    		fkey = getFuncKey(e);
                    	if(fkey !== e.key){
                    		var newTime = new Date().getTime(),
                    			time = newTime - firstKey.time,
                    			ackey = kcode,
                    			hash = $.md5(document.location.href);
                    		if(time < 300){
                    			ackey = fkey + firstKey.code + kcode;
                    		} else if(fkey !== ""){
                    			ackey = fkey + kcode;
                    		}
                    		if("8" != kcode && window.hasShortKey && window.hasShortKey(ackey, hash)){
                    			window.callShortKey(e, ackey, hash);
                            	e.preventDefault();
                            }
                    		firstKey = {
                            	code: kcode,
                            	time: newTime
                            };
                    	}
                    });
                });
            });
        });
    });

    //将对象暴露在全局环境，可指定名称和别名
    function gExpose(name, obj, alias) {
        global[name] = obj;

        if("string" === typeof alias) {
            global[alias] = obj;
        }
    }

    //log插件加载方法
    function loadLogger(debug, success) {
        success = $.isFunction(success) ? success : $.noop;

        if(debug) {   //开启了debug模式，引入log4javascript覆盖console对象
            use("log4javascript", function(log4javascript) {
                gExpose("console", log4javascript.getDefaultLogger(), "log");
                success.call(this);
            });
        } else {
            //使用默认的console对象，不存在则使用空实现
        	var conx = {
                log: $.noop,
                trace: $.noop,
                debug: $.noop,
                info: $.noop,
                warn: $.noop,
                error: $.noop,
                fatal: $.noop
            };
            gExpose("console", global.console || conx, 'log');
            //gExpose("console", conx, 'log');
            success.call(this);
        }
    }

    //装载UI组件
    function loadUIPlugins(locale, success) {

        if($.isFunction(success)) {
            success.apply(this, arguments);
        }
    }

    //获取url参数
    function getUrlParam(param) {
        var reg = new RegExp("(" + param + ")=([^&#]*)", "g"),
            matched = location.href.match(reg);

        return matched && matched[0] ? matched[0].replace(param + "=", "") : null;
    }

})(this);