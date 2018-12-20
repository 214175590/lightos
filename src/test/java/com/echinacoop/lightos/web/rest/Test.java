package com.echinacoop.lightos.web.rest;

import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.SocketException;
import java.util.List;
import java.util.Set;

import redis.clients.jedis.Jedis;

import com.alibaba.fastjson.JSONObject;
import com.yinsin.utils.ByteUtils;
import com.yinsin.utils.CommonUtils;

public class Test {

	public static void main(String[] args) throws SocketException, IOException {
		/*
		 * Calendar cal = Calendar.getInstance();
		 * cal.setTime(DateUtils.parse("2018-09-12 10:29:11"));
		 * System.out.println(DateUtils.getWeek());
		 * 
		 * System.out.println(cal.get(Calendar.DAY_OF_WEEK));
		 */

		/*Jedis jedis = new Jedis("192.168.20.96", 6379);
		jedis.connect();
		List<Object> list = jedis.getClient().getAll();
		System.out.println(list);*/
		getRedisConfigInfo("192.168.20.96", 6379);
	}

	public static void getRedisConfigInfo(String host, int port) {
		Jedis jedis = new Jedis(host, port, 5000);
		
		/*Set<byte[]> keySet = jedis.keys("*".getBytes());
		byte[][] keys = keySet.toArray(new byte[keySet.size()][]);
        // 获取所有value
        //byte[][] a = jedis.mget(keys).toArray(new byte[keySet.size()][]);
        // 打印key-value对
		String key = "";
        for (int i = 0; i < keySet.size(); ++i) {
        	try {
        		key = new String(keys[i]);
			    System.out.println(key + "---" + jedis.get(key));
			} catch (Exception e) {
			}
        }*/
        
        System.out.println(jedis.clientList());
		
		String result = jedis.info();
		if (CommonUtils.isNotEmpty(result)) {
			String[] datas = result.split("\r\n");
			JSONObject jsonObject = new JSONObject();
			for (String data : datas) {
				if (CommonUtils.isNotEmpty(data) && !data.contains("#") && data.contains(":")) {
					String[] values = data.split(":");
					if (values[0].equals("connected_clients")) {
						jsonObject.put("clientConnection", Integer.parseInt(values[1]));
					} else if (values[0].equals("total_commands_processed")) {
						jsonObject.put("totalCommands", Integer.parseInt(values[1]));
					} else if (values[0].equals("used_memory_peak_human")) {
						jsonObject.put("sysMemory", values[1].substring(0, values[1].length() - 1));
					} else if (values[0].equals("used_memory_human")) {
						jsonObject.put("usedMemory", values[1].substring(0, values[1].length() - 1));
					} else if (values[0].equals("keyspace_hits")) {
						jsonObject.put("keyHits", Double.parseDouble(values[1]));
					} else if (values[0].equals("keyspace_misses")) {
						jsonObject.put("keyMiss", Double.parseDouble(values[1]));
					} else if (values[0].equals("used_cpu_sys")) {
						jsonObject.put("usedSystemCPU", Double.parseDouble(values[1]));
					} else if (values[0].equals("used_cpu_user")) {
						jsonObject.put("usedHumanCPU", Double.parseDouble(values[1]));
					} else {
						jsonObject.put(values[0] + "-----", values[1]);
					}
				}
			}
			System.out.println(jsonObject);
		}
		jedis.close();
	}

	public static void test() {
		File[] roots = File.listRoots();// 获取磁盘分区列表
		for (File file : roots) {
			System.out.println(file.getPath() + "信息如下:");
			System.out.println("空闲未使用 = " + file.getFreeSpace() / 1024 / 1024 / 1024 + "G");// 空闲空间
			System.out.println("已经使用 = " + file.getUsableSpace() / 1024 / 1024 / 1024 + "G");// 可用空间
			System.out.println("总容量 = " + file.getTotalSpace() / 1024 / 1024 / 1024 + "G");// 总空间
			System.out.println();

		}
		OperatingSystemMXBean osmb = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
		System.out.println("系统物理内存总计：" + osmb.getAvailableProcessors());
		System.out.println("系统物理可用内存总计：" + osmb.getSystemLoadAverage());
	}

	private static String encode(String str) {
		return CommonUtils.toUTF8(str);
	}

}
