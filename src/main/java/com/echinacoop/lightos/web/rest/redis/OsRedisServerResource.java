package com.echinacoop.lightos.web.rest.redis;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.redis.OsRedisServer;
import com.echinacoop.lightos.service.redis.OsRedisServerService;
import com.echinacoop.lightos.service.redis.RedisService;
import com.echinacoop.lightos.web.rest.BaseController;
import com.yinsin.utils.CommonUtils;

/**
 * Redis服务器信息
 * @Time 2018-09-20 17:09:21
 * @Auto Generated
 */
@RestController
@RequestMapping("/redis")
public class OsRedisServerResource extends BaseController {
    private final static Logger logger = LoggerFactory.getLogger(OsRedisServerResource.class);
    
    @Resource
    OsRedisServerService osRedisServerService;
    
    @PostMapping("/loadList")
    @OperationRight("query")
    public Response loadList(@RequestParam String jsonValue) {
		Response res = new Response();
        JSONObject value = parseJsonValue(jsonValue);
        Argument arg = new Argument();
        arg.setPageable(value);
        arg = osRedisServerService.findAllForPager(arg);
        if(arg.isSuccess()){
        	res.success().setToRtn(arg.getPage());
        }
        return res;
    }
    
    @PostMapping("/get")
    @OperationRight("query")
    public Response get(@RequestParam String jsonValue) {
        Response res = new Response();
        JSONObject value = parseJsonValue(jsonValue);
        Argument arg = new Argument();
        arg.setRowId(value.getLong("rowId"));
        arg = osRedisServerService.findOne(arg);
        if(arg.isSuccess()){
        	res.success().setDataToRtn(arg.getObj());
        }
        return res;
    }
    
    @PostMapping("/add")
    @OperationRight("add")
    public Response add(@RequestParam String jsonValue) {
        Response res = new Response();
        OsRedisServer entity = parseJsonValueObject(jsonValue, OsRedisServer.class);
        Argument arg = new Argument();
        arg.setObj(entity);
        arg = osRedisServerService.save(arg);
        if(arg.isSuccess()){
        	res.success().setDataToRtn(arg.getObj());
        }
        return res;
    }
    
    @PostMapping("/edit")
    @OperationRight("edit")
    public Response edit(@RequestParam String jsonValue) {
        Response res = new Response();
        OsRedisServer entity = parseJsonValueObject(jsonValue, OsRedisServer.class);
        Argument arg = new Argument();
        arg.setObj(entity);
        arg = osRedisServerService.update(arg);
        if(arg.isSuccess()){
        	res.success().setDataToRtn(arg.getObj());
        }
        return res;
    }
    
    @PostMapping("/del")
    @OperationRight("del")
    public Response del(@RequestParam String jsonValue) {
        Response res = new Response();
        JSONObject value = parseJsonValue(jsonValue);
        Argument arg = new Argument();
        arg.setRowId(value.getLong("rowId"));
        arg = osRedisServerService.delete(arg);
        if(arg.isSuccess()){
        	res.success();
        }
        return res;
    }
    
    @PostMapping("/cmd")
    @OperationRight("cmd")
    public Response cmd(@RequestParam String jsonValue) {
        Response res = new Response();
        JSONObject value = parseJsonValue(jsonValue);
        Argument arg = new Argument();
        arg.setRowId(value.getLong("rowId"));
        arg = osRedisServerService.findOne(arg);
        if(arg.isSuccess()){
        	OsRedisServer osRedisServer = (OsRedisServer) arg.getObj();
        	String cmd = value.getString("cmd");
        	RedisService rs = RedisService.getInstance(osRedisServer.getIp(), osRedisServer.getPort(), osRedisServer.getPassword());
        	if(null != rs){
        		if("client".equals(cmd)){
        			res.success().setDataToRtn(rs.getRedisClients(true));
        		} else if("data".equals(cmd)){
        			res.success().setDataToRtn(rs.getRedisDatas(true));
        		} else if("info".equals(cmd)){
        			res.success().setDataToRtn(rs.getRedisInfo(true));
        		}
        	}
        }
        return res;
    }
    
    @PostMapping("/set")
    @OperationRight("cmd")
    public Response set(@RequestParam String jsonValue) {
        Response res = new Response();
        JSONObject value = parseJsonValue(jsonValue);
        String key = value.getString("key");
        if(CommonUtils.isNotBlank(key)){
        	Argument arg = new Argument();
        	arg.setRowId(value.getLong("rowId"));
        	arg = osRedisServerService.findOne(arg);
        	if(arg.isSuccess()){
        		OsRedisServer osRedisServer = (OsRedisServer) arg.getObj();
        		RedisService rs = RedisService.getInstance(osRedisServer.getIp(), osRedisServer.getPort(), osRedisServer.getPassword());
        		if(null != rs){
        			Object result = null;
        			String type = value.getString("type");
        			String v = value.getString("value");
        			if("append".equals(type)){
        				result = rs.append(key, v, true);
        			} else if("set".equals(type)){
        				result = rs.set(key, v, true);
        			} else if("del".equals(type)){
        				result = rs.del(key, true);
        			}
        			res.success().setDataToRtn(result);
        		}
        	}
        }
        return res;
    }

}