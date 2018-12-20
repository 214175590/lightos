package com.echinacoop.lightos.web.rest.docker;

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
import com.echinacoop.lightos.domain.docker.OsDockerInfo;
import com.echinacoop.lightos.security.DesJS;
import com.echinacoop.lightos.service.docker.OsDockerInfoService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.echinacoop.lightos.web.ssh.ShellInstance;
import com.echinacoop.lightos.web.ssh.ShellManager;
import com.echinacoop.lightos.web.ssh.SshUtils;
import com.yinsin.utils.CommonUtils;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc Docker节点服务器信息
 * @Time 2018-06-08 17:28
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/docker")
public class OsDockerInfoResource extends BaseController {
	private final static Logger logger = LoggerFactory.getLogger(OsDockerInfoResource.class);
	
	@Autowired
    OsDockerInfoService osDockerInfoServiceImpl;
	
	@PostMapping("/list") 
	@OperationRight()
    public Response loadOsDockerInfoList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
		Argument arg = new Argument();
		arg.setPageable(value);
    	arg = osDockerInfoServiceImpl.findAllForPager(arg);
    	if(arg.isSuccess()){
    		res.success().setDataToRtn(arg.getPage());
    	}
    	return res;
    }
    
    @PostMapping("/version")
    @OperationRight()
    public Response getDockerVersion(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		Argument arg = new Argument();
		arg.setRowId(rowId);
		arg = osDockerInfoServiceImpl.getOne(arg);
    	if(arg.isSuccess()){
    		OsDockerInfo obj = (OsDockerInfo) arg.getObj();
    		User user = getUser();
    		arg = SshUtils.getShellInstance(user, obj.getIp(), obj.getPort(), obj.getUsername(), obj.getPassword());
    		if(arg.isSuccess()){
    			ShellInstance shell = (ShellInstance) arg.getObj();
    			try {
					if (shell.isSended()) {
						shell.send("\r\n");
					}
					shell.setSended(true);
					shell.send("docker -v");
					shell.send("docker images");
					shell.send("docker ps");
				} catch (Exception e) {
					logger.error("发送shell异常：", e);
				}
    			res.success();
    		}
    	}
    	return res;
    }
    
    @PostMapping("/save")
    @OperationRight("add")
    public Response addOsDockerInfo(@RequestParam String jsonValue) {
		Response res = new Response();
    	OsDockerInfo entity = parseJsonValueObject(jsonValue, OsDockerInfo.class);
    	if(entity != null){
    		if(CommonUtils.isNotBlank(entity.getIp()) && CommonUtils.isNotBlank(entity.getUsername()) && CommonUtils.isNotBlank(entity.getPassword())){
    			if(entity.getRowId() == null || entity.getRowId() == 0 || !entity.getPassword().equals("________")){
    				try {
    					entity.setPassword(DesJS.encrypt(entity.getPassword(), entity.getUsername()));
    				} catch (Exception e) {
    				}
    			}
    			Argument arg = new Argument();
    			arg.setObj(entity);
    			arg = osDockerInfoServiceImpl.save(arg);
    			if(arg.isSuccess()){
    				res.success().setDataToRtn(entity);
    			}
    		} else {
    			res.fail("缺少数据");
    		}
    	}
    	return res;
    }
    
    @PostMapping("/del")
    @OperationRight("del")
    public Response delOsDockerInfo(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject value = parseJsonValue(jsonValue);
    	Long rowId = value.getLong("rowId");
    	if(rowId != null){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osDockerInfoServiceImpl.delete(arg);
    		if(arg.isSuccess()){
    			res.success();
    		}
    	}
    	return res;
    }
    
    
    @PostMapping("/cmd")
    @OperationRight("cmd")
    public Response getDockerCmd(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		String cmd = value.getString("cmd");
		Argument arg = new Argument();
		arg.setRowId(rowId);
		arg = osDockerInfoServiceImpl.getOne(arg);
    	if(arg.isSuccess()){
    		OsDockerInfo obj = (OsDockerInfo) arg.getObj();
    		User user = getUser();
    		arg = SshUtils.getShellInstance(user, obj.getIp(), obj.getPort(), obj.getUsername(), obj.getPassword());
    		if(arg.isSuccess()){
    			ShellInstance shell = (ShellInstance) arg.getObj();
    			try {
    				String s = new String(new byte[] { -62, -96 });
    				cmd = cmd.replaceAll(s, " ");
					if (shell.isSended()) {
						shell.send("\r\n");
					}
					shell.setSended(true);
					shell.send(cmd);
				} catch (Exception e) {
					logger.error("发送shell异常：", e);
				}
    			res.success();
    		}
    	}
    	return res;
    }
    
    @PostMapping("/reconn")
    @OperationRight("edit")
    public Response getReconnection(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long rowId = value.getLong("rowId");
		Argument arg = new Argument();
		arg.setRowId(rowId);
		arg = osDockerInfoServiceImpl.getOne(arg);
    	if(arg.isSuccess()){
    		OsDockerInfo obj = (OsDockerInfo) arg.getObj();
    		User user = getUser();
    		try {
				ShellManager.reconnection(user.getAccount(), obj.getIp(), obj.getPort());
			} catch (Exception e) {
				logger.error("关闭shell连接失败：", e);
			}
			res.success();
    	}
    	return res;
    }
}