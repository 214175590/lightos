package com.echinacoop.lightos.web.rest.svn;

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
import com.echinacoop.lightos.domain.svn.OsSvnProject;
import com.echinacoop.lightos.domain.svn.OsSvnUser;
import com.echinacoop.lightos.security.DesJS;
import com.echinacoop.lightos.service.svn.OsSvnProjectService;
import com.echinacoop.lightos.service.svn.OsSvnUserService;
import com.echinacoop.lightos.service.svn.SvnService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.yinsin.utils.CommonUtils;

@RestController
@RequestMapping("/svn")
public class SvnResource extends BaseController {
	private static final Logger logger = LoggerFactory.getLogger(SvnResource.class);
	
	@Autowired
	private SvnService service;
	
	@Autowired
	private OsSvnUserService userService;
	
	@Autowired
	private OsSvnProjectService proService;
	
	@PostMapping("/get/date")
	@OperationRight()
	public Response getChangeByDate(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String path = value.getString("path");
		String begin = value.getString("begin");
		String end = value.getString("end");
		long version = CommonUtils.stringToLong(value.getString("version"), 0);
		String author = value.getString("author");
		Long userId = getUserId();
		Argument arg = new Argument();
		arg.setToReq("userId", userId);
		arg.setToReq("path", path);
		arg.setToReq("beginDate", begin);
		arg.setToReq("endDate", end);
		arg.setToReq("startVersion", version);
		arg.setToReq("endVersion", version);
		arg.setToReq("author", author);
		arg = service.getProjectLog(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getDataForRtn());
		}
		return res;
	}
	
	@PostMapping("/get/ver")
	@OperationRight()
	public Response getChangeByVersion(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long userId = getUserId();
		Argument arg = new Argument();
		arg.setToReq("userId", userId);
		
		return res;
	}
	
	@PostMapping("/get/diff")
	@OperationRight()
	public Response getFileVersionDiff(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Long userId = getUserId();
		String path = value.getString("path");
		Long version1 = value.getLong("version1");
		Long version2 = value.getLong("version2");
		Argument arg = new Argument();
		arg.setToReq("userId", userId);
		arg.setToReq("path", path);
		arg.setToReq("version1", version1 == null ? 0 : version1);
		arg.setToReq("version2", version2 == null ? 0 : version2);
		arg = service.getPathDiff(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getDataForRtn());
		}
		return res;
	}
	
	@PostMapping("/get/user")
	@OperationRight()
	public Response getSvnUserInfo(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		Long userId = getUserId();
		Argument arg = new Argument();
		arg.setRowId(userId);
		arg = userService.getOne(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getObj());
		}
		return res;
	}
	
	@PostMapping("/get/projects")
	@OperationRight()
	public Response getSvnProjects(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		Argument arg = new Argument();
		arg.setRowId(getUserId());
		arg = proService.findAll(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getDataForRtn());
		}
		return res;
	}
	
	@PostMapping("/save")
	@OperationRight()
	public Response savesvn(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		Long userId = getUserId();
		JSONObject value = parseJsonValue(jsonValue);
		String username = value.getString("username");
		String password = value.getString("password");
		String projectName = value.getString("name");
		String projectUrl = value.getString("url");
		Argument arg = new Argument();
		if(CommonUtils.isNotBlank(username) && CommonUtils.isNotBlank(password) && !"__".equals(password)){
			OsSvnUser user = new OsSvnUser();
			user.setUserId(userId);
			user.setUsername(username);
			try {
				user.setPassword(DesJS.encrypt(password, username));
			} catch (Exception e) {
			}
			arg.setObj(user);
			userService.save(arg);
		}
		if(CommonUtils.isNotBlank(projectName) && CommonUtils.isNotBlank(projectUrl)){
			OsSvnProject obj = new OsSvnProject();
			obj.setRowId(value.getLong("rowId"));
			obj.setProjectName(projectName);
			obj.setProjectUrl(projectUrl);
			if(CommonUtils.isNotBlank(username)){
				obj.setProjectUsers(username);
			}
			arg.setObj(obj);
			arg = proService.save(arg);
		}
		if(arg.isSuccess()){
			res.success();
		}
		return res;
	}
	
	@PostMapping("/get/file")
	@OperationRight()
	public Response getFileContent(@RequestParam("jsonValue") String jsonValue){
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String path = value.getString("path");
		Long version = value.getLong("version");
		if(CommonUtils.isNotBlank(path)){
			Long userId = getUserId();
			Argument arg = new Argument();
			arg.setToReq("userId", userId);
			arg.setToReq("path", path);
			arg.setToReq("version", version == null ? 0 : version);
			arg = service.getFileContent(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			}
		} else {
			res.fail("参数错误");
		}
		return res;
	}
	
}
