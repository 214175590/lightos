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
 * @Desc 项目svn信息表
 * @Time 2018-06-01 15:04
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_svn_project")
public class OsSvnProject extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 项目别名 */
    @Column(name = "project_name")
    private String projectName;

    /** 项目svn地址 */
    @Column(name = "project_url")
    private String projectUrl;

    /** 项目成员 */
    @Column(name = "project_users")
    private String projectUsers = "";



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
     * 获取 项目别名 的值
     * @return String
     */
    public String getProjectName() {
        return projectName;
    }
    
    /**
     * 设置项目别名 的值
     * @param String projectName
     */
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    /**
     * 获取 项目svn地址 的值
     * @return String
     */
    public String getProjectUrl() {
        return projectUrl;
    }
    
    /**
     * 设置项目svn地址 的值
     * @param String projectUrl
     */
    public void setProjectUrl(String projectUrl) {
        this.projectUrl = projectUrl;
    }

    /**
     * 获取 项目成员 的值
     * @return String
     */
    public String getProjectUsers() {
        return projectUsers;
    }
    
    /**
     * 设置项目成员 的值
     * @param String projectUsers
     */
    public void setProjectUsers(String projectUsers) {
        this.projectUsers = projectUsers;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; projectName=" + (projectName == null ? "null" : projectName.toString()));
        sb.append("; projectUrl=" + (projectUrl == null ? "null" : projectUrl.toString()));
        sb.append("; projectUsers=" + (projectUsers == null ? "null" : projectUsers.toString()));

        return sb.toString();
    }
}