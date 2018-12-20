package com.echinacoop.lightos.web.rest.dubbo;

import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.dubbo.config.spring.ReferenceBean;
import com.echinacoop.lightos.LightosApp;
import com.echinacoop.lightos.config.ApplicationProperties;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = LightosApp.class)
@Transactional
public class DubboTester {
	
	@Autowired  
    private ApplicationContext applicationContext; 
	
	@Autowired
	private ApplicationProperties properties; 
	
	@Test
	public void test() throws Exception {
		URL url1 = new URL(properties.getDubboClientPath() + "act-api-0.0.1-SNAPSHOT.jar");  
        URLClassLoader myClassLoader1 = new URLClassLoader(new URL[] { url1 }, Thread.currentThread().getContextClassLoader());  
        Class<?> myClass1 = myClassLoader1.loadClass("com.echinacoop.act.dubbo.api.ActAccountService.class"); 
		String url = "dubbo://192.168.20.95:20890/com.echinacoop.act.dubbo.api.ActAccountService";
		ReferenceBean referenceBean = new ReferenceBean();  
        referenceBean.setApplicationContext(applicationContext);  
        referenceBean.setInterface(myClass1);  
        referenceBean.setUrl(url);  
        try {  
            referenceBean.afterPropertiesSet();  
            Object demoService = referenceBean.get();  
            Method method = demoService.getClass().getMethod("queryCashAmt", new Class[]{ String.class });
            String param = "{\"msgCreateTime\":\"2018-01-09 16:36:29\",\"receiver\":\"act\",\"sender\":\"ACT\",\"msgId\":\"20180109163629000000000000599239\",\"acctNo\":\"109100000007300043\"}";
            System.out.print("---->" + method.invoke(demoService, param));  
        } catch (Exception e) {
            e.printStackTrace();
        }  
	}

}
