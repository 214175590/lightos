package com.echinacoop.lightos.web.rest.meeting;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.echinacoop.lightos.service.meeting.OsMeetAttendeesService;
import com.echinacoop.lightos.web.rest.BaseController;

/**
 * 会议出席者表
 * @Time 2018-09-18 14:05:01
 * @Auto Generated
 */
@RestController
@RequestMapping("/osMeetAttendees")
public class OsMeetAttendeesResource extends BaseController {
    private final static Logger logger = LoggerFactory.getLogger(OsMeetAttendeesResource.class);
    
    @Resource(name="osMeetAttendeesService")
    OsMeetAttendeesService osMeetAttendeesService;
    
    @RequestMapping("/loadList")
    public void loadList() {
        // TODO
    }
    
    @RequestMapping("/get")
    public void get() {
        // TODO
    }
    
    @RequestMapping("/add")
    public void add() {
        // TODO
    }
    
    @RequestMapping("/edit")
    public void edit() {
        // TODO
    }
    
    @RequestMapping("/del")
    public void del() {
        // TODO
    }

}
