package com.echinacoop.lightos.web.rest.monitor;

import java.util.List;

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
import com.echinacoop.lightos.domain.monitor.OsCloudClock;
import com.echinacoop.lightos.service.monitor.CloudClockData;
import com.echinacoop.lightos.service.monitor.OsCloudClockService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 云闹钟
 * @Time 2018-08-30 09:40
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/clock")
public class OsCloudClockResource extends BaseController {
	private final static Logger log = LoggerFactory.getLogger(OsCloudClockResource.class);
	
	@Autowired
    OsCloudClockService osCloudClockServiceImpl;
	
	@PostMapping("/list") 
	@OperationRight()
    public Response loadOsCloudClockList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
		Argument arg = new Argument();
		arg.setRowId(getUserId());
		arg.setPageable(value);
    	arg = osCloudClockServiceImpl.findAllForPager(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getPage());
    	}
    	return res;
    }
    
    @PostMapping("/get")
    @OperationRight()
    public Response getOsCloudClock(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		Argument arg = new Argument();
		arg.setRowId(rowId);
    	arg = osCloudClockServiceImpl.getOne(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/save")
    @OperationRight()
    public Response editOsCloudClock(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsCloudClock entity = parseJsonValueObject(jsonValue, OsCloudClock.class);
    	if(entity != null){
    		if(entity.getRowId() == null || entity.getRowId() == 0){
    			entity.setStatus(1);
    		}
			entity.setUserId(getUserId());
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osCloudClockServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			arg = osCloudClockServiceImpl.findAll();
    			if(arg.isSuccess()){
    				CloudClockData.reflush((List<OsCloudClock>) arg.getDataForRtn());
    			}
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/del")
    @OperationRight()
    public Response delOsCloudClock(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osCloudClockServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			arg = osCloudClockServiceImpl.findAll();
    			if(arg.isSuccess()){
    				CloudClockData.reflush((List<OsCloudClock>) arg.getDataForRtn());
    			}
    			res.success();
    		}
    	}
    	return res;
    }

}