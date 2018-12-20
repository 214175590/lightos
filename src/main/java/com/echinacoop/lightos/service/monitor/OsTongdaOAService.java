package com.echinacoop.lightos.service.monitor;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.TongdaOA;
import com.yinsin.http.HttpRequest;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.CookieUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 服务监控信息
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
public class OsTongdaOAService {
	private final static Logger logger = LoggerFactory.getLogger(OsTongdaOAService.class);
	private static String rootPath = "http://192.168.20.37";
	private static String account = "tongzhiguanjia";
	private static String password = "QUJDYWJjMTIz"; // base64("ABCabc123")
	private static TongdaOA oa;
	private static Thread oaThread = null;
	private static long heartTime = 100000;
	
	public static Argument loginOA(){
		Argument arg = new Argument();
		try {
			if (oa == null) {
				String url = rootPath + "/logincheck.php";
				StringBuilder body = new StringBuilder();
				body.append("UNAME=").append(account);
				body.append("&PASSWORD=").append(password);
				body.append("&encode_type=1");
				HttpRequest request = HttpRequest.post(url).contentType("application/x-www-form-urlencoded;charset=utf-8").send(body.toString());

				logger.debug(request + "?" + body.toString());
				String res = request.body();

				String cookie = "";
				if (res.contains("/general/index.php") && res.contains("正在进入OA系统")) {
					cookie = CookieUtils.getCookie(request);
					logger.debug("cookie===>" + cookie);
					request = HttpRequest.get(rootPath + "/general/index.php?isIE=0").header("Cookie", cookie);
					res = request.body();

					parseUserInfo(res);

					oa.setUserName(account);
					oa.setPassword(password);
					oa.setCookie(cookie);

					arg.success().setObj(oa).setToRtn("rootPath", rootPath);
				}
			} else {
				arg.success().setObj(oa).setToRtn("rootPath", rootPath);
			}

			if (null == oaThread && arg.isSuccess()) {
				oaThread = new Thread(new OAThread());
				oaThread.start();
			}
		} catch (Exception e) {
			logger.error("登录通达OA异常：" + e.getMessage(), e);
		}
		return arg;
	}
	
	public static JSONObject getOnlinePersonnel(){
		// http://192.168.20.37/inc/online.php?PARA_URL2=/general/ipanel/user/user_info.php&PARA_TARGET=_blank&PARA_ID=WINDOW&PARA_VALUE=1&SHOW_IP=&PWD=&OP_SMS=1&_=1535440145737
		try {
			String url = rootPath + "/inc/online.php?PARA_URL2=/general/ipanel/user/user_info.php&PARA_TARGET=_blank&PARA_ID=WINDOW&PARA_VALUE=1&SHOW_IP=&PWD=&OP_SMS=1&_"
					+ System.currentTimeMillis();
			HttpRequest request = HttpRequest.get(url).header("Cookie", oa.getCookie());
			String res = request.body();
			if (CommonUtils.isNotBlank(res) && res.startsWith("{")) {
				return JSONObject.parseObject(CommonUtils.stringUncode(res));
			}
		} catch (Exception e) {
			logger.error("获取通达OA联系人异常：" + e.getMessage(), e);
		}
		return null;
	}
	
	public static JSONObject getPersonnel(){
		try {
			String deptsUrl = rootPath + "/inc/user_list/tree.php?t=" + System.currentTimeMillis();
			HttpRequest request = HttpRequest.get(deptsUrl).header("Cookie", oa.getCookie());
			String res = request.body();
			if (CommonUtils.isNotBlank(res) && res.startsWith("{")) {
				JSONObject company = JSONObject.parseObject(CommonUtils.stringUncode(res));
				JSONArray depts = company.getJSONArray("children");
				JSONObject item = null;
				for(int i = 0, k = depts.size(); i < k; i++){
					item = depts.getJSONObject(i);
					if(item.getBooleanValue("isFolder")){
						item.put("children", getDeptPersonnel(item));
					}
				}
				return company;
			}
		} catch (Exception e) {
			logger.error("获取通达OA联系人异常：" + e.getMessage(), e);
		}
		return null;
	}
	
	public static JSONArray getDeptPersonnel(JSONObject dept){
		String url = rootPath + "/inc/user_list/tree.php?DEPT_ID=" + dept.getIntValue("dept_id") + "&t=" + System.currentTimeMillis();
		HttpRequest request = HttpRequest.get(url).header("Cookie", oa.getCookie());
		String res = request.body();
		if (CommonUtils.isNotBlank(res) && res.startsWith("[")) {
			JSONArray datas = JSONArray.parseArray(CommonUtils.stringUncode(res));
			JSONObject item = null;
			for(int i = 0, k = datas.size(); i < k; i++){
				item = datas.getJSONObject(i);
				if(item.getBooleanValue("isFolder")){
					item.put("children", getDeptPersonnel(item));
				}
			}
			return datas;
		}
		return null;
	}
	
	public static Map<String, String> getUserIds(){
		Map<String, String> users = new HashMap<String, String>();
		try {
			JSONObject json = OsTongdaOAService.getPersonnel();
			JSONArray arr = json.getJSONArray("children");
			if(null != arr && arr.size() > 0 && json.getBooleanValue("isFolder")){
				parseUsers(users, arr);
			}
		} catch (Exception e) {
			logger.error("获取通达OA联系人异常：" + e.getMessage(), e);
		}
		return users;
	}
	
	public static void parseUsers(Map<String, String> users, JSONArray array){
		JSONObject item = null;
		JSONArray arr = null;
		for(int i = 0, k = array.size(); i < k ; i++){
			item = array.getJSONObject(i);
			arr = item.getJSONArray("children");
			if(null != arr && arr.size() > 0 && item.getBooleanValue("isFolder")){
				parseUsers(users, arr);
			} else if(!item.getBooleanValue("isFolder")){
				users.put(item.getString("title"), item.getString("user_id"));
			}
		}
	}
	
	public static Map<String, String> getChildren(JSONObject dept, Map<String, String> uname){
		try {
			JSONObject company = getPersonnel();
			JSONObject item = null;
			JSONArray depts = company.getJSONArray("children");
			for(int i = 0, k = depts.size(); i < k; i++){
				item = depts.getJSONObject(i);
				if(item.getBooleanValue("isFolder")){
					item.put("children", getDeptPersonnel(item));
				}
			}
		} catch (Exception e) {
			logger.error("获取通达OA联系人异常：" + e.getMessage(), e);
		}
		return null;
	}
	
	public static String sendSms(String toUids, String toNames, String content){
		if(oa == null){
			loginOA();
		}
		// http://192.168.20.37/general/status_bar/sms_send.php
		// TO_UID=35,&TO_NAME=王远成,&TD_HTML_EDITOR_CONTENT=111&I_VER=&C=&charset=utf-8
		// TO_UID=35&CONTENT=23333&charset=utf-8
		String res = "";
		try {
			String url = rootPath + "/general/status_bar/sms_send.php";
			StringBuilder body = new StringBuilder();
			body.append("TO_UID=").append(toUids);
			body.append("&TO_NAME=").append(toNames);
			body.append("&TD_HTML_EDITOR_CONTENT=").append(content);
			body.append("&I_VER=&C=&charset=utf-8");
			HttpRequest request = HttpRequest.post(url).header("Cookie", oa.getCookie()).contentType("application/x-www-form-urlencoded;charset=utf-8").send(body.toString());
			res = request.body();
			if (request.ok() && res.contains("用户未登录")) {
				oa = null;
				loginOA();
			}
		} catch (Exception e) {
			logger.error("通达OA发送消息异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	public static String sendEmail(String toUids, String toNames, String subject, String content){
		if(oa == null){
			loginOA();
		}
		String res = "";
		try {
			String url = rootPath + "/general/email/new/submit.php";
			URL uri = new URL(url);
			HttpURLConnection connection = (HttpURLConnection) uri.openConnection();			
			connection.setRequestMethod("POST");
			connection.addRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=gbk");
			connection.addRequestProperty("Charset", "gbk");
			connection.addRequestProperty("Cookie", oa.getCookie());
			connection.setConnectTimeout(15000);
			connection.setReadTimeout(6000);
			// 默认值为：false，当向远程服务器传送数据/写数据时，需要设置为true
            connection.setDoOutput(true);
            // 默认值为：true，当前向远程服务读取数据时，设置为true，该参数可有可无
            connection.setDoInput(true);
			connection.connect();
			OutputStream os = connection.getOutputStream();
			StringBuffer sb = new StringBuffer();
			sb.append("TO_UID=").append(toUids);
			sb.append("&TO_NAME=").append(toNames);
			sb.append("&COPY_TO_ID=").append(toUids);
			sb.append("&COPY_TO_NAME=").append(toNames);
			sb.append("&SECRET_TO_ID=").append("");
			sb.append("&SECRET_TO_NAME=").append("");
			sb.append("&TO_WEBMAIL=").append("");
			sb.append("&COPY_TO_WEBMAIL=").append("");
			sb.append("&SECRET_TO_WEBMAIL=").append("");
			sb.append("&SUBJECT=").append(URLEncoder.encode(subject, "GBK"));
			sb.append("&TD_HTML_EDITOR_CONTENT=").append(URLEncoder.encode(content, "GBK"));
			sb.append("&SMS_REMIND=").append("on");
			sb.append("&SEND_FLAG=").append("1");
			sb.append("&OP=").append("0");
			sb.append("&BODY_ID=").append("");
			os.write(sb.toString().getBytes());
			if (connection.getResponseCode() == 200) {
				InputStream is = connection.getInputStream();
				// 对输入流对象进行包装:charset根据工作项目组的要求来设置
				BufferedReader br = new BufferedReader(new InputStreamReader(is, "gbk"));
                StringBuffer sbf = new StringBuffer();
                String temp = null;
                // 循环遍历一行一行读取数据
                while ((temp = br.readLine()) != null) {
                    sbf.append(temp);
                    sbf.append("\r\n");
                }
                res = sbf.toString();
			}
			/*HttpRequest request = HttpRequest.post(url)
				.header("Cookie", oa.getCookie())
				.form("TO_UID", toUids)
				.form("TO_NAME", toNames)
				.form("COPY_TO_ID", toUids).form("COPY_TO_NAME", toNames)
				.form("SECRET_TO_ID", "").form("SECRET_TO_NAME", "")
				.form("TO_WEBMAIL", "").form("COPY_TO_WEBMAIL", "").form("SECRET_TO_WEBMAIL", "")
				.form("SUBJECT", subject)
				.form("TD_HTML_EDITOR_CONTENT", content)
				.form("SMS_REMIND", "on").form("SEND_FLAG", "1")
				.form("OP", "0").form("BODY_ID", "");
			res = request.body("gbk");*/
			if (res.contains("用户未登录")) {
				oa = null;
				loginOA();
			}
		} catch (Exception e) {
			logger.error("通达OA发送邮件异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	private static void parseUserInfo(String html){
		String[] lines = html.split("\n");
		String str = "";
		JSONObject json = null;
		for(String line : lines){
			if(line.startsWith("var loginUser = ")){
				str = line.substring(16);
				str = str.replace("uid", "\"uid\"");
				str = str.replace("user_id", "\"user_id\"");
				str = str.replace("user_name", "\"user_name\"");
				str = str.replace(";", "");
				json = JSONObject.parseObject(str);
				if(null == oa){
					oa = new TongdaOA();
				}
				oa.setNickName(json.getString("user_name"));
				oa.setUserId(json.getIntValue("uid"));
				break;
			}
		}
	}
	
	private static class OAThread implements Runnable {
		private static int error = 0;
		@Override
		public void run() {
			error = 0;
			while(true){
				try {
					Thread.sleep(heartTime);
				} catch (InterruptedException e) {
				}
				try {
					HttpRequest request = HttpRequest.get(rootPath + "/general/userinfo.php?UID=1").header("Cookie", oa.getCookie());
					String res = request.body();
					logger.debug("OAThread===>" + res);
				} catch (Exception e) {
					logger.error("通达OA心跳异常：" + e.getMessage());
					error++;
					if(error >= 10){
						error = 0;
						oa = null;
						loginOA();
					}
				}
			}
		}
	}
	
}