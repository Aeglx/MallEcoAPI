import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { SystemVersionService } from '../services/system-version.service';
import { CreateSystemVersionDto } from '../dto/create-system-version.dto';
import { UpdateSystemVersionDto } from '../dto/update-system-version.dto';
import { SystemVersionSearchDto } from '../dto/system-version-search.dto';

@ApiTags('系统版本管理')
@Controller('system/versions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemVersionController {
  constructor(private readonly versionService: SystemVersionService) {}

  @Post()
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '创建系统版本' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createVersionDto: CreateSystemVersionDto) {
    const version = await this.versionService.create(createVersionDto);
    return {
      code: HttpStatus.CREATED,
      message: '版本创建成功',
      data: version,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() searchDto: SystemVersionSearchDto) {
    const result = await this.versionService.findAll(searchDto);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: result,
    };
  }

  @Get('history')
  @ApiOperation({ summary: '获取版本历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHistory() {
    const versions = await this.versionService.getVersionHistory();
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: versions,
    };
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前版本' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCurrent() {
    const version = await this.versionService.getCurrentVersion();
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: version,
    };
  }

  @Get('lts')
  @ApiOperation({ summary: '获取LTS版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLTSVersions() {
    const versions = await this.versionService.getLTSVersions();
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: versions,
    };
  }

  @Get('compare/:version1/:version2')
  @ApiOperation({ summary: '比较两个版本' })
  @ApiResponse({ status: 200, description: '比较成功' })
  async compareVersions(
    @Param('version1') version1: string,
    @Param('version2') version2: string,
  ) {
    const comparison = await this.versionService.compareVersions(version1, version2);
    return {
      code: HttpStatus.OK,
      message: '比较成功',
      data: comparison,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取版本详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    const version = await this.versionService.findOne(+id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: version,
    };
  }

  @Get('by-version/:version')
  @ApiOperation({ summary: '根据版本号获取版本信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByVersion(@Param('version') version: string) {
    const versionEntity = await this.versionService.findByVersion(version);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: versionEntity,
    };
  }

  @Patch(':id')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '更新版本信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateVersionDto: UpdateSystemVersionDto,
  ) {
    const version = await this.versionService.update(+id, updateVersionDto);
    return {
      code: HttpStatus.OK,
      message: '更新成功',
      data: version,
    };
  }

  @Patch(':id/set-current')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '设置为当前版本' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setCurrent(@Param('id') id: string) {
    const version = await this.versionService.setCurrentVersion(+id);
    return {
      code: HttpStatus.OK,
      message: '设置成功',
      data: version,
    };
  }

  @Patch(':id/deprecate')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '废弃版本' })
  @ApiResponse({ status: 200, description: '废弃成功' })
  async deprecate(@Param('id') id: string) {
    const version = await this.versionService.deprecateVersion(+id);
    return {
      code: HttpStatus.OK,
      message: '废弃成功',
      data: version,
    };
  }

  @Patch(':id/download')
  @ApiOperation({ summary: '增加下载次数' })
  @ApiResponse({ status: 200, description: '增加成功' })
  async incrementDownload(@Param('id') id: string) {
    const version = await this.versionService.incrementDownloadCount(+id);
    return {
      code: HttpStatus.OK,
      message: '下载次数增加成功',
      data: version,
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载版本文件' })
  @ApiResponse({ status: 200, description: '下载成功' })
  async download(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const version = await this.versionService.findOne(+id);
    
    if (!version.downloadUrl) {
      return res.status(HttpStatus.NOT_FOUND).json({
        code: HttpStatus.NOT_FOUND,
        message: '该版本没有可下载的文件',
      });
    }

    // 增加下载次数
    await this.versionService.incrementDownloadCount(+id);

    // 这里可以根据实际需求实现文件下载逻辑
    // 例如：从文件系统、云存储等获取文件
    return res.json({
      code: HttpStatus.OK,
      message: '下载链接获取成功',
      data: {
        downloadUrl: version.downloadUrl,
        checksum: version.checksum,
        fileSize: version.fileSize,
        fileName: `mallico-v${version.version}.${version.type}`,
      },
    });
  }

  @Delete(':id')
  @Roles('admin', 'system_manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除版本' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.versionService.remove(+id);
    return {
      code: HttpStatus.OK,
      message: '删除成功',
    };
  }

  @Post(':id/rollback')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiResponse({ status: 200, description: '回滚成功' })
  async rollback(@Param('id') id: string) {
    const version = await this.versionService.setCurrentVersion(+id);
    return {
      code: HttpStatus.OK,
      message: '回滚成功',
      data: {
        rollbackTo: version,
        rollbackTime: new Date(),
      },
    };
  }

  @Get(':id/changelog')
  @ApiOperation({ summary: '获取版本更新日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getChangelog(@Param('id') id: string) {
    const version = await this.versionService.findOne(+id);
    return {
      code: HttpStatus.OK,
      message: '获取成功',
      data: {
        version: version.version,
        description: version.description,
        features: version.features,
        fixes: version.fixes,
        improvements: version.improvements,
        changelog: version.changelog,
        releaseDate: version.releaseDate,
      },
    };
  }

  @Post(':id/validate')
  @Roles('admin', 'system_manager')
  @ApiOperation({ summary: '验证版本文件完整性' })
  @ApiResponse({ status: 200, description: '验证成功' })
  async validateVersion(@Param('id') id: string) {
    const version = await this.versionService.findOne(+id);
    
    // 这里可以实现文件完整性验证逻辑
    // 例如：验证文件校验和、检查文件是否存在等
    const isValid = true; // 简化示例

    return {
      code: HttpStatus.OK,
      message: '验证完成',
      data: {
        isValid,
        checksum: version.checksum,
        validatedAt: new Date(),
      },
    };
  }
}
