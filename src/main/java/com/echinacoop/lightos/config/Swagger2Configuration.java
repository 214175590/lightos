package com.echinacoop.lightos.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

//@Configuration
//@EnableSwagger2
public class Swagger2Configuration {

	@Autowired
	ApplicationProperties properties;

	@Bean
	public Docket initDocket() {
		Docket doc = new Docket(DocumentationType.SWAGGER_2);
		return doc.apiInfo(getApiInfo())
				.select()
				.apis(RequestHandlerSelectors.any())
				.paths(PathSelectors.any())
				.build();
	}

	private ApiInfo getApiInfo() {
		ApiInfoBuilder apiInfo = new ApiInfoBuilder();
		Contact info = new Contact("联系人名称", "项目访问地址", "电子邮箱");
		return apiInfo.title("云系统 APIs")
				.description("项目描述")
				.termsOfServiceUrl("项目访问域名")
				.contact(info)
				.version("1.0") // API版本
				.build();
	}
}
