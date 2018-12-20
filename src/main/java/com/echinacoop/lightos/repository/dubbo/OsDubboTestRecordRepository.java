package com.echinacoop.lightos.repository.dubbo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.echinacoop.lightos.domain.dubbo.OsDubboTestRecord;

/**
 * Dubbo接口测试数据表
 * 此类为[代码工厂]自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * <其他请自行扩展>
 * @time 2018-05-22 16:39
 * @GeneratedByCodeFactory
 */
public interface OsDubboTestRecordRepository extends JpaRepository<OsDubboTestRecord, Long> {
    
    // TODO 自行扩展
    
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsDubboTestRecord findByFeild1AndFeild2And....(String feild1, String feild2, ...);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    List<OsDubboTestRecord> findByNameAndServerAndInterfaceNameAndMethodName(String name, String server, String interfaceName, String methodName, Sort sort);
    
    Page<OsDubboTestRecord> findByNameAndServerAndInterfaceNameAndMethodName(String name, String server, String interfaceName, String methodName, Pageable able);
    
}