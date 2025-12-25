# Swagger API文档最佳实践

## 📋 概述

本文档介绍在MallEco项目中编写Swagger API文档的最佳实践。

## 🎯 基本原则

1. **完整性**：所有公开API都应该有完整的文档
2. **准确性**：文档应该与实际实现保持一致
3. **清晰性**：使用清晰、简洁的描述
4. **示例性**：提供有意义的示例数据

## 📝 控制器文档

### 基本结构

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('模块名称')
@Controller('path')
@ApiBearerAuth('JWT-auth') // 如果需要认证
export class YourController {
  // ...
}
```

### 标签（Tags）

使用有意义的标签对API进行分组：

```typescript
@ApiTags('商品管理')  // ✅ 好
@ApiTags('商品')      // ❌ 不够具体
```

### 操作描述

```typescript
@ApiOperation({
  summary: '获取商品列表',        // 简短摘要
  description: '分页获取商品列表，支持筛选和排序'  // 详细描述
})
```

## 🔧 使用装饰器工具

项目提供了统一的Swagger装饰器，建议使用：

```typescript
import {
  ApiCreateOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiGetOperation,
  ApiListOperation,
  ApiCommonResponse,
} from '@shared/decorators/swagger.decorator';

// 创建操作
@Post()
@ApiCreateOperation('创建商品', '创建新的商品信息')
async create(@Body() dto: CreateGoodsDto) { }

// 更新操作
@Put(':id')
@ApiUpdateOperation('更新商品', '更新指定商品的信息')
async update(@Param('id') id: string, @Body() dto: UpdateGoodsDto) { }

// 删除操作
@Delete(':id')
@ApiDeleteOperation('删除商品', '删除指定商品')
async delete(@Param('id') id: string) { }

// 查询单个
@Get(':id')
@ApiGetOperation('获取商品详情', '根据ID获取商品详细信息')
async findOne(@Param('id') id: string) { }

// 查询列表
@Get()
@ApiListOperation('获取商品列表', '分页获取商品列表')
async findAll(@Query() query: PaginationDto) { }
```

## 📦 DTO文档

### 基本DTO

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateGoodsDto {
  @ApiProperty({
    description: '商品名称',
    example: 'iPhone 15 Pro',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '商品价格',
    example: 9999.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: '商品描述',
    example: '最新款iPhone，性能强劲',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### 响应DTO

```typescript
export class GoodsResponseDto {
  @ApiProperty({ description: '商品ID', example: 'goods123' })
  id: string;

  @ApiProperty({ description: '商品名称', example: 'iPhone 15 Pro' })
  name: string;

  @ApiProperty({ description: '商品价格', example: 9999.99 })
  price: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T10:00:00Z' })
  createTime: string;
}
```

## 🔐 认证文档

### JWT认证

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')  // 使用配置的认证名称
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() { }
```

### 可选认证

```typescript
// 某些接口可能不需要认证，不要添加@ApiBearerAuth
@Get('public')
async getPublicData() { }
```

## 📊 响应文档

### 成功响应

```typescript
@ApiResponse({
  status: 200,
  description: '操作成功',
  type: GoodsResponseDto,  // 使用DTO类型
})
```

### 错误响应

```typescript
@ApiResponse({ status: 400, description: '请求参数错误' })
@ApiResponse({ status: 401, description: '未授权，请先登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '资源不存在' })
@ApiResponse({ status: 500, description: '服务器内部错误' })
```

### 使用通用响应装饰器

```typescript
import { ApiCommonResponse } from '@shared/decorators/swagger.decorator';

@Get()
@ApiCommonResponse()  // 自动添加常见错误响应
async findAll() { }
```

## 🔍 参数文档

### 路径参数

```typescript
import { ApiParam } from '@nestjs/swagger';

@Get(':id')
@ApiParam({
  name: 'id',
  description: '商品ID',
  type: String,
  example: 'goods123',
})
async findOne(@Param('id') id: string) { }
```

### 查询参数

```typescript
import { ApiQuery } from '@nestjs/swagger';

@Get()
@ApiQuery({
  name: 'page',
  required: false,
  type: Number,
  description: '页码，从1开始',
  example: 1,
})
@ApiQuery({
  name: 'size',
  required: false,
  type: Number,
  description: '每页数量',
  example: 20,
})
async findAll(
  @Query('page') page: number = 1,
  @Query('size') size: number = 20,
) { }
```

### 使用分页装饰器

```typescript
import { ApiPaginationQuery } from '@shared/decorators/swagger.decorator';

@Get()
@ApiPaginationQuery()  // 自动添加page、size、sort参数
async findAll(@Query() query: PaginationDto) { }
```

## 📄 请求体文档

```typescript
import { ApiBody } from '@nestjs/swagger';

@Post()
@ApiBody({ type: CreateGoodsDto })
async create(@Body() dto: CreateGoodsDto) { }
```

## 🎨 枚举文档

```typescript
import { ApiProperty } from '@nestjs/swagger';

enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderDto {
  @ApiProperty({
    description: '订单状态',
    enum: OrderStatus,
    example: OrderStatus.PAID,
  })
  status: OrderStatus;
}
```

## 📋 检查清单

在编写API文档时，确保：

- [ ] 所有公开接口都有`@ApiOperation`
- [ ] 所有DTO都有`@ApiProperty`或`@ApiPropertyOptional`
- [ ] 所有需要认证的接口都有`@ApiBearerAuth`
- [ ] 所有接口都有成功和错误响应文档
- [ ] 所有参数都有描述和示例
- [ ] 使用有意义的标签分组
- [ ] 描述清晰、准确
- [ ] 示例数据真实、有用

## 🚀 示例：完整的控制器

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiGetOperation,
  ApiListOperation,
  ApiCommonResponse,
} from '@shared/decorators/swagger.decorator';
import { CreateGoodsDto, UpdateGoodsDto, GoodsResponseDto } from '../dto/goods.dto';

@ApiTags('商品管理')
@Controller('goods')
@ApiBearerAuth('JWT-auth')
export class GoodsController {
  @Post()
  @ApiCreateOperation('创建商品', '创建新的商品信息')
  @ApiBody({ type: CreateGoodsDto })
  @ApiCommonResponse()
  async create(@Body() dto: CreateGoodsDto): Promise<GoodsResponseDto> {
    // ...
  }

  @Get()
  @ApiListOperation('获取商品列表', '分页获取商品列表，支持筛选和排序')
  @ApiCommonResponse()
  async findAll(@Query() query: any): Promise<GoodsResponseDto[]> {
    // ...
  }

  @Get(':id')
  @ApiGetOperation('获取商品详情', '根据ID获取商品详细信息')
  @ApiParam({ name: 'id', description: '商品ID', example: 'goods123' })
  @ApiCommonResponse()
  async findOne(@Param('id') id: string): Promise<GoodsResponseDto> {
    // ...
  }

  @Put(':id')
  @ApiUpdateOperation('更新商品', '更新指定商品的信息')
  @ApiParam({ name: 'id', description: '商品ID', example: 'goods123' })
  @ApiBody({ type: UpdateGoodsDto })
  @ApiCommonResponse()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoodsDto,
  ): Promise<GoodsResponseDto> {
    // ...
  }

  @Delete(':id')
  @ApiDeleteOperation('删除商品', '删除指定商品')
  @ApiParam({ name: 'id', description: '商品ID', example: 'goods123' })
  @ApiCommonResponse()
  async delete(@Param('id') id: string): Promise<void> {
    // ...
  }
}
```

## 📚 参考资源

- [NestJS Swagger文档](https://docs.nestjs.com/openapi/introduction)
- [Swagger/OpenAPI规范](https://swagger.io/specification/)
- [项目API文档指南](./API_DOCUMENTATION_GUIDE.md)

---

**最后更新**：2024-12-19

