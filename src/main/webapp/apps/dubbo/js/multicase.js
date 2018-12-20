/**
 * 
 */
define(function(require, exports, module) {
	
	var datas = [], $obj = {}, selectId = '';
	function PageScript(){
		this.runindex = 0;
		this.runflag = false;
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			var p = utils.getUrlParam();
			$obj = utils.parseJSON(decodeURI(p.p));
			if($obj){
				if($obj.type == 'jar'){ 
					$('.st0').removeClass('hidden');
				} else {
					$('.st1').removeClass('hidden');
				}
				$('.sv1').text($obj.name);
				$('.sv2').text($obj.address);
				$('.sv3').text($obj.interfaceName);
				$('.sv4').text($obj.method);
				
				page.loadCaseList();
			}
			
			page.bindEvent();
		},
		
		loadCaseList: function(){
			page.getTestCases($obj.address, $obj.interfaceName, $obj.method);
		},
		
		getTestCases: function(address, interfaceName, method){
			var zuiLoad = waiting('用例加载中...');
			if(method.indexOf("(") != -1){
				method = method.substring(0, method.indexOf("("))
			}
			ajax.post({
				url: 'dubbo/case/list',
				data: {
					name: $obj.name,
					address: address,
					interfaceName: interfaceName,
					method: method
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.showCaseList(rtn.data);
				} else {
					$('.param2').val("");
					$('.result2').val("");
				}
			}).fail(function(){
				error('用例加载失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showCaseList: function(d){
			if(d){
				datas = d;
				var html = [];
				for(var i = 0, k = datas.length; i < k; i++){
					html.push(laytpl('item.html').render({
						id: datas[i].rowId,
						name: datas[i].caseName,
						index: i,
						active: datas[i].rowId == selectId
					}));
				}
				$('.lists').html(html.join(''));
			}
		},
		
		addCaseNode: function(obj){
			if(obj && obj.rowId){
				var html = laytpl('item.html').render({
					id: obj.rowId,
					name: obj.caseName,
					index: datas.length,
					active: false
				});
				datas.push(obj);
				$('.lists').append(html);
			}
		},
		
		callMethod: function(caseName, method, paramType, param, $ele){
			var zuiLoad = waiting('方法调用中...');
			var data = {
				address: $obj.address,
				interfaceName: $obj.interfaceName,
				paramType: paramType,
				method: method,
				param: page.formatParam(param),
				caseName: caseName,
				type: 'case'
			};
			if($obj.type == 'jar'){
				data.jarName = $obj.name;
			} else {
				data.dubboServer = $obj.name;
			}
			ajax.post({
				url: $obj.type == 'jar' ? 'dubbo/test/single' : 'dubbo/test/server',
				data: data
			}).done(function(res, rtn, state, msg){
				if(state){
					if($ele){
						$ele.removeClass('failed').addClass('success');
						$ele.data('param', rtn.param).data('result', rtn.data);
						var ds = page.parseStrToJson(rtn.data);
						if(!_.isObject(ds) || ds.rtnCode != '000000'){
							$ele.addClass('error');
						}
						$('.result').val(utils.formatByJson('{r}\n{i}.{m}：执行成功\n----------------------\n', {
							r: $('.result').val(),
							i: $obj.interfaceName,
							m: method
						}));
					} else {
						$('.lists .item.active').data('result', rtn.data);
						page.showResult2(rtn.data);
					}
				} else {
					if($ele){
						$ele.addClass('failed').removeClass('success');
						$ele.data('param', rtn.param).data('result', msg);
						$('.result1').val(utils.formatByJson('{r}\n{i}.{m}：执行失败\n----------------------\n', {
							r: $('.result1').val(),
							i: $obj.interfaceName,
							m: method
						}));
					} else {
						error(msg);
					}
				}
			}).fail(function(){
				if($ele){
					$ele.addClass('failed').removeClass('success');
					$ele.data('param', '').data('result', 'Error');
				} else {
					error('方法调用失败');
				}
			}).always(function(){
				zuiLoad.hide();
				$('.btn-run').attr('disabled', false);
				page.runflag = false;
				page.runindex++;
			});
		},
		
		showResult2: function(data){
			if(data){
				data = page.parseStrToFormatJson(data);
				$('.result').val(data);
			}
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
		
		formatParam: function(param){
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
						}
					}
				}
			}
			return param;
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
				log.info(e1, param);
				res = param;
			}
			return res;
		},
		
		bindEvent: function(){
			$('.lists').on('click', '.item', function(e){
				var $this = $(this),
					index = $this.data('index'),
					id = $this.data('id');
				$('.item').removeClass('active');
				$this.addClass('active');
				if(id){
					$('.param,.result').val('');
					selectId = id;
					var obj = datas[index];
					try{
						var param = obj.param;
						param = page.parseStrToFormatJson(param);
						$('.param').val(param);
					}catch(e1){}
					try{
						var data = obj.result || $this.data('result');
						data = page.parseStrToFormatJson(data);
						$('.result').val(data || '');
					}catch(e1){}
					$('.btn-run,.btn-save,.btn-saveas').removeClass('hidden');
				}
			});
			
			$('.btn-run').on('click', function(e){
				var $this = $(this),
					param = $('.param').val(),
					caseName = $('.lists .item.active').data('name'),
					method = $obj.method;
				if(caseName && param){
					var paramType = method.substring(method.indexOf('(') + 1, method.length - 1);
					method = method.substring(0, method.indexOf('('));
					$this.attr('disabled', true);
					page.callMethod(caseName, method, paramType, param);
				}
			});
			
			$('.lists').on('click', '.icon-remove-sign', function(e){
				// 删除
				var $this = $(this),
					$item = $this.parent().parent(),
					rowId = $item.data('id'),
					index = $item.data('index');
				$.confirm({title: '删除警告', msg: '您确定要删除此记录吗？', yesText: '确定删除', yesClick: function(){
					var zuiLoad = waiting('正在删除...');
					ajax.post({
						url: 'dubbo/case/del',
						data: {
							rowId: rowId
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							alert(msg);
							if($item.hasClass('active')){
								$('.param,.result').val('');
							}
							$item.remove();
							datas[index] = {};
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
			
			$('.btn-add').on('click', function(e){
				if($obj.name && $obj.address && $obj.interfaceName){
					var method = $obj.method;
					if(method.indexOf("(") != -1){
						method = method.substring(0, method.indexOf("("))
					}
					window['$_dcobj'] = {
						name: $obj.name,
						address: $obj.address,
						interfaceName: $obj.interfaceName,
						method: method
					};
					// 创建iframe弹出框
					window['$newDialog'] = new $.zui.ModalTrigger({
						name: 'frame2234d',
						title: '新增用例',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 600,
						height: 450,
						iframe: './dubbo_case.html'
					});
					// 显示弹出框
					$newDialog.show();
				}
			});
			
			$('.btn-add-multi').on('click', function(e){
				if($obj.name && $obj.address && $obj.interfaceName){
					var method = $obj.method;
					if(method.indexOf("(") != -1){
						method = method.substring(0, method.indexOf("("))
					}
					window['$_dcobj'] = {
						name: $obj.name,
						address: $obj.address,
						interfaceName: $obj.interfaceName,
						method: method
					};
					// 创建iframe弹出框
					window['$multiAddDialog'] = new $.zui.ModalTrigger({
						name: 'frame0234a',
						title: '批量新增用例',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 1060,
						height: 600,
						iframe: './dubbo_case_multi.html'
					});
					// 显示弹出框
					$multiAddDialog.show();
				}
			});
			
			$('.btn-save').on('click', function(e){
				var $btn = $(this),
					caseName = $('.lists .item.active').data('name'),
					param = $('.param').val();
				if($obj.name && $obj.address && $obj.interfaceName){
					window['$_dcobj'] = {
						rowId: $obj.rowId,
						name: $obj.name,
						address: $obj.address,
						interfaceName: $obj.interfaceName,
						method: $obj.method.substring(0, $obj.method.indexOf("(")),
						param: param,
						caseName: caseName
					};
					// 创建iframe弹出框
					window['$newDialog'] = new $.zui.ModalTrigger({
						name: 'frame358d',
						title: '用例修改',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 600,
						height: 450,
						iframe: './dubbo_case.html'
					});
					// 显示弹出框
					$newDialog.show();
				}
			});
			
			$('.btn-saveas').on('click', function(e){
				if($obj.name && $obj.address && $obj.interfaceName){
					window['$_dcobj'] = {
						name: $obj.name,
						address: $obj.address,
						interfaceName: $obj.interfaceName,
						method: $obj.method.substring(0, $obj.method.indexOf("(")),
						param: $('.param').val()
					};
					// 创建iframe弹出框
					window['$newDialog'] = new $.zui.ModalTrigger({
						name: 'frame358d',
						title: '用例另存为',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 600,
						height: 450,
						iframe: './dubbo_case.html'
					});
					// 显示弹出框
					$newDialog.show();
				}
			});
			
			$('.btn-multi-test').on('click', function(e){
				var $this = $(this);
				if(datas && datas.length){
					$this.attr('disabled', true);
					page.runindex = 0;
					var paramType = $obj.method.substring($obj.method.indexOf('(') + 1, $obj.method.length - 1);
					var method = $obj.method.substring(0, $obj.method.indexOf('('));
					var obj = {};
					var runInter = setInterval(function(){
						if(page.runindex >= (datas.length)){
							clearInterval(runInter);
							$this.attr('disabled', false);
						} else if(!page.runflag){
							page.runflag = true;
							try{
								obj = datas[page.runindex];
								page.callMethod(obj.caseName, method, paramType, obj.param, $('#id' + obj.rowId));
							}catch(e2){
								page.runflag = false;
								clearInterval(runInter);
								$this.attr('disabled', false);
								error("执行失败：" + e2.message);
							}
						}
					}, 50);
				}				
			});
		}
		
	};
	
	var page = new PageScript();
	window['loadCaseList'] = page.loadCaseList;
	window['addCaseNode'] = page.addCaseNode;
	page.init();
	
});