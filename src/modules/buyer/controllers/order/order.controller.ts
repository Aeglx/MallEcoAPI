import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('订单管理')
@Controller('buyer/order')
export class OrderController {
  // 订单相关接口
}
