---
title: Java日志系统Commons-loging、Log4j、Slf4j、LogBack比较
date: 2017-05-16 00:24
categories:
  - [技术, 后端]
tags:
  - Java
---

<u>如何记录日志？</u>
商业应用系统一般是混合使用
业务操作日志记录到数据库中，因为可能需要分析统计
一般系统运行及异常日志可以用日志文件，因为可能无法连接数据库
重要系统运行、安全及异常日志可以用系统日志，方便系统管理员查看

**Commons-logging**：apache最早提供的日志的门面接口。所谓门面日志系统，是指它们本身并不实现具体的日志打印逻辑，它们只是作为一个代理系统，接收应用程序的日志打印请求，然后根据当前环境和配置，选取一个具体的日志实现系统，将真正的打印逻辑交给具体的日志实现系统，从而实现应用程序日志系统的“可插拔”，即可以通过配置或更换jar包来方便的更换底层日志实现系统，而不需要改变任何代码。
<!-- more -->

Commons-logging在getLog之前会先查找具体的LogFactory实现类，顺序如下：
① 通过System.getProperty("org.apache.commons.logging.LogFactory")从系统属性中查找LogFactory的实现类；
② 若不存在，则通过Java spi机制从配置文件META-INF/services/org.apache.commons.logging.LogFactory读取 LogFactory的实现类名
③ 若不存在，则查找Classpath下的commons-logging.properties文件中的org.apache.commons.logging.LogFactory 属性
④ 若不存在，则初始化默认的实现类org.apache.commons.logging.impl.LogFactoryImpl


Commons-logging中默认实现的LogFactory（LogFactoryImpl类）查找具体Log实现类的逻辑如下：
① 查找在commons-logging.properties文件中是否定存在以org.apache.commons.logging.Log或org.apache.commons.logging.log(旧版本，不建议使用)为key定义的Log实现类，如果是，则使用该类。
② 否则，查找在系统属性中（-D方式启动参数）是否存在以org.apache.commons.logging.Log或org.apache.commons.logging.log(旧版本，不建议使用)为key定义的Log实现类，如果是，则使用该类。
③ 否则，如果在classpath中存在Log4J的jar包，则使用Log4JLogger类。
④ 否则，如果当前使用的JDK版本或等于1.4，则使用Jdk14Logger类。
⑤ 否则，如果存在Lumberjack版本的Logging系统，则使用Jdk13LumberjackLogger类。
⑥ 否则，如果可以正常初始化Commons Logging自身实现的SimpleLog实例，则使用该类
⑦ 最后，以上步骤都失败，则抛出LogConfigurationException。

**Log4j**：经典的一种日志解决方案。内部把日志系统抽象封装成Logger、appender、pattern等实现。我们可以通过配置文件轻松的实现日志系统的管理和多样化配置。

**Slf4j**： 全称为Simple Logging Facade for JAVA——java简单日志门面。是对不同日志框架提供的一个门面封装。可以在部署的时候不修改任何配置即可接入一种日志实现方案。和commons-loging应该有一样的初衷，SLF4J是编译时绑定到具体实现的日志框架，性能优于采用运行时搜寻的方式的commons-logging。

1. Slf4j能支持多个参数，并通过{}占位符进行替换，不需要使用logger.isDebugEnabled()来解决日志因为字符拼接产生的性能问题

2.OSGI机制更好兼容支持，Common-Logging使用了ClassLoader寻找和载入底层的日志库。而OSGI中不同的插件使用自己的ClassLoader。

**Logback**： Lack作为一个通用可靠、快速灵活的日志框架，将作为Log4j的替代和SLF4J组成新的日志系统的完整实现。官网上称具有极佳的性能，在关键路径上执行速度是log4j的10倍，且内存消耗更少。
