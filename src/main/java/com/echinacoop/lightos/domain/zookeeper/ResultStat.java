package com.echinacoop.lightos.domain.zookeeper;

public class ResultStat {

	private String ZookeeperVersion;

	private String mode;

	private int connections;

	private int nodeCount;

	public String getZookeeperVersion() {
		return ZookeeperVersion;
	}

	public void setZookeeperVersion(String zookeeperVersion) {
		ZookeeperVersion = zookeeperVersion;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
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
