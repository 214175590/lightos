package com.echinacoop.lightos.repository.svn;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.svn.OsSvnUser;

/**
 * 用户svn信息表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-06-01 15:05
 * @GeneratedByCodeFactory
 */
public interface OsSvnUserRepository extends JpaRepository<OsSvnUser, Long> {
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    OsSvnUser findByUserId(Long userId);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    //List<OsSvnUser> findByFeild2AndFeild3And....(String feild2, String feild3, ...);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsSvnUser entity where .... ",
    	countQuery = "select count(entity) from OsSvnUser"
    )
    Page<OsSvnUser> findBy.......(Pageable able);
    */
    
}