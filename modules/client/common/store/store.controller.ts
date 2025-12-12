import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('店铺管理')
@Controller('stores')
@UseGuards(AuthGuard('jwt'))
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * 创建店铺
   * @param req 请求对象
   * @param createStoreDto 创建店铺DTO
   * @returns 创建的店铺
   */
  @Post()
  @ApiOperation({ summary: '创建店铺' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: '店铺创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Req() req, @Body() createStoreDto: CreateStoreDto) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.create(createStoreDto, operatorInfo);
  }

  /**
   * 查询店铺列表
   * @returns 店铺列表
   */
  @Get()
  @ApiOperation({ summary: '查询店铺列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll() {
    return await this.storeService.findAll();
  }

  /**
   * 根据ID查询店铺
   * @param id 店铺ID
   * @returns 店铺
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询店铺' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async findOne(@Param('id') id: string) {
    return await this.storeService.findOne(id);
  }

  /**
   * 更新店铺信息
   * @param req 请求对象
   * @param id 店铺ID
   * @param updateStoreDto 更新店铺DTO
   * @returns 更新后的店铺
   */
  @Put(':id')
  @ApiOperation({ summary: '更新店铺信息' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async update(@Req() req, @Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.update(id, updateStoreDto, operatorInfo);
  }

  /**
   * 删除店铺
   * @param req 请求对象
   * @param id 店铺ID
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除店铺' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async remove(@Req() req, @Param('id') id: string) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    await this.storeService.remove(id, operatorInfo);
    return { message: 'Store deleted successfully' };
  }

  /**
   * 提交店铺审核
   * @param req 请求对象
   * @param id 店铺ID
   * @returns 提交审核后的店铺
   */
  @Post(':id/submit-audit')
  @ApiOperation({ summary: '提交店铺审核' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '提交审核成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async submitAudit(@Req() req, @Param('id') id: string) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.submitAudit(id, operatorInfo);
  }

  /**
   * 审核店铺通过
   * @param req 请求对象
   * @param id 店铺ID
   * @param body 请求体
   * @returns 审核通过后的店铺
   */
  @Post(':id/audit-pass')
  @ApiOperation({ summary: '审核店铺通过' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiBody({ schema: { type: 'object', properties: { remark: { type: 'string', description: '审核备注' } } } })
  @ApiResponse({ status: 200, description: '审核通过成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async auditPass(@Req() req, @Param('id') id: string, @Body() body: { remark: string }) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.auditPass(id, operatorInfo, body.remark);
  }

  /**
   * 审核店铺失败
   * @param req 请求对象
   * @param id 店铺ID
   * @param body 请求体
   * @returns 审核失败后的店铺
   */
  @Post(':id/audit-fail')
  @ApiOperation({ summary: '审核店铺失败' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiBody({ schema: { type: 'object', properties: { remark: { type: 'string', description: '审核备注' } } } })
  @ApiResponse({ status: 200, description: '审核失败成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async auditFail(@Req() req, @Param('id') id: string, @Body() body: { remark: string }) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.auditFail(id, operatorInfo, body.remark);
  }

  /**
   * 店铺开店
   * @param req 请求对象
   * @param id 店铺ID
   * @returns 开店后的店铺
   */
  @Post(':id/open')
  @ApiOperation({ summary: '店铺开店' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '开店成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async openStore(@Req() req, @Param('id') id: string) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.openStore(id, operatorInfo);
  }

  /**
   * 店铺关店
   * @param req 请求对象
   * @param id 店铺ID
   * @returns 关店后的店铺
   */
  @Post(':id/close')
  @ApiOperation({ summary: '店铺关店' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiResponse({ status: 200, description: '关店成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async closeStore(@Req() req, @Param('id') id: string) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.closeStore(id, operatorInfo);
  }

  /**
   * 冻结店铺
   * @param req 请求对象
   * @param id 店铺ID
   * @param body 请求体
   * @returns 冻结后的店铺
   */
  @Post(':id/freeze')
  @ApiOperation({ summary: '冻结店铺' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiBody({ schema: { type: 'object', properties: { remark: { type: 'string', description: '冻结原因' } } } })
  @ApiResponse({ status: 200, description: '冻结成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async freezeStore(@Req() req, @Param('id') id: string, @Body() body: { remark: string }) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.freezeStore(id, operatorInfo, body.remark);
  }

  /**
   * 解冻店铺
   * @param req 请求对象
   * @param id 店铺ID
   * @param body 请求体
   * @returns 解冻后的店铺
   */
  @Post(':id/unfreeze')
  @ApiOperation({ summary: '解冻店铺' })
  @ApiParam({ name: 'id', description: '店铺ID' })
  @ApiBody({ schema: { type: 'object', properties: { remark: { type: 'string', description: '解冻原因' } } } })
  @ApiResponse({ status: 200, description: '解冻成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '店铺不存在' })
  async unfreezeStore(@Req() req, @Param('id') id: string, @Body() body: { remark: string }) {
    // 获取操作人信息
    const operatorInfo = {
      id: req.user.id,
      name: req.user.username || 'unknown',
    };

    return await this.storeService.unfreezeStore(id, operatorInfo, body.remark);
  }
}
