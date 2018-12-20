package com.echinacoop.lightos.repository.svn;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.svn.OsSvnProject;

/**
 * 项目svn信息表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-06-01 15:05
 * @GeneratedByCodeFactory
 */
public interface OsSvnProjectRepository extends JpaRepository<OsSvnProject, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsSvnProject findByFeild1AndFeild2And....(String feild1, String feild2, ...);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    List<OsSvnProject> findByprojectName(String projectName);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsSvnProject entity where .... ",
    	countQuery = "select count(entity) from OsSvnProject"
    )
    Page<OsSvnProject> findBy.......(Pageable able);
    */
    
}