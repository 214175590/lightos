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
 * @Desc 桌面图标表
 * @Time 2018-05-11 14:24
 * @GeneratedByCodeFactory
 */
@SuppressWarnings("serial")
@Entity
@Table(name = "os_desk_icon")
public class OsDeskIcon extends BaseEntity implements java.io.Serializable {

    /** 主键ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "row_id")
    private Long rowId;

    /** 图标类型名称 */
    @Column(name = "name")
    private String name;

    /** 图标类型 */
    @Column(name = "types")
    private String types;

    /** 图标标题 */
    @Column(name = "title")
    private String title;

    /** 图标打开窗口的宽度（piex） */
    @Column(name = "window_width")
    private Integer windowWidth = 800;

    /** 图标打开窗口的高度（piex） */
    @Column(name = "window_height")
    private Integer windowHeight = 500;

    /** 图标打开窗口的请求地址 */
    @Column(name = "location")
    private String location = "error404.jsp";

    /** 图标坐标X */
    @Column(name = "sleft")
    private Integer sleft = 10;

    /** 图标坐标Y */
    @Column(name = "top")
    private Integer top = 10;

    /** 图标是否可以鼠标拖动 */
    @Column(name = "isdrag")
    private String isdrag = "true";

    /** 图标是否初始化就显示 */
    @Column(name = "isshow")
    private String isshow = "true";

    /** 图标图片路径 */
    @Column(name = "icon")
    private String icon = "images/icons/a01.png";

    /** 图标等级（0 所有,1 个人,2 系统） */
    @Column(name = "levels")
    private Integer levels;

    /** 图标主机（1 本地,2 远程） */
    @Column(name = "hosts")
    private Integer hosts;

    /** 打开的窗口是否有关闭按钮 */
    @Column(name = "need_close")
    private String needClose = "true";

    /** 打开的窗口是否有最小化按钮 */
    @Column(name = "need_minimize")
    private String needMinimize = "true";

    /** 打开的窗口是否有最大化按钮 */
    @Column(name = "need_maximize")
    private String needMaximize = "true";

    /** 图标打开窗口的关闭时触发的JS脚本 */
    @Column(name = "close_function")
    private String closeFunction;

    /** 图标打开窗口的最小化时触发的JS脚本 */
    @Column(name = "min_function")
    private String minFunction;

    /** 图标打开窗口的最大化/还原时触发的脚本 */
    @Column(name = "max_function")
    private String maxFunction;

    /** 状态（1:在用，2：禁用，3：待审核） */
    @Column(name = "status")
    private Integer status = 1;

    /** 创建时间 */
    @Column(name = "create_time")
    private String createTime;

    /** 所属用户 */
    @Column(name = "belong")
    private String belong;

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
     * 获取 图标类型名称 的值
     * @return String
     */
    public String getName() {
        return name;
    }
    
    /**
     * 设置图标类型名称 的值
     * @param String name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 获取 图标类型 的值
     * @return String
     */
    public String getTypes() {
        return types;
    }
    
    /**
     * 设置图标类型 的值
     * @param String types
     */
    public void setTypes(String types) {
        this.types = types;
    }

    /**
     * 获取 图标标题 的值
     * @return String
     */
    public String getTitle() {
        return title;
    }
    
    /**
     * 设置图标标题 的值
     * @param String title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * 获取 图标打开窗口的宽度（piex） 的值
     * @return Integer
     */
    public Integer getWindowWidth() {
        return windowWidth;
    }
    
    /**
     * 设置图标打开窗口的宽度（piex） 的值
     * @param Integer windowWidth
     */
    public void setWindowWidth(Integer windowWidth) {
        this.windowWidth = windowWidth;
    }

    /**
     * 获取 图标打开窗口的高度（piex） 的值
     * @return Integer
     */
    public Integer getWindowHeight() {
        return windowHeight;
    }
    
    /**
     * 设置图标打开窗口的高度（piex） 的值
     * @param Integer windowHeight
     */
    public void setWindowHeight(Integer windowHeight) {
        this.windowHeight = windowHeight;
    }

    /**
     * 获取 图标打开窗口的请求地址 的值
     * @return String
     */
    public String getLocation() {
        return location;
    }
    
    /**
     * 设置图标打开窗口的请求地址 的值
     * @param String location
     */
    public void setLocation(String location) {
        this.location = location;
    }

    /**
     * 获取 图标坐标X 的值
     * @return Integer
     */
    public Integer getSleft() {
        return sleft;
    }
    
    /**
     * 设置图标坐标X 的值
     * @param Integer sleft
     */
    public void setSleft(Integer sleft) {
        this.sleft = sleft;
    }

    /**
     * 获取 图标坐标Y 的值
     * @return Integer
     */
    public Integer getTop() {
        return top;
    }
    
    /**
     * 设置图标坐标Y 的值
     * @param Integer top
     */
    public void setTop(Integer top) {
        this.top = top;
    }

    /**
     * 获取 图标是否可以鼠标拖动 的值
     * @return String
     */
    public String getIsdrag() {
        return isdrag;
    }
    
    /**
     * 设置图标是否可以鼠标拖动 的值
     * @param String isdrag
     */
    public void setIsdrag(String isdrag) {
        this.isdrag = isdrag;
    }

    /**
     * 获取 图标是否初始化就显示 的值
     * @return String
     */
    public String getIsshow() {
        return isshow;
    }
    
    /**
     * 设置图标是否初始化就显示 的值
     * @param String isshow
     */
    public void setIsshow(String isshow) {
        this.isshow = isshow;
    }

    /**
     * 获取 图标图片路径 的值
     * @return String
     */
    public String getIcon() {
        return icon;
    }
    
    /**
     * 设置图标图片路径 的值
     * @param String icon
     */
    public void setIcon(String icon) {
        this.icon = icon;
    }

    /**
     * 获取 图标等级（0 所有,1 个人,2 系统） 的值
     * @return Integer
     */
    public Integer getLevels() {
        return levels;
    }
    
    /**
     * 设置图标等级（0 所有,1 个人,2 系统） 的值
     * @param Integer levels
     */
    public void setLevels(Integer levels) {
        this.levels = levels;
    }

    /**
     * 获取 图标主机（1 本地,2 远程） 的值
     * @return Integer
     */
    public Integer getHosts() {
        return hosts;
    }
    
    /**
     * 设置图标主机（1 本地,2 远程） 的值
     * @param Integer hosts
     */
    public void setHosts(Integer hosts) {
        this.hosts = hosts;
    }

    /**
     * 获取 打开的窗口是否有关闭按钮 的值
     * @return String
     */
    public String getNeedClose() {
        return needClose;
    }
    
    /**
     * 设置打开的窗口是否有关闭按钮 的值
     * @param String needClose
     */
    public void setNeedClose(String needClose) {
        this.needClose = needClose;
    }

    /**
     * 获取 打开的窗口是否有最小化按钮 的值
     * @return String
     */
    public String getNeedMinimize() {
        return needMinimize;
    }
    
    /**
     * 设置打开的窗口是否有最小化按钮 的值
     * @param String needMinimize
     */
    public void setNeedMinimize(String needMinimize) {
        this.needMinimize = needMinimize;
    }

    /**
     * 获取 打开的窗口是否有最大化按钮 的值
     * @return String
     */
    public String getNeedMaximize() {
        return needMaximize;
    }
    
    /**
     * 设置打开的窗口是否有最大化按钮 的值
     * @param String needMaximize
     */
    public void setNeedMaximize(String needMaximize) {
        this.needMaximize = needMaximize;
    }

    /**
     * 获取 图标打开窗口的关闭时触发的JS脚本 的值
     * @return String
     */
    public String getCloseFunction() {
        return closeFunction;
    }
    
    /**
     * 设置图标打开窗口的关闭时触发的JS脚本 的值
     * @param String closeFunction
     */
    public void setCloseFunction(String closeFunction) {
        this.closeFunction = closeFunction;
    }

    /**
     * 获取 图标打开窗口的最小化时触发的JS脚本 的值
     * @return String
     */
    public String getMinFunction() {
        return minFunction;
    }
    
    /**
     * 设置图标打开窗口的最小化时触发的JS脚本 的值
     * @param String minFunction
     */
    public void setMinFunction(String minFunction) {
        this.minFunction = minFunction;
    }

    /**
     * 获取 图标打开窗口的最大化/还原时触发的脚本 的值
     * @return String
     */
    public String getMaxFunction() {
        return maxFunction;
    }
    
    /**
     * 设置图标打开窗口的最大化/还原时触发的脚本 的值
     * @param String maxFunction
     */
    public void setMaxFunction(String maxFunction) {
        this.maxFunction = maxFunction;
    }

    /**
     * 获取 状态（1:在用，2：禁用，3：待审核） 的值
     * @return Integer
     */
    public Integer getStatus() {
        return status;
    }
    
    /**
     * 设置状态（1:在用，2：禁用，3：待审核） 的值
     * @param Integer status
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * 获取 创建时间 的值
     * @return String
     */
    public String getCreateTime() {
        return createTime;
    }
    
    /**
     * 设置创建时间 的值
     * @param String createTime
     */
    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    /**
     * 获取 所属用户 的值
     * @return String
     */
    public String getBelong() {
        return belong;
    }
    
    /**
     * 设置所属用户 的值
     * @param String belong
     */
    public void setBelong(String belong) {
        this.belong = belong;
    }

    @Override
	public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getClass().getName());
        sb.append("; rowId=" + (rowId == null ? "null" : rowId.toString()));
        sb.append("; name=" + (name == null ? "null" : name.toString()));
        sb.append("; types=" + (types == null ? "null" : types.toString()));
        sb.append("; title=" + (title == null ? "null" : title.toString()));
        sb.append("; windowWidth=" + (windowWidth == null ? "null" : windowWidth.toString()));
        sb.append("; windowHeight=" + (windowHeight == null ? "null" : windowHeight.toString()));
        sb.append("; location=" + (location == null ? "null" : location.toString()));
        sb.append("; sleft=" + (sleft == null ? "null" : sleft.toString()));
        sb.append("; top=" + (top == null ? "null" : top.toString()));
        sb.append("; isdrag=" + (isdrag == null ? "null" : isdrag.toString()));
        sb.append("; isshow=" + (isshow == null ? "null" : isshow.toString()));
        sb.append("; icon=" + (icon == null ? "null" : icon.toString()));
        sb.append("; levels=" + (levels == null ? "null" : levels.toString()));
        sb.append("; hosts=" + (hosts == null ? "null" : hosts.toString()));
        sb.append("; needClose=" + (needClose == null ? "null" : needClose.toString()));
        sb.append("; needMinimize=" + (needMinimize == null ? "null" : needMinimize.toString()));
        sb.append("; needMaximize=" + (needMaximize == null ? "null" : needMaximize.toString()));
        sb.append("; closeFunction=" + (closeFunction == null ? "null" : closeFunction.toString()));
        sb.append("; minFunction=" + (minFunction == null ? "null" : minFunction.toString()));
        sb.append("; maxFunction=" + (maxFunction == null ? "null" : maxFunction.toString()));
        sb.append("; status=" + (status == null ? "null" : status.toString()));
        sb.append("; createTime=" + (createTime == null ? "null" : createTime.toString()));
        sb.append("; belong=" + (belong == null ? "null" : belong.toString()));

        return sb.toString();
    }
}