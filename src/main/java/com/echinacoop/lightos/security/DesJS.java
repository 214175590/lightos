package com.echinacoop.lightos.security;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

/**
 * JS解密工具类，主要是用来解密前端加密的参数
 * @author Yisin
 *
 */
public class DesJS {
	private static String js = ""
			+ "function des(key,message,encrypt,mode,iv){\n"
			+ "var spfunction1=new Array(0x1010400,0,0x10000,0x1010404,0x1010004,0x10404,0x4,0x10000,0x400,0x1010400,0x1010404,0x400,0x1000404,0x1010004,0x1000000,0x4,0x404,0x1000400,0x1000400,0x10400,0x10400,0x1010000,0x1010000,0x1000404,0x10004,0x1000004,0x1000004,0x10004,0,0x404,0x10404,0x1000000,0x10000,0x1010404,0x4,0x1010000,0x1010400,0x1000000,0x1000000,0x400,0x1010004,0x10000,0x10400,0x1000004,0x400,0x4,0x1000404,0x10404,0x1010404,0x10004,0x1010000,0x1000404,0x1000004,0x404,0x10404,0x1010400,0x404,0x1000400,0x1000400,0,0x10004,0x10400,0,0x1010004);\n"
			+ "var spfunction2=new Array(-0x7fef7fe0,-0x7fff8000,0x8000,0x108020,0x100000,0x20,-0x7fefffe0,-0x7fff7fe0,-0x7fffffe0,-0x7fef7fe0,-0x7fef8000,-0x80000000,-0x7fff8000,0x100000,0x20,-0x7fefffe0,0x108000,0x100020,-0x7fff7fe0,0,-0x80000000,0x8000,0x108020,-0x7ff00000,0x100020,-0x7fffffe0,0,0x108000,0x8020,-0x7fef8000,-0x7ff00000,0x8020,0,0x108020,-0x7fefffe0,0x100000,-0x7fff7fe0,-0x7ff00000,-0x7fef8000,0x8000,-0x7ff00000,-0x7fff8000,0x20,-0x7fef7fe0,0x108020,0x20,0x8000,-0x80000000,0x8020,-0x7fef8000,0x100000,-0x7fffffe0,0x100020,-0x7fff7fe0,-0x7fffffe0,0x100020,0x108000,0,-0x7fff8000,0x8020,-0x80000000,-0x7fefffe0,-0x7fef7fe0,0x108000);\n"
			+ "var spfunction3=new Array(0x208,0x8020200,0,0x8020008,0x8000200,0,0x20208,0x8000200,0x20008,0x8000008,0x8000008,0x20000,0x8020208,0x20008,0x8020000,0x208,0x8000000,0x8,0x8020200,0x200,0x20200,0x8020000,0x8020008,0x20208,0x8000208,0x20200,0x20000,0x8000208,0x8,0x8020208,0x200,0x8000000,0x8020200,0x8000000,0x20008,0x208,0x20000,0x8020200,0x8000200,0,0x200,0x20008,0x8020208,0x8000200,0x8000008,0x200,0,0x8020008,0x8000208,0x20000,0x8000000,0x8020208,0x8,0x20208,0x20200,0x8000008,0x8020000,0x8000208,0x208,0x8020000,0x20208,0x8,0x8020008,0x20200);\n"
			+ "var spfunction4=new Array(0x802001,0x2081,0x2081,0x80,0x802080,0x800081,0x800001,0x2001,0,0x802000,0x802000,0x802081,0x81,0,0x800080,0x800001,0x1,0x2000,0x800000,0x802001,0x80,0x800000,0x2001,0x2080,0x800081,0x1,0x2080,0x800080,0x2000,0x802080,0x802081,0x81,0x800080,0x800001,0x802000,0x802081,0x81,0,0,0x802000,0x2080,0x800080,0x800081,0x1,0x802001,0x2081,0x2081,0x80,0x802081,0x81,0x1,0x2000,0x800001,0x2001,0x802080,0x800081,0x2001,0x2080,0x800000,0x802001,0x80,0x800000,0x2000,0x802080);\n"
			+ "var spfunction5=new Array(0x100,0x2080100,0x2080000,0x42000100,0x80000,0x100,0x40000000,0x2080000,0x40080100,0x80000,0x2000100,0x40080100,0x42000100,0x42080000,0x80100,0x40000000,0x2000000,0x40080000,0x40080000,0,0x40000100,0x42080100,0x42080100,0x2000100,0x42080000,0x40000100,0,0x42000000,0x2080100,0x2000000,0x42000000,0x80100,0x80000,0x42000100,0x100,0x2000000,0x40000000,0x2080000,0x42000100,0x40080100,0x2000100,0x40000000,0x42080000,0x2080100,0x40080100,0x100,0x2000000,0x42080000,0x42080100,0x80100,0x42000000,0x42080100,0x2080000,0,0x40080000,0x42000000,0x80100,0x2000100,0x40000100,0x80000,0,0x40080000,0x2080100,0x40000100);\n"
			+ "var spfunction6=new Array(0x20000010,0x20400000,0x4000,0x20404010,0x20400000,0x10,0x20404010,0x400000,0x20004000,0x404010,0x400000,0x20000010,0x400010,0x20004000,0x20000000,0x4010,0,0x400010,0x20004010,0x4000,0x404000,0x20004010,0x10,0x20400010,0x20400010,0,0x404010,0x20404000,0x4010,0x404000,0x20404000,0x20000000,0x20004000,0x10,0x20400010,0x404000,0x20404010,0x400000,0x4010,0x20000010,0x400000,0x20004000,0x20000000,0x4010,0x20000010,0x20404010,0x404000,0x20400000,0x404010,0x20404000,0,0x20400010,0x10,0x4000,0x20400000,0x404010,0x4000,0x400010,0x20004010,0,0x20404000,0x20000000,0x400010,0x20004010);\n"
			+ "var spfunction7=new Array(0x200000,0x4200002,0x4000802,0,0x800,0x4000802,0x200802,0x4200800,0x4200802,0x200000,0,0x4000002,0x2,0x4000000,0x4200002,0x802,0x4000800,0x200802,0x200002,0x4000800,0x4000002,0x4200000,0x4200800,0x200002,0x4200000,0x800,0x802,0x4200802,0x200800,0x2,0x4000000,0x200800,0x4000000,0x200800,0x200000,0x4000802,0x4000802,0x4200002,0x4200002,0x2,0x200002,0x4000000,0x4000800,0x200000,0x4200800,0x802,0x200802,0x4200800,0x802,0x4000002,0x4200802,0x4200000,0x200800,0,0x2,0x4200802,0,0x200802,0x4200000,0x800,0x4000002,0x4000800,0x800,0x200002);\n"
			+ "var spfunction8=new Array(0x10001040,0x1000,0x40000,0x10041040,0x10000000,0x10001040,0x40,0x10000000,0x40040,0x10040000,0x10041040,0x41000,0x10041000,0x41040,0x1000,0x40,0x10040000,0x10000040,0x10001000,0x1040,0x41000,0x40040,0x10040040,0x10041000,0x1040,0,0,0x10040040,0x10000040,0x10001000,0x41040,0x40000,0x41040,0x40000,0x10041000,0x1000,0x40,0x10040040,0x1000,0x41040,0x10001000,0x40,0x10000040,0x10040000,0x10040040,0x10000000,0x40000,0x10001040,0,0x10041040,0x40040,0x10000040,0x10040000,0x10001000,0x10001040,0,0x10041040,0x41000,0x41000,0x1040,0x1040,0x40040,0x10000000,0x10041000);\n"
			+ "var keys=des_createKeys(key);\n"
			+ "var m=0,i,j,temp,temp2,right1,right2,left,right,looping;\n"
			+ "var cbcleft,cbcleft2,cbcright,cbcright2\n"
			+ "var endloop,loopinc;\n"
			+ "var len=message.length;\n"
			+ "var chunk=0;\n"
			+ "var iterations=keys.length==32?3 :9;\n"
			+ "if(iterations==3){looping=encrypt?new Array(0,32,2):new Array(30,-2,-2);}\n"
			+ "else{looping=encrypt?new Array(0,32,2,62,30,-2,64,96,2):new Array(94,62,-2,32,64,2,30,-2,-2);}\n"
			+ "message+=\"\0\0\0\0\0\0\0\0\";\n"
			+ "result=\"\";\n"
			+ "tempresult=\"\";\n"
			+ "if(mode==1){\n"
			+ "cbcleft=(iv.charCodeAt(m++)<<24)|(iv.charCodeAt(m++)<<16)|(iv.charCodeAt(m++)<<8)|iv.charCodeAt(m++);\n"
			+ "cbcright=(iv.charCodeAt(m++)<<24)|(iv.charCodeAt(m++)<<16)|(iv.charCodeAt(m++)<<8)|iv.charCodeAt(m++);\n"
			+ "m=0;\n"
			+ "}\n"
			+ "while(m<len){\n"
			+ "if(encrypt){\n"
			+ "left=(message.charCodeAt(m++)<<16)|message.charCodeAt(m++);\n"
			+ "right=(message.charCodeAt(m++)<<16)|message.charCodeAt(m++);\n"
			+ "}else{\n"
			+ "left=(message.charCodeAt(m++)<<24)|(message.charCodeAt(m++)<<16)|(message.charCodeAt(m++)<<8)|message.charCodeAt(m++);\n"
			+ "right=(message.charCodeAt(m++)<<24)|(message.charCodeAt(m++)<<16)|(message.charCodeAt(m++)<<8)|message.charCodeAt(m++);\n"
			+ "}\n"
			+ "if(mode==1){if(encrypt){left^=cbcleft;right^=cbcright;}else{cbcleft2=cbcleft;cbcright2=cbcright;cbcleft=left;cbcright=right;}}\n"
			+ "temp=((left>>>4)^right)&0x0f0f0f0f;right^=temp;left^=(temp<<4);\n"
			+ "temp=((left>>>16)^right)&0x0000ffff;right^=temp;left^=(temp<<16);\n"
			+ "temp=((right>>>2)^left)&0x33333333;left^=temp;right^=(temp<<2);\n"
			+ "temp=((right>>>8)^left)&0x00ff00ff;left^=temp;right^=(temp<<8);\n"
			+ "temp=((left>>>1)^right)&0x55555555;right^=temp;left^=(temp<<1);\n"
			+ "left=((left<<1)|(left>>>31));\n"
			+ "right=((right<<1)|(right>>>31));\n"
			+ "for(j=0;j<iterations;j+=3){\n"
			+ "endloop=looping[j+1];\n"
			+ "loopinc=looping[j+2];\n"
			+ "for(i=looping[j];i!=endloop;i+=loopinc){\n"
			+ "right1=right^keys[i];\n"
			+ "right2=((right>>>4)|(right<<28))^keys[i+1];\n"
			+ "temp=left;\n"
			+ "left=right;\n"
			+ "right=temp^(spfunction2[(right1>>>24)&0x3f]|spfunction4[(right1>>>16)&0x3f]|spfunction6[(right1>>>8)&0x3f]|spfunction8[right1&0x3f]|spfunction1[(right2>>>24)&0x3f]|spfunction3[(right2>>>16)&0x3f]|spfunction5[(right2>>>8)&0x3f]|spfunction7[right2&0x3f]);\n"
			+ "}\n"
			+ "temp=left;left=right;right=temp;\n"
			+ "}\n"
			+ "left=((left>>>1)|(left<<31));\n"
			+ "right=((right>>>1)|(right<<31));\n"
			+ "temp=((left>>>1)^right)&0x55555555;right^=temp;left^=(temp<<1);\n"
			+ "temp=((right>>>8)^left)&0x00ff00ff;left^=temp;right^=(temp<<8);\n"
			+ "temp=((right>>>2)^left)&0x33333333;left^=temp;right^=(temp<<2);\n"
			+ "temp=((left>>>16)^right)&0x0000ffff;right^=temp;left^=(temp<<16);\n"
			+ "temp=((left>>>4)^right)&0x0f0f0f0f;right^=temp;left^=(temp<<4);\n"
			+ "if(mode==1){if(encrypt){cbcleft=left;cbcright=right;}else{left^=cbcleft2;right^=cbcright2;}}\n"
			+ "if(encrypt){tempresult+=String.fromCharCode((left>>>24),((left>>>16)&0xff),((left>>>8)&0xff),(left&0xff),(right>>>24),((right>>>16)&0xff),((right>>>8)&0xff),(right&0xff));}\n"
			+ "else{tempresult+=String.fromCharCode(((left>>>16)&0xffff),(left&0xffff),((right>>>16)&0xffff),(right&0xffff));}\n"
			+ "encrypt?chunk+=16:chunk+=8;\n"
			+ "if(chunk==512){result+=tempresult;tempresult=\"\";chunk=0;}\n"
			+ "}\n"
			+ "return result+tempresult;\n"
			+ "}\n"
			+ "function des_createKeys(key){\n"
			+ "pc2bytes0=new Array(0,0x4,0x20000000,0x20000004,0x10000,0x10004,0x20010000,0x20010004,0x200,0x204,0x20000200,0x20000204,0x10200,0x10204,0x20010200,0x20010204);\n"
			+ "pc2bytes1=new Array(0,0x1,0x100000,0x100001,0x4000000,0x4000001,0x4100000,0x4100001,0x100,0x101,0x100100,0x100101,0x4000100,0x4000101,0x4100100,0x4100101);\n"
			+ "pc2bytes2=new Array(0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808,0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808);\n"
			+ "pc2bytes3=new Array(0,0x200000,0x8000000,0x8200000,0x2000,0x202000,0x8002000,0x8202000,0x20000,0x220000,0x8020000,0x8220000,0x22000,0x222000,0x8022000,0x8222000);\n"
			+ "pc2bytes4=new Array(0,0x40000,0x10,0x40010,0,0x40000,0x10,0x40010,0x1000,0x41000,0x1010,0x41010,0x1000,0x41000,0x1010,0x41010);\n"
			+ "pc2bytes5=new Array(0,0x400,0x20,0x420,0,0x400,0x20,0x420,0x2000000,0x2000400,0x2000020,0x2000420,0x2000000,0x2000400,0x2000020,0x2000420);\n"
			+ "pc2bytes6=new Array(0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002,0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002);\n"
			+ "pc2bytes7=new Array(0,0x10000,0x800,0x10800,0x20000000,0x20010000,0x20000800,0x20010800,0x20000,0x30000,0x20800,0x30800,0x20020000,0x20030000,0x20020800,0x20030800);\n"
			+ "pc2bytes8=new Array(0,0x40000,0,0x40000,0x2,0x40002,0x2,0x40002,0x2000000,0x2040000,0x2000000,0x2040000,0x2000002,0x2040002,0x2000002,0x2040002);\n"
			+ "pc2bytes9=new Array(0,0x10000000,0x8,0x10000008,0,0x10000000,0x8,0x10000008,0x400,0x10000400,0x408,0x10000408,0x400,0x10000400,0x408,0x10000408);\n"
			+ "pc2bytes10=new Array(0,0x20,0,0x20,0x100000,0x100020,0x100000,0x100020,0x2000,0x2020,0x2000,0x2020,0x102000,0x102020,0x102000,0x102020);\n"
			+ "pc2bytes11=new Array(0,0x1000000,0x200,0x1000200,0x200000,0x1200000,0x200200,0x1200200,0x4000000,0x5000000,0x4000200,0x5000200,0x4200000,0x5200000,0x4200200,0x5200200);\n"
			+ "pc2bytes12=new Array(0,0x1000,0x8000000,0x8001000,0x80000,0x81000,0x8080000,0x8081000,0x10,0x1010,0x8000010,0x8001010,0x80010,0x81010,0x8080010,0x8081010);\n"
			+ "pc2bytes13=new Array(0,0x4,0x100,0x104,0,0x4,0x100,0x104,0x1,0x5,0x101,0x105,0x1,0x5,0x101,0x105);\n"
			+ "var iterations=key.length>=24?3 :1;\n"
			+ "var keys=new Array(32 * iterations);\n"
			+ "var shifts=new Array(0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0);\n"
			+ "var lefttemp,righttemp,m=0,n=0,temp;\n"
			+ "for(var j=0;j<iterations;j++){\n"
			+ "left=(key.charCodeAt(m++)<<24)|(key.charCodeAt(m++)<<16)|(key.charCodeAt(m++)<<8)|key.charCodeAt(m++);\n"
			+ "right=(key.charCodeAt(m++)<<24)|(key.charCodeAt(m++)<<16)|(key.charCodeAt(m++)<<8)|key.charCodeAt(m++);\n"
			+ "temp=((left>>>4)^right)&0x0f0f0f0f;right^=temp;left^=(temp<<4);\n"
			+ "temp=((right>>>-16)^left)&0x0000ffff;left^=temp;right^=(temp<<-16);\n"
			+ "temp=((left>>>2)^right)&0x33333333;right^=temp;left^=(temp<<2);\n"
			+ "temp=((right>>>-16)^left)&0x0000ffff;left^=temp;right^=(temp<<-16);\n"
			+ "temp=((left>>>1)^right)&0x55555555;right^=temp;left^=(temp<<1);\n"
			+ "temp=((right>>>8)^left)&0x00ff00ff;left^=temp;right^=(temp<<8);\n"
			+ "temp=((left>>>1)^right)&0x55555555;right^=temp;left^=(temp<<1);\n"
			+ "temp=(left<<8)|((right>>>20)&0x000000f0);\n"
			+ "left=(right<<24)|((right<<8)&0xff0000)|((right>>>8)&0xff00)|((right>>>24)&0xf0);\n"
			+ "right=temp;\n"
			+ "for(i=0;i<shifts.length;i++){\n"
			+ "if(shifts[i]){left=(left<<2)|(left>>>26);right=(right<<2)|(right>>>26);}\n"
			+ "else{left=(left<<1)|(left>>>27);right=(right<<1)|(right>>>27);}\n"
			+ "left&=-0xf;right&=-0xf;\n"
			+ "lefttemp=pc2bytes0[left>>>28]|pc2bytes1[(left>>>24)&0xf]\n"
			+ "|pc2bytes2[(left>>>20)&0xf]|pc2bytes3[(left>>>16)&0xf]\n"
			+ "|pc2bytes4[(left>>>12)&0xf]|pc2bytes5[(left>>>8)&0xf]\n"
			+ "|pc2bytes6[(left>>>4)&0xf];\n"
			+ "righttemp=pc2bytes7[right>>>28]|pc2bytes8[(right>>>24)&0xf]\n"
			+ "|pc2bytes9[(right>>>20)&0xf]|pc2bytes10[(right>>>16)&0xf]\n"
			+ "|pc2bytes11[(right>>>12)&0xf]|pc2bytes12[(right>>>8)&0xf]\n"
			+ "|pc2bytes13[(right>>>4)&0xf];\n"
			+ "temp=((righttemp>>>16)^lefttemp)&0x0000ffff;\n"
			+ "keys[n++]=lefttemp^temp;keys[n++]=righttemp^(temp<<16);\n"
			+ "}\n"
			+ "}\n"
			+ "return keys;\n"
			+ "}\n"
			+ "function stringToHex(s){\n"
			+ "var r=\"\";\n"
			+ "var hexes=new Array(\"0\",\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\",\"9\",\"a\",\"b\",\"c\",\"d\",\"e\",\"f\");\n"
			+ "for(var i=0;i<(s.length);i++){r+=hexes[s.charCodeAt(i)>>4]+hexes[s.charCodeAt(i)&0xf];}\n"
			+ "return r;\n"
			+ "}\n"
			+ "function HexTostring(s){\n"
			+ "var r=\"\";\n"
			+ "for(var i=0;i<s.length;i+=2){\n"
			+ "var sxx=parseInt(s.substring(i,i+2),16);\n"
			+ "r+=String.fromCharCode(sxx);}\n"
			+ "return r;\n"
			+ "}\n"
			+ "function decrypt(enStr,key){\n"
			+ "	enStr=HexTostring(enStr);\n"
			+ "	var str=des(key,enStr,0,0);\n"
			+ "	return str;\n"
			+ "}\n"
			+ "function encrypt(enStr,key){\n"
			+ "	var str=des(key,enStr,1,0);\n"
			+ "	str=stringToHex(str);\n"
			+ "	return str;\n"
			+ "}";
	
    public static String encrypt(String str, String key) throws ScriptException, NoSuchMethodException {
        ScriptEngine engine = loadScriptEngine();
        Invocable invokeEngine = (Invocable) engine;
        Object encObj = invokeEngine.invokeFunction("encrypt", new Object[] { str, key });

        return String.valueOf(encObj);
    }

    private static ScriptEngine loadScriptEngine() {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("js");
        try {
            //InputStream is = DesJS.class.getClassLoader().getResourceAsStream("des.js");
            //engine.eval(new InputStreamReader(is));
        	engine.eval(js);
        } catch (ScriptException e) {
            e.printStackTrace();
        }
        return engine;
    }

    public static String decrypt(String str, String key) throws RuntimeException {
        try {
            ScriptEngine engine = loadScriptEngine();
            Invocable invokeEngine = (Invocable) engine;

            Object decObj = invokeEngine.invokeFunction("decrypt", new Object[] { str, key });

            String decStr = String.valueOf(decObj);
            int zeroChrIndex = decStr.indexOf(0);
            if (zeroChrIndex > 0) {
            	return decStr.substring(0, zeroChrIndex);
            } else { 
            	return decStr;
            }
        } catch (ScriptException e) {
            throw new RuntimeException(e.getMessage(), e);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
