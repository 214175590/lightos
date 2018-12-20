package com.echinacoop.lightos.web.rest.util;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.Map.Entry;

import com.yinsin.other.LogHelper;

public class Utils {
	private static final LogHelper logger = LogHelper.getLogger(Utils.class);
	
	public static String readResourceFile(String file) {
		String content = "";
		try {
			InputStream is = Utils.class.getClassLoader().getResourceAsStream(file);
			byte[] b = null;
			byte[] buf = new byte[1024];
			int num = -1;
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			while ((num = is.read(buf, 0, buf.length)) != -1) {
				baos.write(buf, 0, num);
			}
			b = baos.toByteArray();
			content = new String(b, "utf-8");
			baos.flush();
			baos.close();
			is.close();
		} catch (Exception e) {
			logger.error("读取资源文件异常：" + e.getMessage());
		}
		return content;
	}

	/**
	 * 格式化模版 #{key}
	 * 
	 * @param content
	 * @param data
	 * @return
	 */
	public static String parseTemplate(String content, Map<String, String> data) {
		try {
			if (content != null && data != null) {
				for (Entry<String, String> entry : data.entrySet()) {
					content = content.replaceAll("#\\{" + entry.getKey() + "\\}", entry.getValue());
				}
			}
		} catch (Exception e) {
			logger.error("解析模版字符串异常：" + e.getMessage());
		}
		return content;
	}
}
