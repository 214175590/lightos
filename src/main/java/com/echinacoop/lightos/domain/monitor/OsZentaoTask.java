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
 * @Desc 禅道任务
 * @Time 2018-09-05 11:43
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_zentao_task")
public class OsZentaoTask extends BaseEntity implements java.io.Serializable {

    /** row_id */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 项目ID */
    @Column(name = "pro_id")
    private String proId;

    /** 项目名称 */
    @Column(name = "name")
    private String name;

    /** 管理人员 */
    @Column(name = "manager")
    private String manager;

    /** 首次通知时间 */
    @Column(name = "first_time")
    private String firstTime;

    /** 时间间隔，单位毫秒 */
    @Column(name = "time_interval")
    private Integer timeInterval = 1000 * 60 * 60 * 2;

    /** 状态：1未启动，2已启动 */
    @Column(name = "status")
    private Integer status = 1;
    
    /** 最后修改时间 */
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
     * 获取 项目ID 的值
     * @return String
     */
    public String getProId() {
        return proId;
    }
    
    /**
     * 设置项目ID 的值
     * @param String proId
     */
    public void setProId(String proId) {
        this.proId = proId;
    }

    /**
     * 获取 项目名称 的值
     * @return String
     */
    public String getName() {
        return name;
    }
    
    /**
     * 设置项目名称 的值
     * @param String name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取 管理人员 的值
     * @return String
     */
    public String getManager() {
        return manager;
    }
    
    /**
     * 设置管理人员 的值
     * @param String manager
     */
    public void setManager(String manager) {
        this.manager = manager;
    }

    /**
     * 获取 首次通知时间 的值
     * @return String
     */
    public String getFirstTime() {
        return firstTime;
    }
    
    /**
     * 设置首次通知时间 的值
     * @param String firstTime
     */
    public void setFirstTime(String firstTime) {
        this.firstTime = firstTime;
    }

    /**
     * 获取 时间间隔，单位毫秒 的值
     * @return Integer
     */
    public Integer getTimeInterval() {
        return timeInterval;
    }
    
    /**
     * 设置时间间隔，单位毫秒 的值
     * @param Integer timeInterval
     */
    public void setTimeInterval(Integer timeInterval) {
        this.timeInterval = timeInterval;
    }

    /**
     * 获取 状态：1未启动，2已启动 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置状态：1未启动，2已启动 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

	public Timestamp getLastTime() {
		return lastTime;
	}

	public void setLastTime(Timestamp lastTime) {
		this.lastTime = lastTime;
	}

	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; proId=" + (proId == null ? "null" : proId.toString()));
        sb.append("; name=" + (name == null ? "null" : name.toString()));
        sb.append("; manager=" + (manager == null ? "null" : manager.toString()));
        sb.append("; firstTime=" + (firstTime == null ? "null" : firstTime.toString()));
        sb.append("; timeInterval=" + (timeInterval == null ? "null" : timeInterval.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));

        return sb.toString();
    }
}