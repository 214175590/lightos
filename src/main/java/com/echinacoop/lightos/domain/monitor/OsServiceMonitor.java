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
 * @Desc 服务监控信息
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_service_monitor")
public class OsServiceMonitor extends BaseEntity implements java.io.Serializable {

    /** row_id */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 类型：http,socket */
    @Column(name = "typed")
    private String typed;

    /** 地址 */
    @Column(name = "address")
    private String address;

    /** 描述信息 */
    @Column(name = "remark")
    private String remark = "";
    
    /** 检测间隔 */
    @Column(name = "times")
    private int times = 30;
    
    /** 是否通知，1通知，2停止通知 */
    @Column(name = "notice")
    private int notice = 1;
    
    /** 邮箱通知人员 */
    @Column(name = "email")
    private String email = "";
    
    /** 通达OA通知人员 */
    @Column(name = "users")
    private String users = "";

    /** 状态码 */
    @Column(name = "code")
    private String code = "";

    /** 错误信息 */
    @Column(name = "error")
    private String error = "待检测";

    /** 最后修改时间 */
    @Column(name = "update_time")
    private Timestamp updateTime = new Timestamp(System.currentTimeMillis());

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
     * 获取 类型：http,socket 的值
     * @return String
     */
    public String getTyped() {
        return typed;
    }
    
    /**
     * 设置类型：http,socket 的值
     * @param String typed
     */
    public void setTyped(String typed) {
        this.typed = typed;
    }

    /**
     * 获取 地址 的值
     * @return String
     */
    public String getAddress() {
        return address;
    }
    
    /**
     * 设置地址 的值
     * @param String address
     */
    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getUsers() {
		return users;
	}

	public void setUsers(String users) {
		this.users = users;
	}

	/**
     * 获取 描述信息 的值
     * @return String
     */
    public String getRemark() {
        return remark;
    }
    
    /**
     * 设置描述信息 的值
     * @param String remark
     */
    public void setRemark(String remark) {
        this.remark = remark;
    }

    public int getTimes() {
		return times;
	}

	public void setTimes(int times) {
		this.times = times;
	}

	/**
     * 获取 状态码 的值
     * @return String
     */
    public String getCode() {
        return code;
    }
    
    /**
     * 设置状态码 的值
     * @param String code
     */
    public void setCode(String code) {
        this.code = code;
    }

    public int getNotice() {
		return notice;
	}

	public void setNotice(int notice) {
		this.notice = notice;
	}

	/**
     * 获取 错误信息 的值
     * @return String
     */
    public String getError() {
        return error;
    }
    
    /**
     * 设置错误信息 的值
     * @param String error
     */
    public void setError(String error) {
        this.error = error;
    }

    /**
     * 获取 最后修改时间 的值
     * @return Timestamp
     */
    public Timestamp getUpdateTime() {
        return updateTime;
    }
    
    /**
     * 设置最后修改时间 的值
     * @param Timestamp updateTime
     */
    public void setUpdateTime(Timestamp updateTime) {
        this.updateTime = updateTime;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; typed=" + (typed == null ? "null" : typed.toString()));
        sb.append("; address=" + (address == null ? "null" : address.toString()));
        sb.append("; remark=" + (remark == null ? "null" : remark.toString()));
        sb.append("; code=" + (code == null ? "null" : code.toString()));
        sb.append("; error=" + (error == null ? "null" : error.toString()));
        sb.append("; updateTime=" + (updateTime == null ? "null" : updateTime.toString()));

        return sb.toString();
    }
}