package com.echinacoop.lightos.service.monitor;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsZentaoTask;
import com.yinsin.http.HttpRequest;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.CookieUtils;

/**
 * 此类为[代码工厂]自动生成
 * @Desc 禅道
 * @Time 2018-08-27 18:04
 * @GeneratedByCodeFactory
 */
public class OsZentaoService {
	private final static Logger logger = LoggerFactory.getLogger(OsZentaoService.class);
	private static String rootPath = "http://bug.gx1f.com:9999/pro";
	private static String account = "wangyuancheng";
	private static String password = "13e34c6308e5e874d80808c2c08df53e";
	private static String coo = "qaBugOrder=id_desc;bugModule=0;pagerBugBrowse=20000;keepLogin=on;pagerProductAll=20000;preProductID={0};lastProduct={0};preBranch=0;windowHeight=949;windowWidth=1893;";
	private static String cookie = null;
	private static Thread zentaoThread = null;
	private static long heartTime = 90000;
	
	public static Argument loginZentao(){
		Argument arg = new Argument();
		if(cookie == null){
			String url = rootPath + "/user-login-L3Byby8=.html";
			StringBuilder body = new StringBuilder();
			body.append("account=").append(account);
			body.append("&password=").append(password);
			body.append("&referer=/pro/");
			HttpRequest request = HttpRequest.post(url)
					.contentType("application/x-www-form-urlencoded;charset=utf-8")
					.send(body.toString());
			
			String res = request.body();
			
			if(!res.contains("登录失败")){
				cookie = CookieUtils.getCookie(request);
				cookie = cookie + "za=" + account + ";";
				request = HttpRequest.get(rootPath + "/general/index.php?isIE=0").header("Cookie", cookie);
				res = request.body();
				
				arg.success().setToRtn("rootPath", rootPath);
			}
		} else {
			arg.success().setToRtn("rootPath", rootPath);
		}
		
		if(null == zentaoThread && arg.isSuccess()){
			zentaoThread = new Thread(new ZentaoThread());
			zentaoThread.start();
		}
		
		return arg;
	}
	
	public static List<Map<String, String>> getBugs(String id){
		String url = rootPath + "/bug-browse-" + id + "-0-unclosed-0.html";
		HttpRequest request = HttpRequest.get(url).header("Cookie", cookie + MessageFormat.format(coo, id));
		String res = request.body();
		List<Map<String, String>> bugs = new ArrayList<Map<String, String>>();
		if(request.ok() && CommonUtils.isNotBlank(res)){
			Document doc = Jsoup.parse(res);
			Map<String, String> bug = null;
			for(Element tr : doc.select("#bugList tbody tr")){
				bug = new HashMap<String, String>();
				bug.put("id", tr.select("td").get(0).select("a").text());
				bug.put("level", tr.select("td").get(1).select("span").text());
				bug.put("title", tr.select("td").get(3).attr("title"));
				bug.put("status", tr.select("td").get(4).text());
				bug.put("create", tr.select("td").get(5).text());
				bug.put("createTime", tr.select("td").get(6).text());
				bug.put("assign", tr.select("td").get(7).text());
				bug.put("solver", tr.select("td").get(8).text());
				bug.put("plan", tr.select("td").get(9).text());
				bug.put("solverTime", tr.select("td").get(10).text());
				bugs.add(bug);
			}
		}
		return bugs;
	}
	
	public static List<OsZentaoTask> getModules(String id){
		if(null == cookie){
			loginZentao();
		}
		String url = rootPath + "/product-all.html";
		HttpRequest request = HttpRequest.get(url).header("Cookie", cookie + MessageFormat.format(coo, id));
		String res = request.body();
		List<OsZentaoTask> modules = new ArrayList<OsZentaoTask>();
		if(request.ok() && CommonUtils.isNotBlank(res)){
			Document doc = Jsoup.parse(res);
			OsZentaoTask module = null;
			for(Element tr : doc.select("#productTableList tr")){
				System.out.println(tr.text());
				module = new OsZentaoTask();
				module.setProId(tr.select("td input").get(0).attr("value"));
				if(CommonUtils.isNotBlank(module.getProId())){
					module.setName(tr.select("td").get(1).text().trim());
					modules.add(module);
				}
			}
		}
		return modules;
	}
	
	private static class ZentaoThread implements Runnable {
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
					HttpRequest request = HttpRequest.get(rootPath + "/my-profile.html?onlybody=yes").header("Cookie", cookie);
					String res = request.body();
					Document doc = Jsoup.parse(res);
					logger.debug("ZentaoThread===>" + doc.select("table.table-data").text());
				} catch (Exception e) {
					logger.error("禅道心跳异常：" + e.getMessage());
					error++;
					if(error >= 10){
						error = 0;
						cookie = null;
						loginZentao();
					}
				}
			}
		}
	}
}