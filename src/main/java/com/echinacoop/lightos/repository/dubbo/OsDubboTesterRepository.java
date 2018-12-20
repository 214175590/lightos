package com.echinacoop.lightos.repository.dubbo;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.dubbo.OsDubboTester;

/**
 * Dubbo接口测试数据表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
public interface OsDubboTesterRepository extends JpaRepository<OsDubboTester, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    OsDubboTester findOneByServerAndInterfaceNameAndMethodName(String server, String interfaceName, String methodName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    List<OsDubboTester> findByServer(String server);
    
    List<OsDubboTester> findByNameAndServer(String name, String server);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsDubboTester entity where .... ",
    	countQuery = "select count(entity) from OsDubboTester"
    )
    Page<OsDubboTester> findBy.......(Pageable able);
    */
    
}