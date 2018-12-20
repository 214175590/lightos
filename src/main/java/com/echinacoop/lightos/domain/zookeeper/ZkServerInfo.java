package com.echinacoop.lightos.domain.zookeeper;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@SuppressWarnings("serial")
@Entity
@Table(name = "os_zk_server_info")
public class ZkServerInfo implements Serializable {
	
	/**
	 * 主键id
	 */
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long rowId;
	
	/**
	 * 主机地址
	 */
	@NotNull
	@Column(name = "ip", length = 36)
	private String ip;
	
	/**
	 * 端口
	 */
	@NotNull
	@Column(name = "port", length = 5)
	private int port;
	
	/**
	 * 配置文件地址
	 */
	@Column(name = "config_path", length = 128)
	private String configPath;
	
	/**
	 * 描述
	 */
	@Column(name = "remark")
	private String desc;

	public Long getRowId() {
		return rowId;
	}

	public void setRowId(Long rowId) {
		this.rowId = rowId;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}


	public String getConfigPath() {
		return configPath;
	}

	public void setConfigPath(String configPath) {
		this.configPath = configPath;
	}
}
