import { Injectable } from '@nestjs/common';

@Injectable()
export class WechatTemplateService {
  
  async getTemplateList() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }

  async createTemplate() {
    return { success: true, message: '模板创建成功' };
  }

  async updateTemplate() {
    return { success: true, message: '模板更新成功' };
  }

  async deleteTemplate() {
    return { success: true, message: '模板删除成功' };
  }
}