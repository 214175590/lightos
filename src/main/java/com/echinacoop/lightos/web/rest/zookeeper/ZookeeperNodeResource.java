package com.echinacoop.lightos.web.rest.zookeeper;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.zookeeper.CreateMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.zookeeper.NodeData;
import com.echinacoop.lightos.domain.zookeeper.TreeNode;
import com.echinacoop.lightos.domain.zookeeper.ZkNode;
import com.echinacoop.lightos.web.rest.BaseController;
import com.echinacoop.lightos.web.rest.util.ZookeeperUtil;
import com.echinacoop.lightos.zookeeper.ZookeeperClient;
import com.yinsin.utils.CommonUtils;

@RestController
@RequestMapping("/zknode")
public class ZookeeperNodeResource extends BaseController {

	private static final Logger logger = LoggerFactory.getLogger(ZookeeperNodeResource.class);

	@PostMapping("/nodes")
	@OperationRight()
	public Response getRootNodes(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			if(!jsonValue.contains("ip") || !jsonValue.contains("port")){
				res.fail("缺少ZK服务信息参数");
				return res;
			}
			String connStr = MessageFormat.format("{0}:{1}", value.getString("ip"), value.getString("port"));
			ZookeeperClient client = ZookeeperUtil.getZkClient(connStr);
			List<String> rootNode = client.getChildren(ZookeeperUtil.SEPARATOR);
	    	List<TreeNode> treeNodes = new ArrayList<TreeNode>();
	    	for (String root : rootNode) {
	    		TreeNode treeNode = new TreeNode();
	    		treeNode.setId(ZookeeperUtil.SEPARATOR+root);
	    		treeNode.setName(root);
	    		treeNode.setParent(client.hasChildren(treeNode.getId()));
	    		treeNode.setPId("/");
	    		treeNodes.add(treeNode);
			}
	    	TreeNode treeNode = new TreeNode();
	    	treeNode.setId("/");
	    	treeNode.setName("ZkRoot");
	    	treeNode.setParent(treeNodes.size() > 0 ? true : false);
	    	treeNode.setOpen(true);
	    	treeNodes.add(treeNode);
	    	
			res.success().setDataToRtn(treeNodes);
		} catch (Exception e) {
			logger.error("加载ZK树节点异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	@PostMapping("/childs")
	@OperationRight()
	public List<TreeNode> getChildrenNode(@RequestParam("id") String id, @RequestParam("ip") String ip, @RequestParam("port") String port) {
		try {
			String connStr = MessageFormat.format("{0}:{1}", ip, port);
			ZookeeperClient client = ZookeeperUtil.getZkClient(connStr);
	    	List<String> childrenNode = client.getChildren(id, false);
	    	List<TreeNode> treeNodes = new ArrayList<TreeNode>();
	    	String name = "";
	    	for (String cnode : childrenNode) {
	    		name = cnode;
	    		if(id.endsWith("/providers") || id.endsWith("/consumers")){
	    			name = CommonUtils.stringUncode(name);
	    		}
	    		TreeNode treeNode = new TreeNode();
	    		treeNode.setId(id + ZookeeperUtil.SEPARATOR + cnode);
	    		treeNode.setName(name);
	    		treeNode.setParent(client.hasChildren(treeNode.getId()));
	    		treeNodes.add(treeNode);
			}
	    	return treeNodes;
		} catch (Exception e) {
			logger.error("异步获取树子节点异常：" + e.getMessage(), e);
		}
		return null;
	}
	
	@PostMapping("/add")
	@OperationRight("add")
	public Response newChildNode(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			ZkNode zkNode = parseJsonValueObject(jsonValue, ZkNode.class);
			if(!jsonValue.contains("ip") || !jsonValue.contains("port")){
				res.fail("缺少ZK服务信息参数");
				return res;
			}
			String connStr = MessageFormat.format("{0}:{1}", value.getString("ip"), value.getString("port"));
			ZookeeperClient zkClient = ZookeeperUtil.getZkClient(connStr);
			if (zkClient.exists(zkNode.getpId())) {
	    		String fullId = zkNode.getpId() + ZookeeperUtil.SEPARATOR + zkNode.getId();
	    		if ("/".equals(zkNode.getpId())) {
	    			fullId = zkNode.getpId() + zkNode.getId();
				}
	    		if (zkClient.exists(fullId)) {
	    			res.fail("节点" + fullId + "已存在");
				}else{
					byte[] data = null;
					if (CommonUtils.isNotBlank(zkNode.getData())) {
						data = zkNode.getData().getBytes();
					}
					String newNodeId = zkClient.create(fullId, data, CreateMode.PERSISTENT);
		    		res.success().setToRtn("nodeId", newNodeId);
				}
	    	}else{
	    		res.fail("节点[" + zkNode.getpId() + "]不存在");
	    	}
		} catch (Exception e) {
			logger.error("新增子节点异常：" + jsonValue, e);
		}
		return res;
	}
	
	@PostMapping("/edit")
	@OperationRight("edit")
	public Response updateNode(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			if(!jsonValue.contains("ip") || !jsonValue.contains("port")){
				res.fail("缺少ZK服务信息参数");
				return res;
			}
			String connStr = MessageFormat.format("{0}:{1}", value.getString("ip"), value.getString("port"));
			ZookeeperClient zkClient = ZookeeperUtil.getZkClient(connStr);
			String fullId = value.getString("fullId");
			String data = value.getString("data");
    		if (zkClient.exists(fullId)) {
    			boolean result  = zkClient.setData(fullId, data);
    			if(result){
    				res.success();
    			}
	    	}else{
	    		res.fail("节点[" + fullId + "]不存在");
	    	}
		} catch (Exception e) {
			logger.error("修改节点数据异常：" + jsonValue, e);
		}
		return res;
	}
	
	@PostMapping("/del")
	@OperationRight("del")
	public Response delNode(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			if(!jsonValue.contains("ip") || !jsonValue.contains("port")){
				res.fail("缺少ZK服务信息参数");
				return res;
			}
			String connStr = MessageFormat.format("{0}:{1}", value.getString("ip"), value.getString("port"));
			String fullId = value.getString("fullId");
			ZookeeperClient zkClient = ZookeeperUtil.getZkClient(connStr);
			if (zkClient.exists(fullId)) {
	        	if (zkClient.hasChildren(fullId)) {
	        		res.fail("节点[" + fullId + "]还有子节点，不能删除");
	    		} else {
	    			zkClient.delete(fullId);
	    			res.success();
	    		}
	    	}else{
	    		res.fail("节点[" + fullId + "]找不到了，无法删除");
	    	}
		} catch (Exception e) {
			logger.error("删除子节点异常：" + jsonValue, e);
		}
		return res;
	}
	
	@PostMapping("/info")
	@OperationRight()
	public Response getNodeInfo(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			String connStr = MessageFormat.format("{0}:{1}", value.getString("ip"), value.getString("port"));
			String fullId = value.getString("fullId");
			if(fullId.indexOf("://") != -1){
				fullId = fullId.substring(0, fullId.indexOf("://")) + "%3A%2F%2F" + CommonUtils.stringEncode(fullId.substring(fullId.indexOf("://") + 3));
			}
			ZookeeperClient zkClient = ZookeeperUtil.getZkClient(connStr);
			ZkNode zkNode = new ZkNode();
	    	if (zkClient.exists(fullId)) {
	    		zkNode.setId(fullId.substring(fullId.lastIndexOf('/') + 1));
	    		zkNode.setFullId(fullId);
	    		NodeData nodeData = zkClient.getData(fullId);
	    		zkNode.setData(nodeData.getData());
	    		zkNode.setNodeModel(nodeData.getNodeModel());
	    		
	    		res.success().setToRtn(zkNode);
			}
		} catch (Exception e) {
			logger.error("获取节点数据时异常：" + e.getMessage());
		}
		return res;
	}

}
