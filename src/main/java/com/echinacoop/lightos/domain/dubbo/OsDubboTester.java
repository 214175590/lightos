package com.echinacoop.lightos.domain.dubbo;

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
 * @Desc Dubbo接口测试数据表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_dubbo_tester")
public class OsDubboTester extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;
    
    /** 服务端地址 */
    @Column(name = "name")
    private String name;

    /** 服务端地址 */
    @Column(name = "server")
    private String server;
    
    /** 接口名称 */
    @Column(name = "interface_name")
    private String interfaceName;

    /** 方法名称 */
    @Column(name = "method_name")
    private String methodName;

    /** 入参 */
    @Column(name = "param")
    private String param;

    /** 最后测试结果 */
    @Column(name = "result")
    private String result;

    /** 最后测试时间 */
    @Column(name = "test_time")
    private Timestamp testTime = new Timestamp(System.currentTimeMillis());

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

	public String getServer() {
		return server;
	}

	public void setServer(String server) {
		this.server = server;
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

    /**
     * 获取 入参 的值
     * @return String
     */
    public String getParam() {
        return param;
    }
    
    /**
     * 设置入参 的值
     * @param String param
     */
    public void setParam(String param) {
        this.param = param;
    }

    /**
     * 获取 最后测试结果 的值
     * @return String
     */
    public String getResult() {
        return result;
    }
    
    /**
     * 设置最后测试结果 的值
     * @param String result
     */
    public void setResult(String result) {
        this.result = result;
    }

    /**
     * 获取 最后测试时间 的值
     * @return Timestamp
     */
    public Timestamp getTestTime() {
        return testTime;
    }
    
    /**
     * 设置最后测试时间 的值
     * @param Timestamp testTime
     */
    public void setTestTime(Timestamp testTime) {
        this.testTime = testTime;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; interfaceName=" + (interfaceName == null ? "null" : interfaceName.toString()));
        sb.append("; methodName=" + (methodName == null ? "null" : methodName.toString()));
        sb.append("; param=" + (param == null ? "null" : param.toString()));
        sb.append("; result=" + (result == null ? "null" : result.toString()));
        sb.append("; testTime=" + (testTime == null ? "null" : testTime.toString()));

        return sb.toString();
    }
}