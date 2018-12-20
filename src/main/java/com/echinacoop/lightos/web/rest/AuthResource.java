package com.echinacoop.lightos.web.rest;

import java.text.MessageFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.security.jwt.CustomJWT;
import com.echinacoop.lightos.service.MailService;
import com.echinacoop.lightos.service.UserService;
import com.echinacoop.lightos.socket.WSUtils;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.UserState;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.web.rest.errors.InvalidPasswordException;
import com.echinacoop.lightos.web.ssh.ShellManager;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AuthResource extends BaseController {
	private final Logger logger = LoggerFactory.getLogger(AuthResource.class);

	private final UserService userService;

	private final MailService mailService;

	public AuthResource(UserService userService, MailService mailService) {
		this.userService = userService;
		this.mailService = mailService;
	}
	
	/**
	 * 登录
	 *
	 * @param jsonValue
	 *            json格式参数
	 * @throws InvalidPasswordException
	 *             400 (Bad Request) if the password is incorrect
	 */
	@RequestMapping("/login")
	public Response login(@RequestParam("jsonValue") String jsonValue) {
		Response result = new Response();
		JSONObject value = parseJsonValue(jsonValue);
		String account = value.getString("account");
		String password = value.getString("password");
		logger.debug("user request login : {}", account);
		Argument arg = new Argument();
		User user = new User();
		user.setAccount(account);
		arg.setObj(user);
		arg = userService.getUser(arg);
		if(arg.isSuccess()){
			user = (User) arg.getObj();
			if (user != null) {
				if(user.getPassword().equals(password)){
					WSClient client = DataCache.getWSClientByUserId(user.getAccount());
					if(null == client){
						putUserToSession(user);
						
						String data = MessageFormat.format("{0},{1},{2},{3},{3}", user.getRowId(), user.getAccount(), user.getName(), user.getMobile(), user.getEmail());
						JSONObject token = CustomJWT.getToken(user.getAccount(), data);
						DataCache.addUserData(StringConstant.ACCESS_TOKEN + user.getAccount(), token);
						
						result.success().setDataToRtn(user).setToRtn("token", token);
					} else {
						result.fail(MapContants.MSG_CODE_REPEAT_LOGIN, "该账户已在其他设备登录");
					}
				} else {
					result.fail(MapContants.MSG_CODE_INVALID_PWD, "用户名或密码不正确");
				}
			} else {
				result.fail(MapContants.MSG_CODE_INVALID_PWD, "用户名或密码不正确");
			}
		} else {
			result.fail(MapContants.MSG_CODE_INVALID_PWD, "用户名或密码不正确");
		}
		logger.debug("user login {} : {}", result.getMessage(), account);
		return result;
	}
	
	/**
	 * 登出
	 */
	@RequestMapping("/logout")
	public Response logout(@RequestParam("jsonValue") String jsonValue) {
		User user = getUser();
		if(null != user){
			WSClient client = DataCache.getWSClientByUserId(user.getAccount());
			if(null != client){
				// 1、先推送状态消息
				WSUtils.pushUserChangeState(client, UserState.offline);
				// 3、再删除用户信息
				DataCache.removeWSClient(client.getSid());
				ShellManager.reset(client.getUserId(), client.getSid());
				DataCache.removeUserData(client.getUserId());
			}
		}
		request.getSession().invalidate();
		return new Response().success();
	}

	/**
	 * 检查用户是否登录
	 *
	 * @param managedUserVM
	 *            the managed user View Model
	 * @throws InvalidPasswordException
	 *             400 (Bad Request) if the password is incorrect
	 */
	@RequestMapping("/session")
	public Response userSession() {
		Response result = new Response();
		User user = getUser();
		if (user != null) {
			result.success().setDataToRtn(user);
		}
		return result;
	}

}
