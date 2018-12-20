package com.echinacoop.lightos.service.svn;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.svn.OsSvnProject;
import com.echinacoop.lightos.repository.svn.OsSvnProjectRepository;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 项目svn信息表
 * @Time 2018-06-01 15:05
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsSvnProjectService {
	private final static Logger logger = LoggerFactory.getLogger(OsSvnProjectService.class);
	
	@Autowired
	private OsSvnProjectRepository repository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsSvnProject obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsSvnProject数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
	
	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsSvnProject> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsSvnProject数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
	@Transactional(readOnly = true)
    public Argument findByName(Argument arg) {
        try {
            String projectName = arg.getStringForReq("projectName");
            List<OsSvnProject> dataList = repository.findByprojectName(projectName);
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsSvnProject数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsSvnProject entity = (OsSvnProject) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsSvnProject数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsSvnProject数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsSvnProject数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsSvnProject数据失败");
        }
        return arg;
    }

}