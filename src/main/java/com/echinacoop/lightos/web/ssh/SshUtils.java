package com.echinacoop.lightos.web.ssh;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.security.DesJS;
import com.echinacoop.lightos.socket.dto.DataCache;

public class SshUtils {
	private final static Logger logger = LoggerFactory.getLogger(SshUtils.class);
	
	public static Argument getShellInstance(User user, String serverIp, int port, String username, String password){
		Argument result = new Argument();
		try {
			ShellInstance instance = ShellManager.getByIp(user.getAccount(), serverIp, port);
			if (null == instance) {
				instance = new ShellInstance();
				instance.setUser(user);
				instance.setUserId(user.getAccount());
				instance.setUsername(username);
				instance.setPassword(password);
				instance.setClient(DataCache.getWSClientByUserId(user.getAccount()));
				ShellManager.add(user.getAccount(), instance);
			} else if (instance.getClient() == null) {
				instance.setClient(DataCache.getWSClientByUserId(user.getAccount()));
			}
			if (instance.getLinuxOs() == null) {
				LinuxOs os = new LinuxOs();
				Argument arg = os.connection(serverIp, username, DesJS.decrypt(password, username), port);
				result.setCode(arg.getCode());
				result.setMessage(arg.getMessage());
				if (result.isSuccess()) {
					instance.setServerIp(serverIp);
					instance.setPort(port);
					instance.setUsername(username);
					instance.setPassword(password);
					instance.setLinuxOs(os);
					instance.start();
					result.setObj(instance);

					result.success();
				}
			} else {
				result.setObj(instance);
				result.success();
			}
		} catch (Exception e) {
			logger.error("getShellInstance error", e);
		}
		return result;
	}
	
}
