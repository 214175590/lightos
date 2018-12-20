package com.echinacoop.lightos.repository.monitor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;

/**
 * 服务监控信息
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
public interface OsServiceMonitorRepository extends JpaRepository<OsServiceMonitor, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsServiceMonitor findByFeild1AndFeild2And....(String feild1, String feild2, ...);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsServiceMonitor> findByFeild2AndFeild3And....(String feild2, String feild3, ...);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsServiceMonitor entity where .... ",
    	countQuery = "select count(entity) from OsServiceMonitor"
    )
    Page<OsServiceMonitor> findBy.......(Pageable able);
    */
    
}