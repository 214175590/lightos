package com.echinacoop.lightos.domain.zookeeper;

public enum CommandConstEnum {

	CONF("conf", "conf"),

	CONS("cons", "cons"),

	CRST("crst", "crst"),

	DUMP("dump", "dump"),

	ENVI("envi", "envi"),

	// REQS("reqs","reqs"),

	RUOK("ruok", "ruok"),

	SRST("srst", "srst"),

	SRVR("srvr", "srvr"),

	STAT("stat", "stat"),

	WCHS("wchs", "wchs"),

	WCHC("wchc", "wchc"),

	WCHP("wchp", "wchp"),

	MNTR("mntr", "mntr"),

	;
	/**
	 * 值
	 */
	private String val;
	/**
	 * 描述
	 */
	private String msg;

	private CommandConstEnum(String val, String msg) {
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

	public static CommandConstEnum getInstance(String val) {
		for (CommandConstEnum buss : CommandConstEnum.values()) {
			if (buss.getVal().equals(val)) {
				return buss;
			}
		}
		return null;
	}
}
