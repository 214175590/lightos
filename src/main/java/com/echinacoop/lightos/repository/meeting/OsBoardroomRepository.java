package com.echinacoop.lightos.repository.meeting;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.meeting.OsBoardroom;

/**
 * 会议室表
 * 此类为自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * @Time 2018-09-18 13:59:53
 * @Auto Generated
 */
public interface OsBoardroomRepository extends JpaRepository<OsBoardroom, Long> {
    
    // TODO 自行扩展
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsBoardroom findOneBy..(String attrName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsBoardroom> findBy..(String attrName);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsBoardroom entity where .... ",
    	countQuery = "select count(entity) from OsBoardroom"
    )
    Page<OsBoardroom> findBy.......(Pageable able);
    */
    
}
