import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { WechatTemplate } from '../entities/wechat-template.entity';
import { QueryTemplateDto } from '../dto/query-template.dto';
import { SendTemplateMessageDto } from '../dto/send-template-message.dto';
import { BatchSendTemplateMessageDto } from '../dto/batch-send-template-message.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { WechatApiService } from './wechat-api.service';
import * as XLSX from 'xlsx';

@Injectable()
export class WechatTemplateService {
  private readonly logger = new Logger(WechatTemplateService.name);

  constructor(
    @InjectRepository(WechatTemplate)
    private readonly wechatTemplateRepository: Repository<WechatTemplate>,
    private readonly wechatApiService: WechatApiService,
  ) {}

  /**
   * 获取模板列表
   */
  async getTemplateList(query: QueryTemplateDto) {
    const {
      pageNumber = 1,
      pageSize = 20,
      title,
      templateId,
      status,
    } = query;

    const queryBuilder = this.wechatTemplateRepository.createQueryBuilder('template');

    if (title) {
      queryBuilder.andWhere('template.title LIKE :title', { title: `%${title}%` });
    }

    if (templateId) {
      queryBuilder.andWhere('template.templateId LIKE :templateId', { templateId: `%${templateId}%` });
    }

    if (status !== undefined && status !== null) {
      queryBuilder.andWhere('template.status = :status', { status });
    }

    queryBuilder.orderBy('template.createTime', 'DESC');

    const total = await queryBuilder.getCount();
    const records = await queryBuilder
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      success: true,
      result: {
        records,
        total,
        pageNumber,
        pageSize,
      },
    };
  }

  /**
   * 同步公众号模板
   * 从微信API获取模板列表并同步到数据库
   */
  async syncTemplatesFromWechat() {
    try {
      this.logger.log('开始同步微信模板');

      // 1. 调用微信API获取模板列表
      const wechatTemplates = await this.wechatApiService.getTemplateList();

      // 2. 使用事务批量处理
      return await this.wechatTemplateRepository.manager.transaction(async (manager) => {
        let added = 0;
        let updated = 0;

        for (const wechatTemplate of wechatTemplates) {
          const existing = await manager.findOne(WechatTemplate, {
            where: { templateId: wechatTemplate.template_id },
          });

          if (existing) {
            // 更新现有模板
            existing.title = wechatTemplate.title;
            existing.content = wechatTemplate.content;
            existing.example = wechatTemplate.example || '';
            existing.status = 1; // 启用
            existing.updateTime = new Date();
            existing.updateById = existing.updateById || 'system';
            await manager.save(existing);
            updated++;
          } else {
            // 创建新模板
            const template = manager.create(WechatTemplate, {
              templateId: wechatTemplate.template_id,
              title: wechatTemplate.title,
              content: wechatTemplate.content,
              example: wechatTemplate.example || '',
              status: 1, // 启用
              type: 2, // 默认为通知类型
              category: wechatTemplate.primary_industry || '',
              createById: 'system',
              updateById: 'system',
            });
            await manager.save(template);
            added++;
          }
        }

        const totalCount = await manager.count(WechatTemplate);
        const enabledCount = await manager.count(WechatTemplate, { where: { status: 1 } });
        const disabledCount = await manager.count(WechatTemplate, { where: { status: 0 } });

        this.logger.log(`同步完成: 新增=${added}, 更新=${updated}, 总数=${totalCount}`);

        return {
          success: true,
          message: '同步完成',
          result: {
            total: totalCount,
            enabled: enabledCount,
            disabled: disabledCount,
            added,
            updated,
          },
        };
      });
    } catch (error) {
      this.logger.error('同步模板失败', error.stack);
      throw new BadRequestException('同步模板失败：' + error.message);
    }
  }

  /**
   * 导出模板列表
   */
  async exportTemplates(query: QueryTemplateDto): Promise<Buffer> {
    try {
      this.logger.log('开始导出模板列表');
      
      // 使用分批查询避免内存问题
      const batchSize = 1000;
      let allRecords: WechatTemplate[] = [];
      let page = 1;

      while (true) {
        const result = await this.getTemplateList({
          ...query,
          pageNumber: page,
          pageSize: batchSize,
        });

        const records = result.result?.records || [];
        if (records.length === 0) break;

        allRecords = allRecords.concat(records);

        // 如果返回的记录数小于batchSize，说明已经到最后一页
        if (records.length < batchSize) break;
        page++;
      }

      const data = allRecords.map((template: WechatTemplate) => ({
        '模板ID': template.templateId,
        '模板标题': template.title,
        '分类': template.category || '',
        '类型': template.type === 1 ? '营销' : '通知',
        '状态': template.status === 1 ? '启用' : '禁用',
        '发送次数': template.sendCount || 0,
        '点击次数': template.clickCount || 0,
        '点击率': template.clickRate ? `${template.clickRate}%` : '0%',
        '创建时间': template.createTime ? new Date(template.createTime).toLocaleString('zh-CN') : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '模板列表');

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 25 }, // 模板ID
        { wch: 30 }, // 模板标题
        { wch: 15 }, // 分类
        { wch: 10 }, // 类型
        { wch: 10 }, // 状态
        { wch: 12 }, // 发送次数
        { wch: 12 }, // 点击次数
        { wch: 12 }, // 点击率
        { wch: 20 }, // 创建时间
      ];

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      this.logger.log(`导出完成: 共${allRecords.length}条记录`);
      return buffer;
    } catch (error) {
      this.logger.error('导出模板列表失败', error.stack);
      throw new BadRequestException('导出失败：' + error.message);
    }
  }

  /**
   * 导入模板列表
   */
  async importTemplates(file: any) {
    try {
      this.logger.log('开始导入模板列表');

      // 1. 文件验证
      if (!file || !file.buffer) {
        throw new BadRequestException('文件不能为空');
      }

      // 2. 文件大小验证（10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException('文件大小不能超过10MB');
      }

      // 3. 文件类型验证
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/octet-stream', // 某些情况下Excel文件可能返回这个类型
      ];
      if (file.mimetype && !allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('文件类型不支持，请上传Excel文件(.xlsx或.xls)');
      }

      // 4. Excel解析
      let workbook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch (error) {
        throw new BadRequestException('Excel文件格式错误，无法解析');
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException('Excel文件中没有工作表');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('Excel文件中没有数据');
      }

      // 5. 数据转换
      const templates = data.map((item: any, index: number) => {
        const template = new WechatTemplate();
        template.templateId = item['模板ID'] || item.templateId || item['templateId'] || '';
        template.title = item['模板标题'] || item.title || item['title'] || '';
        template.category = item['分类'] || item.category || item['category'] || '';
        template.type = item['类型'] === '营销' || item.type === '营销' || item.type === 1 ? 1 : 2;
        template.status = item['状态'] === '启用' || item.status === '启用' || item.status === 1 ? 1 : 0;
        template.createById = 'system';
        template.updateById = 'system';

        if (!template.templateId || !template.title) {
          throw new BadRequestException(`第${index + 2}行：模板ID和模板标题不能为空`);
        }

        return template;
      });

      // 6. 使用事务批量导入
      return await this.wechatTemplateRepository.manager.transaction(async (manager) => {
        let successCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const template of templates) {
          try {
            const existing = await manager.findOne(WechatTemplate, {
              where: { templateId: template.templateId },
            });
            if (!existing) {
              await manager.save(WechatTemplate, template);
              successCount++;
            } else {
              skippedCount++;
            }
          } catch (error) {
            errors.push(`模板${template.templateId}导入失败: ${error.message}`);
            // 如果错误过多，可以中断事务
            if (errors.length > 10) {
              throw new BadRequestException(`导入失败，错误过多: ${errors.join('; ')}`);
            }
          }
        }

        if (errors.length > 0 && successCount === 0) {
          throw new BadRequestException(`导入失败: ${errors.join('; ')}`);
        }

        this.logger.log(`导入完成: 成功=${successCount}, 跳过=${skippedCount}, 错误=${errors.length}`);

        return {
          success: true,
          message: '导入完成',
          result: {
            total: templates.length,
            success: successCount,
            skipped: skippedCount,
            errors: errors.slice(0, 10),
          },
        };
      });
    } catch (error) {
      this.logger.error('导入模板失败', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('导入失败：' + (error.message || '未知错误'));
    }
  }

  /**
   * 转换数据格式为微信API要求的格式
   */
  private convertTemplateData(data: Record<string, any>): Record<string, { value: string; color?: string }> {
    const converted: Record<string, { value: string; color?: string }> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        // 已经是正确格式
        converted[key] = {
          value: String(value.value),
          color: value.color || '#173177',
        };
      } else {
        // 简单格式，转换为对象格式
        converted[key] = {
          value: String(value),
          color: '#173177',
        };
      }
    }
    return converted;
  }

  /**
   * 发送模板消息
   * 调用微信API发送消息
   */
  async sendTemplateMessage(sendDto: SendTemplateMessageDto) {
    try {
      this.logger.log(`发送模板消息: templateId=${sendDto.templateId}, openid=${sendDto.openid}`);

      const { templateId, openid, data, url, miniprogram } = sendDto;

      // 1. 验证模板
      const template = await this.wechatTemplateRepository.findOne({
        where: { templateId },
      });

      if (!template) {
        throw new NotFoundException('模板不存在');
      }

      if (template.status !== 1) {
        throw new BadRequestException('模板已禁用，无法发送');
      }

      // 2. 转换数据格式
      const templateData = data ? this.convertTemplateData(data) : {};

      // 3. 调用微信API发送消息
      const result = await this.wechatApiService.sendTemplateMessage({
        touser: openid,
        template_id: templateId,
        data: templateData,
        url: url,
        miniprogram: miniprogram,
      });

      // 4. 更新统计（使用原子操作）
      await this.wechatTemplateRepository.increment(
        { id: template.id },
        'sendCount',
        1
      );
      template.lastSendTime = new Date();
      await this.wechatTemplateRepository.save(template);

      this.logger.log(`模板消息发送成功: msgid=${result.msgid}`);

      return {
        success: true,
        message: '发送成功',
        result: {
          msgid: String(result.msgid || ''),
          templateId,
          openid,
        },
      };
    } catch (error) {
      this.logger.error(`发送模板消息失败: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('发送失败：' + error.message);
    }
  }

  /**
   * 批量发送模板消息
   * 使用并发控制避免触发微信API限流
   */
  async batchSendTemplateMessage(file: any, body: BatchSendTemplateMessageDto) {
    try {
      this.logger.log('开始批量发送模板消息');

      // 1. 文件验证
      if (!file || !file.buffer) {
        throw new BadRequestException('文件不能为空');
      }

      const { templateId, data, url, miniprogram } = body;

      if (!templateId) {
        throw new BadRequestException('模板ID不能为空');
      }

      // 2. Excel解析
      let workbook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch (error) {
        throw new BadRequestException('Excel文件格式错误，无法解析');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        throw new BadRequestException('Excel文件中没有数据');
      }

      // 3. 提取OpenID列表
      const openids = rows
        .map((row: any) => row['OpenID'] || row['openid'] || row['OpenId'] || Object.values(row)[0])
        .filter(Boolean)
        .filter((id: string) => id && id.trim() !== '');

      if (openids.length === 0) {
        throw new BadRequestException('Excel文件中没有有效的OpenID');
      }

      this.logger.log(`批量发送: 模板ID=${templateId}, OpenID数量=${openids.length}`);

      // 4. 并发控制发送（最多10个并发，避免触发微信API限流）
      const concurrency = 10;
      const batches: string[][] = [];
      for (let i = 0; i < openids.length; i += concurrency) {
        batches.push(openids.slice(i, i + concurrency));
      }

      let successCount = 0;
      let failCount = 0;
      const failDetails: string[] = [];

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(openid =>
            this.sendTemplateMessage({
              templateId,
              openid: String(openid).trim(),
              data: data ? (typeof data === 'string' ? JSON.parse(data) : data) : {},
              url,
              miniprogram: miniprogram
                ? typeof miniprogram === 'string'
                  ? JSON.parse(miniprogram)
                  : miniprogram
                : undefined,
            })
          )
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successCount++;
          } else {
            failCount++;
            const openid = batch[index];
            failDetails.push(`${openid}: ${result.reason.message || result.reason}`);
            this.logger.warn(`批量发送失败 ${openid}: ${result.reason.message || result.reason}`);
          }
        });
      }

      this.logger.log(`批量发送完成: 成功=${successCount}, 失败=${failCount}`);

      return {
        success: true,
        message: '批量发送完成',
        result: {
          total: openids.length,
          success: successCount,
          fail: failCount,
          failDetails: failDetails.slice(0, 10),
        },
      };
    } catch (error) {
      this.logger.error('批量发送失败', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('批量发送失败：' + error.message);
    }
  }

  /**
   * 根据ID查找模板
   */
  async findOne(id: string) {
    const template = await this.wechatTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    return {
      success: true,
      result: template,
    };
  }

  /**
   * 更新模板
   */
  async update(id: string, updateDto: UpdateTemplateDto) {
    const template = await this.wechatTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    // 只更新提供的字段
    Object.keys(updateDto).forEach((key) => {
      if ((updateDto as any)[key] !== undefined && (updateDto as any)[key] !== null) {
        (template as any)[key] = (updateDto as any)[key];
      }
    });

    template.updateById = template.updateById || 'system';
    await this.wechatTemplateRepository.save(template);

    this.logger.log(`模板更新成功: id=${id}`);

    return {
      success: true,
      message: '更新成功',
      result: template,
    };
  }

  /**
   * 删除模板
   */
  async remove(id: string) {
    const template = await this.wechatTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    await this.wechatTemplateRepository.remove(template);

    this.logger.log(`模板删除成功: id=${id}`);

    return {
      success: true,
      message: '删除成功',
    };
  }
}
