package com.echinacoop.lightos.repository.dubbo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.dubbo.OsDubboInterface;

/**
 * Dubbo接口信息表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-08-20 15:01
 * @GeneratedByCodeFactory
 */
public interface OsDubboInterfaceRepository extends JpaRepository<OsDubboInterface, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    OsDubboInterface findByInterfaceNameAndMethodName(String interfaceName, String methodName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    List<OsDubboInterface> findByName(String name);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsDubboInterface entity where .... ",
    	countQuery = "select count(entity) from OsDubboInterface"
    )
    Page<OsDubboInterface> findBy.......(Pageable able);
    */
    
}