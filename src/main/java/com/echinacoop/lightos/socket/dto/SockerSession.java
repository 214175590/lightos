package com.echinacoop.lightos.socket.dto;

import org.springframework.web.socket.WebSocketSession;

/**
 * DTO for storing a user's activity.
 */
public class SockerSession {

    private String sid;
    private String userId;
    private WebSocketSession wsSession;

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public WebSocketSession getWsSession() {
        return wsSession;
    }

    public void setWsSession(WebSocketSession wsSession) {
        this.wsSession = wsSession;
    }

    @Override
    public String toString() {
        return "ActivityDTO {" + "sid='" + sid + '\'' + ", userId='" + userId + '\'' + ", session='" + wsSession + '}';
    }
}
