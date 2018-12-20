package com.echinacoop.lightos.web.rest.util;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.zookeeper.ZooKeeper;

import com.echinacoop.lightos.zookeeper.ZookeeperClient;

public class ZookeeperUtil {
	/**
	 * 节点分隔符
	 */
	public static final String SEPARATOR = "/";
	public static final int ZK_SESSTION_TIMEOUT = 5000;

	private static Map<String, ZookeeperClient> zkClientMap = new ConcurrentHashMap<String, ZookeeperClient>();
	
	public static ZookeeperClient getZkClient(String connectString){
		ZookeeperClient client = zkClientMap.get(connectString);
		if(null != client && client.getZooKeeper().getState() != ZooKeeper.States.CONNECTED){
			client.releaseConnection();
			client = null;
		}
		if(null == client){
			try {
				client = new ZookeeperClient(connectString, ZK_SESSTION_TIMEOUT);
				zkClientMap.put(connectString, client);
			} catch (Exception e) {
			}
		}
		return client;
	}

}
