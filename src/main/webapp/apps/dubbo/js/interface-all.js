/**
 * 
 */
define(function(require, exports, module) {
	require('../../../lib/word/jquery.wordexport.js');
	
	function PageScript(){
		this.inp_index = 0;
		this.out_index = 0;
		this.$obj = {};
		this.allData = {};
		this.hasData = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$.useModule(["chosen"], function(){
				$('.chosen').chosen({disable_search: true});
				
				var p = utils.getUrlParam();
				page.$obj = utils.parseJSON(decodeURI(p.p));
				if(page.$obj){
					page.loadJarClass(page.$obj.name);
				}
			});
			
			page.bindEvent();
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
				if(state && rtn.data){
					page.allData = rtn.data;
					page.loadInterfaceInfo();
				}
			}).fail(function(){
				error('获取类/接口/方法数据失败');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		loadInterfaceInfo: function(){
			ajax.post({
				url: 'dubbo/interface/all',
				data: {
					name: page.$obj.name,
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.renderList(rtn.data);
				}
			}).fail(function(){
				if(top['SYSTEM']){
					top.SYSTEM.speak('数据加载失败');
				} else {
					error("数据加载失败");
				}
			});
		},
		
		renderList: function(rtn){
			var item = {}, inobj = {}, outobj = {}, methodObj = {}, data = {};
			var inhtml = [], outhtml = [], param = [], itemHtml = [], content = [];
			var methodName = '', methodNick = '', remark = "";
			for(var i = 0; i < page.allData.length; i++){
				item = page.allData[i];
				itemHtml = [];
				for(var j = 0; j < item.method.length; j++){
					methodObj = item.method[j];
					methodName = page.getMethodTypes(methodObj);
					data = page.getInterfaceSet(item.classPackage, methodName, rtn);
					methodNick = '';
					remark = '';
					inhtml = [];
					outhtml = [];
					if(data){
						remark = data.remark;
						methodNick = data.methodNick || '';
						//in
						if(data.inParam){
							param = utils.parseJSON(data.inParam);
							for(var k = 0; k < param.length; k++){
								page.inp_index = page.inp_index + 1;
								inhtml.push(laytpl("inp-tr.html").render({
									index: page.inp_index,
									name: param[k].name,
									type: param[k].type,
									len: param[k].len,
									must: param[k].must == 'n' ? '必需' : '可选',
									desc: param[k].desc
								}));
							}
						}
						//out
						if(data.outParam && data.outParam){
							param = utils.parseJSON(data.outParam);
							for(var k = 0; k < param.length; k++){
								page.out_index = page.out_index + 1;
								outhtml.push(laytpl("out-tr.html").render({
									index: page.out_index,
									name: param[k].name,
									type: param[k].type,
									desc: param[k].desc
								}));
							}
						}
					}
					
					// item
					itemHtml.push(laytpl('item.html').render({
						method: methodName,
						methodNick: methodNick,
						desc: remark,
						inparam: inhtml.join(''),
						outparam: outhtml.join('')
					}));
				}
				
				
				if(itemHtml.length){
					content.push(laytpl('content.html').render({
						className: item.classPackage,
						items: itemHtml.join('')
					}));
				} else {
					content.push(laytpl('content.html').render({
						className: item.classPackage,
						items: "无接口"
					}));
				}
			}
			
			$('#content').html(content.join(''));
		},
		
		getMethodTypes: function(obj){
			var res = obj.methodName + '(', arr = [];
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
		
		getInterfaceSet: function(className, methodName, data){
			var res = null;
			if(data){
				for(var i = 0; i < data.length; i++){
					if(className == data[i].interfaceName && methodName == data[i].methodName){
						res = data[i];
						break;
					}
				}
			}
			return res;
		},
		
		bindEvent: function(){
			
			$('.content').on('click', '.icon-btn', function(){
				var $this = $(this),
					state = $this.data('state'),
					$parent = $this.parent().parent();
				if(state == 1){
					$this.removeClass('icon-angle-down').addClass('icon-angle-right');
					if($parent.hasClass('item')){ // 类级别
						$parent.find('.sub').addClass('hidden');
					} else { // 全局
						$parent.find('.item').addClass('hidden');
					}
					$this.data('state', '0');
				} else {
					$this.addClass('icon-angle-down').removeClass('icon-angle-right');
					if($parent.hasClass('item')){ // 类级别
						$parent.find('.sub').removeClass('hidden');
					} else { // 全局
						$parent.find('.item').removeClass('hidden');
					}
					$this.data('state', '1');
				}
			});
			
			$('.btn-word').on('click', function(){
				$("#content").wordExport();
			});

		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});