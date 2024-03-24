---
title: Python随笔
date: 2017-05-16 00:29
categories:
  - [技术, 后端]
tags:
  - Python
---

Python的windows包：http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysql-python

python3.4安装mysql依赖：
<!-- more -->
安装mysql-connector for python3.4：http://dev.mysql.com/downloads/connector/python/

下载mysqlclient预编译文件：http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient

升级pip：python -m pip install --upgrade pip

安装mysqlclient：pip install mysqlclient-1.3.8-cp34-cp34m-win_amd64.whl



Linux下安装Python：

1、下载python源码包：

①通过wget命令下载

wget https://www.python.org/ftp/python/2.7.10/Python-2.7.10.tgz（默认下载到当前目录）

②Winscp发送到客户机

2、解压源码包：

tar -xzf Python-2.7.3.tgz（-z）

3、执行configure命令：

。。。。



查看Python版本号：

1. 
   ```bash
   python -V
   ```

2. 
   ```python
   import platform
   print platform.python_version()
   ```

3. 
   ```python
   import sys
   print sys.version
   print sys.version_info
   ```

退出python shell：Windows——Ctrl+Z或exit()；unix / Linux——Ctrl+D或exit()

http://www.lfd.uci.edu/~gohlke/pythonlibs/

http://woodpecker4org.b0.upaiyun.com/projects/django/django-stepbystep/newtest/doc/tut07.html

http://www.itnose.net/detail/6111283.html



for语句可用来遍历某一对象，还具有一个可选的else块。

如果for循环未被break终止，则执行else块中的语句。



序列

序列基本操作：

len()：求序列长度

+：拼接两个序列

*：重复序列元素

in：判断元素是否在序列中

max()：返回最大值

min()：返回最小值

cmp(arg1, arg2)：比较两个序列的值是否相同，若arg1>arg2，返回1；若arg1<arg2，返回-1；相等返回0

对序列进行切片，比如

str = "abcde"

str[1:4:2]

第一个参数表示开始截取的索引，不写默认是0，负数表示倒数第几个；

第二个参数表示结束的索引（不包含该元素），不写默认截取到结尾，负数表示倒数第几个；

第三个参数表示截取的步长，默认步长为1，负数表示从右向左取



字符串

1）Python中没有类似C语言中char这种类型的字符串，也就是说即使是单个字符也是字符串。

2）Python中的字符串一旦声明，是不能进行更改的，即可以获取某一位置的值，但是不能对其重新赋值改变内容。

3）Python中的字符串有两种数据类型：str类型和unicode类型。str类型采用的ASCII编码，也就是说它无法表示中文。

4）Python中使用正则表达式不用像Java正则表达式一样到处转义，因为Python提供了原始字符串，不对反斜杠及反斜杠后面的字符进行转义，声明原始字符串的方法是在字符串前面加上'r'或者'R'

5）Python中行尾结束符始终为'\n'，不用担心因运行环境不同引起的不兼容问题

6）Python中最常用的从键盘获取输入的函数是raw_input()和input()，前者以字符串的形式返回用户输入的一切内容，后者会自动进行类型转换（建议一般情况下使用raw_input()获取输入，避免程序中一些不必要的麻烦）

7）Python中的格式化输出和C语言类似，基本格式如下：

print '....%formmat..' %(var...)     当var只有一个时，括号可以省略。

8）Python把0、空字符串''和None看成 False，其他数值和非空字符串都看成 True

列表转字符串的方法：

①不推荐

```python
a = ['a','b','c','d'] 
content = '' 
for i in a: 
content = content + i 
```

②

```python
a = ['a','b','c','d'] 
content = '' 
content = ''.join(a) 
```

③

```python
a = ['a','b','c','d'] 
content = '' 
content = '%s%s%s%s' % tuple(a) 
```



正则：

http://www.runoob.com/python/python-reg-expressions.html

http://www.crifan.com/python_re_search_vs_re_findall/

http://www.cnblogs.com/huxi/archive/2010/07/04/1771073.html



列表

获取列表中某个元素的索引——列表名称.index(元素值)，如：name_list.index("陈凯")

修改某位置元素的值——列表名称[索引值] = 元素值

在列表中的某位置插入元素——列表名称.insert(索引值, 元素值)，如name_list.insert(4, "马云")

查询列表中某元素的重复次数——列表名称.count(元素值)

删除列表中的某索引的元素——列表名称.pop(索引值)，如果不写索引值默认是最后一个

删除列表中指定值得元素——列表名称.remove(元素值)

索引迭代

for index, name in enumerate(L):

print index, '-', name



元组

和列表最大的区别是元祖的内容一旦生成即不可以修改

创建只有一个元素的元组，元素后面必须加一个逗号



字典

score = {"Math": 86, "English": 91, "Chinese": 77}

获取字典的value—— score["Math"]或 score.get("Math")，前者会在字典不存在该Key时报错，后者会返回None

字典遍历——

1、迭代字典的key：for k in score: print v 或 for k in score.keys(): print v

2、迭代字典的value：for v in score.values():print v 或 for v in score.itervalues():print v

values() 和itervalues() 的区别：

values()会把一个 dict 转换成了包含 value 的list，但是 itervalues() 方法不会转换，它会在迭代过程中依次从 dict 中取出 value，所以 itervalues() 方法比 values() 方法节省了生成 list 所需的内存

3、迭代字典的每一组键值对（元祖形式）：for i in score. items(): print i 或 for k,v in score. items(): print k,v

items()和 values()类似，也有一个对应的 iteritems()

判断一个字典中是否含有某个Key——字典名称.has_key(Key名称)，如score.has_key("English")



函数：

函数形参的顺序：

1、位置匹配参数 func(args1,args2)

2、关键字匹配参数 func(args1,args2,key1=value1,key2=value2)

3、收集参数——

a、元组收集 func(args1,args2,key1=value1,key2=value2,*args3)

b、字典收集 func(args1,args2,key1=value1,key2=value2,*args3,**args4)



def myfun1(username, *keys)或def myfun2(username, **keys)等。

解释：

\* 用来传递任意个无名字参数，这些参数会一个Tuple的形式访问。

**用来处理传递任意个有名字的参数，这些参数用dict来访问。*



Python内建函数

sorted()：

reversed()：

enumerate()：

zip(seq1 [, seq2 [...]])：拉链方法，返回一个元祖列表 [(seq1[0], seq2[0] ...), (...)] ，每个元祖包含每个序列的第i个元素。列表的长度取决于最短的序列。这个方法可以用于同时循环两个列表，比如 for x,y in zip(list1, list2): print x,y

map(function, sequence[, sequence, ...])：

Return a list of the results of applying the function to the items of

the argument sequence(s).  If more than one sequence is given, the

function is called with an argument list consisting of the corresponding

item of each sequence, substituting None for missing values when not all

sequences have the same length.  If the function is None, return a list of

the items of the sequence (or a list of tuples if more than one sequence).



迭代器：



Pickle模块

dumps：在内存中序列化

dump：序列化到文件



Json模块



文件：



类里面的方法第一个参数都是self

在类里以双下划线__开头的成员变量是私有属性，否则就是公有，但是私有属性可以通过 instance._类名_属性名 的方式访问，不过只用于调试程序

系统在定义类时默认添加的属性称为内置属性，由前后两个下划线构成，如__dict__   __module__

成员函数如果访问变量时不写self.则默认访问全局变量

动态方法、静态方法、装饰器、内部类、魔术方法（__str__、）





python3 默认就是新式类了，python要用新式类就得带上object这个参数。 新式类 在多重继承的时候是广度优先遍历，老式类是深度优先



https://news.ycombinator.com/item?id=5124804



http://blog.csdn.net/wanghai__/article/details/6926428



![](/images/python.webp)

表示apply是一个关键字



Python自定义命令：

https://docs.python.org/2.7/library/optparse.html#optparse-standard-option-actions





列表推导式：http://www.jb51.net/article/63213.htm



enumerrate函数对一个列表或数组既要遍历索引又要遍历元素:http://blog.csdn.net/suofiya2008/article/details/5603861



OrderedDict.popitem(last=True) 。last为True是LIFO,即为堆栈，反之是FIFO，即为队列



装饰器：

http://blog.csdn.net/dreamcoding/article/details/8611578

```python
@dec2
@dec1
def func(arg1, arg2, ...):
  pass
```

可以还原成

```python
def func(arg1, arg2, ...):
  pass
func = dec2(dec1(func))
```



```python
@decomaker(argA, argB, ...) 
def func(arg1, arg2, ...): 
  pass
```

可以还原成

```python
func = decomaker(argA, argB, ...)(func)
```



Python下划线与命名规范：http://www.cnblogs.com/yaksea/archive/2011/08/30/2159416.html



Python模块的交叉引用问题（ImportError: cannot import name xxxxxx）

解决办法就是不要全局导入，可改为局部作用域内导入
