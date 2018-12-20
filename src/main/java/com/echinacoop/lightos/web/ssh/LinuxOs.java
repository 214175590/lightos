package com.echinacoop.lightos.web.ssh;

import com.echinacoop.lightos.domain.base.Argument;
import com.yisin.ssh2.SshShell;
import com.yisin.ssh2.jsch.Channel;
import com.yisin.ssh2.jsch.ChannelSftp;
import com.yisin.ssh2.jsch.Session;

@SuppressWarnings("serial")
public class LinuxOs implements java.io.Serializable {

	private SshShell shell = null;
	private Session session = null;
	private Channel channel = null;
	private ChannelSftp sftp = null;

	public Argument connection(String host, String user, String pwd, int port){
		Argument arg = new Argument();
		try {
			shell = new SshShell(host, user, pwd);

			shell.Connect(port);

			session = shell.getSession();

			// Open a new Shell channel on the SSH session
			channel = shell.getChannel();
			sftp = (ChannelSftp) session.openChannel("sftp");
			sftp.connect();
			if(channel.isConnected()){
				arg.success();
			}
		} catch (Exception e) {
			arg.fail(e.getMessage());
		}
		return arg;
	}

	public void close() {
		try {
			channel.disconnect();
			session.disconnect();
			shell.Close();
		} catch (Exception e) {
		}
	}

	public SshShell getShell() {
		return shell;
	}

	public void setShell(SshShell shell) {
		this.shell = shell;
	}

	public Session getSession() {
		return session;
	}

	public void setSession(Session session) {
		this.session = session;
	}

	public Channel getChannel() {
		return channel;
	}

	public void setChannel(Channel channel) {
		this.channel = channel;
	}

	public ChannelSftp getSftp() {
		return sftp;
	}

	public void setSftp(ChannelSftp sftp) {
		this.sftp = sftp;
	}

}
