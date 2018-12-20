# lightos

#### 项目介绍
lightos = Light OS , 轻系统/光速系统，基于SpringBoot打造的一套集开发与运维为一体的辅助系统。
本来设想是做成一套运维系统的，后面加了很多其他功能在里面，变成一套非常奇怪的系统了，各位有兴趣可以拿去修改，针对自己公司的情况修改，给工作带来方便。

#### 软件架构
### 设想功能
- 项目构建
- 版本部署
- 状态监控
- 集群管理
- 版本管理
- 日志查看
- 运维报表
- 代码质检
- 漏洞扫描
- 其他...![
]
### 技术框架：
- Spring Boot
- Docker
- kubernetes
- zookeeper
- redis
- dubbo
- svnkit
- jsch
- mysql
- zui

#### 安装教程

1. 创建数据库，MySql 5.6
2. 执行数据库建表脚本与初始化数据脚本，脚本在dbscript/目录下
3. 使用Maven打包项目，打包好后有两个文件：lightos-0.0.1-SNAPSHOT.war与lightos-0.0.1-SNAPSHOT.war.original，lightos-0.0.1-SNAPSHOT.war可以直接使用java -jar命令运行，而lightos-0.0.1-SNAPSHOT.war.original是必须放到tomcat等web容器下才能运行的，且需要把.original后缀删掉。
4. 也可以使用项目中lightos.sh脚本文件快速操作项目运行、停止等操作，需要修改脚本中的部分参数。命令是：./lightos.sh start|stop|restart|status。

#### 项目截图
![登录界面](https://images.gitee.com/uploads/images/2018/1119/112805_418d113d_453622.jpeg "登录界面")
![桌面](https://images.gitee.com/uploads/images/2018/1119/113300_c31a6185_453622.jpeg "登录成功后的桌面")
![用户管理](https://images.gitee.com/uploads/images/2018/1119/113326_98c28ccc_453622.jpeg "用户管理界面")
![应用管理](https://images.gitee.com/uploads/images/2018/1119/113401_c8840027_453622.jpeg "3.jpg")
![Docker管理](https://images.gitee.com/uploads/images/2018/1119/113413_8e38b0a6_453622.jpeg "4.jpg")
![Docker控制台](https://images.gitee.com/uploads/images/2018/1119/113419_cb0c6d1d_453622.jpeg "5.jpg")
![Zooker管理](https://images.gitee.com/uploads/images/2018/1119/113426_2a93feff_453622.jpeg "6.jpg")
![Zooker节点](https://images.gitee.com/uploads/images/2018/1119/113436_1f301adc_453622.jpeg "7.jpg")
![Redis管理](https://images.gitee.com/uploads/images/2018/1119/113457_0c4e1267_453622.jpeg "15.jpg")
![Redis控制台](https://images.gitee.com/uploads/images/2018/1119/113504_210cf1e2_453622.jpeg "16.jpg")
![代码生成模块](https://images.gitee.com/uploads/images/2018/1119/113511_5ae22024_453622.jpeg "17.jpg")
![k8s控制台](https://images.gitee.com/uploads/images/2018/1119/113518_64a9de4b_453622.jpeg "8.jpg")
![Dubbo管理](https://images.gitee.com/uploads/images/2018/1119/113523_c3bc0e97_453622.jpeg "9.jpg")
![Dubbo接口测试](https://images.gitee.com/uploads/images/2018/1119/113531_325c9b61_453622.jpeg "10.jpg")
![服务监控](https://images.gitee.com/uploads/images/2018/1119/113537_666d30d1_453622.jpeg "11.jpg")
![云闹钟](https://images.gitee.com/uploads/images/2018/1119/113543_d519f323_453622.jpeg "12.jpg")
![禅道任务监控](https://images.gitee.com/uploads/images/2018/1119/113550_36187fd9_453622.jpeg "13.jpg")
![会议系统](https://images.gitee.com/uploads/images/2018/1119/113608_f53aa3ec_453622.jpeg "14.jpg")
