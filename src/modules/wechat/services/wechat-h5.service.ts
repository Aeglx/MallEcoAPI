import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatH5Page } from '../entities/wechat-h5-page.entity';
import { WechatH5Template } from '../entities/wechat-h5-template.entity';
import { CreateH5PageDto } from '../dto/create-h5-page.dto';
import { UpdateH5PageDto } from '../dto/update-h5-page.dto';
import { CreateH5TemplateDto } from '../dto/create-h5-template.dto';
import { UpdateH5TemplateDto } from '../dto/update-h5-template.dto';
import { QueryH5PageDto } from '../dto/query-h5-page.dto';
import { QueryH5TemplateDto } from '../dto/query-h5-template.dto';

@Injectable()
export class WechatH5Service {
  constructor(
    @InjectRepository(WechatH5Page)
    private readonly h5PageRepository: Repository<WechatH5Page>,
    @InjectRepository(WechatH5Template)
    private readonly h5TemplateRepository: Repository<WechatH5Template>,
  ) {}

  // H5页面管理
  async getH5Pages(queryDto: QueryH5PageDto) {
    const { page = 1, pageSize = 10, title, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.h5PageRepository.createQueryBuilder('h5page');

    if (title) {
      queryBuilder.andWhere('h5page.title LIKE :title', { title: `%${title}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('h5page.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('h5page.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getH5PageById(id: string) {
    const h5Page = await this.h5PageRepository.findOne({ where: { id } });
    if (!h5Page) {
      throw new NotFoundException(`H5页面不存在: ${id}`);
    }
    return h5Page;
  }

  async createH5Page(createDto: CreateH5PageDto) {
    const h5Page = this.h5PageRepository.create(createDto);
    return await this.h5PageRepository.save(h5Page);
  }

  async updateH5Page(id: string, updateDto: UpdateH5PageDto) {
    const h5Page = await this.getH5PageById(id);
    Object.assign(h5Page, updateDto);
    return await this.h5PageRepository.save(h5Page);
  }

  async deleteH5Page(id: string) {
    const h5Page = await this.getH5PageById(id);
    await this.h5PageRepository.remove(h5Page);
    return { success: true, message: 'H5页面删除成功' };
  }

  // H5模板管理
  async getH5Templates(queryDto: QueryH5TemplateDto) {
    const { page = 1, pageSize = 10, name, category } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.h5TemplateRepository.createQueryBuilder('template');

    if (name) {
      queryBuilder.andWhere('template.name LIKE :name', { name: `%${name}%` });
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    const [list, total] = await queryBuilder
      .orderBy('template.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getH5TemplateById(id: string) {
    const template = await this.h5TemplateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`H5模板不存在: ${id}`);
    }
    return template;
  }

  async createH5Template(createDto: CreateH5TemplateDto) {
    const template = this.h5TemplateRepository.create(createDto);
    return await this.h5TemplateRepository.save(template);
  }

  async updateH5Template(id: string, updateDto: UpdateH5TemplateDto) {
    const template = await this.getH5TemplateById(id);
    Object.assign(template, updateDto);
    return await this.h5TemplateRepository.save(template);
  }

  async deleteH5Template(id: string) {
    const template = await this.getH5TemplateById(id);
    await this.h5TemplateRepository.remove(template);
    return { success: true, message: 'H5模板删除成功' };
  }

  // 发布H5页面
  async publishH5Page(id: string) {
    const h5Page = await this.getH5PageById(id);
    h5Page.status = 1; // 启用
    return await this.h5PageRepository.save(h5Page);
  }

  // 取消发布H5页面
  async unpublishH5Page(id: string) {
    const h5Page = await this.getH5PageById(id);
    h5Page.status = 0; // 禁用
    return await this.h5PageRepository.save(h5Page);
  }
}