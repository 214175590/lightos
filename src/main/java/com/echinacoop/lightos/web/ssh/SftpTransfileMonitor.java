package com.echinacoop.lightos.web.ssh;

import com.yisin.ssh2.jsch.SftpProgressMonitor;

public class SftpTransfileMonitor implements SftpProgressMonitor {
	private boolean finished = false;
	
	@Override
	public void init(int op, String src, String dest, long max) {
	}

	@Override
	public boolean count(long count) {
		return true;
	}

	@Override
	public void end() {
		finished = true;
	}
	
	public boolean isFinished(){
		return finished;
	}
	
}
