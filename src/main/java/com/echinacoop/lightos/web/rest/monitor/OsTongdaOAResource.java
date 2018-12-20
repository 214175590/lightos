package com.echinacoop.lightos.web.rest.monitor;

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
import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;
import com.echinacoop.lightos.service.monitor.OsServiceMonitorService;
import com.echinacoop.lightos.service.monitor.OsTongdaOAService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 通达OA
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/oa")
public class OsTongdaOAResource extends BaseController {
	private final static Logger log = LoggerFactory.getLogger(OsTongdaOAResource.class);
	
	@PostMapping("/login") 
	@OperationRight()
    public Response loginOA(@RequestParam String jsonValue) {
    	Response res = new Response();
    	Argument arg = OsTongdaOAService.loginOA();
    	if(arg.isSuccess()){
    		res.success().setToRtn("rootPath", arg.getStringForRtn("rootPath"));
    	}
    	return res;
    }
	
	@PostMapping("/personnel") 
	@OperationRight()
    public Response getPersonnel(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject json = OsTongdaOAService.getPersonnel();
    	if(null != json){
    		res.success().setDataToRtn(json);
    	}
    	return res;
    }

}