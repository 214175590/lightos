/**
 * 
 */
define(function(require, exports, module) {
	
	function PageScript(){
		this.datas = [];
		this.svnsrv = '';
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			$.useModule(['chosen', 'datetimepicker', 'datatable'], function(){
				$('#startDate').val(utils.formatDate(new Date().getTime() - (1000 * 60 * 60 * 24 * 6), 'yyyy-MM-dd'));
				$('#endDate').val(utils.formatDate(new Date(), 'yyyy-MM-dd'));
				
				// 选择时间和日期
				$(".form-date").datetimepicker({
				    weekStart: 1,
				    todayBtn:  1,
				    autoclose: 1,
				    todayHighlight: 1,
				    startView: 2,
				    forceParse: 0,
				    minView: 2,
				    format: "yyyy-mm-dd"
				}).on('changeDate', function(ev){
					var id = this.id;
				    if(id == 'startDate'){
				    	$('#endDate').datetimepicker('setStartDate', $('#startDate').val());
				    	var edstr = $('#endDate').val();
				    	if(edstr){
				    		var st = parseInt($('#startDate').val().replace(/-/g, ''));
				    		var ed = parseInt(edstr.replace(/-/g, ''));
				    		if(st > ed){
				    			$('#endDate').val('');
				    			$('#startDate').datetimepicker('setEndDate', $('#endDate').val());
				    		}
				    	}
				    }
				    var p = $('#project').val();
					if(p){
						page.load(p);
					}
				});
				
				$('.chosen').chosen({});
				
				page.loadProjects();
				
				page.bindEvent();
			});
			
		},
		
		loadProjects: function(){
			$('.btn-load').attr('disabled', true);
			var zuiLoad = waiting('列表加载中...');
			ajax.post({
				url: 'svn/get/projects',
				data: {}
			}).done(function(res, rtn, state, msg){
				log.info(res);
				if(state){
					page.renderProject(rtn.data);
				}
			}).fail(function(e){
				error('error');
				log.error(e);
			}).always(function(){
				zuiLoad.hide();
				$('.btn-load').attr('disabled', false);
			});
		},
		
		renderProject: function(datas){
			var html = ['<option value="">选择一个项目</option>'];
			if(datas && datas.length){
				var obj = null;
				for(var i = 0, k = datas.length; i < k; i++){
					obj = datas[i];
					html.push(laytpl('ops.html').render({
						name: obj.projectName,
						value: obj.projectUrl,
						selected: (function(){
							var a = $.zui.store.getItem('svn_view_project');
							if(a){
								return a == obj.projectName;
							}
							return i == 0;
						})()
					}));
				}
			}
			html.push('<option value="add">添加项目</option>');
			$('#project').html(html.join('')).trigger('chosen:updated');
			
			setTimeout(function(){
				var p = $('#project').val();
				if(p){
					page.load(p);
				}
			}, 300);
		},
		
		load: function(p){
			var startDate = $('#startDate').val();
			var endDate = $('#endDate').val();
			var filename = $('#filename').val();
			var version = $('#version').val();
			var author = $('#author').val();
			ajax.post({
				url: 'svn/get/date',
				data: {
					"path": p,
					"begin": startDate,
					"end": endDate,
					"version": version,
					"author": author
				}
			}).done(function(res, rtn, state, msg){
				log.info(res);
				if(state){
					page.renderTable1(p, rtn.data);
				} else {
					$('#data-body1').html('');
					$('#data-body2').html('');
					$('table.datatable').datatable('load');
				}
			}).fail(function(e){
				error('error');
				log.error(e);
			});
		},
		
		renderTable1: function(p, datas){
			if(datas && datas.length){
				page.datas = datas;
				page.svnsrv = page.getSvnsrv(p);
				var obj = null, trHtmls = [];
				for(var i = 0, k = datas.length; i < k; i++){
					obj = datas[i];
					trHtmls.push(laytpl('list-tr1.tpl').render({
						"trclass": '',
						"version": obj.version,
						"author": obj.author,
						"date": utils.formatDate(obj.date),
						"desc": (function(){
							var d = obj.desc;
							if(d && d.length > 20){
								d = d.substring(0, 20) + '...';
							}
							return d;
						})(),
						"btns": (function(){
							var icon = [], type = '', aj = {};
							for (var j = 0, u = obj.files.length; j < u; j++) {
								type = obj.files[j].type;
								if (type == 'A' && !aj['A']) {
									aj['A'] = 'A';
									icon[0] = laytpl('add.html').render({});
								} else if (type == 'M' && !aj['M']) {
									aj['M'] = 'M';
									icon[1] = laytpl('edit.html').render({});
								} else if (type == 'D' && !aj['D']) {
									aj['D'] = 'D';
									icon[2] = laytpl('del.html').render({});
								}
							}
							return icon.join('');
						})()
					}));
				}
				$('#data-body1').html(trHtmls.join(''));
				if(page.firstLoad){
					page.firstLoad = false;
					$('table.datatable').datatable({
						checkable: false,
						checkByClickRow: false
					});
				} else {
					$('table.datatable').datatable('load');
				}
				page.ajustWidth();
			}
		},
		
		renderTable2: function(datas, ver){
			if(datas && datas.length){
				var obj = null, trHtmls = [];
				var fillname = $('#filename').val();
				var findname = function(n, m){
					if(m){
						var r = new RegExp(m, 'g');
						n = n.replace(r, laytpl('place.html').render({
							text: m
						}));
					}
					return n;
				};
				for(var i = 0, k = datas.length; i < k; i++){
					obj = datas[i];
					if(fillname && obj.path.indexOf(fillname) == -1){
						continue;
					}
					trHtmls.push(laytpl('list-tr2.tpl').render({
						"ver": ver,
						"pathtext": findname(obj.path, fillname),
						"path": obj.path,
						"kind": obj.kind,
						"copyFormPath": obj.copyFormPath || '',
						"version": obj.copyFormVersion || '',
						"type": obj.type || '',
						"state": {"A":"新增","M":"修改","D":"删除"}[obj.type]
					}));
				}
				$('#data-body2').html(trHtmls.join(''));
				if(page.firstLoad){
					page.firstLoad = false;
					$('table.datatable').datatable({
						checkable: false,
						checkByClickRow: false
					});
				} else {
					$('.files-box table.datatable').datatable('load');
				}
				page.ajustWidth();
			}
		},
		
		ajustWidth: function(){
			var maxw = $(window).width();
			var w1 = maxw * 0.50,
				w2 = maxw * 0.05,
				w3 = maxw * 0.33,
				w4 = maxw * 0.10;
			$('.td1').css('width', w1);
			$('.td2').css('width', w2);
			$('.td3').css('width', w3);
			$('.td4').css('width', w4);
		},
		
		getSvnsrv: function(u){
			if(u){
				var i = u.indexOf("://") + 4;
				var inx = u.indexOf('/', i);
				u = u.substring(0, inx + 1);
			}
			return u;
		},
		
		getVersionData: function(v){
			var obj;
			for(var i = 0, k = page.datas.length; i < k; i++){
				obj = page.datas[i];
				if(obj.version == v){
					return obj;
				}
			}
			return null;
		},
		
		bindEvent: function(){
			$('#project').on('change', function(){
				var $this = $(this),
					pv = $this.val();
				if(pv == 'add'){
					$this.val('');
					$this.trigger('chosen:updated');
					
					// 创建iframe弹出框
					window['$addDialog'] = new $.zui.ModalTrigger({
						name: 'addpFrame',
						title: '添加SVN项目信息',
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 650,
						height: 350,
						iframe: './svn_add.html'
					});
					// 显示弹出框
					$addDialog.show();
				} else if(pv){
					page.load(pv);
				}
			});
			
			$('.btn-load').on('click', function(){
				page.loadProjects();
			});
			
			$('.version-box').on('click', '.trow', function(){
				var $tr = $(this),
					ver = $tr.data('id');
				var obj = page.getVersionData(ver);
				$('.version-box .trow').removeClass('active');
				$tr.addClass('active');
				if(obj){
					$('.desc-view').val(obj.desc);
					page.renderTable2(obj.files, ver);
				} else {
					$('.desc-view').val('');
				}
			});
			
			$(window).on('resize', function (e) {
				page.ajustWidth();
			});
			
			$('.files-box').on('click', '.file-item', function(){
				var $this = $(this),
					path = $this.data('id'),
					mode = $this.data('mode'),
					ver = $this.data('ver');
				var p = "s=" + page.svnsrv + "&p=" + path;
				if(mode != 'D'){
					p += "&v=" + ver;
				} else {
					alert("文件已被删除");
					return;
				}
				
				if(top['SYSTEM']){
					top['SYSTEM']['openWindow']({
						title: "文件内容预览 - " + path,
						types: 'exe',
						url: consts.WEB_BASE + 'apps/svn/svn_editor.html?' + p,
						width: 1100,
						height: 700,
						needMax: false,
						needMin: false,
						desktopIconId: 'cus-' + new Date().getTime(),
						icon: consts.WEB_BASE + 'content/images/icons/svn.png'
					});
				} else {
					// 创建iframe弹出框
					window['$svnDialog'] = new $.zui.ModalTrigger({
						name: 'multiFrame',
						title: "文件内容预览 - " + path,
						backdrop: 'static',
						moveable: true,
						waittime: consts.PAGE_LOAD_TIME,
						width: 1100,
						height: 700,
						iframe: './svn_editor.html?' + p
					});
					// 显示弹出框
					$svnDialog.show();
				}
				
			});
			
			var timer = 0, oldname = '';
			$('#filename').on('keyup', function(){
				var $this = $(this),
					name = $this.val(),
					$tr = $('.version-box .trow.active');
				if($tr.length && name != oldname){
					oldname = name;
					var ver = $tr.data('id');
					if(timer){
						clearTimeout(timer);
					}
					timer = setTimeout(function(){
						var obj = page.getVersionData(ver);
						if(obj){
							page.renderTable2(obj.files, ver);
						}
					}, 300);
				}
			});
			
		}
		
	};
	var page = new PageScript();
	window['loadProject'] = page.loadProjects;
	page.init();
});