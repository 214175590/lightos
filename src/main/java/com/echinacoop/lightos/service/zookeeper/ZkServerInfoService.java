package com.echinacoop.lightos.service.zookeeper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.zookeeper.CommandConstEnum;
import com.echinacoop.lightos.domain.zookeeper.ResultRuok;
import com.echinacoop.lightos.domain.zookeeper.ResultStat;
import com.echinacoop.lightos.domain.zookeeper.ServerModelEnum;
import com.echinacoop.lightos.domain.zookeeper.ServerStatusEnum;
import com.echinacoop.lightos.domain.zookeeper.ZkServerInfo;
import com.echinacoop.lightos.domain.zookeeper.ZookeeperInfo;
import com.echinacoop.lightos.repository.zookeeper.ZkServerInfoRepository;
import com.echinacoop.lightos.zookeeper.WordsCommand;
import com.echinacoop.lightos.zookeeper.ZookeeperServer;
import com.yinsin.utils.CommonUtils;

@Service
public class ZkServerInfoService {
	private static final Logger logger = LoggerFactory.getLogger(ZkServerInfoService.class);

	@Autowired
	private ZkServerInfoRepository dao;

	public Argument findAllForPage(Argument arg) throws Exception {
		try {
			Page<ZkServerInfo> infos = dao.findAll(arg.getPageable());
			if (infos != null) {
				List<ZookeeperInfo> list = new ArrayList<ZookeeperInfo>();
				ZookeeperInfo zk = null;
				for (ZkServerInfo info : infos) {
					zk = new ZookeeperInfo();
					zk.setRowId(info.getRowId());
					zk.setIp(info.getIp());
					zk.setPort(info.getPort());
					zk.setConfigPath(info.getConfigPath());
					zk.setDesc(info.getDesc());
					ResultStat resultStat = WordsCommand.stat(info);
					if (resultStat != null) {
						ResultRuok ruok = WordsCommand.ruok(info);
						if (ruok == null) {
							zk.setServerStatusEnum(ServerStatusEnum.OFFLINE);
						} else if (CommonUtils.isNotBlank(ruok.getImok())) {
							zk.setServerStatusEnum(ServerStatusEnum.ONLINE);
							zk.setServerModelEnum(ServerModelEnum.getInstance(resultStat.getMode()));
							zk.setVersion(resultStat.getZookeeperVersion());
							zk.setConnections(resultStat.getConnections());
							zk.setNodeCount(resultStat.getNodeCount());
						} else {
							zk.setServerStatusEnum(ServerStatusEnum.EXCEPTIOM);
						}
					} else {
						zk.setServerStatusEnum(ServerStatusEnum.OFFLINE);
					}
					list.add(zk);
				}
				PageImpl<ZookeeperInfo> pageImpl = new PageImpl<ZookeeperInfo>(list, arg.getPageable(), infos.getTotalElements());
				arg.success().setPage(pageImpl);
			}
		} catch (Exception e) {
			logger.error("获取ZK服务列表异常：" + e.getMessage(), e);
		}
		return arg;
	}

	public Argument startServer(Argument arg) {
		try {
			ZkServerInfo zkServerInfo = dao.findOne(arg.getRowId());
			if (zkServerInfo == null) {
				logger.error("启动ZK服务失败：ZK节点不存在 " + arg.getRowId());
				arg.fail("ZK节点不存在");
			} else if(ZookeeperServer.bootServer(zkServerInfo.getConfigPath())){
				arg.success();
			} else {
				arg.fail("启动ZK服务失败");
			}
		} catch (Exception e) {
			arg.fail("启动ZK服务失败：" + e.getMessage());
			logger.error("启动ZK服务异常：" + arg.getRowId(), e);
		}
		return arg;
	}

	public Argument saveZkServerInfo(Argument arg) {
		try {
			ZkServerInfo obj = (ZkServerInfo) arg.getObj();
			obj = dao.save(obj);
			if (null != obj) {
				arg.success().setObj(obj);
			}
		} catch (Exception e) {
			arg.fail("保存ZK服务信息异常：" + e.getMessage());
			logger.error("保存ZK服务信息异常：" + e.getMessage(), e);
			throw new RuntimeException(e);
		}
		return arg;
	}

	public Argument delZkServerInfoById(Argument arg) {
		try {
			dao.delete(arg.getRowId());
			
			arg.success();
		} catch (Exception e) {
			arg.fail("删除ZK服务信息异常：" + arg.getRowId() + " " + e.getMessage());
			logger.error("删除ZK服务信息异常：" + arg.getRowId() + " " + e.getMessage(), e);
			throw new RuntimeException(e);
		}
		return arg;
	}

	public Argument getZkServerInfoById(Argument arg) {
		try {
			ZkServerInfo obj = dao.findOne(arg.getRowId());
			if(null != obj){
				arg.success().setObj(obj);
			}
		} catch (Exception e) {
			arg.fail("获取ZK服务信息异常：" + e.getMessage());
			logger.error("获取ZK服务信息异常：" + arg.getRowId() + " " + e.getMessage(), e);
		}
		return arg;
	}
	
	public Argument getZkServerInfoByIpAndPort(Argument arg) {
		String ip = arg.getStringForReq("ip");
		int port = arg.getIntForReq("port");
		try {
			ZkServerInfo obj = dao.findOneByIpAndPort(ip, port);
			if(null != obj){
				arg.success().setObj(obj);
			}
		} catch (Exception e) {
			arg.fail("获取ZK服务信息异常：" + e.getMessage());
			logger.error("获取ZK服务信息异常：" + ip + ":" + port + " " + e.getMessage(), e);
		}
		return arg;
	}

	public boolean startAllServer() {
		try {
			List<ZkServerInfo> infos = dao.findAll();
			for (ZkServerInfo serverInfo : infos) {
				ZookeeperServer.bootServer(serverInfo.getConfigPath());
			}
		} catch (Exception e) {
			logger.error("启动All ZK服务异常：" + e.getMessage(), e);
		}
		return true;
	}
	
	public String run4cmd(Long rowId, String cmd) {
		StringBuffer result = new StringBuffer();
		ZkServerInfo zkServerInfo = dao.findOne(rowId);
		if (zkServerInfo != null) {
			try {
				CommandConstEnum cmdObj = CommandConstEnum.getInstance(cmd);
				if(null != cmdObj){
					String res = WordsCommand.run(zkServerInfo, cmdObj);
					result.append(res);
				} else {
					result.append("不支持的命令：" + cmd);
				}
			} catch (IOException e) {
				result.append(cmd + "-命令执行异常：" + e.getMessage());
			}
		} else {
			result.append("Zk服务节点不存在，无法执行命令");
		}
		return result.toString();
	}

}
