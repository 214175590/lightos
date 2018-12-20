package com.echinacoop.lightos.socket.dto;

import java.util.Date;

public class WSMessage {

    /** 消息ID，唯一，由发起方生成，一般++即可 */
    private Long msgId = 0L;
    /** 消息内容 */
    private String content = "";
    /** 消息发送者 */
    private String fromUser;
    /** 消息接收者 */
    private String toUser;
    /** 消息类型：1系统消息，2私聊消息，3群聊消息 */
    private int msgType = 1;
    /** 消息样式 */
    private WSMsgStyle msgStyle;
    /** 消息发送时间 */
    private Date time = new Date();
    /** 是否已读 */
    private boolean readed = false;

    public Long getMsgId() {
        return msgId;
    }

    public void setMsgId(Long msgId) {
        this.msgId = msgId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFromUser() {
        return fromUser;
    }

    public void setFromUser(String fromUser) {
        this.fromUser = fromUser;
    }

    public String getToUser() {
        return toUser;
    }

    public void setToUser(String toUser) {
        this.toUser = toUser;
    }

    public int getMsgType() {
        return msgType;
    }

    public void setMsgType(int msgType) {
        this.msgType = msgType;
    }

    public WSMsgStyle getMsgStyle() {
        return msgStyle;
    }

    public void setMsgStyle(WSMsgStyle msgStyle) {
        this.msgStyle = msgStyle;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }

    public boolean isReaded() {
        return readed;
    }

    public void setReaded(boolean readed) {
        this.readed = readed;
    }

    /** 消息样式 */
    class WSMsgStyle {
        /** 字体类型名称，例如：宋体 */
        private String font;
        /** 字体大小，单位默认是像素 */
        private int size = 6;
        /** 字体样式，1粗体，2斜体，3下划线 */
        private int[] style = new int[] { 0, 0, 0 };

        public String getFont() {
            return font;
        }

        public void setFont(String font) {
            this.font = font;
        }

        public int getSize() {
            return size;
        }

        public void setSize(int size) {
            this.size = size;
        }

        public int[] getStyle() {
            return style;
        }

        public void setStyle(int[] style) {
            this.style = style;
        }
    }
}
