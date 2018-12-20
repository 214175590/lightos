package com.echinacoop.lightos.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.yinsin.security.Base64;
import com.yinsin.utils.CommonUtils;

public class CustomJWT {
	private final static Logger logger = LoggerFactory.getLogger(CustomJWT.class);

	/**
	 * jwt
	 */
	public static final String JWT_SECRET = "7786df7fc3a34e26a61c034d5ec8245d";
	public static final Long JWT_DAY_TTL = 24 * 60 * 60 * 1000L; // millisecond

	private static String profiles = "lightos";
	
	/** 从请求头的Token中解析出用户信息 */
	public static JSONObject getUserInfo(HttpServletRequest request){
		String token = request.getHeader("Authorization");
		return getUserInfo(token);
	}
	
	/** 从Token中解析出用户信息 */
	public static JSONObject getUserInfo(String token){
		try {
			if(CommonUtils.isNotBlank(token)){
				Claims c = parseJWT(token);
				long end = c.getExpiration().getTime();
				long start = System.currentTimeMillis();
				if(end > start){
					String sub = c.getSubject();
					JSONObject userInfo = JSONObject.parseObject(sub);
					if(null != userInfo && userInfo.getString("userId").equals(c.getId())){
						return userInfo;
					}
				}
			}
		} catch (Exception e) {
		}
		return null;
	}
	
	/** 生成Token */
	public static JSONObject getToken(String userId, String data) {
		JSONObject token = null;
		try {
			String access_token = CustomJWT.createJWT(userId, data, JWT_DAY_TTL * 3);
			String refresh_token = CustomJWT.createJWT(userId, "" + System.currentTimeMillis(), JWT_DAY_TTL);
			Claims c = parseJWT(refresh_token);
			token = new JSONObject();
			token.put("access_token", access_token);
			token.put("refresh_token", refresh_token);
			token.put("expires_in", c.getExpiration().getTime());
		} catch (Exception e) {
			logger.error("获取用户Token异常：" + e.getMessage(), e);
		}
		return token;
	}
	
	/** 刷新Token，延长会话时长 */
	public static JSONObject refreshToken(String tokenStr) {
		JSONObject token = null;
		try {
			Claims c = parseJWT(tokenStr);
			if(c != null){
				String userId = c.getId();
				JSONObject userData = DataCache.getUserDataByUserId(userId);
				if(null != userData){
					Object tokenOld = userData.remove("userToken");
					token = getToken(userId, userData.toJSONString());
					if(null != token){
						userData.put("userToken", token);
					} else {
						userData.put("userToken", tokenOld);
					}
				}
			}
		} catch (Exception e) {
			logger.error("刷新用户Token异常：" + e.getMessage(), e);
		}
		return token;
	}
	
	/** 验证Token是否有效 */
	public static boolean isValidate(String tokenStr) {
		boolean result = true;
		try {
			Claims c = parseJWT(tokenStr);
			if(c != null){
				long end = c.getExpiration().getTime();
				long start = System.currentTimeMillis();
				result = end > start;
			}
		} catch (Exception e) {
			logger.error("验证Token异常：" + e.getMessage(), e);
		}
		return result;
	}

	/**
	 * 由字符串生成加密key
	 * 
	 * @return
	 */
	private static SecretKey generalKey() {
		String stringKey = profiles + JWT_SECRET;
		byte[] encodedKey = Base64.getDecoder().decode(stringKey);
		SecretKey key = new SecretKeySpec(encodedKey, 0, encodedKey.length, "AES");
		return key;
	}

	/**
	 * 创建 jwt
	 * 
	 * @param id
	 * @param subject
	 * @param ttlMillis
	 * @return
	 * @throws Exception
	 */
	private static String createJWT(String id, String subject, long ttlMillis) throws Exception {
		SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
		long nowMillis = System.currentTimeMillis();
		Date now = new Date(nowMillis);
		SecretKey key = generalKey();
		JwtBuilder builder = Jwts.builder().setId(id).setIssuedAt(now)
				.setSubject(subject).signWith(signatureAlgorithm, key);
		if (ttlMillis >= 0) {
			long expMillis = nowMillis + ttlMillis;
			builder.setExpiration(new Date(expMillis));
		}
		return builder.compact();
	}

	/**
	 * 解密 jwt
	 * 
	 * @param jwt
	 * @return
	 * @throws Exception
	 */
	private static Claims parseJWT(String jwt) throws Exception {
		SecretKey key = generalKey();
		return Jwts.parser().setSigningKey(key).parseClaimsJws(jwt).getBody();
	}

	/*public static void main(String[] args) {
		try {
			MtaJWT jwt = new MtaJWT();
			String token = jwt.createJWT("10000001", "10000001|张三|zhangsan", JWT_DAY_TTL);
			System.out.println(token);

			Claims c = jwt.parseJWT(token);
			System.out.println(c.getId() + "\t" + c.getSubject() + "\t"
					+ DateUtils.format(c.getExpiration()) + "\t" + c.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
	}*/
}
