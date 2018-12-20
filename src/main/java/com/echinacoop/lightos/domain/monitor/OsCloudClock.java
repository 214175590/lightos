package com.echinacoop.lightos.domain.monitor;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.echinacoop.lightos.domain.base.BaseEntity;

/**
 * 此实体类为[代码工厂]自动生成
 * @Desc 云闹钟
 * @Time 2018-08-30 09:40
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_cloud_clock")
public class OsCloudClock extends BaseEntity implements java.io.Serializable {

    /** row_id */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 用户ID */
    @Column(name = "user_id")
    private Long userId = 0L;
    
    /** 作用域，private 私有，public 公有 */
    @Column(name = "scope")
    private String scope = "private";

    /** 周期：time,day,week,month,year */
    @Column(name = "cycle")
    private String cycle;

    /** 日期 */
    @Column(name = "date")
    private String date;

    /** 时间 */
    @Column(name = "time")
    private String time;

    /** 下次执行时间 */
    @Column(name = "exec_time")
    private String execTime;

    /** 标题 */
    @Column(name = "title")
    private String title;

    /** 内容 */
    @Column(name = "content")
    private String content;

    /** 状态：1待执行，2停止执行，3已执行 */
    @Column(name = "status")
    private Integer status = 1;

    /** 邮箱通知人员 */
    @Column(name = "email")
    private String email = "";

    /** 通达OA通知人员 */
    @Column(name = "users")
    private String users = "";

    /** 最后执行时间 */
    @Column(name = "last_time")
    private Timestamp lastTime = new Timestamp(System.currentTimeMillis());

    /**
     * 获取 row_id 的值
     * @return Long
     */
    public Long getRowId() {
        return rowId;
    }
    
    /**
     * 设置row_id 的值
     * @param Long rowId
     */
    public void setRowId(Long rowId) {
        this.rowId = rowId;
    }

    /**
     * 获取 用户ID 的值
     * @return Long
     */
    public Long getUserId() {
        return userId;
    }
    
    /**
     * 设置用户ID 的值
     * @param Long userId
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * 获取 周期：time,day,week,month,year 的值
     * @return String
     */
    public String getCycle() {
        return cycle;
    }
    
    /**
     * 设置周期：time,day,week,month,year 的值
     * @param String cycle
     */
    public void setCycle(String cycle) {
        this.cycle = cycle;
    }

    /**
     * 获取 日期 的值
     * @return String
     */
    public String getDate() {
        return date;
    }
    
    /**
     * 设置日期 的值
     * @param String date
     */
    public void setDate(String date) {
        this.date = date;
    }

    /**
     * 获取 时间 的值
     * @return String
     */
    public String getTime() {
        return time;
    }
    
    /**
     * 设置时间 的值
     * @param String time
     */
    public void setTime(String time) {
        this.time = time;
    }

    /**
     * 获取 下次执行时间 的值
     * @return String
     */
    public String getExecTime() {
        return execTime;
    }
    
    /**
     * 设置下次执行时间 的值
     * @param String execTime
     */
    public void setExecTime(String execTime) {
        this.execTime = execTime;
    }

    /**
     * 获取 标题 的值
     * @return String
     */
    public String getTitle() {
        return title;
    }
    
    /**
     * 设置标题 的值
     * @param String title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * 获取 内容 的值
     * @return String
     */
    public String getContent() {
        return content;
    }
    
    /**
     * 设置内容 的值
     * @param String content
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * 获取 状态：1待执行，2停止执行，3已执行 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置状态：1待执行，2停止执行，3已执行 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * 获取 邮箱通知人员 的值
     * @return String
     */
    public String getEmail() {
        return email;
    }
    
    /**
     * 设置邮箱通知人员 的值
     * @param String email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * 获取 通达OA通知人员 的值
     * @return String
     */
    public String getUsers() {
        return users;
    }
    
    /**
     * 设置通达OA通知人员 的值
     * @param String users
     */
    public void setUsers(String users) {
        this.users = users;
    }

    /**
     * 获取 最后执行时间 的值
     * @return Timestamp
     */
    public Timestamp getLastTime() {
        return lastTime;
    }
    
    /**
     * 设置最后执行时间 的值
     * @param Timestamp lastTime
     */
    public void setLastTime(Timestamp lastTime) {
        this.lastTime = lastTime;
    }

    public String getScope() {
		return scope;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	@Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; userId=" + (userId == null ? "null" : userId.toString()));
        sb.append("; cycle=" + (cycle == null ? "null" : cycle.toString()));
        sb.append("; date=" + (date == null ? "null" : date.toString()));
        sb.append("; time=" + (time == null ? "null" : time.toString()));
        sb.append("; execTime=" + (execTime == null ? "null" : execTime.toString()));
        sb.append("; title=" + (title == null ? "null" : title.toString()));
        sb.append("; content=" + (content == null ? "null" : content.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));
        sb.append("; email=" + (email == null ? "null" : email.toString()));
        sb.append("; users=" + (users == null ? "null" : users.toString()));
        sb.append("; lastTime=" + (lastTime == null ? "null" : lastTime.toString()));

        return sb.toString();
    }
}