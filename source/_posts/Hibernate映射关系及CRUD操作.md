---
title: Hibernate映射关系及CRUD操作
date: 2016-10-12 13:22
categories:
  - [技术, 后端, 数据库]
tags:
  - Hibernate
---

### Hibernate对象的三种状态的概念及互相转化：

1. 瞬时状态或临时状态（Transient）：用new创建的对象，它没有持久化，没有处于Session中；
2. 持久状态（Persistent）：已经持久化，加入到了Session缓存中。如通过hibernate语句保存的对象；<!-- more -->
3. 三脱管状态或游离状态（Detached）：持久化对象脱离了Session的对象。如Session缓存被清空的对象。特点：已经持久化，但不在Session缓存中；


|                        | 临时状态（Transient） | 持久化状态（Persistent） | 游离状态（Detached） |
| ---------------------- | --------------------- | ------------------------ | -------------------- |
| 是否处于Session缓存中  | ×                     | √                        | ×                    |
| 数据库中是否有对应记录 | ×                     | √                        | √                    |


![](/images/hibernate.png)

### 游离对象和临时对象异同：

两者都不会被Session关联，对象属性和数据库可能不一致；

游离对象由持久化对象关闭Session而转化而来，在内存中还有对象所以此时就变成游离状态了；



### 深入理解Hibernate和SQL的关系：

在操作了hibernate的方法如save()等后，并没有直接生成sql语句，去操作数据库，而是把这些更新存入Session中，只有Session缓存要被更新时，底层的sql语句才能执行，数据存入数据库。下面举例说明：

一、Session.save(user)运行机理。

1. 把User对象加入缓存中，使它变成持久化对象；
2. 选用映射文件指定的标识生成ID；
3. 在Session清理缓存时候执行：在底层生成一个insert sql语句，把对象存入数据库；

PS：在你执行Session.save(user)后，在Session清理缓存前，如果你修改user对象属性值，那么最终存入数据库的值将是最后修改的值；此过程中ID不能被修改；

二、Session.delete(user)运行过程。

- 如果user是持久化对象，则执行删除操作，同样底层数据库的执行条件是：在Session清理缓存时候；
- 如果user是游离对象则先将user对象和Session关联，使之成为持久化对象，然后按照user是持久化对象的过程执行；

### load()和get()方法的区别：

- load()：hibernate对于load()方法认为该数据在数据库中一定存在，由于session中的缓存对于hibernate来说是个相当廉价的资源，所以在load时会先查一下session缓存看看该id对应的对象是否存在，若不存在就创建代理来延迟加载，如果在使用过程中发现了问题，只能抛异常，实际使用数据时才查询二级缓存和数据库；
- get()：而对于get()方法，hibernate会首先在session缓存中查找，然后在二级缓存中查找，还没有就查数据库，数据库中没有就返回null。

### **创建SessionFactory的三种方式：**

在以前的版本中，通常我们创建SessionFactory的方式是：

```java
configure.buildSessionFactory();
```

Hibernate4.0之后引入新特性——Service Register机制，创建方式为：

```java
StandardServiceRegistryBuilder serviceRegistryBuilder = new StandardServiceRegistryBuilder(); 
ServiceRegistry serviceRegistry = serviceRegistryBuilder.build(); 
SessionFactory sf = configuration.buildSessionFactory(serviceRegistry); 
```

但是紧接着在4.1之后的版本中，StandardServiceRegistryBuilder又被取消了，取而带之的做法是：

```java
Configuration configiguration = new Configuration().configure();
ServiceRegistryBuilder builder = new ServiceRegistryBuilder().applySettings(configiguration.getProperties());
ServiceRegistry registry = builder.buildServiceRegistry(); 
factory = configiguration.buildSessionFactory(registry);
```

创建 Configuration类的对象时执行 configure() 方法：

```java
Configuration cfg = new Configuration().configure();等同于Configuration cfg = new Configuration();
```

configure()方法默认会在classpath下面寻找hibernate.cfg.xml文件，如果没有找到该文件，系统会打印如下信息并抛出HibernateException异常。



### **关联关系映射（关联关系映射在数据库里没有任何区别，区别在于类）：**

**1、一对一外键单向关联**

主表类引用副表类，并在主表类的引用字段的get()方法上加[@OneToOne](https://my.oschina.net/u/3281835)

get()方法上加 @JoinColumn(name="该属性在数据库映射的字段名") 注解，在副表添加映射字段（缺省默认为.......）

**2、一对一外键双向关联**

主表类与副表类互相引用，并在各自引用字段的get()方法上加[@OneToOne](https://my.oschina.net/u/3281835)

建议在副表类设置mappedBy属性 @OneToOne(mappedBy="主控端引用的属性名") 注解，表示被控端不用额外添加外键关联，由对方设置（mappedBy的值是属性的get()方法逆向生成，但是通常与属性对应，可理解为等同，通常双向关联必设）

**3、联合主键关联**

被控端为有联合主键的类，主控端要在引用字段的get()方法上加 [@OneToOne](https://my.oschina.net/u/3281835)

get()方法上加上如下注解：

```java
@JoinColumns(value={
            @JoinColumn(name="主键1映射字段",referencedColumnName="所参考被控端主键1属性"),
            @JoinColumn(name="主键2映射字段",referencedColumnName="所参考被控端主键2属性"),
})
```

**4、组件映射**

被嵌入类不要写 @Entity 注解，因为不作为单独表在数据库映射

主类要有被嵌入类的引用，在其get()方法上添加 @Embedded 注解

**5、多对一外键单向关联**

多对一在“多”的一方添加“一”的一方的引用，并用 @ManyToOne 注解

用 @JoinColumn(name="多的一方添加的字段名") 指定添加映射字段名。（缺省默认为.......）

**6、一对多外键单向关联**

一对多在“一”的一方添加“多”的一方的集合的引用（通常用Set，但是当集合里的对象需要排序时可以使用List，并用@OrderBy()注解——较少使用。最好将成员变量初始化，如：

```java
private Set<User> users = new HashSet<User>();
```

并用 @OneToMany 注解

一对多若缺省@JoinColumn注解会被默认当做多对多的特殊情况处理，即生成一张中间表

避免此情况应加一个注解 @JoinColumn(name="多的一方添加的字段名")

数据库添加的映射字段总是加在多的一方，因为数据库没有集合的概念

**7、一对多&多对一双向外键关联（等同）**

通常把“多”的一方作为主控端，因为以数据库的角度，关联字段在“多”的一方

主控端和被控端互相引用，即在“一”的一方添加“多”的一方的集合的引用，在“多”的一方添加“一”的一方的引用

主控端在引用字段的get()方法上加 @ManyToOne 注解

被控端在引用字段的get()方法上加 @OneToMany 注解，并设置mappedBy属性为主控端引用的属性名

**8、多对多中间表单向关联**

主控端引用被控端，并在引用字段的get()方法上加 @ManyToMany

要手动定制中间表的内容，可添加如下注解：

```java
@JoinTable(name="role_user",
        joinColumns={@JoinColumn(name="userID")},          //joinColumns是主操作表的中间表列
        inverseJoinColumns={@JoinColumn(name="roleID")}    //inverseJoinColumns是副操作表的中间表列
)
```

用joinColumns而不是joinColumn是因为可能会有联合主键

8、多对多中间表双向关联

“一”的一方和“多”的一方互相引用，即在“一”的一方添加“多”的一方的集合的引用，在“多”的一方添加“一”的一方的引用，并在各自的引用字段的get()方法上加 @ManyToMany 注解，其中一方设置mappedBy属性



### **关联关系的CRUD操作——以**一对多&多对一双向外键关联为例：

cascade属性体现在CUD操作（Create Update Delete）：

1、**在“多”的一方加该注解 @ManyToOne(cascade=CascadeType.ALL)**

说明级联类型为所有操作都进行关联，即当sava()“多”的一方的对象时，同时sava()关联的对象（即“一”的一方）

若需要sava()“一”的一方的对象时同时sava()关联的对象，可用注解

```java
@OneToMany(mappedBy="role",cascade=CascadeType.ALL)
```

但是这时需要注意必须设定双向关联（即set关联对象），否则“多”的一方在数据库里映射的外键关联字段可能为空。

2、**当删除时如果被删除对象的cascade=CascadeType.ALL的话，会先级联删除关联的对象，然后删除自己，若关联得对象**
cascade的值也是CascadeType.ALL，则继续级联删除。

要在删除“多”的一方时避免此现象，可以在删以前先手动去掉关联关系，即把关联属性设为null，或自己拼hql语句，再删除对应记录，如果不删记录，该记录就变成垃圾数据；

删除“一”的一方时得必须自己拼hql语句。

总之两点规律：

- a.双向关系在程序中最好一定要要设定双向关联，这样可以从任何一方做增删改查
- b.双向一定要设定mappedBy注解

fetch属性体现在R操作（Read）：

ManyToOne的fetch默认值是FetchType.EAGER ——  `@ManyToOne(fetch=FetchType.EAGER)`，如果手动改成FetchType.LAZY，则会在用到关联字段属性时发送SQL语句

OneToMany的fetch默认值是FetchType.LAZY ——  `@ManyToOne(fetch=FetchType.LAZY)`

> PS：双向关系不要两边都设fetch=FetchType.EAGER，否则可能会发出多余的SQL语句，一般用FetchType.LAZY足矣

