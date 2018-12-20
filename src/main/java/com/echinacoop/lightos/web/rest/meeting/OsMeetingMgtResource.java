package com.echinacoop.lightos.web.rest.meeting;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring4.SpringTemplateEngine;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.common.consts.StatusTypeConstants;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.config.Constants;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.meeting.OsBoardroom;
import com.echinacoop.lightos.domain.meeting.OsMeetingMgt;
import com.echinacoop.lightos.service.meeting.OsMeetingMgtService;
import com.echinacoop.lightos.service.monitor.MeetingData;
import com.echinacoop.lightos.service.monitor.OsTongdaOAService;
import com.echinacoop.lightos.service.util.ThreadPool;
import com.echinacoop.lightos.web.rest.BaseController;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.echinacoop.lightos.web.rest.util.Utils;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

/**
 * 会议管理表
 * @Time 2018-09-18 14:04:46
 * @Auto Generated
 */
@SuppressWarnings("unchecked")
@RestController
@RequestMapping("/meet")
public class OsMeetingMgtResource extends BaseController {
    private final static Logger logger = LoggerFactory.getLogger(OsMeetingMgtResource.class);
    
    private static Map<String, List<OsMeetingMgt>> MEET_MAP = new ConcurrentHashMap<String, List<OsMeetingMgt>>();
	private static boolean UPDATE = false;
	private static final Object lock = new Object();
	private boolean run = true;
    
    @Resource
    OsMeetingMgtService osMeetingMgtService;
    
    @Resource
    private SpringTemplateEngine templateEngine;
    
    @PostMapping("/loadMeetList")
    @OperationRight("query")
    public Response loadList(@RequestParam String jsonValue) {
    	Response res = new Response();
    	Argument arg = new Argument();
    	OsMeetingMgt meet = new OsMeetingMgt();
        JSONObject value = parseJsonValue(jsonValue);
        if (CommonUtils.isNotBlank(value.getString("date"))) {
			meet.setMeetDate(value.getString("date"));
		}
		if (null != value.getInteger("status")) {
			meet.setStatus(value.getIntValue("status"));
		}
		arg.setObj(meet);
		arg.setPageable(value);
		arg = osMeetingMgtService.findAllForPager(arg);
		if (arg.isSuccess()) {
			res.success().setDataToRtn(arg.getPage());
		}
		return res;
    }
    
    @RequestMapping("/loadUserMeetingList")
    @OperationRight("query")
	public Response loadUserMeetingList(@RequestParam String jsonValue) {
		Response res = new Response();
		try {
			User user = getUser();
			JSONObject param = parseJsonValue(jsonValue);
			OsMeetingMgt meet = new OsMeetingMgt();
			String mycreate = CommonUtils.excNullToString(param.getString("mycreate"), "");
			String status = CommonUtils.excNullToString(param.getString("status"), "");
			if(!StringConstant.ADMIN_ACCOUNT.equals(user.getAccount())){
				meet.setConferenceClerk(user.getRowId());
			}
			Argument arg = new Argument();
			if (CommonUtils.isNotBlank(param.getString("date"))) {
				meet.setMeetDate(param.getString("date"));
			}
			if (mycreate.equals("yes")) {
				meet.setInitiator(user.getRowId());
			}
			if (status.equals("now")) {
				Date day = new Date();
				meet.setMeetDate(DateUtils.format(day, "yyyy-MM-dd"));
				meet.setMeetEnd(DateUtils.format(day, "HHmm"));
			}
			arg.setObj(meet);
			arg.setPageable(param);
			arg = osMeetingMgtService.loadUserMeeting(arg);
			if (arg.isSuccess()) {
				res.success().setDataToRtn(arg.getPage());
			}
		} catch (Exception e) {
			logger.error("加载会议列表异常：" + e.getMessage(), e);
		}
		return res;
	}
    
    @PostMapping("/fillMinutes")
    @OperationRight("edit")
	public Response fillMeetingMinutes(@RequestParam String jsonValue) {
		Response res = new Response();
		User user = getUser();
		if (user != null) {
			JSONObject param = parseJsonValue(jsonValue);
			OsMeetingMgt meet = new OsMeetingMgt();
			meet.setRowId(param.getLong("id"));
			meet.setMeetMinutes(param.getString("meetMinutes"));
			if(CommonUtils.isNotBlank(meet.getMeetMinutes())){
				Argument arg = new Argument();
				arg.setRowId(meet.getRowId());
				arg = osMeetingMgtService.getOne(arg);
				if(arg.isSuccess()){
					meet = (OsMeetingMgt) arg.getObj();
					meet.setMeetMinutes(param.getString("meetMinutes"));
					meet.setStatus(StatusTypeConstants.MEETINT_STATUS_FINISHED);
					arg.setObj(meet);
					arg = osMeetingMgtService.updateMunites(arg);
					if(arg.isSuccess()){
						res.success();
					}
				}
			}
		}
		return res;
	}
	
    @PostMapping("/cancelMeeting")
    @OperationRight("del")
	public Response cancelOsMeetingMgt(@RequestParam String jsonValue) {
		Response res = new Response();
		User user = getUser();
		try {
			if (user != null) {
				JSONObject param = parseJsonValue(jsonValue);
				Long id = param.getLong("id");
				if(null != id && id > 0){
					OsMeetingMgt meet = new OsMeetingMgt();
					Argument arg = new Argument();
					arg.setRowId(id);
					arg = osMeetingMgtService.getOne(arg);
					if(arg.isSuccess()){
						meet = (OsMeetingMgt) arg.getObj();
						if(meet.getInitiator() == user.getRowId() || StringConstant.ADMIN_ACCOUNT.equals(user.getAccount())){
							meet.setStatus(StatusTypeConstants.MEETINT_STATUS_CANCEL);
							arg.setObj(meet);
							arg = osMeetingMgtService.updateMunites(arg);
							if(arg.isSuccess()){
								res.success();
							}
						} else {
							res.fail("只能由会议发起人取消");
						}
					}
				}
			}
		} catch (Exception e) {
			logger.error("会议取消失败", e);
		}
		return res;
	}
	
	@PostMapping("/loadTimeMeeting")
	@OperationRight("query")
	public Response loadTimeMeeting(@RequestParam String jsonValue) {
		Response res = new Response();
		try {
			JSONObject param = parseJsonValue(jsonValue);
			String meetDate = param.getString("meetDate");
			String meetStart = param.getString("meetStart");
			String meetEnd = param.getString("meetEnd");
			Long boardroom = param.getLong("boardroom");
			OsMeetingMgt meet = new OsMeetingMgt();
			meet.setMeetDate(meetDate);
			meet.setMeetStart(meetStart);
			meet.setMeetEnd(meetEnd);
			meet.setBoardroom(boardroom);
			Argument arg = new Argument();
			arg.setObj(meet);
			
			Response result = isExistForMeeting(arg);
			if(result.isSuccess()){
				res.success().setDataToRtn(arg.getDataForRtn());
			} else {
				res.success();
			}
		} catch (Exception e) {
			logger.error("加载时间段内会议信息", e);
		}
		return res;
	}
    
    @PostMapping("/get")
    @OperationRight("query")
    public Response get(@RequestParam String jsonValue) {
    	Response res = new Response();
		JSONObject param = parseJsonValue(jsonValue);
		Long rowId = param.getLong("id");
		if(null != rowId && rowId > 0){
			Argument arg = new Argument();
			arg.setRowId(rowId);
			arg = osMeetingMgtService.getOne(arg);
			if(arg.isSuccess()){
				res.success().setDataToRtn(arg.getObj());
				res.setToRtn("boardroom", arg.getRtn("boardroom"));
				res.setToRtn("member", arg.getRtn("member"));
			}
		}
		return res;
    }
    
    @RequestMapping("/add")
    @OperationRight("add")
    public Response add(@RequestParam String jsonValue) {
    	Response res = new Response();
		synchronized (lock) {
			UPDATE = true;
			User user = getUser();
			if (user != null) {
				JSONObject param = parseJsonValue(jsonValue);
				Object memObj = param.get("member");
				JSONArray member = null;
				if(null != memObj && memObj instanceof String){
					member = new JSONArray();
					member.add(memObj);
				} else if(null != memObj && memObj instanceof JSONArray){
					member = param.getJSONArray("member");
				}
				OsMeetingMgt meet = JSONUtils.toJavaObject(param, OsMeetingMgt.class);
				if(null != meet && null != member && !member.isEmpty()){
					Argument arg = new Argument();
					arg.setObj(meet);
					run = false;
					Response result = isExistForMeeting(arg);
					run = true;
					if(result.isSuccess()){
						res.fail().setDataToRtn(arg.getDataForRtn());
					} else {
						cacheData(meet);
						
						member.add(user.getRowId());
						
						meet.setInitiator(user.getRowId());
						meet.setStatus(StatusTypeConstants.MEETINT_STATUS_WAIT);
						
						arg = new Argument();
						arg.setObj(meet);
						arg.setToReq("member", member);
						arg.setToReq("userId", user.getRowId());
						arg = osMeetingMgtService.save(arg);
						if(arg.isSuccess()){
							meet = (OsMeetingMgt) arg.getObj();
							if(meet.getMailNotification() == 1){
								try {
									sendMail(meet.getRowId());
									/*arg.setRowId(meet.getRowId());
									arg = osMeetingMgtService.getOne(arg);
									if (arg.isSuccess()) {
										ThreadPool.execute(new MeetingData.MonitorThread(osMeetingMgtService, arg));
									}*/
								} catch (Exception e) {
								}
							}			
							res.success();
						}
					}
				}
			}
			UPDATE = false;
		}
		return res;
    }
    
    @RequestMapping("/edit")
    @OperationRight("edit")
    public Response edit(@RequestParam String jsonValue) {
    	Response res = new Response();
		synchronized (lock) {
			UPDATE = true;
			User user = getUser();
			JSONObject param = parseJsonValue(jsonValue);
			OsMeetingMgt meet = JSONUtils.toJavaObject(param, OsMeetingMgt.class);
			if(meet.getInitiator().equals(user.getRowId())){
				Argument arg = new Argument();
				arg.setObj(meet);
				run = false;
				Response result = isExistForMeeting(arg);
				run = true;
				if(result.isSuccess()){
					res.fail().setDataToRtn(arg.getDataForRtn());
				} else {
					cacheData(meet);
					
					Object memObj = param.get("member");
					JSONArray member = null;
					if(null != memObj && memObj instanceof String){
						member = new JSONArray();
						member.add(memObj);
					} else if(null != memObj && memObj instanceof JSONArray){
						member = param.getJSONArray("member");
					}
					if(null != meet && null != member && !member.isEmpty()){
						member.add(user.getRowId());
						meet.setInitiator(user.getRowId());
						arg = new Argument();
						arg.setObj(meet);
						arg.setToReq("member", member);
						arg.setToReq("userId", user.getRowId());
						arg = osMeetingMgtService.update(arg);
						if(arg.isSuccess()){
							meet = (OsMeetingMgt) arg.getObj();
							if(meet.getMailNotification() == 1){
								try {
									sendMail(meet.getRowId());
									/*arg.setRowId(meet.getRowId());
									arg = osMeetingMgtService.getOne(arg);
									if (arg.isSuccess()) {
										ThreadPool.execute(new MeetingData.MonitorThread(osMeetingMgtService, arg));
									}*/
								} catch (Exception e) {
								}
							}
							res.success();
						}
					}
				}
			} else {
				res.fail("只能由会议发起人修改");
			}
			UPDATE = false;
		}
		return res;
    }
    
    @RequestMapping("/del")
    @OperationRight("del")
    public Response del(@RequestParam String jsonValue) {
    	Response res = new Response();
    	JSONObject param = parseJsonValue(jsonValue);
    	Long rowId = param.getLong("rowId");
    	if(null != rowId && rowId > 0){
    		Argument arg = new Argument();
    		arg.setRowId(rowId);
    		arg = osMeetingMgtService.delete(arg);
    		if(arg.isSuccess()){
				res.success();
			}
    	}
    	return res;
    }
    
	/*public static String toJSONStringIgnoreTransient(Object object) {
        SerializeWriter out = new SerializeWriter();
        try {
            JSONSerializer serializer = new JSONSerializer(out);
            serializer.config(SerializerFeature.SkipTransientField, false);
            serializer.write(object);
            return out.toString();
        } finally {
            out.close();
        }
    }*/
    
    /** 发送邮件 */
	public void sendMail(final Long meetId){
		ThreadPool.execute(new Runnable() {
			
			@Override
			public void run(){
				try {
					Argument arg = new Argument();
					arg.setRowId(meetId);
					arg = osMeetingMgtService.getOne(arg);
					if(arg.isSuccess()){
						OsMeetingMgt meet = (OsMeetingMgt) arg.getObj();
						OsBoardroom boardroom = (OsBoardroom) arg.getRtn("boardroom");
								
						arg = new Argument();
						arg.setRowId(meetId);
						arg = osMeetingMgtService.loadMeetUsers(arg);
						if(arg.isSuccess()){
							List<Map<String, String>> userList = (List<Map<String, String>>) arg.getDataForRtn();
							if(null != userList && userList.size() > 0){
								String subject = meet.getMeetSubject() + " 通知，请各位提前做好会议准备并准时参加.";
								Locale locale = Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE);
						        Context context = new Context(locale);
						        String email = templateEngine.process("meetingEmail", context);
								Map<String, String> data = new HashMap<String, String>();
								data.put("meetSubject", meet.getMeetSubject());
								data.put("meetDate", meet.getMeetDate());
								data.put("meetStart", meet.getMeetStart().substring(0, 2) + ":" + meet.getMeetStart().substring(2));
								data.put("meetEnd", meet.getMeetEnd().substring(0, 2) + ":" + meet.getMeetEnd().substring(2));
								data.put("boardroom", boardroom.getRoomName());
								data.put("meetRemark", meet.getMeetRemark());
								StringBuilder member = new StringBuilder();
								String initiator = meet.getInitiatorName();
								String conferenceClerk = meet.getConferenceClerkName();
								Map<String, String> userMap = null;
								//List<Map<String, String>> toUser = new ArrayList<Map<String, String>>();
								String toUids = "";
								Map<String, String> users = OsTongdaOAService.getUserIds();
								for (int i = 0, k = userList.size(); i < k; i++) {
									userMap = userList.get(i);
									member.append("<div style='padding:2px 8px;float:left;line-height:20px;margin-right:5px;border:1px solid #dddddd;border-radius:5px;'>");
									member.append(userMap.get("name"));
									member.append("</div>");
									if(userMap.get("userId").equals(initiator)){
										initiator = userMap.get("name");
									} 
									if(userMap.get("userId").equals(conferenceClerk)){
										conferenceClerk = userMap.get("name");
									}
									/*if(userMap.containsKey("email") && CommonUtils.isNotBlank(userMap.get("email"))){
										toUser.add(userMap);
									}*/
									if(users.containsKey(userMap.get("name"))){
										toUids += users.get(userMap.get("name")) + ",";
									}
								}
								data.put("member", member.toString());
								
								data.put("initiator", initiator);
								data.put("conferenceClerk", conferenceClerk);
								String content = Utils.parseTemplate(email, data);
								/*if(toUser.size() > 0){
									EMailTool.getInstance().sendEMail("会议室系统", subject, content, userList, null, null);
								}*/
								OsTongdaOAService.sendEmail(toUids, "", subject, content);
							}
						}
					}
				} catch (Exception e) {
					logger.error("发送会议邮件错误：" + e.getMessage(), e);
				}
			}
		});
	}
    
    private Response isExistForMeeting(Argument arg) {
		Response res = new Response();
		while(UPDATE && run){
			try {
				Thread.sleep(300);
			} catch (Exception e) {
			}
		}
		res.success();
		try {
			OsMeetingMgt meet = (OsMeetingMgt) arg.getObj();
			logger.debug("====检查会议是否存在======>" + meet);
			List<OsMeetingMgt> meetList = MEET_MAP.get(meet.getBoardroom() + meet.getMeetDate());
			List<OsMeetingMgt> existList = new ArrayList<OsMeetingMgt>();
			if(null != meetList && meetList.size() > 0){
				int s1 = CommonUtils.stringToInt(meet.getMeetStart()),
						e1 = CommonUtils.stringToInt(meet.getMeetEnd()),
						s2 = 0, e2 = 0;
				for(OsMeetingMgt m : meetList){
					s2 = CommonUtils.stringToInt(m.getMeetStart());
					e2 = CommonUtils.stringToInt(m.getMeetEnd());
					if((s1 < s2 && e1 <= s2) || (e1 > e2 && s1 >= e2)){
						
					} else if(m.getRowId() != meet.getRowId() && null != meet.getRowId() && meet.getRowId() != 0){
						existList.add(m);
					}
				}
			}
			if(existList.size() == 0){
				arg = osMeetingMgtService.loadTimeMeeting(arg);
				if (arg.isSuccess()) {
					List<OsMeetingMgt> list = (List<OsMeetingMgt>) arg.getDataForRtn();
					if(list == null || list.size() == 0){
						res.fail();
					} else if(list.size() == 1){
						OsMeetingMgt meet2 = list.get(0);
						if(meet.getRowId() == meet2.getRowId()){
							res.fail();
						}
					} else {
						logger.debug("====在数据库中已查到重复记录======>" + existList);
					}
				}
			} else {
				logger.debug("====在内存中已查到重复记录======>" + existList);
				arg.setDataToRtn(existList);
			}
		} catch (Exception e) {
			res.success();
			logger.error("判断会议是否存在时异常：" + e.getMessage(), e);
		}
		return res;
	}
    
    private void cacheData(OsMeetingMgt obj){
		if(obj != null){
			User user = getUser();
			OsMeetingMgt meet = new OsMeetingMgt();
			meet.setRowId(obj.getRowId());
			meet.setInitiator(user.getRowId());
			meet.setInitiatorName(user.getName());
			meet.setMeetStart(obj.getMeetStart());
			meet.setMeetEnd(obj.getMeetEnd());
			meet.setBoardroom(obj.getBoardroom());
			meet.setMeetDate(obj.getMeetDate());
			List<OsMeetingMgt> meetList = MEET_MAP.get(meet.getBoardroom() + meet.getMeetDate());
			if(null == meetList){
				meetList = new ArrayList<OsMeetingMgt>();
			}
			meetList.add(meet);
			MEET_MAP.put(meet.getBoardroom() + meet.getMeetDate(), meetList);
		}
	}

}
