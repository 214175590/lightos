/**
 * 
 */
define(function(require, exports, module) {
	var zTree = {};
	function PageScript(){
		this.$obj = {};
		this.treeDatas = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			if(parent['$obj']){
				page.$obj = parent['$obj'];
				page.run4cmd('conf');
			}
			
			$.useModule(['ztree'], function(){
			});
			
			page.bindEvent();
		},
		
		run4cmd: function(cmd){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'zk/cmd',
				data: {
					rowId: page.$obj.rowId,
					cmd: cmd
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(cmd == 'dump'){
						page.showDumpResult(cmd, rtn.data);
					} else {
						page.showResult(cmd, rtn.data);
					}
				} else {
					error(msg);
				}
			}).fail(function(){
				error('数据获取失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		showResult: function(cmd, data){
			var arr = data.split('\n');
			var html = [];
			for(var i = 0, k = arr.length; i < k; i++){
				if(cmd == 'dump'){
					html.push(decodeURIComponent(arr[i]));
				} else {
					html.push(arr[i]);
				}
			}
			$('.result').html(html.join('<br>'));
		},
		
		showDumpResult: function(cmd, data){
			var arr = data.split('\n');
			var start = false;
			var list = [], obj = null, line = '', index = -1, item = null, key = '';
			for(var i = 0, k = arr.length; i < k; i++){
				if(/^Sessions with Ephemerals/.test(arr[i])){
					start = true;
				} else if(start){
					if(/^0x[0-9a-zA-Z]+\:$/.test(arr[i])){
						if(obj){
							list.push(obj);
						}
						obj = {
							name: arr[i].substring(0, arr[i].length - 1),
							item: {}
						};
					} else if(/^[\r\n\t\s]*\/dubbo\//.test(arr[i])){
						line = arr[i];
						if(line.match(/[%]+/g)){
							line = decodeURIComponent(line);
						}
						index = line.indexOf('://');
						if(index > 1){
							line = line.substring(index + 3);
							item = page.parseObj(line);
							if(item){
								key = item.application + ' (' + item.side + '-' + item.address + ')';
								if(!obj.item[key]){
									obj.item[key] = [];
								}
								obj.item[key].push(item);
							}
						}
					}
				}
			}
			// 
			$('.result').html('<ul class="ztree" id="ztree"></ul>');
			setTimeout(function(){
				var index = 1;
				var datas = [{
					id: 1,
					pId: 0,
					name: 'Dubbo'
				}];
				page.treeDatas = {};
				var id1 = '', id2 = '', id3 = '', id4 = '', arr = [];
				for(var i = 0, k = list.length; i < k; i++){
					id1 = ++index;
					datas.push({
						id: id1,
						pId: 1,
						name: list[i].name
					});
					for(var key in list[i].item){
						arr = list[i].item[key];
						id2 = ++index;
						datas.push({
							id: id2,
							pId: id1,
							name: key
						});
						for(var j = 0, l = arr.length; j < l; j++){
							id3 = ++index;
							datas.push({
								id: id3,
								pId: id2,
								name: arr[j]['interface']
							});
							id4 = arr[j]['application'] + '-' + arr[j]['address'] + '-' + arr[j]['interface'];
							for(var t = 0, o = arr[j].methods.length; t < o; t++){
								datas.push({
									id: id4 + '|' + t,
									pId: id3,
									name: arr[j].methods[t]
								});
							}
							page.treeDatas[id4] = arr[j];
						}
					}
				}
				page.renderTree(datas);
			}, 20);
		},
		
		renderTree: function(data){
			var setting = {
				check: {
					enable: false
				},
				data: { simpleData: { enable: true } },
				callback: {
					onClick: function(event, treeId, treeNode, clickFlag){
						if(!treeNode.isParent && clickFlag == 1){
							page.showNodeInfo(treeNode);
						} else {
							page.hideNodeInfo();
						}
					}
				}
			};
			zTree = $.fn.zTree.init($('#ztree'), setting, data);
		},
		
		parseObj: function(line){
			var obj = {};
			try{
				obj['address'] = line.substring(0, line.indexOf('/'));
				var param = line.substring(line.indexOf('?') + 1);
				var arr = param.split('&');
				var methods = '';
				for(var i = 0, k = arr.length; i < k; i++){
					if(arr[i].indexOf('anyhost=') != -1){
						obj['anyhost'] = arr[i].substring('anyhost='.length);
					} else if(arr[i].indexOf('application=') != -1){
						obj['application'] = arr[i].substring('application='.length);
					} else if(arr[i].indexOf('dubbo=') != -1){
						obj['dubbo'] = arr[i].substring('dubbo='.length);
					} else if(arr[i].indexOf('generic=') != -1){
						obj['generic'] = arr[i].substring('generic='.length);
					} else if(arr[i].indexOf('interface=') != -1){
						obj['interface'] = arr[i].substring('interface='.length);
					} else if(arr[i].indexOf('methods=') != -1){
						methods = arr[i].substring('methods='.length);
						obj['methods'] = methods.split(',');
					} else if(arr[i].indexOf('revision=') != -1){
						obj['revision'] = arr[i].substring('revision='.length);
					} else if(arr[i].indexOf('side=') != -1){
						obj['side'] = arr[i].substring('side='.length);
						//obj['stamp'] = arr[i].substring(arr[i].indexOf('tamp=') + 'tamp='.length);
					}
				}
			}catch(e){
				log.info(e);
				obj = null;
			}			
			return obj;
		},
		
		showNodeInfo: function(node){
			if(node){
				var id = node.id;
				id = id.split('|')[0];
				var zNode = page.treeDatas[id];
				var html = laytpl('info.html').render({
					name: zNode.application,
					address: zNode.address,
					dubbo: zNode.dubbo,
					revision: zNode.revision || '[未知]',
					interfaceName: zNode['interface'],
					method: node.name,
					side: zNode.side || '[未知]'
				});
				$('.node-info').html(html).removeClass('hidden');
			}
		},
		
		hideNodeInfo: function(){
			$('.node-info').addClass('hidden');
		},
		
		bindEvent: function(){
			
			$('.cmd-ul .item').on('click', function(){
				var $this = $(this),
					cmd = $this.text();
				$('.cmd-ul .item').removeClass('active');
				$this.addClass('active');
				page.run4cmd(cmd);
			});
			
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});