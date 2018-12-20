package com.echinacoop.lightos.web.rest.monitor;

import java.util.ArrayList;
import java.util.Iterator;
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
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;
import com.echinacoop.lightos.service.monitor.MonitorData;
import com.echinacoop.lightos.service.monitor.OsServiceMonitorService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 服务监控信息
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/sm")
public class OsServiceMonitorResource extends BaseController {
	private final static Logger log = LoggerFactory.getLogger(OsServiceMonitorResource.class);
	
	@Autowired
    OsServiceMonitorService osServiceMonitorServiceImpl;
	
	@PostMapping("/list") 
	@OperationRight()
    public Response loadOsServiceMonitorList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	Argument arg = osServiceMonitorServiceImpl.findAll();
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getDataForRtn());
    	}
    	return res;
    }
    
    @PostMapping("/get")
    @OperationRight()
    public Response getOsServiceMonitor(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		if(null != rowId && rowId > 0){
			Argument arg = new Argument();
			arg.setRowId(rowId);
			arg = osServiceMonitorServiceImpl.getOne(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getObj());
			}
		}
    	return res;
    }
    
    @PostMapping("/save")
    @OperationRight()
    public Response saveOsServiceMonitor(@RequestParam String jsonValue) {
		Response res = new Response();
    	OsServiceMonitor entity = parseJsonValueObject(jsonValue, OsServiceMonitor.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osServiceMonitorServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			arg = osServiceMonitorServiceImpl.findAll();
    	    	if(arg.isSuccess()){
    	    		MonitorData.reflush((List<OsServiceMonitor>) arg.getDataForRtn());
    	    	}
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/del")
    @OperationRight()
    public Response delOsServiceMonitor(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null && rowId > 0){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osServiceMonitorServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			arg = osServiceMonitorServiceImpl.findAll();
    	    	if(arg.isSuccess()){
    	    		MonitorData.reflush((List<OsServiceMonitor>) arg.getDataForRtn());
    	    	}
    			res.success();
    		}
    	}
    	return res;
    }
    
    @PostMapping("/notice")
    @OperationRight()
    public Response changeServiceMonitorNotice(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsServiceMonitor entity = parseJsonValueObject(jsonValue, OsServiceMonitor.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osServiceMonitorServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			MonitorData.setNotice(entity.getRowId(), entity.getNotice());
    			res.success();
    		}
    	}
    	return res;
    }
    
    @PostMapping("/check")
    @OperationRight()
    public Response checkService(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Iterator<JSONObject> ito = MonitorData.getList().iterator();
			OsServiceMonitor monitor = null;
			JSONObject json = null;
			while (ito.hasNext()) {
				json = ito.next();
				monitor = (OsServiceMonitor) json.get("item");
				if(null != monitor && monitor.getRowId() == rowId){
					json.put("time", monitor.getTimes() - 1);
					res.success();
					break;
				}
			}
    	}
    	return res;
    }

}