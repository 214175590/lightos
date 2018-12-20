package com.echinacoop.lightos.service.monitor;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsZentaoTask;
import com.echinacoop.lightos.repository.monitor.OsZentaoTaskRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 禅道任务
 * @Time 2018-09-05 11:43
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsZentaoTaskService {
	private final static Logger logger = LoggerFactory.getLogger(OsZentaoTaskService.class);
	
	@Autowired
	private OsZentaoTaskRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsZentaoTask obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	String proId = arg.getStringForReq("proId");
            OsZentaoTask obj = repository.findOneByProId(proId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
        	Integer status = arg.getIntForReq("status");
        	Sort sort = new Sort(Direction.DESC, "status");
        	List<OsZentaoTask> dataList = null;
        	if(null == status || 0 == status){
        		dataList = repository.findAll(sort);
        	} else {
        		dataList = repository.findByStatus(status, sort);
        	}
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
			Page<OsZentaoTask> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setToRtn("page", page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsZentaoTask entity = (OsZentaoTask) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsZentaoTask数据失败");
        }
        return arg;
    }
    
    public Argument saveAndFlush(Argument arg) {
        try {
        	String id = arg.getStringForReq("id");
        	List<OsZentaoTask> moduleList = OsZentaoService.getModules(id);
        	if(null != moduleList && moduleList.size() > 0){
        		List<String> ids = new ArrayList<String>();
        		for(OsZentaoTask m : moduleList){
        			ids.add(m.getProId());
        		}
        		List<OsZentaoTask> datas = repository.findInProId(ids);
        		List<OsZentaoTask> adds = new ArrayList<OsZentaoTask>();
    			boolean haved = false;
    			for(OsZentaoTask m2 : moduleList){
    				haved = false;
    				for(OsZentaoTask m1 : datas){
        				if(m1.getProId().equals(m2.getProId())){
        					haved = true;
        					break;
        				}
            		}
        			if(!haved){
        				adds.add(m2);
        			}
        		}
    			
    			adds = repository.save(adds);
    			if(null != adds){
	                arg.success().setDataToRtn(repository.findAll());
	            } else {
	                arg.fail();
	            }
        	}
        } catch(Exception e){
            logger.error("修改OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsZentaoTask数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsZentaoTask数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsZentaoTask数据失败");
        }
        return arg;
    }

}