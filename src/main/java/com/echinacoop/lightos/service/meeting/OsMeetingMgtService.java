package com.echinacoop.lightos.service.meeting;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import com.alibaba.fastjson.JSONArray;
import com.echinacoop.lightos.common.consts.StatusTypeConstants;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.meeting.OsBoardroom;
import com.echinacoop.lightos.domain.meeting.OsMeetAttendees;
import com.echinacoop.lightos.domain.meeting.OsMeetingMgt;
import com.echinacoop.lightos.repository.meeting.OsBoardroomRepository;
import com.echinacoop.lightos.repository.meeting.OsMeetAttendeesRepository;
import com.echinacoop.lightos.repository.meeting.OsMeetingMgtRepository;
import com.yinsin.utils.CommonUtils;

/**
 * 会议管理表
 * @Time 2018-09-18 14:04:46
 * @Auto Generated
 */
@SuppressWarnings("unchecked")
@Service
@Transactional
public class OsMeetingMgtService {
    private final static Logger logger = LoggerFactory.getLogger(OsMeetingMgtService.class);
    
    @Autowired
    private OsMeetingMgtRepository repository;
    
    @Autowired
    private OsMeetAttendeesRepository attendeesRepository;
    
    @Autowired
    private OsBoardroomRepository boardroomRepository;
    
    @PersistenceContext
	private EntityManager em;

    @Transactional(readOnly = true)
    public Argument getOne(Argument arg) {
        try {
        	Long rowId = arg.getRowId();
        	
        	StringBuffer sqlList = new StringBuffer();
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name,");
            sqlList.append(" mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification,");
            sqlList.append(" mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" where mm.row_id = ?0 ");
            Query queryList = em.createNativeQuery(sqlList.toString());
            queryList.setParameter(0, rowId);
            OsMeetingMgt meet = null;
            List<Object[]> list2 = queryList.getResultList();
            if(list2 != null){
            	Object[] arr = list2.get(0);
            	meet = new OsMeetingMgt();
            	objectArray2Entity(meet, arr);
            }
            if(null != meet){
            	List<Object[]> list = attendeesRepository.findUsersByMeetId(meet.getRowId());
            	if(null != list){
            		List<Map<String, Object>> attenList = new ArrayList<Map<String, Object>>();
            		Map<String, Object> map = null;
            		for (Object[] arr : list) {
            			map = new HashMap<String, Object>();
            			map.put("rowId", arr[0]);
            			map.put("meetId", arr[1]);
            			map.put("userId", arr[2]);
            			map.put("initiator", arr[3]);
            			map.put("status", arr[4]);
            			map.put("userName", arr[5]);
            			attenList.add(map);
					}
            		arg.setToRtn("member", attenList);
            	}
            	OsBoardroom boardroom = boardroomRepository.findOne(meet.getBoardroom());
            	if(null != boardroom){
            		arg.setToRtn("boardroom", boardroom);
            	}
                arg.success().setObj(meet);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
	@Transactional(readOnly = true)
    public Argument findAll(Argument arg) {
    	try {
            StringBuffer sqlList = new StringBuffer();
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name,");
            sqlList.append(" mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification,");
            sqlList.append(" mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" ORDER BY mm.meet_date DESC, mm.meet_start DESC, mm.meet_end DESC ");
            Query queryList = em.createNativeQuery(sqlList.toString());
            List<Object[]> list = queryList.getResultList();
            if(list != null){
            	List<OsMeetingMgt> dataList = new ArrayList<OsMeetingMgt>();
            	OsMeetingMgt obj = null;
            	for (Object[] arr : list) {
					obj = new OsMeetingMgt();
					objectArray2Entity(obj, arr);
					dataList.add(obj);
				}
            	arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
	@Transactional(readOnly = true)
    public Argument findAllForPager(Argument arg) {
        try {
        	OsMeetingMgt meet = (OsMeetingMgt) arg.getObj();
            Pageable pageRequest = arg.getPageable(); 
            StringBuilder sqlCount = new StringBuilder();
            StringBuffer sqlList = new StringBuffer();
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name,");
            sqlList.append(" mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification,");
            sqlList.append(" mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" where 1 = 1 ");
            
            sqlCount.append("select count(mm.row_id) FROM os_meeting_mgt mm ");
            sqlCount.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlCount.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlCount.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlCount.append(" where 1 = 1 ");
            
            if(null != meet.getRowId() && meet.getRowId() > 0){
            	sqlList.append(" and mm.row_id = ?0 ");
            	sqlCount.append(" and mm.row_id = ?0 ");
            }
            if(null != meet.getBoardroom() && meet.getBoardroom() > 0){
            	sqlList.append(" and mm.boardroom = ?1 ");
            	sqlCount.append(" and mm.boardroom = ?1 ");
            }
            if(CommonUtils.isNotBlank(meet.getMeetSubject())){
            	sqlList.append(" and mm.meet_subject = ?2 ");
            	sqlCount.append(" and mm.meet_subject = ?2 ");
            }
            if(null != meet.getInitiator() && meet.getInitiator() > 0){
            	sqlList.append(" and mm.initiator = ?3 ");
            	sqlCount.append(" and mm.initiator = ?3 ");
            }
            if(null != meet.getConferenceClerk() && meet.getConferenceClerk() > 0){
            	sqlList.append(" and mm.conference_clerk = ?4 ");
            	sqlCount.append(" and mm.conference_clerk = ?4 ");
            }
            if(CommonUtils.isNotBlank(meet.getMeetDate())){
            	sqlList.append(" and mm.meet_date = ?5 ");
            	sqlCount.append(" and mm.meet_date = ?5 ");
            }
            if(null != meet.getStatus() && meet.getStatus() > 0){
            	sqlList.append(" and mm.status = ?6 ");
            	sqlCount.append(" and mm.status = ?6 ");
            }
            sqlList.append(" ORDER BY mm.meet_date DESC, mm.meet_start DESC, mm.meet_end DESC ");
            
            Query queryList = em.createNativeQuery(sqlList.toString());
            queryList.setFirstResult(pageRequest.getPageSize() * pageRequest.getPageNumber());
            queryList.setMaxResults(pageRequest.getPageSize());
            Query queryCount = em.createNativeQuery(sqlCount.toString());
            
            if(null != meet.getRowId() && meet.getRowId() > 0){
            	queryList.setParameter(0, meet.getRowId());
            	queryCount.setParameter(0, meet.getRowId());
            }
            if(null != meet.getBoardroom() && meet.getBoardroom() > 0){
            	queryList.setParameter(1, meet.getBoardroom());
            	queryCount.setParameter(1, meet.getBoardroom());
            }
            if(CommonUtils.isNotBlank(meet.getMeetSubject())){
            	queryList.setParameter(2, meet.getMeetSubject());
            	queryCount.setParameter(2, meet.getMeetSubject());
            }
            if(null != meet.getInitiator() && meet.getInitiator() > 0){
            	queryList.setParameter(3, meet.getInitiator());
            	queryCount.setParameter(3, meet.getInitiator());
            }
            if(null != meet.getConferenceClerk() && meet.getConferenceClerk() > 0){
            	queryList.setParameter(4, meet.getConferenceClerk());
            	queryCount.setParameter(4, meet.getConferenceClerk());
            }
            if(CommonUtils.isNotBlank(meet.getMeetDate())){
            	queryList.setParameter(5, meet.getMeetDate());
            	queryCount.setParameter(5, meet.getMeetDate());
            }
            if(null != meet.getStatus() && meet.getStatus() > 0){
            	queryList.setParameter(6, meet.getStatus());
            	queryCount.setParameter(6, meet.getStatus());
            }
            
            List<Object[]> list = queryList.getResultList();
            if(list != null){
            	Long total = CommonUtils.objectToLong(queryCount.getSingleResult());
            	List<OsMeetingMgt> dataList = new ArrayList<OsMeetingMgt>();
            	OsMeetingMgt obj = null;
            	for (Object[] arr : list) {
					obj = new OsMeetingMgt();
					objectArray2Entity(obj, arr);
					dataList.add(obj);
				}
            	PageImpl<OsMeetingMgt> pageImpl = new PageImpl<OsMeetingMgt>(dataList, pageRequest, total);
            	arg.success().setPage(pageImpl);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
	@Transactional(readOnly = true)
    public Argument loadUserMeeting(Argument arg) {
        try {
        	OsMeetingMgt meet = (OsMeetingMgt) arg.getObj();
            Pageable pageRequest = arg.getPageable(); 
            StringBuffer sqlList = new StringBuffer();
            StringBuilder sqlCount = new StringBuilder();
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name, mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification, mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" WHERE 1 = 1");
            
            sqlCount.append("SELECT count(mm.row_id) FROM os_meeting_mgt mm ");
            sqlCount.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlCount.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlCount.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlCount.append(" WHERE 1 = 1");
            
            if(null != meet.getConferenceClerk() && meet.getConferenceClerk() > 0){
            	sqlList.append(" AND mm.row_id IN (SELECT ma.meet_id FROM os_meet_attendees ma WHERE ma.user_id = ?0) ");
            	sqlCount.append(" AND mm.row_id IN (SELECT ma.meet_id FROM os_meet_attendees ma WHERE ma.user_id = ?0) ");
            }
            if(CommonUtils.isNotBlank(meet.getMeetDate())){
            	sqlList.append(" and (mm.meet_date > ?1 or (mm.meet_date = ?1 AND BINARY mm.meet_end > BINARY ?3 ))");
            	sqlCount.append(" and (mm.meet_date > ?1 or (mm.meet_date = ?1 AND BINARY mm.meet_end > BINARY ?3 ))");
            }
            
            if(null != meet.getInitiator() && meet.getInitiator() > 0){
            	sqlList.append(" and mm.initiator = ?4 ");
            	sqlCount.append(" and mm.initiator = ?4 ");
            }
            
            sqlList.append(" ORDER BY mm.meet_date DESC, mm.meet_start DESC, mm.meet_end DESC, mm.status ASC ");
            
            Query queryList = em.createNativeQuery(sqlList.toString());
            queryList.setFirstResult(pageRequest.getPageSize() * pageRequest.getPageNumber());
            queryList.setMaxResults(pageRequest.getPageSize());
            Query queryCount = em.createNativeQuery(sqlCount.toString());
            
            if(null != meet.getConferenceClerk() && meet.getConferenceClerk() > 0){
            	queryList.setParameter(0, meet.getConferenceClerk());
            	queryCount.setParameter(0, meet.getConferenceClerk());
            }
            if(CommonUtils.isNotBlank(meet.getMeetDate())){
            	queryList.setParameter(1, meet.getMeetDate());
            	queryCount.setParameter(1, meet.getMeetDate());
            	
            	queryList.setParameter(3, meet.getMeetEnd());
            	queryCount.setParameter(3, meet.getMeetEnd());
            }
            
            if(null != meet.getInitiator() && meet.getInitiator() > 0){
            	queryList.setParameter(4, meet.getInitiator());
            	queryCount.setParameter(4, meet.getInitiator());
            }
            
            List<Object[]> list = queryList.getResultList();
            if(list != null){
            	Long total = CommonUtils.objectToLong(queryCount.getSingleResult());
            	List<OsMeetingMgt> dataList = new ArrayList<OsMeetingMgt>();
            	OsMeetingMgt obj = null;
            	for (Object[] arr : list) {
					obj = new OsMeetingMgt();
					objectArray2Entity(obj, arr);
					dataList.add(obj);
				}
            	PageImpl<OsMeetingMgt> pageImpl = new PageImpl<OsMeetingMgt>(dataList, pageRequest, total);
            	arg.success().setPage(pageImpl);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument loadTimeMeeting(Argument arg) {
        try {
        	OsMeetingMgt meet = (OsMeetingMgt) arg.getObj();
            StringBuffer sqlList = new StringBuffer();
            StringBuilder sqlCount = new StringBuilder();
            
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name, mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification, mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" WHERE b.row_id = ?0");
            sqlList.append(" AND mm.meet_date = ?1");
            sqlList.append(" AND( (BINARY mm.meet_start >= BINARY ?2 AND BINARY mm.meet_start < BINARY ?3)");
            sqlList.append(" OR (BINARY mm.meet_end > BINARY ?2 AND BINARY mm.meet_end <= BINARY ?3) )");
            sqlList.append(" AND mm.status = 1");
            sqlList.append(" ORDER BY mm.meet_date DESC, mm.meet_start DESC, mm.meet_end DESC");
            
            sqlCount.append("SELECT count(mm.row_id)");
            sqlCount.append(" FROM os_meeting_mgt mm ");
            sqlCount.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlCount.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlCount.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlCount.append(" WHERE b.row_id = ?0");
            sqlCount.append(" AND mm.meet_date = ?1");
            sqlCount.append(" AND( (BINARY mm.meet_start >= BINARY ?2 AND BINARY mm.meet_start < BINARY ?3 )");
            sqlCount.append(" OR (BINARY mm.meet_end > BINARY ?2 AND BINARY mm.meet_end <= BINARY ?3 ) )");
            sqlCount.append(" AND mm.status = 1");
            
            Query queryList = em.createNativeQuery(sqlList.toString());
            Query queryCount = em.createNativeQuery(sqlCount.toString());
            
            queryList.setParameter(0, meet.getBoardroom());
        	queryCount.setParameter(0, meet.getBoardroom());
        	
        	queryList.setParameter(1, meet.getMeetDate());
        	queryCount.setParameter(1, meet.getMeetDate());
        	
        	queryList.setParameter(2, meet.getMeetStart());
        	queryCount.setParameter(2, meet.getMeetStart());
        	
        	queryList.setParameter(3, meet.getMeetEnd());
        	queryCount.setParameter(3, meet.getMeetEnd());
            
            List<Object[]> list = queryList.getResultList();
            if(list != null){
            	List<OsMeetingMgt> dataList = new ArrayList<OsMeetingMgt>();
            	OsMeetingMgt obj = null;
            	for (Object[] arr : list) {
					obj = new OsMeetingMgt();
					objectArray2Entity(obj, arr);
					dataList.add(obj);
				}
            	arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    @Transactional(readOnly = true)
    public Argument loadNeedNoticeMeeting(Argument arg) {
        try {
            StringBuffer sqlList = new StringBuffer();
            sqlList.append("SELECT mm.row_id, mm.boardroom, b.room_name as boardroom_name, mm.meet_subject, mm.initiator, u.name as initiator_name, mm.conference_clerk, u2.name as conference_clerk_name, mm.meet_date, mm.meet_start, mm.meet_end, mm.meet_remark, mm.meet_minutes, mm.mail_notification, mm.mail_reminder, mm.status");
            sqlList.append(" FROM os_meeting_mgt mm ");
            sqlList.append(" LEFT JOIN os_user u ON mm.initiator = u.row_id");
            sqlList.append(" LEFT JOIN os_user u2 ON mm.conference_clerk = u2.row_id");
            sqlList.append(" LEFT JOIN os_boardroom b ON mm.boardroom = b.row_id");
            sqlList.append(" WHERE mm.mail_reminder = 1");
            Query queryList = em.createNativeQuery(sqlList.toString());
            List<Object[]> list = queryList.getResultList();
            if(list != null){
            	List<OsMeetingMgt> dataList = new ArrayList<OsMeetingMgt>();
            	OsMeetingMgt obj = null;
            	for (Object[] arr : list) {
					obj = new OsMeetingMgt();
					objectArray2Entity(obj, arr);
					dataList.add(obj);
				}
            	arg.success().setDataToRtn(dataList);
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
        return arg;
    }
    
    public Argument loadMeetUsers(Argument arg) {
    	try{
    		String sql = "SELECT u.row_id, u.account, u.name, u.email FROM os_user u WHERE u.row_id IN (SELECT ma.user_id FROM os_meet_attendees ma WHERE ma.meet_id = ?0 )";
    		Query queryList = em.createNativeQuery(sql);
    		queryList.setParameter(0, arg.getRowId());
    		List<Object[]> list = queryList.getResultList();
    		if(list != null){
    			List<Map<String, String>> userList = new ArrayList<Map<String, String>>();
    			Map<String, String> user = null;
    			for (Object[] arr : list) {
    				user = new HashMap<String, String>();
    				user.put("userId", CommonUtils.objectToString(arr[0]));
    				user.put("account", CommonUtils.objectToString(arr[1]));
    				user.put("name", CommonUtils.objectToString(arr[2]));
    				user.put("email", CommonUtils.objectToString(arr[3]));
    				userList.add(user);
				}
            	arg.success().setDataToRtn(userList);
            } else {
                arg.fail();
            }
    	} catch(Exception e){
            logger.error("查询OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("查询数据失败");
        }
    	return arg;
    }
    
    public Argument save(Argument arg) {
        try {
            OsMeetingMgt entity = (OsMeetingMgt) arg.getObj();
            entity = repository.save(entity);
            if(entity != null){
            	List<OsMeetAttendees> record = new ArrayList<OsMeetAttendees>();
            	JSONArray jsonArr = (JSONArray) arg.getReq("member");
            	Long currUserId = arg.getLongForReq("userId");
            	Long uid = null;
            	Map<Long, Long> idMap = new HashMap<Long, Long>();
            	OsMeetAttendees atten = null;
            	for (int i = 0, k = jsonArr.size(); i < k; i++) {
            		uid = jsonArr.getLong(i);
            		if(!idMap.containsKey(uid)){
            			idMap.put(uid, uid);
            			atten = new OsMeetAttendees();
            			atten.setUserId(uid);
            			atten.setInitiator(currUserId == atten.getUserId() ? StatusTypeConstants.DATA_STATUS_YES : StatusTypeConstants.DATA_STATUS_NO);
            			atten.setMeetId(entity.getRowId());
            			atten.setStatus(StatusTypeConstants.DATA_STATUS_YES);
            			record.add(atten);
            		}
				}
            	record = attendeesRepository.save(record);
            	if(null != record){
            		arg.success().setObj(entity);
            	} else {
                    arg.fail();
                }
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("新增OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("新增数据失败");
            throw new RuntimeException("新增OsMeetingMgt数据失败");
        }
        return arg;
    }
    
    public Argument update(Argument arg) {
        try {
            OsMeetingMgt entity = (OsMeetingMgt) arg.getObj();
            entity = repository.saveAndFlush(entity);
            if(entity != null){
            	int state = attendeesRepository.deleteByMeetId(entity.getRowId());
            	if(state != -1){
            		List<OsMeetAttendees> record = new ArrayList<OsMeetAttendees>();
            		JSONArray jsonArr = (JSONArray) arg.getReq("member");
            		Long currUserId = arg.getLongForReq("userId");
            		Long uid = null;
            		Map<Long, Long> idMap = new HashMap<Long, Long>();
            		OsMeetAttendees atten = null;
            		for (int i = 0, k = jsonArr.size(); i < k; i++) {
            			uid = jsonArr.getLong(i);
            			if(!idMap.containsKey(uid)){
            				idMap.put(uid, uid);
            				atten = new OsMeetAttendees();
            				atten.setUserId(uid);
            				atten.setInitiator(currUserId.equals(atten.getUserId()) ? StatusTypeConstants.DATA_STATUS_YES : StatusTypeConstants.DATA_STATUS_NO);
            				atten.setMeetId(entity.getRowId());
            				atten.setStatus(StatusTypeConstants.DATA_STATUS_YES);
            				record.add(atten);
            			}
            		}
            		record = attendeesRepository.save(record);
            		if(null != record){
            			arg.success().setObj(entity);
            		} else {
                        arg.fail();
                    }
            	}
            } else {
                arg.fail();
            }
        } catch(Exception e){
            logger.error("修改OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("修改数据失败");
            throw new RuntimeException("修改OsMeetingMgt数据失败");
        }
        return arg;
    }
    
    public Argument updateMunites(Argument arg) {
    	try {
    		OsMeetingMgt entity = (OsMeetingMgt) arg.getObj();
    		entity = repository.saveAndFlush(entity);
    		if(null != entity){
    			arg.success().setObj(entity);
    		} else {
    			arg.fail();
    		}
    	} catch(Exception e){
    		logger.error("修改YxosMeetingMgt数据失败：" + e.getMessage(), e);
    		arg.fail("修改数据失败");
    		throw new RuntimeException("修改YxosMeetingMgt数据失败");
    	}
    	return arg;
    }
    
    public Argument delete(Argument arg) {
        try {
            repository.delete(arg.getRowId());
            
            attendeesRepository.deleteByMeetId(arg.getRowId());
            
            arg.success();
        } catch(Exception e){
            logger.error("删除OsMeetingMgt数据失败：" + e.getMessage(), e);
            arg.fail("删除数据失败");
            throw new RuntimeException("删除OsMeetingMgt数据失败");
        }
        return arg;
    }
    
    public OsMeetingMgt objectArray2Entity(OsMeetingMgt meet, Object[] arr){
		meet.setRowId(CommonUtils.objectToLong(arr[0]));
		meet.setBoardroom(CommonUtils.objectToLong(arr[1]));
		meet.setBoardroomName(CommonUtils.objectToString(arr[2]));
		meet.setMeetSubject(CommonUtils.objectToString(arr[3]));
		meet.setInitiator(CommonUtils.objectToLong(arr[4]));
		meet.setInitiatorName(CommonUtils.objectToString(arr[5]));
		meet.setConferenceClerk(CommonUtils.objectToLong(arr[6]));
		meet.setConferenceClerkName(CommonUtils.objectToString(arr[7]));
		meet.setMeetDate(CommonUtils.objectToString(arr[8]));
		meet.setMeetStart(CommonUtils.objectToString(arr[9]));
		meet.setMeetEnd(CommonUtils.objectToString(arr[10]));
		meet.setMeetRemark(CommonUtils.objectToString(arr[11]));
		meet.setMeetMinutes(CommonUtils.objectToString(arr[12]));
		meet.setMailNotification(CommonUtils.objectToInt(arr[13], 2));
		meet.setMailReminder(CommonUtils.objectToInt(arr[14], 2));
		meet.setStatus(CommonUtils.objectToInt(arr[15], 3));
		return meet;
    }
    
}
