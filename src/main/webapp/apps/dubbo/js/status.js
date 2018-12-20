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
			$obj = {
				dubbo: p.p,
				interfaceName: p.n
			};
			if($obj.dubbo){
				$('.dubbo').text($obj.dubbo);
				if($obj.interfaceName){
					$('.interface').text($obj.interfaceName);
				}
			}
			
			page.getStatus();
			
			page.bindEvent();
		},
		
		getStatus: function(){
			var zuiLoad = waiting('状态数据加载中...');
			var name = $obj.dubbo;
			ajax.post({
				url: 'dubbo/status',
				data: {
					ip: name.split(':')[0],
					port: name.split(':')[1],
					interfaceName: $obj.interfaceName
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.showStatus(rtn.data);
				} else {
					error("状态数据加载失败:" + msg);
					$('.info').val("状态数据加载失败:" + msg);
				}
			}).fail(function(){
				error("状态数据加载失败");
				log.error('error：', arguments);
			}).always(function(){
				zuiLoad.hide();
				$('.btn-sync').attr('disabled', false);
			});
		},
		
		showStatus: function(datas){
			//telnet> dubbo>
			if(datas.indexOf('telnet> dubbo>')){
				datas = datas.replace('telnet> dubbo>', '');
			}
			$('.info').val(datas);
		},
		
		bindEvent: function(){
			
			$('.btn-sync').on('click', function(e){
				var $this = $(this);
				$this.attr('disabled', true);
				page.getStatus();
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});