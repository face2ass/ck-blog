---
title: MongoDB 聚合查询
date: 2024-03-18 17:17:59
tags:
---
ps：以前都在 iteye 写博文，现在工作换了，转战前端，基本告别了 java 和 python，就把那里的博客迁过来了～～～



出于对性能的要求，公司希望把 Mysql 的数据迁移到 MongoDB 上，于是我开始学习 Mongo 的一些 CRUD 操作，由于第一次接触 NoSQL，还是有点不习惯。

先吐个槽，公司的 Mongo 版本是 2.6.4，而用的 java 驱动包版本是超级老物 2.4 版。当时一个 “如何对分组后的文档进行筛选” 这个需求头痛了很久，虽然 shell 命令下可以使用 Aggregation 很方便地解决，但是 java 驱动包从 2.9.0 版本才开始支持该特性，我至今没有找到不用 Aggregation 解决上述需求的办法。只能推荐公司升级驱动包版本，希望没有后续的兼容问题。

Mongo2.2 版本后开始支持 Aggregation Pipeline，而 java 驱动包从 2.9.0 版本才开始支持 2.2 的特性，2.9 版本是 12 年发布的，mongodb 在 09 年就出现了，似乎 Mongo 对 java 的开发者不怎么友好←_←

MongoDB 目前提供了三个可以执行聚合操作的命令：aggregate、mapReduce、group。三者在性能和操作的优劣比较见官网提供的表格 Aggregation Commands Comparison，这里不再赘述细节。

aggregate、mapReduce、group 原型及内部实现
我从官网总结出来了这三个函数的原型及底层封装的命令

函数名：db.collection.group ()

函数原型：

db.collection.group(
{
key,
reduce,
initial
[, keyf]
[, cond]
[, finalize]
}
)
封装的命令：

db.runCommand(
{
group:
{
ns: <namespace>,
key: <key>,
$reduce: <reduce function>,
$keyf: <key function>,
cond: <query>,
finalize: <finalize function>
}
}
)
函数名：db.collection.mapReduce ()

函数原型：

db.collection.mapReduce(
<map>,
<reduce>,
{
out: <collection>,
query: <document>,
sort: <document>,
limit: <number>,
finalize: <function>,
scope: <document>,
jsMode: <boolean>,
verbose: <boolean>
}
)
封装的命令：

db.runCommand(
{
mapReduce: <collection>,
map: <function>,
reduce: <function>,
finalize: <function>,
out: <output>,
query: <document>,
sort: <document>,
limit: <number>,
scope: <document>,
jsMode: <boolean>,
verbose: <boolean>
}
)
函数名：db.collection.aggregate ()

函数原型：

db.collection.aggregate(
pipeline,
options
)
封装的命令：



db.runCommand(
{
aggregate: "<collection>",
pipeline: [ <stage>, <...> ],
explain: <boolean>,
allowDiskUse: <boolean>,
cursor: <document>
}
)


Mysql 与 MongoDB 对聚合处理的对比
好记性不如烂笔头，下面通过操作来了解这几个函数和命令

1、准备测试数据
先准备 SQL 的测试数据（用来验证结果、比较 SQL 语句和 NoSQL 的异同）：

先创建数据库表：

create table dogroup (  
_id int,  
name varchar(45),  
course varchar(45),  
score int,  
gender int,  
primary key(_id)  
);
插入数据：

insert into dogroup (_id, name, course, score, gender) values (1, "N", "C", 5, 0);  
insert into dogroup (_id, name, course, score, gender) values (2, "N", "O", 4, 0);  
insert into dogroup (_id, name, course, score, gender) values (3, "A", "C", 5, 1);  
insert into dogroup (_id, name, course, score, gender) values (4, "A", "O", 6, 1);  
insert into dogroup (_id, name, course, score, gender) values (5, "A", "U", 8, 1);  
insert into dogroup (_id, name, course, score, gender) values (6, "A", "R", 8, 1);  
insert into dogroup (_id, name, course, score, gender) values (7, "A", "S", 7, 1);  
insert into dogroup (_id, name, course, score, gender) values (8, "M", "C", 4, 0);  
insert into dogroup (_id, name, course, score, gender) values (9, "M", "U", 7, 0);  
insert into dogroup (_id, name, course, score, gender) values (10, "E", "C", 7, 1);
接着准备 MongoDB 测试数据：

创建 Collection（等同于 SQL 中的表，该行可以不写，Mongo 会在插入数据时自动创建 Collection）

db.createCollection("dogroup")
插入数据：

db.dogroup.insert({"_id": 1,"name": "N",course: "C","score": 5,gender: 0})
db.dogroup.insert({"_id": 2,"name": "N",course: "O","score": 4,gender: 0})
db.dogroup.insert({"_id": 3,"name": "A",course: "C","score": 5,gender: 1})
db.dogroup.insert({"_id": 4,"name": "A",course: "O","score": 6,gender: 1})
db.dogroup.insert({"_id": 5,"name": "A",course: "U","score": 8,gender: 1})
db.dogroup.insert({"_id": 6,"name": "A",course: "R","score": 8,gender: 1})
db.dogroup.insert({"_id": 7,"name": "A",course: "S","score": 7,gender: 1})
db.dogroup.insert({"_id": 8,"name": "M",course: "C","score": 4,gender: 0})
db.dogroup.insert({"_id": 9,"name": "M",course: "U","score": 7,gender: 0})
db.dogroup.insert({"_id": 10,"name": "E",course: "C","score": 7,gender: 1})
以下操作可能逻辑上没有实际意义，主要是帮助熟悉指令

2、查询每门课程参与考试的人数
SQL 写法：
select course as '课程名', count(*) as '数量' from dogroup group by course;
MongoDB 写法：
① group 方式
db.dogroup.group({  
key : { course: 1 },  
initial : { count: 0 },  
reduce : function Reduce(curr, result) {  
result.count += 1;  
},  
finalize : function Finalize(out) {  
return {"课程名": out.course, "数量": out.count};  
}  
});
返回的格式如下：

{  
"课程名" : "C",  
"数量" : 4  
},  
{  
"课程名" : "O",  
"数量" : 2  
},  
{  
"课程名" : "U",  
"数量" : 2  
},  
{  
"课程名" : "R",  
"数量" : 1  
},  
{  
"课程名" : "S",  
"数量" : 1  
}
② mapReduce 方式
db.dogroup.mapReduce(  
function () {  
emit(  
this.course,  
{course: this.course, count: 1}  
);  
},  
function (key, values) {  
var count = 0;  
values.forEach(function(val) {  
count += val.count;  
});  
return {course: key, count: count};  
},  
{  
out: { inline : 1 },  
finalize: function (key, reduced) {  
return {"课程名": reduced.course, "数量": reduced.count};  
}  
}  
)
这里把 count 初始化为 1 的原因是，MongoDB 执行完 map 函数（第一个函数）后，如果 key 所对应的 values 数组的元素个数只有一个，reduce 函数（第二个函数）将不会被调用。

返回的格式如下：

{  
"_id" : "C",  
"value" : {  
"课程名" : "C",  
"数量" : 4  
}  
},  
{  
"_id" : "O",  
"value" : {  
"课程名" : "O",  
"数量" : 2  
}  
},  
{  
"_id" : "R",  
"value" : {  
"课程名" : "R",  
"数量" : 1  
}  
},  
{  
"_id" : "S",  
"value" : {  
"课程名" : "S",  
"数量" : 1  
}  
},  
{  
"_id" : "U",  
"value" : {  
"课程名" : "U",  
"数量" : 2  
}  
}
③ aggregate 方式
db.dogroup.aggregate(  
{  
$group:  
{  
_id: "$course",  
"数量": { $sum: 1 }  
}  
}  
)
返回格式如下：

{ "_id" : "S", "数量" : 1 }  
{ "_id" : "R", "数量" : 1 }  
{ "_id" : "U", "数量" : 2 }  
{ "_id" : "O", "数量" : 2 }  
{ "_id" : "C", "数量" : 4 }
以上三种方式中，group 得到了我们想要的结果，mapReduce 返回的结果只能嵌套在 values 里面，aggregate 必须返回_id，无法为分组的字段指定别名，但是无疑第三种是最简单的。



虽然上面的问题不影响程序在前台展现数据，但是对于一个略微有强迫症的开发者确实难以忍受的。本人才疏学浅，刚接触 Mongo，不知道后两者有没有可行的方法来获取想要的结果，希望网友指教。

3、查询 Docouments（等同于 SQL 中记录）数大于 2 的课程
SQL 写法：
select course, count(*) as count from dogroup group by course having count > 2;
MongoDB 写法：
① aggregate 方式（注意 $group 和 $match 的先后顺序）
db.dogroup.aggregate({  
$group: {  
_id: "$course",  
count: { $sum: 1 }  
}  
},{  
$match: {  
count:{  
$gt: 2  
}  
}  
});
目前尚未找到 group 和 mapReduce 对分组结果进行筛选的方法，欢迎网友补充

4、找出所有分数高于 5 分的考生数量及分数，返回的格式为 “分数、数量”
SQL 写法：
select score as '分数', count(distinct(name)) as '数量' from dogroup where score > 5 group by score;
MongoDB 写法：
① group 方式
db.dogroup.group({  
key : { score: 1 },  
cond : { score: {$gt: 5} },  
initial : { name:[] },  
reduce : function Reduce(curr, result) {  
var flag = true;  
for(i=0;i<result.name.length&&flag;i++){  
if(curr.name==result.name[i]){  
flag = false;  
}  
}  
// 如果result.name数组里面没有curr.name则添加curr.name  
if(flag){  
result.name.push(curr.name);  
}  
},  
finalize : function Finalize(out) {  
return {"分数": out.score, "数量": out.name.length};  
}  
});
② mapReduce 方式
db.dogroup.mapReduce(  
function () {  
if(this.score > 5){  
emit(  
this.score,  
{score: this.score, name: this.name}  
);  
}  
},  
function (key, values) {  
var reduced = {score: key, names: []};  
var json = {};//利用json对象的key去重  
for(i = 0; i < values.length; i++){  
if(!json[values[i].name]){  
reduced.names.push(values[i].name);  
json[values[i].name] = 1;  
}  
}  
return reduced;  
},  
{  
out: { inline : 1 },  
finalize: function (key, reduced) {  
return {"分数": reduced.score, "数量": reduced.names?reduced.names.length:1};  
}  
}  
)
③ aggregate 方式
db.dogroup.aggregate({  
$match: {  
score: {  
$gt: 5  
}  
}  
},{  
$group: {  
_id: {  
score: "$score",  
name: "$name"  
}  
}  
},{  
$group: {  
_id: {  
"分数": "$_id.score"  
},  
"数量": { $sum: 1 }  
}  
});


弄熟上面这几个方法，大部分的分组应用场景应该没大问题了。



这张图示可以更直观地理解（点击看大图）：

