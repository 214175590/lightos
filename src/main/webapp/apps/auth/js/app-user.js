/**
 * 发起新会议预约
 */
define(function(require, exports, module) {
	
	function PageScript(){
		this.appInfo = {};
		this.appRight = {};
		this.users = {};
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			if(parent.$obj){
				page.appInfo = parent.$obj;
				page.appRight = parent.$rights;
			}
			
			$('#app-info').text('给【' + page.appInfo.title + '】应用分配权限用户');
			page.loadUserList();
			
			page.bindEvent();
		},
		
		loadUserList: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'user/alluser',
				data: {}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.users = rtn.data;
					page.loadRightUser();
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		loadRightUser: function(){
			var zuiLoad = new $.ZuiLoader().show('数据加载中...');
			ajax.post({
				url: 'userApp/getRights',
				data: {deskIconId: page.appInfo.rowId}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.rights = rtn.data;
					
					page.render();
				} else {
					error(msg);
				}
			}).fail(function(){
				error('error');
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		render: function(){
			//log.info(page.users, page.rights);
			
			var ths = [];
			for(var i = 0; i < page.appRight.length; i++){
				ths.push(laytpl('list-th.tpl').render({
					code: page.appRight[i].code,
					name: page.appRight[i].name
				}));
			}
			$('#data-head').html(laytpl('list-thead.tpl').render({
				ths: ths.join('')
			}));
			
			var tds = [], bodys = [];
			var user = {}, right = {};
			var rowId = '';
			for(var i = 0; i < page.users.length; i++){
				user = page.users[i];
				if(user.account == 'admin'){
					continue;
				}
				tds = [];
				for(var j = 0; j < page.appRight.length; j++){
					right = page.appRight[j];
					rowId = page.isCheck(right.deskIconId, user.rowId, right.code);
					tds.push(laytpl('list-td.tpl').render({
						rowId: rowId,
						deskIconId: right.deskIconId,
						userId: user.rowId,
						code: right.code,
						name: right.name,
						check: !!rowId
					}));
				}
				
				bodys.push(laytpl('list-tr.tpl').render({
					trclass: '',
					userId: user.rowId,
					account: user.account,
					name: user.name,
					title: page.appInfo.title,
					tds: tds.join('')
				}));
			}
			
			$('#data-body').html(bodys.join(''));
		},
		
		isCheck: function(appId, userId, code){
			for(var i = 0; i < page.rights.length; i++){
				if(page.rights[i].rightCode == code 
						&& page.rights[i].deskIconId == appId 
						&& page.rights[i].userId == userId){
					return page.rights[i].rowId;
				}
			}
			return 0;
		},
		
		bindEvent: function(){
			$('.save-btn').on('click', function(){
				var $btn = $(this);
				var adds = [], dels = [];
				$('.ckbox').each(function(){
					var $inp = $(this),
						rowId = $inp.val(),
						appId = $inp.data('app'),
						userId = $inp.data('user'),
						code = $inp.data('code');
					var c1 = !!page.isCheck(appId, userId, code);
					var c2 = $inp.is(":checked");
					if(c1 && !c2){ // 删除 
						dels.push({
							rowId: rowId,
							deskIconId: appId,
							userId: userId,
							rightCode: code
						});
					} else if(!c1 && c2){ // 新增
						adds.push({
							rowId: rowId,
							deskIconId: appId,
							userId: userId,
							rightCode: code
						});
					}
				});
				log.info(adds, dels);
				if(adds.length || dels.length){
					var zuiLoad = new $.ZuiLoader().show('数据保存中...');
					ajax.post({
						url: 'userApp/saveUserApp',
						data: {
							adds: adds,
							dels: dels
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
			
			$('.close-btn').on('click', function(){
				parent.closeFrame && parent.closeFrame();
			});
			
			$('.reset-btn').on('click', function(){
				page.render();
			});
			
			$('.result-panel').on('click', '.allcheck', function(){
				var $check = $(this),
					code = $check.attr('id');
				var checked = $check.is(":checked");
				for(var i = 0; i < page.users.length; i++){
					user = page.users[i];
					$('#' + code + '-' + user.rowId).attr('checked', checked);
				}
			});
			
		}
		
	};
	
	var page = new PageScript();
	page.init();
	
});