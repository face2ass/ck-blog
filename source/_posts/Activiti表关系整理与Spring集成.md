---
title: Activiti表关系整理与Spring集成
date: 2016-10-12 11:40
categories:
  - [技术, 后端]
tags:
  - Activiti
  - Java
---
# 结构：

![](activiti.webp)
<!-- more -->
ps：activiti5.16.3  依赖 spring4.x



# 概念：

部署对象 ——Deployment：一次部署的多个文件的信息，通常有 .jpdl.xml 和 .png 两个文件。删除流程定义其实删的就是部署对象

流程定义 ——ProcessDefintion：解析 .jpdl.xml 后得到的流程的信息，其中包含流程中所有的环节和每个环节的详细信息等。查询流程相关信息其实就是查询流程定义

流程实例 ——ProcessInstance：

Activiti 的持久化方式

Activiti 默认使用 Mybatis3 做持久化工作， 可以在配置中设置流程引擎启动时创建表。

Activiti 使用到的表都是 ACT_开头的。

| ACT_RE_* | 流程定义存储。                                               |
| -------- | ------------------------------------------------------------ |
| ACT_RU_* | 流程执行记录， 记录流程启动到结束的所有动作， 流程结束后会清除相关记录。 |
| ACT_ID_* | 用户记录， 流程中使用到的用户和组。                          |
| ACT_HI_* | 流程执行的历史记录。                                         |
| ACT_GE_* | 通用数据及设置。                                             |

使用到的表：

| ACT_GE_BYTEARRAY    | 流程部署的数据。 |
| ------------------- | ---------------- |
| ACT_GE_PROPERTY     | 通用设置。       |
| ACT_HI_ACTINST      | 流程活动的实例。 |
| ACT_HI_ATTACHMENT   |                  |
| ACT_HI_COMMENT      |                  |
| ACT_HI_DETAIL       |                  |
| ACT_HI_PROCINST     | 流程实例。       |
| ACT_HI_TASKINST     | 任务实例。       |
| ACT_ID_GROUP        | 用户组。         |
| ACT_ID_INFO         |                  |
| ACT_ID_MEMBERSHIP   |                  |
| ACT_ID_USER         | 用户。           |
| ACT_RE_DEPLOYMENT   | 部署记录。       |
| ACT_RE_PROCDEF      | 流程定义。       |
| ACT_RU_EXECUTION    | 流程执行记录。   |
| ACT_RU_IDENTITYLINK |                  |
| ACT_RU_JOB          |                  |
| ACT_RU_TASK         | 执行的任务记录。 |
| ACT_RU_VARIABLE     | 执行中的变量记录 |

[activiti5.13 框架 数据库设计说明书](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fwww.cnblogs.com%2Fllzgzljl%2Fp%2F3356108.html)



# 创建数据库与表

使用无配置文件的方式创建数据库与表

测试代码：

```java
@Test
public void createSchema() throws Exception {
    // 创建流程引擎配置对象
    ProcessEngineConfiguration pfg = ProcessEngineConfiguration.createStandaloneProcessEngineConfiguration();
    // 数据库相关配置
    ProcessEngine pg = pfg.setJdbcDriver("com.mysql.jdbc.Driver")
            .setJdbcUrl("jdbc:mysql:///activiti_test?createDatabaseIfNotExist=true")
            .setJdbcUsername("root")
            .setJdbcPassword("root")
            // 设置数据库建表策略，默认为false
            .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE)
    // 使用配置对象创建流程引擎
    .buildProcessEngine();
}
```

使用配置文件创建数据库与表

activiti.cfg.xml 内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="processEngineConfiguration" class="org.activiti.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        <property name="jdbcDriver" value="com.mysql.jdbc.Driver" />
        <property name="jdbcUrl" value="jdbc:mysql:///activiti_test?createDatabaseIfNotExist=true" />
        <property name="jdbcUsername" value="root" />
        <property name="jdbcPassword" value="root" />
        <!-- 数据库建表策略，类似hibernate.hdb2ddl.auto，默认为false -->
        <property name="databaseSchemaUpdate" value="true" />
    </bean>

</beans>
```

测试代码：

```java
@Test
public void createSchema() throws Exception {
    // ProcessEngines(不是ProcessEngine)的getDefaultProcessEngine方法
    // 会默认在classpath寻找activiti.cfg.xml文件来创建单例的流程引擎对象
    ProcessEngine pg = ProcessEngines.getDefaultProcessEngine();
}
```





# 部署流程定义

测试代码：

```javascript
@Test
public void deployProcessDefintion() {
// 创建仓库服务对象
    RepositoryService repositoryService = processEngine.getRepositoryService();
// 部署资源文件并返回部署对象
    Deployment deployment = repositoryService.createDeployment()
// 从流里读取部署文件，其中resourceName直接影响act_ge_bytearray表中NAME_字段的值
// .addInputStream("resourceName",
// Thread.currentThread().getContextClassLoader().getResourceAsStream("base/BaseProcess.bpmn"))
            .addClasspathResource("base/BaseProcess.bpmn")
            .addClasspathResource("base/BaseProcess.png")
            .deploy();
}
```

通过开源的 zip 格式压缩包来部署流程定义（框架会自动解压 zip 文件）

测试代码：

```java
@Test
public void deployProcessDefintionUseZip() {
    Deployment deployment = repositoryService.createDeployment()
            // 路径加上斜杠表示从类的根路径获取，否则是指当前类所在包下加载
            // 等同于this.getClass().getContextClassLoader().getResourceAsStream("BaseProcess.zip")——没有反斜杠
            // 等同于Thread.currentThread().getContextClassLoader().getResourceAsStream("BaseProcess.zip")——没有反斜杠
            .addZipInputStream(new ZipInputStream(this.getClass().getResourceAsStream("/BaseProcess.zip")))
            .deploy();
}
```

部署流程定义后，数据库会做出以下修改：

| act_re_deployment | 新增一条记录（其中包括流程定义部署对象的显示别名和部署时间） |
| ----------------- | ------------------------------------------------------------ |
| act_re_deployment | 新增一条记录（其中包括 —— ID_：格式为 key : version : 随机数 CATEGORY_：流程定义文件的 Namespace NAME_：流程定义文件的 Name，默认等于 id KEY_：流程定义文件的 Key VERSION_：流程定义文件的版本号（同一个 key 的部署次数） DEPLOYMENT_ID_：用于与 act_re_deployment 做关联 RESOURCE_NAME_：资源文件的名称（即在 classpath 的相对路径） DGRM_RESOURCE_NAME_：图像资源文件的名称（即在 classpath 的相对路径） SUSPENSION_STATE_：挂起状态（1 为正常状态） ） |
| act_ge_bytearray  | 新增至少一条记录（通常是流程定义文件和图片等）               |





# 启动流程实例

测试代码：

```java
@Test
public void startProcessInstance() {
    // 创建运行时的服务对象
    RuntimeService runtimeService = processEngine.getRuntimeService();

    // 设置流程变量
    Map<String, Object> variables = new HashMap<String, Object>();
    variables.put("employeeName", "Kermit");
    variables.put("numberOfDays", new Integer(4));
    variables.put("vacationMotivation", "我有点累了");

    // 使用指定key的流程定义的最新版本来启动一个新的流程实例
    runtimeService.startProcessInstanceByKey("vacationRequest", variables);

}
```





# 查询用户的候选任务列表

测试代码：

```java
@Test
public void findUserPersonalTaskList() {
    TaskService taskService = processEngine.getTaskService();
    String userName = "张三";
    List<Task> tasks = taskService.createTaskQuery()
    // 过滤条件
            .taskAssignee(userName)
            .list();
    System.out.println("■■■■■■■■■■■■" + userName + "的任务列表为" + "■■■■■■■■■■■■");
    for (Task task : tasks) {
        System.out.println("任务ID:" + task.getId()
                + "\t任务名称:" + task.getName()
                + "\t任务描述:" + task.getDescription());
    }
}
```





# 挂起流程定义和激活一个流程实例

测试代码：

```java
repositoryService.suspendProcessDefinitionByKey("vacationRequest");
try {
  runtimeService.startProcessInstanceByKey("vacationRequest");
} catch (ActivitiException e) {
  e.printStackTrace();
}
```

流程定义被挂起后就不能创建该定义的新实例（会抛出异常）。

如果要重新激活一个暂停的流程定义，只要调用 repositoryService.activateProcessDefinitionXXX 方法即可



流程实例也可以通过 runtimeService.suspendProcessInstance 方法被挂起，一旦挂起流程就不能往下进行（比如调用完成任务的方法会抛出异常），工作（jobs）也不会执行（比如 timers）

如果要重新激活一个暂停的流程定义，只要调用 runtimeService.activateProcessInstanceXXX 方法即可





# activiti 与 Spring 集成

applicationContext.xml 的部分内容：

```xml
<!-- 配置声明式的事务管理器（采用基于注解的方式） -->
<bean id="transactionManager"
    class="org.springframework.orm.hibernate4.HibernateTransactionManager">
    <property name="sessionFactory" ref="sessionFactory"></property>
</bean>
<tx:annotation-driven transaction-manager="transactionManager" />

<!-- activiti5集成spring配置 -->
<!-- 流程引擎配置对象 -->
<bean id="processEngineConfiguration" class="org.activiti.spring.SpringProcessEngineConfiguration">
    <property name="dataSource" ref="dataSource" />
    <property name="transactionManager" ref="transactionManager" />
    <!-- 数据库建表策略，类似hibernate.hdb2ddl.auto，默认为false -->
    <property name="databaseSchemaUpdate" value="true" />
    <property name="jobExecutorActivate" value="false" />
</bean>
<!-- 流程引擎核心对象 -->
<bean id="processEngine" class="org.activiti.spring.ProcessEngineFactoryBean">
    <property name="processEngineConfiguration" ref="processEngineConfiguration" />
</bean>
<!-- 流程引擎服务对象 -->
<bean id="repositoryService" factory-bean="processEngine"
    factory-method="getRepositoryService" />
<bean id="runtimeService" factory-bean="processEngine"
    factory-method="getRuntimeService" />
<bean id="taskService" factory-bean="processEngine"
    factory-method="getTaskService" />
<bean id="historyService" factory-bean="processEngine"
    factory-method="getHistoryService" />
<bean id="managementService" factory-bean="processEngine"
    factory-method="getManagementService" />
```

