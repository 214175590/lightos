package com.echinacoop.lightos.domain.svn;




import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.echinacoop.lightos.domain.base.BaseEntity;

/**
 * 此实体类为[代码工厂]自动生成
 * @Desc 用户svn信息表
 * @Time 2018-06-01 15:04
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_svn_user")
public class OsSvnUser extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 用户ID */
    @Column(name = "user_id")
    private Long userId;

    /** 账号 */
    @Column(name = "username")
    private String username;

    /** 密码 */
    @Column(name = "password")
    private String password;



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
     * 获取 账号 的值
     * @return String
     */
    public String getUsername() {
        return username;
    }
    
    /**
     * 设置账号 的值
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

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; userId=" + (userId == null ? "null" : userId.toString()));
        sb.append("; username=" + (username == null ? "null" : username.toString()));
        sb.append("; password=" + (password == null ? "null" : password.toString()));

        return sb.toString();
    }
}