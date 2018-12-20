package com.echinacoop.lightos.repository.monitor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.echinacoop.lightos.domain.monitor.OsCloudClock;

/**
 * 云闹钟
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-08-30 09:40
 * @GeneratedByCodeFactory
 */
public interface OsCloudClockRepository extends JpaRepository<OsCloudClock, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsCloudClock findByFeild1AndFeild2And....(String feild1, String feild2, ...);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsCloudClock> findByFeild2AndFeild3And....(String feild2, String feild3, ...);
	
	@Query("select distinct entity from OsCloudClock entity where userId = :userId or scope = 'public' ")
    List<OsCloudClock> selectClocks(@Param(value="userId") Long userId);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    @Query(
    	value = "select distinct entity from OsCloudClock entity where userId = :userId or scope = 'public' order by date, time desc",
    	countQuery = "select count(entity) from OsCloudClock where userId = :userId or scope = 'public' "
    )
    Page<OsCloudClock> selectClocks(@Param(value="userId") Long userId, Pageable able);
    
}