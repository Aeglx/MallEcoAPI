import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatTemplateService } from '../services/wechat-template.service';
import { QueryTemplateDto } from '../dto/query-template.dto';
import { SendTemplateMessageDto } from '../dto/send-template-message.dto';
import { BatchSendTemplateMessageDto } from '../dto/batch-send-template-message.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { Response } from 'express';

@ApiTags('公众号管理-消息管理')
@Controller('admin/wechat/template')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatTemplateController {
  constructor(private readonly wechatTemplateService: WechatTemplateService) {}

  @Get()
  @ApiOperation({ summary: '获取模板消息列表' })
  @ApiResponse({ status: 200, description: '获取模板消息列表成功' })
  getTemplateList(@Query() query: QueryTemplateDto) {
    return this.wechatTemplateService.getTemplateList(query);
  }

  @Post('sync')
  @ApiOperation({ summary: '同步公众号模板' })
  @ApiResponse({ status: 200, description: '同步模板成功' })
  syncTemplates() {
    return this.wechatTemplateService.syncTemplatesFromWechat();
  }

  @Get('export')
  @ApiOperation({ summary: '导出模板列表' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportTemplates(@Query() query: QueryTemplateDto, @Res() res: Response) {
    const buffer = await this.wechatTemplateService.exportTemplates(query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=模板列表_${Date.now()}.xlsx`);
    res.send(buffer);
  }

  @Post('import')
  @ApiOperation({ summary: '导入模板列表' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importTemplates(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024, message: '文件大小不能超过10MB' }),
          new FileTypeValidator({ fileType: /(xlsx|xls)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: any,
  ) {
    return this.wechatTemplateService.importTemplates(file);
  }

  @Post('send')
  @ApiOperation({ summary: '发送模板消息' })
  @ApiResponse({ status: 200, description: '发送成功' })
  sendTemplateMessage(@Body() sendDto: SendTemplateMessageDto) {
    return this.wechatTemplateService.sendTemplateMessage(sendDto);
  }

  @Post('batch-send')
  @ApiOperation({ summary: '批量发送模板消息' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        templateId: {
          type: 'string',
        },
        data: {
          type: 'string',
        },
        url: {
          type: 'string',
        },
        miniprogram: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  batchSendTemplateMessage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024, message: '文件大小不能超过10MB' }),
          new FileTypeValidator({ fileType: /(xlsx|xls)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: any,
    @Body() body: any,
  ) {
    // 解析body中的JSON字符串字段
    const batchSendDto: BatchSendTemplateMessageDto = {
      templateId: body.templateId,
      data: body.data ? (typeof body.data === 'string' ? JSON.parse(body.data) : body.data) : undefined,
      url: body.url,
      miniprogram: body.miniprogram
        ? typeof body.miniprogram === 'string'
          ? JSON.parse(body.miniprogram)
          : body.miniprogram
        : undefined,
    };
    return this.wechatTemplateService.batchSendTemplateMessage(file, batchSendDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模板详情' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 200, description: '获取模板详情成功' })
  getTemplateDetail(@Param('id') id: string) {
    return this.wechatTemplateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateTemplate(@Param('id') id: string, @Body() updateDto: UpdateTemplateDto) {
    return this.wechatTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deleteTemplate(@Param('id') id: string) {
    return this.wechatTemplateService.remove(id);
  }
}
