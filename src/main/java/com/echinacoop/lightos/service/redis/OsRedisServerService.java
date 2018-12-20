package com.echinacoop.lightos.service.redis;

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

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.redis.OsRedisInfo;
import com.echinacoop.lightos.domain.redis.OsRedisServer;
import com.echinacoop.lightos.repository.redis.OsRedisServerRepository;

/**
 * Redis服务器信息
 * @Time 2018-09-20 17:09:21
 * @Auto Generated
 */
@Service
@Transactional
public class OsRedisServerService {
    private final static Logger logger = LoggerFactory.getLogger(OsRedisServerService.class);
    
    @Autowired
    private OsRedisServerRepository repository;

    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	OsRedisServer entity = repository.findOne(arg.getRowId());
            if(null != entity){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsRedisServer> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
            Page<OsRedisServer> infos = repository.findAll(pageRequest);
            List<OsRedisInfo> list = new ArrayList<OsRedisInfo>();
            if(infos != null){
            	OsRedisInfo redis = null;
            	JSONObject serverInfo = null;
				for (OsRedisServer info : infos) {
					//RedisService
					redis = new OsRedisInfo();
					redis.setRowId(info.getRowId());
					redis.setIp(info.getIp());
					redis.setPort(info.getPort());
					redis.setPassword(info.getPassword());
					redis.setRemark(info.getRemark());
					try {
						RedisService rs = RedisService.getInstance(info.getIp(), info.getPort(), info.getPassword());
						if (null != rs) {
							serverInfo = rs.getRedisInfo(false);
							if (null != serverInfo) {
								redis.setVersion(serverInfo.getString("redis_version"));
								redis.setConnections(serverInfo.getIntValue("connected_clients"));
								redis.setNodeCount(rs.getDataSize(false));
							}
							rs.close();
						}
					} catch (Exception e) {
						logger.debug("获取Redis[{}{}]信息时异常：" + e.getMessage(), info.getIp(), info.getPort());
					}
					list.add(redis);
				}
				PageImpl<OsRedisInfo> pageImpl = new PageImpl<OsRedisInfo>(list, arg.getPageable(), infos.getTotalElements());
                arg.success().setPage(pageImpl);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsRedisServer entity = (OsRedisServer) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsRedisServer数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsRedisServer entity = (OsRedisServer) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsRedisServer数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsRedisServer数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsRedisServer> entityList = (List<OsRedisServer>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsRedisServer数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsRedisServer> entityList = (List<OsRedisServer>) arg.getObj();
            repository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsRedisServer数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsRedisServer数据失败");
        }
        return arg;
    }

}