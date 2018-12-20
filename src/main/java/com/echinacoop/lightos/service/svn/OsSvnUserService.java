package com.echinacoop.lightos.service.svn;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.svn.OsSvnUser;
import com.echinacoop.lightos.repository.svn.OsSvnUserRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 用户svn信息表
 * @Time 2018-06-01 15:05
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsSvnUserService {
	private final static Logger logger = LoggerFactory.getLogger(OsSvnUserService.class);
	
	@Autowired
	private OsSvnUserRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsSvnUser obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsSvnUser数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsSvnUser entity = (OsSvnUser) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsSvnUser数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsSvnUser数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsSvnUser数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsSvnUser数据失败");
        }
        return arg;
    }

}