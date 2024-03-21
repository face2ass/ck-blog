---
title: Sequelize常用操作
date: 2022-07-23 22:28:00
categories:
  - [技术, 后端]
tags:
  - Node
  - 数据库
  - Sequelize
---

Sequelize是一个基于Node.js的一款ORM框架，目前支持 Postgres, MySQL, MariaDB, SQLite 以及 Microsoft SQL Server数据库。支持事务、 关联关系、 预读、延迟加载、读取复制等功能。

Sequelize官网文档有点过于简洁了，数据库-模型之间的一些复杂但是非常实用的操作并没有收录，所以这篇文章是Sequelize对数据库一些常见操作的实践记录。基于我踩的一对坑撰写，可能有点像流水账，开始之前需要你对Sequelize的基本概念有所了解。
<!-- more -->
创建User表：
```javascript
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
      // 试了一下校验功能没起作用，希望了解这块的指点迷津
      // validate: {
      //   isUrl: {
      //     args: {
      //       require_host: false,
      //     },
      //     msg: '必须URL格式',
      //   },
      // },
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: true,
    // updatedAt: 'updated_at', // 设置更新时间字段
    // createdAt: 'created_at', // 设置创建时间字段
    defaultScope: {
      // 查询时默认不返回密码
      attributes: { exclude: ['password'] },
    },

  },
)
```

创建角色表：

```javascript
Role.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    timestamps: true,
  },
)
```

创建用户-角色中间表（多对多）：

```javascript
UserRole.init({
  status: DataTypes.INTEGER,
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  RoleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
  },
}, {
  sequelize,
  timestamps: true,
})
```

创建多对多关系：

```javascript
User.belongsToMany(Role, {through: UserRole})
Role.belongsToMany(User, {through: UserRole})
```

创建反馈表：

```javascript
Feedback.init(
  {
    content: {
      type: DataTypes.STRING,
    },
    attachments: {
      type: DataTypes.TEXT,
    },
    state: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: true,
  },
)
```

创建反馈与用户的一对多关系

```javascript
// 反馈创建人
Feedback.belongsTo(User, { foreignKey: 'CreatorId', as: 'Creator' })
// 反馈处理人
Feedback.belongsTo(User, { foreignKey: 'HandlerId', as: 'Handler' })
```

获取我的反馈列表：

```javascript
// 反馈列表包含处理人和创建人的id、username
await Feedback.findAll({
  include: [
    { model: User, as: 'Creator', attributes: ['id', 'username'] },
    { model: User, as: 'Handler', attributes: ['id', 'username'] },
  ],
})
```

查询产品列表：

```javascript
await Product.findAll({
  attributes: { exclude }, // 去掉产品表中的某些字段
  include: [{
    model: Category,
    through: {
      attributes: [], // 不需要联结表中的内容
    },
  }],
})
```

添加产品：

```javascript
const newProduct = Product.build({ // build非异步方法
  name: product.name,
  price: product.price,
  cover: product.cover,
  detail: product.detail,
})
if (product?.categories?.length) {
  // 获取分类实例列表
  const categoryEntityList = await Category.findAll({
    where: {
      id: product.categories,
    },
  })
  // 设置产品类别
  categoryEntityList.length && newProduct.setCategories(categoryEntityList)
}
await newProduct.save() // save是异步方法，需要await
```

删除产品：

```javascript
await Product.destroy({
  where: { id },
})
```