/**
 * 
 */
define(function(require, exports, module) {
	function PageScript(){
		this.datas = [];
		this.flag = '';
		this.shellResult = '';
		this.removeContainers = '';
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			var param = utils.getUrlParam();
			if(param && param.p){
				page.rowId = param.p;
				page.loadDataList();
			}
			
			var timer = 0;
			setInterval(function(){
				if(page.zuiLoad){
					timer++;
					if(timer > 5){
						page.zuiLoad.hide();
						page.zuiLoad = null;
					}
				} else {
					timer = 0;
				}
			}, 1000);			
			
			page.bindEvent();
		},
		
		loadDataList: function(){
			page.zuiLoad = waiting('数据加载中...');
			var cmd = $('input[name="status"]:checked').val();
			if(/^images/.test(cmd)){
				$('.type1').removeClass('hidden');
				$('.type2').addClass('hidden');
			} else if(/^ps/.test(cmd)){
				$('.type2').removeClass('hidden');
				$('.type1').addClass('hidden');
			}
			$('#data-body').html('');
			ajax.post({
				url: 'docker/cmd',
				data: {
					rowId: page.rowId,
					cmd: "docker " + cmd
				}
			}).done(function(res, rtn, state, msg){
				if(state){
				} else {
					error("数据加载失败:" + msg);
				}
			}).fail(function(){
				error("数据加载失败");
				log.error('error：', arguments);
			});
		},
		
		renderDockerList: function(datas){
			var obj = {}, html = [];
			for(var i = 0; i < datas.numberOfElements; i++){
				obj = datas.content[i];
				html.push(laytpl('node.html').render({
					id: obj.rowId,
					ip: obj.ip,
					port: obj.port,
					desc: obj.remark || '',
					status: '',
					root: consts.WEB_BASE,
					version: obj.version ? obj.version.substring(0, obj.version.indexOf(',')) : '',
					images: obj.images || '0',
					runs: obj.runs || '0'
				}));
			}
			$('.list').html(html.join(''));
			
			setTimeout(function(){
				$('.tools .icon').tooltip();
			}, 300);
			
			page.loadNodeInfo();
		},
		
		linuxData: function(pack){
			var body = pack.body;
			var iscmd = false;
			if(page.zuiLoad){
				page.zuiLoad.hide();
				page.zuiLoad = null;
			}
			if(/^docker run /.test(body)){
				page.flag = 'run';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker images/.test(body)){
				page.flag = 'images';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker ps/.test(body)){
				page.flag = 'ps';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker rm /.test(body)){
				page.flag = 'rm';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker rmi /.test(body)){
				page.flag = 'rmi';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker search /.test(body)){
				page.flag = 'search';
				page.shellResult = '';
				iscmd = true;
			} else if(/^docker pull /.test(body)){
				page.flag = 'pull';
				page.shellResult = '';
				iscmd = true;
			}
			if(!iscmd){
				if(/^[\r\n\]?[[a-zA-Z0-9]+@localhost ~\]\$ /g.test(body)){
					if(page.shellResult){
						if(page.flag == 'images'){
							var arr = page.shellResult.split('\r\n');
							page.parseImages(arr);
						} else if(page.flag == 'ps'){
							var arr = page.shellResult.split('\r\n');
							page.parsePs(arr);
						} else if(page.flag == 'run'){
							var arr = page.shellResult.split('\r\n');
							page.showDialog(arr.join('<br>'));
						} else if(page.flag == 'rm'){
							var arr = page.shellResult.split('\r\n');
							var s = page.replaceSpace(arr.join(''));
							if(page.removeContainers.indexOf(s + ',') == -1){
								page.showDialog(arr.join('<br>'));
							}
							page.loadDataList();
						} else if(page.flag == 'rmi'){
							var arr = page.shellResult.split('\r\n');
							var s = page.replaceSpace(arr.join(''));
							if(page.removeContainers.indexOf('Untagged: ' + s + ',') == -1){
								page.showDialog(arr.join('<br>'));
							}
							page.loadDataList();
						} else if(page.flag == 'search'){
							var arr = page.shellResult.split('\r\n');
							page.parseSearch(arr);
						} else if(page.flag == 'pull'){
							var arr = page.shellResult.split('\r\n');
							page.showDialog(arr.join('<br>'));
						}
						page.shellResult = '';
					}
				} else {
					page.shellResult += body;
				}
			}
		},
		
		parseSearch: function(datas){
			try{
				var store = [];
				var line = '', as = [], arr = [], trHtmls = '', str = '', t = 0;
				for(var i = 0; i < datas.length; i++){
					line = datas[i];
					if(/\[OK\][\s]+$/.test(line)){
						t = 1;
					} else if(/\[OK\]$/.test(line)){
						t = 2;
					} else {
						t = 0;
					}
					if(line.length > 10){
						as = line.split('   ');
						arr = [];
						for(var j = 0; j < as.length; j++){
							str = as[j];
							if(str && !/^[\s]+$/g.test(str) && !/^docker search /.test(str)){
								arr.push(str);
							}
						}
						if(arr && arr.length){
							store.push({
								id: 'line' + i,
								name: page.replaceSpace(arr[0]),
								desc: page.replaceSpace(arr[1]) || '',
								stars: page.replaceSpace(arr[2]) || '0',
								official: t == 1 ? '[OK]' : '',
								automared: t == 2 ? '[OK]' : ''
							});
						}
					}
				}
				page.renderSearch(store);
			}catch(e){
				log.error("parseSearch error", e);
			}
		},
		
		renderSearch: function(datas){
			var obj = {}, trHtmls = '', str = '', count = 0;
			try{
				for(var i = 1; i < datas.length; i++){
					obj = datas[i];
					trHtmls += laytpl('list-tr3.tpl').render({
						id: obj.id,
						index: i,
						trclass: 'search-tr',
						name: obj.name,
						desc: obj.desc,
						stars: obj.stars,
						official: obj.official,
						automared: obj.automared,
						buttons: (function(){
							var btnHtml = '';
							btnHtml += laytpl('list-btn.tpl').render({
								"class": "btn-download",
								"icon": "icon-download",
								"title": "下载",
								"rightCode": "download"
							}) + '&nbsp;';
							return btnHtml;
						})()
					});
				}
			}catch(e){
				log.error("renderSearch error", e);
			}
			$('#image-data').html(trHtmls);
		},
		
		showDialog: function(msg){
			new $.zui.Messager(msg, {
			    icon: 'info-sign',
			    type: 'primary',
			    time: 0,
			    placement: 'center' // 定义显示位置
			}).show();
		},
		
		parseImages: function(datas){
			try{
				var store = [];
				var line = '', as = [], arr = [], trHtmls = '', str = '';
				for(var i = 0; i < datas.length; i++){
					line = datas[i];
					if(line.length > 10){
						as = line.split('   ');
						arr = [];
						for(var j = 0; j < as.length; j++){
							str = as[j];
							if(str && !/^[\s]+$/g.test(str) && !/^docker images/.test(str)){
								arr.push(str);
							}
						}
						if(arr && arr.length){
							store.push({
								id: 'line' + i,
								repository: page.replaceSpace(arr[0]),
								tag: page.replaceSpace(arr[1]),
								imageId: page.replaceSpace(arr[2]),
								created: page.replaceSpace(arr[3]),
								size: page.replaceSpace(arr[4])
							});
						}
					}
				}
				page.datas = store;
				
				page.renderImages();
			}catch(e){
				log.error("parseImages error", e);
			}
		},
		
		renderImages: function(){
			var obj = {}, trHtmls = '', str = '', count = 0;
			try{
				$('.btn-del').attr('disabled', true);
				var imageName = $('#imageName').val(),
					tag = $('#tag').val(),
					imageId = $('#imageId').val();
				for(var i = 1; i < page.datas.length; i++){
					obj = page.datas[i];
					count = 0;
					if(imageName && obj.repository.indexOf(imageName) == -1){
						count++;
					}	
					if(imageId && obj.imageId.indexOf(imageId) == -1){
						count++;
					}
					if(tag && obj.tag.indexOf(tag) == -1){
						count++;
					}
					if(count == 0){
						trHtmls += laytpl('list-tr.tpl').render({
							id: obj.id,
							trclass: 'image-tr',
							repository: imageName ? page.findname(obj.repository, imageName) : obj.repository,
							tag: tag ? page.findname(obj.tag, tag) : obj.tag,
							imageId: imageId ? page.findname(obj.imageId, imageId) : obj.imageId,
							created: obj.created,
							size: obj.size,
							buttons: ''
						});
					}
				}
			}catch(e){
				log.error("renderImages error", e);
			}
			$('#data-body').html(trHtmls);
		},
		
		parsePs: function(datas){
			try{
				var store = [];
				var line = '', as = [], arr = [], trHtmls = '', str = '';
				for(var i = 0; i < datas.length; i++){
					line = datas[i];
					if(line.length > 10){
						as = line.split('   ');
						arr = [];
						for(var j = 0; j < as.length; j++){
							str = as[j];
							if(str && !/^[\s]+$/g.test(str) && !/^docker ps/.test(str)){
								arr.push(str);
							}
						}
						if(arr && arr.length){
							if(arr.length == 6){
								arr[6] = arr[5];
								arr[5] = '';
							}
							store.push({
								id: 'line' + i,
								containerId: page.replaceSpace(arr[0]),
								image: page.replaceSpace(arr[1]),
								command: page.replaceSpace(arr[2]),
								created: page.replaceSpace(arr[3]),
								status: page.replaceSpace(arr[4]),
								ports: page.replaceSpace(arr[5]),
								names: page.replaceSpace(arr[6])
							});
						}
					}
				}
				page.datas = store;
				
				page.renderPs();
			}catch(e){
				log.error("parsePs error", e);
			}
		},
		
		renderPs: function(){
			var obj = {}, trHtmls = '', str = '', count = 0;
			try{
				var containerName = $('#containerName').val(),
					containerId = $('#containerId').val(),
					imageName = $('#image').val();
				for(var i = 1; i < page.datas.length; i++){
					obj = page.datas[i];
					count = 0;
					if(containerName && obj.names.indexOf(containerName) == -1){
						count++;
					}	
					if(imageName && obj.image.indexOf(imageName) == -1){
						count++;
					}
					if(containerId && obj.containerId.indexOf(containerId) == -1){
						count++;
					}
					if(count == 0){
						trHtmls += laytpl('list-tr2.tpl').render({
							id: obj.id,
							trclass: 'ps-tr' + (/^Up /.test(obj.status) ? ' online' : ''),
							containerId: containerId ? page.findname(obj.containerId, containerId) : obj.containerId,
							image: imageName ? page.findname(obj.image, imageName) : obj.image,
							command: obj.command,
							created: obj.created,
							status: obj.status,
							ports: obj.ports,
							names: containerName ? page.findname(obj.names, containerName) : obj.names,
						});
					}
				}
			}catch(e){
				log.error("renderPs error", e);
			}
			$('#data-body').html(trHtmls);
		},
		
		replaceSpace: function(str){
			if(str){
				str = str.replace(/(^[\s]+|[\s]+$)/g, '');
			}
			return str; 
		},
		
		findname: function(n, m){
			if(m){
				var r = new RegExp(m, 'g');
				n = n.replace(r, laytpl('place.html').render({
					text: m
				}));
			}
			return n;
		},
		
		getObjById: function(id){
			var obj = null, res = null;
			if(page.datas){
				for(var i = 0; i < page.datas.length; i++){
					obj = page.datas[i];
					if(obj.id == id){
						res = obj;
						break;
					}
				}
			}
			return res;
		},
		
		sendShellCmd: function(cmd){
			log.info(cmd);
			page.zuiLoad = waiting('exec => ' + cmd);
			ajax.post({
				url: 'docker/cmd',
				data: {
					rowId: page.rowId,
					cmd: cmd
				}
			}).done(function(res, rtn, state, msg){
				if(state){
				}
			});
		},
		
		bindEvent: function(){
			if(top['SYSTEM']){
				top['SYSTEM'].regEvent('linux.data', 'docker', page.linuxData);
			}			
			
			$('#imageName,#imageId,#tag').on('keyup', function(e){
				var $this = $(this), 
					name = $this.val(),
					code = e.witch || e.keyCode;
				if(code == 13){
					page.renderImages();
				}
			});
			
			$('#containerName,#containerId,#image').on('keyup', function(e){
				var $this = $(this), 
					name = $this.val(),
					code = e.witch || e.keyCode;
				if(code == 13){
					page.renderPs();
				}
			});
			
			$('.result-panel').on('click', '.image-tr', function(){
				var $tr = $(this);
				$('.image-tr').removeClass('active');
				$('.image-tr .number').html('<i class="icon icon-check-empty"></i>');
				$tr.addClass('active');
				$tr.find('.number').html('<i class="icon icon-checked"></i>');
				$('.btn-del').attr('disabled', false);
			});
			
			$('.result-panel').on('click', '.ps-tr', function(){
				var $tr = $(this);
				$('.ps-tr').removeClass('active');
				$('.ps-tr .number').html('<i class="icon icon-check-empty"></i>');
				$tr.addClass('active');
				$tr.find('.number').html('<i class="icon icon-checked"></i>');
				if($tr.hasClass('online')){
					$('.btn-stop').removeClass('hidden').attr('disabled', false);
					$('.btn-run').addClass('hidden').attr('disabled', true);
					$('.btn-remove').attr('disabled', true);
				} else {
					$('.btn-stop').addClass('hidden').attr('disabled', true);
					$('.btn-run').removeClass('hidden').attr('disabled', false);
					$('.btn-remove').attr('disabled', false);
				}
			});
			
			$('label.btn-radio').on('click', function(){
				setTimeout(page.loadDataList, 100);
			});
			// 运行容器
			$('.btn-run').on('click', function(){
				var $tr = $('.ps-tr.active');
				if($tr.length){
					var id = $tr.data('id');
					if(id){
						var obj = page.getObjById(id);
						page.sendShellCmd("docker start " + obj.containerId);
					}
				}
			});
			// 停止容器
			$('.btn-stop').on('click', function(){
				
			});
			// 删除容器
			$('.btn-remove').on('click', function(){
				var $tr = $('.ps-tr.active');
				if($tr.length){
					var id = $tr.data('id');
					if(id){
						var obj = page.getObjById(id);
						$.confirm({
							msg: '确定要删除容器【' + obj.containerId + '（' + obj.image + '）】吗？',
							yesText: '确认删除',
							yesClick: function($modal){
								$modal.modal('hide');
								
								page.removeContainers += (obj.containerId + ',');
								page.sendShellCmd("docker rm " + obj.containerId);
							}
						});
					}
				}
			});
			// 删除镜像，必须先停止容器
			$('.btn-del').on('click', function(e){
				var $tr = $('.image-tr.active');
				if($tr.length){
					var id = $tr.data('id');
					if(id){
						var obj = page.getObjById(id);
						$.confirm({
							msg: '确定要删除镜像【' + obj.imageId + '（' + obj.repository + '）】吗？',
							yesText: '确认删除',
							yesClick: function($modal){
								$modal.modal('hide');
								
								if(e.ctrlKey){
									page.removeContainers += utils.format("{0}:{1},", obj.repository, obj.tag);
									page.sendShellCmd("docker rmi " + utils.format("{0}:{1}", obj.repository, obj.tag));
								} else {
									page.removeContainers += (obj.imageId + ',');
									page.sendShellCmd("docker rmi " + obj.imageId);
								}
							}
						});
					}
				}
			});
			// 创建容器
			$('.btn-create').on('click', function(){
				$.confirm({
					title: '根据镜像创建容器',
					msg: '<textarea class="form-control code" rows="4" cols="40">docker run </textarea>',
					yesText: '确认创建',
					yesClick: function($modal){
						var cmd = $modal.find('.code').val();
						if(cmd && cmd != 'docker run '){
							$modal.modal('hide');
							log.info(cmd);
							page.sendShellCmd(cmd);
						}
					}
				});
			});
			
			$('#iname').on('keyup', function(e){
				var $this = $(this), 
					name = $this.val(),
					code = e.witch || e.keyCode;
				if(code == 13){
					$('#image-data').html('');
					if(name){
						page.sendShellCmd("docker search " + name);
					}
				}
			});
			
			// 镜像下载
			$('#imageMarket').on('click', '.btn-download', function(){
				var $tr = $(this).parent().parent();
				var name = $tr.data('name');
				if(name){
					if(name){
						page.sendShellCmd("docker pull " + name);
					}
				}
			});
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});