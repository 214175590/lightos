package com.echinacoop.lightos.web.rest.docker;

import java.io.InputStream;
import java.net.Socket;

import com.yinsin.utils.MatcherUtils;

public class DockerDemo {

	public static void main(String[] args) {
		try {
			String s = MatcherUtils.match("\n[[a-zA-Z0-9]+@localhost \\~] ", "\n[gxyj@localhost ~]$ \n[gxyj@localhost ~]$ \n[gxyj@localhost ~]$ ");
			
			System.out.println(s);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
