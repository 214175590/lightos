package com.echinacoop.lightos.domain.meeting;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 会议出席者表
 * @Time 2018-09-18 14:05:01
 * @Auto Generated
 */
@SuppressWarnings("serial")
@Entity
@Table(name="os_meet_attendees")
public class OsMeetAttendees implements java.io.Serializable {

    /**
     * 主键ID
     * @NotNull
     * @MaxLength 20
     */
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="row_id")
    private Long rowId;

    /**
     * 会议ID
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="meet_id")
    private Long meetId;

    /**
     * 会议参与者ID
     * @MaxLength 20
     */
    @Column(name="user_id")
    private Long userId;

    /**
     * 会议发起者(1:是，2：否)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="initiator")
    private Integer initiator;

    /**
     * 状态(1正常出席，2会议缺席)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="status")
    private Integer status;

    /**
     * 获取 主键ID 的值
     * @return Long
     */
    public Long getRowId() {
        return rowId;
    }
    
    /**
     * 设置 主键ID 的值
     * @param Long rowId
     */
    public void setRowId(Long rowId) {
        this.rowId = rowId;
    }

    /**
     * 获取 会议ID 的值
     * @return Long
     */
    public Long getMeetId() {
        return meetId;
    }
    
    /**
     * 设置 会议ID 的值
     * @param Long meetId
     */
    public void setMeetId(Long meetId) {
        this.meetId = meetId;
    }

    /**
     * 获取 会议参与者ID 的值
     * @return Long
     */
    public Long getUserId() {
        return userId;
    }
    
    /**
     * 设置 会议参与者ID 的值
     * @param Long userId
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * 获取 会议发起者(1:是，2：否) 的值
     * @return Integer
     */
    public Integer getInitiator() {
        return initiator;
    }
    
    /**
     * 设置 会议发起者(1:是，2：否) 的值
     * @param Integer initiator
     */
    public void setInitiator(Integer initiator) {
        this.initiator = initiator;
    }

    /**
     * 获取 状态(1正常出席，2会议缺席) 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置 状态(1正常出席，2会议缺席) 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; meetId=" + (meetId == null ? "null" : meetId.toString()));
        sb.append("; userId=" + (userId == null ? "null" : userId.toString()));
        sb.append("; initiator=" + (initiator == null ? "null" : initiator.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));
        return sb.toString();
    }
}
