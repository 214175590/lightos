/**
 * zui.pager.js 1.0
 * (c) 2016 Yisin
 * Underscore may be freely distributed under the MIT license.
 */
define(function(require, exports, module) {
	var tempSize = 10, storeKey = '_GRID_COLUMN_VIEW_LIST';
	var ultpl = 
		'<ul class="pager pager-loose">' +
	    '<li class="first {first_disabled}"><a href="javascript:;" data-toggle="tooltip" title="首页(Home)">首页</a></li>' +
	    '<li class="previous {previous_disabled}"><a href="javascript:;" data-toggle="tooltip" title="上一页(Up)">上一页</a></li>' +
	    '{li_list}' +
	    '<li class="next {next_disabled}"><a href="javascript:;" data-toggle="tooltip" title="下一页(Down)">下一页</a></li>' +
	    '<li class="last {last_disabled}"><a href="javascript:;" data-toggle="tooltip" title="尾页(End)">尾页</a></li>' +
	    '<li class="refresh"><a href="javascript:;" data-toggle="tooltip" title="刷新(F5)"><i class="icon icon-refresh"></i></a></li>' +
	    '<li class="goto {goto_disabled}"><a href="javascript:;" data-toggle="tooltip" title="跳转到">跳转到</a></li>' +
	    '<li><input class="page pageinput" value="{curr_page}" {input_disabled}/>页</li>' +
	    '<li>，每页<select class="pager-chosen"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option><option value="100">100</option></select>条</li>' +
	    '<li>，共{totalPages}页，共{totalElements}条记录<div class="pager-time">，耗时：{finishTime}</div>.</li>' +
	    '<li class="pager-loading hidden"><i class="icon icon-spin icon-spinner"></i></li>' +
	    '<li class="pager-export {export_show}"><button class="btn btn-sm btn-primary" data-toggle="tooltip" title="导出(Alt+X)"><i class="icon icon-file-excel"></i> 导出</button></li>' +
	    '<li class="pager-view {ctl_show}"><button class="btn btn-sm" data-toggle="tooltip" title="设置显示列(Alt+V)"><i class="icon icon-table"></i></button></li>' +
	    '</ul>',
	    litpl = '<li class="num {active}"><a href="javascript:;" data-page="{index}" data-toggle="tooltip" title="跳转到第 {index} 页(Alt + {index})">{index}</a></li>';
	
	function ZuiPager(){
		this.page = {};
		this.selector = '';
		this.$ele = null;
		this._pageIndex = 0;
		this._pageSize = 10;
		this.callback = null;
		this.maxinumLi = 6; // 分页组件数字显示最大个数
		this.loading = false;
		this.startTime = new Date().getTime();
		/*
		 * 采用模板时，restType的值必须指定为 template,templateName为使用的模板文件名称
		 * 当输出有其它数据时，以extData数据元素传递导出，只支持模板导出
		 */
		this.options = {
			showExport: false, // 是否显示导出按钮，默认不显示
			ctlColumn: true, // 是否显示控制列显示按钮，默认显示
			showChangeSize: true, // 是否显示更改每页显示数量，默认显示
			showTime: true, // 是否显示加载时间，默认显示
			adjust: false, // 是否自动调整表格总宽度，默认不调整
			resType: 'object',
			resIndex: [],
			resKey: [],
			templateName: '',
			extData:[]
		};
		/*first: true
		last: false
		number: 0
		numberOfElements: 10
		size: 10
		totalElements: 16
		totalPages: 2*/
	}
	
	ZuiPager.prototype.init = function(size, render, max){
		this._pageSize = size;
		tempSize = size;
		this.callback = render || function(){
			console.error("分页组件回调函数未设置");
		};
		this.maxinumLi = max || 6;
		var keyIndex = {
			"48": '0', "49": '1', "50": '2', "51": '3', "52": '4', "53": '5', "54": '6', "55": '7', "56": '8', "57": '9',
			"86": 'v', "88": 'x'
		}
		var intervalID = setInterval(function(){
			if(window['$'] && $.md5){
				clearInterval(intervalID);
				pager.pageHash = $.md5(document.location.href);
				// 注册快捷键
				try{
					if(top.regShortKey){
						top.regShortKey(pager.pageHash + "38", previous); // ↑
						top.regShortKey(pager.pageHash + "40", next); // ↓
						top.regShortKey(pager.pageHash + "33", previous); // Page Up
						top.regShortKey(pager.pageHash + "34", next); // Page Down
						top.regShortKey(pager.pageHash + "36", first); // Home
						top.regShortKey(pager.pageHash + "35", last); // End
						top.regShortKey(pager.pageHash + "116", function(e, code){
							pager.load();
						});
						top.regShortKey(pager.pageHash + "Alt**", function(e, code){
							var key = code.substring(3),
								num = "";
							for(var i = 0; i < (key.length - 1); i += 2){
								num += keyIndex[key.substr(i, 2)];
							}
							if(/^[0-9]+$/g.test(num)){ // 数字键
								num = parseInt(num);
								gotopage(num);
							} else if(num == 'v'){ // 显示隐藏列
								showTableGridView();
							} else if(num == 'x'){ // 导出数据
								var $btn = $(pager.selector + ' .pager-export .btn');
								$btn.attr('disabled', true);
								pager.exportData(function(){
									$btn.attr('disabled', false);
								});
							}
						});
					}
				}catch(e){}
			}
		}, 200);
	};
	
	ZuiPager.prototype.setOption = function(ops){
		this.options = $.extend(this.options, ops);
	};
	
	ZuiPager.prototype.reset = function(){
		this._pageIndex = 0;
		this._pageSize = tempSize;
	};
	
	ZuiPager.prototype.setPageSize = function(size){
		this._pageSize = size || 10;
	};
	
	ZuiPager.prototype.setPageNum = function(num){
		this._pageIndex = num || 0;
	};
	
	ZuiPager.prototype.create = function(selector, page, ops){
		this.options.showExport = false;
		this.selector = selector;
		this.$ele = $(selector);
		this.setOption(ops);
		if(this.$ele.length && page && page.numberOfElements != undefined){
			this.page = page;
			render();
		} else {
			new Error("参数不正确。", selector, page);
		}		
	};
	
	ZuiPager.prototype.startLoad = function(){
		pager.startTime = new Date().getTime();
	};
	
	ZuiPager.prototype.load = function(){
		if(!pager.loading){
			pager.loading = true;
			this.data.pager = this;
			this.data.pager_filter = true;
			$(pager.selector + ' .pager-loading').removeClass('hidden');
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			pager.startTime = new Date().getTime();
			ajax.post(this.data).done(function(res, rtn, state, msg){
				if(state && pager.callback){
					pager.callback(rtn.data);
				} else {
					console.error(new Error("数据加载错误：" + msg));
				}
			}).fail(function(e){
				error('数据加载时异常：', e.path, e.statueText);
				console.error(new Error("数据加载错误："), arguments);
			}).always(function(){
				pager.loading = false;
				zuiLoad.hide();
			});
		}
	};
	
	ZuiPager.prototype.exportData = function(callback){
		if(!pager.loading){
			try{
				var params = utils.getUrlParam(),
					rightId = params._MenuRightId,
					menuJson = sessionStorage.getItem('_MENU_NAME_JSON'),
					title = '', text = [];
				if(menuJson){
					menuJson = utils.parseJSON(menuJson);
					title = menuJson[rightId][1];
					
					$('.table.datatable tr th').each(function(i, e){
						var th = $(this).text().trim();
						if(th != '#' && th != '操作'){
							text.push(th);
						}
					});
					
				}
				pager.loading = true;
				pager.data.data['ISEXPORT'] = true;
				pager.data.data['EXPORTDATA'] = {
					"title": title,
					"text": text,
					"resType": pager.options.resType,
					"resIndex": pager.options.resIndex,
					"resKey": pager.options.resKey,
					"templateName":pager.options.templateName,
					"extData":pager.options.extData
				};
				pager.data.data['_pageSize'] = 99999999;
				pager.data.data['_pageIndex'] = 0;
				var zuiLoad = new $.ZuiLoader().show('导出数据准备中...');
				ajax.post(this.data).done(function(res, rtn, state, msg){
					if(state){
						var file = {fileName: rtn.data};
						file = encodeURI(encodeURI(utils.toJSON(file)));
						var url = consts.WEB_ROOT + "m806/f80602";
						var $iframe = $('<iframe width="0" height="0"></iframe>'),
							$form = $('<form id="exportForm" action="" method="post"><input name="jsonValue" value="' + file + '"></form>').attr('action', url);
						$('body').append($iframe);
						var agent = navigator && navigator.userAgent;
						if(agent && agent.indexOf('MSIE 9.0') != -1){ // IE9特殊处理
							$iframe.html($form)
						} else {
							$iframe.contents().find('body').html($form);												
						}
						$form[0].submit();
						
						setTimeout(function(){
							$iframe.remove();
							callback && callback.call(pager);
						}, 4000);
						
					} else {
						error('数据导出失败：' + msg);
						console.error("数据导出失败：", msg);
						callback && callback.call(pager);
					}
				}).fail(function(e){
					error('数据导出时出现异常：' + ((e && e.path) + "，" + (e && e.statueText)));
					console.error("数据导出时出现异常：", arguments);
					callback && callback.call(pager);
				}).always(function(e){
					delete pager.data.data['ISEXPORT'];
					pager.loading = false;
					zuiLoad.hide();
				});
			}catch(e){
			}
		}
	};
	
	function render(){
		// 自动调整表格宽度
		if(pager.options.adjust){
			autoAdjustDatagridWidth();
		}
		
		var totalPages = pager.page.totalPages,
			currIndex = pager.page.number,
			totalElements = pager.page.totalElements,
			isFirst = pager.page.first,
			isLast = pager.page.last,
			htmls = '';
		
		var endTime = new Date().getTime();
		var finishTime = endTime - pager.startTime;
		
		htmls += parsetpl(ultpl, {
			"first_disabled": isFirst ? "disabled" : "",
			"previous_disabled": isFirst ? "disabled" : "",
			"next_disabled": isLast ? "disabled" : "",
			"last_disabled": isLast ? "disabled" : "",
			"goto_disabled": isFirst && isLast ? "disabled" : "",
			"curr_page": (currIndex + 1),
			"input_disabled": isFirst && isLast ? 'disabled="disabled"' : "",
			"totalPages": totalPages,
			"totalElements": totalElements,
			"li_list": renderLiList(currIndex, totalPages),
			"finishTime": (finishTime/1000).toFixed(2) + '秒',
			"export_show": pager.options.showExport ? '' : 'hidden',
			"ctl_show": pager.options.ctlColumn && totalPages ? '' : 'hidden'
		});
		
		pager.$ele.html(htmls);
		pager.$ele.find('[data-toggle="tooltip"]').tooltip({html: true});
		if(!pager.options.showTime){
			pager.$ele.find('.pager-time').hide();
		}
		if(pager.options.showChangeSize){
			pager.$ele.find('.pager-chosen').val(pager._pageSize);
		} else {
			pager.$ele.find('.pager-chosen').parent().hide();
		}
		
		if(totalPages < 2 && totalElements <= 10){
			pager.$ele.find('.pager-chosen').attr('disabled', true);
		}
		if(totalElements == 0){
			pager.$ele.find('.pager-export').remove();
		}
		
		bindEvent();
		// 过滤设置了不显示的列
		runCustomGridView();
	}
	
	function runCustomGridView(){
		if(window['localStorage']){
			var columnIndex = localStorage.getItem(pager.pageHash + storeKey) || "{}";
			var columnJson = utils.parseJSON(columnIndex);
			for(var k in columnJson){
				changeTableThTdView(columnJson[k], false);
			}
		}
		
		$('.table.datatable').each(function(){
			var $this = $(this),
			tid = $this.data("datatable-id");
			if(tid){
				var $datatable = $('#' + tid);
				$datatable.find('.table.table-datatable tr td').each(function(i, e){
					var $td = $(this),
						tdtext = $td.text().trim();
					if(tdtext && tdtext != '#'){
						$td.attr('title', tdtext);
					}
				});
			}
		});
		/*var tid = $('.table.datatable').data("datatable-id");
		if(tid){
			var $datatable = $('#' + tid);
			$datatable.find('.table.table-datatable tr td').each(function(i, e){
				var $td = $(this),
					tdtext = $td.text().trim();
				if(tdtext && tdtext != '#'){
					$td.attr('title', tdtext);
				}
			});
		}*/
	}
	
	function autoAdjustDatagridWidth(){
		var hidCount = 0;
		if(window['localStorage']){
			var columnIndex = localStorage.getItem(pager.pageHash + storeKey) || "{}";
			var columnJson = utils.parseJSON(columnIndex);
			for(var k in columnJson){
				hidCount++;
			}
		}
		$('.table.datatable').each(function(){
			var $this = $(this),
				thSize = $this.find('thead th').length - hidCount,
				tid = $this.data("datatable-id"),
				screenWidth = $(document).width(),
				minWidth = thSize * 150;
			if(tid){
				var $datatable = $('#' + tid);
				if(screenWidth < minWidth){
					$datatable.css('width', minWidth);
					try{
						pager.$ele.appendTo($('.result-panel'));
					}catch(e){}
				}
			}
		});
	}
	
	function renderLiList(currIndex, totalPages){
		var lihtml = '';
		if(totalPages <= pager.maxinumLi){
			for(var i = 0; i < totalPages; i++){
				lihtml += parsetpl(litpl, {
					index: i + 1,
					active: currIndex == i ? 'active' : ''
				});
			}
		} else {
			var currPage = pager.page.number;
			if(currPage < pager.maxinumLi){
				for(var i = 0; i < pager.maxinumLi; i++){
					lihtml += parsetpl(litpl, {
						index: i + 1,
						active: currIndex == i ? 'active' : ''
					});
				}
				lihtml += parsetpl(litpl, {
					index: '....',
					active: 'disabled'
				});
				lihtml += parsetpl(litpl, {
					index: totalPages,
					active: ''
				});
			} else if(currPage >= pager.maxinumLi && currPage < (totalPages - pager.maxinumLi)){
				for(var i = (currPage - pager.maxinumLi + 1); i < (currPage + 1); i++){
					lihtml += parsetpl(litpl, {
						index: i + 1,
						active: currIndex == i ? 'active' : ''
					});
				}
				lihtml += parsetpl(litpl, {
					index: '....',
					active: 'disabled'
				});
				lihtml += parsetpl(litpl, {
					index: totalPages,
					active: ''
				});
			} else if(currPage >= (totalPages - pager.maxinumLi)){
				lihtml += parsetpl(litpl, {
					index: 1,
					active: ''
				});
				lihtml += parsetpl(litpl, {
					index: '....',
					active: 'disabled'
				});
				for(var i = (totalPages - pager.maxinumLi); i < totalPages; i++){
					lihtml += parsetpl(litpl, {
						index: i + 1,
						active: currIndex == i ? 'active' : ''
					});
				}
			}
		}
		return lihtml;
	}
	
	function bindEvent(){
		$(pager.selector + ' .pager li a').on('click', function(){
			var that = $(this),
				index = that.data('page'),
				parent = that.parent();
			if(!parent.hasClass('disabled') && parent.hasClass('first')){ // 跳转到首页
				first();
			} else if(!parent.hasClass('disabled') && parent.hasClass('previous')){ // 上一页
				previous();
			} else if(!parent.hasClass('disabled') && parent.hasClass('next')){ // 下一页
				next();
			} else if(!parent.hasClass('disabled') && parent.hasClass('last')){ // 尾页
				last();
			} else if(parent.hasClass('goto')){ // 跳转到
				var page = pager.$ele.find('.page.pageinput').val();
				gotopage(page);
			} else if(parent.hasClass('num')){ // 指定页
				gotopage(index);
			} else if(parent.hasClass('refresh')){ // 刷新
				pager.load();
			}
		});
		
		$(pager.selector + ' .pager-chosen').on('change', function(){
			var $chosen = $(this),
				size = $chosen.val();
			if(size){
				pager._pageSize = parseInt(size);
				pager.load();
			}
		});
		
		$(pager.selector + ' .pager-export .btn').on('click', function(){
			var self = $(this);
			self.attr('disabled', true);
			pager.exportData(function(){
				self.attr('disabled', false);
			});
		});
		
		$(pager.selector + ' .pager-view .btn').on('click', function(){
			showTableGridView();
		});
	}
	
	function showTableGridView(){
		var htmls = '<div class="table-view-item-box">', columnJson = {};
		if(window['localStorage']){
			var columnIndex = localStorage.getItem(pager.pageHash + storeKey) || "{}";
			columnJson = utils.parseJSON(columnIndex);			
		}
		var tid = $('.table.datatable').data("datatable-id")
		if(tid){
			var $datatable = $('#' + tid);
			$datatable.find('.table.table-datatable tr th').each(function(i, e){
				var $th = $(this),
					thtext = $th.text().trim();
				if(thtext == ''){
					thtext = '□';
				}
				htmls += utils.formatByJson('<div class="table-view-item {check} {disabled}" data-index="{index}"><i class="icon icon-{checkicon}"></i> {text}</div>', {
					index: i,
					text: thtext == '□' ? '<i class="icon icon-check-empty"></i>' : thtext,
					check: columnJson['K' + i] == undefined ? 'check' : '',
					checkicon: columnJson['K' + i] == undefined ? 'checked' : 'check-empty',
					disabled: thtext == '操作' || thtext == '□' ? 'disabled' : ''
				})
			});
			htmls += '</div>';
		
			var $pager_grid_view_dialog = new $.zui.ModalTrigger({
				name: 'showTableGridView',
				title: '设置表格列显示或隐藏',
				moveable: true,
				waittime: consts.PAGE_LOAD_TIME,
				width: 650,
				height: 400,
				custom: htmls
			});
			// 显示弹出框
			$pager_grid_view_dialog.show();
			
			// 绑定事件
			$('#showTableGridView .modal-body .table-view-item').on('click', function(){
				var $item = $(this);
				if(!$item.hasClass('disabled')){
					if($item.hasClass('check')){
						$item.removeClass('check');
						$item.find('i.icon').removeClass('icon-checked').addClass('icon-check-empty');
						changeTableThTdView($item.data('index'), false);
					} else {
						$item.addClass('check');
						$item.find('i.icon').addClass('icon-checked').removeClass('icon-check-empty');
						changeTableThTdView($item.data('index'), true);
					}
				}
			});
			
			$('#showTableGridView').on('hidden.zui.modal', function(){
				$(this).remove();
			});
		}
	}
	
	function changeTableThTdView(index, display){
		var tid = $('.table.datatable').data("datatable-id")
		if(tid){
			var $datatable = $('#' + tid);
			$datatable.find('.table.table-datatable tr th').each(function(i, e){
				var $th = $(this);
				if(i == index){
					if(display){
						$th.css('display', $th.data('display'));
					} else {
						$th.data('display', $th.css('display'));
						$th.css('display', 'none');
					}
					return;
				}
			});
			$datatable.find('.table.table-datatable tr').each(function(i, e){
				var $tr = $(this);
				var $td = $tr.find('td:eq(' + index + ')');
				if($td){
					if(display){
						$td.css('display', $td.data('display'));
					} else {
						$td.data('display', $td.css('display'));
						$td.css('display', 'none');
					}
				}
			});
			if(window['localStorage']){
				var columnIndex = localStorage.getItem(pager.pageHash + storeKey) || "{}";
				var columnJson = utils.parseJSON(columnIndex);
				if(display){ // 显示
					delete columnJson['K' + index];
				} else { // 隐藏
					columnJson['K' + index] = index;
				}
				localStorage.setItem(pager.pageHash + storeKey, utils.toJSON(columnJson));
			}
		}
	}
	
	function first(){
		pager._pageIndex = 0;
		pager.load();
	}
	
	function previous(){
		if(pager._pageIndex > 0){
			pager._pageIndex--;
			pager.load();
		}
	}

	function next(){
		if(pager._pageIndex < pager.page.totalPages - 1){
			pager._pageIndex++;
			pager.load();
		}
	}
	
	function last(){
		pager._pageIndex = pager.page.totalPages - 1;
		pager.load();
	}
	
	function gotopage(page){
		if(/[0-9]/g.test(page)){
			page = parseInt(page) - 1;
			if(page >= 0 && page < pager.page.totalPages){
				pager._pageIndex = page;
				pager.load();
			}
		}
	}
	
	function parsetpl(tmpl, data){
	    var format = {
	        name: function(x) {
	            return x;
	        }
	    };
	    return tmpl && tmpl.replace(/{(\w+)}/g, function(m1, m2) {
	        if (!m2)
	            return "";
	        return (format && format[m2]) ? format[m2](data[m2]) : data[m2];
	    });
	};
	
	var pager = new ZuiPager();
	return pager;
});