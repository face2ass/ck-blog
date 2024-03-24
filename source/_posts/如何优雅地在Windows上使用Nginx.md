---
title: 如何优雅地在Windows上使用Nginx
date: 2017-07-23 17:27:00
categories:
  - [技术, 后端]
tags:
  - Nginx
---
Nginx是一个非常好用的HTTP和反向代理服务器，但是如果你在开发过程中严重依赖nginx，频繁修改配置文件，是不是觉得每次双击nginx.exe，任务管理器中结束进程 的方式效率又低又土？今天我们就用更geek的方式来操作nginx——将其安装位为windows服务。
<!-- more -->
虽然Nginx官网上说未来的版本会增加windows服务的功能（[http://nginx.org/en/docs/windows.html#Possible-future-enhancements](http://nginx.org/en/docs/windows.html#Possible-future-enhancements)），这不是还没出来嘛，咱们自己来搞定。

所谓windows服务 其实就是操作系统在后台以守护进程的方式运行的程序，相信很多用过tomcat、apache 或者 mysql、mongoDB的小伙伴们都知道这玩意儿，比如电脑安装了mysql5.6.就可以通过命令行输入net start mysql56和 net stop mysql56 来启动或停止mysql服务（其中mysql56是默认服务名，不同的版本名字不同，安装时可以修改 ）。

是不是觉得很方便？下面我们就来试试如何通过net start/stop nginx的命令来启动/停止nginx。

# 下载并测试Nginx

1.  下载nginx的windows预编译版本，即 nginx/Windows- 开头的压缩包，我这里下载的是nginx/Windows-1.13.3 版本，解压到 **C:\\software**
2.  打开CMD，输入 
    
    ```bash
    C:\software\nginx-1.13.3\nginx.exe -p C:\software\nginx-1.13.3
    ```

    来启动nginx（-p参数用来指定nginx运行目录），在浏览器打开 [http://localhost/](http://localhost/)，出现“Welcome to nginx!”说明启动成功。
3.  这时你会发现启动nginx的cmd会一直阻塞，关闭窗口或ctrl+c都无法结束nginx进程，这是因为nginx的master进程进入了死循环，需要worker进程给其发送停止的信号，所以得另起一个cmd，执行

    ```bash
    C:\software\nginx-1.13.3\nginx.exe -p C:\software\nginx-1.13.3 -s quit
    ```

    来发送停止信号结束master进程。更多命令行参数见[官方文档](http://nginx.org/en/docs/switches.html)

# SC .exe说明

1.  要了解windows服务，得先熟悉一下windows自带的 SC .exe程序，它主要提供了的对windows service操作的一系列选项，具体的一些命令看这里的[文档](https://technet.microsoft.com/en-us/library/cc754599(v=ws.11).aspx)
2.  首先需要明确的一点是，并非所有的可执行文件都可以注册为系统服务，该程序必须实现了Windows Services API，比如有一个ServiceMain回调函数作为service的入口，如果你注册了一个无服务的程序到windows[服务控制管理器（SCM）](https://en.wikipedia.org/wiki/Service_Control_Manager)中，尝试启动服务就会报如下错误：

>     Error 1053: The service did not respond to the start or control request in a timely fashion。

# WinSW的使用

如果你和我一样不熟悉windows编程，可能就需要一个工具，用来把程序封装为一个支持 Windows Services API的新程序，一般就称这类工具为“windows service wrapper”，我找到了一个叫[WinSW](https://github.com/kohsuke/winsw)的工具来实现该功能。此类工具有很多，我这里只介绍这一个项目，小伙伴们如果有更好的推荐可以给我留言。

1.  首先进入该项目的github主页下载它的最新[release](https://github.com/kohsuke/winsw/releases)包，截止到2017-07-23，最新的release版是winsw-v2.1.2，我下载的是sample-allOptions.xml 和 WinSW.NET4.exe（根据系统的.NET版本来选择），将两个文件移动到nginx根目录下，并分别重命名为 **nginxsvc.xml** 和 **nginxsvc.exe**，这里要注意的是**文件名前缀必须相同**。
2.  修改xml文件的配置项，具体的配置见[说明](https://github.com/kohsuke/winsw/blob/master/doc/xmlConfigFile.md)，这里是我的配置文件：

    ```xml
    <!--
        Copyright (c) 2016 Oleg Nenashev and other contributors
    
        Permission is hereby granted, free of charge, to any person obtaining a copy of this 
        software and associated documentation files (the "Software"), to deal in the Software without
        restriction, including without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
        Software is furnished to do so, subject to the following conditions:
    
        The above copyright notice and this permission notice shall be included in all copies or 
        substantial portions of the Software.
    
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
        BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
        DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    -->
    
    <!--
     This is a sample configuration of the Windows Service Wrapper.
     This configuration file should be placed near the WinSW executable, the name should be the same.
     E.g. for myapp.exe the configuration file name should be myapp.xml
     
     You can find more information about configuration options here: https://github.com/kohsuke/winsw/blob/master/doc/xmlConfigFile.md
    -->
    <configuration>
      
    <!-- 
    SECTION: Mandatory options
    All options in other sections are optional 
    -->
      
      <!-- ID of the service. It should be unique accross the Windows system-->
      <id>nginx</id>
      <!-- Display name of the service -->
      <name>Nginx Service</name>
      <!-- Service description -->
      <description>nginx 1.13.3 windows service</description>
      
      <!-- Path to the executable, which should be started -->
      <!-- BASE points to a directory that contains the renamed executable binary -->
      <executable>%BASE%\nginx.exe</executable>
    
    <!--
    SECTION: Installation
    These options are being used during the installation only.
    Their modification will not take affect without the service re-installation.
    -->
    
      <!--
        OPTION: serviceaccount
        Defines account, under which the service should run.
      -->
      <!--
      <serviceaccount>
        <domain>YOURDOMAIN</domain>
        <user>useraccount</user>
        <password>Pa55w0rd</password>
        <allowservicelogon>true</allowservicelogon>
      </serviceaccount>
      -->
      
      <!--
        OPTION: onfailure
        Defines a sequence of actions, which should be performed if the managed executable fails.
        Supported actions: restart, reboot, none
      -->
      <!--
      <onfailure action="restart" delay="10 sec"/>
      <onfailure action="restart" delay="20 sec"/>
      <onfailure action="reboot" />
      -->
      
      <!--
        OPTION: resetfailure
        Time, after which the Windows service resets the failure status.
        Default value: 1 day
      -->
      <!--
      <resetfailure>1 hour</resetfailure>
      -->
    
    <!--
    SECTION: Executable management
    -->
    
      <!-- 
        OPTION: arguments
        Arguments, which should be passed to the executable
      -->
      <!--
      <arguments>-classpath c:\cygwin\home\kohsuke\ws\hello-world\out\production\hello-world test.Main</arguments>
      -->
    
      <!-- 
        OPTION: startarguments
        Arguments, which should be passed to the executable when it starts
        If specified, overrides 'arguments'.
      -->
      
      <startarguments>-p %BASE%</startarguments>
      
      
      <!--
        OPTION: workingdirectory
        If specified, sets the default working directory of the executable
        Default value: Directory of the service wrapper executable.
      -->
      <!--
      <workingdirectory>C:\myApp\work</workingdirectory>
    -->
      
      <!--
        OPTION: priority
        Desired process priority.
        Possible values: Normal, Idle, High, RealTime, BelowNormal, AboveNormal
        Default value: Normal
      -->
      <priority>Normal</priority>
      
      <!-- 
        OPTION: stoptimeout
        Time to wait for the service to gracefully shutdown the executable before we forcibly kill it
        Default value: 15 seconds
      -->
      <stoptimeout>15 sec</stoptimeout>
        
      <!--
        OPTION: stopparentprocessfirst
        If set, WinSW will terminate the parent process before stopping the children.
        Default value: false
      -->
      <stopparentprocessfirst>false</stopparentprocessfirst>
      
      
      <!-- 
        OPTION: stopexecutable
        Path to an optional executable, which performs shutdown of the service.
        This executable will be used if and only if 'stoparguments' are specified.
        If 'stoparguments' are defined without this option, 'executable' will be used as a stop executable
      -->
      <!--
      <stopexecutable>%BASE%\stop.exe</stopexecutable>
      -->
    
      <!-- 
        OPTION: stoparguments
        Additional arguments, which should be passed to the stop executable during termination.
        This OPTION also enables termination of the executable via stop executable
      -->
      
      <stoparguments>-s quit</stoparguments>-->
      
    <!-- 
    SECTION: Service management 
    -->
        <!--
          OPTION: startmode
          Defines start mode of the service.
          Supported modes: Automatic, Manual, Boot, System (latter ones are supported for driver services only)
          Default mode: Automatic
        -->
        <startmode>Manual</startmode>
        
        <!--
          OPTION: delayedAutoStart
          Enables the Delayed Automatic Start if 'Automatic' is specified in the 'startmode' field.
          See the WinSW documentation to get info about supported platform versions and limitations.
        -->
        <!--<delayedAutoStart/>-->
        
        <!-- 
          OPTION: depend
          Optionally specifies services that must start before this service starts.
        -->
        <!--
        <depend>Eventlog</depend>
        <depend>W32Time</depend>
        -->
        
        <!--
          OPTION: waithint
          The estimated time required for a pending stop operation.
          Before the specified amount of time has elapsed, the service should make its next call to the SetServiceStatus function.
          Otherwise the service will be marked as non-responding
          Default value: 15 seconds
        -->
        <waithint>15 sec</waithint>
        
        <!--
          OPTION: sleeptime
          The time before the service should make its next call to the SetServiceStatus function.
          Do not wait longer than the wait hint. A good interval is one-tenth of the wait hint but not less than 1 second and not more than 10 seconds.
          Default value: 1 second
        -->
        <sleeptime>1 sec</sleeptime>
        
        <!--
          OPTION: interactive
          Indicates the service can interactwith the desktop.
        -->
        <!--
        <interactive/>
        -->
        
    <!-- 
    SECTION:Logging 
    -->
    
      <!--
        OPTION: logpath
        Sets a custom logging directory for all logs being produced by the service wrapper
        Default value: Directory, which contains the executor
      -->
      
        <logpath>%BASE%\logs</logpath>
      
      
      <!--
        OPTION: log
        Defines logging mode for logs produced by the executable.
        Supported modes:
          * append - Rust update the existing log
          * none - Do not save executable logs to the disk
          * reset - Wipe the log files on startup
          * roll - Rotate logs based on size
          * roll-by-time - Rotate logs based on time
          * rotate - Rotate logs based on size, (8 logs, 10MB each). This mode is deprecated, use "roll"
        Default mode: append
        
        Each mode has different settings. 
        See https://github.com/kohsuke/winsw/blob/master/doc/loggingAndErrorReporting.md for more details
      -->
      <log mode="append">
        <!--
        <setting1/>
        <setting2/>
      -->
      </log>
      
    <!--
    SECTION: Environment setup
    -->
      <!--
        OPTION: env
        Sets or overrides environment variables.
        There may be multiple entries configured on the top level.
      -->
      <!--
      <env name="MY_TOOL_HOME" value="C:\etc\tools\myTool" />
      <env name="LM_LICENSE_FILE" value="host1;host2" />
      -->
    
    
      <!--
        OPTION: download
        List of downloads to be performed by the wrapper before starting
      -->
      <!--
      <download from="http://www.google.com/" to="%BASE%\index.html" />
      
      Download and fail the service startup on Error:
      <download from="http://www.nosuchhostexists.com/" to="%BASE%\dummy.html" failOnError="true"/>
    
      An example for unsecure Basic authentication because the connection is not encrypted:
      <download from="http://example.com/some.dat" to="%BASE%\some.dat"
                auth="basic" unsecureAuth=“true”
                username="aUser" password=“aPassw0rd" />
    
      Secure Basic authentication via HTTPS:
      <download from="https://example.com/some.dat" to="%BASE%\some.dat"
                auth="basic" username="aUser" password="aPassw0rd" />
    
      Secure authentication when the target server and the client are members of the same domain or 
      the server domain and the client domain belong to the same forest with a trust:
      <download from="https://example.com/some.dat" to="%BASE%\some.dat" auth="sspi" />
      -->
    
    <!-- 
    SECTION: Other options 
    -->
      
      <!--
        OPTION: beeponshutdown
        Indicates the service should beep when finished on shutdown (if it's supported by OS).
      -->
      <!--
      <beeponshutdown/> 
      -->
      
    <!--
    SECTION: Extensions
    This configuration section allows specifying custom extensions.
    More info is available here: https://github.com/kohsuke/winsw/blob/master/doc/extensions/extensions.md
    -->
    
    <!--
    <extensions>
      Extension 1: id values must be unique
      <extension enabled="true" id="extension1" className="winsw.Plugins.SharedDirectoryMapper.SharedDirectoryMapper">
        <mapping>
          <map enabled="false" label="N:" uncpath="\\UNC"/>
          <map enabled="false" label="M:" uncpath="\\UNC2"/>
        </mapping>
      </extension>
      ...
    </extensions>
    -->
    
    </configuration>
    
    ```


接下来只要安装服务即可（需要管理员权限 ）：进入nginx根目录执行  nginxsvc.exe install，如果没报错，执行命令：net start nginx，打开[http://localhost/](http://localhost/) ，可以访问正常就大功告成啦！

如果想要停止服务，执行：

```bash
net stop nginx
```

将服务删除从SCM中删除：

```bash
sc.exe delete nginx
```

（使用 sc.exe而不是sc，因为在powershell中，sc是Set-Content的别名）

上述几个命令都在WinSW中有对应的命令，如

启动服务 ：

```bash
C:\software\nginx-1.13.3\nginxsvc.exe start
```

停止服务： 

```bash
C:\software\nginx-1.13.3\nginxsvc.exe stop
```

重启服务： 

```bash
C:\software\nginx-1.13.3\nginxsvc.exe restart
```

删除服务：

```bash
C:\software\nginx-1.13.3\nginxsvc.exe uninstall
```

所以如果你想更geek一些，可以把 C:\\software\\nginx-1.13.3\\nginxsvc.exe 加入系统环境变量，这样重新载入nginx的配置就只要在任意位置执行nginxsvc restart 即可，是不是很赞？

![](https://static.oschina.net/uploads/space/2017/0723/173338_GWgG_1389094.jpg)