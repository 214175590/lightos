package com.echinacoop.lightos.socket.tcp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

import com.yinsin.other.LogHelper;

public class TcpPolicyThread extends Thread {

	private static final LogHelper logger = LogHelper.getLogger(TcpPolicyThread.class);

	private static ServerSocket serverSocket = null;
	static String xml = "<?xml version=\"1.0\"?><cross-domain-policy><site-control permitted-cross-domain-policies=\"all\"/><allow-access-from domain=\"*\" to-ports=\"*\"/></cross-domain-policy>\0";

	@Override
	public void run() {
		try {
			logger.info("start TcpPolicyThread...");
			if (serverSocket == null) {
				serverSocket = new ServerSocket(843);
			}
			while (true) {
				Socket socket = serverSocket.accept();
				logger.debug("Client request policy file:" + socket.getRemoteSocketAddress());
				BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
				PrintWriter pw = new PrintWriter(socket.getOutputStream());
				char[] by = new char[22];
				br.read(by, 0, 22);
				String s = new String(by);
				if (s.startsWith("<policy-fi")) {
					pw.print(xml);
					pw.flush();
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void sendPolicyFile(Socket socket, String str) {
		if (str.startsWith("<policy-fi")) {
			try {
				logger.debug("Client Request Policy File:" + socket.getRemoteSocketAddress());
				PrintWriter pw = new PrintWriter(socket.getOutputStream());
				pw.print(xml);
				pw.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

}
