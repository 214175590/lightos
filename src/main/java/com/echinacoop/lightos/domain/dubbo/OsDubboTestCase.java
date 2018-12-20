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
 * @Desc Dubbo接口测试用例表
 * @Time 2018-05-28 10:13
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_dubbo_test_case")
public class OsDubboTestCase extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** jar名称/dubbo服务端地址 */
    @Column(name = "name")
    private String name;

    /** ZK/DUBBO服务端地址 */
    @Column(name = "server")
    private String server;

    /** 接口名称 */
    @Column(name = "interface_name")
    private String interfaceName;

    /** 方法名称 */
    @Column(name = "method_name")
    private String methodName;

    /** 用例名称 */
    @Column(name = "case_name")
    private String caseName;

    /** 入参 */
    @Column(name = "param")
    private String param;

    /** 测试结果 */
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

    /**
     * 获取 jar名称/dubbo服务端地址 的值
     * @return String
     */
    public String getName() {
        return name;
    }
    
    /**
     * 设置jar名称/dubbo服务端地址 的值
     * @param String name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取 ZK/DUBBO服务端地址 的值
     * @return String
     */
    public String getServer() {
        return server;
    }
    
    /**
     * 设置ZK/DUBBO服务端地址 的值
     * @param String server
     */
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
     * 获取 用例名称 的值
     * @return String
     */
    public String getCaseName() {
        return caseName;
    }
    
    /**
     * 设置用例名称 的值
     * @param String caseName
     */
    public void setCaseName(String caseName) {
        this.caseName = caseName;
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
     * 获取 测试结果 的值
     * @return String
     */
    public String getResult() {
        return result;
    }
    
    /**
     * 设置测试结果 的值
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
        sb.append(this.getClass().getSimpleName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; name=" + (name == null ? "null" : name.toString()));
        sb.append("; server=" + (server == null ? "null" : server.toString()));
        sb.append("; interfaceName=" + (interfaceName == null ? "null" : interfaceName.toString()));
        sb.append("; methodName=" + (methodName == null ? "null" : methodName.toString()));
        sb.append("; caseName=" + (caseName == null ? "null" : caseName.toString()));
        sb.append("; param=" + (param == null ? "null" : param.toString()));
        sb.append("; result=" + (result == null ? "null" : result.toString()));
        sb.append("; testTime=" + (testTime == null ? "null" : testTime.toString()));

        return sb.toString();
    }
}