/**
 * 
 */
define(function(require, exports, module) {
	var comm =  require('../../common/common');
	require("../../../lib/prettify/prettify.js");
	require('../../../lib/word/jquery.fileexport.js');
	
	function PageScript(){
		this.tableName = "";
		this.tableComment = "";
	}
	
	PageScript.prototype = {
		
		init: function(){
			
			// 获取到用户信息
			ajax.getUserInfo().done(function(user){
				page.user = user;
				
				page.userData = comm.getUserData(page.user.account);
				if(!page.userData["codeGener"]){
					page.userData["codeGener"] = {};
				} else {
					$('#appName').val(page.userData.codeGener.appName || "");
					$('#moduleName').val(page.userData.codeGener.moduleName || "");
				}
			});
			
			page.getDbInfo();
			
			page.bindEvent();
		},
		
		getDbInfo: function(){
			ajax.post({
				url: 'db/get',
				data: {
				}
			}).done(function(res, rtn, state, msg){
				if(state){
					$('#dburl').val(rtn.dburl || '');
					$('#userName').val(rtn.userName || '');
					$('#pwd').val(rtn.pwd || '');
					
					$('.btn-conn').text('重连');
					$('.btn-load').removeClass('hidden');
					page.loadTableList();
				} 
			}).fail(function(){
				log.error('error：', arguments);
			});
		},
		
		loadTableList: function(){
			var zuiLoad = waiting('数据加载中...');
			ajax.post({
				url: 'db/getts',
				data: {
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					page.renderTable(rtn.data);
				} 
			}).fail(function(){
				log.error('error：', arguments);
			}).always(function(){
				zuiLoad.hide();
			});
		},
		
		renderTable: function(data){
			var t = {};
			var html = [];
			for(var i = 0, k = data.length; i < k; i++){
				t = data[i];
				
				html.push(laytpl('table.tpl').render({
					tableName: t.tableName,
					tableComment: t.tableComment
				}));
			}
			
			$('.table-panel').html(html.join(''));
		},
		
		getTemp: function(id){
			return document.getElementById(id).innerHTML;
		},
		
		tirm: function(str){
			return str && str.replace(/[\t\r\n\s]/g, "");
		},
		
		firstToUpper: function(str){
			return str.substring(0, 1).toUpperCase() + str.substring(1);
		},
		
		firstToLower: function(str){
			return str.substring(0, 1).toLowerCase() + str.substring(1);
		},
		
		field2Attr: function(str){
			if(str){
				var arr = str.split("_");
				if(arr && arr.length){
					var strs = [];
					for(var i = 0; i < arr.length; i++){
						strs.push(page.firstToUpper(arr[i]));
					}
					str = strs.join('');
				}
			}
			return str;
		},
		
		getTypeAndLen: function(type){
			var obj = {
				type: type,
				len: 0
			};
			if(type.indexOf("(") != -1){
				obj.type = type.substring(0, type.indexOf("("));
				obj.len = parseInt(/\([^\(^\)]+\)/gi.exec(type)[0].replace(/[\(\)]/g, ''));
			}
			return obj;
		},
		
		getJavaType: function(jdbcType){
			var type = 'String';
			if(jdbcType == 'int' || jdbcType == 'integer'){
				type = 'Integer';
			} else if(jdbcType == 'decimal' || jdbcType == 'double'){
				type = 'Double';
			} else if(jdbcType == 'number' || jdbcType == 'float'){
				type = 'Float';
			} else if(jdbcType == 'bigint' || jdbcType == 'long'){
				type = 'Long';
			} else if(jdbcType == 'timestamp' || jdbcType == 'time'){
				type = 'Timestamp';
			} else if(jdbcType == 'date'){
				type = 'Date';
			} else if (jdbcType == "blob") {
				type = 'byte[]';
	        }
			return type;
		},
		
		getDefault: function(javaType, def){
			var val = '';
			if(def){
				if(javaType == 'Integer'){
					val = ' = 0';
				} else if(javaType == 'Long'){
					val = ' = 0L';
				} else if(javaType == 'Double'){
					val = ' = 0d';
				} else if(javaType == 'Float'){
					val = ' = 0f';
				} else if(javaType == 'Timestamp'){
					val = ' = new Timestamp(System.currentTimeMillis())';
				} else if(javaType == 'Date'){
					val = ' = new Date()';
				} else {
					val = ' = null';
		        }
			}
			return val;
		},
		
		getTableColumn: function(callback){
			ajax.post({
				url: 'db/gettc',
				data: {
					table: page.tableName
				}
			}).done(function(res, rtn, state, msg){
				if(state && rtn.data){
					var obj = {},
						field = {},
						tp = {};
					var table = {
						tableName: page.tableName,	
						comment: page.tableComment,
						fields: []
					};
					for(var i = 0, k = rtn.data.length; i < k; i++){
						obj = rtn.data[i];
						field = {};
						tp = page.getTypeAndLen(obj.columnType);
						field.name = obj.columnName,	
						field.comment = obj.columnComment,
						field.jdbcType = tp.type.toLowerCase();
						field.length = tp.len;
						field.notNull = obj.isNullable == 'NO';
						field.isPrimaryKey = obj.primaryKey;
						field.defValue = obj.columnDefault;
						field.auto = obj.extra == "auto_increment";
						table.fields.push(field);
					}
					callback && callback(table);
				} 
			}).fail(function(){
				error("生成代码失败");
				log.error('error：', arguments);
			});
		},
		
		createEntityAttrList: function(fields){
			var field = {}, arr = [], t = '';
			for(var i = 0; i < fields.length; i++){
				field = fields[i];
				t = page.getJavaType(field.jdbcType);
				arr.push(utils.formatByJson(page.getTemp("attr-list.tpl"), {
					name: field.name,
					comment: field.comment || field.name,
					notnull: field.notNull ? '\n     * @NotNull' : '',
					length: field.length ? '\n     * @MaxLength ' + field.length : '',
					id: field.isPrimaryKey ? '\n    @Id' : '',
					auto: field.auto ? '\n    @GeneratedValue(strategy=GenerationType.IDENTITY)' : '',
					javaType: t,
					attrName: page.firstToLower(page.field2Attr(field.name)),
					def: page.getDefault(t, field.defValue)
				}));
			}
			return arr.join('\n');
		},
		
		createEntityGetSetList: function(fields){
			var field = {}, arr = [], t = '', a = '';
			for(var i = 0; i < fields.length; i++){
				field = fields[i];
				t = page.getJavaType(field.jdbcType);
				a = page.field2Attr(field.name);
				arr.push(utils.formatByJson(page.getTemp("getset-list.tpl"), {
					name: field.name,
					comment: field.comment || field.name,
					javaType: t,
					AttrName: a,
					attrName: page.firstToLower(a)
				}));
			}
			return arr.join('\n');
		},
		
		createEntityToString: function(fields){
			var field = {}, arr = [], a = '';
			for(var i = 0; i < fields.length; i++){
				field = fields[i];
				arr.push(utils.formatByJson(page.getTemp("tostring.tpl"), {
					attrName: page.firstToLower(page.field2Attr(field.name))
				}));
			}
			return arr.join('\n');
		},
		
		createJavaEntity: function(table){
			var appName = $('#appName').val(),
				moduleName = $('#moduleName').val();
			var attr_list = page.createEntityAttrList(table.fields);
			var attr_getset_list = page.createEntityGetSetList(table.fields);
			var attr_tostring_list = page.createEntityToString(table.fields);
			var importDate = '', importTimestamp = '';
			for(var i = 0; i < table.fields.length; i++){
				if(table.fields[i].jdbcType == 'date' || table.fields[i].jdbcType == 'time'){
					importDate = "\nimport java.util.Date;";
				} else if(table.fields[i].jdbcType == 'timestamp'){
					importTimestamp = '\nimport java.sql.Timestamp;';
				}
			}
			var entity = utils.formatByJson(page.getTemp("entity.java"), {
				"app": appName, 
				"module": moduleName,
				"importDate": importDate,
				"importTimestamp": importTimestamp,
				"Time": utils.formatDate(new Date()),
				"tableName": table.tableName,
				"EntityName": page.field2Attr(table.tableName),
				"EntityComment": table.comment,
				"attr_list": attr_list,
				"attr_getset_list": attr_getset_list,
				"attr_tostring_list": attr_tostring_list
			});
			
			var html = utils.formatByJson(page.getTemp("content.tpl"), {
				html: entity,
				title: page.field2Attr(table.tableName) + '.java'
			});
			
			$('#java-code').append(html);
		},
		
		createJavaRepository: function(table){
			var appName = $('#appName').val(),
				moduleName = $('#moduleName').val();
			var entity = utils.formatByJson(page.getTemp("repository.java"), {
				"app": appName, 
				"module": moduleName,
				"Time": utils.formatDate(new Date()),
				"EntityName": page.field2Attr(table.tableName),
				"EntityComment": table.comment
			});
			
			var html = utils.formatByJson(page.getTemp("content.tpl"), {
				html: entity,
				title: page.field2Attr(table.tableName) + 'Repository.java'
			});
			
			$('#java-code').append(html);
		},
		
		createJavaService: function(table){
			var appName = $('#appName').val(),
				moduleName = $('#moduleName').val();
			var entity = utils.formatByJson(page.getTemp("service.java"), {
				"app": appName, 
				"module": moduleName,
				"Time": utils.formatDate(new Date()),
				"EntityName": page.field2Attr(table.tableName),
				"EntityComment": table.comment
			});
			
			var html = utils.formatByJson(page.getTemp("content.tpl"), {
				html: entity,
				title: page.field2Attr(table.tableName) + 'Service.java'
			});
			
			$('#java-code').append(html);
		},
		
		createJavaController: function(table){
			var appName = $('#appName').val(),
				moduleName = $('#moduleName').val();
			var entity = utils.formatByJson(page.getTemp("controller.java"), {
				"app": appName, 
				"module": moduleName,
				"Time": utils.formatDate(new Date()),
				"entityName": page.firstToLower(page.field2Attr(table.tableName)),
				"EntityName": page.field2Attr(table.tableName),
				"EntityComment": table.comment
			});
			
			var html = utils.formatByJson(page.getTemp("content.tpl"), {
				html: entity,
				title: page.field2Attr(table.tableName) + 'Resource.java'
			});
			
			$('#java-code').append(html);
		},
		
		startCreate: function(){
			page.getTableColumn(function(table){
				$('#java-code').html("");
				page.createJavaEntity(table);
				page.createJavaRepository(table);
				page.createJavaService(table);
				page.createJavaController(table);
				
				setTimeout(prettyPrint, 100);
				
				page.userData.codeGener["appName"] = $('#appName').val();
				page.userData.codeGener["moduleName"] = $('#moduleName').val();
				comm.saveUserData(page.user.account, page.userData);
			});
		},
		
		bindEvent: function(){
			
			$('.btn-conn').on('click', function(){
				var dburl = $('#dburl').val();
				var userName = $('#userName').val();
				var pwd = $('#pwd').val();
				if(dburl && userName && pwd){
					ajax.post({
						url: 'db/conn',
						data: {
							dburl: encodeURIComponent(dburl),
							userName: userName,
							pwd: pwd
						}
					}).done(function(res, rtn, state, msg){
						if(state){
							$('.btn-conn').text('重连');
							$('.btn-load').removeClass('hidden');
							page.loadTableList();
						}  else {
							error('连接失败');
							$('.table-panel').html('');
						}
					}).fail(function(){
						error('连接失败');
						$('.table-panel').html('');
						log.error('error：', arguments);
					});
				} else {
					error("请填写完整数据库连接信息");
				}
			});
			
			$('.btn-close').on('click', function(){
				$('.btn-conn').attr('disabled', false);
				$('.btn-close').addClass('hidden');
			});
			
			$('.table-panel').on('click', '.table-box', function(){
				var $box = $(this);
				page.tableName = $box.data('name');
				page.tableComment = $box.data('desc');
				$('.table-box').removeClass('active');
				$box.addClass('active');
				$('.btn-create').attr('disabled', false);
			});
			
			$('#sql-view').on('click', function(){
				$('#sql-view').addClass('hidden');
				$('#sql').removeClass('hidden').focus();
			});
			
			$('.btn-create').on('click', function(){
				page.startCreate();
			});
			
			$('.btn-load').on('click', function(){
				page.loadTableList();
			});
			
			$('.page-body').on('click', '.codeview', function(){
				var $view = $(this);
				$view.removeClass('prettyprinted').attr('contenteditable', true).focus();
			});
			
			$('.page-body').on('click', '.btn-export', function(){
				var that = $(this),
					$view = that.parent().next();
				$view.fileExport({
					fileName: that.prev().text(),
					suffix: '',
					area: 'text',
					type: 'java/*;charset=UTF-8'
				});
			});
		}
		
		
	};
	
	var page = new PageScript();
	page.init();
	
	window.closeFrame = page.closeFrame;
});