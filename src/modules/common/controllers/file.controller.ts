import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('文件管理')
@Controller('common/file')
export class FileController {
  // 通用文件管理相关接口
}