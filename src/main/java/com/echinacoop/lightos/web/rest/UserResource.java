package com.echinacoop.lightos.web.rest;

import java.net.URISyntaxException;

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
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.service.MailService;
import com.echinacoop.lightos.service.UserService;
import com.echinacoop.lightos.socket.WSUtils;
import com.echinacoop.lightos.socket.annotation.Req;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.UserState;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.ssh.ShellManager;

@RestController
@RequestMapping("/user")
public class UserResource extends BaseController {

	private final Logger logger = LoggerFactory.getLogger(UserResource.class);

	@Autowired
	private UserService userService;

	@Autowired
	private MailService mailService;

	@PostMapping("/add")
	@OperationRight("add")
	public Response createUser(@RequestParam String jsonValue)
			throws URISyntaxException {
		Response res = new Response();
		User userDTO = parseJsonValueObject(jsonValue, User.class);
		Argument arg = new Argument();
		arg.setObj(userDTO);
		arg = userService.saveUser(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getObj());
		}
		return res;
	}

	@PostMapping("/update")
	@OperationRight("edit")
	public Response updateUser(@RequestParam String jsonValue) {
		Response res = new Response();
		User userDTO = parseJsonValueObject(jsonValue, User.class);
		Argument arg = new Argument();
		arg.setObj(userDTO);
		arg = userService.getUser(arg);
		if(arg.isSuccess()){
			User oldUser = (User) arg.getObj();
			oldUser.setName(userDTO.getName());
			oldUser.setEmail(userDTO.getEmail());
			oldUser.setMobile(userDTO.getMobile());
			oldUser.setPosition(userDTO.getPosition());
			oldUser.setDept(userDTO.getDept());
			oldUser.setCompany(userDTO.getCompany());
			oldUser.setQq(userDTO.getQq());
			oldUser.setWx(userDTO.getWx());
			oldUser.setRemark(userDTO.getRemark());
			arg.setObj(oldUser);
			arg = userService.saveUser(arg);
			if (arg.isSuccess()) {
				res.success();
			} else {
				res.fail(arg.getCode(), arg.getMessage());
			}
		} else {
			res.fail("无法找到此用户信息");
		}
		return res;
	}

	@PostMapping("/mp")
	@OperationRight()
	public Response modifyPassword(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		User user = isLogined(res);
		if (user != null) {
			String oldpwd = value.getString("oldpwd");
			String newpwd = value.getString("newpwd");
			String renewpwd = value.getString("renewpwd");
			String upass = user.getPassword();
			if (upass.equals(oldpwd)) {
				if (newpwd.equals(renewpwd)) {
					User newUser = new User();
					newUser.setRowId(user.getRowId());
					newUser.setPassword(newpwd);
					Argument arg = new Argument();
					arg.setObj(newUser);
					arg = userService.modifyPassword(arg);
					if (arg.isSuccess()) {
						res.success();
					} else {
						res.fail(arg.getCode(), arg.getMessage());
					}
				} else {
					res.fail("两次密码输入不一致，请重新输入");
				}
			} else {
				res.fail("旧密码不正确，请重新输入");
			}
		}
		return res;
	}

	@PostMapping("/cz")
	@OperationRight("reset")
	public Response resetPassword(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String account = value.getString("account");
		if (account == null) {
			res.fail("缺少参数：account");
		} else {
			Argument arg = new Argument();
			arg.setToReq("account", account);
			arg = userService.modifyPassword(arg);
			if (arg.isSuccess()) {
				res.success();
			} else {
				res.fail(arg.getCode(), arg.getMessage());
			}
		}
		return res;
	}

	@PostMapping("/users")
	@OperationRight("query")
	public Response getAllUsers(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		User user = new User();
		user.setAccount(value.getString("account"));
		user.setName(value.getString("name"));
		user.setCompany(value.getString("company"));
		Argument arg = new Argument();
		arg.setObj(user);
		arg.setPageable(value);
		arg = userService.getAllUsers(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getPage());
		}
		return res;
	}
	
	@PostMapping("/alluser")
	@OperationRight()
	public Response alluser(@RequestParam String jsonValue) {
		Response res = new Response();
		Argument arg = new Argument();
		arg = userService.getAllUserList(arg);
		if(arg.isSuccess()){
			res.success().setDataToRtn(arg.getDataForRtn());
		}
		return res;
	}

	@PostMapping("/del")
	@OperationRight("del")
	public Response deleteUser(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		Argument arg = new Argument();
		arg.setRowId(value.getLong("rowId"));
		arg = userService.deleteUser(arg);
		if (arg.isSuccess()) {
			res.success();
		}
		return res;
	}
	
	@PostMapping("/getUserNet")
	@OperationRight()
	public Response getUserNet(@RequestParam String jsonValue) {
		Response res = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		JSONObject jsonObject = new JSONObject();
		JSONArray ids = value.getJSONArray("ids");
		if(null != ids){
			String userId = null;
			WSClient client = null;
			for(int i = 0, k = ids.size(); i < k; i++){
				userId = ids.getString(i);
				client = DataCache.getWSClientByUserId(userId);
				if(null != client && client.getWsSession().isOpen()){
					jsonObject.put(userId, "online");
				} else {
					jsonObject.put(userId, "offline");
				}
			}
		}
		return res.success().setDataToRtn(jsonObject);
	}
	
	@PostMapping("/kickout")
	@OperationRight()
    public Response kickOut(@RequestParam String jsonValue){
		Response res = new Response();
        try {
        	User user = getUser();
        	if(null != user && StringConstant.ADMIN_ACCOUNT.equals(user.getAccount())){
        		JSONObject value = parseJsonValue(jsonValue);
        		String account = value.getString(StringConstant.KEY_USER_ACCOUNT);
        		WSClient client = DataCache.getWSClientByUserId(account);
        		if(null != client){
        			logger.debug("踢出用户：" + account);
        			WSData wsData = new WSData();
        			wsData.setUrl("user.kickout");
        			client.sendMessage(wsData);
        			res.success();
        		}
        	}
        } catch (Exception e) {
        }
        return res;
    }
	
}
