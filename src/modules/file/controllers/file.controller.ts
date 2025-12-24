import { Controller, Post, Get, Put, Delete, Param, Query, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';

@ApiTags('文件管理')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        directoryId: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '文件上传成功' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body() body: any) {
    const result = await this.fileService.uploadFile(file, {
      directoryId: body.directoryId,
      description: body.description,
    });
    return {
      success: true,
      data: result,
      message: '文件上传成功',
    };
  }

  @ApiOperation({ summary: '获取文件详情' })
  @ApiResponse({ status: 200, description: '获取文件详情成功' })
  @Get(':id')
  async getFileById(@Param('id') id: string) {
    const result = await this.fileService.getFileById(id);
    return {
      success: true,
      data: result,
      message: '获取文件详情成功',
    };
  }

  @ApiOperation({ summary: '获取文件列表' })
  @ApiResponse({ status: 200, description: '获取文件列表成功' })
  @Get('list')
  async getFileList(@Query() query: any) {
    const result = await this.fileService.getFileList(query);
    return {
      success: true,
      data: result,
      message: '获取文件列表成功',
    };
  }

  @ApiOperation({ summary: '更新文件信息' })
  @ApiResponse({ status: 200, description: '更新文件信息成功' })
  @Put(':id')
  async updateFile(@Param('id') id: string, @Body() dto: UpdateFileDto) {
    const result = await this.fileService.updateFile(id, dto);
    return {
      success: true,
      data: result,
      message: '更新文件信息成功',
    };
  }

  @ApiOperation({ summary: '删除文件' })
  @ApiResponse({ status: 200, description: '删除文件成功' })
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.fileService.deleteFile(id);
    return {
      success: true,
      message: '删除文件成功',
    };
  }

  @ApiOperation({ summary: '创建目录' })
  @ApiResponse({ status: 201, description: '创建目录成功' })
  @Post('directory')
  async createDirectory(@Body() body: { name: string; parentId?: string }) {
    const result = await this.fileService.createDirectory(body.name, body.parentId);
    return {
      success: true,
      data: result,
      message: '创建目录成功',
    };
  }

  @ApiOperation({ summary: '获取目录列表' })
  @ApiResponse({ status: 200, description: '获取目录列表成功' })
  @Get('directory/list')
  async getDirectoryList(@Query('parentId') parentId?: string) {
    const result = await this.fileService.getDirectoryList(parentId);
    return {
      success: true,
      data: result,
      message: '获取目录列表成功',
    };
  }
}
