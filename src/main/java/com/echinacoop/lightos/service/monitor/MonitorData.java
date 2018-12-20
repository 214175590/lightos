package com.echinacoop.lightos.service.monitor;

import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Timestamp;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.net.telnet.TelnetClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.rest.util.EMailTool;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

public class MonitorData {
	private static final Logger logger = LoggerFactory.getLogger(MonitorData.class);
	private static int TIMEOUT = 20000;
	private static int SERIA_NUM = 5;
	private static int WAIT_NUM = 50;
	public static Map<Long, JSONObject> monitorItem = new HashMap<Long, JSONObject>();
	
	private static EMailTool email = EMailTool.getInstance();

	public static void reflush(List<OsServiceMonitor> dataList){
		if(null != dataList){
			JSONObject json = null;
			monitorItem.clear();
			for(OsServiceMonitor obj : dataList){
				json = monitorItem.get(obj.getRowId());
				if(null == json){
					json = new JSONObject();
					json.put("time", 0);
					json.put("notice", 0);
				}
				json.put("item", obj);
				monitorItem.put(obj.getRowId(), json);
			}
		}
	}
	
	public static boolean isNotice(Long rowId){
		JSONObject json = monitorItem.get(rowId);
		if(null != json){
			int notice = json.getIntValue("notice");
			if(notice >= SERIA_NUM){ // 5次后暂停提醒
				if(notice >= WAIT_NUM){ // 50次后恢复提醒
					json.put("notice", 0);
				}
				return false;
			} 
			return isNotice((OsServiceMonitor) json.get("item"));
		}
		return false;
	}
	
	public static boolean isNotice(OsServiceMonitor monitor){
		if(null != monitor){
			return monitor.getNotice() == 1;
		}
		return false;
	}
	
	public static void setNotice(Long rowId, int notice){
		JSONObject json = monitorItem.get(rowId);
		if(null != json){
			OsServiceMonitor monitor = (OsServiceMonitor) json.get("item");
			if(null != monitor){
				monitor.setNotice(notice);
			}
		}
	}
	
	public static OsServiceMonitor getServiceMonitor(Long rowId){
		JSONObject json = monitorItem.get(rowId);
		if(null != json){
			return (OsServiceMonitor) json.get("item");
		}
		return null;
	}
	
	public static Collection<JSONObject> getList(){
		return monitorItem.values();
	}
	
	public static class MonitorThread implements Runnable {
		OsServiceMonitor monitor = null;
		OsServiceMonitorService osServiceMonitorServiceImpl;
		public MonitorThread(OsServiceMonitorService service, OsServiceMonitor obj){
			this.monitor = obj;
			this.osServiceMonitorServiceImpl = service;
		}
		
		@Override
		public void run() {
			if(monitor.getTyped().equals("http")){
				visit(monitor.getAddress(), TIMEOUT);
			} else if(monitor.getTyped().equals("socket")){
				try {
					String[] strs = monitor.getAddress().split(":");
					String ip = strs[0];
					int port = CommonUtils.stringToInt(strs[1], 80);
					TelnetClient tc = new TelnetClient();
					tc.setConnectTimeout((monitor.getTimes()/2) * 1000);
					tc.connect(ip, port);
					monitor.setCode("200");
					monitor.setError("访问正常");
					try{
						tc.disconnect();
					}catch(Exception ex){}
				} catch (Exception e) {
					monitor.setCode("503");
					monitor.setError(e.getMessage());
				}
			}
			
			// 修改数据库
			monitor.setUpdateTime(new Timestamp(System.currentTimeMillis()));
			Argument arg = new Argument();
			arg.setObj(monitor);
			arg = osServiceMonitorServiceImpl.update(arg);
			
			if(isNotice(monitor.getRowId())){
				noticeWeb();
				notice();
			}
		}
		
		public void visit(String urlstr, int timeout){
			int code = 503;
			try {
				URL url = new URL(urlstr);
				HttpURLConnection conn = (HttpURLConnection) url.openConnection();
				conn.setRequestMethod("GET"); // 设置本次请求的方式 ， 默认是GET方式， 参数要求都是大写字母
				conn.setConnectTimeout(timeout);// 设置连接超时
				conn.setDoInput(true);// 是否打开输入流 ， 此方法默认为true
				conn.setDoOutput(true);// 是否打开输出流， 此方法默认为false
				conn.connect();// 表示连接
				code = conn.getResponseCode();
				monitor.setCode("" + code);
				monitor.setError("访问正常");
				try{
					conn.disconnect();
				}catch(Exception ex){}
			} catch (Exception e) {
				logger.error(urlstr + " 无法访问：" + e.getMessage());
				monitor.setCode("" + code);
				monitor.setError(e.getMessage());
			}
		}
		
		public void noticeWeb(){
			Map<String, WSClient> clientMap = DataCache.getAllClient();
			if(null != clientMap){
				WSData wsData = new WSData();
				wsData.setUrl("monitor.check");
				Map<String, String> head = new HashMap<String, String>();
				head.put("type", "check");
				head.put("flag", "monitor");
				wsData.setHead(head);
				Map<String, String> body = new HashMap<String, String>();
				body.put("rowId", "" + monitor.getRowId());
				body.put("code", monitor.getCode());
				body.put("msg", monitor.getError());
				wsData.setBody(body);
				for(Map.Entry<String, WSClient> entry : clientMap.entrySet()){
					try {
						entry.getValue().sendMessage(wsData);
					} catch (Exception e) {
					}
				}
			}
		}
		
		public void notice(){
			int code = CommonUtils.stringToInt(monitor.getCode(), -1);
			if(code != 200 && (code < 300 || code >= 400)){
				StringBuilder content = new StringBuilder();
				content.append(MessageFormat.format("{0}监测到“{1}({2})”无法连接，原因：{3} {4}，请即时检查原因。", 
						DateUtils.format(),
						monitor.getRemark(), monitor.getAddress(),
						monitor.getCode(), monitor.getError()));
				if(CommonUtils.isNotBlank(monitor.getEmail())){
					List<Map<String, String>> toUserList = new ArrayList<Map<String, String>>();
					String[] emails = monitor.getEmail().split(";");
					Map<String, String> user = null;
					for(String e : emails){
						if(CommonUtils.isNotBlank(e)){
							user = new HashMap<String, String>();
							user.put("email", e);
							user.put("name", e);
							toUserList.add(user);
						}
					}
					email.sendEMail("Light OS", "服务监测反馈", content.toString(), toUserList, null, null);
				}
				
				if(CommonUtils.isNotBlank(monitor.getUsers())){
					OsTongdaOAService.sendSms(monitor.getUsers(), "", content.toString());
				}
			}
		}
		
	}
	
}
