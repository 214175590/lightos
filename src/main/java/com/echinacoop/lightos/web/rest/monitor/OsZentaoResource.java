package com.echinacoop.lightos.web.rest.monitor;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.config.ApplicationProperties;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.monitor.OsCloudClock;
import com.echinacoop.lightos.domain.monitor.OsZentaoTask;
import com.echinacoop.lightos.service.monitor.OsTongdaOAService;
import com.echinacoop.lightos.service.monitor.OsZentaoService;
import com.echinacoop.lightos.service.monitor.OsZentaoTaskService;
import com.echinacoop.lightos.service.monitor.ZentaoData;
import com.echinacoop.lightos.web.rest.BaseController;
import com.yinsin.utils.CommonUtils;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 禅道
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/zentao")
public class OsZentaoResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsZentaoResource.class);
	
	@Autowired
	ApplicationProperties properties;
	
	@Autowired
	OsZentaoTaskService service;
	
	@PostMapping("/list") 
	@OperationRight()
    public Response getList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Integer status = value.getInteger("status");
    	Argument arg = new Argument();
    	arg.setToReq("status", status);
    	arg = service.findAll(arg);
    	if(arg.isSuccess()){
    		List<OsZentaoTask> dataList = (List<OsZentaoTask>) arg.getDataForRtn();
    		if(null == dataList || dataList.size() == 0){
    			String id = value.getString("id");
    	    	if(CommonUtils.isBlank(id)){
    	    		id = properties.getZentaoDefId();
    	    		arg.setToReq("id", id);
    	    		arg = service.saveAndFlush(arg);
    	        	if(arg.isSuccess()){
    	        		res.success().setDataToRtn(arg.getDataForRtn());
    	        	}
    	    	}
    		} else {
    			res.success().setDataToRtn(dataList);
    		}
    	}
    	return res;
    }
	
	@PostMapping("/reset") 
	@OperationRight()
    public Response resetData(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	String id = value.getString("id");
    	if(CommonUtils.isBlank(id)){
    		id = properties.getZentaoDefId();
    	}
    	Argument arg = new Argument();
    	arg.setToReq("id", id);
    	arg = service.saveAndFlush(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getDataForRtn());
    	}
    	return res;
    }
	
	@PostMapping("/project") 
	@OperationRight()
    public Response getProjects(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	String id = value.getString("id");
    	if(CommonUtils.isBlank(id)){
    		id = properties.getZentaoDefId();
    	}
    	List<OsZentaoTask> data = OsZentaoService.getModules(id);
    	if(null != data){
    		res.success().setDataToRtn(data);
    	}
    	return res;
    }
	
	@PostMapping("/save") 
	@OperationRight()
    public Response save(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsZentaoTask entity = parseJsonValueObject(jsonValue, OsZentaoTask.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = service.save(arg);
    		if(arg.isSuccess()){
    			arg = service.findAll(arg);
    			if(arg.isSuccess()){
    				ZentaoData.reflush((List<OsZentaoTask>) arg.getDataForRtn());
    			}
    			res.success().setDataToRtn(arg.getObj());
    		}
    	}
    	return res;
    }

}