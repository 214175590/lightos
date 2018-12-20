package com.echinacoop.lightos.security;

import java.util.Date;

/**
 * 此类维护前端请求参数加密、解密的key
 * 
 * @author Yisin
 *
 */
public class SecurityCode implements Runnable {
    
    // 编码表
    public static final char[] CODE_CHAR = {'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
        't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5',
        '6', '7', '8', '9'
    };
    
    /**
     * 加密因子，每日林晨4点钟时自动生成新值
     */
    private static String encryFactor = null;
    
    /**
     * 每50分钟检查下时间
     */
    private static long millis = 1000 * 60 * 50;
    
    public static String getEncryptKey(){
        if(encryFactor == null){
            encryFactor = createKey();
        }
        return encryFactor;
    }

    @SuppressWarnings("deprecation")
    @Override
    public void run() {
        
        Date day = null;
        while (true) {
            try {
                Thread.sleep(millis);

                day = new Date();
                // 林晨4点
                if (day.getHours() == 4) {
                    encryFactor = createKey();
                }
            } catch (Exception e) {
            }
        }

    }
    
    private static String createKey(){
        String key = "";
        int index = -1;
        for (int i = 0; i < 6; i++) {
            index = (int)(Math.random() * (CODE_CHAR.length - 1) + 1);
            key += CODE_CHAR[index];
        }
        return key;
    }

}
