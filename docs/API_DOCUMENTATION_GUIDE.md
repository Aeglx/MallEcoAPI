# MallEco API 文档使用指南

## 📖 文档概述

本文档介绍如何使用和查看MallEco系统的API文档。

## 🚀 访问API文档

### 本地开发环境

启动应用后，访问：
```
http://localhost:9000/api-docs
```

### 生产环境

根据实际部署地址访问：
```
https://api.malleco.com/api-docs
```

## 🔐 认证说明

### JWT认证

大部分API接口需要JWT认证，使用方式：

1. **获取Token**
   - 调用登录接口：`POST /auth/login`
   - 获取返回的`accessToken`

2. **使用Token**
   - 在Swagger UI中点击右上角的"Authorize"按钮
   - 输入：`Bearer <your-token>`
   - 或者直接在请求头中添加：
     ```
     Authorization: Bearer <your-token>
     ```

### 认证流程示例

```bash
# 1. 登录获取Token
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# 响应示例
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 3600
}

# 2. 使用Token调用API
curl -X GET http://localhost:9000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📚 API分类

### 核心业务模块

#### 1. 认证模块 (`/auth`)
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /auth/profile` - 获取当前用户信息
- `POST /auth/refresh-token` - 刷新Token

#### 2. 用户管理 (`/users`)
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

#### 3. 商品管理 (`/goods`)
- `GET /goods` - 获取商品列表
- `GET /goods/:id` - 获取商品详情
- `POST /goods` - 创建商品
- `PUT /goods/:id` - 更新商品
- `DELETE /goods/:id` - 删除商品

#### 4. 订单管理 (`/orders`)
- `GET /orders` - 获取订单列表
- `GET /orders/:id` - 获取订单详情
- `POST /orders` - 创建订单
- `PUT /orders/:id` - 更新订单状态
- `DELETE /orders/:id` - 取消订单

#### 5. 即时通讯 (`/im`)
- `POST /im/message/send` - 发送消息
- `GET /im/message/history/:userId` - 获取消息历史
- `GET /im/message/unread/:userId` - 获取未读消息数
- `POST /im/message/read` - 标记消息已读
- `GET /im/message/conversations/:userId` - 获取会话列表

### 统计模块

- `/statistics/sales` - 销售统计
- `/statistics/orders` - 订单统计
- `/statistics/users` - 用户统计
- `/statistics/financial` - 财务统计
- `/statistics/dashboard` - 仪表盘数据

### 系统管理模块

- `/system/config` - 系统配置
- `/system/log` - 系统日志
- `/system/monitor` - 系统监控
- `/system/backup` - 系统备份

## 🛠️ Swagger UI功能

### 1. 接口测试

在Swagger UI中可以直接测试接口：

1. 找到要测试的接口
2. 点击"Try it out"按钮
3. 填写参数
4. 点击"Execute"执行
5. 查看响应结果

### 2. 参数说明

每个接口都有详细的参数说明：
- **必填参数**：标记为红色星号 `*`
- **可选参数**：无标记
- **参数类型**：显示参数的数据类型
- **示例值**：提供示例数据
- **描述**：参数用途说明

### 3. 响应示例

每个接口都包含：
- **成功响应**：200状态码的响应示例
- **错误响应**：各种错误状态的响应示例

### 4. 模型定义

点击"Schemas"可以查看所有数据模型的定义。

## 📝 请求示例

### JavaScript/TypeScript

```typescript
// 使用fetch
const response = await fetch('http://localhost:9000/api/goods', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <your-token>',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// 使用axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9000',
  headers: {
    'Authorization': 'Bearer <your-token>'
  }
});

const goods = await api.get('/api/goods');
```

### cURL

```bash
# GET请求
curl -X GET "http://localhost:9000/api/goods" \
  -H "Authorization: Bearer <your-token>"

# POST请求
curl -X POST "http://localhost:9000/api/orders" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "goodsId": "123",
    "quantity": 2
  }'
```

### Postman

1. 导入Swagger文档：
   - 在Swagger UI中点击"Download"按钮
   - 选择"JSON"格式
   - 在Postman中导入该JSON文件

2. 设置环境变量：
   - 创建环境变量`base_url` = `http://localhost:9000`
   - 创建环境变量`token` = `<your-token>`

3. 设置认证：
   - 在请求的Authorization标签中选择"Bearer Token"
   - Token值使用环境变量`{{token}}`

## 🔍 常见问题

### 1. 401 Unauthorized

**原因**：Token过期或无效

**解决方案**：
- 检查Token是否正确
- 重新登录获取新Token
- 使用刷新Token接口更新Token

### 2. 403 Forbidden

**原因**：权限不足

**解决方案**：
- 检查用户角色和权限
- 联系管理员分配相应权限

### 3. 400 Bad Request

**原因**：请求参数错误

**解决方案**：
- 检查必填参数是否都提供了
- 检查参数类型是否正确
- 查看接口文档中的参数说明

### 4. 404 Not Found

**原因**：接口路径错误或资源不存在

**解决方案**：
- 检查接口路径是否正确
- 检查资源ID是否存在

### 5. 500 Internal Server Error

**原因**：服务器内部错误

**解决方案**：
- 查看服务器日志
- 联系技术支持

## 📊 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "参数错误",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## 🎯 最佳实践

1. **使用HTTPS**：生产环境必须使用HTTPS
2. **Token安全**：不要在前端代码中硬编码Token
3. **错误处理**：正确处理各种错误状态码
4. **请求限流**：注意API限流规则，避免请求过于频繁
5. **版本控制**：关注API版本更新，及时适配新版本

## 📞 技术支持

如有问题，请联系：
- 邮箱：support@malleco.com
- 文档：https://docs.malleco.com
- GitHub：https://github.com/malleco

---

**最后更新**：2024-12-19

