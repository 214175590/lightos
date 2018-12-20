/**
 * 
 */
define(function(require, exports, module) {
	function PageScript(){
		this.dataIndex = 0;
		this.dataSize = 10;
		this.$obj = {};
		this.inp_index = 1;
		this.out_index = 1;
		this.rowId = 0;
		
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$.useModule(["chosen"], function(){
				$('.chosen').chosen({disable_search: true});
				
				var p = utils.getUrlParam();
				page.$obj = utils.parseJSON(decodeURI(p.p));
				if(page.$obj){
					if(page.$obj.type == 'jar'){ 
						$('.st0').removeClass('hidden');
					} else {
						$('.st1').removeClass('hidden');
					}
					$('#className').text(page.$obj.interfaceName);
					$('#method').text(page.$obj.method);
					
					page.loadInterfaceInfo();
				}
			});
			
			page.bindEvent();
		},
		
		loadInterfaceInfo: function(){
			ajax.post({
				url: 'dubbo/interface/get',
				data: {
					name: page.$obj.name,
					interfaceName: page.$obj.interfaceName,
					methodName: page.$obj.method
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.render(rtn.data);
				}
			}).fail(function(){
				if(top['SYSTEM']){
					top.SYSTEM.speak('数据加载失败');
				} else {
					error("数据加载失败");
				}
			});
		},
		
		render: function(data){
			if(data && data.rowId){
				page.rowId = data.rowId;
				$('#remark').val(data.remark);
				$('#methodNick').val(data.methodNick);
				//in
				if(data.inParam){
					var param = utils.parseJSON(data.inParam);
					var htmls = [];
					for(var i = 0; i < param.length; i++){
						page.inp_index = page.inp_index + 1;
						htmls.push(laytpl("inp-tr.html").render({
							index: page.inp_index,
							name: param[i].name,
							type: param[i].type,
							len: param[i].len,
							must: param[i].must,
							desc: param[i].desc
						}));
					}
					if(htmls.length){
						$('#inp-tbody').html(htmls.join(''));
					}
				}
				//out
				if(data.outParam && data.outParam){
					var param = utils.parseJSON(data.outParam);
					var htmls = [];
					for(var i = 0; i < param.length; i++){
						page.out_index = page.out_index + 1;
						htmls.push(laytpl("out-tr.html").render({
							index: page.out_index,
							name: param[i].name,
							type: param[i].type,
							desc: param[i].desc
						}));
					}
					if(htmls.length){
						$('#out-tbody').html(htmls.join(''));
					}
				}
				setTimeout(function(){
					$('.table .chosen').chosen({disable_search: true});
				}, 100);
			}
		},
		
		bindEvent: function(){
			
			$('.btn-inp-addline').on('click', function(){
				page.inp_index = page.inp_index + 1;
				$('#inp-tbody').append(laytpl("inp-tr.html").render({
					index: page.inp_index,
					name: "",
					type: "String",
					len: "0",
					must: "y",
					desc: ""
				}));
				$('#tr-inp-' + page.inp_index).find('.chosen').chosen({disable_search: true});
			});
			
			$('.btn-out-addline').on('click', function(){
				page.out_index = page.out_index + 1;
				$('#out-tbody').append(laytpl("out-tr.html").render({
					index: page.out_index,
					name: "",
					type: "String",
					desc: ""
				}));
				$('#tr-out-' + page.out_index).find('.chosen').chosen({disable_search: true});
			});
			
			$('.table').on('click', '.btn-del-line', function(){
				$('#tr-' + $(this).data("type") + '-' + $(this).data("index")).remove();
			});
			
			$('.btn-cancel').on('click', function(){
				if(parent['$newDialog']){
					parent['$newDialog'].close();
				}
			});

			$('.btn-save').on('click', function(){
				var methodNick = $('#methodNick').val();
				var remark = $('#remark').val();
				if(!methodNick){
					error("请输入接口中文名称");
					return;
				}
				var inpObjs = page.getParams('inp');
				var outObjs = page.getParams('out');
				var $btn = $(this);
				log.info(page.$obj, inpObjs, outObjs);
				
				$btn.attr('disabled', true);
				ajax.post({
					url: 'dubbo/interface/save',
					data: {
						rowId: page.rowId || 0,
						name: page.$obj.name,
						interfaceName: page.$obj.interfaceName,
						methodName: page.$obj.method,
						remark: remark,
						methodNick: methodNick,
						inparam: inpObjs,
						outparam: outObjs
					}
				}).done(function(res, rtn, state, msg){
					if(state){
						alert("保存成功");
						if(top['SYSTEM']){
							top.SYSTEM.speak('保存成功');
						}
					} else {
						error(msg);
					}
				}).fail(function(){
					if(top['SYSTEM']){
						top.SYSTEM.speak('保存失败');
					} else {
						error("保存失败");
					}
				}).always(function(){
					setTimeout(function(){
						$btn.attr('disabled', false);
					}, 1500);
				});
			});
		},
		
		getParams: function(flag){
			var objs = [], line = 0;
			$('#'+flag+'-tbody tr').each(function(i, e){
				var $tr = $(e),
					index = $tr.data('index'),
					name = $('#'+flag+'_name' + index).val(),
					type = $('#'+flag+'_type' + index).val(),
					len = $('#'+flag+'_len' + index).val(),
					must = $('#'+flag+'_must' + index).val(),
					desc = $('#'+flag+'_desc' + index).val();
				if(name){
					if(flag == 'inp'){
						objs.push({
							name: name,
							type: type || 'String',
							len: len || '0',
							must: must || 'y',
							desc: desc
						});
					} else {
						objs.push({
							name: name,
							type: type || 'String',
							desc: desc
						});
					}
				}
			});
			return objs;
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});