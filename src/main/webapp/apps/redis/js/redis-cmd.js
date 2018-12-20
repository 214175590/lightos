/**
 * 
 */
define(function(require, exports, module) {
	var zTree = {};
	function PageScript(){
		this.$obj = {};
		this.datas = [];
		this.temps = [];
		this.index = 0;
		this.maxPage = 0;
		this.searchKey = '';
	}
	
	PageScript.prototype = {
		
		init: function(){
			if(parent['$obj']){
				page.$obj = parent['$obj'];
				page.runcmd('info');
			}
			
			page.bindEvent();
		},
		
		runcmd: function(cmd){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'redis/cmd',
				data: {
					rowId: page.$obj.rowId,
					cmd: cmd
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					if(cmd == 'client'){
						page.showClientResult(rtn.data);
					} else if(cmd == 'info'){
						page.showInfoResult(rtn.data);
					} else if(cmd == 'data') {
						page.datas = rtn.data;
						if(page.searchKey){
							page.startSearch();
						} else {
							page.showDataResult();
						}
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
		
		startSearch: function(){
			page.searchKey = $('#keyword').val();
			page.temps = [];
			if(page.searchKey){
				var obj = {};
				for(var i = 0, k = page.datas.length; i < k; i++){
					obj = page.datas[i];
					if(obj.k.indexOf(page.searchKey) != -1 || obj.v.indexOf(page.searchKey) != -1){
						page.temps.push({
							k: obj.k,
							v: obj.v
						});
					}
				}
			}
			page.showDataResult();
		},
		
		showInfoResult: function(data){
			var html = ['<table class="table table-auto">'];
			for(var k in data){
				html.push(laytpl('tr.html').render({
					trclass: '',
					name: k,
					value: data[k]
				}));
			}
			html.push('</table>');
			$('.result').html(html.join(''));
		},
		
		showDataResult: function(){
			var html = ['<table class="table table-auto">'];
			var s = page.index * 10, 
				e = s + 10;
			var data = page.searchKey ? page.temps : page.datas;
			var k = '', v = '';
			for(var i = 0, u = data.length; i < u; i++){
				if(i >= s && i < e){
					k = data[i].k;
					v = page.searchKey ? page.placeSearch(data[i].v, page.searchKey) : data[i].v;
					html.push(laytpl('tr.html').render({
						trclass: 'data-tr',
						name: page.searchKey ? page.placeSearch(k, page.searchKey) : k,
						key: k,
						value: /^DATA-ERROR:/.test(v) ? page.isError(v.substring(11)) : v
					}));
				} else if(i >= e){
					break;
				}
			}
			html.push('</table>');
			page.maxPage = parseInt(data.length/10) + (data.length%10 > 0 ? 1 : 0);
			$('.result').html(laytpl('data.html').render({
				word: page.searchKey || '',
				tables: html.join(''),
				pager: laytpl('p.html').render({
					index: page.index + 1,
					total: page.maxPage,
					count: data.length
				})
			}));
		},
		
		showClientResult: function(data){
			var body = [];
			var th = [], thinited = false;
			var items = [];
			for(var i = 0, k = data.length; i < k; i++){
				items = data[i];
				th.push('<tr>');
				body.push('<tr>');
				for(var j = 0, p = items.length; j < p; j++){
					if(!thinited){
						th.push('<th>' + items[j].k + '</th>');
					}
					body.push('<td>' + items[j].v + '</th>');
				}
				if(!thinited){
					th.push('</tr>');
					thinited = true;
				}
				body.push('</tr>');
			}
			var html = '<table class="table table-auto">' + th.join('') + body.join('') + '</table>';
			$('.result').html(html);		
		},
		
		isError: function(str){
			return '<span class="error">' + str + '</span>';
		},
		
		placeSearch: function(str, w){
			return str.replace(new RegExp(w, 'g'), '<span class="r">' + w + '</span>');
		},
		
		bindEvent: function(){
			
			$('.cmd-ul .item').on('click', function(){
				var $this = $(this),
					cmd = $this.text();
				$('.cmd-ul .item').removeClass('active');
				$this.addClass('active');
				page.searchKey = '';
				page.runcmd(cmd);
			});
			
			$('.result').on('click', '.btn-search', function(){
				page.index = 0;
				page.startSearch();
			});
			
			$('.result').on('click', '.prev', function(){
				if(page.index > 0){
					page.index = page.index - 1;
					page.showDataResult();
				}
			});
			
			$('.result').on('click', '.next', function(){
				if(page.index < (page.maxPage - 1)){
					page.index = page.index + 1;
					page.showDataResult();
				}
			});
			
			$('.result').on('click', '.icon-edit', function(){
				var that = $(this),
					key = that.parent().data('key'),
					value = that.parent().parent().next().text();
				$.confirm({
					title: "修改数据",
					msg: laytpl('form.html').render({
						key: key, 
						value: value == '""' ? '' : value
					}),
					yesText: '保存',
					yesClick: function($dailog){
						var zuiLoad = waiting('数据保存中...');
						key = $('.newk').val();
						value = $('.newv').val();
						var isappend = $('.isappend').is(':checked');
						if(key){
							ajax.post({
								url: 'redis/set',
								data: {
									rowId: page.$obj.rowId,
									key: key,
									value: value,
									type: isappend ? 'append' : 'set'
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									alert(rtn.data == 'OK' ? 'OK' : 'OK，数据长度：' + rtn.data);
									page.runcmd('data');
								} else {
									error(msg);
								}
							}).fail(function(){
								error('数据保存失败');
							}).always(function(){
								zuiLoad.hide();
							});
						} else {
							error("Key 不能为空");
						}
					},
					cancelClick: function($dailog){
					}
				});
			});
			
			$('.result').on('click', '.icon-trash', function(){
				var that = $(this),
					key = that.parent().data('key');
				$.confirm({
					title: "删除数据",
					msg: "您确定要删除此【" + key +"】数据吗？",
					yesText: '确定删除',
					yesClick: function($dailog){
						var zuiLoad = waiting('数据处理中...');
						ajax.post({
							url: 'redis/set',
							data: {
								rowId: page.$obj.rowId,
								key: key,
								type: 'del'
							}
						}).done(function(res, rtn, state, msg){
							if(state){
								alert("成功删除" + rtn.data + "项数据");
								page.runcmd('data');
							} else {
								error(msg);
							}
						}).fail(function(){
							error('数据处理失败');
						}).always(function(){
							zuiLoad.hide();
						});
					},
					cancelClick: function($dailog){
					}
				});
			});
			
			$('.result').on('click', '.btn-add', function(){
				$.confirm({
					title: "新增数据",
					msg: laytpl('form.html').render({
						key: '', value: ''
					}),
					yesText: '保存',
					yesClick: function($dailog){
						var zuiLoad = waiting('数据保存中...');
						var key = $('.newk').val();
						var value = $('.newv').val();
						var isappend = $('.isappend').is(':checked');
						if(key){
							ajax.post({
								url: 'redis/set',
								data: {
									rowId: page.$obj.rowId,
									key: key,
									value: value,
									type: isappend ? 'append' : 'set'
								}
							}).done(function(res, rtn, state, msg){
								if(state){
									alert(rtn.data == 'OK' ? 'OK' : 'OK，数据长度：' + rtn.data);
									page.runcmd('data');
								} else {
									error(msg);
								}
							}).fail(function(){
								error('数据保存失败');
							}).always(function(){
								zuiLoad.hide();
							});
						} else {
							error("Key 不能为空");
						}
					},
					cancelClick: function($dailog){
					}
				});
			});
			
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});