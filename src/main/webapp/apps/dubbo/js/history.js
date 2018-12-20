/**
 * 
 */
define(function(require, exports, module) {
	
	var datas = [], $obj = {}, selectId = '';
	function PageScript(){
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
				
				page.getTestHistory($obj.address, $obj.interfaceName, $obj.method);
			}
			
			page.bindEvent();
		},
		
		getTestHistory: function(address, interfaceName, method){
			var zuiLoad = waiting('参数加载中...');
			var methodName = method;
			if(methodName.indexOf("(") != -1){
				methodName = methodName.substring(0, methodName.indexOf("("))
			}
			ajax.post({
				url: 'dubbo/get/history',
				data: {
					name: $obj.name,
					address: address,
					interfaceName: interfaceName,
					method: methodName
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.showHisList(rtn.data);
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
		
		showHisList: function(d){
			if(d){
				datas = d;
				var html = [];
				for(var i = 0, k = datas.length; i < k; i++){
					html.push(laytpl('item.html').render({
						id: datas[i].rowId,
						name: utils.formatDate(datas[i].testTime),
						index: i,
						active: datas[i].rowId == selectId
					}));
				}
				$('.lists').html(html.join(''));
			}
		},
		
		callMethod: function(name, address, interfaceName, method, paramType, param){
			var zuiLoad = waiting('方法调用中...');
			var data = {
				address: address,
				interfaceName: interfaceName,
				paramType: paramType,
				method: method,
				param: page.formatParam(param)
			};
			if($obj.type == 'jar'){
				data.jarName = name;
			} else {
				data.dubboServer = name;
			}
			ajax.post({
				url: $obj.type == 'jar' ? 'dubbo/test/single' : 'dubbo/test/server',
				data: data
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
				$('.result').val(page.parseStrToFormatJson(data));
				
				page.getTestHistory($obj.address, $obj.interfaceName, $obj.method);
			}
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
						param["elapsed"] = elapsed;
					}
					res = JSON.stringify(param, null, 4);
				}
			}catch(e1){
				log.info(e1);
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
					selectId = id;
					var obj = datas[index];
					try{
						var param = obj.param;
						$('.param').val(page.parseStrToFormatJson(param));
					}catch(e1){}
					try{
						var data = obj.result;
						$('.result').val(page.parseStrToFormatJson(data));
					}catch(e1){}
				}
			});
			
			$('.btn-run').on('click', function(e){
				var $this = $(this),
					param = $('.param').val(),
					interfaceName = $obj.interfaceName,
					method = $obj.method,
					address = $obj.address,
					name = $obj.name;
				if(interfaceName && method && param){
					var paramType = method.substring(method.indexOf('(') + 1, method.length - 1);
					method = method.substring(0, method.indexOf('('));
					$this.attr('disabled', true);
					page.callMethod(name, address, interfaceName, method, paramType, param);
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
						url: 'dubbo/test/del',
						data: {
							rowId: rowId
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							alert(msg);
							if($item.hasClass('active')){
								$('.sv1,.sv2,.sv3,.sv4').text('');
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
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});