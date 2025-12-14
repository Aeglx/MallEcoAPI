# MallEcoAPI 开发文档

## 1. 项目概述

MallEcoAPI是一个基于NestJS框架开发的电商系统API，提供了完整的电商业务功能支持。该项目采用模块化架构设计，支持微服务扩展，具备良好的可维护性和可扩展性。

## 2. 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | NestJS | ^11.0.1 |
| 数据库 | MySQL | ^3.15.3 |
| ORM | TypeORM | ^0.3.28 |
| 缓存 | Redis (可选) | ^5.8.2 |
| 消息队列 | RabbitMQ | ^0.10.9 |
| 搜索 | Elasticsearch | ^9.2.0 |
| 安全 | JWT | ^11.0.2 |
| API文档 | Swagger | ^11.2.3 |
| 部署 | Docker | - |

## 3. 项目结构

```
MallEcoAPI/
├── src/
│   ├── app.module.ts              # 应用主模块
│   ├── main.ts                    # 应用入口
│   ├── common/                    # 公共组件
│   ├── config/                    # 配置文件
│   ├── database/                  # 数据库相关
│   ├── infrastructure/            # 基础设施层
│   ├── modules/                   # 业务模块
│   │   ├── rbac/                  # 权限管理模块
│   │   ├── products/              # 商品管理模块
│   │   ├── system/                # 系统管理模块
│   │   ├── cache/                 # 缓存管理模块
│   │   ├── microservices/         # 微服务管理模块
│   │   ├── recommendation/        # 推荐管理模块
│   │   ├── service-mesh/          # 服务网格管理模块
│   │   └── statistics/            # 统计管理模块
│   ├── products/                  # 商品模块
│   ├── shared/                    # 共享组件
│   └── statistics/                # 统计模块
├── config/                        # 环境配置
├── DB/                            # 数据库脚本
└── docs/                          # 文档
```

## 4. 已实现模块

### 4.1 RBAC模块 (权限管理)

#### 4.1.1 功能描述

RBAC (Role-Based Access Control) 模块提供了完整的用户、角色、权限管理功能，支持基于角色的权限控制。

#### 4.1.2 核心实体

- **User**: 用户信息
- **Role**: 角色信息
- **Permission**: 权限信息
- **Menu**: 菜单信息
- **Department**: 部门信息
- **UserRole**: 用户角色关联
- **RolePermission**: 角色权限关联

#### 4.1.3 DTO文件

| DTO名称 | 用途 | 文件路径 |
|---------|------|----------|
| CreateUserDto | 创建用户 | `src/modules/rbac/dto/create-user.dto.ts` |
| UpdateUserDto | 更新用户 | `src/modules/rbac/dto/update-user.dto.ts` |
| CreateRoleDto | 创建角色 | `src/modules/rbac/dto/create-role.dto.ts` |
| UpdateRoleDto | 更新角色 | `src/modules/rbac/dto/update-role.dto.ts` |
| CreatePermissionDto | 创建权限 | `src/modules/rbac/dto/create-permission.dto.ts` |
| UpdatePermissionDto | 更新权限 | `src/modules/rbac/dto/update-permission.dto.ts` |
| CreateMenuDto | 创建菜单 | `src/modules/rbac/dto/create-menu.dto.ts` |
| UpdateMenuDto | 更新菜单 | `src/modules/rbac/dto/update-menu.dto.ts` |
| CreateDepartmentDto | 创建部门 | `src/modules/rbac/dto/create-department.dto.ts` |
| UpdateDepartmentDto | 更新部门 | `src/modules/rbac/dto/update-department.dto.ts` |

#### 4.1.4 控制器

- **UserController**: 用户管理
- **RoleController**: 角色管理
- **PermissionController**: 权限管理
- **MenuController**: 菜单管理
- **DepartmentController**: 部门管理

### 4.2 Products模块 (商品管理)

#### 4.2.1 功能描述

商品管理模块提供了商品的增删改查、搜索、推荐等功能。

#### 4.2.2 核心实体

- **Product**: 商品信息

#### 4.2.3 控制器

- **ProductsController**: 商品管理

## 5. 模块注册与访问问题

### 5.1 当前问题

在Swagger中显示的许多API标签和Schema无法访问的主要原因是：

1. **模块未在AppModule中注册**：
   - ProductsModule、SystemModule等模块虽然已实现，但未在AppModule的imports数组中注册
   - NestJS只能识别和加载在AppModule中明确注册的模块

2. **模块实现不完整**：
   - 部分模块只有服务层，没有控制器层
   - 控制器是处理HTTP请求的关键组件，缺少控制器就无法提供API接口

3. **模块完全未实现**：
   - 以下模块在Swagger中有标签，但在项目中完全不存在或只有空目录：
     - auth（认证与授权）
     - cart（购物车管理）
     - orders（订单管理）
     - wallet（钱包管理）
     - promotion（促销营销）
     - distribution（分销管理）
     - live（直播管理）
     - content（内容管理）
     - database（数据库管理）等

### 5.2 解决方案

1. **注册已实现的模块**：
   ```typescript
   // src/app.module.ts
   import { Module } from '@nestjs/common';
   import { RbacModule } from './modules/rbac/rbac.module';
   import { ProductsModule } from './products/products.module';
   import { SystemModule } from './modules/system/system.module';
   
   @Module({
     imports: [
       RbacModule,
       ProductsModule, // 添加商品模块
       SystemModule,   // 添加系统模块
       // 其他模块...
     ],
     // ...
   })
   export class AppModule {}
   ```

2. **完善不完整的模块**：
   - 为只有服务层的模块添加控制器层
   - 确保每个模块都有完整的CRUD操作实现

3. **实现缺失的模块**：
   - 根据业务需求逐步实现那些在Swagger中有标签但实际不存在的模块

## 6. DTO文件说明

### 6.1 CreateUserDto

```typescript
// 创建用户DTO
export class CreateUserDto {
  username: string;      // 用户名
  password: string;      // 密码
  email?: string;        // 邮箱
  phone?: string;        // 手机号
  realName?: string;     // 真实姓名
  nickname?: string;     // 昵称
  avatar?: string;       // 头像URL
  departmentId?: number; // 部门ID
  enabled?: boolean;     // 是否启用
  remark?: string;       // 备注
}
```

### 6.2 CreateRoleDto

```typescript
// 创建角色DTO
export class CreateRoleDto {
  name: string;        // 角色名称
  code: string;        // 角色代码
  description?: string;// 角色描述
  enabled?: boolean;   // 是否启用
  remark?: string;     // 备注
}
```

### 6.3 CreatePermissionDto

```typescript
// 创建权限DTO
export class CreatePermissionDto {
  name: string;        // 权限名称
  code: string;        // 权限标识
  description?: string;// 权限描述
  type?: number;       // 权限类型
  module?: string;     // 所属模块
  parentId?: number;   // 父级权限ID
  sort?: number;       // 排序号
}
```

## 7. 开发指南

### 7.1 环境配置

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **配置环境变量**：
   - 复制 `config/.env.example` 为 `config/.env`
   - 修改 `.env` 文件中的配置项

### 7.2 开发流程

1. **创建模块**：
   ```bash
   nest g module module-name
   ```

2. **创建控制器**：
   ```bash
   nest g controller module-name/controller-name
   ```

3. **创建服务**：
   ```bash
   nest g service module-name/service-name
   ```

4. **创建DTO**：
   - 在模块目录下创建 `dto` 文件夹
   - 创建对应的DTO文件

5. **创建实体**：
   - 在模块目录下创建 `entities` 文件夹
   - 创建对应的实体文件

### 7.3 启动项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 8. API文档

API文档使用Swagger自动生成，访问地址：
```
http://localhost:3001/api-docs
```

## 9. 部署

### 9.1 Docker部署

1. **构建镜像**：
   ```bash
   docker build -t malleco-api .
   ```

2. **启动容器**：
   ```bash
   docker-compose up -d
   ```

### 9.2 生产环境部署

使用 `docker-compose.prod.yml` 进行生产环境部署：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 10. 开发计划

### 10.1 近期计划

1. **完成模块注册**：将所有已实现模块注册到AppModule
2. **完善模块功能**：补充缺失的控制器和服务
3. **实现核心业务模块**：
   - 认证模块 (auth)
   - 购物车模块 (cart)
   - 订单模块 (orders)

### 10.2 远期计划

1. **微服务改造**：将单体应用拆分为微服务
2. **性能优化**：
   - 数据库索引优化
   - 缓存策略优化
   - 接口性能优化
3. **安全加固**：
   - 接口权限控制
   - 数据加密
   - 防止SQL注入

## 11. 注意事项

1. **代码规范**：遵循TypeScript和NestJS最佳实践
2. **测试覆盖**：确保每个模块都有足够的测试用例
3. **文档更新**：及时更新开发文档和API文档
4. **版本控制**：使用Git进行版本控制，遵循Git Flow工作流

## 12. 联系方式

如有问题或建议，请联系开发团队：
- 邮箱：[your-email@example.com]
- 团队：MallEco开发团队
