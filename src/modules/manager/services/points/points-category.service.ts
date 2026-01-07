import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PointsCategory } from '../../../framework/entities/points-category.entity';

@Injectable()
export class PointsCategoryService {
  constructor(
    @InjectRepository(PointsCategory)
    private readonly pointsCategoryRepository: Repository<PointsCategory>,
  ) {}

  /**
   * 获取积分商品分类列表
   */
  async findAll(query?: any) {
    try {
      const categories = await this.pointsCategoryRepository.find({
        where: { deleted: false },
        order: { sortOrder: 'DESC', createTime: 'DESC' },
      });

      return {
        success: true,
        result: categories,
        message: '获取分类列表成功',
      };
    } catch (error) {
      console.error('获取分类列表失败:', error);
      return {
        success: false,
        result: [],
        message: '获取分类列表失败: ' + error.message,
      };
    }
  }

  /**
   * 获取分类详情
   */
  async findOne(id: number) {
    try {
      const category = await this.pointsCategoryRepository.findOne({
        where: { id, deleted: false },
      });

      if (!category) {
        return {
          success: false,
          message: '分类不存在',
        };
      }

      return {
        success: true,
        result: category,
        message: '获取分类详情成功',
      };
    } catch (error) {
      console.error('获取分类详情失败:', error);
      return {
        success: false,
        message: '获取分类详情失败: ' + error.message,
      };
    }
  }

  /**
   * 创建分类
   */
  async create(categoryData: any) {
    try {
      if (!categoryData.categoryName) {
        throw new BadRequestException('分类名称不能为空');
      }

      const newCategory = this.pointsCategoryRepository.create({
        ...categoryData,
        isShow: categoryData.isShow !== undefined ? categoryData.isShow : true,
        sortOrder: categoryData.sortOrder || 0,
      });

      const savedCategory = await this.pointsCategoryRepository.save(newCategory);

      return {
        success: true,
        result: savedCategory,
        message: '创建分类成功',
      };
    } catch (error) {
      console.error('创建分类失败:', error);
      return {
        success: false,
        message: error.message || '创建分类失败',
      };
    }
  }

  /**
   * 更新分类
   */
  async update(id: number, categoryData: any) {
    try {
      const category = await this.pointsCategoryRepository.findOne({
        where: { id, deleted: false },
      });

      if (!category) {
        return {
          success: false,
          message: '分类不存在',
        };
      }

      Object.assign(category, categoryData);
      const updatedCategory = await this.pointsCategoryRepository.save(category);

      return {
        success: true,
        result: updatedCategory,
        message: '更新分类成功',
      };
    } catch (error) {
      console.error('更新分类失败:', error);
      return {
        success: false,
        message: '更新分类失败: ' + error.message,
      };
    }
  }

  /**
   * 删除分类
   */
  async remove(id: number) {
    try {
      const category = await this.pointsCategoryRepository.findOne({
        where: { id, deleted: false },
      });

      if (!category) {
        return {
          success: false,
          message: '分类不存在',
        };
      }

      category.deleted = true;
      await this.pointsCategoryRepository.save(category);

      return {
        success: true,
        message: '删除分类成功',
      };
    } catch (error) {
      console.error('删除分类失败:', error);
      return {
        success: false,
        message: '删除分类失败: ' + error.message,
      };
    }
  }
}
