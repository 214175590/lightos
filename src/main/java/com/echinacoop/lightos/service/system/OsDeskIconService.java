package com.echinacoop.lightos.service.system;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.common.consts.StatusTypeConstants;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.system.OsDeskIcon;
import com.echinacoop.lightos.domain.system.OsDeskIconRight;
import com.echinacoop.lightos.domain.system.OsUserIconRight;
import com.echinacoop.lightos.repository.system.OsDeskIconRepository;
import com.echinacoop.lightos.repository.system.OsDeskIconRightRepository;
import com.echinacoop.lightos.repository.system.OsUserIconRightRepository;
import com.yinsin.utils.CommonUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 桌面图标表
 * @Time 2018-05-11 14:26
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDeskIconService {
	private final static Logger logger = LoggerFactory.getLogger(OsDeskIconService.class);
	
	@Autowired
	private OsDeskIconRepository repository;
	
	@Autowired
	private OsDeskIconRightRepository rightRepository;
	
	@Autowired
	private OsUserIconRightRepository userRightRepository;
	
	@PersistenceContext
	private EntityManager em;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDeskIcon obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	Long rowId = arg.getRowId();
            OsDeskIcon obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
		try {
            List<OsDeskIcon> dataList = repository.findAll();
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
    		String account = arg.getStringForReq("account");
        	Pageable pageRequest = arg.getPageable();
            OsDeskIcon entity = (OsDeskIcon) arg.getObj();
            StringBuilder sqlList = new StringBuilder("select e from OsDeskIcon e where 1 = 1 ");
            StringBuilder sqlCount = new StringBuilder("select count(e) from OsDeskIcon e where 1 = 1 ");
            
            if(!StringConstant.ADMIN_ACCOUNT.equals(account)){
            	sqlList.append(" and e.belong = ?1 ");
            	sqlCount.append(" and e.belong = ?1 ");
            }
            
            if(CommonUtils.isNotBlank(entity.getName())){
            	sqlList.append(" and e.name like ?2 ");
            	sqlCount.append(" and e.name like ?2 ");
            }
            
            if(CommonUtils.isNotBlank(entity.getTitle())){
            	sqlList.append(" and e.title like ?3 ");
            	sqlCount.append(" and e.title like ?3 ");
            }
            
            if(CommonUtils.isNotBlank(entity.getTypes())){
            	sqlList.append(" and e.types = ?4 ");
            	sqlCount.append(" and e.types = ?4 ");
            }
            
            Query queryList = em.createQuery(sqlList.toString());
            queryList.setFirstResult(pageRequest.getPageSize() * pageRequest.getPageNumber());
            queryList.setMaxResults(pageRequest.getPageSize());
            
            Query queryCount = em.createQuery(sqlCount.toString());
            
            if(!StringConstant.ADMIN_ACCOUNT.equals(account)){
            	queryList.setParameter(1, account);
            	queryCount.setParameter(1, account);
            }
            
            if(CommonUtils.isNotBlank(entity.getName())){
            	queryList.setParameter(2, "%" + entity.getName() + "%");
            	queryCount.setParameter(2, "%" + entity.getName() + "%");
            }

            if(CommonUtils.isNotBlank(entity.getTitle())){
            	queryList.setParameter(3, "%" + entity.getTitle() + "%");
            	queryCount.setParameter(3, "%" + entity.getTitle() + "%");
            }
            
            if(CommonUtils.isNotBlank(entity.getTypes())){
            	queryList.setParameter(4, entity.getTypes());
            	queryCount.setParameter(4, entity.getTypes());
            }
            
            List<OsDeskIcon> list = queryList.getResultList();
            if(list != null){
            	Long total = CommonUtils.objectToLong(queryCount.getSingleResult());
            	PageImpl<OsDeskIcon> pageImpl = new PageImpl<OsDeskIcon>(list, pageRequest, total);
            	arg.success().setPage(pageImpl);
            } else {
            	arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument loadUserApps(Argument arg){
    	Long userId = arg.getRowId();
    	String account = arg.getStringForReq("account");
    	if(StringConstant.ADMIN_ACCOUNT.equals(account)){
    		List<OsDeskIcon> list = repository.findAll();
    		if(list != null){
    			arg.success().setDataToRtn(list);
    		} else {
            	arg.fail();
            }
    	} else {
    		List<OsDeskIcon> list = repository.findAppByUserIdAndBelong(userId, account);
    		if(list != null){
    			arg.success().setDataToRtn(list);
    		} else {
            	arg.fail();
            }
    	}    	
    	return arg;
    }
    
    public Argument save(Argument arg) {
        try {
        	Long userId = arg.getRowId();
            OsDeskIcon entity = (OsDeskIcon) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
            	OsDeskIconRight right = new OsDeskIconRight();
            	right.setDeskIconId(entity.getRowId());
            	right.setName("查看");
            	right.setCode(StatusTypeConstants.RIGHT_TYPE_QUERY);
            	right = rightRepository.save(right);
            	if(null == right){
            		arg.fail("新增数据失败");
                    throw new RuntimeException("新增OsDeskIcon数据失败");
            	} else {
            		OsUserIconRight userRight = new OsUserIconRight();
            		userRight.setDeskIconId(entity.getRowId());
            		userRight.setUserId(userId);
            		userRight.setRightCode(StatusTypeConstants.RIGHT_TYPE_QUERY);
            		userRight = userRightRepository.save(userRight);
            		if(null != userRight){
            			arg.success().setObj(entity);
            		} else {
                		arg.fail("新增数据失败");
                        throw new RuntimeException("新增OsDeskIcon数据失败");
                	}
            	} 
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsDeskIcon数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsDeskIcon entity = (OsDeskIcon) arg.getObj();
            OsDeskIcon old = repository.findOne(entity.getRowId());
            if(null != old){
            	entity.setCreateTime(old.getCreateTime());
            	entity.setBelong(old.getBelong());
            	entity.setHosts(old.getHosts());
            	entity.setLevels(old.getLevels());
            	entity.setIsshow(old.getIsshow());
            	entity.setStatus(old.getStatus());
            	entity = repository.saveAndFlush(entity);
                if(entity != null){
                    arg.success().setObj(entity);
                } else {
                    arg.fail();
                }
            } else {
                arg.fail("数据错误");
                logger.error("修改应用信息失败，缺少主键ID，或者此ID数据不存在：" + entity.getRowId());
            }
        } catch(Exception e){
            logger.error("修改OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsDeskIcon数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            rightRepository.deleteByDeskIconId(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDeskIcon数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDeskIcon数据失败");
        }
        return arg;
    }

}