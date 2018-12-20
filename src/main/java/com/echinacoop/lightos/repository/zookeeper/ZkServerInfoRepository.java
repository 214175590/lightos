package com.echinacoop.lightos.repository.zookeeper;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.echinacoop.lightos.domain.zookeeper.ZkServerInfo;

@Repository
public interface ZkServerInfoRepository extends JpaRepository<ZkServerInfo, Long> {
	
	ZkServerInfo findOneByIpAndPort(String ip, int port);
	
}
