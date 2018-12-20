package com.echinacoop.lightos.web.rest.other;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.dbtool.DbTable;
import com.echinacoop.lightos.domain.dbtool.DbTableColumn;
import com.echinacoop.lightos.domain.dbtool.MysqlDbColumn;
import com.echinacoop.lightos.service.dbtool.DBHelper;
import com.echinacoop.lightos.web.rest.BaseController;

@RestController
@RequestMapping("/db")
public class DbtoolResource extends BaseController {
	private final Logger logger = LoggerFactory.getLogger(DbtoolResource.class);
	
	@PostMapping("/get")
	@OperationRight()
	public Response getconn(@RequestParam String jsonValue) throws URISyntaxException {
		Response res = new Response();
		DBHelper dbhelp = (DBHelper) request.getSession().getAttribute("_dbhelp");
		if(null != dbhelp){
			res.setToRtn("dburl", dbhelp.dburl);
			res.setToRtn("userName", dbhelp.userName);
			res.setToRtn("pwd", dbhelp.pwd);
			res.success();
		}
		return res;
	}

	@PostMapping("/conn")
	@OperationRight()
	public Response conn(@RequestParam String jsonValue) throws URISyntaxException {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String dburl = value.getString("dburl");
		String userName = value.getString("userName");
		String pwd = value.getString("pwd");
		DBHelper dbhelp = DBHelper.init(dburl, userName, pwd);
		if(null != dbhelp){
			setSessionAttribute("_dbhelp", dbhelp);
			res.success();
		}
		return res;
	}
	
	@PostMapping("/gettcs")
	@OperationRight()
	public Response getTableColumns(@RequestParam String jsonValue) throws URISyntaxException {
		Response res = new Response();
		DBHelper dbhelp = (DBHelper) request.getSession().getAttribute("_dbhelp");
		if(null != dbhelp){
			Map<String, List<DbTableColumn>> datas = dbhelp.getMutilTableColumns();
			if(null != datas){
				res.success().setDataToRtn(datas);
			}
		}
		return res;
	}
	
	@PostMapping("/gettc")
	@OperationRight()
	public Response getTableColumn(@RequestParam String jsonValue) throws URISyntaxException {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String table = value.getString("table");
		DBHelper dbhelp = (DBHelper) request.getSession().getAttribute("_dbhelp");
		if(null != dbhelp){
			List<MysqlDbColumn> datas = dbhelp.getTableColumns(table);
			if(null != datas){
				res.success().setDataToRtn(datas);
			}
		}
		return res;
	}
	
	@PostMapping("/getts")
	@OperationRight()
	public Response getTables(@RequestParam String jsonValue) throws URISyntaxException {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		DBHelper dbhelp = (DBHelper) request.getSession().getAttribute("_dbhelp");
		if(null != dbhelp){
			List<DbTable> datas = dbhelp.getDbTables();
			if(null != datas){
				res.success().setDataToRtn(datas);
			}
		}
		return res;
	}

}
