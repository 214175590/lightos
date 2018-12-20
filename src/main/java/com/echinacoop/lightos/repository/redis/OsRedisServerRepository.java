package com.echinacoop.lightos.repository.redis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.redis.OsRedisServer;

/**
 * Redis服务器信息
 * 此类为自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * @Time 2018-09-20 16:50:21
 * @Auto Generated
 */
public interface OsRedisServerRepository extends JpaRepository<OsRedisServer, Long> {
    
    // TODO 自行扩展
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsRedisServer findOneBy..(String attrName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsRedisServer> findBy..(String attrName);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsRedisServer entity where .... ",
    	countQuery = "select count(entity) from OsRedisServer"
    )
    Page<OsRedisServer> findBy.......(Pageable able);
    */
    
}
