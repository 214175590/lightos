package com.echinacoop.lightos.web.rest.system;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.system.OsUserIconRight;
import com.echinacoop.lightos.service.system.OsDeskIconRightService;
import com.echinacoop.lightos.service.system.OsUserIconRightService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 此Controller类为[代码工厂]自动生成
 * @Desc 用户与图标及权限关系表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@RestController
@RequestMapping("/userApp")
public class OsUserIconRightResource extends BaseController {
	private final static Logger log = LoggerFactory.getLogger(OsUserIconRightResource.class);
	
	@Autowired
    OsDeskIconRightService osDeskIconRightServiceImpl;
	
	@Autowired
    OsUserIconRightService osUserIconRightServiceImpl;
	
	@RequestMapping("/loadUserAppList")
	@OperationRight("query")
    public Response loadYxosUserIconList() {
		Response res = new Response();
		User user = getUser();
		try {
			Argument arg = new Argument();
			if(StringConstant.ADMIN_ACCOUNT.equals(user.getAccount())){
				arg = osDeskIconRightServiceImpl.findAll(arg);
			} else {
				OsUserIconRight userIcon = new OsUserIconRight();
				userIcon.setUserId(getUserId());
				arg.setObj(userIcon);
				arg = osUserIconRightServiceImpl.getUserAllocatedDeskIcon(arg);
			}
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			}
		} catch (Exception e) {
			log.error("加载用户图标异常：" + e.getMessage(), e);
		}
		return res;
    }
    
    @RequestMapping("/getAllAppWithUser")
    @OperationRight("query")
    public Response getAllDeskIconWithUser(@RequestParam String jsonValue) {
    	Response res = new Response();
		JSONObject param = parseJsonValue(jsonValue);
		OsUserIconRight userIcon = new OsUserIconRight();
		userIcon.setUserId(param.getLong("userId"));
		try {
			Argument arg = new Argument();
			arg.setObj(userIcon);
			arg = osUserIconRightServiceImpl.getUserAllocatedDeskIcon(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			}
		} catch (Exception e) {
			log.error("加载用户图标异常：" + e.getMessage(), e);
		}
		return res;
    }
    
    @RequestMapping("/getRights")
    @OperationRight("query")
    public Response getRights(@RequestParam String jsonValue) {
    	Response res = new Response();
		JSONObject param = parseJsonValue(jsonValue);
		OsUserIconRight userIcon = new OsUserIconRight();
		userIcon.setUserId(param.getLong("userId"));
		userIcon.setDeskIconId(param.getLong("deskIconId"));
		userIcon.setRightCode(param.getString("rightCode"));
		try {
			Argument arg = new Argument();
			arg.setObj(userIcon);
			arg = osUserIconRightServiceImpl.getRights(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			}
		} catch (Exception e) {
			log.error("加载用户图标异常：" + e.getMessage(), e);
		}
		return res;
    }
    
    @RequestMapping("/saveUserApp")
    @OperationRight("add")
    public Response saveYxosUserIcon(@RequestParam String jsonValue) {
    	Response res = new Response();
		JSONObject param = parseJsonValue(jsonValue);
		try {
			JSONArray adds = param.getJSONArray("adds");
			JSONArray dels = param.getJSONArray("dels");
			OsUserIconRight userIcon = null;
			List<OsUserIconRight> addList = new ArrayList<OsUserIconRight>();
			List<OsUserIconRight> delList = new ArrayList<OsUserIconRight>();
			JSONObject json = null;
			for (int i = 0; i < adds.size(); i++) {
				json = adds.getJSONObject(i);
				userIcon = new OsUserIconRight();
				userIcon.setUserId(json.getLong("userId"));
				userIcon.setDeskIconId(json.getLong("deskIconId"));
				userIcon.setRightCode(json.getString("rightCode"));
				addList.add(userIcon);
			}
			for (int i = 0; i < dels.size(); i++) {
				json = dels.getJSONObject(i);
				userIcon = new OsUserIconRight();
				userIcon.setRowId(json.getLong("rowId"));
				userIcon.setUserId(json.getLong("userId"));
				userIcon.setDeskIconId(json.getLong("deskIconId"));
				userIcon.setRightCode(json.getString("rightCode"));
				delList.add(userIcon);
			}
			Argument arg = new Argument();
			arg.setToReq("adds", addList);
			arg.setToReq("dels", delList);
			arg = osUserIconRightServiceImpl.save(arg);
			if(arg.isSuccess()){
				res.success();
			}
		} catch (Exception e) {
			log.error("保存用户权限异常：" + e.getMessage(), e);
		}
		return res;
    }

}