---
title: MySQL常用命令
date: 2016-10-12 12:39
categories:
  - [技术, 后端, 数据库]
tags:
  - MySQL
---

#  一、InnoDB和MyISAM的区别

MyISAM类型不支持事务处理等高级处理，但是执行速度比InnoDB类型快

InnoDB类型提供了具有事务(commit)、回滚(rollback)和崩溃修复能力(crash recovery capabilities)、多版本并发控制(multi-versioned concurrency control)的事务安全(transaction-safe (ACID compliant))型表，但是效率低。
<!-- more -->
# 二、查看表结构：

```sql
DESC TABLE_NAME;
```

# 三、修改mysql编码：

打开MySQL Server目录下的my.ini文件修改default-character-set值为utf8，然后重启mysql服务

# 四、查看mysql版本的四种方法：

## 1：在终端下执行命令：mysql -V

```bash
$ mysql -V
mysql Ver 14.7 Distrib 4.1.10a, for redhat-linux-gnu (i686)
```

## 2：在mysql的shell中执行 status命令：

```bash
mysql> status;
mysql Ver 14.7 Distrib 4.1.10a, for redhat-linux-gnu (i686)
Connection id:          416
SSL:                    Not in use
Current pager:          stdout
Using outfile:          ''
Using delimiter:        ;
Server version:         3.23.56-log
Protocol version:       10
Connection:             Localhost via UNIX socket
Client characterset:    latin1
Server characterset:    latin1
UNIX socket:            /tmp/mysql_3311.sock
Uptime:                 62 days 21 hours 21 min 57 sec
Threads: 1 Questions: 584402560 Slow queries: 424 Opens: 59664208 Flush tables: 1 Open tables: 64 Queries per second avg: 107.551
```


## 3：在help里面查找

在终端下执行命令：mysql --help | grep Distrib

```bash
$ mysql --help | grep Distrib
mysql Ver 14.7 Distrib 4.1.10a, for redhat-linux-gnu (i686)
```


## 4：使用mysql的函数

```bash
mysql> select version();
+-------------+
| version()   |
+-------------+
| 3.23.56-log |
+-------------+
1 row in set (0.00 sec)
```


# 五、修改mysql数据库密码：

1. 关闭正在运行的MySQL。

2. 打开DOS窗口，转到mysql\bin目录。

3. 输入mysqld --skip-grant-tables回车。如果没有出现提示信息，那就对了。

4. 再开一个DOS窗口(因为刚才那个DOS窗口已经不能动了)，转到mysql\bin目录。

5. 输入mysql回车，如果成功，将出现MySQL的shell

6. 连接权限数据库

   ```bash
   mysql> use mysql;
   ```


7. 改密码：
   ```bash
   mysql> update user set password=password("root") where user="root";
   ```


8. 刷新权限(必须的步骤)

   ```
   mysql> flush privileges;
   ```


9. 退出

    ```bash
    mysql> \q
    ```


10. 注销系统，再进入，开MySQL，使用用户名root和刚才设置的新密码root登陆。

# 六、MySQL命令行导出数据库：

1. 进入MySQL目录下的bin文件夹：cd MySQL中到bin文件夹的目录，例如：

   ```bash
   cd C:\Program Files\MySQL\MySQL Server 4.1\bin
   ```


(或者直接将windows的环境变量path中添加该目录)

2. 导出数据库：mysqldump -u 用户名 -p 数据库名 > 导出的文件名 ，例如：

   ```bash
   mysqldump --no-defaults -u root -p news > news.sql
   ```

   （输入后会让你输入进入MySQL的密码，如果导出单张表的话在数据库名后面输入表名即可，然后会看到文件news.sql自动生成到bin文件下  ）

# 七、MySQL命令行导入数据库：

1. 将要导入的.sql文件移至bin文件下，这样的路径比较方便

2. 同上面导出的第1步

3. 进入MySQL：mysql -u 用户名 -p，例如：

   ```bash
   mysql -u root -p
   ```
   (输入同样后会让你输入MySQL的密码)

4. 在MySQL-Front中新建你要建的数据库，这时是空数据库，如新建一个名为news的目标数据库

5. 输入：mysql>use 目标数据库名，例如：
   ```
   mysql> use news;
   ```


6. 导入文件：source 导入的文件名，例如：
   ```bash
   mysql> source news.sql; 
   ```

# 八、MySQL备份和还原

## 1、Win32下MySQL的备份与还原

### ① 备份

开始菜单 -> 运行 -> cmd 利用“cd \Program Files\MySQL\MySQL Server 5.0\bin”命令进入bin文件夹 | 利用“mysqldump  -u 用户名 -p databasename >exportfilename”导出数据库到文件，如mysqldump -u root -p voice>voice.sql，然后输入密码即可开始导出。

### ② 还原

进入MySQL Command Line Client，输入密码，进入到“mysql>”，输入命令"show databases；"，回车，看看有些什么数据库；建立你要还原的数据库，输入"create database voice；"，回车；切换到刚建立的数据库，输入"use voice；"，回车；导入数据，输入"source voice.sql；"，回车，开始导入，再次出现"mysql>"并且没有提示错误即还原成功。

## 2、Linux下MySQL的备份与还原

### ① 备份

`[root[@localhost](https://my.oschina.net/u/570656) ~]# cd /var/lib/mysql` (进入到MySQL库目录，根据自己的MySQL的安装情况调整目录)
`[root[@localhost](https://my.oschina.net/u/570656) mysql]# mysqldump -u root -p voice>voice.sql`，输入密码即可。

### ② 还原

#### 方法一：

`[root[@localhost](https://my.oschina.net/u/570656) ~]# mysql -u root -p` 回车，输入密码，进入MySQL的控制台"mysql>"，同1.2还原。

#### 方法二：

`[root[@localhost](https://my.oschina.net/u/570656) ~]# cd /var/lib/mysql` (进入到MySQL库目录，根据自己的MySQL的安装情况调整目录)
`[root[@localhost](https://my.oschina.net/u/570656) mysql]# mysql -u root -p voice<voice.sql`，输入密码即可。

# 九、开启远程访问权限：

## 1、改表法

可能是你的帐号不允许从远程登陆，只能在localhost。这个时候只要在localhost的那台电脑，登入mysql后，更改 "mysql" 数据库里的 "user" 表里的 "host" 项，从"localhost"改称"%"
```bash
mysql -u root -p
mysql> use mysql;
mysql> update user set host = '%' where user = 'root';
mysql> select host, user from user;
```

##   2、授权法

### 1、进入MySQL的shell：

```bash
d:\mysql\bin\>mysql -h localhost -u root
```

### 2、赋予任何主机访问数据的权限

```bash
mysql>GRANT ALL PRIVILEGES ON *.* TO 'root'@'%'WITH GRANT OPTION
```


例如，你想myuser使用mypassword从任何主机连接到mysql服务器的话。

```bash
grant all privileges on *.* to 'root'@'%' identified by 'root' with grant option;
```

如果你想允许用户myuser从ip为192.168.1.6的主机连接到mysql服务器，并使用mypassword作为密码

```bash
GRANT ALL PRIVILEGES ON *.* TO 'myuser'@'192.168.1.3'IDENTIFIED BY
'mypassword' WITH GRANT OPTION;
```

### 3、修改生效

```bash
mysql>flush privileges;
```

### 4、退出MySQL服务器

这样就可以在其它任何的主机上以root身份登录

```bash
mysql> EXIT
```