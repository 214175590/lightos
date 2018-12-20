package com.echinacoop.lightos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Lightos.
 * <p>
 * Properties are configured in the application.yml file. See
 * {@link io.github.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

	private String defaultPassword;
	private String dubboClientPath;
	private String zentaoDefId;
	
	private final SocketConfig socket = new SocketConfig();
	
	public SocketConfig getSocket() {
		return socket;
	}
	
	public String getZentaoDefId() {
		return zentaoDefId;
	}

	public void setZentaoDefId(String zentaoDefId) {
		this.zentaoDefId = zentaoDefId;
	}

	public String getDefaultPassword() {
		return defaultPassword;
	}

	public void setDefaultPassword(String defaultPassword) {
		this.defaultPassword = defaultPassword;
	}

	public String getDubboClientPath() {
		return dubboClientPath;
	}

	public void setDubboClientPath(String dubboClientPath) {
		this.dubboClientPath = dubboClientPath;
	}
	
	public static class SocketConfig {

		private int port;

		public int getPort() {
			return port;
		}

		public void setPort(int port) {
			this.port = port;
		}

	}

}
