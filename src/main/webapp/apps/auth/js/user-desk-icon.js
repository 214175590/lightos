/**
 * 
 */
define(function(require, exports, module) {
	
	function PageScript(){
		this.userId = '';
		this.appData = [];
		this.appRightData = [];
		this.userRightData = [];
		this.setting = {
	        check: {
	            enable: true,
	            chkStyle: "checkbox",
	            radioType: "level"
	        },
	        data: {
	            simpleData: {
	                enable: true,
	                idKey: "id",
	    			pIdKey: "pId"
	            }
	        },
	        callback: {
				onCheck: zTreeOnCheck
			}
	    };
	}
		
	function zTreeOnCheck(event, treeId, treeNode){
	}
	
	PageScript.prototype = {
		
		init: function(){
			page.uparam = utils.getUrlParam();
			page.userId = page.uparam['uid'];
			$('#user-info').text('给【' + page.uparam['name'] + '】分配权限');
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
			});
			
			$.useModule(['ztree'], function(){
				
				page.loadData();
				
			});
			
			page.bindEvent();
		},
		
		loadData: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'appr/list',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.loadUserRight(rtn);
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
			
		},
		
		loadUserRight: function(data){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'userApp/getAllAppWithUser',
				data: {userId: page.userId}
			}).done(function(res, rtn, state, msg){
				if(state){
					page.appData = data.data;
					page.appRightData = data.data2;
					page.userRightData = rtn.data;
					
					page.initTree();
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		initTree: function(){
			var app = {}, right = {}, userR = {}, isCheck = false;
			var zNodes = [], appNode = {}, rightNode = {};
			var baseNode = {
				id: "APP-0",
				pId: 0,
				name: 'LightOS',
				open: true
			};
			zNodes.push(baseNode);
			for(var i = 0, k = page.appData.length; i < k; i++){
				app = page.appData[i];
				
				appNode = {
					id: "APP-" + app.rowId,
					pId: "APP-0",
					name: app.title ,
					open: true ,
					checked: false
				};
				zNodes.push(appNode);
			}
			
			for(var i = 0; i < page.appRightData.length; i++){
				right = page.appRightData[i];
				isCheck = false;
				
				if(page.userRightData){
					for(var j = 0; j < page.userRightData.length; j++){
						userR = page.userRightData[j];
						if(userR.deskIconId == right.deskIconId 
								&& right.code == userR.rightCode){
							isCheck = true;
							break;
						}
					}
				}
				
				rightNode = {
					id: right.rowId,
					pId: "APP-" + right.deskIconId,
					name: right.name,
					open: true,
					checked: isCheck
				};							
				zNodes.push(rightNode);
			}
			
			page.zTreeObj = $.fn.zTree.init($('#treeBody'), page.setting, zNodes);
		},
		
		isExistUserRight: function(r){
			var exist = false, a;
			if(page.userRightData){
				for(var i = 0, k = page.userRightData.length; i < k; i++){
					a = page.userRightData[i];
					if (r.deskIconId == a.deskIconId && r.code == a.rightCode) {
						exist = true;
						break;
					}
				}
			}
			return exist;
		},
		
		getDelUserRight: function(idarr){
			var arr = [], a, r;
			var exist = false;
			if(page.userRightData){
				for(var i = 0, k = page.userRightData.length; i < k; i++){
					a = page.userRightData[i];
					exist = false;
					for(var j = 0, p = idarr.length; j < p; j++){
						r = idarr[j];
						if(r.deskIconId == a.deskIconId && r.code == a.rightCode){
							exist = true;
							break;
						}
					}
					if(!exist){
						arr.push(a);
					}
				}
			}
			return arr;
		},
		
		bindEvent: function(){
			$('.search-btn').on('click', function(){
				page.loadData();
			});
			
			$('.close-btn').on('click', function(){
				parent.closeFrame && parent.closeFrame();
			});
			
			$('.save-btn').on('click', function(){
				var nodes = page.zTreeObj.getCheckedNodes(true)
				var addArr = [], delArr = [], idarr = [], a, r, deskIconId;
				for(var i = 0, k = nodes.length; i < k; i++){
					if(!nodes[i].children){
						deskIconId = nodes[i].pId.substring(4);
						r = null;
						for(var j = 0, o = page.appRightData.length; j < o; j++){
							a = page.appRightData[j];
							if(a.rowId == nodes[i].id){
								r = a;
								break;
							}
						}
						if(r){
							idarr.push(r);
							
							if(page.isExistUserRight(r)){
								continue;
							} else {
								addArr.push({
									rowId: 0,
									deskIconId: deskIconId,
									rightCode: r.code,
									userId: page.userId
								});
							}
						}
					}
				}
				delArr = page.getDelUserRight(idarr) || [];
				//log.info("新增", addArr);
				//log.info("删除", delArr);
				
				if(idarr.length || delArr.length){
					var zuiLoad = new $.ZuiLoader().show('数据保存中...');
					ajax.post({
						url: 'userApp/saveUserApp',
						data: {
							adds: addArr,
							dels: delArr
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							parent.alert('保存成功');
							parent.closeFrame && parent.closeFrame();
						} else {
							error(msg);
						}
					}).fail(function(){
						error('error');
					}).always(function(){
						zuiLoad.hide();
					});
				} else {
					parent.alert('数据无更改');
					parent.closeFrame && parent.closeFrame();
				}
			});
			
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
});