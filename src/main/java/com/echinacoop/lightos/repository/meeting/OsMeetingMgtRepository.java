package com.echinacoop.lightos.repository.meeting;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.meeting.OsMeetingMgt;

/**
 * 会议管理表
 * 此类为自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * @Time 2018-09-18 14:04:46
 * @Auto Generated
 */
public interface OsMeetingMgtRepository extends JpaRepository<OsMeetingMgt, Long> {
    
    // TODO 自行扩展
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsMeetingMgt findOneBy..(String attrName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsMeetingMgt> findBy..(String attrName);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsMeetingMgt entity where .... ",
    	countQuery = "select count(entity) from OsMeetingMgt"
    )
    Page<OsMeetingMgt> findBy.......(Pageable able);
    */
    
}
