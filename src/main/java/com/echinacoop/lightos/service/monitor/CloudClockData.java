package com.echinacoop.lightos.service.monitor;

import java.sql.Timestamp;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.monitor.OsCloudClock;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.rest.util.EMailTool;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

public class CloudClockData {
	private static final Logger logger = LoggerFactory.getLogger(CloudClockData.class);
	public static Map<Long, OsCloudClock> monitorItem = new HashMap<Long, OsCloudClock>();
	
	private static EMailTool email = EMailTool.getInstance();

	public static void reflush(List<OsCloudClock> dataList){
		if(null != dataList){
			monitorItem.clear();
			for(OsCloudClock obj : dataList){
				monitorItem.put(obj.getRowId(), obj);
			}
		}
	}
	
	public static OsCloudClock getServiceMonitor(Long rowId){
		return monitorItem.get(rowId);
	}
	
	public static Collection<OsCloudClock> getList(){
		return monitorItem.values();
	}
	
	public static class MonitorThread implements Runnable {
		OsCloudClock monitor = null;
		OsCloudClockService ssCloudClockService;
		boolean isNotice = false;
		public MonitorThread(OsCloudClockService service, OsCloudClock obj, boolean isNotice){
			this.monitor = obj;
			this.ssCloudClockService = service;
			this.isNotice = isNotice;
		}
		
		@Override
		public void run() {
			Argument arg = new Argument();
			if(monitor.getCycle().equals("time")){
				monitor.setStatus(3);
			}
			monitor.setLastTime(new Timestamp(System.currentTimeMillis()));
			// 修改数据库
			arg.setObj(monitor);
			arg = ssCloudClockService.save(arg);
			
			if(isNotice){
				noticeWeb();
				notice();
			}
			
			arg = ssCloudClockService.findAll();
			if(arg.isSuccess()){
				reflush((List<OsCloudClock>) arg.getDataForRtn());
			}
		}
		
		public void noticeWeb(){
			Map<String, WSClient> clientMap = DataCache.getAllClient();
			if(null != clientMap){
				WSData wsData = new WSData();
				wsData.setUrl("monitor.clock");
				Map<String, String> head = new HashMap<String, String>();
				head.put("type", "notice");
				head.put("flag", "clock");
				wsData.setHead(head);
				Map<String, String> body = new HashMap<String, String>();
				body.put("rowId", "" + monitor.getRowId());
				body.put("title", monitor.getTitle());
				body.put("content", monitor.getContent());
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
			StringBuilder content = new StringBuilder();
			content.append(MessageFormat.format("{0}\n{1} - {2}", 
					DateUtils.format(),
					monitor.getTitle(), monitor.getContent()));
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
				email.sendEMail("Light OS", "云闹钟提醒-" + monitor.getTitle(), content.toString(), toUserList, null, null);
			}
			
			if(CommonUtils.isNotBlank(monitor.getUsers())){
				OsTongdaOAService.sendSms(monitor.getUsers(), "", "云闹钟提醒: \n" + content.toString());
			}
		}
		
	}
	
}
