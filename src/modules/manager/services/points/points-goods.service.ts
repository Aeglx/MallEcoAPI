import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { PointsGoods } from '../../../framework/entities/points-goods.entity';

@Injectable()
export class PointsGoodsService {
  constructor(
    @InjectRepository(PointsGoods)
    private readonly pointsGoodsRepository: Repository<PointsGoods>,
  ) {}

  /**
   * 获取积分商品列表
   */
  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 10,
      goodsName,
      categoryId,
      isShow,
      goodsType,
      isRecommend,
      isHot,
    } = query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const where: any = { deleted: false };

    if (goodsName) {
      where.goodsName = Like(`%${goodsName}%`);
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (isShow !== undefined && isShow !== '') {
      where.isShow = isShow === 'true' || isShow === true || isShow === 1;
    }
    if (goodsType) {
      where.goodsType = Number(goodsType);
    }
    if (isRecommend !== undefined && isRecommend !== '') {
      where.isRecommend = isRecommend === 'true' || isRecommend === true || isRecommend === 1;
    }
    if (isHot !== undefined && isHot !== '') {
      where.isHot = isHot === 'true' || isHot === true || isHot === 1;
    }

    try {
      const [result, total] = await this.pointsGoodsRepository.findAndCount({
        where,
        skip,
        take: Number(pageSize),
        order: { sortOrder: 'DESC', createTime: 'DESC' },
      });

      return {
        success: true,
        result,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        message: '获取积分商品列表成功',
      };
    } catch (error) {
      console.error('获取积分商品列表失败:', error);
      return {
        success: false,
        result: [],
        total: 0,
        message: '获取积分商品列表失败: ' + error.message,
      };
    }
  }

  /**
   * 获取积分商品详情
   */
  async findOne(id: string) {
    try {
      const goods = await this.pointsGoodsRepository.findOne({
        where: { id, deleted: false },
      });

      if (!goods) {
        return {
          success: false,
          message: '积分商品不存在',
        };
      }

      return {
        success: true,
        result: goods,
        message: '获取积分商品详情成功',
      };
    } catch (error) {
      console.error('获取积分商品详情失败:', error);
      return {
        success: false,
        message: '获取积分商品详情失败: ' + error.message,
      };
    }
  }

  /**
   * 创建积分商品
   */
  async create(goodsData: any) {
    try {
      if (!goodsData.goodsName) {
        throw new BadRequestException('商品名称不能为空');
      }
      if (!goodsData.points || goodsData.points <= 0) {
        throw new BadRequestException('兑换积分必须大于0');
      }
      if (goodsData.stock === undefined || goodsData.stock < 0) {
        throw new BadRequestException('库存数量不能为负数');
      }

      const newGoods = this.pointsGoodsRepository.create({
        ...goodsData,
        stock: goodsData.stock || 0,
        sales: 0,
        isShow: goodsData.isShow !== undefined ? goodsData.isShow : true,
        exchangeType: goodsData.exchangeType || 1,
        goodsType: goodsData.goodsType || 1,
        sortOrder: goodsData.sortOrder || 0,
      });

      const savedGoods = await this.pointsGoodsRepository.save(newGoods);

      return {
        success: true,
        result: savedGoods,
        message: '创建积分商品成功',
      };
    } catch (error) {
      console.error('创建积分商品失败:', error);
      return {
        success: false,
        message: error.message || '创建积分商品失败',
      };
    }
  }

  /**
   * 更新积分商品
   */
  async update(id: string, goodsData: any) {
    try {
      const goods = await this.pointsGoodsRepository.findOne({
        where: { id, deleted: false },
      });

      if (!goods) {
        return {
          success: false,
          message: '积分商品不存在',
        };
      }

      if (goodsData.points !== undefined && goodsData.points <= 0) {
        return {
          success: false,
          message: '兑换积分必须大于0',
        };
      }

      Object.assign(goods, goodsData);
      const updatedGoods = await this.pointsGoodsRepository.save(goods);

      return {
        success: true,
        result: updatedGoods,
        message: '更新积分商品成功',
      };
    } catch (error) {
      console.error('更新积分商品失败:', error);
      return {
        success: false,
        message: '更新积分商品失败: ' + error.message,
      };
    }
  }

  /**
   * 删除积分商品
   */
  async remove(id: string) {
    try {
      const goods = await this.pointsGoodsRepository.findOne({
        where: { id, deleted: false },
      });

      if (!goods) {
        return {
          success: false,
          message: '积分商品不存在',
        };
      }

      goods.deleted = true;
      await this.pointsGoodsRepository.save(goods);

      return {
        success: true,
        message: '删除积分商品成功',
      };
    } catch (error) {
      console.error('删除积分商品失败:', error);
      return {
        success: false,
        message: '删除积分商品失败: ' + error.message,
      };
    }
  }

  /**
   * 批量删除积分商品
   */
  async batchRemove(ids: string[]) {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: false,
          message: '请选择要删除的商品',
        };
      }

      const goodsList = await this.pointsGoodsRepository.find({
        where: { id: In(ids), deleted: false },
      });

      if (goodsList.length === 0) {
        return {
          success: false,
          message: '未找到要删除的商品',
        };
      }

      goodsList.forEach(goods => {
        goods.deleted = true;
      });

      await this.pointsGoodsRepository.save(goodsList);

      return {
        success: true,
        message: `成功删除 ${goodsList.length} 个商品`,
      };
    } catch (error) {
      console.error('批量删除积分商品失败:', error);
      return {
        success: false,
        message: '批量删除积分商品失败: ' + error.message,
      };
    }
  }

  /**
   * 更新商品库存
   */
  async updateStock(id: string, stock: number) {
    try {
      const goods = await this.pointsGoodsRepository.findOne({
        where: { id, deleted: false },
      });

      if (!goods) {
        return {
          success: false,
          message: '积分商品不存在',
        };
      }

      if (stock < 0) {
        return {
          success: false,
          message: '库存不能为负数',
        };
      }

      goods.stock = stock;
      await this.pointsGoodsRepository.save(goods);

      return {
        success: true,
        result: goods,
        message: '更新库存成功',
      };
    } catch (error) {
      console.error('更新库存失败:', error);
      return {
        success: false,
        message: '更新库存失败: ' + error.message,
      };
    }
  }
}

