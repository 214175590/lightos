/**
 * 格式化shell
 */
define(function(require, exports, module) {
	
	function PageScript(){
		this.host = '';
		this.path = '';
		this.version = '';
		this.verList = [];
	}
	
	PageScript.prototype = {
		
		init: function(){
			var param = utils.getUrlParam();
			if(param && param['s'] && param['p']){
				page.host = param.s;
				page.version = param.v || '';
				page.path = param.p.substring(1);
			}
			
			CodeMirror.commands.autocomplete = function(cm) {
				if(cm.options.mode == 'text/html'){
					cm.showHint({hint: CodeMirror.hint.jshint});
				} else if(cm.options.mode == 'css'){
					cm.showHint({hint: CodeMirror.hint.csshint});
				} else if(cm.options.mode == 'javascript'){
					cm.showHint({hint: CodeMirror.hint.jshint});
				} else if(cm.options.mode == 'clike'){
					cm.showHint({hint: CodeMirror.hint.jshint});
				}
			};
			
			var mode = page.getMode(page.path);
			page.code = CodeMirror.fromTextArea(document.getElementById("code-edit"), {
				lineNumbers: true,
				mode: mode,
				gutters: ["CodeMirror-lint-markers"],
				lint: false, 
				lineWrapping: true,
				theme: "ambiance", 
				autoMatchParens: true,
				extraKeys: {}
			});
			
			var bodyHeight = $(document).height();
			$('.CodeMirror').css('height', (bodyHeight - 42) + 'px');
			$('.CodeMirror .CodeMirror-gutters').css('height', (bodyHeight - 42) + 'px');
			
			$.useModule(['chosen'], function(){
				page.loadVersionHostiry();
			});
			
			page.bindEvent();
		},
		
		getMode: function(p){
			var mode = 'javascript';
			if(p){
				var m = p.match(/\.[a-zA-Z]+$/);
				if(m){
					var a = m[0].substring(1);
					if(a == 'java'){
						mode = 'text/x-java';
					} else if(a == 'js'){
						mode = 'javascript';
					} else if(a == 'css'){
						mode = 'css';
					} else if(a == 'html'){
						mode = 'text/html';
					} else if(a == 'xml'){
						mode = 'text/html';
					} else if(a == 'conf'){
						mode = 'text/x-nginx-conf';
					} else if(a == 'perpreties'){
						mode = 'text/x-properties';
					} else if(a == 'sh'){
						mode = 'text/x-sh';
					}
				}				
			}
			return mode;
		},
		
		loadFileContent: function(){
			if(page.host && page.path){
				ajax.post({
		    		url: "svn/get/file",
		    		data: {path: page.host + page.path, version: page.version},
		    		dataType: 'json',
		    		type: 'post'
		    	}).done(function(res, rtn, state, msg){
		    		if(state){
		    			page.code.setValue(rtn.data);
		    		} else {
		    			error(msg);
		    		}
		    	}).fail(function(){
		    		log.error("失败:", arguments);
		    		error("执行失败");
		    	});
			}			
		},
		
		loadVersionHostiry: function(){
			ajax.post({
	    		url: "svn/get/date",
	    		data: {
	    			path: page.host + page.path
	    		},
	    		dataType: 'json',
	    		type: 'post'
	    	}).done(function(res, rtn, state, msg){
	    		if(state){
	    			page.renderVerHis(rtn.data);
	    		} else {
	    			error(msg);
	    		}
	    	}).fail(function(){
	    		log.error("失败:", arguments);
	    		error("执行失败");
	    	});
		},
		
		renderVerHis: function(datas){
			var html = [];
			if(datas && datas.length){
				var obj = null;
				var split = function(d){
					if(d && d.length > 13){
						return d.substring(0, 13) + '..';
					}
					return d;
				};
				page.verList = [];
				for(var i = 0, k = datas.length; i < k; i++){
					obj = datas[i];
					page.verList.push(obj.version);
					html.push(laytpl('ops.html').render({
						name: obj.version + ' (' + split(obj.desc) + ')',
						value: obj.version,
						desc: obj.desc,
						selected: obj.version == page.version
					}));
				}
			}
			$('#versions').html(html.join('')).chosen({});
			
			page.loadFileContent();
		},
		
		filterChars: function(v){
			v = v.replace(/\+/g, '≡');
			v = v.replace(/\%/g, '∮');
			return v;
		},
		
		getDiff: function(){
			var v1 = $('#versions').val();
			ajax.post({
	    		url: "svn/get/diff",
	    		data: {
	    			path: page.host + page.path, 
	    			version1: (function(){
	    				var v = v1;
	    				var arr = page.verList.sort();
	    				for(var i = arr.length - 1; i >= 0; i--){
	    					if(arr[i] < v1){
	    						v = arr[i];
	    						break;
	    					}
	    				}
	    				return v;
	    			})(), 
	    			version2: v1
	    		},
	    		dataType: 'json',
	    		type: 'post'
	    	}).done(function(res, rtn, state, msg){
	    		if(state){
	    			page.code.setValue(page.parseDiff(rtn.data));
	    		} else {
	    			error("获取数据失败：" + msg);
	    		}
	    	}).fail(function(){
	    		log.error("获取数据失败:", arguments);
	    		error("获取数据失败");
	    	});
		},
		
		parseDiff: function(data){
			var con = [];
			if(data){
				var arr = data.split('\n'), strs = [], as1, as2;
				var line = '';
				for(var i = 0, k = arr.length; i < k; i++){
					line = arr[i];
					if(/^--- /.test(line)){
						con.push(line.replace(/^--- /, '【上个版本】: '));
					} else if(/^\+\+\+ /.test(line)){
						con.push(line.replace(/^\+\+\+ /, '【当前版本】: '));
					} else if(/^-[ ]?/.test(line)){
						con.push(line.replace(/^-[ ]?/, '【上个版本】: '));
					} else if(/^\+[ ]?/.test(line)){
						con.push(line.replace(/^\+[ ]?/, '【当前版本】: '));
					} else if(/^@@[\s\S]+@@/g.test(line)){
						line = line.replace(/^@@ /, '');
						line = line.replace(/ @@$/, '');
						line = line.replace(/[-\+]/g, '');
						strs = line.split(' ');
						as1 = strs[0].split(',');
						as2 = strs[1].split(',');
						con.push(utils.formatByJson("** 上个版本第[{line1}]行开始的[{line2}]行内容与当前版本第[{line3}]行开始的[{line4}]行内容存在差异", {
							line1: as1[0],
							line2: as1[1],
							line3: as2[0],
							line4: as2[1]
						}));
					} else {
						con.push(line);
					}
				}
			}
			return con.join('\n');
		},
		
		bindEvent: function(){
			
			$(window).on('resize', function(){
				var bodyHeight = $(window).height();
				$('.CodeMirror').css('height', (bodyHeight - 30) + 'px');
				$('.CodeMirror .CodeMirror-gutters').css('height', (bodyHeight - 30) + 'px');
			});
			
			$('.btn-new').on('click', function(){
				page.loadFileContent();
			});
			
			$('.btn-diff').on('click', function(){
				page.getDiff();
			});
			
			$('#versions').on('change', function(){
				var $this = $(this),
					v = $this.val();
				if(v){
					page.version = v;
					page.loadFileContent();
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});