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
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.system.OsDeskIconRight;
import com.echinacoop.lightos.service.system.OsDeskIconRightService;
import com.echinacoop.lightos.service.system.OsDeskIconService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 图标权限表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/appr") 
public class OsDeskIconRightResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsDeskIconRightResource.class);
	
	@Autowired
    OsDeskIconRightService osDeskIconRightServiceImpl;
	
	@Autowired
    OsDeskIconService osDeskIconServiceImpl;
	
	@PostMapping("/list") 
	@OperationRight()
    public Response loadOsDeskIconRightList(@RequestParam String jsonValue) {
    	Response res = new Response();
		Argument arg = new Argument();
		arg = osDeskIconServiceImpl.findAll(arg);
		if(arg.isSuccess()){
    		res.setDataToRtn(arg.getDataForRtn());
    		arg = osDeskIconRightServiceImpl.findAll(arg);
        	if(arg.isSuccess()){
        		res.success().setToRtn("data2", arg.getDataForRtn());
        	}
    	}
    	return res;
    }
    
    // 
    @PostMapping("/rights")
    @OperationRight()
    public Response getOsDeskIconRight(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long deskIconId = value.getLong("deskIconId");
		Argument arg = new Argument();
		arg.setRowId(deskIconId);
    	arg = osDeskIconRightServiceImpl.findByDeskIconId(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getDataForRtn());
    	}
    	return res;
    }
    
    // 
    @PostMapping("/add")
    @OperationRight("add")
    public Response addOsDeskIconRight(@RequestParam String jsonValue) {
		Response res = new Response();
    	OsDeskIconRight entity = parseJsonValueObject(jsonValue, OsDeskIconRight.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osDeskIconRightServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/del")
    @OperationRight("del")
    public Response delOsDeskIconRight(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = JSONObject.parseObject(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osDeskIconRightServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			res.success();
    		}
    	}
    	return res;
    }

}