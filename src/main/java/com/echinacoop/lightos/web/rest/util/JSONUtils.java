package com.echinacoop.lightos.web.rest.util;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.yinsin.utils.CommonUtils;

public class JSONUtils { 
	private static Logger logger = LoggerFactory.getLogger(JSONUtils.class);

	@SuppressWarnings("unchecked")
	public static <T> T toJavaObject(Object obj, Class<T> clazz) {
		T t = null;
		try {
			JSONObject jsonObj = null;
			if ("JSONObject".equals(obj.getClass().getSimpleName())) {
				jsonObj = (JSONObject) obj;

				t = toJavaObject(jsonObj, clazz);
			} else if ("String".equals(obj.getClass().getSimpleName())) {
				jsonObj = JSONObject.parseObject(obj.toString());

				t = toJavaObject(jsonObj, clazz);
			} else {
				t = (T) obj;
			}
		} catch (Exception e) {
			logger.error("将json序列化成Java类失败：" + e.getMessage());
		}
		return t;
	}

	public static <T> T toJavaObject(String jsonStr, Class<T> classz) {
		JSONObject json = JSONObject.parseObject(jsonStr);
		return toJavaObject(json, classz);
	}

	private static <T> T toJavaObjectForFastJson(JSONObject json, Class<T> classz) {
		T t = null;
		try {
			t = JSONObject.toJavaObject(json, classz);
		} catch (Exception e) {
			t = null;
		}
		return t;
	}

	public static <T> T toJavaObject(JSONObject json, Class<T> classz) {
		T t = null;
		try {
			t = toJavaObjectForFastJson(json, classz);
			if (t == null) {
				t = classz.newInstance();
				t = setObjectField(t, json);
			}
		} catch (Exception e) {
			logger.error("将json序列化成Java类失败：" + e.getMessage());
		}
		return t;
	}
	
	public static Object convertJavaObject(JSONObject json, Class<?> classz) {
		Object t = null;
		try {
			t = toJavaObjectForFastJson(json, classz);
			if (t == null) {
				t = classz.newInstance();
				t = setObjectField(t, json);
			}
		} catch (Exception e) {
			logger.error("将json序列化成Java类失败：" + e.getMessage());
		}
		return t;
	}

	private static <T> T setObjectField(T t, JSONObject json) {
		Field[] fields = t.getClass().getDeclaredFields();
		String feildName = "", typeName = "", generTypeName = "", setMethod = "", className = "";
		Object obj = null, value = null;
		JSONArray jarr = null;
		Method method = null;
		List<Object> objList = null;
		Object[] objArr = null;
		int[] intArr = null;
		double[] doubleArr = null;
		float[] floatArr = null;
		Class<?> cla = null;
		for (Field field : fields) {
			feildName = field.getName();
			typeName = field.getType().getName();
			generTypeName = field.getGenericType().toString();
			setMethod = "set" + CommonUtils.firstCharToUpperCase(feildName);
			value = json.get(feildName);
			try {
				if ("java.lang.String".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { String.class });
					method.invoke(t, new Object[] { CommonUtils.objectToString(value) });
				} else if ("java.lang.Integer".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { Integer.class });
					method.invoke(t, new Object[] { CommonUtils.objectToInt(json.get(feildName)) });
				} else if ("java.lang.Long".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { Long.class });
					method.invoke(t, new Object[] { CommonUtils.objectToLong(json.get(feildName)) });
				} else if ("java.lang.Double".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { Double.class });
					method.invoke(t, new Object[] { CommonUtils.objectToDouble(json.get(feildName)) });
				} else if ("java.math.BigDecimal".equals(typeName)) {
                    method = t.getClass().getMethod(setMethod, new Class[] { BigDecimal.class });
                    method.invoke(t, new Object[] { new BigDecimal(CommonUtils.objectToDouble(json.get(feildName))) });
                } else if ("java.lang.Float".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { Float.class });
					method.invoke(t, new Object[] { CommonUtils.objectToFloat(json.get(feildName)) });
				} else if ("java.lang.Boolean".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { Boolean.class });
					boolean bool = CommonUtils.objectToString(json.get(feildName), "false").equalsIgnoreCase("true");
					method.invoke(t, new Object[] { bool });
				} else if ("java.util.List".equals(typeName)) {
					className = getClassName(generTypeName);
					cla = Class.forName(className);
					method = t.getClass().getMethod(setMethod, new Class[] { List.class });
					if (value != null) {
						objList = new ArrayList<Object>();
						jarr = json.getJSONArray(feildName);
						for (int i = 0, k = jarr.size(); i < k; i++) {
							obj = cla.newInstance();
							if ("java.lang.String".equals(className) || "java.lang.Integer".equals(className)
									|| "java.lang.Double".equals(className) || "java.lang.Float".equals(className)) {
								obj = jarr.getJSONObject(i);
							} else {
								obj = setObjectField(obj, jarr.getJSONObject(i));
							}
							objList.add(obj);
						}
					} else {
						objList = null;
					}
					method.invoke(t, new Object[] { objList });
				} else if ("[L".equals(typeName)) {
					className = getClassName(generTypeName);
					cla = Class.forName(className);
					method = t.getClass().getMethod(setMethod, new Class[] { cla });
					if (value != null) {
						jarr = json.getJSONArray(feildName);
						objArr = new Object[jarr.size()];
						for (int i = 0, k = jarr.size(); i < k; i++) {
							obj = cla.newInstance();
							if ("java.lang.String".equals(className) || "java.lang.Integer".equals(className)
									|| "java.lang.Double".equals(className) || "java.lang.Float".equals(className)) {
								obj = jarr.getJSONObject(i);
							} else {
								obj = setObjectField(obj, jarr.getJSONObject(i));
							}
							objArr[i] = obj;
						}
					} else {
						objArr = null;
					}
					method.invoke(t, new Object[] { objArr });
				} else if ("[I".equals(typeName) || "[D".equals(typeName) || "[F".equals(typeName)) {
					if (value != null) {
						jarr = json.getJSONArray(feildName);
						if("[I".equals(typeName)){
							method = t.getClass().getMethod(setMethod, new Class[] { int[].class });
							intArr = new int[jarr.size()];
						} else if("[D".equals(typeName)){
							method = t.getClass().getMethod(setMethod, new Class[] { double[].class });
							doubleArr = new double[jarr.size()];
						} else if("[F".equals(typeName)){
							method = t.getClass().getMethod(setMethod, new Class[] { float[].class });
							floatArr = new float[jarr.size()];
						}
						for (int i = 0, k = jarr.size(); i < k; i++) {
							if("[I".equals(typeName)){
								intArr[i] = jarr.getInteger(i);
							} else if("[D".equals(typeName)){
								doubleArr[i] = jarr.getDoubleValue(i);
							} else if("[F".equals(typeName)){
								floatArr[i] = jarr.getFloatValue(i);
							}
						}
					} else {
						intArr = null;
						doubleArr = null;
						floatArr = null;
					}
					if("[I".equals(typeName)){
						method.invoke(t, new Object[] { intArr });
					} else if("[D".equals(typeName)){
						method.invoke(t, new Object[] { doubleArr });
					} else if("[F".equals(typeName)){
						method.invoke(t, new Object[] { floatArr });
					}
				} else if ("int".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { int.class });
					method.invoke(t, new Object[] { CommonUtils.objectToInt(json.get(feildName)) });
				} else if ("double".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { double.class });
					method.invoke(t, new Object[] { CommonUtils.objectToDouble(json.get(feildName)) });
				} else if ("float".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { float.class });
					method.invoke(t, new Object[] { CommonUtils.objectToFloat(json.get(feildName)) });
				} else if ("boolean".equals(typeName)) {
					method = t.getClass().getMethod(setMethod, new Class[] { boolean.class });
					boolean bool = CommonUtils.objectToString(json.get(feildName), "false").equalsIgnoreCase("true");
					method.invoke(t, new Object[] { bool });
				} else {
					if (value != null) {
						cla = Class.forName(typeName);
						obj = cla.newInstance();
						if (!"{}".equals(value.toString())) {
							obj = setObjectField(obj, (JSONObject) value);
						}
						method = t.getClass().getMethod(setMethod, new Class[] { cla });
						method.invoke(t, new Object[] { obj });
					}
				}
			} catch (Exception e) {
				logger.error("将json序列化成Java类失败：" + e.getMessage());
			}
		}
		return t;
	}
	
	public static String[] getJSONObjectKeys(JSONObject json, String[] filter) {
	    Iterator<String> ketIte = json.keySet().iterator();
	    String key = null, fkey = null;
	    boolean not = false;
	    int size = filter == null ? 0 : filter.length;
	    List<String> keyList = new ArrayList<String>();
	    while(ketIte.hasNext()){
	        key = ketIte.next();
	        not = false;
            for (int i = 0; i < size; i++) {
                fkey = filter[i];
                if(key.equals(fkey)){
                    not = true;
                    break;
                }
            }
            if(!not){
                keyList.add(key);
            }
	    }
	    String[] keyArr = new String[keyList.size()];
	    for (int i = 0, k = keyArr.length; i < k; i++) {
	        keyArr[i] = keyList.get(i);
	    }
	    return keyArr;
	}

	private static String getClassName(String str) {
		String className = null;
		if (str != null && str.indexOf("<") != -1) {
			className = str.substring(str.indexOf("<") + 1, str.length() - 1);
		}
		return className;
	}

}
