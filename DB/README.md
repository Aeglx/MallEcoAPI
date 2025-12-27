# 数据库管理模块

该模块提供了完整的数据库初始化和管理功能，包括自动创建数据库、数据表结构以及插入初始数据。

## 目录结构

```
DB/
├── database-initialization.sql  # 数据库初始化SQL脚本
├── database-manager.js          # 数据库管理工具类
├── generate-bcrypt.js           # bcrypt密码生成工具
├── index.js                     # 模块入口文件
└── README.md                    # 说明文档
```

## 功能特性

1. **自动数据库创建**：检测并创建数据库（如果不存在）
2. **完整表结构**：包含RBAC系统表、核心业务表和系统配置表
3. **初始数据**：自动插入超级管理员角色、运营管理员角色、管理员账户和运营账户
4. **密码安全**：使用bcrypt加密存储密码
5. **配置灵活**：支持从.env文件读取数据库配置

## 快速开始

### 1. 配置数据库连接

在项目根目录的 `config/.env` 文件中配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost              # 数据库主机地址
DB_PORT=3306                   # 数据库端口
DB_USERNAME=root               # 数据库用户名
DB_PASSWORD=your_password      # 数据库密码
DB_NAME=malleco                # 数据库名称
DB_CHARSET=utf8mb4             # 数据库字符集
```

### 2. 初始化数据库

运行以下命令自动初始化数据库：

```bash
node DB/database-manager.js
```

或者使用模块方式调用：

```javascript
const { initializeDatabase } = require('./DB');

initializeDatabase()
  .then(() => console.log('数据库初始化完成'))
  .catch(error => console.error('初始化失败:', error));
```

### 3. 验证初始化结果

初始化完成后，您可以使用以下账户登录系统：

#### 管理员账户
- **用户名**：admin
- **密码**：dav888
- **邮箱**：admin@malleco.com
- **角色**：超级管理员（拥有所有权限）

#### 运营账户
- **用户名**：operator
- **密码**：dav888
- **邮箱**：operator@malleco.com
- **角色**：运营管理员（负责日常运营管理工作）

> ⚠️ **安全提示**：请登录后立即修改默认密码！

## 数据库结构说明

### RBAC系统表

- `rbac_departments`：部门表
- `rbac_roles`：角色表
- `rbac_permissions`：权限表
- `rbac_users`：用户表（管理员用户）
- `rbac_user_roles`：用户角色关联表
- `rbac_role_permissions`：角色权限关联表

### 核心业务表

- `mall_user`：普通用户表
- `mall_wallet`：钱包表
- `mall_wallet_transaction`：钱包交易记录表
- `mall_file_directory`：文件目录表
- `mall_file`：文件表

### 系统配置表

- `system_config`：系统配置表

## 自定义密码

如果需要修改管理员密码，可以使用以下步骤：

1. 运行bcrypt密码生成工具：

```bash
node DB/generate-bcrypt.js
```

2. 输入新密码，工具会自动更新数据库初始化脚本中的密码哈希值。

## 依赖项

- `mysql2`：MySQL数据库驱动
- `dotenv`：环境变量加载
- `bcrypt`：密码加密

## API参考

### DatabaseManager类

```javascript
const { DatabaseManager } = require('./DB');
const manager = new DatabaseManager();
```

#### initialize()

初始化数据库，包括创建数据库、数据表和插入初始数据。

#### checkConnection()

检查数据库连接是否正常。

#### getDatabaseInfo()

获取数据库信息（数据库名称和MySQL版本）。

## 注意事项

1. 确保MySQL服务器已启动并允许远程连接
2. 确保数据库用户具有创建数据库和表的权限
3. 生产环境中请修改默认的管理员密码
4. 定期备份数据库以防止数据丢失

## 许可证

MIT
