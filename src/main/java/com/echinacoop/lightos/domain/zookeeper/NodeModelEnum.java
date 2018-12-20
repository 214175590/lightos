package com.echinacoop.lightos.domain.zookeeper;
/**      
 * 项目名称：zmc  
 * 实现功能：节点类型枚举  
 * 类名称：NodeModel   
 * 类描述：(该类的主要功能)
 * 创建人：徐纪伟 
 * E-mail: 289045706@qq.com
 * 创建时间：2017年2月18日下午6:40:59   
 * 修改人：   
 * 修改时间：   
 * 版权 :
 * 修改备注：   
 * @version    
 */
public enum NodeModelEnum {
	/**
	 * LEADER
	 */
	PERSISTENT("PERSISTENT","持久节点"),
    /**
     * FLOWER
     */
	EPHEMERAL("EPHEMERAL","临时节点"),
    
    ;
    /**
     * 值
     */
    private String val;
    /**
     * 描述
     */
    private String msg;

    private NodeModelEnum(String val, String msg) {
        this.val = val;
        this.msg = msg;
    }
   
    public String getVal() {
        return val;
    }
    
    public void setVal(String val) {
        this.val = val;
    }
   
    public String getMsg() {
        return msg;
    }
   
    public void setMsg(String msg) {
        this.msg = msg;
    }
    
    public String getString(){
        return this.val.toString();
    }
    public static NodeModelEnum getInstance(String val) {
        for (NodeModelEnum buss : NodeModelEnum.values()) {
            if (buss.getVal().equals(val)) {
                return buss;
            }
        }
        return null;
    }
}
