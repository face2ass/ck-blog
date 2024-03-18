---
title: Maven使用与各配置项详解
date: 2016-10-12 13:37
categories:
  - [技术, 后端]
tags:
  - Maven
---

### Maven获取构件在仓库中的唯一存储路径的方式：

1. 基于groupId准备路径，将句点分隔符转成路径分隔符，就是将  "."  转换成 "/" ，例如： org.testng转化为org/testng
2. 基于artifactId准备路径，将artifactId连接到后面：org/testng/testng
3. 使用version准备路径，将version连接到后面：org/testng/testng/5.8<!-- more -->
4. 将artifactId于version以分隔符连字号连接到后面：org/testng/testng/5.8/tesng-5.8
5. 判断如果构件有classifier，就要在 第4项 后增加 分隔符连字号 再加上 classifier，org/testng/testng/5.8/tesng-5.8-jdk5
6. 检查构件的extension，如果extension存在，则加上句点分隔符和extension，而extension是由packing决定的，org/testng/testng/5.8/tesng-5.8-jdk5.jar


### 用户配置和全局配置：

全局配置即${M2_HOME}/conf/setting.xml，用户配置即${user.home}/.m2/settings.xml。执行maven命令时，如果检测到同一个属性分别出现在用户配置和全局配置中，前者会覆盖后者。
（注：如果maven进行升级，会把所有的配置清除，所以必须要提前备份${M2_HOME}/conf/setting.xml文件，因此一般情况下不推荐配置全局的settings.xml。）

尽量不要使用内嵌的maven，因为除了IDE，我们经常会在命令行使用maven，若版本不一致，容易造成构建版本不一致。



### Maven仓库：

**一、本地仓库**
本地仓库是远程仓库的一个缓冲和子集，Maven所需要的任何构件都是直接从本地仓库获取的。如果本地仓库没有，它会首先尝试从远程仓库下载构件至本地仓库，然后再使用本地仓库的构件。需要注意的是，当我们运行install的时候，Maven实际上是将项目生成的构件安装到了本地仓库，也就是说，只有install了之后，其它项目才能使用此项目生成的构件。
一个用户会对应的拥有一个本地仓库，Maven的缺省本地仓库地址为${user.home}/.m2/repository，可以通过修改setting.xml来修改本地仓库位置：

```xml
<settings>
    …
    <localRepository> D:/java/repository</localRepository>
    …
</settings>  
```


也可以通过在运行时指定目录：

```bash
mvn clean install -Dmaven.repo.local=/home/juven/myrepo/
```


但是并不推荐这么做。

**二、远程仓库**
远程仓库的服务器地址需要通过pom.xml修改：

```xml
<project>
    ...
    <repositories>
        <repository>
            <id>maven-net-cn</id>
            <name>Maven China Mirror</name>
            <url>http://maven.net.cn/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <id>maven-net-cn</id>
            <name>Maven China Mirror</name>
            <url>http://maven.net.cn/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>
    ...
</project>
```


其中，pluginRepositories是指插件下载的仓库
注：私服是一种特殊的远程仓库，它是架设在局域网内的仓库服务，私服代理广域网上的远程仓库，供局域网内的Maven用户使用。当Maven需要下载构件的时候，它从私服请求，如果私服上不存在该构件，则从外部的远程仓库下载，缓存在私服上之后，再为Maven的下载请求提供服务。我们还可以把一些无法从外部仓库下载到的构件上传到私服上。

**三、中央仓库**
中央仓库即默认的远程仓库，maven在安装的时候，自带的就是中央仓库的配置。该配置文件在${M2_HOME}/lib/maven-2.0.10-uber.jar里定义，打开该文件能找到超级POM：\org\apache\maven\project\pom-4.0.0.xml ，它是所有Maven POM的父POM，所有Maven项目继承该配置。
如果要更改中央仓库，则需要修改setting.xml，比如：

```xml
<mirrors>
    ...
    <mirror>
        <id>nexus-osc</id>
        <mirrorOf>central</mirrorOf>
        <name>Nexus osc</name>
        <url>http://maven.oschina.net/content/groups/public/</url>
    </mirror>
    ...
</mirrors>
```


这里<mirrorOf>的值为central，表示该配置为中央仓库的镜像，任何对于中央仓库的请求都会转至该镜像（用户也可以使用同样的方法配置其他仓库的镜像）



### profile节点介绍：

profile可以定义在settings.xml或pom.xml中，不同的位置能够定义的配置信息不同。
**1、定义在settings.xml中**
定义在settings.xml中时意味着该profile是全局的，它会对所有项目或者某一用户的所有项目都产生作用。因此，只能定义一些相对而言范围宽泛一点的配置信息包括<repositories>（远程仓库）、<pluginRepositories>（插件仓库）和<properties>（键值对），这里定义的键值对可以在pom.xml中使用。
**2、定义在pom.xml中**
pom.xml中的profile可以定义更多的信息，主要有： <repositories>、<pluginRepositories>、 <dependencies>（包依赖）、 <plugins>（插件依赖）、<properties>、 <dependencyManagement>（依赖管理）、 <distributionManagement>，还有build元素下面的子元素，主要包括：<defaultGoal>、<resources>、<testResources>、<finalName>
**3、激活profiles**

```xml
<profiles>
    <profile>
        <id>profileTest1</id>
        <properties>
            <hello>world</hello>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>

    <profile>
        <id>profileTest2</id>
        <properties>
            <hello>andy</hello>
        </properties>
    </profile>
</profiles>
```


我们可以在profile中的activation元素中指定激活条件，当没有指定条件，然后指定activeByDefault为true的时候就表示当没有指定其他profile为激活状态时，该profile就默认会被激活。所以当我们调用mvn package的时候上面的profileTest1将会被激活，但是当我们使用mvn package –P profileTest2的时候将激活profileTest2，而这个时候profileTest1将不会被激活。

[参考资料](http://haohaoxuexi.iteye.com/blog/1900568)



### 生命周期：

Maven有三套独立的生命周期，分别是：
Clean Lifecycle 在进行真正的构建之前进行一些清理工作。
Default Lifecycle 构建的核心部分，编译，测试，打包，部署等等。
Site Lifecycle 生成项目报告，站点，发布站点。
在一个生命周期中，运行某个阶段的时候，它之前的所有阶段都会被运行
—Clean生命周期一共包含了三个阶段：

- pre-clean  执行一些需要在clean之前完成的工作
- clean  移除所有上一次构建生成的文件
- post-clean  执行一些需要在clean之后立刻完成的工作

—Default是Maven最重要的生命周期，绝大部分工作都发生在这个这里，包括以下阶段：

- validate   验证项目是否正确，所有必需的信息是否可用。
- generate-sources
- process-sources
- generate-resources
- process-resources   复制并处理资源文件，至目标目录，准备打包。
- compile   编译项目的源代码。
- process-classes
- generate-test-sources
- process-test-sources
- generate-test-resources
- process-test-resources   复制并处理资源文件，至目标测试目录。
- test-compile   编译测试源代码。
- process-test-classes
- test   使用合适的单元测试框架运行测试。这些测试代码不会被打包或部署。
- prepare-package
- package   接受编译好的代码，打包成可发布的格式，如 JAR 。
- pre-integration-test
- integration-test
- post-integration-test
- verify
- install   将包安装至本地仓库，以让其它项目依赖。
- deploy   将最终的包复制到远程的仓库，以让其它开发人员与项目共享。

各阶段的解释：http://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html

—Site生命周期一共包含了三个阶段：

- pre-site   执行一些需要在生成站点文档之前完成的工作
- site   生成项目的站点文档
- post-site   执行一些需要在生成站点文档之后完成的工作，并且为部署做准备
- site-deploy   将生成的站点文档部署到特定的服务器上



### 常见问题：

解决eclipse中update maven之后jre被改成1.5的问题：
添加或修改pom.xml配置

```xml
<pluginManagement>
    ...
    <plugin>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>2.3.2</version>
        <!-- jre1.5解决办法 -->
        <configuration>
            <source>1.7</source>
            <target>1.7</target>
        </configuration>
    </plugin>
    ...
</pluginManagement>
```


项目右键->Maven->Update Project...

eclipse新建maven项目JDK版本过低解决办法：
修改settings.xml文件如下：

```xml
<profile>
    <id>jdk-1.6</id>
    <activation>
        <activeByDefault>true</activeByDefault>
        <jdk>1.6</jdk>
    </activation>
    <properties>
        <maven.compiler.source>1.6</maven.compiler.source>
        <maven.compiler.target>1.6</maven.compiler.target>
        <maven.compiler.compilerVersion>1.6</maven.compiler.compilerVersion>
    </properties>
</profile>
```



jar包下载不成功解决办法：
方法1、进入项目根目录->shift+鼠标右键->在此处打开命令窗口->执行mvn clean命令会删除该目录的target文件夹->执行mvn install -U命令强制更新jar包（或者用连起来的命令mvn clean install -U）

方法2、关闭myeclipse，删除Users目录下的.m2文件夹，然后打开myeclipse重新执行maven install（不推荐，全部重新下载太慢）

maven在执行install之前会先执行maven test

GroupID是项目的名称。
ArtifactID是项目的模块名称，命名方式通常为：项目名称-模块名称
version为项目版本
如：
<groupId>org.springframework</groupId>
<artifactId>spring-context</artifactId>
<version>4.0.2.RELEASE</version>

Maven 安装 JAR 包的命令是：
mvn install:install-file -Dfile=jar包的位置 -DgroupId=上面的groupId -DartifactId=上面的artifactId -Dversion=上面的version -Dpackaging=jar

例如：
我下载的这个 jar 包是放到了 D:\mvn 目录下(D:\mvn\spring-context-support-3.1.0.RELEASE.jar)
那么我在 cmd 中敲入的命令就应该是：

```bash
mvn install:install-file -Dfile=D:\mvn\spring-context-support-3.1.0.RELEASE.jar -DgroupId=org.springframework -DartifactId=spring-context-support -Dversion=3.1.0.RELEASE -Dpackaging=jar
```




### 常用命令：

**maven clean compile——**
先执行clean：clean（clean插件的clean目标，下同）任务，清理默认输出目录target/；接着执行 resources : resources任务（未定义项目资源暂且略过）；最后执行compiler：compile任务，将项目主代码编译至target/classes目录
**mvn clean test——**
**mvn clean package——**
打包项目，默认类型是jar
**mvn clean install——**
**mvn archetype:generate——**
运行maven-archetype-plugin插件的generate目标，Maven 2建议这么写：mvn org.apache.maven.plugins:maven-archetype-plugin:2.0-alpha-5:generate（格式——groupId:artifactId:version:goal），该指令指定了archetype插件的版本，否则Maven 2会自动去下载最新版本，而Maven3回去下最新的稳定版。
新建一个目录，执行mvn archetype:generate，首次运行时，mvn会从远程"中央仓库"下载一些必需的文件到"本地仓库"，下载完成后，会自动进入交互模式，会让你输入一些基本信息，类似下面这样：

```bash
$ mvn archetype:generate
[INFO] Scanning for projects...
[INFO] Searching repository for plugin with prefix: 'archetype'.
[INFO] ------------------------------------------------------------------------
[INFO] Building Maven Default Project
[INFO]    task-segment: [archetype:create] (aggregator-style)
[INFO] ------------------------------------------------------------------------
[INFO] Preparing archetype:generate
[INFO] No goals needed for project - skipping
[INFO] Setting property: classpath.resource.loader.class => 'org.codehaus.plexus.velocity.ContextClassLoaderResourceLoader'.
[INFO] Setting property: velocimacro.messages.on => 'false'.
[INFO] Setting property: resource.loader => 'classpath'.
[INFO] Setting property: resource.manager.logwhenfound => 'false'.
[INFO] [archetype:generate]
Choose archetype:
1: internal -> org.appfuse.archetypes:appfuse-basic-jsf (AppFuse archetype for creating a web application with Hibernate, Spring and JSF)
2: internal -> org.appfuse.archetypes:appfuse-basic-spring (AppFuse archetype for creating a web application with Hibernate, Spring and Spring MVC)
3: internal -> org.appfuse.archetypes:appfuse-basic-struts (AppFuse archetype for creating a web application with Hibernate, Spring and Struts 2)
4: internal -> org.appfuse.archetypes:appfuse-basic-tapestry (AppFuse archetype for creating a web application with Hibernate, Spring and Tapestry 4)
5: internal -> org.appfuse.archetypes:appfuse-core (AppFuse archetype for creating a jar application with Hibernate and Spring and XFire)
6: internal -> org.appfuse.archetypes:appfuse-modular-jsf (AppFuse archetype for creating a modular application with Hibernate, Spring and JSF)
7: internal -> org.appfuse.archetypes:appfuse-modular-spring (AppFuse archetype for creating a modular application with Hibernate, Spring and Spring MVC)
8: internal -> org.appfuse.archetypes:appfuse-modular-struts (AppFuse archetype for creating a modular application with Hibernate, Spring and Struts 2)
9: internal -> org.appfuse.archetypes:appfuse-modular-tapestry (AppFuse archetype for creating a modular application with Hibernate, Spring and Tapestry 4)
10: internal -> org.apache.maven.archetypes:maven-archetype-j2ee-simple (A simple J2EE Java application)
11: internal -> org.apache.maven.archetypes:maven-archetype-marmalade-mojo (A Maven plugin development project using marmalade)
12: internal -> org.apache.maven.archetypes:maven-archetype-mojo (A Maven Java plugin development project)
13: internal -> org.apache.maven.archetypes:maven-archetype-portlet (A simple portlet application)
14: internal -> org.apache.maven.archetypes:maven-archetype-profiles ()
15: internal -> org.apache.maven.archetypes:maven-archetype-quickstart ()
16: internal -> org.apache.maven.archetypes:maven-archetype-site-simple (A simple site generation project)
17: internal -> org.apache.maven.archetypes:maven-archetype-site (A more complex site project)
18: internal -> org.apache.maven.archetypes:maven-archetype-webapp (A simple Java web application)
19: internal -> org.apache.struts:struts2-archetype-starter (A starter Struts 2 application with Sitemesh, DWR, and Spring)
20: internal -> org.apache.struts:struts2-archetype-blank (A minimal Struts 2 application)
21: internal -> org.apache.struts:struts2-archetype-portlet (A minimal Struts 2 application that can be deployed as a portlet)
22: internal -> org.apache.struts:struts2-archetype-dbportlet (A starter Struts 2 portlet that demonstrates a simple CRUD interface with db backing)
23: internal -> org.apache.struts:struts2-archetype-plugin (A Struts 2 plugin)
Choose a number or apply filter (format: [groupId:]artifactId, case sensitive contains): 15:
Choose org.apache.maven.archetypes:maven-archetype-quickstart version:
1: 1.0-alpha-1
2: 1.0-alpha-2
3: 1.0-alpha-3
4: 1.0-alpha-4
5: 1.0
6: 1.1
Choose a number: 6:
Define value for groupId: : com.company
Define value for artifactId: : project
Define value for version: : 1.0
Define value for package: : com.company.project
Confirm properties configuration:
groupId: com.company
artifactId: project
version: 1.0
package: com.company.project
Y: :
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating OldArchetype: maven-archetype-quickstart:RELEASE
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: com.company
[INFO] Parameter: packageName, Value: com.company.project
[INFO] Parameter: package, Value: com.company.project
[INFO] Parameter: artifactId, Value: project
[INFO] Parameter: basedir, Value: /home/local/rafale/projects/tmp
[INFO] Parameter: version, Value: 1.0
[INFO] OldArchetype created in dir: /home/local/rafale/projects/tmp/project
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESSFUL
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 54 seconds
[INFO] Finished at: Fri Aug 26 23:01:01 GMT 2011
[INFO] Final Memory: 10M/25M
[INFO] ------------------------------------------------------------------------
```


默认打包生成的jar是不能够直接运行的main方法的，因为带有main方法的类信息不会添加到manifest中(我们可以打开jar文件中的META-INF/MANIFEST.MF文件，将无法看到Main-Class一行)。为了生成可执行的jar文件，我们需要借助maven-shade-plugin插件，配置该插件如下：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>1.2.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>com.mycom.myapp.HelloMaven</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
```


项目在打包时会将该信息放到MANIFEST中。现在执行mvn clean install，待构建完成之后打开target/目录，可以看到hello-maven-1.0-SNAPSHOT.jar和original-hello- maven-1.0-SNAPSHOT.jar，前者是带有Main-Class信息的可执行jar，后者是原始的jar，打开hello- maven-1.0-SNAPSHOT.jar的META-INF/MANIFEST.MF，可以看到它包含这样一行信息：
Main-Class:com.mycom.myapp.HelloMaven
现在，在项目根目录中执行该jar文件：

```bash
D:\code\hello-world > java-jar target\hello-maven-1.0-SNAPSHOT.jar
```


，可以得到正确的输出了。
