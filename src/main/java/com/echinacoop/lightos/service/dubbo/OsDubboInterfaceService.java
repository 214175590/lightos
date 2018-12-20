package com.echinacoop.lightos.service.dubbo;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.dubbo.OsDubboInterface;
import com.echinacoop.lightos.repository.dubbo.OsDubboInterfaceRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc Dubbo接口信息表
 * @Time 2018-08-20 15:01
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDubboInterfaceService {
	private final static Logger logger = LoggerFactory.getLogger(OsDubboInterfaceService.class);
	
	@Autowired
	private OsDubboInterfaceRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDubboInterface obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboInterface数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	OsDubboInterface entity = (OsDubboInterface) arg.getObj();
            OsDubboInterface obj = repository.findByInterfaceNameAndMethodName(entity.getInterfaceName(), entity.getMethodName());
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboInterface数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsDubboInterface> dataList = repository.findByName(arg.getStringForReq("name"));
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboInterface数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    
    public Argument save(Argument arg) {
        try {
            OsDubboInterface entity = (OsDubboInterface) arg.getObj();
            if(entity.getRowId() != null && entity.getRowId() != 0){
            	OsDubboInterface obj = repository.getOne(entity.getRowId());
            	obj.setRemark(obj.getRemark());
            	obj.setInParam(entity.getInParam());
            	obj.setOutParam(entity.getOutParam());
            	obj.setUpdateTime(entity.getUpdateTime());
            	entity = repository.save(obj);
            } else {
            	entity = repository.save(entity);
            }
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsDubboInterface数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsDubboInterface数据失败");
        }
        return arg;
    }
    
    
    public Argument delete(Argument arg) {
        try {
        	Long rowId = arg.getRowId();
            repository.delete(rowId);
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDubboInterface数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDubboInterface数据失败");
        }
        return arg;
    }

}