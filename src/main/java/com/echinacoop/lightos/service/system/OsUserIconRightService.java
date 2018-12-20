package com.echinacoop.lightos.service.system;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.system.OsDeskIcon;
import com.echinacoop.lightos.domain.system.OsUserIconRight;
import com.echinacoop.lightos.repository.system.OsUserIconRightRepository;
import com.yinsin.utils.CommonUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 用户与图标及权限关系表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsUserIconRightService {
	private final static Logger logger = LoggerFactory.getLogger(OsUserIconRightService.class);
	
	@Autowired
	private OsUserIconRightRepository repository;
	
	@PersistenceContext
	private EntityManager em;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsUserIconRight obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findByUserId(Argument arg) {
        try {
        	OsUserIconRight entity = (OsUserIconRight) arg.getObj();
        	List<OsUserIconRight> dataList = repository.findByUserId(entity.getUserId());
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument getUserAllocatedDeskIcon(Argument arg) {
        try {
            OsUserIconRight entity = (OsUserIconRight) arg.getObj();
            List<OsUserIconRight> dataList = repository.selectUserAllocatedDeskIcon(entity.getUserId());
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
			List<OsUserIconRight> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findByUserIdAndDeskIconId(Argument arg) {
        try {
        	OsUserIconRight entity = (OsUserIconRight) arg.getObj();
        	List<OsUserIconRight> dataList = repository.findByUserIdAndDeskIconId(entity.getUserId(), entity.getDeskIconId());
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument getRights(Argument arg) {
        try {
        	OsUserIconRight entity = (OsUserIconRight) arg.getObj();
        	StringBuilder sqlList = new StringBuilder("select e from OsUserIconRight e where 1 = 1 ");
            
            if(null != entity.getUserId() && entity.getUserId() > 0){
            	sqlList.append(" and e.userId = ?0 ");
            }
            
            if(null != entity.getDeskIconId() && entity.getDeskIconId() > 0){
            	sqlList.append(" and e.deskIconId = ?1 ");
            }
            
            if(CommonUtils.isNotBlank(entity.getRightCode())){
            	sqlList.append(" and e.rightCode = ?2 ");
            }
            
            Query queryList = em.createQuery(sqlList.toString());
            
            if(null != entity.getUserId() && entity.getUserId() > 0){
            	queryList.setParameter(0, entity.getUserId());
            }
            
            if(null != entity.getDeskIconId() && entity.getDeskIconId() > 0){
            	queryList.setParameter(1, entity.getDeskIconId());
            }
            
            if(CommonUtils.isNotBlank(entity.getRightCode())){
            	queryList.setParameter(2, entity.getRightCode());
            }            

            List<OsDeskIcon> list = queryList.getResultList();
            if(list != null){
            	arg.success().setDataToRtn(list);
            } else {
            	arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            List<OsUserIconRight> adds = (List<OsUserIconRight>) arg.getReq("adds");
            List<OsUserIconRight> dels = (List<OsUserIconRight>) arg.getReq("dels");
            if(null != adds && adds.size() > 0){
            	adds = repository.save(adds);
            	if(adds != null){
            		if(null != dels && dels.size() > 0){
            			repository.deleteInBatch(dels);
            		}
                    arg.success().setDataToRtn(adds);
                } else {
                    arg.fail();
                }
            } else if(null != dels && dels.size() > 0){
            	repository.deleteInBatch(dels);
                arg.success();
            }
        } catch(Exception e){
            logger.error("保存OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("保存数据失败");
            throw new RuntimeException("保存OsUserIconRight数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            OsUserIconRight entity = (OsUserIconRight) arg.getObj();
            repository.delete(entity.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsUserIconRight数据失败");
        }
        return arg;
    }
    
    public Argument deleteByUserId(Argument arg) {
    	try {
    		OsUserIconRight entity = (OsUserIconRight) arg.getObj();
    		repository.deleteByUserId(entity.getUserId());
    		arg.success();
    	} catch(Exception e){
    		logger.error("删除OsUserIconRight数据失败：" + e.getMessage(), e);
    		arg.fail("删除数据失败");
    		throw new RuntimeException("删除OsUserIconRight数据失败");
    	}
    	return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsUserIconRight> entityList = (List<OsUserIconRight>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsUserIconRight数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsUserIconRight> entityList = (List<OsUserIconRight>) arg.getObj();
            repository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsUserIconRight数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsUserIconRight数据失败");
        }
        return arg;
    }

}