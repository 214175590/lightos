package com.echinacoop.lightos.service.docker;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.docker.DockerNodeInfo;
import com.echinacoop.lightos.domain.docker.OsDockerInfo;
import com.echinacoop.lightos.domain.zookeeper.ZkServerInfo;
import com.echinacoop.lightos.domain.zookeeper.ZookeeperInfo;
import com.echinacoop.lightos.repository.docker.OsDockerInfoRepository;
import com.echinacoop.lightos.web.ssh.ShellInstance;
import com.echinacoop.lightos.web.ssh.ShellManager;
import com.echinacoop.lightos.web.ssh.SshUtils;
import com.yinsin.utils.CommonUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc Docker节点服务器信息
 * @Time 2018-06-08 17:28
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDockerInfoService {
	private final static Logger logger = LoggerFactory.getLogger(OsDockerInfoService.class);
	
	@Autowired
	private OsDockerInfoRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDockerInfo obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	String ip = arg.getStringForReq("ip");
        	int port = arg.getIntForReq("port");
            OsDockerInfo obj = repository.findByIpAndPort(ip, port);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsDockerInfo> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
			Page<OsDockerInfo> infos = repository.findAll(pageRequest);
            if(infos != null){
				arg.success().setPage(infos);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsDockerInfo entity = (OsDockerInfo) arg.getObj();
            OsDockerInfo obj = entity;
            if(entity.getRowId() != null && entity.getRowId() > 0){
            	obj = repository.getOne(entity.getRowId());
            	if(obj != null){
                	if(CommonUtils.isNotBlank(entity.getIp())){
                		obj.setIp(entity.getIp());
                	}
                	if(entity.getPort() != null && entity.getPort() != 0){
                		obj.setPort(entity.getPort());
                	}
                	if(CommonUtils.isNotBlank(entity.getUsername())){
                		obj.setUsername(entity.getUsername());
                	}
                	if(CommonUtils.isNotBlank(entity.getPassword())){
                		obj.setPassword(entity.getPassword());
                	}
                	if(CommonUtils.isNotBlank(entity.getRemark())){
                		obj.setRemark(entity.getRemark());
                	}
                } else {
                	obj = entity;
                }
            }
            entity = repository.saveAndFlush(obj);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("保存OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("保存数据失败");
            throw new RuntimeException("保存OsDockerInfo数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDockerInfo数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsDockerInfo> entityList = (List<OsDockerInfo>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsDockerInfo数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsDockerInfo> entityList = (List<OsDockerInfo>) arg.getObj();
            repository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsDockerInfo数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsDockerInfo数据失败");
        }
        return arg;
    }

}