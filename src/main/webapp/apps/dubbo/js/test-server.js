/**
 * 
 */
define(function(require, exports, module) {
	var zTree, callDatas = [], selectNode, dubboServer;
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
			
			$.useModule(['chosen', 'ztree'], function(){
				
				page.loadServerList();
			});
			
			page.bindEvent();
		},
		
		loadClients: function(){
			var address = $('#address').val();
			var zuiLoad = waiting('Dubbo服务节点加载中...');
			ajax.post({
				url: 'zk/cmd',
				data: {
					ip: address.split(':')[0],
					port: address.split(':')[1],
					cmd: "dump"
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showResult(rtn.data);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('数据获取失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showResult: function(data){
			var html = [];
			var arr = data.split('\n'), line, str = "/providers/dubbo://", address;
			var json = {}, inx = -1;
			for(var i = 0, k = arr.length; i < k; i++){
				try{
					line = arr[i];
					if(line.indexOf("%") != -1){
						line = decodeURIComponent(line);
					}
				}catch(e){}
				inx = line.indexOf(str);
				if(inx != -1){
					address = line.substring(inx + str.length, line.indexOf("/", inx + str.length + 1));
					if(!json[address]){
						json[address] = address;
						html.push(laytpl('item.html').render({
							id: "d" + address.replace(/[\.:]/g, ''),
							name: address
						}));
					}
				}
			}
			$('.lists').html(html.join(''));
			$('.ztree').html('');
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
						}).on('change', function(){
							page.loadClients();
						});
						
						page.loadClients();
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
				url: 'dubbo/server/class',
				data: {
					ip: name.split(':')[0],
					port: name.split(':')[1]
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showClassList(name, rtn.data);
					$('.runing').removeClass('hidden');
					$('.notrun').addClass('hidden');
				} else {
					$('.notrun').removeClass('hidden');
					$('.runing').addClass('hidden');
					error(msg);
				}
			}).fail(function(){
				error('获取类/接口/方法数据失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showClassList: function(name, data){
			page.callDatas[dubboServer] = data;
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
			page.allMethods[dubboServer] = [];
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
					page.allMethods[dubboServer].push({
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
								for(var i = 0, k = page.callDatas[dubboServer].length; i < k; i++){
									p = page.callDatas[dubboServer][i];
									if(/:[0-9]+$/g.test(name) || p.classPackage == name){
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
									if(/:[0-9]+$/g.test(name)){
										$('.btn-status').addClass('hidden');
										$('.btn-words').removeClass('hidden');
									} else {
										$('.btn-status').removeClass('hidden');
										$('.btn-words').addClass('hidden');
									}
								}
							} else {
								$('.jar-call').addClass('hidden');
								$('.method-call').removeClass('hidden');
								var method = selectNode.name;
								method = method.substring(0, method.indexOf('('));
								page.getReqParam($('#address').val(), selectNode.pId, method, selectNode.name);
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
		
		getReqParam: function(address, interfaceName, method, mname){
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
					if(!rtn.data.param){
						page.getInterfaceInfo(interfaceName, mname);
					}
				} else {
					$('.param2').val("");
					$('.result2').val("");
					page.getInterfaceInfo(interfaceName, mname);
				}
			}).fail(function(){
				error('参数加载失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		getInterfaceInfo: function(interfaceName, method){
			var zuiLoad = waiting('参数加载中...');
			ajax.post({
				url: 'dubbo/interface/get',
				data: {
					interfaceName: interfaceName,
					methodName: method
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					if(rtn.data.inParam){
						var param = utils.parseJSON(rtn.data.inParam);
						var json = {};
						for(var i = 0; i < param.length; i++){
							if(param[i].type == 'String'){
								json[param[i].name] = "";
							} else if(param[i].type == 'Integer'){
								json[param[i].name] = 0;
							} else if(param[i].type == 'Integer'){
								json[param[i].name] = 0;
							} else if(param[i].type == 'Double'){
								json[param[i].name] = 0.0;
							} else if(param[i].type == 'Float'){
								json[param[i].name] = 0.0;
							} else if(param[i].type == 'Bolean'){
								json[param[i].name] = false;
							} else if(param[i].type == 'Date'){
								json[param[i].name] = utils.formatDate(new Date());
							} else if(param[i].type == 'Object'){
								json[param[i].name] = {};
							}
						}
						$('.param2').val(page.parseStrToFormatJson(utils.toJSON(json)));
					}
				}
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		callMethod: function(address, obj){
			var zuiLoad = waiting('方法调用中...');
			ajax.post({
				url: 'dubbo/test/server',
				data: {
					dubboServer: dubboServer,
					address: address,
					interfaceName: obj.interfaceName,
					paramType: obj.paramType,
					method: obj.method,
					param: (function(){
						var p = obj.param;
						try{
							p = utils.toJSON(utils.parseJSON(p));
						}catch(e){p = obj.param;}
						return p;
					})()
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
				try {
					data = page.parseStrToFormatJson(data);
					$('.result2').val(data);
				} catch (e) {
					$('.result2').val(data);
				}
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
			var paramArr = page.jarMethodParams[dubboServer];
			if(!paramArr){
				ajax.post({
					url: 'dubbo/all/param',
					data: {
						address: address,
						list: list
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						page.jarMethodParams[dubboServer] = rtn.data;
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
				var paramArr = page.jarMethodParams[dubboServer];
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
				url: 'dubbo/test/server',
				data: {
					dubboServer: dubboServer,
					address: address,
					interfaceName: obj.interfaceName,
					paramType: obj.paramType,
					method: obj.method,
					param: obj.param
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					var data = rtn.data;
					/*if(data.indexOf("elapsed:") != -1){
						data = data.substring(0, data.indexOf("elapsed:") - 2);
					}*/
					obj.$ele.removeClass('failed').addClass('success');
					obj.$ele.data('param', rtn.param).data('result', data);
					var ds = page.parseStrToJson(data);
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
				var l = 0;
				if(param){
					var elapsed = '';
					if(param.indexOf("elapsed:") != -1){
						var arr = param.split('\r\n'), trr = [];
						if(arr.length > 1){
							elapsed = arr[arr.length - 1];
							for(var i = 0, k = arr.length - 1; i < k; i++){
								trr[i] = arr[i];
							}
							param = trr.join('');
						}
					}
					while(!_.isObject(param) && l < 5){
						param = utils.parseJSON(param);
						l++;
					}
					if(_.isObject(param) && elapsed){
						param["elapsed"] = elapsed.substring(9);
					}
					res = JSON.stringify(param, null, 4);
				}
			}catch(e1){
				log.info(e1);
				res = param;
			}
			return res;
		},
		
		parseStrToJson: function(param){
			var res = param;
			try{
				try{
					var elapsed = '';
					if(res.indexOf("elapsed:") != -1){
						var arr = res.split('\r\n'), trr = [];
						if(arr.length > 1){
							elapsed = arr[arr.length - 1];
							for(var i = 0, k = arr.length - 1; i < k; i++){
								trr[i] = arr[i];
							}
							res = trr.join('');
						}
					}
					var l = 0;
					while(!_.isObject(res) && l < 4){
						res = JSON.parse(res);
					}
					if(_.isObject(res) && elapsed){
						res["elapsed"] = elapsed.substring(9);
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
				address = $this.data('address');
				dubboServer = address;
				$('.item').removeClass('active');
				$this.addClass('active');
				$('.ztree').html('');
				$('.btn-sync,.btn-state').removeClass('hidden');
				page.loadJarClass(dubboServer);
				
				$('.jar-call,.method-call').addClass('hidden');
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
					page.getAllParam(address, page.allMethods[dubboServer], function(datas){
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
					page.getAllParam(address, page.allMethods[dubboServer], function(datas){
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
							name: dubboServer,
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
						name: dubboServer,
						interfaceName: interfaceName,
						method: method,
						address: address,
						dubboServer: dubboServer,
						type: 'dubbo'
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
							title: 'Dubbo接口测试记录',
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
			
			$('.btn-desc').on('click', function(e){
				var $this = $(this),
					interfaceName = selectNode.pId,
					method = selectNode.name,
					address = $('#address').val();
				if(interfaceName && method){
					var p = encodeURIComponent(utils.toJSON({
						name: dubboServer,
						interfaceName: interfaceName,
						method: method,
						address: address,
						dubboServer: dubboServer,
						type: 'dubbo'
					}));
					if(top['SYSTEM']){
						top['SYSTEM']['openWindow']({
							title: "Dubbo接口说明",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/dubbo/interface.html?p=' + p,
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
							title: 'Dubbo接口说明',
							backdrop: 'static',
							moveable: true,
							waittime: consts.PAGE_LOAD_TIME,
							width: 1100,
							height: 700,
							iframe: './interface.html?p=' + p
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
						name: dubboServer,
						interfaceName: interfaceName,
						method: method,
						address: address,
						dubboServer: dubboServer,
						type: 'dubbo'
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
					type: 'dubbo',
					name: dubboServer
				};
				// 创建iframe弹出框
				window['$syncDialog'] = new $.zui.ModalTrigger({
					name: 'syncFrame',
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
			
			$('.btn-status').on('click', function(){
				// 创建iframe弹出框
				window['$statusDialog'] = new $.zui.ModalTrigger({
					name: 'statusFrame',
					title: '节点状态查看',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 800,
					height: 550,
					iframe: './status.html?p=' + dubboServer + '&n=' + selectNode.name
				});
				// 显示弹出框
				$statusDialog.show();
			});
			
			$('.btn-words').on('click', function(){
				var $this = $(this);
				if(dubboServer){
					var p = encodeURIComponent(utils.toJSON({
						name: dubboServer
					}));
					if(top['SYSTEM']){
						top['SYSTEM']['openWindow']({
							title: dubboServer + "服务的所有Dubbo接口列表",
							types: 'exe',
							url: consts.WEB_BASE + 'apps/dubbo/interface_all.html?p=' + p,
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
							title: dubboServer + "服务的所有Dubbo接口列表",
							backdrop: 'static',
							moveable: true,
							waittime: consts.PAGE_LOAD_TIME,
							width: 1100,
							height: 700,
							iframe: './interface_all.html?p=' + p
						});
						// 显示弹出框
						$showDialog.show();
					}
				}
			});
			
			$('.btn-state').on('click', function(){
				// 创建iframe弹出框
				window['$statusDialog'] = new $.zui.ModalTrigger({
					name: 'statusFrame',
					title: '节点状态查看',
					backdrop: 'static',
					moveable: true,
					waittime: consts.PAGE_LOAD_TIME,
					width: 800,
					height: 550,
					iframe: './status.html?p=' + dubboServer
				});
				// 显示弹出框
				$statusDialog.show();
			});
			
			$('.icon-question-sign').on('click', function(e){
				if($('.help-box').hasClass('hidden')){
					$('.help-box').removeClass('hidden').css({
						left: ($(document).width() - 900)/2,
						top: e.clientY - 150
					}); 
				} else {
					$('.help-box').addClass('hidden');
				}
			});
			
			$('.help-box').on('click', function(){
				$('.help-box').addClass('hidden');
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});