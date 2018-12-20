package com.echinacoop.lightos.domain.docker;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.echinacoop.lightos.domain.base.BaseEntity;

/**
 * 此实体类为[代码工厂]自动生成
 * @Desc Docker节点服务器信息
 * @Time 2018-06-08 17:28
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_docker_info")
public class OsDockerInfo extends BaseEntity implements java.io.Serializable {

    /** row_id */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 主机地址 */
    @Column(name = "ip")
    private String ip = "";

    /** 端口号 */
    @Column(name = "port")
    private Integer port = 0;

    /** 用户名 */
    @Column(name = "username")
    private String username = "";

    /** 密码 */
    @Column(name = "password")
    private String password = "";

    /** 描述信息 */
    @Column(name = "remark")
    private String remark = "";

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
     * 获取 主机地址 的值
     * @return String
     */
    public String getIp() {
        return ip;
    }
    
    /**
     * 设置主机地址 的值
     * @param String ip
     */
    public void setIp(String ip) {
        this.ip = ip;
    }

    /**
     * 获取 端口号 的值
     * @return Integer
     */
    public Integer getPort() {
        return port;
    }
    
    /**
     * 设置端口号 的值
     * @param Integer port
     */
    public void setPort(Integer port) {
        this.port = port;
    }

    /**
     * 获取 用户名 的值
     * @return String
     */
    public String getUsername() {
        return username;
    }
    
    /**
     * 设置用户名 的值
     * @param String username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * 获取 密码 的值
     * @return String
     */
    public String getPassword() {
        return password;
    }
    
    /**
     * 设置密码 的值
     * @param String password
     */
    public void setPassword(String password) {
        this.password = password;
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

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; ip=" + (ip == null ? "null" : ip.toString()));
        sb.append("; port=" + (port == null ? "null" : port.toString()));
        sb.append("; username=" + (username == null ? "null" : username.toString()));
        sb.append("; password=" + (password == null ? "null" : password.toString()));
        sb.append("; remark=" + (remark == null ? "null" : remark.toString()));

        return sb.toString();
    }
}