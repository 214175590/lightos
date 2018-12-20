package com.echinacoop.lightos.domain.zookeeper;

public enum ServerModelEnum {

	/**
	 * LEADER
	 */
	LEADER("leader", "主"),
	/**
	 * FLOWER
	 */
	FOLLOWER("follower", "从");
	/**
	 * 值
	 */
	private String val;
	/**
	 * 描述
	 */
	private String msg;

	private ServerModelEnum(String val, String msg) {
		this.val = val;
		this.msg = msg;
	}

	public String getVal() {
		return val;
	}

	public void setVal(String val) {
		this.val = val;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public String getString() {
		return this.val.toString();
	}

	public static ServerModelEnum getInstance(String val) {
		for (ServerModelEnum buss : ServerModelEnum.values()) {
			if (buss.getVal().equals(val)) {
				return buss;
			}
		}
		return null;
	}
}
