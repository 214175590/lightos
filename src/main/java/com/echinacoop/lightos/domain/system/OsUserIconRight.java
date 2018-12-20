package com.echinacoop.lightos.domain.system;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.echinacoop.lightos.domain.base.BaseEntity;

/**
 * 此实体类为[代码工厂]自动生成
 * @Desc 用户与图标及权限关系表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_user_icon_right")
public class OsUserIconRight extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 用户ID */
    @Column(name = "user_id")
    private Long userId;

    /** 桌面图标ID */
    @Column(name = "desk_icon_id")
    private Long deskIconId;

    /** 权限编码 */
    @Column(name = "right_code")
    private String rightCode;

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
     * 获取 桌面图标ID 的值
     * @return Long
     */
    public Long getDeskIconId() {
        return deskIconId;
    }
    
    /**
     * 设置桌面图标ID 的值
     * @param Long deskIconId
     */
    public void setDeskIconId(Long deskIconId) {
        this.deskIconId = deskIconId;
    }

    /**
     * 获取 权限编码 的值
     * @return String
     */
    public String getRightCode() {
        return rightCode;
    }
    
    /**
     * 设置权限编码 的值
     * @param String rightCode
     */
    public void setRightCode(String rightCode) {
        this.rightCode = rightCode;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; userId=" + (userId == null ? "null" : userId.toString()));
        sb.append("; deskIconId=" + (deskIconId == null ? "null" : deskIconId.toString()));
        sb.append("; rightCode=" + (rightCode == null ? "null" : rightCode.toString()));

        return sb.toString();
    }
}