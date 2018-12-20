package com.echinacoop.lightos.domain.zookeeper;

import java.io.Serializable;

@SuppressWarnings("serial")
public class ZookeeperInfo extends ZkServerInfo implements Serializable {
	
	/**
	 * 服务器的运行状态
	 */
	private ServerStatusEnum serverStatusEnum;
	
	/**
	 * 服务器的运行模式
	 */
	private ServerModelEnum serverModelEnum;
	
	/**
	 * ZK版本
	 */
	private String version;

	/**
	 * 客户端连接数
	 */
	private int connections;

	/**
	 * 节点数量
	 */
	private int nodeCount;
	
	public ServerStatusEnum getServerStatusEnum() {
		return serverStatusEnum;
	}

	public void setServerStatusEnum(ServerStatusEnum serverStatusEnum) {
		this.serverStatusEnum = serverStatusEnum;
	}

	public ServerModelEnum getServerModelEnum() {
		return serverModelEnum;
	}

	public void setServerModelEnum(ServerModelEnum serverModelEnum) {
		this.serverModelEnum = serverModelEnum;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public int getConnections() {
		return connections;
	}

	public void setConnections(int connections) {
		this.connections = connections;
	}

	public int getNodeCount() {
		return nodeCount;
	}

	public void setNodeCount(int nodeCount) {
		this.nodeCount = nodeCount;
	}

}
