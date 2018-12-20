package com.echinacoop.lightos.zookeeper;

import java.io.IOException;

import org.apache.zookeeper.client.FourLetterWordMain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.zookeeper.CommandConstEnum;
import com.echinacoop.lightos.domain.zookeeper.ResultRuok;
import com.echinacoop.lightos.domain.zookeeper.ResultStat;
import com.echinacoop.lightos.domain.zookeeper.ZkServerInfo;
import com.yinsin.utils.CommonUtils;

/**
 * 四字命令处理
 */
public class WordsCommand {
	private static final Logger logger = LoggerFactory.getLogger(WordsCommand.class);

	private static String[] getResultArray(ZkServerInfo serverInfo, CommandConstEnum commandConstEnum) {
		String[] resultArray = null;
		try {
			String cmdResult = FourLetterWordMain.send4LetterWord(serverInfo.getIp(), serverInfo.getPort(), commandConstEnum.getVal());
			if (CommonUtils.isNotBlank(cmdResult)) {
				resultArray = cmdResult.split("\n");
			}
		} catch (IOException e) {
			logger.error("执行ZK4字命令异常：" + serverInfo.getIp() + ":" + serverInfo.getPort() + " ->" + commandConstEnum.getVal(), e);
		}
		return resultArray;
	}

	/**
	 * 四字命令stat
	 * 
	 * @param serverInfo
	 * @return
	 */
	public static ResultStat stat(ZkServerInfo serverInfo) {
		String[] resultArray = getResultArray(serverInfo, CommandConstEnum.STAT);
		if (resultArray != null) {
			ResultStat resultStat = new ResultStat();
			for (String rs : resultArray) {
				if (rs.indexOf("Zookeeper version:") != -1) {
					resultStat.setZookeeperVersion(rs.replace("Zookeeper version:", "").trim());
				} else if (rs.indexOf("Mode:") != -1) {
					resultStat.setMode(CommonUtils.deleteWhitespace(rs.replace("Mode:", "")));
				} else if (rs.indexOf("Connections:") != -1) {
					resultStat.setConnections(CommonUtils.stringToInt(rs.replace("Connections: ", "")));
				} else if (rs.indexOf("Node count:") != -1) {
					resultStat.setNodeCount(CommonUtils.stringToInt(rs.replace("Node count: ", "")));
				}
			}
			return resultStat;
		}
		return null;
	}

	/**
	 * 四字命令ruok
	 * 
	 * @param serverInfo
	 * @return
	 */
	public static ResultRuok ruok(ZkServerInfo serverInfo) {
		String[] resultArray = getResultArray(serverInfo, CommandConstEnum.RUOK);
		if (resultArray != null) {
			ResultRuok resultRuok = new ResultRuok();
			for (String rs : resultArray) {
				if (rs.indexOf("imok") != -1) {
					resultRuok.setImok(rs.trim());
				}
			}
			return resultRuok;
		}
		return null;
	}

	/**
	 * 四字命令conf
	 * 
	 * @param serverInfo
	 * @throws IOException
	 */
	public static String conf(ZkServerInfo serverInfo) throws IOException {
		String cmdResult = FourLetterWordMain.send4LetterWord(serverInfo.getIp(), serverInfo.getPort(), CommandConstEnum.CONF.getVal());
		return cmdResult;
	}
	
	/**
	 * 四字命令
	 * 
	 * @param serverInfo
	 * @return 
	 * @throws IOException
	 */
	public static String run(ZkServerInfo serverInfo, CommandConstEnum cmd) throws IOException {
		return FourLetterWordMain.send4LetterWord(serverInfo.getIp(), serverInfo.getPort(), cmd.getVal());
	}

}
