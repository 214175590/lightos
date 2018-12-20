package com.echinacoop.lightos.service.dubbo;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.dubbo.OsDubboTestCase;
import com.echinacoop.lightos.domain.dubbo.OsDubboTestRecord;
import com.echinacoop.lightos.repository.dubbo.OsDubboTestCaseRepository;
import com.echinacoop.lightos.repository.dubbo.OsDubboTestRecordRepository;
import com.yinsin.utils.CommonUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc Dubbo接口测试用例表
 * @Time 2018-05-28 10:13
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDubboTestCaseService {
	private final static Logger logger = LoggerFactory.getLogger(OsDubboTestCaseService.class);
	
	@Autowired
	private OsDubboTestCaseRepository repository;
	
	@Autowired
	private OsDubboTestRecordRepository recordRepository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDubboTestCase obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	OsDubboTestCase entity = (OsDubboTestCase) arg.getObj();
            OsDubboTestCase obj = repository.findOneByCaseNameAndNameAndServerAndInterfaceNameAndMethodName(entity.getCaseName(), 
            		entity.getName(), entity.getServer(), entity.getInterfaceName(), entity.getMethodName());
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAllCase(Argument arg) {
        try {
        	String name = arg.getStringForReq("name");
        	String server = arg.getStringForReq("server");
        	String interfaceName = arg.getStringForReq("interfaceName");
            String method = arg.getStringForReq("method");
            List<OsDubboTestCase> dataList = repository.findByNameAndServerAndInterfaceNameAndMethodName(name, server, interfaceName, method);
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
			Page<OsDubboTestCase> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setToRtn("page", page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsDubboTestCase entity = (OsDubboTestCase) arg.getObj();
            OsDubboTestCase obj = null;
            if(entity.getRowId() != null && entity.getRowId() > 0){
            	obj = repository.getOne(entity.getRowId());
            } else {
            	obj = repository.findOneByCaseNameAndNameAndServerAndInterfaceNameAndMethodName(entity.getCaseName(), 
            			entity.getName(), entity.getServer(), entity.getInterfaceName(), entity.getMethodName());
            }
            if(obj == null){
            	entity = repository.saveAndFlush(entity);
            } else {
            	if(CommonUtils.isNotBlank(entity.getCaseName())){
            		obj.setCaseName(entity.getCaseName());
            	}
            	if(CommonUtils.isNotBlank(entity.getParam())){
            		obj.setParam(entity.getParam());
            	}
            	if(CommonUtils.isNotBlank(entity.getResult())){
            		obj.setResult(entity.getResult());
            	}
            	entity = repository.saveAndFlush(obj);
            }
            if(entity != null && obj != null){
            	try {
					if (CommonUtils.isNotBlank(obj.getParam()) && CommonUtils.isNotBlank(obj.getResult())) {
						OsDubboTestRecord record = new OsDubboTestRecord();
						record.setName(entity.getName());
						record.setServer(obj.getServer());
						record.setInterfaceName(obj.getInterfaceName());
						record.setMethodName(obj.getMethodName());
						record.setParam(arg.getStringForReq("param"));
						record.setResult(obj.getResult());
						record.setTestTime(obj.getTestTime());
						recordRepository.saveAndFlush(record);
					}
				} catch (Exception e) {
					logger.error("保存测试记录异常：" + e.getMessage(), e);
				}
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsDubboTestCase数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsDubboTestCase> list = (List<OsDubboTestCase>) arg.getObj();
            list = repository.save(list);
            if(null != list && list.size() > 0){
            	arg.success();
            }
        } catch(Exception e){
            logger.error("批量保存OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("批量保存数据失败");
            throw new RuntimeException("批量保存OsDubboTestCase数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDubboTestCase数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDubboTestCase数据失败");
        }
        return arg;
    }

}