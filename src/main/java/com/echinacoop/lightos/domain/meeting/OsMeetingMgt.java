package com.echinacoop.lightos.domain.meeting;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 会议管理表
 * @Time 2018-09-18 14:04:46
 * @Auto Generated
 */
@SuppressWarnings("serial")
@Entity
@Table(name="os_meeting_mgt")
public class OsMeetingMgt implements java.io.Serializable {

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
     * 会议室
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="boardroom")
    private Long boardroom;
    
    @Column(name="boardroom_name")
    private String boardroomName;

    /**
     * 会议主题
     * @NotNull
     * @MaxLength 64
     */
    @Column(name="meet_subject")
    private String meetSubject;

    /**
     * 会议发起人
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="initiator")
    private Long initiator;
    
    @Column(name="initiator_name")
    private String initiatorName;

    /**
     * 会议记录人
     * @MaxLength 20
     */
    @Column(name="conference_clerk")
    private Long conferenceClerk;
    
    @Column(name="conference_clerk_name")
    private String conferenceClerkName;

    /**
     * 会议日期
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="meet_date")
    private String meetDate;

    /**
     * 会议开始时间（0800）
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="meet_start")
    private String meetStart;

    /**
     * 会议结束时间（0900）
     * @NotNull
     * @MaxLength 20
     */
    @Column(name="meet_end")
    private String meetEnd;

    /**
     * 会议说明
     * @MaxLength 320
     */
    @Column(name="meet_remark")
    private String meetRemark;

    /**
     * 会议纪要
     * @MaxLength 4000
     */
    @Column(name="meet_minutes")
    private String meetMinutes;

    /**
     * 邮件通知(1:是,2:否)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="mail_notification")
    private Integer mailNotification;

    /**
     * 邮件提醒(1:是,2:否)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="mail_reminder")
    private Integer mailReminder;

    /**
     * 状态(1:待执行,2:已取消,3:已完成)
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
     * 获取 会议室 的值
     * @return Long
     */
    public Long getBoardroom() {
        return boardroom;
    }
    
    /**
     * 设置 会议室 的值
     * @param Long boardroom
     */
    public void setBoardroom(Long boardroom) {
        this.boardroom = boardroom;
    }

    /**
     * 获取 会议主题 的值
     * @return String
     */
    public String getMeetSubject() {
        return meetSubject;
    }
    
    /**
     * 设置 会议主题 的值
     * @param String meetSubject
     */
    public void setMeetSubject(String meetSubject) {
        this.meetSubject = meetSubject;
    }

    /**
     * 获取 会议发起人 的值
     * @return String
     */
    public Long getInitiator() {
        return initiator;
    }
    
    /**
     * 设置 会议发起人 的值
     * @param String initiator
     */
    public void setInitiator(Long initiator) {
        this.initiator = initiator;
    }

    /**
     * 获取 会议记录人 的值
     * @return String
     */
    public Long getConferenceClerk() {
        return conferenceClerk;
    }
    
    /**
     * 设置 会议记录人 的值
     * @param String conferenceClerk
     */
    public void setConferenceClerk(Long conferenceClerk) {
        this.conferenceClerk = conferenceClerk;
    }

    /**
     * 获取 会议日期 的值
     * @return String
     */
    public String getMeetDate() {
        return meetDate;
    }
    
    /**
     * 设置 会议日期 的值
     * @param String meetDate
     */
    public void setMeetDate(String meetDate) {
        this.meetDate = meetDate;
    }

    /**
     * 获取 会议开始时间（0800） 的值
     * @return String
     */
    public String getMeetStart() {
        return meetStart;
    }
    
    /**
     * 设置 会议开始时间（0800） 的值
     * @param String meetStart
     */
    public void setMeetStart(String meetStart) {
        this.meetStart = meetStart;
    }

    /**
     * 获取 会议结束时间（0900） 的值
     * @return String
     */
    public String getMeetEnd() {
        return meetEnd;
    }
    
    /**
     * 设置 会议结束时间（0900） 的值
     * @param String meetEnd
     */
    public void setMeetEnd(String meetEnd) {
        this.meetEnd = meetEnd;
    }

    /**
     * 获取 会议说明 的值
     * @return String
     */
    public String getMeetRemark() {
        return meetRemark;
    }
    
    /**
     * 设置 会议说明 的值
     * @param String meetRemark
     */
    public void setMeetRemark(String meetRemark) {
        this.meetRemark = meetRemark;
    }

    /**
     * 获取 会议纪要 的值
     * @return String
     */
    public String getMeetMinutes() {
        return meetMinutes;
    }
    
    /**
     * 设置 会议纪要 的值
     * @param String meetMinutes
     */
    public void setMeetMinutes(String meetMinutes) {
        this.meetMinutes = meetMinutes;
    }

    /**
     * 获取 邮件通知(1:是,2:否) 的值
     * @return Integer
     */
    public Integer getMailNotification() {
        return mailNotification;
    }
    
    /**
     * 设置 邮件通知(1:是,2:否) 的值
     * @param Integer mailNotification
     */
    public void setMailNotification(Integer mailNotification) {
        this.mailNotification = mailNotification;
    }

    /**
     * 获取 邮件提醒(1:是,2:否) 的值
     * @return Integer
     */
    public Integer getMailReminder() {
        return mailReminder;
    }
    
    /**
     * 设置 邮件提醒(1:是,2:否) 的值
     * @param Integer mailReminder
     */
    public void setMailReminder(Integer mailReminder) {
        this.mailReminder = mailReminder;
    }

    /**
     * 获取 状态(1:待执行,2:已取消,3:已完成) 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置 状态(1:待执行,2:已取消,3:已完成) 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getBoardroomName() {
		return boardroomName;
	}

	public void setBoardroomName(String boardroomName) {
		this.boardroomName = boardroomName;
	}

	public String getInitiatorName() {
		return initiatorName;
	}

	public void setInitiatorName(String initiatorName) {
		this.initiatorName = initiatorName;
	}

	public String getConferenceClerkName() {
		return conferenceClerkName;
	}

	public void setConferenceClerkName(String conferenceClerkName) {
		this.conferenceClerkName = conferenceClerkName;
	}

	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; boardroom=" + (boardroom == null ? "null" : boardroom.toString()));
        sb.append("; meetSubject=" + (meetSubject == null ? "null" : meetSubject.toString()));
        sb.append("; initiator=" + (initiator == null ? "null" : initiator.toString()));
        sb.append("; conferenceClerk=" + (conferenceClerk == null ? "null" : conferenceClerk.toString()));
        sb.append("; meetDate=" + (meetDate == null ? "null" : meetDate.toString()));
        sb.append("; meetStart=" + (meetStart == null ? "null" : meetStart.toString()));
        sb.append("; meetEnd=" + (meetEnd == null ? "null" : meetEnd.toString()));
        sb.append("; meetRemark=" + (meetRemark == null ? "null" : meetRemark.toString()));
        sb.append("; meetMinutes=" + (meetMinutes == null ? "null" : meetMinutes.toString()));
        sb.append("; mailNotification=" + (mailNotification == null ? "null" : mailNotification.toString()));
        sb.append("; mailReminder=" + (mailReminder == null ? "null" : mailReminder.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));
        return sb.toString();
    }
}
