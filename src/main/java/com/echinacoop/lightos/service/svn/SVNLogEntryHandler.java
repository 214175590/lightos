package com.echinacoop.lightos.service.svn;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.tmatesoft.svn.core.ISVNLogEntryHandler;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNLogEntry;
import org.tmatesoft.svn.core.SVNLogEntryPath;

import com.echinacoop.lightos.domain.svn.SvnLog;
import com.yinsin.utils.CommonUtils;
import com.yinsin.utils.DateUtils;

public class SVNLogEntryHandler implements ISVNLogEntryHandler {
	private List<SvnLog> logList = null;
	private Date begin;
	private Date end;
	private String author;
	private long beginVer;
	private long endVer;
	
	public SVNLogEntryHandler(){
		
	}
	
	public SVNLogEntryHandler(List<SvnLog> logList, Date begin, Date end){
		this.logList = logList;
		this.begin = begin;
		this.end = end;
	}
	
	public SVNLogEntryHandler(List<SvnLog> logList, Date begin, Date end, long version){
		this.logList = logList;
		this.begin = begin;
		this.end = end;
		this.endVer = version;
	}
	
	public SVNLogEntryHandler(List<SvnLog> logList, long beginVer, long endVer){
		this.logList = logList;
		this.beginVer = beginVer;
		this.endVer = endVer;
	}
	
	public SVNLogEntryHandler(List<SvnLog> logList, long version){
		this.logList = logList;
		this.endVer = version;
	}
	
	public List<SvnLog> getLogList() {
		return logList;
	}

	public void setLogList(List<SvnLog> logList) {
		this.logList = logList;
	}

	public Date getBegin() {
		return begin;
	}

	public void setBegin(Date begin) {
		this.begin = begin;
	}

	public Date getEnd() {
		return end;
	}

	public void setEnd(Date end) {
		this.end = end;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public long getBeginVer() {
		return beginVer;
	}

	public void setBeginVer(long beginVer) {
		this.beginVer = beginVer;
	}

	public long getEndVer() {
		return endVer;
	}

	public void setEndVer(long endVer) {
		this.endVer = endVer;
	}

	@Override
	public void handleLogEntry(SVNLogEntry svnlogentry) throws SVNException {
		int filter = 0;
		if(null != begin){
			int begin1 = CommonUtils.objectToInt(DateUtils.format(svnlogentry.getDate(), "yyyyMMdd"));
			int begin2 = CommonUtils.objectToInt(DateUtils.format(begin, "yyyyMMdd"));
			if(begin1 < begin2){
				filter++;
			}
		}
		if(null != end){
			int begin1 = CommonUtils.objectToInt(DateUtils.format(svnlogentry.getDate(), "yyyyMMdd"));
			int begin2 = CommonUtils.objectToInt(DateUtils.format(end, "yyyyMMdd"));
			if(begin1 > begin2){
				filter++;
			}
		}
		if(0 != beginVer && svnlogentry.getRevision() < beginVer){
			filter++;
		}
		if(0 != endVer && svnlogentry.getRevision() > endVer){
			filter++;
		}
		if(null != author && !svnlogentry.getAuthor().equals(author)){
			filter++;
		}
		// 依据条件进行过滤
		if (filter == 0) {
			if(null == logList){
				logList = new ArrayList<SvnLog>();
			}
			logList.add(parse(svnlogentry));
		}
	}
	
	public SvnLog parse(SVNLogEntry svnlogentry){
		SvnLog log = new SvnLog();
		log.setVersion(svnlogentry.getRevision());
		log.setAuthor(svnlogentry.getAuthor());
		log.setDesc(svnlogentry.getMessage());
		log.setDate(svnlogentry.getDate());
		Iterator<?> paths;
		List<SvnLog.SvnLogFile> fileList = new ArrayList<SvnLog.SvnLogFile>();
		if ((svnlogentry.getChangedPaths() != null) && (!(svnlogentry.getChangedPaths().isEmpty()))) {
			SVNLogEntryPath path = null;
			SvnLog.SvnLogFile file = null;
			for (paths = svnlogentry.getChangedPaths().values().iterator(); paths.hasNext();) {
				path = (SVNLogEntryPath) paths.next();
				file = new SvnLog.SvnLogFile();
				file.setType(path.getType());
				file.setPath(path.getPath());
				file.setKind(path.getKind().toString());
				if(path.getCopyPath() != null){
					file.setCopyFormPath(path.getCopyPath());
					file.setCopyFormVersion(path.getCopyRevision());
				}
				fileList.add(file);
			}
			log.setFiles(fileList);
		}
		return log;
	}

}
