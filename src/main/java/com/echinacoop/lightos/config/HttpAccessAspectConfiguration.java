package com.echinacoop.lightos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import com.echinacoop.lightos.aop.http.HttpAccessAspect;

@Configuration
@EnableAspectJAutoProxy
public class HttpAccessAspectConfiguration {

    @Bean
    public HttpAccessAspect httpAccessAspect() {
        return new HttpAccessAspect();
    }
}
