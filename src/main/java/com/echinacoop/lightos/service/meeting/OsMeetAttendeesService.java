package com.echinacoop.lightos.service.meeting;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.meeting.OsMeetAttendees;
import com.echinacoop.lightos.repository.meeting.OsMeetAttendeesRepository;

/**
 * 会议出席者表
 * @Time 2018-09-18 14:05:01
 * @Auto Generated
 */
@Service
@Transactional
public class OsMeetAttendeesService {
    private final static Logger logger = LoggerFactory.getLogger(OsMeetAttendeesService.class);
    
    @Autowired
    private OsMeetAttendeesRepository repository;

    @Transactional(readOnly = true)
    public Argument getOne(Argument arg) {
        try {
        	OsMeetAttendees obj = repository.getOne(arg.getRowId());
            if(null != obj){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findOne(Argument arg) {
        try {
            OsMeetAttendees entity = (OsMeetAttendees) arg.getObj();
            // TODO 请自行修改
            OsMeetAttendees obj = entity; //repository.findOneBy...(entity);
            if(obj != null){
                arg.success().setObj(obj);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

    @Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsMeetAttendees> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
            Page<OsMeetAttendees> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setPage(page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsMeetAttendees entity = (OsMeetAttendees) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsMeetAttendees数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsMeetAttendees entity = (OsMeetAttendees) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsMeetAttendees数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsMeetAttendees数据失败");
        }
        return arg;
    }
    
    public Argument saveBatch(Argument arg) {
        try {
            List<OsMeetAttendees> entityList = (List<OsMeetAttendees>) arg.getObj();
            entityList = repository.save(entityList);
            if(entityList != null){
                arg.success().setDataToRtn(entityList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("批量插入OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("批量插入数据失败");
            throw new RuntimeException("批量插入OsMeetAttendees数据失败");
        }
        return arg;
    }
    
    public Argument deleteBatch(Argument arg) {
        try {
            List<OsMeetAttendees> entityList = (List<OsMeetAttendees>) arg.getObj();
            repository.deleteInBatch(entityList);
            arg.success();
        } catch(Exception e){
            logger.error("批量删除OsMeetAttendees数据失败：" + e.getMessage(), e);
            arg.fail("批量删除数据失败");
            throw new RuntimeException("批量删除OsMeetAttendees数据失败");
        }
        return arg;
    }

}
