package com.echinacoop.lightos.domain.meeting;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 会议室表
 * @Time 2018-09-18 13:59:53
 * @Auto Generated
 */
@SuppressWarnings("serial")
@Entity
@Table(name="os_boardroom")
public class OsBoardroom implements java.io.Serializable {

    /**
     * 主键ID
     * @NotNull
     * @MaxLength 20
     */
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="row_id")
    private Long rowId;

    /**
     * 会议室名称
     * @NotNull
     * @MaxLength 32
     */
    @Column(name="room_name")
    private String roomName;

    /**
     * 会议室说明
     * @MaxLength 512
     */
    @Column(name="room_remark")
    private String roomRemark;

    /**
     * 容纳人数
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="capacity")
    private Integer capacity;

    /**
     * 所属公司
     * @NotNull
     * @MaxLength 64
     */
    @Column(name="company")
    private String company;

    /**
     * 内置投影仪(1是，2否)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="projector")
    private Integer projector;

    /**
     * 支持电话会议（1是，2否）
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="teleconference")
    private Integer teleconference;

    /**
     * 支持视频会议（1是，2否）
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="videoconference")
    private Integer videoconference;

    /**
     * 状态(1:开放预约,2:关闭预约)
     * @NotNull
     * @MaxLength 11
     */
    @Column(name="status")
    private Integer status;

    /**
     * 获取 主键ID 的值
     * @return Long
     */
    public Long getRowId() {
        return rowId;
    }
    
    /**
     * 设置 主键ID 的值
     * @param Long rowId
     */
    public void setRowId(Long rowId) {
        this.rowId = rowId;
    }

    /**
     * 获取 会议室名称 的值
     * @return String
     */
    public String getRoomName() {
        return roomName;
    }
    
    /**
     * 设置 会议室名称 的值
     * @param String roomName
     */
    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    /**
     * 获取 会议室说明 的值
     * @return String
     */
    public String getRoomRemark() {
        return roomRemark;
    }
    
    /**
     * 设置 会议室说明 的值
     * @param String roomRemark
     */
    public void setRoomRemark(String roomRemark) {
        this.roomRemark = roomRemark;
    }

    /**
     * 获取 容纳人数 的值
     * @return Integer
     */
    public Integer getCapacity() {
        return capacity;
    }
    
    /**
     * 设置 容纳人数 的值
     * @param Integer capacity
     */
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    /**
     * 获取 所属公司 的值
     * @return String
     */
    public String getCompany() {
        return company;
    }
    
    /**
     * 设置 所属公司 的值
     * @param String company
     */
    public void setCompany(String company) {
        this.company = company;
    }

    /**
     * 获取 内置投影仪(1是，2否) 的值
     * @return Integer
     */
    public Integer getProjector() {
        return projector;
    }
    
    /**
     * 设置 内置投影仪(1是，2否) 的值
     * @param Integer projector
     */
    public void setProjector(Integer projector) {
        this.projector = projector;
    }

    /**
     * 获取 支持电话会议（1是，2否） 的值
     * @return Integer
     */
    public Integer getTeleconference() {
        return teleconference;
    }
    
    /**
     * 设置 支持电话会议（1是，2否） 的值
     * @param Integer teleconference
     */
    public void setTeleconference(Integer teleconference) {
        this.teleconference = teleconference;
    }

    /**
     * 获取 支持视频会议（1是，2否） 的值
     * @return Integer
     */
    public Integer getVideoconference() {
        return videoconference;
    }
    
    /**
     * 设置 支持视频会议（1是，2否） 的值
     * @param Integer videoconference
     */
    public void setVideoconference(Integer videoconference) {
        this.videoconference = videoconference;
    }

    /**
     * 获取 状态(1:开放预约,2:关闭预约) 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置 状态(1:开放预约,2:关闭预约) 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; roomName=" + (roomName == null ? "null" : roomName.toString()));
        sb.append("; roomRemark=" + (roomRemark == null ? "null" : roomRemark.toString()));
        sb.append("; capacity=" + (capacity == null ? "null" : capacity.toString()));
        sb.append("; company=" + (company == null ? "null" : company.toString()));
        sb.append("; projector=" + (projector == null ? "null" : projector.toString()));
        sb.append("; teleconference=" + (teleconference == null ? "null" : teleconference.toString()));
        sb.append("; videoconference=" + (videoconference == null ? "null" : videoconference.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));
        return sb.toString();
    }
}