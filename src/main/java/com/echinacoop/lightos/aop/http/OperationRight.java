package com.echinacoop.lightos.aop.http;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 操作权限注解，用于后台判断是否有权限操作
 * @author Yisin
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationRight {
    
	String[] value() default {};
	
    String module() default "";
    
    String function() default "";
    
}
