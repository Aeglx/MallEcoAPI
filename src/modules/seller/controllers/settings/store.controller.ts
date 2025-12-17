import { Controller, Get, Put, Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('卖家端-店铺设置')
@Controller('seller/settings/store')
export class StoreSettingController {
  
  @Get('info')
  @ApiOperation({ summary: '获取店铺信息' })
  getStoreInfo() {
    return {
      storeName: '示例店铺',
      storeLogo: '',
      storeDescription: '优质商品，诚信经营',
      contactInfo: {
        phone: '13800000000',
        email: 'store@example.com'
      }
    };
  }

  @Put('info')
  @ApiOperation({ summary: '更新店铺信息' })
  updateStoreInfo(@Body() storeInfo: any) {
    return { message: '店铺信息更新成功' };
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
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
  @ApiOperation({ summary: '上传店铺logo' })
  uploadLogo(@UploadedFile() file: any) {
    return { 
      message: 'Logo上传成功',
      fileUrl: `/uploads/${file.filename}`
    };
  }

  @Get('template')
  @ApiOperation({ summary: '获取店铺模板设置' })
  getStoreTemplate() {
    return {
      templateId: 'default',
      templateName: '默认模板',
      colors: {
        primary: '#1890ff',
        secondary: '#52c41a'
      }
    };
  }

  @Put('template')
  @ApiOperation({ summary: '更新店铺模板' })
  updateStoreTemplate(@Body() templateData: any) {
    return { message: '店铺模板更新成功' };
  }
}