package com.echinacoop.lightos.domain.zookeeper;

public class TreeNode {

	/**
	 * 节点id
	 */
	private String id;

	/**
	 * 父节点id
	 */
	private String pId;
	/**
	 * 节点名称
	 */
	private String name;
	/**
	 * 节点是否展开
	 */
	private boolean open;
	/**
	 * 是否选中
	 */
	private boolean checked;
	/**
	 * 是否是叶子节点
	 */
	private boolean isLeafNode;
	/**
	 * 是否是父级节点
	 */
	private boolean isParent;

	public TreeNode() {

	}

	public TreeNode(String id, String pId, String name, boolean open, boolean checked) {
		this.id = id;
		this.pId = pId;
		this.name = name;
		this.open = open;
		this.checked = checked;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getpId() {
		return pId;
	}

	public void setPId(String pid) {
		this.pId = pid;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isOpen() {
		return open;
	}

	public void setOpen(boolean open) {
		this.open = open;
	}

	public boolean isChecked() {
		return checked;
	}

	public void setChecked(boolean checked) {
		this.checked = checked;
	}

	public boolean isLeafNode() {
		return isLeafNode;
	}

	public void setLeafNode(boolean isLeafNode) {
		this.isLeafNode = isLeafNode;
	}

	public boolean getIsParent() {
		return isParent;
	}

	public void setParent(boolean isParent) {
		this.isParent = isParent;
	}

}
