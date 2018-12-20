package com.echinacoop.lightos.domain.base;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.common.consts.StringConstant;

/**
 * 统一的入参、出参对象<br>
 * 所有的方法都必须使用此对象作为出入参<br>
 * 出入参均以Map容器存储
 * 
 * @Time 2016-12-05 19:51
 * @GeneratedByCodeFactory
 */
public class Argument {

    private String code = MapContants.MSG_CODE_FAILED;

    private String message = MapContants.getMessage(MapContants.MSG_CODE_FAILED);

    private Long rowId = 0L;

    private int num = 0;

    private Object obj;

    /**
     * 用于分页查询，属于入参
     */
    private Pageable pageable;

    /**
     * 分页查询后的结果集，类似于List<Object>，属于出参
     */
    private Page<?> page;

    /**
     * 入参
     */
    private Map<String, Object> req = new HashMap<String, Object>();

    /**
     * 出参
     */
    private Map<String, Object> rtn = new HashMap<String, Object>();

    public Argument fail() {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = MapContants.getMessage(MapContants.MSG_CODE_FAILED);
        return this;
    }

    public Argument fail(String msg) {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = msg;
        return this;
    }

    public Argument fail(String code, String msg) {
        if (code == null || code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_FAILED;
        }
        this.code = code;
        this.message = msg;
        return this;
    }

    public Argument fail(String code, String msg, Map<String, Object> result) {
        if (code == null || code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_FAILED;
        }
        this.code = code;
        this.message = msg;
        this.rtn = result;
        return this;
    }

    public Argument fail(Map<String, Object> result) {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = MapContants.getMessage(MapContants.MSG_CODE_FAILED);
        this.rtn = result;
        return this;
    }

    public Argument success() {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = MapContants.getMessage(MapContants.MSG_CODE_SUCCESS);
        return this;
    }

    public Argument success(String message) {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = message;
        return this;
    }

    public Argument success(String code, String msg) {
        if (code == null || !code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_SUCCESS;
        }
        this.code = code;
        this.message = msg;
        return this;
    }

    public Argument success(String code, String msg, Map<String, Object> result) {
        if (code == null || !code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_SUCCESS;
        }
        this.code = code;
        this.message = MapContants.getMessage(MapContants.MSG_CODE_SUCCESS);
        this.rtn = result;
        return this;
    }

    public Argument success(Map<String, Object> result) {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = MapContants.getMessage(MapContants.MSG_CODE_SUCCESS);
        this.rtn = result;
        return this;
    }

    public String getCode() {
        return code;
    }

    public Argument setCode(String code) {
        this.code = code;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public Argument setMessage(String message) {
        this.message = message;
        return this;
    }

    public Long getRowId() {
        return rowId;
    }

    public Long getRowId(String idfeild) {
        if (rowId == null && obj != null) {
            String methodName = "get" + idfeild.substring(0, 1).toUpperCase() + idfeild.substring(1);
            Method method;
            try {
                method = obj.getClass().getMethod(methodName);
                Object value = method.invoke(obj);
                if (value != null) {
                    rowId = (Long) value;
                }
            } catch (Exception e) {
                rowId = null;
            }
        }
        return rowId;
    }

    public Argument setRowId(Long rowId) {
        this.rowId = rowId;
        return this;
    }

    public int getNum() {
        return num;
    }

    public Argument setNum(int num) {
        this.num = num;
        return this;
    }

    public Object getObj() {
        return obj;
    }

    public Argument setObj(Object obj) {
        this.obj = obj;
        return this;
    }

    public Map<String, Object> getReq() {
        return req;
    }

    public Pageable getPageable() {
        return pageable;
    }

    public void setPageable(Pageable pageable) {
        this.pageable = pageable;
    }

    public void setPageable(JSONObject jsonValue) {
        Integer index = jsonValue.getInteger("_pageIndex");
        Integer size = jsonValue.getInteger("_pageSize");
        this.setPageable(new PageRequest(index == null ? 0 : index, size == null ? 10 : size));
    }

    public Page<?> getPage() {
        return page;
    }

    public void setPage(Page<?> page) {
        this.page = page;
    }

    public Argument setReq(Map<String, Object> req) {
        this.req = req;
        return this;
    }

    public Map<String, Object> getRtn() {
        return rtn;
    }

    public Argument setRtn(Map<String, Object> result) {
        this.rtn = result;
        return this;
    }

    /**
     * 判断操作是否成功
     * 
     * @return true 成功，false 失败
     */
    public boolean isSuccess() {
        return this.code != null && this.code.equals(MapContants.MSG_CODE_SUCCESS);
    }

    /**
     * 判断是否失败，不考虑任何错误码
     * 
     * @return
     */
    public boolean isFailed() {
        return !this.isSuccess();
    }

    public Object getReq(String key) {
        return this.req.get(key);
    }

    public String getStringForReq(String key) {
        Object value = this.getReq(key);
        return value == null ? null : value.toString();
    }

    public Integer getIntForReq(String key) {
        Object value = this.getReq(key);
        return value == null ? null : Integer.parseInt(value.toString());
    }

    public Float getFloatForReq(String key) {
        Object value = this.getReq(key);
        return value == null ? null : Float.parseFloat(value.toString());
    }

    public Double getDoubleForReq(String key) {
        Object value = this.getReq(key);
        return value == null ? null : Double.parseDouble(value.toString());
    }

    public Long getLongForReq(String key) {
        Object value = this.getReq(key);
        return value == null ? null : Long.parseLong(value.toString());
    }

    public Object getRtn(String key) {
        return this.rtn.get(key);
    }

    public String getStringForRtn(String key) {
        Object value = this.getRtn(key);
        return value == null ? null : value.toString();
    }

    public Integer getIntForRtn(String key) {
        Object value = this.getRtn(key);
        return value == null ? null : Integer.parseInt(value.toString());
    }

    public Float getFloatForRtn(String key) {
        Object value = this.getRtn(key);
        return value == null ? null : Float.parseFloat(value.toString());
    }

    public Long getLongForRtn(String key) {
        Object value = this.getRtn(key);
        return value == null ? null : Long.parseLong(value.toString());
    }

    public Argument setToRtn(String key, Object value) {
        this.rtn.put(key, value);
        return this;
    }

    public Argument setToReq(String key, Object value) {
        this.req.put(key, value);
        return this;
    }

    public Argument setDataToRtn(Object value) {
        this.rtn.put(StringConstant.DATA_KEY, value);
        return this;
    }

    public Argument setDataToReq(Object value) {
        this.req.put(StringConstant.DATA_KEY, value);
        return this;
    }

    public Object getDataForRtn() {
        return rtn.get(StringConstant.DATA_KEY);
    }

    public Object getDataForReq() {
        return req.get(StringConstant.DATA_KEY);
    }

}
