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
import com.echinacoop.lightos.domain.meeting.OsBoardroom;
import com.echinacoop.lightos.repository.meeting.OsBoardroomRepository;

/**
 * 会议室表
 * @Time 2018-09-18 13:59:53
 * @Auto Generated
 */
@Service
@Transactional
public class OsBoardroomService {
    private final static Logger logger = LoggerFactory.getLogger(OsBoardroomService.class);
    
    @Autowired
    private OsBoardroomRepository repository;

    @Transactional(readOnly = true)
    public Argument getOne(Argument arg) {
        try {
        	OsBoardroom room = repository.findOne(arg.getRowId());
            if(null != room){
                arg.success().setObj(room);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }

    @Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
        try {
            List<OsBoardroom> dataList = repository.findAll();
            if(dataList != null){
                arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
            Pageable pageRequest = arg.getPageable(); 
            Page<OsBoardroom> page = repository.findAll(pageRequest);
            if(page != null){
                arg.success().setPage(page);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsBoardroom entity = (OsBoardroom) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsBoardroom数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsBoardroom entity = (OsBoardroom) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
                arg.success().setObj(entity);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsBoardroom数据失败");
        }
        return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            arg.success();
        } catch(Exception e){
            logger.error("删除OsBoardroom数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsBoardroom数据失败");
        }
        return arg;
    }

}
