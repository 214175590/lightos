package com.echinacoop.lightos.service.system;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.system.OsDeskIconRight;
import com.echinacoop.lightos.repository.system.OsDeskIconRightRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 图标权限表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDeskIconRightService {
	private final static Logger logger = LoggerFactory.getLogger(OsDeskIconRightService.class);
	
	@Autowired
	private OsDeskIconRightRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDeskIconRight obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findByDeskIconId(Argument arg) {
        try {
            List<OsDeskIconRight> dataList = repository.findByDeskIconId(arg.getRowId());
            if(null != dataList){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsDeskIconRight> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
			Page<OsDeskIconRight> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setPage(page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsDeskIconRight entity = (OsDeskIconRight) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsDeskIconRight数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsDeskIconRight entity = (OsDeskIconRight) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsDeskIconRight数据失败");
        }
        return arg;
    }
    
    public Argument saveAndFlush(Argument arg) {
        try {
            OsDeskIconRight entity = (OsDeskIconRight) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsDeskIconRight数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDeskIconRight数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsDeskIconRight> entityList = (List<OsDeskIconRight>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsDeskIconRight数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsDeskIconRight> entityList = (List<OsDeskIconRight>) arg.getObj();
            repository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsDeskIconRight数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsDeskIconRight数据失败");
        }
        return arg;
    }

}