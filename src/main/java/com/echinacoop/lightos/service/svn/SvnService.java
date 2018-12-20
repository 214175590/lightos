package com.echinacoop.lightos.service.svn;

import java.io.ByteArrayOutputStream;
import java.nio.charset.Charset;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.wc.SVNInfo;
import org.tmatesoft.svn.core.wc.SVNRevision;

import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.svn.OsSvnUser;
import com.echinacoop.lightos.repository.svn.OsSvnUserRepository;
import com.echinacoop.lightos.security.DesJS;
import com.yinsin.other.LogHelper;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

@Service
public class SvnService {
	private static LogHelper logger = LogHelper.getLogger(SvnService.class);
	private OsSvnUser user = null;
	
	@Autowired
	private OsSvnUserRepository userRep;

	public SvnUtils getSvnUtils(Long userId) throws Exception {
		SvnUtils utils = null;
		if(null == user){
			user = userRep.findByUserId(userId);
			if(null != user){
				try {
					user.setPassword(DesJS.decrypt(user.getPassword(), user.getUsername()));
				} catch (Exception e) {
				}
			} else {
				throw new Exception("缺少Svn账户密码");
			}
		}
		utils = new SvnUtils(user);
		return utils;
	}
	
	public SVNURL getSvnURL(String uri) throws SVNException{
		return SVNURL.parseURIEncoded(uri);
	}
	
	public Argument getProjectLog(Argument arg){
		try {
			Long userId = arg.getLongForReq("userId");
			String path = arg.getStringForReq("path");
			Long startVer = arg.getLongForReq("startVersion");
			Long endVer = arg.getLongForReq("endVersion");
			String startDateStr = arg.getStringForReq("beginDate");
			String endDateStr = arg.getStringForReq("endDate");
			String author = arg.getStringForReq("author");
			SVNRevision startVersion = null, endVersion = null;
			SVNLogEntryHandler handler = new SVNLogEntryHandler();
			if(null != startVer && startVer > 0){
				handler.setBeginVer(startVer);
				startVersion = SVNRevision.create(startVer);
			}
			if(null != endVer && endVer > 0){
				handler.setEndVer(endVer);
				endVersion = SVNRevision.create(endVer);
			}
			if(CommonUtils.isNotBlank(startDateStr)){
				handler.setBegin(DateUtils.parse(startDateStr, "yyyy-MM-dd"));
			}
			if(CommonUtils.isNotBlank(endDateStr)){
				handler.setEnd(DateUtils.parse(endDateStr, "yyyy-MM-dd"));
			}
			if(CommonUtils.isNotBlank(author)){
				handler.setAuthor(author);
			}
			SVNURL url = getSvnURL(path);
			SvnUtils utils = getSvnUtils(userId);
			utils.doLog(url, null, startVersion, endVersion, -1, handler);
			if(handler.getLogList() != null){
				arg.success().setDataToRtn(handler.getLogList());
			}
		} catch (Exception e) {
			logger.error("获取path日志异常：" + arg.getStringForReq("path"), e);
		}
		return arg;
	}

	public Argument getFileContent(Argument arg){
		try {
			Long userId = arg.getLongForReq("userId");
			String path = arg.getStringForReq("path");
			SVNURL url = getSvnURL(path);
			long version = arg.getLongForReq("version");
			SVNRevision svnr = null;
			if(version > 0){
				svnr = SVNRevision.create(version);
			}
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			getSvnUtils(userId).doGetFileContent(url, svnr, outputStream); 
			String doc = new String(outputStream.toByteArray(), Charset.forName("utf-8"));
			if(doc != null){
				arg.success().setDataToRtn(doc);
			}
		} catch (Exception e) {
			logger.error("获取文件内容日志异常：" + arg.getStringForReq("path"), e);
		}
		return arg;
	}
	
	public Argument getNewestVersion(Argument arg){
		try {
			Long userId = arg.getLongForReq("userId");
			String path = arg.getStringForReq("path");
			SVNURL url = getSvnURL(path);
			long version = arg.getLongForReq("version");
			SVNRevision svnr = null;
			if(version > 0){
				svnr = SVNRevision.create(version);
			}
			SVNInfo info = getSvnUtils(userId).doGetInfo(null, url, svnr);
			if(info != null){
				arg.success().setDataToRtn(info.getCommittedRevision().getNumber());
			}
		} catch (Exception e) {
			logger.error("获取path最新版本异常：" + arg.getStringForReq("path"), e);
		}
		return arg;
	}
	
	public Argument getPathDiff(Argument arg){
		try {
			Long userId = arg.getLongForReq("userId");
			String path = arg.getStringForReq("path");
			SVNURL url = getSvnURL(path);
			long v1 = arg.getLongForReq("version1");
			long v2 = arg.getLongForReq("version2");
			SVNRevision svnr1 = null;
			SVNRevision svnr2 = null;
			if(v1 > 0){
				svnr1 = SVNRevision.create(v1);
			}
			if(v2 > 0){
				svnr2 = SVNRevision.create(v2);
			}
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			getSvnUtils(userId).doDiff(url, svnr1, svnr2, outputStream);
			String doc = new String(outputStream.toByteArray(), Charset.forName("utf-8"));
			if(doc != null){
				arg.success().setDataToRtn(doc);
			}
		} catch (Exception e) {
			logger.error("获取path变更数据异常：" + arg.getStringForReq("path"), e);
		}
		return arg;
	}
	
}
