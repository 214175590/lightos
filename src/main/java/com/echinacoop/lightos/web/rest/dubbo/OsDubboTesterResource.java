package com.echinacoop.lightos.web.rest.dubbo;

import java.text.MessageFormat;
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
import com.echinacoop.lightos.domain.dubbo.DubboJar;
import com.echinacoop.lightos.domain.dubbo.OsDubboTestCase;
import com.echinacoop.lightos.domain.dubbo.OsDubboTester;
import com.echinacoop.lightos.domain.dubbo.ReqParam;
import com.echinacoop.lightos.service.dubbo.DubboManager;
import com.echinacoop.lightos.service.dubbo.DubboService;
import com.echinacoop.lightos.service.dubbo.OsDubboTestCaseService;
import com.echinacoop.lightos.service.dubbo.OsDubboTesterService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.echinacoop.lightos.web.rest.util.Telnet;
import com.yinsin.utils.CommonUtils;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc Dubbo接口测试数据表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/dubbo") // 例如: "/m108"
public class OsDubboTesterResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsDubboTesterResource.class);
	
	@Autowired
    OsDubboTesterService osDubboTesterServiceImpl;
	
	@Autowired
    OsDubboTestCaseService osDubboTestCaseServiceImpl;
	
	@PostMapping("/get/param")
	@OperationRight()
	public Response getParam(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String server = value.getString("address");
			String interfaceName = value.getString("interfaceName");
			String method = value.getString("method");
			OsDubboTester entity = new OsDubboTester();
			entity.setInterfaceName(interfaceName);
			entity.setMethodName(method);
			entity.setServer(server);
			Argument arg = new Argument();
			arg.setObj(entity);
			arg = osDubboTesterServiceImpl.findOne(arg);
			res.success();
			if(arg.isSuccess()){
				res.setDataToRtn(arg.getObj());
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/get/history")
	@OperationRight()
	public Response getTestHistory(@RequestParam String jsonValue){
		Response res = new Response();
		try {
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
			arg = osDubboTesterServiceImpl.findAllRecord(arg);
			res.success();
			if(arg.isSuccess()){
				res.setDataToRtn(arg.getDataForRtn());
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/test/single")
	@OperationRight()
	public Response callSingle(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String jarName = value.getString("jarName");
			String interfaceName = value.getString("interfaceName");
			String address = value.getString("address");
			String method = value.getString("method");
			String paramType = value.getString("paramType");
			String type = value.getString("type");
			logger.debug("Call Dubbo Service: {}", jsonValue);
			ReqParam rp = new ReqParam();
			rp.setJarName(jarName);
			DubboJar dubboJar = DubboManager.getJar(rp.getJarName());
			if(null != dubboJar){
				rp.setJarPath(dubboJar.getJarPath());
				rp.setAddress("zookeeper://" + address);
				String param = "";
				if(null != paramType){
					param = value.getString("param");
					if(CommonUtils.isNotBlank(param)){
						rp.setParam(param);
					}
					if(!paramType.contains("java.lang.String")){
						rp.setParam(JSONUtils.convertJavaObject(value.getJSONObject("param"), Class.forName(paramType)));
					}
				}
				if(CommonUtils.isNotEmpty(rp.getParam())){
					rp.setParamType(paramType);
					rp.setInterfaceName(interfaceName);
					rp.setMethod(method);
					Object result = DubboService.invoke(rp);
					if(result != null){
						try {
							if(CommonUtils.isNotBlank(type) && "case".equals(type)){
								OsDubboTestCase entity = new OsDubboTestCase();
								entity.setName(jarName);
								entity.setServer(address);
								entity.setInterfaceName(rp.getInterfaceName());
								entity.setMethodName(rp.getMethod());
								entity.setResult(JSONObject.toJSONString(result));
								Argument arg = new Argument();
								arg.setObj(entity);
								arg.setToReq("param", param);
								osDubboTestCaseServiceImpl.save(arg);
							} else {
								OsDubboTester entity = new OsDubboTester();
								entity.setName(jarName);
								entity.setServer(address);
								entity.setInterfaceName(rp.getInterfaceName());
								entity.setMethodName(rp.getMethod());
								entity.setResult(JSONObject.toJSONString(result));
								Argument arg = new Argument();
								arg.setObj(entity);
								arg.setToReq("param", param);
								osDubboTesterServiceImpl.save(arg);
							}
						} catch (Exception e) {
							logger.error("保存测试结果时异常：" + result, e);
						}
						res.success().setDataToRtn(result).setToRtn("param", rp.getParam());
					}
				}
			} else {
				res.fail("jar包未找到：" + rp.getJarName());
			}
        } catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/test/server")
	@OperationRight()
	public Response callMult(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String dubboServer = value.getString("dubboServer");
			String interfaceName = value.getString("interfaceName");
			String address = value.getString("address");
			String method = value.getString("method");
			String paramType = value.getString("paramType");
			String type = value.getString("type");
			logger.debug("Call Dubbo Service: {}", jsonValue);
			ReqParam rp = new ReqParam();
			Telnet tel = DubboService.telnetMap.get(dubboServer);
			if(null != tel){
				String param = "";
				if(null != paramType){
					param = value.getString("param");
					if(CommonUtils.isNotBlank(param)){
						rp.setParam(param.replaceAll("\"", "\\\\\\\""));
					}
					/*if(!paramType.contains("java.lang.String")){
						rp.setParam(JSONUtils.convertJavaObject(value.getJSONObject("param"), Class.forName(paramType)));
					}*/
				}
				if(CommonUtils.isNotEmpty(param)){
					String result = tel.send(MessageFormat.format("invoke {0}.{1}(\"{2}\")", interfaceName, method, rp.getParam()));
					if(result != null){
						try {
							if(CommonUtils.isNotBlank(type) && "case".equals(type)){
								OsDubboTestCase entity = new OsDubboTestCase();
								entity.setCaseName(value.getString("caseName"));
								entity.setName(dubboServer);
								entity.setServer(address);
								entity.setInterfaceName(interfaceName);
								entity.setMethodName(method);
								entity.setResult(result);
								Argument arg = new Argument();
								arg.setObj(entity);
								arg.setToReq("param", param);
								osDubboTestCaseServiceImpl.save(arg);
							} else {
								OsDubboTester entity = new OsDubboTester();
								entity.setName(dubboServer);
								entity.setServer(address);
								entity.setInterfaceName(interfaceName);
								entity.setMethodName(method);
								entity.setResult(result);
								Argument arg = new Argument();
								arg.setObj(entity);
								arg.setToReq("param", param);
								osDubboTesterServiceImpl.save(arg);
							}
						} catch (Exception e) {
							logger.error("保存测试结果时异常：" + result, e);
						}
						res.success().setDataToRtn(result).setToRtn("param", param);
					}
				}
			} else {
				res.fail("服务未找到：" + dubboServer);
			}
        } catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/test/save") 
	@OperationRight()
    public Response saveTestData(@RequestParam String jsonValue) {
		Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	if(value != null){
    		Argument arg = new Argument();
    		OsDubboTester entity = new OsDubboTester();
    		entity.setName(value.getString("name"));
    		entity.setServer(value.getString("address"));
    		entity.setInterfaceName(value.getString("interfaceName"));
    		entity.setMethodName(value.getString("method"));
    		entity.setParam(value.getString("param"));
    		arg.setObj(entity);
    		arg = osDubboTesterServiceImpl.save(arg);
    		if(arg.isSuccess()){
    			res.success().setDataToRtn(entity);
    		}
    	}
    	return res;
    }
    
    @PostMapping("/test/del")
    @OperationRight()
    public Response delOsDubboTester(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osDubboTesterServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			res.success();
    		}
    	}
    	return res;
    }
    
    @PostMapping("/all/param")
    @OperationRight()
    public Response getAllParam(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	String server = value.getString("address");
    	JSONArray array = value.getJSONArray("list");
    	Argument arg = new Argument();
    	arg.setToReq("server", server);
    	arg = osDubboTesterServiceImpl.findTesterAll(arg);
    	if(arg.isSuccess()){
    		List<OsDubboTester> dataList = (List<OsDubboTester>) arg.getDataForRtn();
    		if(null != dataList){
    			if(null != array && array.size() > 0){
    				JSONObject obj = null;
    				OsDubboTester tester = null;
    				String in = null, m = null;
    				for(int i = 0, k = array.size(); i < k; i++){
    					obj = array.getJSONObject(i);
    					in = obj.getString("interfaceName");
    					m = obj.getString("method");
    					for(int j = 0, l = dataList.size(); j < l; j++){
    						tester = dataList.get(j);
    						if(in.equals(tester.getInterfaceName()) && m.equals(tester.getMethodName())){
    							obj.put("param", tester.getParam());	
    						}
    					}
    				}
    				res.success().setDataToRtn(array);
    			} else {
    				res.success().setDataToRtn(dataList);
    			}
    		}
    	}    	
    	return res;
    }
    
    @PostMapping("/test/sync")
    @OperationRight()
    public Response syncParam(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	String name = value.getString("name");
    	String server1 = value.getString("address1");
    	String server2 = value.getString("address2");
    	Argument arg = new Argument();
    	arg.setToReq("name", name);
    	arg.setToReq("server", server1);
    	arg = osDubboTesterServiceImpl.findTesterByNameAndServer(arg);
    	if(arg.isSuccess()){
    		List<OsDubboTester> dataList1 = (List<OsDubboTester>) arg.getDataForRtn();
    		
    		arg.setToReq("name", name);
        	arg.setToReq("server", server2);
    		arg = osDubboTesterServiceImpl.findTesterByNameAndServer(arg);
    		if(arg.isSuccess()){
    			List<OsDubboTester> dataList2 = (List<OsDubboTester>) arg.getDataForRtn();
    			OsDubboTester ot1 = null, ot2 = null;
    			for (int i = 0, k = dataList1.size(); i < k; i++) {
    				ot1 = dataList1.get(i);
    				ot1.setRowId(null);
    				ot1.setServer(server2);
        			for (int j = 0, l = dataList2.size(); j < l; j++) {
        				ot2 = dataList2.get(j);
        				if(ot1.getInterfaceName().equals(ot2.getInterfaceName())
        						&& ot1.getMethodName().equals(ot2.getMethodName())){
        					ot1.setRowId(ot2.getRowId());
        				}
        			}
    			}
    			arg.setObj(dataList1);
    			arg = osDubboTesterServiceImpl.saveBatch(arg);
    			if(arg.isSuccess()){
    				res.success();
    			}
    		}
    	}
    	return res;
    }

}