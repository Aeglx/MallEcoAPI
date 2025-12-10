import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, TreeRepository } from 'typeorm';
import { ArticleCategory } from '../entities/article-category.entity';

interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
  coverImage?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  showInNav?: boolean;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
}

@Injectable()
export class ArticleCategoryService {
  constructor(
    @InjectRepository(ArticleCategory)
    private readonly categoryRepository: TreeRepository<ArticleCategory>,
  ) {}

  /**
   * 创建分类
   */
  async createCategory(createDto: CreateCategoryDto, userId?: string): Promise<ArticleCategory> {
    const category = this.categoryRepository.create({
      ...createDto,
      createdBy: userId,
    });

    // 处理父级分类
    if (createDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (parent) {
        category.parent = parent;
      }
    }

    return await this.categoryRepository.save(category);
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(id: string): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, deleteTime: null },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  /**
   * 获取分类树
   */
  async getCategoryTree(): Promise<ArticleCategory[]> {
    return await this.categoryRepository.findTrees({
      where: { deleteTime: null },
    });
  }

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<ArticleCategory[]> {
    return await this.categoryRepository.find({
      where: { deleteTime: null },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, updateData: Partial<CreateCategoryDto>, userId?: string): Promise<ArticleCategory> {
    const category = await this.getCategoryById(id);

    Object.assign(category, updateData);
    category.updatedBy = userId;

    // 处理父级分类
    if (updateData.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: updateData.parentId },
      });
      if (parent) {
        category.parent = parent;
      }
    }

    return await this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    category.deleteTime = new Date();
    await this.categoryRepository.save(category);
  }

  /**
   * 获取分类下的文章数量
   */
  async getCategoryArticleCount(id: string): Promise<number> {
    const category = await this.getCategoryById(id);
    return category.articles ? category.articles.length : 0;
  }

  /**
   * 搜索分类
   */
  async searchCategories(keyword: string): Promise<ArticleCategory[]> {
    return await this.categoryRepository.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) }
      ],
      take: 20,
    });
  }
}