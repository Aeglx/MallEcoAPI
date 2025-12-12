import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { ArticleTag } from '../entities/article-tag.entity';
import { CreateArticleTagDto } from '../dto/create-article-tag.dto';
import { UpdateArticleTagDto } from '../dto/update-article-tag.dto';

@Injectable()
export class ArticleTagService {
  constructor(
    @InjectRepository(ArticleTag)
    private readonly tagRepository: Repository<ArticleTag>,
  ) {}

  async create(createTagDto: CreateArticleTagDto): Promise<ArticleTag> {
    // 检查标签是否已存在
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      return existingTag;
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll(): Promise<ArticleTag[]> {
    return await this.tagRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC', name: 'ASC' },
    });
  }

  async findPopularTags(limit: number = 20): Promise<ArticleTag[]> {
    return await this.tagRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  async searchTags(keyword: string): Promise<ArticleTag[]> {
    return await this.tagRepository.find({
      where: {
        name: Like(`%${keyword}%`),
        isActive: true,
      },
      order: { usageCount: 'DESC' },
      take: 10,
    });
  }

  async findOne(id: number): Promise<ArticleTag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }

    return tag;
  }

  async update(id: number, updateTagDto: UpdateArticleTagDto): Promise<ArticleTag> {
    const tag = await this.findOne(id);
    
    // 检查新名称是否已存在
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });

      if (existingTag && existingTag.id !== id) {
        throw new NotFoundException(`标签名称 "${updateTagDto.name}" 已存在`);
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    
    // 检查是否有文章关联
    if (tag.articles && tag.articles.length > 0) {
      throw new NotFoundException('该标签已被文章使用，无法删除');
    }

    await this.tagRepository.remove(tag);
  }

  async incrementUsageCount(tagNames: string[]): Promise<void> {
    const tags = await this.tagRepository.find({
      where: { name: In(tagNames) },
    });

    const updatePromises = tags.map(tag =>
      this.tagRepository.increment({ id: tag.id }, 'usageCount', 1)
    );

    await Promise.all(updatePromises);
  }

  // 卖家端方法
  async findByStore(storeId: number): Promise<ArticleTag[]> {
    return await this.tagRepository.find({
      where: { storeId, isActive: true },
      order: { usageCount: 'DESC', name: 'ASC' },
    });
  }

  async updateByStore(id: number, storeId: number, updateTagDto: UpdateArticleTagDto): Promise<ArticleTag> {
    const tag = await this.tagRepository.findOne({
      where: { id, storeId },
    });

    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }

    // 检查新名称是否已存在
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, storeId },
      });

      if (existingTag && existingTag.id !== id) {
        throw new NotFoundException(`标签名称 "${updateTagDto.name}" 已存在`);
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async removeByStore(id: number, storeId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id, storeId },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }

    // 检查是否有文章关联
    if (tag.articles && tag.articles.length > 0) {
      throw new NotFoundException('该标签已被文章使用，无法删除');
    }

    await this.tagRepository.remove(tag);
  }

  // 更新 create 方法以支持 storeId
  async create(createTagDto: CreateArticleTagDto): Promise<ArticleTag> {
    // 检查标签是否已存在
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name, storeId: createTagDto.storeId },
    });

    if (existingTag) {
      return existingTag;
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async getTagStatistics(): Promise<any> {
    const total = await this.tagRepository.count();
    const active = await this.tagRepository.count({ where: { isActive: true } });
    const inactive = await this.tagRepository.count({ where: { isActive: false } });

    const mostUsedTag = await this.tagRepository.findOne({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
    });

    return {
      total,
      active,
      inactive,
      mostUsedTag: mostUsedTag ? {
        name: mostUsedTag.name,
        usageCount: mostUsedTag.usageCount,
      } : null,
    };
  }
}