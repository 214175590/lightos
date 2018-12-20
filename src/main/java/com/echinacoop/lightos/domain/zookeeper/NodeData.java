package com.echinacoop.lightos.domain.zookeeper;

/**
 * 项目名称：zmc 实现功能： 节点数据， 类名称：NodeData 类描述：(该类的主要功能) 创建人：徐纪伟 E-mail:
 * 289045706@qq.com 创建时间：2017年2月18日下午6:39:13 修改人： 修改时间： 版权 : 修改备注：
 * 
 * @version
 */
public class NodeData {
	/**
	 * 节点数据
	 */
	private String data;
	/**
	 * 节点类型
	 */
	private NodeModelEnum nodeModel;

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public NodeModelEnum getNodeModel() {
		return nodeModel;
	}

	public void setNodeModel(NodeModelEnum nodeModel) {
		this.nodeModel = nodeModel;
	}

}
