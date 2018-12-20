package com.echinacoop.lightos.service.monitor;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;
import com.echinacoop.lightos.repository.monitor.OsServiceMonitorRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 服务监控信息
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsServiceMonitorService {
	private final static Logger logger = LoggerFactory.getLogger(OsServiceMonitorService.class);
	
	@Autowired
	private OsServiceMonitorRepository repository;
	
	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsServiceMonitor obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
	@Transactional(readOnly = true)
    public Argument findAll() {
		Argument arg = new Argument();
        try {
            List<OsServiceMonitor> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
			Page<OsServiceMonitor> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setToRtn("page", page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsServiceMonitor entity = (OsServiceMonitor) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsServiceMonitor数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsServiceMonitor entity = (OsServiceMonitor) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsServiceMonitor数据失败");
        }
        return arg;
    }
    
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsServiceMonitor数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsServiceMonitor数据失败");
        }
        return arg;
    }

}