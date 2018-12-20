/**
 * 
 */
define(function(require, exports, module) {
	
	var datas = [], $obj = {}, selectId = '';
	function PageScript(){
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$obj = parent.$obj;
			if($obj){
				if($obj.type == 'jar'){
					$('.jar').removeClass('hidden').text($obj.name);
				} else {
					$('.dubbo').removeClass('hidden').text($obj.name);
				}
				
				$.useModule(['chosen'], function(){
					page.loadServerList();
				
				});
			}
			
			page.bindEvent();
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
					datas = rtn.content;
					var obj = {}, html1 = [], html2 = [];
					for(var i = 0; i < rtn.numberOfElements; i++){
						obj = rtn.content[i];
						html1.push(laytpl('option.html').render({
							name: obj.ip + ":" + obj.port
						}));
						if(i > 0){
							html2.push(laytpl('option.html').render({
								name: obj.ip + ":" + obj.port
							}));
						}
					}
					$('.sv1').html(laytpl('select1.html').render({
						option: html1.join('')
					}));
					$('.sv2').html(laytpl('select2.html').render({
						option: html2.join('')
					}));
					setTimeout(function(){
						$('#server1').chosen({
						    no_results_text: '没有找到',    // 当检索时没有找到匹配项时显示的提示文本
						    disable_search_threshold: 10, // 10 个以下的选择项则不显示检索框
						    search_contains: true         // 从任意位置开始检索
						}).on('change', function(){
							page.showServerList();
						});
						
						$('#server2').chosen({
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
		
		showServerList: function(){
			var value = $('#server1').val();
			var obj = {}, html2 = [], name = '';
			for(var i = 0; i < datas.length; i++){
				obj = datas[i];
				name = obj.ip + ":" + obj.port;
				if(name != value){
					html2.push(laytpl('option.html').render({
						name: name
					}));
				}
			}
			$('.sv2').html(laytpl('select2.html').render({
				option: html2.join('')
			}));
			setTimeout(function(){
				$('#server2').chosen({
				    no_results_text: '没有找到',    // 当检索时没有找到匹配项时显示的提示文本
				    disable_search_threshold: 10, // 10 个以下的选择项则不显示检索框
				    search_contains: true         // 从任意位置开始检索
				});
			}, 50);
		},
		
		bindEvent: function(){
			
			$('.btn-sync').on('click', function(e){
				var $this = $(this);
				$('.result').removeClass('hid');
				$this.attr("disabled", true)
				ajax.post({
					url: 'dubbo/test/sync',
					data: {
						name: $obj.name,
						address1: $('#server1').val(),
						address2: $('#server2').val()
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						alert("同步成功");
					} else {
						error(msg);
					}
				}).fail(function(){
					error('同步失败');
				}).always(function(){
					$('.result').addClass('hid');
					$this.attr("disabled", false)
				});
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});