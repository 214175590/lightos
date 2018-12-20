package com.echinacoop.lightos.service.monitor;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.meeting.OsMeetingMgt;
import com.echinacoop.lightos.service.meeting.OsMeetingMgtService;
import com.yinsin.utils.DateUtils;

public class MeetingData {
	private static final Logger logger = LoggerFactory.getLogger(MeetingData.class);
	public static Map<Long, OsMeetingMgt> monitorItem = new HashMap<Long, OsMeetingMgt>();
	
	public static void reflush(List<OsMeetingMgt> dataList){
		if(null != dataList){
			monitorItem.clear();
			for(OsMeetingMgt obj : dataList){
				monitorItem.put(obj.getRowId(), obj);
			}
		}
	}
	
	public static OsMeetingMgt getServiceMonitor(Long rowId){
		return monitorItem.get(rowId);
	}
	
	public static Collection<OsMeetingMgt> getList(){
		return monitorItem.values();
	}
	
	@SuppressWarnings("unchecked")
	public static class MonitorThread implements Runnable {
		OsMeetingMgt monitor = null;
		OsMeetingMgtService meetingService;
		
		public MonitorThread(OsMeetingMgtService service, Argument arg){
			this.meetingService = service;
			this.monitor = (OsMeetingMgt) arg.getObj();
		}
		
		@Override
		public void run() {
			if(null != monitor){
				Argument arg = new Argument();
				arg.setRowId(monitor.getRowId());
				arg = meetingService.loadMeetUsers(arg);
				if(arg.isSuccess()){
					List<Map<String, String>> userList = (List<Map<String, String>>) arg.getDataForRtn();
					
					JSONObject json = OsTongdaOAService.getOnlinePersonnel();
					JSONArray arr = json.getJSONArray("children");
					Map<String, String> users = new HashMap<String, String>();
					if(null != arr && arr.size() > 0 && json.getBooleanValue("isFolder")){
						parseUsers(users, arr);
					}
					String userStr = "";
					for(Map<String, String> entry : userList){
						userStr += entry.get("name") + "，";
					}
					String userId = null;
					for(Map<String, String> entry : userList){
						userId = users.get(entry.get("name"));
						if(null != userId){
							noticeUser(userId, userStr);
						}
					}
				}
			}
		}
		
		public void noticeUser(String userId, String userStr){
			try {
				StringBuilder content = new StringBuilder();
				content.append("【会议主题】");
				content.append(monitor.getMeetSubject()).append("，");
				content.append("【会议时间】");
				String start = monitor.getMeetStart().substring(0, 2) + ":" + monitor.getMeetStart().substring(2);
				String end = monitor.getMeetEnd().substring(0, 2) + ":" + monitor.getMeetEnd().substring(2);
				content.append(monitor.getMeetDate()).append(" " + start).append(" - " + end).append("，");
				content.append("【会议室】").append(monitor.getBoardroomName()).append("，");
				content.append("【会议发起人】").append(monitor.getInitiatorName()).append("，");
				content.append("【会议记录人】").append(monitor.getConferenceClerkName()).append("（会议结束后请务必填报会议纪要，谢谢），");
				content.append("【与会人员】").append(userStr);
				content.append("【会议说明】").append(monitor.getMeetRemark()).append("。");
				if(content.length() > 2){
					OsTongdaOAService.sendSms(userId + ",", "", DateUtils.format() + " 会议提醒：　　　　　　　　　" + content.toString());
				}
			} catch (Exception e) {
				logger.error("推送消息至OA失败：" + e.getMessage());
			}
		}
		
		public void parseUsers(Map<String, String> users, JSONArray array){
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
		
	}
	
}
