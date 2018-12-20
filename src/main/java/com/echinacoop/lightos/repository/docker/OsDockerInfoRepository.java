package com.echinacoop.lightos.repository.docker;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.docker.OsDockerInfo;

/**
 * Docker节点服务器信息
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-06-08 17:28
 * @GeneratedByCodeFactory
 */
public interface OsDockerInfoRepository extends JpaRepository<OsDockerInfo, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    OsDockerInfo findByIpAndPort(String ip, int port);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsDockerInfo> findByFeild2AndFeild3And....(String feild2, String feild3, ...);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsDockerInfo entity where .... ",
    	countQuery = "select count(entity) from OsDockerInfo"
    )
    Page<OsDockerInfo> findBy.......(Pageable able);
    */
    
}