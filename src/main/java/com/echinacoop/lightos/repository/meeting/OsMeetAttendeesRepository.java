package com.echinacoop.lightos.repository.meeting;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.echinacoop.lightos.domain.meeting.OsMeetAttendees;

/**
 * 会议出席者表
 * 此类为自动生成，继承了JpaRepository类，已经拥有基本的增删改成操作
 * @Time 2018-09-18 14:05:01
 * @Auto Generated
 */
public interface OsMeetAttendeesRepository extends JpaRepository<OsMeetAttendees, Long> {
    
    // TODO 自行扩展
    /**
     * 根据条件查询单个记录
     * 请自行修改如下方法
     */
    //OsMeetAttendees findOneBy..(String attrName);
    
    /**
     * 根据条件查询多条记录
     * 请自行修改如下方法
     */
    List<OsMeetAttendees> findByMeetId(Long meetId);
    
    @Query(value="SELECT DISTINCT a.row_id, a.meet_id, a.user_id, a.initiator, a.status, u.name FROM os_meet_attendees a  LEFT JOIN os_user u ON a.user_id = u.row_id where a.meet_id = :meetId", nativeQuery=true)
    List<Object[]> findUsersByMeetId(@Param("meetId") Long meetId);
	
	int deleteByMeetId(Long meetId);
    
    /**
     * 根据条件查询多条记录，SQL + 分页查询  + 总记录数
     * 请自行修改如下方法
     */
    /*
    @Query(
    	value = "select distinct entity from OsMeetAttendees entity where .... ",
    	countQuery = "select count(entity) from OsMeetAttendees"
    )
    Page<OsMeetAttendees> findBy.......(Pageable able);
    */
    
}
