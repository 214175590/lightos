package com.echinacoop.lightos.service.monitor;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.StatusTypeConstants;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.meeting.OsMeetingMgt;
import com.echinacoop.lightos.domain.monitor.OsCloudClock;
import com.echinacoop.lightos.domain.monitor.OsServiceMonitor;
import com.echinacoop.lightos.domain.monitor.OsZentaoTask;
import com.echinacoop.lightos.service.meeting.OsMeetingMgtService;
import com.echinacoop.lightos.service.util.ThreadPool;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

@Component
public class MonitorScheduledService {
	private static final Logger logger = LoggerFactory.getLogger(MonitorScheduledService.class);
	private static boolean monitorInited = false;
	private static boolean clockInited = false;
	private static boolean zentaoInited = false;
	
	private static boolean CUT_SERVICE = false;
	private static boolean CUT_CLOCK = false;
	private static boolean CUT_ZENTAO = false;
	private static boolean CUT_MEET = false;
	
	private static int RUN_TIME = 0;
	
	@Autowired
    OsServiceMonitorService osServiceMonitorServiceImpl;
	
	@Autowired
	OsCloudClockService osCloudClockServiceImpl;
	
	@Autowired
	OsZentaoTaskService ssZentaoTaskService;
	
	@Autowired
	OsMeetingMgtService osMeetingMgtService;
	
	static {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
	}
	
	// 每秒 * * * * * ? *
	@Scheduled(cron="0/1 * * * * ? ")
    public void scheduled(){
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(System.currentTimeMillis());
		int hour = cal.get(Calendar.HOUR_OF_DAY);
		int week = cal.get(Calendar.DAY_OF_WEEK) - 1;
		if(hour <= 8 || hour >= 20 || week == 0 || week == 6){
			return;
		}
		
		RUN_TIME ++;
		
		// 服务监控
		if(!CUT_SERVICE){
			ThreadPool.execute(new ServiceMonitorThread());
		}
		
		// 云闹钟监控
		if(!CUT_CLOCK){
			ThreadPool.execute(new CloudClockThread());
		}
		
		// 禅道监控
		if(!CUT_ZENTAO){
			ThreadPool.execute(new ZentaoThread());
		}
		
		if(RUN_TIME >= 60){
			RUN_TIME = 0;
			// 会议提醒监控
			if(!CUT_MEET){
				ThreadPool.execute(new MeetingThread());
			}
		}
		
    }
	
	public void notice(List<Map<String, Object>> mlist){
		Map<String, WSClient> clientMap = DataCache.getAllClient();
		if(null != clientMap){
			WSData wsData = new WSData();
			wsData.setUrl("monitor.check");
			Map<String, String> head = new HashMap<String, String>();
			head.put("type", "process");
			head.put("flag", "monitor");
			wsData.setHead(head);
			/*Map<String, Object> body = new HashMap<String, Object>();
			body.put("rowId", "" + monitor.getRowId());
			body.put("max", monitor.getTimes());
			body.put("now", now);*/
			wsData.setBody(mlist);
			for(Map.Entry<String, WSClient> entry : clientMap.entrySet()){
				try {
					entry.getValue().sendMessage(wsData);
				} catch (Exception e) {
				}
			}
		}
	}
	
	private class ServiceMonitorThread implements Runnable {

		@SuppressWarnings("unchecked")
		@Override
		public void run() {
			CUT_SERVICE = true;
			try {
				if (null != osServiceMonitorServiceImpl) {
					if (!monitorInited) {
						logger.debug("init monitor data....");
						OsTongdaOAService.loginOA();
						Argument arg = osServiceMonitorServiceImpl.findAll();
						if (arg.isSuccess()) {
							monitorInited = true;
							MonitorData.reflush((List<OsServiceMonitor>) arg.getDataForRtn());
						}
					}

					OsServiceMonitor monitor = null;
					JSONObject json = null;
					int num = 0;
					Iterator<JSONObject> ito = MonitorData.getList().iterator();
					Map<String, Object> body = null;
					List<Map<String, Object>> mlist = new ArrayList<Map<String, Object>>();
					while (ito.hasNext()) {
						json = ito.next();
						monitor = (OsServiceMonitor) json.get("item");
						if(null != monitor){
							num = json.getIntValue("time");
							num++;
							body = new HashMap<String, Object>();
							body.put("rowId", monitor.getRowId());
							body.put("max", monitor.getTimes());
							body.put("now", num);
							mlist.add(body);
							if (num >= monitor.getTimes()) {
								num = 0;
								ThreadPool.execute(new MonitorData.MonitorThread(osServiceMonitorServiceImpl, monitor));
							}
							json.put("time", num);
						}
					}
					notice(mlist);
				}
			} catch (Exception e) {
				logger.error("执行服务检测任务失败：" + e.getMessage(), e);
			}
			CUT_SERVICE = false;
		}
	}
	
	private class CloudClockThread implements Runnable {

		@SuppressWarnings("unchecked")
		@Override
		public void run() {
			CUT_CLOCK = true;
			try {
				if (null != osCloudClockServiceImpl) {
					if (!clockInited) {
						logger.debug("init clock data....");
						Argument arg = osCloudClockServiceImpl.findAll();
						if (arg.isSuccess()) {
							clockInited = true;
							CloudClockData.reflush((List<OsCloudClock>) arg.getDataForRtn());
						}
					}

					long time = 0, currTime = System.currentTimeMillis(), cha = 0;
					Iterator<OsCloudClock> ito = CloudClockData.getList().iterator();
					OsCloudClock monitor = null;
					while (ito.hasNext()) {
						monitor = ito.next();
						if(monitor.getStatus() == 1){
							time = CommonUtils.stringToLong(monitor.getExecTime());
							cha = (time - currTime)/1000;
							if (cha == 0 && time >= currTime) {
								ThreadPool.execute(new CloudClockData.MonitorThread(osCloudClockServiceImpl, monitor, true));
							} else if(currTime > time){
								ThreadPool.execute(new CloudClockData.MonitorThread(osCloudClockServiceImpl, monitor, false));
							}
						}
					}
				}
			} catch (Exception e) {
				logger.error("执行云闹钟任务失败：" + e.getMessage(), e);
			}
			CUT_CLOCK = false;
		}
	}
	
	
	private class ZentaoThread implements Runnable {

		@SuppressWarnings("unchecked")
		@Override
		public void run() {
			CUT_ZENTAO = true;
			try {
				if (null != ssZentaoTaskService) {
					Argument arg = null;
					if (!zentaoInited) {
						logger.debug("init zentao data....");
						OsZentaoService.loginZentao();
						arg = new Argument();
						arg = ssZentaoTaskService.findAll(arg);
						if (arg.isSuccess()) {
							zentaoInited = true;
							ZentaoData.reflush((List<OsZentaoTask>) arg.getDataForRtn());
						}
					}

					long time = 0, currTime = System.currentTimeMillis(), timecha = 0, cha = 0;
					Iterator<OsZentaoTask> ito = ZentaoData.getList().iterator();
					OsZentaoTask monitor = null;
					List<Map<String, String>> bugs = null;
					Map<String, List<Map<String, String>>> userBug = null;
					List<Map<String, String>> list = null;
					String plan = null;
					while (ito.hasNext()) {
						monitor = ito.next();
						if(monitor.getStatus() == 2){
							time = DateUtils.parse(DateUtils.format("yyyy-MM-dd") + " " + monitor.getFirstTime()).getTime();
							cha = Math.abs(time - currTime)/1000;
							timecha = (int)(cha % (monitor.getTimeInterval()/1000));
							if(cha == 0 || timecha == 0){
								bugs = OsZentaoService.getBugs(monitor.getProId());
								if(null != bugs){
									userBug = new HashMap<String, List<Map<String, String>>>();
									for(Map<String, String> bug : bugs){
										list = userBug.get(bug.get("assign"));
										if(null == list){
											list = new ArrayList<Map<String, String>>();
											userBug.put(bug.get("assign"), list);
										}
										plan = bug.get("plan");
										if(CommonUtils.isNotBlank(plan)){
											timecha = (currTime - monitor.getLastTime().getTime()) / (1000 * 60 * 60 * 24);
											if(("不予解决".equals(plan.trim()) || "无法重现".equals(plan.trim()) || "设计如此".equals(plan.trim())) 
													&& timecha < 15){ // 15天提醒一次
												continue;
											} else if("延期处理".equals(plan.trim()) && timecha < 7){ // 7天提醒一次
												continue;
											}
										}
										list.add(bug);
									}
									
									try {
										arg = new Argument();
										monitor.setLastTime(new Timestamp(System.currentTimeMillis()));
										arg.setObj(monitor);
										ssZentaoTaskService.save(arg);
									} catch (Exception e) {
										logger.error("修改禅道任务最后执行时间异常：" + e.getMessage(), e);
									}
									
									ThreadPool.execute(new ZentaoData.MonitorThread(ssZentaoTaskService, monitor, userBug));
								}
								
							}
							
						}
					}
				}
			} catch (Exception e) {
				logger.error("执行禅道任务监控失败：" + e.getMessage(), e);
			}
			CUT_ZENTAO = false;
		}
	}
	
	private class MeetingThread implements Runnable {

		@SuppressWarnings("unchecked")
		@Override
		public void run() {
			CUT_MEET = true;
			try {
				if (null != osMeetingMgtService) {
					logger.debug("load meeting data....");
					OsZentaoService.loginZentao();
					Argument arg = new Argument();
					arg = osMeetingMgtService.loadNeedNoticeMeeting(arg);
					if (arg.isSuccess()) {
						MeetingData.reflush((List<OsMeetingMgt>) arg.getDataForRtn());
					}

					long time = 0, currTime = System.currentTimeMillis(), timecha = 0;
					Iterator<OsMeetingMgt> ito = MeetingData.getList().iterator();
					OsMeetingMgt monitor = null;
					String times = null;
					while (ito.hasNext()) {
						monitor = ito.next();
						if(monitor.getStatus() == StatusTypeConstants.MEETINT_STATUS_WAIT){
							times = monitor.getMeetStart().substring(0, 2) + ":" + monitor.getMeetStart().substring(2) + ":00";
							time = DateUtils.parse(DateUtils.format("yyyy-MM-dd") + " " + times).getTime();
							timecha = (time - currTime)/1000;
							if(timecha > 0 && timecha < 120){ // 2分钟提醒
								arg = new Argument();
								arg.setRowId(monitor.getRowId());
								arg = osMeetingMgtService.getOne(arg);
								if(arg.isSuccess()){
									ThreadPool.execute(new MeetingData.MonitorThread(osMeetingMgtService, arg));
								}
							}
							
						}
					}
				}
			} catch (Exception e) {
				logger.error("执行会议前提醒任务失败：" + e.getMessage(), e);
			}
			CUT_MEET = false;
		}
	}
	
}
