package com.echinacoop.lightos.domain.dubbo;

import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.echinacoop.lightos.domain.base.BaseEntity;

/**
 * 此实体类为[代码工厂]自动生成
 * @Desc Dubbo接口信息表
 * @Time 2018-08-20 15:01
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_dubbo_interface")
public class OsDubboInterface extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;
    
    /** dubbo服务端地址 */
    @Column(name = "name")
    private String name;

    /** 接口名称 */
    @Column(name = "interface_name")
    private String interfaceName;

    /** 方法名称 */
    @Column(name = "method_name")
    private String methodName;

    /** 接口中文名称 */
    @Column(name = "method_nick")
    private String methodNick;
    
    /** 接口描述 */
    @Column(name = "remark")
    private String remark;

    /** 入参 */
    @Column(name = "in_param")
    private String inParam;

    /** 出参 */
    @Column(name = "out_param")
    private String outParam;

    /** 最后修改时间 */
    @Column(name = "update_time")
    private Timestamp updateTime = new Timestamp(System.currentTimeMillis());


    /**
     * 获取 主键ID 的值
     * @return Long
     */
    public Long getRowId() {
        return rowId;
    }
    
    /**
     * 设置主键ID 的值
     * @param Long rowId
     */
    public void setRowId(Long rowId) {
        this.rowId = rowId;
    }
    
    public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	/**
     * 获取 接口名称 的值
     * @return String
     */
    public String getInterfaceName() {
        return interfaceName;
    }
    
    /**
     * 设置接口名称 的值
     * @param String interfaceName
     */
    public void setInterfaceName(String interfaceName) {
        this.interfaceName = interfaceName;
    }

    /**
     * 获取 方法名称 的值
     * @return String
     */
    public String getMethodName() {
        return methodName;
    }
    
    /**
     * 设置方法名称 的值
     * @param String methodName
     */
    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public String getMethodNick() {
		return methodNick;
	}

	public void setMethodNick(String methodNick) {
		this.methodNick = methodNick;
	}

	/**
     * 获取 接口描述 的值
     * @return String
     */
    public String getRemark() {
        return remark;
    }
    
    /**
     * 设置接口描述 的值
     * @param String remark
     */
    public void setRemark(String remark) {
        this.remark = remark;
    }

    /**
     * 获取 入参 的值
     * @return String
     */
    public String getInParam() {
        return inParam;
    }
    
    /**
     * 设置入参 的值
     * @param String inParam
     */
    public void setInParam(String inParam) {
        this.inParam = inParam;
    }

    /**
     * 获取 出参 的值
     * @return String
     */
    public String getOutParam() {
        return outParam;
    }
    
    /**
     * 设置出参 的值
     * @param String outParam
     */
    public void setOutParam(String outParam) {
        this.outParam = outParam;
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
        sb.append("; name=" + (name == null ? "null" : name.toString()));
        sb.append("; interfaceName=" + (interfaceName == null ? "null" : interfaceName.toString()));
        sb.append("; methodName=" + (methodName == null ? "null" : methodName.toString()));
        sb.append("; remark=" + (remark == null ? "null" : remark.toString()));
        sb.append("; inParam=" + (inParam == null ? "null" : inParam.toString()));
        sb.append("; outParam=" + (outParam == null ? "null" : outParam.toString()));
        sb.append("; updateTime=" + (updateTime == null ? "null" : updateTime.toString()));

        return sb.toString();
    }
}