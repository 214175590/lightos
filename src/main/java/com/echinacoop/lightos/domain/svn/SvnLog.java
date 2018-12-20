package com.echinacoop.lightos.domain.svn;

import java.util.Date;
import java.util.List;

import com.alibaba.fastjson.JSONObject;

public class SvnLog {
	private long version;
	private String desc;
	private String author;
	private Date date;
	private List<SvnLogFile> files;

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public List<SvnLogFile> getFiles() {
		return files;
	}

	public void setFiles(List<SvnLogFile> files) {
		this.files = files;
	}

	public static class SvnLogFile {
		private String path;
		private char type;
		private String kind;
		
		private String copyFormPath;
		private long copyFormVersion;

		public String getPath() {
			return path;
		}

		public void setPath(String path) {
			this.path = path;
		}

		public char getType() {
			return type;
		}

		public void setType(char type) {
			this.type = type;
		}

		public String getKind() {
			return kind;
		}

		public void setKind(String kind) {
			this.kind = kind;
		}

		public String getCopyFormPath() {
			return copyFormPath;
		}

		public void setCopyFormPath(String copyFormPath) {
			this.copyFormPath = copyFormPath;
		}

		public long getCopyFormVersion() {
			return copyFormVersion;
		}

		public void setCopyFormVersion(long copyFormVersion) {
			this.copyFormVersion = copyFormVersion;
		}
		
		@Override
		public String toString() {
			return JSONObject.toJSONString(this);
		}
	}

	@Override
	public String toString(){
		return JSONObject.toJSONString(this);
	}
}
