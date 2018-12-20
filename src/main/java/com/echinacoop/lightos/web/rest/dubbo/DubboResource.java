package com.echinacoop.lightos.web.rest.dubbo;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.config.ApplicationProperties;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.dubbo.DubboJar;
import com.echinacoop.lightos.domain.dubbo.DubboServer;
import com.echinacoop.lightos.domain.dubbo.InterfaceMethod;
import com.echinacoop.lightos.domain.dubbo.OsDubboInterface;
import com.echinacoop.lightos.service.dubbo.DubboManager;
import com.echinacoop.lightos.service.dubbo.DubboService;
import com.echinacoop.lightos.service.dubbo.OsDubboInterfaceService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.echinacoop.lightos.web.rest.util.Telnet;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.FileUtils;

@RestController
@RequestMapping("/dubbo")
public class DubboResource extends BaseController {
	private static final Logger logger = LoggerFactory.getLogger(DubboResource.class);
	
	@Autowired
	private ApplicationProperties properties;
	
	@Autowired
    OsDubboInterfaceService osDubboInterfaceService;
	
	@PostMapping("/all")
	@OperationRight()
	public Response getAllDubboClients(){
		Response res = new Response();
		String jarDir = properties.getDubboClientPath();
		if(null != jarDir){
			if(!jarDir.endsWith("/")){
				jarDir += "/";
			}
			Collection<DubboJar> jars = DubboManager.loadDubboJars(jarDir);
			res.success().setDataToRtn(jars);
		} else {
			logger.error("缺少配置，请检查:\napplication: \n    dubbo-client-path: ***");
		}
		return res;
	}
	
	@PostMapping("/get/class")
	@OperationRight()
	public Response getClassList(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String jarName = value.getString("jarName");
			List<InterfaceMethod> list = DubboService.getJarClassList(jarName);
			if(list != null){
				res.success().setDataToRtn(list);
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/install")
	@OperationRight()
	public Response install(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String jarName = value.getString("jarName");
			boolean result = DubboService.install(jarName);
			if(result){
				res.success();
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/uninstall")
	@OperationRight()
	public Response uninstall(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String jarName = value.getString("jarName");
			boolean result = DubboService.uninstall(jarName);
			if(result){
				res.success();
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/del")
	@OperationRight()
	public Response delJar(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String jarName = value.getString("jarName");
			if(DubboService.uninstall(jarName)){
				DubboManager.deleteJar(jarName);
				String jarDir = properties.getDubboClientPath();
				if(null != jarDir){
					if(!jarDir.endsWith("/")){
						jarDir += "/";
					}
					File file = new File(jarDir + jarName);
					boolean result = file.delete();
					if(!result){
						System.gc();
						FileUtils.deleteFileThread(jarDir + jarName);
						res.success("文件被占用，已启用延迟删除，可以稍稍刷新再试");
					} else {
						res.success("删除成功");
					}
				}
			}
		} catch (Exception e) {
        	logger.error("Delete Dubbo Jar Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/upload")
	@OperationRight()
	public Response upload(@RequestParam("uploadFile") MultipartFile uploadFile){
		Response res = new Response();
		String originalFilename = uploadFile.getOriginalFilename();
		try {
			InputStream ins = uploadFile.getInputStream();
			if(originalFilename.endsWith(".jar") || originalFilename.endsWith(".JAR")){
				int size = ins.available();
				if((size / (1024 * 1024)) >= 2){
					res.fail("jar文件大小超过2MB限制");
				} else {
					String jarDir = properties.getDubboClientPath();
					if(null != jarDir){
						if(!jarDir.endsWith("/")){
							jarDir += "/";
						}
						FileOutputStream fos = new FileOutputStream(new File(jarDir + originalFilename));
						int index = 0;
						byte[] b = new byte[1024];
						while((index = ins.read(b)) != -1){
							fos.write(b, 0, index);
						}
						ins.close();
						fos.flush();
						fos.close();
						res.success();
					} else {
						res.fail("缺少配置：dubbo-client-path");
					}
				}
			} else {
				res.fail("请上传jar文件");
			}
		} catch (Exception e) {
        	logger.error("Upload Dubbo Client Jar Error: " + originalFilename, e);
        } 
		return res;
	}
	
	@PostMapping("/server/class")
	@OperationRight()
	public Response getServerClassList(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String ip = value.getString("ip");
			int port = value.getIntValue("port");
			Telnet tel = DubboService.telnetMap.get(ip + ":" + port);
			if(null == tel){
				tel = new Telnet(ip, port);
				DubboService.telnetMap.put(ip + ":" + port, tel);
			}
			String result = tel.send("ls -l");
			if(CommonUtils.isNotBlank(result)){
				String[] lines = result.split("\r\n");
				String line = null, str = "dubbo://";
				int inx = -1;
				List<DubboServer> imList = new ArrayList<DubboServer>();
				DubboServer ds = null;
				for (int i = 0; i < lines.length; i++) {
					line = lines[i];
					inx = line.indexOf(str);
					if(inx != -1){
						line = line.substring(line.indexOf("?") + 1);
						ds = DubboService.parseDubboServer(line);
						imList.add(ds);
					}					
				}
				res.success().setDataToRtn(imList);
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/status")
	@OperationRight()
	public Response getStatus(@RequestParam String jsonValue){
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String ip = value.getString("ip");
			int port = value.getIntValue("port");
			String interfaceName = value.getString("interfaceName");
			Telnet tel = DubboService.telnetMap.get(ip + ":" + port);
			if(null == tel){
				tel = new Telnet(ip, port);
				DubboService.telnetMap.put(ip + ":" + port, tel);
			}
			String result = null;
			if(CommonUtils.isNotBlank(interfaceName)){
				result = tel.send("count " + interfaceName);
			} else {
				result = tel.send("status -l");
			}
			if(CommonUtils.isNotBlank(result)){
				res.success().setDataToRtn(result);
			}
		} catch (Exception e) {
        	logger.error("Call Dubbo Service Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/interface/get")
	@OperationRight()
	public Response getInterfaceInfo(@RequestParam String jsonValue){
		Response res = new Response();
		try { 
			JSONObject value = parseJsonValue(jsonValue);
			System.out.println(value);
			OsDubboInterface obj = new OsDubboInterface();
			obj.setInterfaceName(value.getString("interfaceName"));
			obj.setMethodName(value.getString("methodName"));
			Argument arg = new Argument();
			arg.setObj(obj);
			arg = osDubboInterfaceService.findOne(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getObj());
			}
		} catch (Exception e) {
        	logger.error("Save Interface In,Out Params Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/interface/all")
	@OperationRight()
	public Response getInterfaceAll(@RequestParam String jsonValue){
		Response res = new Response();
		try { 
			JSONObject value = parseJsonValue(jsonValue);
			Argument arg = new Argument();
			arg.setToReq("name", value.getString("name"));
			arg = osDubboInterfaceService.findAll(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			}
		} catch (Exception e) {
        	logger.error("Save Interface In,Out Params Error: " + e.getMessage(), e);
        } 
		return res;
	}
	
	@PostMapping("/interface/save")
	@OperationRight()
	public Response saveInterfaceInfo(@RequestParam String jsonValue){
		Response res = new Response();
		try { 
			JSONObject value = parseJsonValue(jsonValue);
			System.out.println(value);
			OsDubboInterface obj = new OsDubboInterface();
			if(value.getLong("rowId") != null && value.getLong("rowId") != 0){
				obj.setRowId(value.getLong("rowId"));
			}
			obj.setName(value.getString("name"));
			obj.setInterfaceName(value.getString("interfaceName"));
			obj.setMethodName(value.getString("methodName"));
			obj.setRemark(value.getString("remark"));
			obj.setMethodNick(value.getString("methodNick"));
			obj.setInParam(value.getJSONArray("inparam").toJSONString());
			obj.setOutParam(value.getJSONArray("outparam").toJSONString());
			Argument arg = new Argument();
			arg.setObj(obj);
			arg = osDubboInterfaceService.save(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getObj());
			}
		} catch (Exception e) {
        	logger.error("Save Interface In,Out Params Error: " + e.getMessage(), e);
        } 
		return res;
	}
}
