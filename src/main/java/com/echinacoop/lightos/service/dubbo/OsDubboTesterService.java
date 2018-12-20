package com.echinacoop.lightos.service.dubbo;

import java.sql.Timestamp;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.dubbo.OsDubboTestRecord;
import com.echinacoop.lightos.domain.dubbo.OsDubboTester;
import com.echinacoop.lightos.repository.dubbo.OsDubboTestRecordRepository;
import com.echinacoop.lightos.repository.dubbo.OsDubboTesterRepository;
import com.yinsin.utils.CommonUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc Dubbo接口测试数据表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@Service
@Transactional
public class OsDubboTesterService {
	private final static Logger logger = LoggerFactory.getLogger(OsDubboTesterService.class);
	
	@Autowired
	private OsDubboTesterRepository repository;
	@Autowired
	private OsDubboTestRecordRepository recordRepository;

	@Transactional(readOnly = true)
	public Argument getOne(Argument arg) {
        try {
            Long rowId = arg.getRowId();
            OsDubboTester obj = repository.findOne(rowId);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
        	OsDubboTester entity = (OsDubboTester) arg.getObj();
            OsDubboTester obj = repository.findOneByServerAndInterfaceNameAndMethodName(entity.getServer(), entity.getInterfaceName(), entity.getMethodName());
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

	@Transactional(readOnly = true)
    public Argument findAllRecord(Argument arg) {
        try {
        	String name = arg.getStringForReq("name");
        	String server = arg.getStringForReq("server");
        	String interfaceName = arg.getStringForReq("interfaceName");
            String method = arg.getStringForReq("method");
            List<OsDubboTestRecord> dataList = recordRepository.findByNameAndServerAndInterfaceNameAndMethodName(name, server, interfaceName, method, new Sort(Sort.Direction.DESC, "testTime"));
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllRecordForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable();
            String name = arg.getStringForReq("name");
            String server = arg.getStringForReq("server");
            String interfaceName = arg.getStringForReq("interfaceName");
            String method = arg.getStringForReq("method");
			Page<OsDubboTestRecord> page = recordRepository.findByNameAndServerAndInterfaceNameAndMethodName(name, server, interfaceName, method, pageRequest);
            if(page != null){
                arg.success().setToRtn("page", page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findTesterAll(Argument arg) {
        try {
        	String server = arg.getStringForReq("server");
            List<OsDubboTester> dataList = repository.findByServer(server);
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findTesterByNameAndServer(Argument arg) {
        try {
        	String server = arg.getStringForReq("server");
        	String name = arg.getStringForReq("name");
            List<OsDubboTester> dataList = repository.findByNameAndServer(name, server);
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsDubboTester entity = (OsDubboTester) arg.getObj();
            OsDubboTester obj = repository.findOneByServerAndInterfaceNameAndMethodName(entity.getServer(), entity.getInterfaceName(), entity.getMethodName());
            if(null != obj){
            	if(CommonUtils.isNotBlank(entity.getParam())){
            		obj.setParam(entity.getParam());
            	}
            	if(CommonUtils.isNotBlank(entity.getResult())){
            		obj.setResult(entity.getResult());
            		obj.setTestTime(new Timestamp(System.currentTimeMillis()));
            	}
            } else {
            	obj = entity;
            }
            obj = repository.saveAndFlush(obj);
            if(obj != null){
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
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsDubboTester数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
        	recordRepository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsDubboTester数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsDubboTester> entityList = (List<OsDubboTester>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsDubboTester数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsDubboTestRecord> entityList = (List<OsDubboTestRecord>) arg.getObj();
            recordRepository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsDubboTester数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsDubboTester数据失败");
        }
        return arg;
    }

}