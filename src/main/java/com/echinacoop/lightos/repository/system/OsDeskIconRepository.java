package com.echinacoop.lightos.repository.system;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.echinacoop.lightos.domain.system.OsDeskIcon;

/**
 * 桌面图标表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-05-11 14:26
 * @GeneratedByCodeFactory
 */
public interface OsDeskIconRepository extends JpaRepository<OsDeskIcon, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsDeskIcon findByFeild1AndFeild2And....(String feild1, String feild2, ...);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
	@Query("SELECT DISTINCT a FROM OsDeskIcon a LEFT JOIN OsUserIconRight b ON a.rowId = b.deskIconId WHERE b.userId = :userId or a.belong = :account")
    List<OsDeskIcon> findAppByUserIdAndBelong(@Param("userId") Long userId, @Param("account") String account);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsDeskIcon entity where .... ",
    	countQuery = "select count(entity) from OsDeskIcon"
    )
    Page<OsDeskIcon> findBy.......(Pageable able);
    */
    
}