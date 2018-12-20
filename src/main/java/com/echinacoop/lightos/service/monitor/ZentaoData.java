package com.echinacoop.lightos.service.monitor;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.echinacoop.lightos.domain.monitor.OsZentaoTask;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

public class ZentaoData {
	private static final Logger logger = LoggerFactory.getLogger(ZentaoData.class);
	public static Map<Long, OsZentaoTask> monitorItem = new HashMap<Long, OsZentaoTask>();
	
	public static void reflush(List<OsZentaoTask> dataList){
		if(null != dataList){
			monitorItem.clear();
			for(OsZentaoTask obj : dataList){
				monitorItem.put(obj.getRowId(), obj);
			}
		}
	}
	
	public static OsZentaoTask getServiceMonitor(Long rowId){
		return monitorItem.get(rowId);
	}
	
	public static Collection<OsZentaoTask> getList(){
		return monitorItem.values();
	}
	
	public static class MonitorThread implements Runnable {
		OsZentaoTask monitor = null;
		OsZentaoTaskService zentaoService;
		Map<String, List<Map<String, String>>> userBug = null;
		public MonitorThread(OsZentaoTaskService service, OsZentaoTask obj, Map<String, List<Map<String, String>>> userBug){
			this.monitor = obj;
			this.zentaoService = service;
			this.userBug = userBug;
		}
		
		@Override
		public void run() {
			if(null != userBug){
				String userId = null;
				Map<String, String> users = OsTongdaOAService.getUserIds();
				for(Map.Entry<String, List<Map<String, String>>> entry : userBug.entrySet()){
					userId = users.get(entry.getKey());
					if(null != userId){
						noticeUser(userId, entry.getValue());
					}
				}
				
				if(CommonUtils.isNotBlank(monitor.getManager())){
					List<Map<String, String>> datas = new ArrayList<Map<String, String>>();
					for(Map.Entry<String, List<Map<String, String>>> entry : userBug.entrySet()){
						datas.addAll(entry.getValue());
					}
					noticeManager(datas);
				}
			}
		}
		
		public void noticeManager(List<Map<String, String>> list){
			try {
				StringBuilder content = new StringBuilder();
				StringBuilder solver = null;
				StringBuilder assign = null;
				for (Map<String, String> item : list) {
					if ("已解决".equals(item.get("status"))) {
						if (null == solver) {
							solver = new StringBuilder("如下任务请尽快确认是否已解决(若已解决请即时关闭任务)：　");
						}
						solver.append(MessageFormat.format("#{0}[{1}]-{2}　　", 
								item.get("id"), 
								item.get("status"), 
								item.get("assign")));
					} else {
						if (null == assign) {
							assign = new StringBuilder("如下任务请尽快处理(若已处理请即时更改状态)：　");
						}
						assign.append(MessageFormat.format("#{0}[{1}]-{2}　　", 
								item.get("id"), 
								item.get("status"), 
								item.get("assign")));
					}
				}
				if (null != assign) {
					content.append(assign.toString());
				}
				if (null != solver) {
					content.append(solver.toString());
				}
				if(content.length() > 2){
					OsTongdaOAService.sendSms(monitor.getManager() + ",", "", DateUtils.format() + " 请关注禅道任务进展:　　 　　" + content.toString());
				}
			} catch (Exception e) {
				logger.error("推送消息至OA失败：" + e.getMessage());
			}
		}
		
		public void noticeUser(String userId, List<Map<String, String>> list){
			try {
				StringBuilder content = new StringBuilder();
				StringBuilder solver = null;
				StringBuilder assign = null;
				for (Map<String, String> item : list) {
					if ("已解决".equals(item.get("status"))) {
						if (null == solver) {
							solver = new StringBuilder("如下任务请尽快确认是否已解决(若已解决请即时关闭任务)：　");
						}
						solver.append(MessageFormat.format("#{0}，[{1}]{2}　　", item.get("id"), item.get("status"), item.get("title")));
					} else {
						if (null == assign) {
							assign = new StringBuilder("如下任务请尽快处理(若已处理请即时更改状态)：　");
						}
						assign.append(MessageFormat.format("#{0}，[{1}]{2}　　", item.get("id"), item.get("status"), item.get("title")));
					}
				}
				if (null != assign) {
					content.append(assign.toString());
				}
				if (null != solver) {
					content.append(solver.toString());
				}
				if(content.length() > 2){
					OsTongdaOAService.sendSms(userId + ",", "", DateUtils.format() + " 禅道任务提醒:　　　　　 　　" + content.toString());
				}
			} catch (Exception e) {
				logger.error("推送消息至OA失败：" + e.getMessage());
			}
		}
		
	}
	
}
