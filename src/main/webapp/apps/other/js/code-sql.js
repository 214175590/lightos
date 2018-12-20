/**
 * 
 */
define(function(require, exports, module) {
	var comm =  require('../../common/common');
	require("../../../lib/prettify/prettify.js");
	require('../../../lib/word/jquery.fileexport.js');
	
	function PageScript(){
		this.rights = [];
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
			var appId = ajax.getAppId();
			// includes
			page.rights = comm.getUserAppRights(appId);
			
			page.bindEvent();
		},
		
		getTemp: function(id){
			return document.getElementById(id).innerHTML;
		},
		
		formatSQL: function(sqlstr){
			sqlstr = sqlstr.replace(/[\r\n`]/g, "");
			sqlstr = sqlstr.replace(/["]/g, "'");
			var arr = [];
			var push = function(str){
				var list = /'[^']+'+/gi.exec(str);
				if(list && list.length){
					arr.push(str.substring(0, list.index).replace(/[\t\s]+/g, ' '));
					arr.push(list[0]);
					str = str.substring(list.index + list[0].length);
				}
				if(/'[^']+'+/gi.test(str)){
					push(str);
				} else {
					arr.push(str.replace(/[\t\s]+/g, ' '));
				}
			};
			push(sqlstr);
			return arr.join('');
		},
		
		tirm: function(str){
			return str && str.replace(/[\t\r\n\s]/g, "");
		},
		
		isCreateTable: function(sqlstr){
			return /CREATE[\w\s+\w]+TABLE/g.test(sqlstr.toUpperCase());
		},
		
		isNotNull: function(sqlstr){
			return /NOT[\w\s+\w]+NULL/g.test(sqlstr.toUpperCase());
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
		
		getFieldComment: function(str){
			var c = '';
			if(str && str.toUpperCase().indexOf("COMMENT ") != -1){
				str = str.substring(str.toUpperCase().indexOf("COMMENT") + 7);
				c = str.replace(/['\s]/g, '');
			}
			return c;
		},
		
		getFieldDefault: function(str){
			var c = '';
			if(str && str.toUpperCase().indexOf("DEFAULT ") != -1){
				str = str.substring(str.toUpperCase().indexOf("DEFAULT") + 8);
				if(str.toUpperCase().indexOf("COMMENT") != -1){
					str = str.substring(0, str.toUpperCase().indexOf("COMMENT"));
				}
				c = str.replace(/(^\s|\s$|')+/g, "") || '""';
			}
			return c;
		},
		
		isTableField: function(sql){
			var b = true;
			if(sql){
				var a1 = /[\s]?PRIMARY KEY[\s]?\(/g.test(sql.toUpperCase());
				var a2 = /[\s]?FOREIGN KEY[\s]?\(/g.test(sql.toUpperCase());
				b = !a1 && !a2;
			}
			return b;
		},
		
		isPrimaryKey: function(sql){
			return /PRIMARY[\w\s+\w]+KEY/g.test(sql.toUpperCase());
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
					val = ' = ' + def;
		        }
			}
			return val;
		},
		
		parseTable: function(sql){
			var startStr = sql.substring(0, sql.indexOf("("));
			var tabSql = /\([\s\S]+\)+/g.exec(sql)[0].substring(1);
			var endStr = sql.substring(sql.lastIndexOf(")") + 1);
			var table = {fields: []};
			table.tableName = (function(){
				var str = startStr.substring(startStr.toUpperCase().indexOf("TABLE") + 6);
				return page.tirm(str);
			})();
			table.comment = (function(){
				var c = '';
				if(endStr){
					var arr1 = endStr.split(' ');
					if(arr1 && arr1.length){
						for(var i = 0; i < arr1.length; i++){
							if(arr1[i] && arr1[i].toUpperCase().indexOf("COMMENT") != -1){
								c = page.tirm(arr1[i].split('=')[1]);
								break;
							}
						}
					}
				}
				return c.replace(/[']+/g, "");
			})();
			var sqlArr = tabSql.split(',');
			var line = '', arr = [], tp = {}, field = {}, pk = '';
			for(var i = 0; i < sqlArr.length; i++){
				line = sqlArr[i];
				if(line){
					line = line.replace(/(^\s*|\s*$|'*|\r*|\n*|\t*)/g, "");
					arr = line.split(' ');
					if(arr && arr.length){
						field = {};
						if(page.isTableField(line)){
							field.name = arr[0];
							tp = page.getTypeAndLen(arr[1]);
							field.jdbcType = tp.type.toLowerCase();
							field.length = tp.len;
							field.notNull = page.isNotNull(line);
							field.comment = page.getFieldComment(line);
							field.isPrimaryKey = false;
							field.defValue = page.getFieldDefault(line);
							field.auto = line.toUpperCase().indexOf('AUTO_INCREMENT') != -1;
							table.fields.push(field);
						} 
						if(page.isPrimaryKey(line)){
							if(/[\s]?PRIMARY KEY[\s]?\(/g.test(line.toUpperCase())){
								pk = /\([^\(^\)]+\)/gi.exec(line)[0].replace(/[\(\)]/g, '');
							} else {
								field.isPrimaryKey = true;
								field.auto = line.toUpperCase().indexOf('AUTO_INCREMENT') != -1;
							}
						}
					}
				}
			}
			if(pk){
				for(var i = 0; i < table.fields.length; i++){
					if(table.fields[i].name == pk){
						table.fields[i].isPrimaryKey = true;
						break;
					}
				}
			}
			return table;
		},
		
		parseSQL: function(sql){
			if(sql){
				sql = page.formatSQL(sql);
				var sqlArr = sql.split(';');
				var table = {};
				for(var i = 0; i < sqlArr.length; i++){
					if(page.isCreateTable(sqlArr[i])){
						table = page.parseTable(sqlArr[i]);
						break;
					}
				}
				$('#java-code').html("");
				page.createJavaEntity(table);
				page.createJavaRepository(table);
				page.createJavaService(table);
				page.createJavaController(table);
				
				setTimeout(prettyPrint, 100);
				
				page.userData.codeGener["appName"] = $('#appName').val();
				page.userData.codeGener["moduleName"] = $('#moduleName').val();
				comm.saveUserData(page.user.account, page.userData);
			}
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
			var sql = $('#sql').val();
			if(sql){
				page.parseSQL(sql);
			}
		},
		
		bindEvent: function(){			
			
			$('#sql').focus().on('keyup', function(e){
				var code = e.witch || e.keyCode;
				if(e.altKey && code == 67){ //C 67
					page.startCreate();
				}
			}).on('blur', function(){
				var $sql = $('#sql'),
					text = $sql.val();
				if(text){
					$('#sql-view').removeClass('hidden prettyprinted').html(text);
					$sql.addClass('hidden');
					setTimeout(prettyPrint, 100);
				}
			});		
			
			$('#sql-view').on('click', function(){
				$('#sql-view').addClass('hidden');
				$('#sql').removeClass('hidden').focus();
			});
			
			$('.btn-create').on('click', function(){
				page.startCreate();
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