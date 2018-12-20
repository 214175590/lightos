package com.echinacoop.lightos.web.rest.meeting;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.meeting.OsBoardroom;
import com.echinacoop.lightos.service.meeting.OsBoardroomService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 会议室表
 * @Time 2018-09-18 13:59:53
 * @Auto Generated
 */
@RestController
@RequestMapping("/osBoardroom")
public class OsBoardroomResource extends BaseController {
    private final static Logger logger = LoggerFactory.getLogger(OsBoardroomResource.class);
    
    @Resource(name="osBoardroomService")
    OsBoardroomService osBoardroomService;
    
    @PostMapping("/loadList")
    @OperationRight()
    public Response loadList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Argument arg = new Argument();
    	arg.setPageable(value);
    	arg = osBoardroomService.findAllForPager(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getPage());
    	}
    	return res;
    }
    
    @PostMapping("/get")
    public Response get(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	Argument arg = new Argument();
    	arg.setRowId(rowId);
    	arg = osBoardroomService.getOne(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/add")
    public Response add(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsBoardroom obj = parseJsonValueObject(jsonValue, OsBoardroom.class);
    	Argument arg = new Argument();
    	arg.setObj(obj);
    	arg = osBoardroomService.save(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/edit")
    public Response edit(@RequestParam String jsonValue) {
    	Response res = new Response();
    	OsBoardroom obj = parseJsonValueObject(jsonValue, OsBoardroom.class);
    	Argument arg = new Argument();
    	arg.setObj(obj);
    	arg = osBoardroomService.update(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/del")
    public Response del(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	Argument arg = new Argument();
    	arg.setRowId(rowId);
    	arg = osBoardroomService.delete(arg);
    	if(arg.isSuccess()){
    		res.success();
    	}
    	return res;
    }

}
