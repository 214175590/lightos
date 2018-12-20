package com.echinacoop.lightos.service.redis;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.domain.base.Argument;
import com.yinsin.utils.CommonUtils;

public class RedisService {
	private final static Logger logger = LoggerFactory.getLogger(RedisService.class);
	private static final int TIMEOUT = 3000;
	private Jedis jedis = null;
	
	private RedisService(String host, int port, String password){
		jedis = new Jedis(host, port, TIMEOUT, TIMEOUT);
		if (CommonUtils.isNotBlank(password)) {
			String auth = jedis.auth(password);
			logger.debug("auth==" + auth);
		}
	}
	
	public static RedisService getInstance(String host, int port, String password){
		return new RedisService(host, port, password);
	}
	
	public JSONObject getRedisInfo(boolean isClose){
		JSONObject jsonObject = new JSONObject();
		try {
			String result = jedis.info();
			if (CommonUtils.isNotEmpty(result)) {
				String[] datas = result.split("\r\n");
				String[] values = null;
				for (String data : datas) {
					if (CommonUtils.isNotEmpty(data) && !data.contains("#") && data.contains(":")) {
						values = data.split(":");
						jsonObject.put(values[0], values[1]);
					}
				}
			}
			if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取RedisInfo失败：" + e.getMessage(), e);
		}
		return jsonObject;
	}
	
	public JSONArray getRedisDatas(boolean isClose){
		JSONArray jsonObject = new JSONArray();
		try {
			Set<byte[]> keySet = jedis.keys("*".getBytes());
			byte[][] keys = keySet.toArray(new byte[keySet.size()][]);
			String key = "";
			Map<String, String> data = null;
	        for (int i = 0, k = keySet.size(); i < k; i++) {
        		try {
					key = new String(keys[i]);
					data = new HashMap<String, String>();
					data.put("k", key);
					data.put("v", jedis.get(key));
					jsonObject.add(data);
				} catch (Exception e) {
					data = new HashMap<String, String>();
					data.put("k", key);
					data.put("v", "DATA-ERROR:" + e.getMessage());
					jsonObject.add(data);
					logger.error(key + " data has Error：" + e.getMessage());
				}
	        }
	        if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return jsonObject;
	}
	
	public int getDataSize(boolean isClose){
		int size = 0;
		try {
			Set<byte[]> keySet = jedis.keys("*".getBytes());
			if(null != keySet){
				size = keySet.size();
			}
	        if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取DataSize失败：" + e.getMessage(), e);
		}
		return size;
	}
	
	public JSONArray getRedisClients(boolean isClose){
		JSONArray jsonObject = new JSONArray();
		try {
			String list = jedis.clientList();
			if(CommonUtils.isNotBlank(list)){
				String[] lines = list.split("\n");
				String[] arr = null, obj = null;
				Map<String, String> item = null;
				JSONArray items = null;
				for(String line : lines){
					arr = line.split(" ");
					items = new JSONArray();
					for(String str : arr){
						if(str.indexOf("=") > 0){
							obj = str.split("=");
							if(null != obj){
								item = new HashMap<String, String>();
								item.put("k", obj[0]);
								if(obj.length > 1){
									item.put("v", obj[1]);
								} else {
									item.put("v", "");
								}
								items.add(item);
							}
						}
					}
					jsonObject.add(items);
				}
			}
			if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return jsonObject;
	}
	
	public void close(){
		if(null != jedis && jedis.isConnected()){
			try {
				jedis.close();
			} catch (Exception e) {
			}
		}
	}
	
	public String set(String key, String value, boolean isClose){
		String res = null;
		try {
			res = jedis.set(key, value);
			if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return res;
	}
	
	public Object append(String key, String value, boolean isClose){
		try {
			Object res = null;
			if(jedis.exists(key)){
				res = jedis.append(key, value);
			} else {
				res = jedis.set(key, value);
			}
			if(isClose){
				jedis.close();
			}
			return res;
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return null;
	}
	
	public Argument set(Argument arg, boolean isClose){
		try {
			
			if(isClose){
				jedis.close();
			}
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return arg;
	}
	
	public Long del(String key, boolean isClose){
		try {
			Long index = jedis.del(key);
			if(isClose){
				jedis.close();
			}
			return index;
		} catch (Exception e) {
			logger.error("获取RedisDatas失败：" + e.getMessage(), e);
		}
		return 0L;
	}
}
