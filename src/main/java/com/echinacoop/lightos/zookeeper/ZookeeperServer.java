package com.echinacoop.lightos.zookeeper;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.apache.zookeeper.server.quorum.QuorumPeerConfig;
import org.apache.zookeeper.server.quorum.QuorumPeerMain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.service.util.ThreadPool;
import com.yinsin.utils.CommonUtils;

/**      
 * zk服务器管理操作类  
 * @version    
 */
public class ZookeeperServer {
	private static final Logger logger = LoggerFactory.getLogger(ZookeeperServer.class);
	
	public static boolean bootServer(final String configPath){
		if (CommonUtils.isBlank(configPath)) {
			return false;
		}
		final CountDownLatch connectedLatch = new CountDownLatch(1);
		ThreadPool.execute(new Runnable() {
			@Override
			public void run() {
				try {
					QuorumPeerConfig config = new QuorumPeerConfig();
					config.parse(configPath);
					QuorumPeerMain peerMain = new QuorumPeerMain();
					peerMain.runFromConfig(config);
				} catch (Exception e) {
					connectedLatch.countDown();
					logger.error("启动ZK服务异常：" + configPath);
				}
			}
		});
		try {
			boolean b = connectedLatch.await(5000, TimeUnit.MILLISECONDS);
			return !b;
		} catch (InterruptedException e) {
			logger.error("启动ZK服务异常：" + configPath);
			return true;
		}
	}
}
