package com.echinacoop.lightos.repository.system;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.echinacoop.lightos.domain.system.OsUserIconRight;

/**
 * 用户与图标及权限关系表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
public interface OsUserIconRightRepository extends JpaRepository<OsUserIconRight, Long> {
    
    // TODO 自行扩展
    
    List<OsUserIconRight> findByUserId(Long userId);
    
    List<OsUserIconRight> findByUserIdAndDeskIconId(Long userId, Long deskIconId);
    
    // Allocated 分配的
    @Query(value="select entity from OsUserIconRight entity where userId = :userId")
    List<OsUserIconRight> selectUserAllocatedDeskIcon(@Param(value="userId") Long userId);
    
    int deleteByUserId(Long userId);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsUserIconRight entity where .... ",
    	countQuery = "select count(entity) from OsUserIconRight"
    )
    Page<OsUserIconRight> findBy.......(Pageable able);
    */
    
}