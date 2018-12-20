package com.echinacoop.lightos.socket;

import java.awt.Dimension;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.net.SocketException;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageTypeSpecifier;
import javax.imageio.ImageWriter;
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.plugins.jpeg.JPEGImageWriteParam;
import javax.imageio.stream.ImageOutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.w3c.dom.Element;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.service.util.ThreadPool;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.ProtocolType;
import com.echinacoop.lightos.socket.dto.UserState;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.yinsin.security.MD5;

public class WSUtils {
    private final static Logger log = LoggerFactory.getLogger(WSUtils.class);
    private static Map<String, Boolean> FILTER_REQ = new HashMap<String, Boolean>();
    
    static {
    	FILTER_REQ.put("user.login", true);
    }
    
    /**
     * 解析消息为WSMessage
     * 
     * @param wsMessage
     * @return WSMessage
     */
    public static WSData parseMessage(WebSocketMessage<?> wsMessage) {
        WSData data = null;
        if (wsMessage != null) {
            try {
                data = JSONUtils.toJavaObject(wsMessage.getPayload(), WSData.class);
            } catch (Exception e) {
            	log.error((String)wsMessage.getPayload(), e);
            	data = null;
            }
        }
        return data;
    }

    public static boolean sendMessage(WebSocketSession wsSession, WSData wsData) {
        boolean result = true;
        try {
            TextMessage msg = new TextMessage(JSONObject.toJSONString(wsData));
            wsSession.sendMessage(msg);
        } catch (IOException e) {
            result = false;
            //log.error("webSocket发送消息失败 ：" + e.getMessage(), e);
        }
        return result;
    }
    
    public static boolean sendMessage(WSClient client, WSData wsData) {
        boolean result = true;
        try {
            if(client.getType() == ProtocolType.TCP){
            	result = sendMessage(client.getSid(), client.getSocket(), wsData);
            	
            } else {
            	result = sendMessage(client.getWsSession(), wsData);
            }
        } catch (Exception e) {
            result = false;
            log.error("发送消息失败：" + e.getMessage(), e);
        }
        return result;
    }
    
    public static boolean sendMessage(String sid, Socket socket, WSData wsData) {
        boolean result = true;
        try {
            String data = JSONObject.toJSONString(wsData);
            OutputStream os = null;
			try {
				if(socket.isClosed()){
					throw new SocketException("Socket is closed" + wsData);
				} else {
					os = socket.getOutputStream();
					os.write(data.getBytes());
					os.flush();
					result = true;
				}
			} catch (Exception e) {
				result = false;
				String ip = socket.getRemoteSocketAddress().toString();
				WSClient client = DataCache.getWSClientBySessionId(sid);
				DataCache.removeUserData(client.getUserId());
				DataCache.removeWSClient(sid);
				throw new SocketException("发送数据到客户端出错：" + ip);
			}
            
            
        } catch (IOException e) {
            result = false;
        }
        return result;
    }

    public static boolean validateReq(String sid, WSData wsData) {
        boolean result = true;
        try {
        	String url = wsData.getUrl();
        	if(!FILTER_REQ.containsKey(url)){
        		WSClient client = DataCache.getWSClientBySessionId(sid);
        		JSONObject tokenJson = DataCache.getUserDataByUserId(StringConstant.ACCESS_TOKEN + client.getUserId());
        		JSONObject message = (JSONObject) wsData.getBody();
                String token = tokenJson.getString("access_token");
        		String id = MD5.md5(MD5.md5(token + client.getUserId()) + MD5.md5(client.getUserId() + token));
        		String ssid = message.getString("sid");
        		result = id.equalsIgnoreCase(ssid);
        	}
        } catch (Exception e) {
            result = false;
        }
        return result;
    }
    
    public static long getTime(){
        return System.currentTimeMillis();
    }

    public static UserState getUserState(String userId){
        UserState state = UserState.offline;
        JSONObject userData = DataCache.getUserDataByUserId(userId);
        if(null != userData){
            state = (UserState) userData.get("chatStatus");
        }
        return state;
    }
    
    public static JSONObject getApplyMessage(String code, String msgId){
        JSONObject res = new JSONObject();
        res.put("code", code);
        res.put("msgId", msgId);
        res.put("msg", MapContants.getMessage(code));
        return res;
    }
    
    /**
     * 等比例压缩算法： 
     * 算法思想：根据压缩基数和压缩比来压缩原图，生产一张图片效果最接近原图的缩略图
     * @param srcURL 原图地址
     * @param deskURL 缩略图地址
     * @param comBase 压缩基数
     * @param scale 压缩限制(宽/高)比例  一般用1：
     * 当scale>=1,缩略图height=comBase,width按原图宽高比例;若scale<1,缩略图width=comBase,height按原图宽高比例
     * @throws Exception
     * @author shenbin
     * @createTime 2014-12-16
     * @lastModifyTime 2014-12-16
     */
    public static Dimension saveMinPhoto(String srcURL, String deskURL, int comBase, float scale) throws Exception {
        File srcFile = new java.io.File(srcURL);
        Image src = ImageIO.read(srcFile);
        int srcHeight = src.getHeight(null);
        int srcWidth = src.getWidth(null);
        int deskHeight = 0;// 缩略图高
        int deskWidth = 0;// 缩略图宽
        double srcScale = (double) srcHeight / srcWidth;
        /**缩略图宽高算法*/
        if (srcHeight > comBase || srcWidth > comBase) {
            if (srcScale >= scale || 1 / srcScale > scale) {
                if (srcScale >= scale) {
                    deskHeight = comBase;
                    deskWidth = srcWidth * deskHeight / srcHeight;
                } else {
                    deskWidth = comBase;
                    deskHeight = srcHeight * deskWidth / srcWidth;
                }
            } else {
                if (srcHeight > comBase) {
                    deskHeight = comBase;
                    deskWidth = srcWidth * deskHeight / srcHeight;
                } else {
                    deskWidth = comBase;
                    deskHeight = srcHeight * deskWidth / srcWidth;
                }
            }
        } else {
            deskHeight = srcHeight;
            deskWidth = srcWidth;
        }
        BufferedImage tag = new BufferedImage(deskWidth, deskHeight, BufferedImage.TYPE_3BYTE_BGR);
        tag.getGraphics().drawImage(src, 0, 0, deskWidth, deskHeight, null); //绘制缩小后的图
        FileOutputStream deskImage = new FileOutputStream(deskURL); //输出到文件流
        //JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(deskImage);
        //encoder.encode(tag); //近JPEG编码
        saveAsJPEG(comBase, tag, scale, deskImage);
        
        return new Dimension(deskWidth, deskHeight);
    }
    
    /** 
     * 以JPEG编码保存图片 
     * @param dpi  分辨率 
     * @param image_to_save  要处理的图像图片 
     * @param JPEGcompression  压缩比 
     * @param fos 文件输出流 
     * @throws IOException 
     */  
    public static void saveAsJPEG(int dpi ,BufferedImage image_to_save, float JPEGcompression, FileOutputStream fos) throws IOException {  
            
        ImageWriter imageWriter  =   ImageIO.getImageWritersBySuffix("jpg").next();  
        ImageOutputStream ios  =  ImageIO.createImageOutputStream(fos);  
        imageWriter.setOutput(ios);  
        //and metadata  
        IIOMetadata imageMetaData  =  imageWriter.getDefaultImageMetadata(new ImageTypeSpecifier(image_to_save), null);  
           
        if(dpi != 0){  
        
            //new metadata  
            Element tree  =  (Element) imageMetaData.getAsTree("javax_imageio_jpeg_image_1.0");  
            Element jfif  =  (Element)tree.getElementsByTagName("app0JFIF").item(0);  
            jfif.setAttribute("Xdensity", Integer.toString(dpi) );  
            jfif.setAttribute("Ydensity", Integer.toString(dpi));  
        }  
        
        
        if(JPEGcompression >= 0 && JPEGcompression <= 1f){  
            // new Compression  
            JPEGImageWriteParam jpegParams  =  (JPEGImageWriteParam) imageWriter.getDefaultWriteParam();  
            jpegParams.setCompressionMode(JPEGImageWriteParam.MODE_EXPLICIT);  
            jpegParams.setCompressionQuality(JPEGcompression);  
        
        }  
        //new Write and clean up  
        imageWriter.write(imageMetaData, new IIOImage(image_to_save, null, null), null);  
        ios.close();  
        fos.flush();
        fos.close();
        imageWriter.dispose();
    }  
    
    /**
     * 推送用户状态更改消息
     * @param client
     * @param state
     */
    public static void pushUserChangeState(WSClient client, UserState state){
    	ThreadPool.execute(new Runnable() {
    		@Override
			public void run() {
				try {
					JSONObject userData = DataCache.getUserDataByUserId(client.getUserId());
			    	if(null != userData){
			    		userData.put("chatStatus", state);
			    	}
	        		WSData wsData = new WSData();
					wsData.setUrl("user.status");
					Map<String, String> head = new HashMap<String, String>();
					head.put("type", "status");
					head.put("flag", "net");
					wsData.setHead(head);
					Map<String, String> body = new HashMap<String, String>();
					body.put("state", state.toString());
					body.put("user", client.getUserId());
					wsData.setBody(body);
	        		
	        		Map<String, WSClient> clientMaps = DataCache.getAllClient();
	        		for(Map.Entry<String, WSClient> entry : clientMaps.entrySet()){
	        			try {
	        				if(client != entry.getValue()){
	        					entry.getValue().sendMessage(wsData);
	        				}
						} catch (Exception e) {
							log.error("发送用户上线消息失败：" + e.getMessage());
						}
	                }
		        } catch (Exception e) {
		        	log.error("推送用户上线消息失败：" + e.getMessage());
		        }
			}
		});
    }
    
}
