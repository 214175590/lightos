/**
 * 
 */
define(function(require, exports, module) {
	var zTree, callDatas = [], selectNode, jarName;
	var fillterNodes = {
		word: '',
		nodes: [],
		index: 0
	};
	function PageScript(){
		this.$obj = {};
		this.runInter = 0;
		this.runFlag = false;
		this.runObjects = [];
		this.jarMethodParams = {};
		this.callDatas = {};
		this.allMethods = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$.useModule(['chosen', 'ztree', 'uploadify'], function(){
				
				page.initUploader();
				
				page.loadClients();
			});
			
			page.bindEvent();
		},
		
		initUploader: function(){
			$('#uploader').uploadify({
                width: 110,
                height: 35,
                multi: false,
                fileSizeLimit: '2MB',
                buttonText: '上传Jar文件',
                fileTypeExts: '*.jar',
                buttonClass: 'btn btn-primary btn-upload',
                uploadUrl: consts.WEB_BASE + 'dubbo/upload'
	         }).on("uploadSuccess", function(e, file, result){
	                //成功提交至服务端后的事件
	                console.log("uploadSuccess", file, result);
	                page.loadClients();
	         }).on("openDialog", function(e){
	                //打开选择文件框事件
	        }).on("closeDialog", function(e, file){
	                //选择文件后关闭选择框事件
	                console.log("closeDialog", file);
	        }).on("initComplete", function(e){
	                //初始化组件后的事件
	                console.log("上传组件初始化完成...");
	        }).on("progress", function(e, value){
	                //得到上传的进度，value为百分比值
	                console.log("progress", e, value);
	        }).on("error", function(e, s){
	                //反馈错误信息描述的事件
	               console.error("error", arguments);
	        }).on('timeout', function(e){
	                console.error("timeout", e);
	        });
		},
		
		loadClients: function(){
			var zuiLoad = waiting('Dubbo客户端Jar列表加载中...');
			ajax.post({
				url: 'dubbo/all',
				data: {
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showResult(rtn.data);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('Dubbo客户端Jar列表获取失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showResult: function(data){
			var html = [];
			for(var i = 0, k = data.length; i < k; i++){
				html.push(laytpl('item.html').render({
					id: data[i].jarName.replace(/\./g, '_'),
					name: data[i].jarName,
					path: data[i].jarPath,
					loaded: data[i].loaded
				}));
			}
			$('.lists').html(html.join(''));
			page.loadServerList();
		},
		
		loadServerList: function(){
			var zuiLoad = waiting('Zookeeper服务列表加载中...');
			ajax.post({
				url: 'zk/all',
				data: {
					_pageIndex: 0,
					_pageSize: 10000
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.numberOfElements){
					var obj = {}, html = [];
					for(var i = 0; i < rtn.numberOfElements; i++){
						obj = rtn.content[i];
						html.push(laytpl('option.html').render({
							name: utils.format("{0}:{1}{2}", obj.ip, obj.port, obj.serverStatusEnum == 'ONLINE' ? "" : '(未运行)'),
							value: obj.ip + ":" + obj.port
						}));
					}
					$('.servers').html(laytpl('select.html').render({
						option: html.join('')
					}));
					setTimeout(function(){
						$('#address').chosen({
						    no_results_text: '没有找到',    // 当检索时没有找到匹配项时显示的提示文本
						    disable_search_threshold: 10, // 10 个以下的选择项则不显示检索框
						    search_contains: true         // 从任意位置开始检索
						});
					}, 50);
				} else {
					error("Zookeeper服务列表加载失败:" + msg);
				}
			}).fail(function(){
				error("Zookeeper服务列表加载失败");
				log.error('error：', arguments);
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		loadJarClass: function(name){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'dubbo/get/class',
				data: {
					jarName: name
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showClassList(name, rtn.data);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('获取类/接口/方法数据失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showClassList: function(name, data){
			page.callDatas[jarName] = data;
			var nodes = [{
				"id" : "/",
				"pId" : null,
				"name" : name,
				"open" : true,
				"checked" : false,
				"isParent" : true,
				"leafNode" : false
			}];
			var p = {}, m = {};
			page.allMethods[jarName] = [];
			for(var i = 0, k = data.length; i < k; i++){
				p = data[i];
				nodes.push({
					"id" : p.classPackage,
					"pId" : "/",
					"name" : p.classPackage,
					"open" : false,
					"checked" : false,
					"isParent" : true,
					"leafNode" : false
				});
				for(var j = 0, l = p.method.length; j < l; j++){
					m = p.method[j];
					nodes.push({
						"id" : p.className + '/' + m.methodName,
						"pId" : p.classPackage,
						"name" : m.methodName + page.getMethodTypes(m),
						"open" : false,
						"checked" : false,
						"isParent" : false,
						"leafNode" : true
					});
					page.allMethods[jarName].push({
						interfaceName: p.classPackage,
						method: m.methodName,
						paramType: m.paramType[0],
						param: "",
						result: "",
					});
				}
			}
			var setting = {
				check: { enable: false },
				data: { simpleData: { enable: true } },
				callback: {
					onClick: function(event, treeId, treeNode, clickFlag){
						if(clickFlag == 1){
							selectNode = treeNode;
							var name = selectNode.name;
							if(selectNode.isParent){
								$('.jar-call').removeClass('hidden');
								$('.method-call,.btn-export-all').addClass('hidden');
								// 类方法
								var arr = [];
								for(var i = 0, k = page.callDatas[jarName].length; i < k; i++){
									p = page.callDatas[jarName][i];
									if(/.jar$/g.test(name) || p.classPackage == name){
										for(var j = 0, l = p.method.length; j < l; j++){
											m = p.method[j];
											arr.push(laytpl('method.html').render({
												id: p.classPackage + '.' + m.methodName,
												interfaceName: p.classPackage,
												method: m.methodName,
												paramType: m.paramType
											}));
										}
									}
									$('.param1').html(arr.join(''));
								}
							} else {
								$('.jar-call').addClass('hidden');
								$('.method-call').removeClass('hidden');
								var method = selectNode.name;
								method = method.substring(0, method.indexOf('('));
								page.getReqParam($('#address').val(), selectNode.pId, method);
							}
						}
					}
				}
			};
			zTree = $.fn.zTree.init($('.ztree'), setting, nodes);
		},
		
		getMethodTypes: function(obj){
			var res = '(', arr = [];
			if(obj.paramType && obj.paramType.length){
				for(var i = 0, k = obj.paramType.length; i < k; i++){
					arr.push(obj.paramType[i]);
				}
				if(arr.length){
					res += arr.join(', ');
				}
			}
			return res + ")";
		},
		
		getReqParam: function(address, interfaceName, method){
			var zuiLoad = waiting('参数加载中...');
			ajax.post({
				url: 'dubbo/get/param',
				data: {
					address: address,
					interfaceName: interfaceName,
					method: method
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					$('.param2').val(rtn.data.param || "");
					var data = rtn.data.result || "";
					if(data){
						$('.result2').val(page.parseStrToFormatJson(data));
					} else {
						$('.result2').val('');
					}
				} else {
					$('.param2').val("");
					$('.result2').val("");
				}
			}).fail(function(){
				error('参数加载失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		callMethod: function(address, obj){
			var zuiLoad = waiting('方法调用中...');
			ajax.post({
				url: 'dubbo/test/single',
				data: {
					jarName: jarName,
					address: address,
					interfaceName: obj.interfaceName,
					paramType: obj.paramType,
					method: obj.method,
					param: obj.param
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showResult2(rtn.data);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('方法调用失败');
			}).always(function(){
				zuiLoad.hide();
				$('.btn-run').attr('disabled', false);
			});
		},
		
		showResult2: function(data){
			if(data){
				if(!_.isObject(data)){
					data = JSON.parse(data);
				}
				$('.result2').val(JSON.stringify(data, null, 4));
			}
		},
		
		getFilterNode: function(nodes, word){
			var node;
			for(var i = 0, k = nodes.length; i < k; i++){
				node = nodes[i];				
				if(node.name.indexOf(word) != -1){
					fillterNodes.nodes.push(node);
				} else if(node.children){
					page.getFilterNode(node.children, word);
				}
			}
		},
		
		getAllParam: function(address, list, func){
			var paramArr = page.jarMethodParams[jarName];
			if(!paramArr){
				ajax.post({
					url: 'dubbo/all/param',
					data: {
						address: address,
						list: list
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						page.jarMethodParams[jarName] = rtn.data;
						func && func(rtn.data);
					} else {
						error(msg);
					}
				}).fail(function(a, e){
					error('系统异常，执行失败');
					log.error('系统异常，执行失败', a, e);
				});
			} else {
				func && func(paramArr);
			}
		},
		
		runPatchStart: function(address, array){
			if(array.length){
				page.runObjects = array;
				if(page.runInter){
					clearInterval(page.runInter);
				}
				page.runFlag = false;
				var zuiLoad = waiting('批量执行中...');
				$('.result1').val('');
				$('.btn-export-all').addClass('hidden');
				$('.lineitem').removeClass('success').removeClass('failed').removeClass('error');
				var getSize = function(){
					var index = 0;
					for(var i = 0, k = page.runObjects.length; i < k; i++){
						if(page.runObjects[i].status){
							index++;
						}
					}
					return page.runObjects.length - index;
				}
				page.runInter = setInterval(function(){
					if(!page.runFlag){
						if(getSize() == 0){
							zuiLoad.hide();
							$('.btn-export-all').removeClass('hidden');
							clearInterval(page.runInter);
							return;
						}
						var obj = page.getMatchObj();
						obj = page.formatParam(obj);
						page.runFlag = true;
						page.runPatch(address, obj);
					}
				}, 100);
			}
		},
		
		getMatchObj: function(ai, am){
			if(ai && am){
				var paramArr = page.jarMethodParams[jarName];
				if(paramArr){
					for(var i = 0, k = paramArr.length; i < k; i++){
						if(ai && am && ai == paramArr[i].interfaceName && am == paramArr[i].method){
							return paramArr[i];
						}
					}
				}
			} else {
				for(var i = 0, k = page.runObjects.length; i < k; i++){
					if(!page.runObjects[i].status){
						return page.runObjects[i];
					}
				}
			}
		},
		
		formatParam: function(obj){
			var param = obj.param;
			if(param){
				var group = param.match(/@\{(.+?)\}/g);
				if(group){
					var str = '', d, r, e, t, u, m, n, p;
					for(var i = 0, k = group.length; i < k; i++){
						str = group[i].substring(2, group[i].length - 1);
						if(/^date:/g.test(str)){
							d = str.substring(5);
							r = utils.formatDate(new Date(), d);
							param = param.replace("@{" + str + "}", r);
							obj.param = param;
						} else if(/^result:/g.test(str)){
							d = str.substring(7);
							r = eval(d);
							e = page.getMatchObj(r[0], r[1]);
							if(e){
								if(e.status){
									e = page.parseStrToFormatJson(e.param);
									if(e){
										t = page.getObjectValue(e, r[2]);
										param = param.replace("@{" + str + "}", t);
									} else {
										param = param.replace("@{" + str + "}", "");
									}
									obj.param = param;
								} else {
									return page.formatParam(e);
								}
							}
						} else if(/^random:/g.test(str)){
							d = str.substring(7);
							r = d.substring(1, d.indexOf("]"));
							e = d.substring(d.indexOf("(") + 1, d.indexOf(")"));
							r = r.replace('0-9', '0123456789');
							r = r.replace('A-Z', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
							r = r.replace('a-z', 'abcdefghijklmnopqrstuvwxyz');
							t = r.split('');
							m = parseInt(e.split(',')[0]);
							n = parseInt(e.split(',')[1]);
							u = '';
							p = parseInt(Math.random()*(m - n + 1) + n);
							for(var j = 0; j < p; j++){
								u += t[parseInt(Math.random() * t.length)];
							}
							param = param.replace("@{" + str + "}", u);
							obj.param = param;
						}
					}
				}
			}
			return obj;
		},
		
		getObjectValue: function(obj, str){
			var arr = str.split('.');
			var getv = function(obj, inx){
				var attr = arr[inx], n = false;
				if(attr.match(/\[(.+?)\]$/)){
					attr = attr.substring(0, attr.indexOf('['));
					n = RegExp.$1;
				}
				inx++;
				var v = obj[attr];
				if(n !== false){
					v = v[n];
				}
				return inx == arr.length ? v : getv(v, inx);
			};
			var i = 0;
			return getv(obj, i);
		},
		
		runPatch: function(address, obj){
			$('.lineitem').removeClass('run');
			obj.$ele.addClass('run');
			ajax.post({
				url: 'dubbo/test/single',
				data: {
					jarName: jarName,
					address: address,
					interfaceName: obj.interfaceName,
					paramType: obj.paramType,
					method: obj.method,
					param: obj.param
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					obj.$ele.removeClass('failed').addClass('success');
					obj.$ele.data('param', rtn.param).data('result', rtn.data);
					var ds = page.parseStrToJson(rtn.data);
					if(!_.isObject(ds) || ds.rtnCode != '000000'){
						obj.$ele.addClass('error');
					}
					$('.result1').val(utils.formatByJson('{r}\n{i}.{m}：执行成功\n----------------------\n', {
						r: $('.result1').val(),
						i: obj.interfaceName,
						m: obj.method
					}));
				} else {
					obj.$ele.addClass('failed').removeClass('success');
					obj.$ele.data('param', rtn.param).data('result', msg);
					$('.result1').val(utils.formatByJson('{r}\n{i}.{m}：执行失败\n----------------------\n', {
						r: $('.result1').val(),
						i: obj.interfaceName,
						m: obj.method
					}));
				}
			}).fail(function(){
				obj.$ele.addClass('failed').removeClass('success');
				obj.$ele.data('param', '').data('result', 'Error');
			}).always(function(){
				page.setRunObjectStatus(obj);
				page.runFlag = false;
				obj.$ele.removeClass('run');
			});
		},
		
		setRunObjectStatus: function(obj){
			for(var i = 0, k = page.runObjects.length; i < k; i++){
				if(page.runObjects[i].interfaceName == obj.interfaceName
						&& page.runObjects[i].method == obj.method){
					page.runObjects[i].status = true;
				}
			}
		},
		
		parseStrToFormatJson: function(param){
			var res = "";
			try{
				try{
					var l = 0;
					while(!_.isObject(param) && l < 5){
						param = utils.parseJSON(param);
						l++;
					}
				}catch(e1){
					res = param;
				}
				res = JSON.stringify(param, null, 4);
			}catch(e1){
				res = param;
			}
			return res;
		},
		
		parseStrToJson: function(param){
			var res = param;
			try{
				if(!_.isObject(res)){
					res = JSON.parse(res);
				}
				try{
					if(!_.isObject(res)){
						res = JSON.parse(res);
					}
				}catch(e1){
				}
			}catch(e1){
			}
			return res;
		},
		
		bindEvent: function(){
			
			$('.lists').on('click', '.item', function(e){
				var $this = $(this),
					state = $this.data('state'),
					id = $this.data('id');
				jarName = id;
				$('.item').removeClass('active');
				$this.addClass('active');
				if(state){
					$('.uninstalled,.btn-install').addClass('hidden');
					$('.installed,.btn-uninstall,.btn-sync').removeClass('hidden');
					page.loadJarClass(jarName);
				} else {
					$('.uninstalled,.btn-install').removeClass('hidden');
					$('.installed,.btn-uninstall,.btn-sync').addClass('hidden');
					
					$('.ztree').html('');
				}
			});
			
			$('.btn-run').on('click', function(e){
				var $this = $(this),
					param = $('.param2').val(),
					interfaceName = selectNode.pId,
					method = selectNode.name,
					address = $('#address').val();
				if(interfaceName && method && param){
					var paramType = method.substring(method.indexOf('(') + 1, method.length - 1);
					method = method.substring(0, method.indexOf('('));
					$this.attr('disabled', true);
					page.getAllParam(address, page.allMethods[jarName], function(datas){
						var obj = {
							interfaceName: interfaceName,
							method: method,
							paramType: paramType,
							param: param
						};
						var resObj = page.formatParam(obj);
						if(resObj && resObj.param){
							obj = resObj;
						}
						page.callMethod(address, obj);
					});
				}
			});
			
			$('.btn-run-patch').on('click', function(e){
				var $this = $(this),
					address = $('#address').val();
				if(address){
					var array = [];
					$('.lineitem').each(function(i, e){
						var $this = $(e),
							interfaceName = $this.data('interface'),
							method = $this.data('method'),
							paramType = $this.data('type');
						array.push({
							interfaceName: interfaceName,
							method: method,
							paramType: paramType,
							status: false,
							$ele: $this
						});
					});
					page.getAllParam(address, page.allMethods[jarName], function(datas){
						for(var j = 0, l = array.length; j < l; j++){
							for(var i = 0, k = datas.length; i < k; i++){
								if(array[j].interfaceName == datas[i].interfaceName
										&& array[j].method == datas[i].method){
									array[j].param = datas[i].param;
								}
							}
						}
						page.runPatchStart(address, array);
					});
				}
			});
			
			$('.btn-save').on('click', function(e){
				var $this = $(this),
					param = $('.param2').val(),
					interfaceName = selectNode.pId,
					method = selectNode.name,
					address = $('#address').val();
				if(param && interfaceName && method){
					method = method.substring(0, method.indexOf('('));
					$this.attr('disabled', true);
					var zuiLoad = waiting('正在保存...');
					ajax.post({
						url: 'dubbo/test/save',
						data: {
							name: jarName,
							address: address,
							interfaceName: interfaceName,
							method: method,
							param: param
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							alert("保存成功");
						} else {
							error(msg);
						}
					}).fail(function(){
						error('安装失败');
					}).always(function(){
						zuiLoad.hide();
						$this.attr('disabled', false);
					});
				}
			});
			
			$('.btn-history').on('click', function(e){
				var $this = $(this),
					interfaceName = selectNode.pId,
					method = selectNode.name,
					address = $('#address').val();
				if(interfaceName && method){
					var p = encodeURIComponent(utils.toJSON({
						name: jarName,
						interfaceName: interfaceName,
						method: method,
						address: address,
						jarName: jarName,
						type: 'jar'
					}));
					if(top['SYSTEM']){
						top['SYSTEM']['openWindow']({
							title: "Dubbo接口测试记录",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/dubbo/history.html?p=' + p,
							width: 1100,
							height: 700,
							needMax: false,
							needMin: false,
							desktopIconId: 'cus-' + new Date().getTime(),
							icon: consts.WEB_BASE + 'content/images/icons/icon_12.png'
						});
					} else {
						// 创建iframe弹出框
						window['$showDialog'] = new $.zui.ModalTrigger({
							name: 'submitFrame',
							title: '接口测试记录',
							backdrop: 'static',
							moveable: true,
							waittime: consts.PAGE_LOAD_TIME,
							width: 1100,
							height: 700,
							iframe: './history.html?p=' + p
						});
						// 显示弹出框
						$showDialog.show();
					}
				}
			});
			
			$('.btn-multi').on('click', function(e){
				var $this = $(this),
					interfaceName = selectNode.pId,
					method = selectNode.name,
					address = $('#address').val();
				if(interfaceName && method){
					var p = encodeURIComponent(utils.toJSON({
						name: jarName,
						interfaceName: interfaceName,
						method: method,
						address: address,
						jarName: jarName,
						type: 'jar'
					}));
					if(top['SYSTEM']){
						top['SYSTEM']['openWindow']({
							title: "Dubbo接口多用例测试",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/dubbo/multicase.html?p=' + p,
							width: 1100,
							height: 700,
							needMax: false,
							needMin: false,
							desktopIconId: 'cus-' + new Date().getTime(),
							icon: consts.WEB_BASE + 'content/images/icons/icon_12.png'
						});
					} else {
						// 创建iframe弹出框
						window['$multiDialog'] = new $.zui.ModalTrigger({
							name: 'multiFrame',
							title: '接口测试记录',
							backdrop: 'static',
							moveable: true,
							waittime: consts.PAGE_LOAD_TIME,
							width: 1100,
							height: 700,
							iframe: './multicase.html?p=' + p
						});
						// 显示弹出框
						$multiDialog.show();
					}
				}
			});
			
			$('#words').on('keyup', function(e){
				var code = e.witch || e.keyCode;
				if(code == 13){
					var $this = $(this),
					word = $this.val();
					if(word){
						if(fillterNodes.word == word && fillterNodes.nodes.length){
							if(fillterNodes.index < (fillterNodes.nodes.length - 1)){
								fillterNodes.index = fillterNodes.index + 1;
							} else {
								fillterNodes.index = 0;
							}
							var node = fillterNodes.nodes[fillterNodes.index];
							zTree.selectNode(node);
							if(node.isParent){
								zTree.expandNode(node, true, false, true);
							}
						} else {
							fillterNodes = {
								word: word,
								nodes: [],
								index: 0
							};
							page.getFilterNode(zTree.getNodes(), word);
							if(fillterNodes.nodes.length){
								var node = fillterNodes.nodes[fillterNodes.index];
								zTree.selectNode(node);
								if(node.isParent){
									zTree.expandNode(node, true, false, true);
								}
							}
						}
					}
				}
			});
			
			$('.btn-install').on('click', function(){
				var zuiLoad = waiting('正在安装...');
				ajax.post({
					url: 'dubbo/install',
					data: {
						jarName: jarName
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						alert("安装成功");
						$('#' + jarName.replace(/\./g, '_')).addClass('loaded').data('state', true);
						$('.uninstalled,.btn-install').addClass('hidden');
						$('.installed,.btn-uninstall,.btn-sync').removeClass('hidden');
						page.loadJarClass(jarName);
					} else {
						error(msg);
					}
				}).fail(function(){
					error('安装失败');
				}).always(function(){
					zuiLoad.hide();
					$('.btn-install').attr('disabled', false);
				});
			});
			
			$('.btn-uninstall').on('click', function(){
				var zuiLoad = waiting('正在卸载...');
				ajax.post({
					url: 'dubbo/uninstall',
					data: {
						jarName: jarName
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						alert("卸载成功");
						page.jarMethodParams[jarName] = null;
						$('#' + jarName.replace(/\./g, '_')).removeClass('loaded').data('state', false);
						$('.uninstalled,.btn-install').removeClass('hidden');
						$('.installed,.btn-uninstall,.btn-sync').addClass('hidden');
						$('.ztree').html('');
					} else {
						error(msg);
					}
				}).fail(function(){
					error('卸载失败');
				}).always(function(){
					zuiLoad.hide();
					$('.btn-uninstall').attr('disabled', false);
				});
			});
			
			$('.lists').on('click', '.icon-remove-sign', function(e){
				// 删除
				var $this = $(this),
					$item = $this.parent().parent(),
					jar = $item.data('id');
				$.confirm({title: '删除警告', msg: '您确定要物理删除' + jar + '吗？', yesText: '确定删除', yesClick: function(){
					var zuiLoad = waiting('正在删除...');
					ajax.post({
						url: 'dubbo/del',
						data: {
							jarName: jar
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							alert(msg);
							if($item.hasClass('active')){
								$('.uninstalled,.btn-install,.installed,.btn-uninstall,.btn-sync').addClass('hidden');
								$('.ztree').html('');
							}
							$item.remove();
						} else {
							error(msg);
						}
					}).fail(function(){
						error('删除失败');
					}).always(function(){
						zuiLoad.hide();
					});
				}});
				try{
					e.stopPropagation();
					e.preventDefault();
				}catch(ex){}
			});
			
			$('.jar-call').on('click', '.lineitem', function(e){
				var $this = $(this),
					param = $this.data('param'),
					result = $this.data('result');
				$('.lineitem').removeClass('active');
				$this.addClass('active');
				var strarr = [];
				if($this.hasClass('success') || $this.hasClass('failed')){
					strarr.push('请求入参：');
					if(param){
						strarr.push(page.parseStrToFormatJson(param));
					} else {
						strarr.push("----没有入参");
					}
					strarr.push("返回结果：");
					if(result){
						strarr.push(page.parseStrToFormatJson(result));
					} else {
						strarr.push("----无结果");
					}
				}
				$('.result1').val(strarr.join('\n'));
			});
			
			$('.btn-export-all').on('click', function(e){
				var arr = [];
				$('.lineitem').each(function(i, e){
					var $this = $(e),
						interfaceName = $this.data('interface'),
						method = $this.data('method'),
						result = $this.data('result'),
						param = $this.data('param'),
						paramType = $this.data('type');
					arr.push(utils.formatByJson('{i}.{m}({t})', {
						i: interfaceName,
						m: method,
						t: paramType
					}));
					arr.push('请求入参：');
					if(param){
						arr.push(page.parseStrToFormatJson(param));
					} else {
						arr.push("----没有入参");
					}
					arr.push("返回结果：");
					if(result){
						arr.push(page.parseStrToFormatJson(result));
					} else {
						arr.push("----无结果");
					}
					arr.push('----------------------------');
				});
				$('.result1').val(arr.join('\n'));
			});
			
			$('.btn-format').on('click', function(){
				var $p = $('.param2'),
					param = $p.val();
				if(param){
					$p.val(page.parseStrToFormatJson(param));
				}
			});
			
			$('.btn-sync').on('click', function(){
				window['$obj'] = {
					type: 'jar',
					name: jarName
				};
				// 创建iframe弹出框
				window['$syncDialog'] = new $.zui.ModalTrigger({
					name: 'syncFrame1',
					title: '测试参数同步',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 600,
					height: 450,
					iframe: './sync.html'
				});
				// 显示弹出框
				$syncDialog.show();
			});
			
			$('.icon-question-sign').on('click', function(e){
				if($('.help-box').hasClass('hidden')){
					$('.help-box').removeClass('hidden').css({
						left: e.clientX - 900,
						top: e.clientY - 150
					}); 
				} else {
					$('.help-box').addClass('hidden');
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});