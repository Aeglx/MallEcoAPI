import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { ArticleCategory } from '../entities/article-category.entity';
import { CreateArticleCategoryDto } from '../dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from '../dto/update-article-category.dto';

@Injectable()
export class ArticleCategoryService {
  constructor(
    @InjectRepository(ArticleCategory)
    private readonly categoryRepository: Repository<ArticleCategory>,
  ) {}

  async create(createCategoryDto: CreateArticleCategoryDto): Promise<ArticleCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`父分类 #${createCategoryDto.parentId} 不存在`);
      }
    }

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<ArticleCategory[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findTree(): Promise<any[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return this.buildCategoryTree(categories);
  }

  private buildCategoryTree(categories: ArticleCategory[]): any[] {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // 创建映射
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // 构建树结构
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  async findOne(id: number): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!category) {
      throw new NotFoundException(`分类 #${id} 不存在`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateArticleCategoryDto): Promise<ArticleCategory> {
    const category = await this.findOne(id);
    
    // 检查循环引用
    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('不能将分类设置为自己父分类');
    }

    if (updateCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`父分类 #${updateCategoryDto.parentId} 不存在`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    
    // 检查是否有子分类
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });
    
    if (children.length > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // 检查是否有文章
    if (category.articles && category.articles.length > 0) {
      throw new BadRequestException('该分类下存在文章，无法删除');
    }

    await this.categoryRepository.remove(category);
  }

  async updateSortOrder(categories: { id: number; sortOrder: number }[]): Promise<void> {
    const updatePromises = categories.map(category => 
      this.categoryRepository.update(category.id, { sortOrder: category.sortOrder })
    );
    
    await Promise.all(updatePromises);
  }

  async getCategoryStatistics(): Promise<any> {
    const total = await this.categoryRepository.count();
    const active = await this.categoryRepository.count({ where: { isActive: true } });
    const inactive = await this.categoryRepository.count({ where: { isActive: false } });

    return {
      total,
      active,
      inactive,
    };
  }

  // 卖家端方法
  async findByStore(storeId: number): Promise<ArticleCategory[]> {
    return await this.categoryRepository.find({
      where: { storeId, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async updateByStore(id: number, storeId: number, updateCategoryDto: UpdateArticleCategoryDto): Promise<ArticleCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, storeId },
    });

    if (!category) {
      throw new NotFoundException(`分类 #${id} 不存在`);
    }

    // 检查循环引用
    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('不能将分类设置为自己父分类');
    }

    if (updateCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId, storeId },
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`父分类 #${updateCategoryDto.parentId} 不存在`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async removeByStore(id: number, storeId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, storeId },
      relations: ['articles'],
    });

    if (!category) {
      throw new NotFoundException(`分类 #${id} 不存在`);
    }

    // 检查是否有子分类
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });
    
    if (children.length > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // 检查是否有文章
    if (category.articles && category.articles.length > 0) {
      throw new BadRequestException('该分类下存在文章，无法删除');
    }

    await this.categoryRepository.remove(category);
  }

  async getCategoryStatisticsByStore(storeId: number): Promise<any> {
    const total = await this.categoryRepository.count({ where: { storeId } });
    const active = await this.categoryRepository.count({ where: { storeId, isActive: true } });
    const inactive = await this.categoryRepository.count({ where: { storeId, isActive: false } });

    return {
      total,
      active,
      inactive,
    };
  }
}