import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentSearchDto } from '../dto/department-search.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('RBAC - 部门管理')
@Controller('rbac/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @ApiResponse({ status: 201, description: '部门创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: '查询部门列表' })
  @ApiResponse({ status: 200, description: '获取部门列表成功' })
  findAll(@Query() searchDto: DepartmentSearchDto) {
    return this.departmentService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询部门' })
  @ApiResponse({ status: 200, description: '获取部门信息成功' })
  @ApiResponse({ status: 404, description: '部门不存在' })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新部门信息' })
  @ApiResponse({ status: 200, description: '部门信息更新成功' })
  @ApiResponse({ status: 404, description: '部门不存在' })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(+id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiResponse({ status: 200, description: '部门删除成功' })
  @ApiResponse({ status: 404, description: '部门不存在' })
  remove(@Param('id') id: string) {
    return this.departmentService.remove(+id);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树形结构' })
  @ApiResponse({ status: 200, description: '获取部门树成功' })
  getDepartmentTree() {
    return this.departmentService.getDepartmentTree();
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取部门下的用户列表' })
  @ApiResponse({ status: 200, description: '获取用户列表成功' })
  getDepartmentUsers(@Param('id') id: string) {
    return this.departmentService.getDepartmentUsers(+id);
  }

  @Post('move')
  @ApiOperation({ summary: '移动部门到新的父部门' })
  @ApiResponse({ status: 200, description: '部门移动成功' })
  moveDepartment(@Body() moveDto: { departmentId: number; parentId: number }) {
    return this.departmentService.moveDepartment(moveDto.departmentId, moveDto.parentId);
  }
}