import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';

@Controller('manager/config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  async create(@Body() createConfigDto: CreateConfigDto) {
    return await this.configService.create(createConfigDto);
  }

  @Get()
  async findAll() {
    return await this.configService.findAll();
  }

  @Get('group/:group')
  async findByGroup(@Param('group') group: string) {
    return await this.configService.findByGroup(group);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.configService.findOne(id);
  }

  @Get('key/:key')
  async findOneByKey(@Param('key') key: string) {
    return await this.configService.findOneByKey(key);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
    return await this.configService.update(id, updateConfigDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.configService.remove(id);
  }

  @Get('value/:key')
  async getConfigValue(@Param('key') key: string) {
    return await this.configService.getConfigValue(key);
  }

  @Get('value/:key/:type')
  async getConfigValueByType(
    @Param('key') key: string,
    @Param('type') type: 'string' | 'number' | 'boolean' | 'json',
  ) {
    return await this.configService.getConfigValueByType(key, type);
  }

  @Post('batch')
  async getBatchConfigValues(@Body('keys') keys: string[]) {
    return await this.configService.getBatchConfigValues(keys);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshCache() {
    await this.configService.refreshCache();
    return { message: '缓存已刷新' };
  }

  @Post('init-default')
  async initDefaultConfig() {
    await this.configService.initDefaultConfig();
    return { message: '默认配置已初始化' };
  }
}
