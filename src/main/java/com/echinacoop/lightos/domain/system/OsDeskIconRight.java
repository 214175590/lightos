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
 * @Desc 图标权限表
 * @Time 2018-05-22 14:28
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_desk_icon_right")
public class OsDeskIconRight extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 桌面图标ID */
    @Column(name = "desk_icon_id")
    private Long deskIconId;

    /** 权限名称 */
    @Column(name = "name")
    private String name;

    /** 权限编码 */
    @Column(name = "code")
    private String code;

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
     * 获取 权限名称 的值
     * @return String
     */
    public String getName() {
        return name;
    }
    
    /**
     * 设置权限名称 的值
     * @param String name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取 权限编码 的值
     * @return String
     */
    public String getCode() {
        return code;
    }
    
    /**
     * 设置权限编码 的值
     * @param String code
     */
    public void setCode(String code) {
        this.code = code;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; deskIconId=" + (deskIconId == null ? "null" : deskIconId.toString()));
        sb.append("; name=" + (name == null ? "null" : name.toString()));
        sb.append("; code=" + (code == null ? "null" : code.toString()));

        return sb.toString();
    }
}