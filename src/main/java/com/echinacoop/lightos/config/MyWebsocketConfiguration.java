package com.echinacoop.lightos.config;

import org.hibernate.AnnotationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.client.standard.WebSocketContainerFactoryBean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.echinacoop.lightos.socket.ClientMessageHandler;
import com.echinacoop.lightos.socket.HandleHelper;
import com.echinacoop.lightos.socket.HeartThread;
import com.echinacoop.lightos.socket.MyWebSocketHandler;
import com.echinacoop.lightos.socket.tcp.SocketMessageHandler;
import com.echinacoop.lightos.socket.tcp.TcpServerSocket;

@Configuration
@EnableWebSocket
public class MyWebsocketConfiguration extends WebMvcConfigurerAdapter implements WebSocketConfigurer {
    private final static Logger logger = LoggerFactory.getLogger(MyWebsocketConfiguration.class);
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(systemWebSocketHandler(), "websocket");
		
		/** 注册事件处理类 */
		try {
			// 启动兼容TCP/IP协议
			//TcpServerSocket.getInstance().startServer(new SocketMessageHandler());
			
            HandleHelper.getInstance().registerHandle(ClientMessageHandler.class);
            // 心跳线程
            new HeartThread().start();
        } catch (AnnotationException e) {
            logger.error("registerHandle -> AnnotationException：", e);
        } catch (InstantiationException e) {
            logger.error("registerHandle -> InstantiationException：", e);
        } catch (IllegalAccessException e) {
            logger.error("registerHandle -> IllegalAccessException：", e);
        }
	}

	@Bean
    public WebSocketHandler systemWebSocketHandler(){
        return new MyWebSocketHandler();
    }
	
	@Bean
    public WebSocketContainerFactoryBean createWebSocketContainer() {
        WebSocketContainerFactoryBean container = new WebSocketContainerFactoryBean();
        container.setMaxTextMessageBufferSize(8192);
        container.setMaxBinaryMessageBufferSize(8192);
        return container;
    }
}
