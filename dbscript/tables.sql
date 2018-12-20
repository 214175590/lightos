

-- ----------------------------
-- Table structure for `t_user`
-- ----------------------------
DROP TABLE IF EXISTS `os_user`;
CREATE TABLE `os_user` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `account` varchar(36) NOT NULL COMMENT '账户',
  `password` varchar(32) NOT NULL COMMENT '密码',
  `name` varchar(32) NOT NULL COMMENT '姓名',
  `company` varchar(128) COMMENT '公司',
  `dept` varchar(128) COMMENT '部门',
  `position` varchar(128) COMMENT '职位',
  `email` varchar(64) COMMENT '电子邮箱',
  `mobile` varchar(20) COMMENT '手机号码',
  `wx` varchar(32) COMMENT '微信号',
  `qq` varchar(16) COMMENT 'QQ号',
  `remark` varchar(512) COMMENT '描述信息',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统用户';
CREATE UNIQUE INDEX idx_os_user_account ON os_user (account);

-- ----------------------------
-- Table structure for `os_zk_server_info`
-- ----------------------------
DROP TABLE IF EXISTS `os_zk_server_info`;
CREATE TABLE `os_zk_server_info` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(36) NOT NULL DEFAULT '' COMMENT '主机地址',
  `port` int(5) NOT NULL DEFAULT '0' COMMENT '端口号',
  `config_path` varchar(128) NOT NULL DEFAULT '' COMMENT '配置文件路径',
  `remark` varchar(512) DEFAULT '' COMMENT '描述信息',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Zookeeper服务器信息';

-- ----------------------------
-- Table structure for `os_redis_server`
-- ----------------------------
DROP TABLE IF EXISTS `os_redis_server`;
CREATE TABLE `os_redis_server` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(36) NOT NULL DEFAULT '' COMMENT '主机地址',
  `port` int(5) NOT NULL DEFAULT '0' COMMENT '端口号',
  `password` varchar(128) NOT NULL DEFAULT '' COMMENT '密码',
  `remark` varchar(512) DEFAULT '' COMMENT '描述信息',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Redis服务器信息';

-- ------------------------------------
-- 桌面图标表 `os_desk_icon`
-- ------------------------------------
DROP TABLE IF EXISTS `os_desk_icon`;
CREATE TABLE os_desk_icon(
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	name VARCHAR(50) NOT NULL COMMENT '图标名字，标识，唯一',
	types VARCHAR(20)  NOT NULL COMMENT '图标类型',-- (program,shortcuts,exe,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,gif,bmp,png,folder,js,html,htm,css,jsp,asp,php,psd,swf,flv,avi,rm,rmvb,mp3,mp4,rar,zip,7z,pdf,xml,java,jar,bat)
	title VARCHAR(100) NOT NULL COMMENT '图标标题',
	window_width INT NOT NULL DEFAULT 800 COMMENT '图标打开窗口的宽度（piex）',
	window_height INT NOT NULL DEFAULT 500 COMMENT '图标打开窗口的高度（piex）',
	location VARCHAR(1000) NOT NULL DEFAULT 'error404.jsp' COMMENT '图标打开窗口的请求地址',
	sleft INT NOT NULL DEFAULT 10 COMMENT '图标坐标X',
	top INT NOT NULL DEFAULT 10 COMMENT '图标坐标Y',
	isdrag VARCHAR(6) NOT NULL DEFAULT 'true' COMMENT '图标是否可以鼠标拖动',
	isshow VARCHAR(6) NOT NULL DEFAULT 'true' COMMENT '图标是否初始化就显示',
	icon VARCHAR(500) NOT NULL DEFAULT 'images/icons/a01.png' COMMENT '图标图片路径',
	levels INT COMMENT '图标等级（0 所有,1 个人,2 系统）',
	hosts INT COMMENT '图标主机（1 本地,2 远程）',
	need_close VARCHAR(6) NOT NULL DEFAULT 'true' COMMENT '打开的窗口是否有关闭按钮',
	need_minimize VARCHAR(6) NOT NULL DEFAULT 'true' COMMENT '打开的窗口是否有最小化按钮',
	need_maximize VARCHAR(6) NOT NULL DEFAULT 'true' COMMENT '打开的窗口是否有最大化按钮',
	close_function VARCHAR(1000) COMMENT '图标打开窗口的关闭时触发的JS脚本',
	min_function VARCHAR(1000) COMMENT '图标打开窗口的最小化时触发的JS脚本',
	max_function VARCHAR(1000) COMMENT '图标打开窗口的最大化/还原时触发的脚本', 
	status INT NOT NULL DEFAULT 1 COMMENT '状态（1:在用，2：禁用，3：待审核）',
	create_time VARCHAR(20) NOT NULL COMMENT '创建时间',
	belong VARCHAR(20) NULL COMMENT '所属用户' 
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='桌面图标表';
ALTER TABLE os_desk_icon ADD INDEX os_desk_icon_index_belong(belong);
ALTER TABLE os_desk_icon ADD UNIQUE os_desk_icon_unique_name(NAME);


-- ------------------------------------
-- 图标权限表 `os_desk_icon_right`
-- ------------------------------------
DROP TABLE IF EXISTS `os_desk_icon_right`;
CREATE TABLE os_desk_icon_right(
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	desk_icon_id bigint(20) NOT NULL COMMENT '桌面图标ID', 
	name VARCHAR(50) NOT NULL COMMENT '权限名称', 
	code VARCHAR(20) NOT NULL COMMENT '权限编码' 
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='图标权限表';
ALTER TABLE os_desk_icon_right ADD INDEX os_icon_right_index_desk_icon_id(desk_icon_id);

-- ------------------------------------
-- 用户与图标及权限关系表 `os_user_icon_right`
-- ------------------------------------
DROP TABLE IF EXISTS `os_user_icon_right`;
CREATE TABLE os_user_icon_right(
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	user_id bigint(20) NOT NULL COMMENT '用户ID',
	desk_icon_id bigint(20) NOT NULL COMMENT '桌面图标ID', 
	right_code VARCHAR(20) NOT NULL COMMENT '权限编码'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='用户与图标及权限关系表';
ALTER TABLE os_user_icon_right ADD INDEX os_user_icon_index_user_Id(user_Id);
ALTER TABLE os_user_icon_right ADD INDEX os_user_icon_index_desk_icon_id(desk_icon_id);
ALTER TABLE os_user_icon_right ADD INDEX os_user_icon_index_desk_icon_id(desk_icon_id);


-- ------------------------------------
-- Dubbo接口测试数据表 `os_dubbo_tester`
-- ------------------------------------
DROP TABLE IF EXISTS `os_dubbo_tester`;
CREATE TABLE os_dubbo_tester (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	name VARCHAR(50) NOT NULL COMMENT 'jar名称/dubbo服务端地址',
	server VARCHAR(50) NOT NULL COMMENT 'ZK/DUBBO服务端地址',
	interface_name VARCHAR(200) NOT NULL COMMENT '接口名称',
	method_name VARCHAR(50) NOT NULL COMMENT '方法名称', 
	param VARCHAR(2000) COMMENT '入参', 
	result VARCHAR(6000) COMMENT '最后测试结果', 
	test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后测试时间' 
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='Dubbo接口测试数据表';
ALTER TABLE os_dubbo_tester ADD INDEX os_dubbo_tester_index_interface(interface_name);
ALTER TABLE os_dubbo_tester ADD INDEX os_dubbo_tester_index_method(method_name);
ALTER TABLE os_dubbo_tester ADD INDEX os_dubbo_tester_index_name(name);
ALTER TABLE os_dubbo_tester ADD INDEX os_dubbo_tester_index_server(server);

-- ------------------------------------
-- Dubbo接口测试记录表 `os_dubbo_test_record`
-- ------------------------------------
DROP TABLE IF EXISTS `os_dubbo_test_record`;
CREATE TABLE os_dubbo_test_record (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	name VARCHAR(50) NOT NULL COMMENT 'jar名称/dubbo服务端地址',
	server VARCHAR(50) NOT NULL COMMENT 'ZK/DUBBO服务端地址',
	interface_name VARCHAR(200) NOT NULL COMMENT '接口名称', 
	method_name VARCHAR(50) NOT NULL COMMENT '方法名称', 
	param VARCHAR(2000) COMMENT '入参', 
	result VARCHAR(6000) COMMENT '测试结果', 
	test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后测试时间' 
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='Dubbo接口测试数据表';
ALTER TABLE os_dubbo_test_record ADD INDEX os_dubbo_test_record_index_interface(interface_name);
ALTER TABLE os_dubbo_test_record ADD INDEX os_dubbo_test_record_index_method(method_name);
ALTER TABLE os_dubbo_test_record ADD INDEX os_dubbo_test_record_index_name(name);
ALTER TABLE os_dubbo_test_record ADD INDEX os_dubbo_test_record_index_server(server);


-- ------------------------------------
-- Dubbo接口测试用例 `os_dubbo_test_case`
-- ------------------------------------
DROP TABLE IF EXISTS `os_dubbo_test_case`;
CREATE TABLE os_dubbo_test_case (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	name VARCHAR(50) NOT NULL COMMENT 'jar名称/dubbo服务端地址',
	server VARCHAR(50) NOT NULL COMMENT 'ZK/DUBBO服务端地址',
	interface_name VARCHAR(200) NOT NULL COMMENT '接口名称', 
	method_name VARCHAR(50) NOT NULL COMMENT '方法名称', 
	case_name VARCHAR(100) NOT NULL COMMENT '用例名称', 
	param VARCHAR(2000) COMMENT '入参', 
	result VARCHAR(6000) COMMENT '测试结果', 
	test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后测试时间' 
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='Dubbo接口测试用例表';
ALTER TABLE os_dubbo_test_case ADD INDEX os_dubbo_test_case_index_interface(interface_name);
ALTER TABLE os_dubbo_test_case ADD INDEX os_dubbo_test_case_index_method(method_name);
ALTER TABLE os_dubbo_test_case ADD INDEX os_dubbo_test_case_index_name(name);
ALTER TABLE os_dubbo_test_record ADD INDEX os_dubbo_test_record_index_server(server);


-- ------------------------------------
-- Dubbo接口信息表 `os_dubbo_interface`
-- ------------------------------------
DROP TABLE IF EXISTS `os_dubbo_interface`;
CREATE TABLE os_dubbo_interface (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	name VARCHAR(50) NOT NULL COMMENT 'dubbo服务端地址',
	interface_name VARCHAR(200) NOT NULL COMMENT '接口名称',
	method_name VARCHAR(50) NOT NULL COMMENT '方法名称', 
	method_nick VARCHAR(100) NOT NULL COMMENT '方法中文名称', 
	remark VARCHAR(1000) COMMENT '接口描述', 
	in_param VARCHAR(4000) COMMENT '入参', 
	out_param VARCHAR(4000) COMMENT '出参',
	update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后修改时间'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='Dubbo接口信息表';
ALTER TABLE os_dubbo_interface ADD INDEX os_dubbo_interface_index_interface(interface_name);
ALTER TABLE os_dubbo_interface ADD INDEX os_dubbo_interface_index_method(method_name);
ALTER TABLE os_dubbo_interface ADD INDEX os_dubbo_interface_index_name(name);

-- ------------------------------------
-- 用户svn信息表 `os_svn_user`
-- ------------------------------------
DROP TABLE IF EXISTS `os_svn_user`;
CREATE TABLE os_svn_user (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	user_id bigint(20) NOT NULL COMMENT '用户ID',
	username VARCHAR(50) NOT NULL COMMENT '账号',
	password VARCHAR(500) NOT NULL COMMENT '密码'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='用户svn信息表';
ALTER TABLE os_svn_user ADD INDEX os_svn_user_index_user_id(user_id);
ALTER TABLE os_svn_user ADD INDEX os_svn_user_index_username(username);

-- ------------------------------------
-- 项目svn信息表 `os_svn_user`
-- ------------------------------------
DROP TABLE IF EXISTS `os_svn_project`;
CREATE TABLE os_svn_project (
	row_id bigint(20) PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT '主键ID',
	project_name VARCHAR(100) NOT NULL COMMENT '项目别名',
	project_url VARCHAR(1000) NOT NULL COMMENT '项目svn地址',
	project_users VARCHAR(1000) default '' COMMENT '项目成员'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='项目svn信息表';
ALTER TABLE os_svn_project ADD INDEX os_svn_project_index_project_name(project_name);


-- ----------------------------
-- Docker节点服务器信息 `os_docker_info`
-- ----------------------------
DROP TABLE IF EXISTS `os_docker_info`;
CREATE TABLE `os_docker_info` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(36) NOT NULL DEFAULT '' COMMENT '主机地址',
  `port` int(5) NOT NULL DEFAULT '0' COMMENT '端口号',
  `username` varchar(128) NOT NULL DEFAULT '' COMMENT '用户名',
  `password` varchar(128) NOT NULL DEFAULT '' COMMENT '密码',
  `remark` varchar(512) DEFAULT '' COMMENT '描述信息',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Docker节点服务器信息';


-- ----------------------------
-- 服务监控信息 `os_service_monitor`
-- ----------------------------
DROP TABLE IF EXISTS `os_service_monitor`;
CREATE TABLE `os_service_monitor` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `typed` varchar(16) NOT NULL COMMENT '类型：http,socket',
  `address` varchar(256) NOT NULL COMMENT '地址',
  `remark` varchar(256) DEFAULT '' COMMENT '描述信息',
  `email` varchar(1024) DEFAULT '' COMMENT '邮箱通知人员',
  `users` varchar(2048) DEFAULT '' COMMENT '通达OA通知人员',
  `times` int DEFAULT 10 COMMENT '检测间隔时间',
  `notice` int DEFAULT 1 COMMENT '是否通知，1通知，2停止通知',
  `code` varchar(8) DEFAULT '' COMMENT '状态码',
  `error` varchar(256) DEFAULT '' COMMENT '错误信息',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后修改时间',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='服务监控信息';

-- ------------------------------------
-- 云闹钟`os_cloud_clock`
-- ------------------------------------
DROP TABLE IF EXISTS `os_cloud_clock`;
CREATE TABLE `os_cloud_clock` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT 0 COMMENT '用户ID',
  `scope` varchar(16) NOT NULL COMMENT '作用域：private,public',
  `cycle` varchar(16) NOT NULL COMMENT '周期：time,day,week,month,year',
  `date` varchar(256) NOT NULL COMMENT '日期',
  `time` varchar(128) NOT NULL COMMENT '时间',
  `exec_time` varchar(32) NOT NULL COMMENT '下次执行时间',
  `title` varchar(128) NOT NULL COMMENT '标题',
  `content` varchar(512) NOT NULL COMMENT '内容',
  `status` int NOT NULL COMMENT '状态：1待执行，2已执行',
  `email` varchar(1024) DEFAULT '' COMMENT '邮箱通知人员',
  `users` varchar(2048) DEFAULT '' COMMENT '通达OA通知人员',
  `last_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后执行时间',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='云闹钟';
ALTER TABLE os_cloud_clock ADD INDEX os_cloud_clock_index_user_id(user_id);

-- ------------------------------------
-- 禅道任务`os_zentao_task`
-- ------------------------------------
DROP TABLE IF EXISTS `os_zentao_task`;
CREATE TABLE `os_zentao_task` (
  `row_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pro_id` varchar(20) NOT NULL COMMENT '项目ID',
  `name` varchar(256) NOT NULL COMMENT '项目名称',
  `manager` varchar(512) COMMENT '管理人员',
  `first_time` varchar(20) COMMENT '首次通知时间',
  `time_interval` int COMMENT '时间间隔，单位毫秒',
  `status` int NOT NULL COMMENT '状态：1未启动，2已启动',
  `last_time` TIMESTAMP COMMENT '最后执行时间',
  PRIMARY KEY (`row_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='禅道任务';
ALTER TABLE os_zentao_task ADD INDEX os_zentao_task_index_pro_id(pro_id);


-- ------------------------------------
-- 会议室表`os_boardroom`
-- ------------------------------------
DROP TABLE IF EXISTS `os_boardroom`;
CREATE TABLE os_boardroom(
	row_id bigint(20) PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '主键ID',
	room_name VARCHAR(32) NOT NULL COMMENT '会议室名称',
	room_remark VARCHAR(512) NULL COMMENT '会议室说明',
	capacity int NOT NULL COMMENT '容纳人数',
	company VARCHAR(64) NOT NULL COMMENT '所属公司',
	projector INT NOT NULL COMMENT '内置投影仪(1是，2否)',
	teleconference INT NOT NULL COMMENT '支持电话会议（1是，2否）',
	videoconference INT NOT NULL COMMENT '支持视频会议（1是，2否）',
	status INT NOT NULL COMMENT '状态(1:开放预约,2:关闭预约)'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='会议室表';
ALTER TABLE os_boardroom ADD INDEX os_br_index_room_name(room_name);

-- ------------------------------------
-- 会议管理表`os_meeting_mgt`
-- ------------------------------------
DROP TABLE IF EXISTS `os_meeting_mgt`;
CREATE TABLE os_meeting_mgt(
	row_id bigint(20) PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '主键ID',
	boardroom bigint(20) NOT NULL COMMENT '会议室',
	boardroom_name VARCHAR(128) NOT NULL COMMENT '会议室',
	meet_subject VARCHAR(64) NOT NULL COMMENT '会议主题',
	initiator bigint(20) NOT NULL COMMENT '会议发起人',
	initiator_name VARCHAR(32) NOT NULL COMMENT '会议发起人',
	conference_clerk bigint(20) NULL COMMENT '会议记录人',
	conference_clerk_name VARCHAR(32) NULL COMMENT '会议记录人',
	meet_date VARCHAR(20) NOT NULL COMMENT '会议日期',
	meet_start VARCHAR(20) NOT NULL COMMENT '会议开始时间（0800）',
	meet_end VARCHAR(20) NOT NULL COMMENT '会议结束时间（0900）',
	meet_remark VARCHAR(320) NULL COMMENT '会议说明',
	meet_minutes VARCHAR(4000) NULL COMMENT '会议纪要',
	mail_notification INT NOT NULL COMMENT '邮件通知(1:是,2:否)',
	mail_reminder INT NOT NULL COMMENT '邮件提醒(1:是,2:否)',
	status INT NOT NULL COMMENT '状态(1:待执行,2:已取消,3:已完成)'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='会议管理表';
ALTER TABLE os_meeting_mgt ADD INDEX os_mm_index_meet_subject(meet_subject);
ALTER TABLE os_meeting_mgt ADD INDEX os_mm_index_meet_date(meet_date);
ALTER TABLE os_meeting_mgt ADD INDEX os_mm_index_boardroom(boardroom);

-- ------------------------------------
-- 会议出席者表`os_meet_attendees`
-- ------------------------------------
DROP TABLE IF EXISTS `os_meet_attendees`;
CREATE TABLE os_meet_attendees(
	row_id bigint(20) PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '主键ID',
	meet_id bigint(20) NOT NULL COMMENT '会议ID',
	user_id bigint(20) NULL COMMENT '会议参与者ID',
	initiator INT NOT NULL COMMENT '会议发起者(1:是，2：否)',
	status INT NOT NULL COMMENT '状态(1正常出席，2会议缺席)'
) ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='会议出席者表';
ALTER TABLE os_meet_attendees ADD INDEX os_ma_index_meet_id(meet_id);
ALTER TABLE os_meet_attendees ADD INDEX os_ma_index_user_id(user_id);