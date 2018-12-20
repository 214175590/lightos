package com.echinacoop.lightos.repository.monitor;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.echinacoop.lightos.domain.monitor.OsZentaoTask;

/**
 * 禅道任务
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-09-05 11:43
 * @GeneratedByCodeFactory
 */
public interface OsZentaoTaskRepository extends JpaRepository<OsZentaoTask, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    OsZentaoTask findOneByProId(String proId);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    @Query("select distinct entity from OsZentaoTask entity where proId in (:ids) ")
    List<OsZentaoTask> findInProId(@Param(value="ids") List<String> ids);
    
    List<OsZentaoTask> findByStatus(Integer status, Sort sort);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsZentaoTask entity where .... ",
    	countQuery = "select count(entity) from OsZentaoTask"
    )
    Page<OsZentaoTask> findBy.......(Pageable able);
    */
    
}