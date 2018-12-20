package com.echinacoop.lightos.web.rest.dubbo;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.dubbo.OsDubboTestCase;
import com.echinacoop.lightos.service.dubbo.OsDubboTestCaseService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc Dubbo接口测试用例表
 * @Time 2018-05-28 10:13
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/dubbo") 
public class OsDubboTestCaseResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsDubboTestCaseResource.class);
	
	@Autowired
    OsDubboTestCaseService osDubboTestCaseServiceImpl;
	
	@PostMapping("/case/list") 
	@OperationRight()
    public Response loadOsDubboTestCaseList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	String name = value.getString("name");
		String server = value.getString("address");
		String interfaceName = value.getString("interfaceName");
		String method = value.getString("method");
		Argument arg = new Argument();
		arg.setToReq("name", name);
		arg.setToReq("server", server);
		arg.setToReq("interfaceName", interfaceName);
		arg.setToReq("method", method);
    	arg = osDubboTestCaseServiceImpl.findAllCase(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getDataForRtn());
    	}
    	return res;
    }
    
    @PostMapping("/case/info")
    @OperationRight()
    public Response getOsDubboTestCase(@RequestParam String jsonValue) {
		Response res = new Response();
		OsDubboTestCase value = parseJsonValueObject(jsonValue, OsDubboTestCase.class);
		Argument arg = new Argument();
		arg.setObj(value);
    	arg = osDubboTestCaseServiceImpl.findOne(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getObj());
    	}
    	return res;
    }
    
    @PostMapping("/case/save")
    @OperationRight()
    public Response saveDubboTestCase(@RequestParam String jsonValue) {
		Response res = new Response();
    	OsDubboTestCase entity = parseJsonValueObject(jsonValue, OsDubboTestCase.class);
    	if(entity != null){
    		Argument arg = new Argument();
    		arg.setObj(entity);
    		arg = osDubboTestCaseServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			res.success().setDataToRtn(arg.getObj());
    		}
    	}
    	return res;
    }
    
    @PostMapping("/case/savemulti")
    @OperationRight()
    public Response savemulti(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
    	if(value != null){
    		JSONArray caseList = value.getJSONArray("caseList");
    		if(null != caseList && caseList.size() > 0){
    			JSONObject json = null;
    			OsDubboTestCase entity = null;
    			Argument arg = new Argument();
    			List<OsDubboTestCase> argList = new ArrayList<OsDubboTestCase>();
    			for (int i = 0, k = caseList.size(); i < k; i++) {
    				json = caseList.getJSONObject(i);
    				entity = new OsDubboTestCase();
    				entity.setCaseName(json.getString("name"));
    				entity.setParam(json.getString("param"));
    				entity.setInterfaceName(value.getString("interfaceName"));
    				entity.setMethodName(value.getString("methodName"));
    				entity.setName(value.getString("name"));
    				entity.setServer(value.getString("server"));
    				argList.add(entity);
				}
    			arg.setObj(argList);
	    		arg = osDubboTestCaseServiceImpl.saveBatch(arg);
	    		if(arg.isSuccess()){
	    			res.success();
	    		}
    		}
    	}
    	return res;
    }
    
    @PostMapping("/case/del")
    @OperationRight()
    public Response delOsDubboTestCase(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osDubboTestCaseServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			res.success();
    		}
    	}
    	return res;
    }

}