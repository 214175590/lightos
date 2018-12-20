package com.echinacoop.lightos.web.rest;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;
import java.util.Map;

import com.yinsin.utils.DateUtils;

public class RuntimeTest {
	public static void main(String[] args) {
		try {

			RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
			Runtime runtime = Runtime.getRuntime();

			// 空闲内存
			long freeMemory = runtime.freeMemory();
			System.out.println("空闲内存：" + byteToM(freeMemory) + " MB");
			// 内存总量
			long totalMemory = runtime.totalMemory();
			System.out.println("内存总量：" + byteToM(totalMemory) + " MB");
			// 最大允许使用的内存
			long maxMemory = runtime.maxMemory();
			System.out.println("最大允许使用的内存：" + byteToM(maxMemory) + " MB");
			// 操作系统
			System.out.println("操作系统：" + System.getProperty("os.name"));
			InetAddress localHost;
			try {
				localHost = InetAddress.getLocalHost();
				String hostName = localHost.getHostName();
				System.out.println("HostName：" + hostName);
				System.out.println("Host Address：" + localHost.getHostAddress());
			} catch (UnknownHostException e) {
				e.printStackTrace();
			}
			// 程序启动时间
			long startTime = runtimeMXBean.getStartTime();
			Date startDate = new Date(startTime);
			System.out.println("程序启动时间：" + DateUtils.format(startDate));
			// 类所在路径
			System.out.println("类所在路径：" + runtimeMXBean.getBootClassPath());
			// 程序运行时间
			System.out.println("程序运行时间：" + runtimeMXBean.getUptime());
			// 线程总数
			System.out.println("线程总数：" + ManagementFactory.getThreadMXBean().getThreadCount());
			System.out.println("进程ID：" + getPid());

			StackTraceElement[] stackElements = Thread.currentThread().getStackTrace();
			if (stackElements != null) {
				for (int i = 0; i < stackElements.length; i++) {
					System.out.println(stackElements[i].getClassName());
					System.out.println(stackElements[i].getFileName());
					System.out.println(stackElements[i].getLineNumber());
					System.out.println(stackElements[i].getMethodName());
					System.out.println("-----------------------------------");
				}
			}

			String msg = getJavaStackTrace();
			System.out.println(msg);
		} catch (Exception e1) {
			e1.printStackTrace();
		}
	}

	/**
	 * 获取线程快照信息
	 *
	 * @return
	 */
	public static String getJavaStackTrace() {
		StringBuffer msg = new StringBuffer();
		for (Map.Entry<Thread, StackTraceElement[]> stackTrace : Thread.getAllStackTraces().entrySet()) {
			Thread thread = (Thread) stackTrace.getKey();
			StackTraceElement[] stack = (StackTraceElement[]) stackTrace.getValue();
			/*if (thread.equals(Thread.currentThread())) {
				continue;
			}*/
			msg.append("\n 线程:").append(thread).append("\n");
			for (StackTraceElement element : stack) {
				msg.append("\t").append(element).append("\n");
			}
		}
		return msg.toString();
	}

	/**
	 * 把byte转换成M
	 * 
	 * @param bytes
	 * @return
	 */
	public static long byteToM(long bytes) {
		long kb = (bytes / 1024 / 1024);
		return kb;
	}

	/**
	 * 创建一个客户端ID
	 * 
	 * @param projectName
	 * @param ipAddress
	 * @return
	 */
	public static String makeClientId(String projectName, String ipAddress) {
		String t = projectName + ipAddress + new File("").getAbsolutePath();
		int client_id = t.hashCode();
		client_id = Math.abs(client_id);
		return String.valueOf(client_id);
	}

	/**
	 * 获取进程号，适用于windows与linux
	 * 
	 * @return
	 */
	public static long getPid() {
		try {
			String name = ManagementFactory.getRuntimeMXBean().getName();
			String pid = name.split("@")[0];
			return Long.parseLong(pid);
		} catch (NumberFormatException e) {
			e.printStackTrace();
			return 0;
		}
	}

}
