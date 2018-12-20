package com.echinacoop.lightos.domain.redis;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Redis服务器信息
 * @Time 2018-09-20 17:09:21
 * @Auto Generated
 */
@SuppressWarnings("serial")
@Entity
@Table(name="os_redis_server")
public class OsRedisServer implements java.io.Serializable {

    /**
     * row_id
     * @NotNull
     * @MaxLength 20
     */
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="row_id")
    private Long rowId;

    /**
     * 主机地址
     * @NotNull
     * @MaxLength 36
     */
    @Column(name="ip")
    private String ip = "";

    /**
     * 端口号
     * @NotNull
     * @MaxLength 5
     */
    @Column(name="port")
    private Integer port = 0;

    /**
     * 密码
     * @NotNull
     * @MaxLength 128
     */
    @Column(name="password")
    private String password = "";

    /**
     * 描述信息
     * @MaxLength 512
     */
    @Column(name="remark")
    private String remark = "";

    /**
     * 获取 row_id 的值
     * @return Long
     */
    public Long getRowId() {
        return rowId;
    }
    
    /**
     * 设置 row_id 的值
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
     * 设置 主机地址 的值
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
     * 设置 端口号 的值
     * @param Integer port
     */
    public void setPort(Integer port) {
        this.port = port;
    }

    /**
     * 获取 密码 的值
     * @return String
     */
    public String getPassword() {
        return password;
    }
    
    /**
     * 设置 密码 的值
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
     * 设置 描述信息 的值
     * @param String remark
     */
    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; ip=" + (ip == null ? "null" : ip.toString()));
        sb.append("; port=" + (port == null ? "null" : port.toString()));
        sb.append("; password=" + (password == null ? "null" : password.toString()));
        sb.append("; remark=" + (remark == null ? "null" : remark.toString()));
        return sb.toString();
    }
}