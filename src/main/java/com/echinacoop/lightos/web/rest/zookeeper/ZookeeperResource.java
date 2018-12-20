package com.echinacoop.lightos.web.rest.zookeeper;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.aop.http.OperationRight;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.zookeeper.ZkServerInfo;
import com.echinacoop.lightos.service.zookeeper.ZkServerInfoService;
import com.echinacoop.lightos.web.rest.BaseController;

@Api("Zookeeper Rest接口")
@RestController
@RequestMapping("/zk")
public class ZookeeperResource extends BaseController {

	private static final Logger logger = LoggerFactory.getLogger(ZookeeperResource.class);

	private final ZkServerInfoService zkServerInfoService;

	public ZookeeperResource(ZkServerInfoService zkServerInfoService) {
		this.zkServerInfoService = zkServerInfoService;
	}

	@ApiOperation("加载所有服务信息")
	@ApiImplicitParams({
        @ApiImplicitParam(paramType="query",name="jsonValue",dataType="String",required=true,value="参数Json字符串，包含_pageIndex,_pageSize两个参数",defaultValue="{}"),
    })
	@PostMapping("/all")
	@OperationRight("query")
	public Response findServerInfos(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			Argument arg = new Argument();
			JSONObject value = parseJsonValue(jsonValue);
			arg.setPageable(value);
			arg = zkServerInfoService.findAllForPage(arg);
			if(arg.isSuccess()){
				Page<?> pages = arg.getPage();
				res.success().setToRtn(pages);
			}
		} catch (Exception e) {
			logger.error("加载ZK服务列表异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	@ApiOperation("保存服务信息")
	@ApiImplicitParams({
        @ApiImplicitParam(paramType="query",name="jsonValue",dataType="String",required=true,value="参数Json字符串，包含ip,port参数",defaultValue="{}"),
    })
	@PostMapping("/save")
	@OperationRight("add")
	public Response saveServerInfos(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			Argument arg = new Argument();
			ZkServerInfo value = parseJsonValueObject(jsonValue, ZkServerInfo.class);
			if(value.getRowId() == null || value.getRowId() == 0){
				String ip = value.getIp();
				int port = value.getPort();
				arg.setToReq("ip", ip);
				arg.setToReq("port", port);
				arg = zkServerInfoService.getZkServerInfoByIpAndPort(arg);
				if(arg.isSuccess()){
					ZkServerInfo obj = (ZkServerInfo) arg.getObj();
					value.setRowId(obj.getRowId());
				}
			}
			arg.setObj(value);
			arg = zkServerInfoService.saveZkServerInfo(arg);
			if(arg.isSuccess()){
				res.success();
			} else {
				res.fail(arg.getMessage());
			}
		} catch (Exception e) {
			logger.error("保存ZK服务节点信息异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	@PostMapping("/del")
	@OperationRight("del")
	public Response delServerInfos(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			Argument arg = new Argument();
			JSONObject value = parseJsonValue(jsonValue);
			Long rowId = value.getLong("rowId");
			if(rowId != null){
				arg.setRowId(rowId);
				arg = zkServerInfoService.delZkServerInfoById(arg);
				if(arg.isSuccess()){
					res.success();
				}
			}
		} catch (Exception e) {
			logger.error("删除ZK服务节点异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	@PostMapping("/start")
	@OperationRight("edit")
	public Response startZkServer(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			Argument arg = new Argument();
			JSONObject value = parseJsonValue(jsonValue);
			Long rowId = value.getLong("rowId");
			if(rowId != null){
				arg.setRowId(rowId);
				arg = zkServerInfoService.startServer(arg);
				if(arg.isSuccess()){
					res.success();
				} else {
					res.fail(arg.getMessage());
				}
			}
		} catch (Exception e) {
			logger.error("启动ZK服务节点异常：" + e.getMessage(), e);
		}
		return res;
	}
	
	@PostMapping("/cmd")
	@OperationRight("cmd")
	public Response zk4cmd(@RequestParam("jsonValue") String jsonValue) {
		Response res = new Response();
		try {
			JSONObject value = parseJsonValue(jsonValue);
			Long rowId = value.getLong("rowId");
			String cmd = value.getString("cmd");
			if(rowId != null){
				String result = zkServerInfoService.run4cmd(rowId, cmd);
				res.success().setDataToRtn(result);
			} else {
				String ip = value.getString("ip");
				int port = value.getIntValue("port");
				Argument arg = new Argument();
				arg.setToReq("ip", ip);
				arg.setToReq("port", port);
				arg = zkServerInfoService.getZkServerInfoByIpAndPort(arg);
				if(arg.isSuccess()){
					ZkServerInfo obj = (ZkServerInfo) arg.getObj();
					String result = zkServerInfoService.run4cmd(obj.getRowId(), cmd);
					res.success().setDataToRtn(result);
				}
			}
		} catch (Exception e) {
			res.fail("执行异常：" + e.getMessage());
			logger.error("执行ZK服务4字命令异常：" + e.getMessage(), e);
		}
		return res;
	}

}
