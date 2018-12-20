package com.echinacoop.lightos.web.rest.system;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.system.OsDeskIcon;
import com.echinacoop.lightos.service.system.OsDeskIconService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.yinsin.utils.DateUtils;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 桌面图标表
 * @Time 2018-05-11 14:26
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/sys")
public class OsDeskIconResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsDeskIconResource.class);
	
	@Autowired
    OsDeskIconService osDeskIconServiceImpl;
	
	@PostMapping("/loadUserApps") 
	@OperationRight()
    public Response loadUserApps(@RequestParam String jsonValue) {
    	Response res = new Response();
		Argument arg = new Argument();
		User user = getUser();
		arg.setRowId(user.getRowId());
		arg.setToReq("account", user.getAccount());
    	arg = osDeskIconServiceImpl.loadUserApps(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getDataForRtn());
    	}
    	return res;
    }
	
	@PostMapping("/loadAppList") 
	@OperationRight()
    public Response loadOsDeskIconList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	OsDeskIcon entity = new OsDeskIcon();
    	entity.setName(value.getString("name"));
    	entity.setTitle(value.getString("title"));
    	entity.setTypes(value.getString("types"));
		Argument arg = new Argument();
		User user = getUser();
		arg.setRowId(user.getRowId());
		arg.setToReq("account", user.getAccount());
		arg.setPageable(value);
		arg.setObj(entity);
    	arg = osDeskIconServiceImpl.findAllForPager(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getPage());
    	}
    	return res;
    }
    
    @PostMapping("/getAppInfo")
    @OperationRight("query")
    public Response getOsDeskIcon(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		Argument arg = new Argument();
		arg.setRowId(rowId);
    	arg = osDeskIconServiceImpl.findOne(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/addApp")
    @OperationRight("add")
    public Response addOsDeskIcon(@RequestParam String jsonValue) {
		Response res = new Response();
    	OsDeskIcon entity = parseJsonValueObject(jsonValue, OsDeskIcon.class);
    	if(entity != null){
    		entity.setBelong(getUser().getAccount());
    		entity.setCreateTime(DateUtils.format());
    		entity.setStatus(1);
    		entity.setIsshow("true");
    		entity.setHosts(1);
    		entity.setLevels(3);
    		Argument arg = new Argument();
    		arg.setRowId(getUserId());
    		arg.setObj(entity);
    		arg = osDeskIconServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/editAppInfo")
    @OperationRight("edit")
    public Response editOsDeskIcon(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsDeskIcon entity = parseJsonValueObject(jsonValue, OsDeskIcon.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osDeskIconServiceImpl.update(arg);
    		if(arg.isSuccess()){
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/delApp")
    @OperationRight("del")
    public Response delOsDeskIcon(@RequestParam String jsonValue) {
    	logger.debug("delete app info :{}", jsonValue);
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osDeskIconServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			res.success();
    		}
    	}
    	return res;
    }

}