import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { GroupBuy, GroupBuyGoods, GroupBuyOrder } from '../entities/group-buy.entity';
import { GroupBuyCreateDto } from '../dto/group-buy-create.dto';
import { CustomException } from '../../filters/custom-exception';
import { CodeEnum } from '../../enums/code.enum';

@Injectable()
export class GroupBuyService {
  constructor(
    @InjectRepository(GroupBuy)
    private groupBuyRepository: Repository<GroupBuy>,
    @InjectRepository(GroupBuyGoods)
    private groupBuyGoodsRepository: Repository<GroupBuyGoods>,
    @InjectRepository(GroupBuyOrder)
    private groupBuyOrderRepository: Repository<GroupBuyOrder>,
  ) {}

  /**
   * 创建拼团活动
   */
  async createGroupBuy(createDto: GroupBuyCreateDto, createBy: string): Promise<GroupBuy> {
    // 检查活动名称是否已存在
    const existing = await this.groupBuyRepository.findOne({
      where: { name: createDto.name, deleteFlag: 0 }
    });

    if (existing) {
      throw new CustomException(CodeEnum.GROUP_BUY_NAME_EXISTS);
    }

    // 创建拼团活动
    const groupBuy = this.groupBuyRepository.create({
      name: createDto.name,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      validHours: createDto.validHours || 24,
      limitCount: createDto.limitCount || 0,
      description: createDto.description,
      shareTitle: createDto.shareTitle,
      shareImage: createDto.shareImage,
      shareDescription: createDto.shareDescription,
      remark: createDto.remark,
      createBy,
      status: 0, // 未开始
    });

    const savedGroupBuy = await this.groupBuyRepository.save(groupBuy);

    // 创建拼团商品
    for (const goodsDto of createDto.goods) {
      const groupBuyGoods = this.groupBuyGoodsRepository.create({
        groupBuyId: savedGroupBuy.id,
        productId: goodsDto.productId,
        productName: goodsDto.productId, // 应该从商品表获取
        productImage: '', // 应该从商品表获取
        originalPrice: 0, // 应该从商品表获取
        groupBuyPrice: goodsDto.groupBuyPrice,
        groupCount: goodsDto.groupCount,
        stock: goodsDto.stock || 0,
        soldCount: 0,
        sortOrder: goodsDto.sortOrder || 1,
        remark: goodsDto.remark,
      });

      await this.groupBuyGoodsRepository.save(groupBuyGoods);
    }

    return savedGroupBuy;
  }

  /**
   * 分页查询拼团活动
   */
  async getGroupBuys(query: {
    page?: number;
    limit?: number;
    name?: string;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    createBy?: string;
  }): Promise<{ items: GroupBuy[]; total: number }> {
    const { page = 1, limit = 10, name, status, startTime, endTime, createBy } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (name) {
      whereCondition.name = Like(`%${name}%`);
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (createBy) {
      whereCondition.createBy = createBy;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.groupBuyRepository.findAndCount({
      where: whereCondition,
      relations: ['goods'],
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取拼团活动详情
   */
  async getGroupBuyDetail(id: string): Promise<GroupBuy> {
    const groupBuy = await this.groupBuyRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['goods']
    });

    if (!groupBuy) {
      throw new CustomException(CodeEnum.GROUP_BUY_NOT_FOUND);
    }

    // 更新活动状态
    const now = new Date();
    if (now < groupBuy.startTime) {
      groupBuy.status = 0; // 未开始
    } else if (now >= groupBuy.startTime && now <= groupBuy.endTime) {
      groupBuy.status = 1; // 进行中
    } else {
      groupBuy.status = 2; // 已结束
    }

    await this.groupBuyRepository.save(groupBuy);

    return groupBuy;
  }

  /**
   * 更新拼团活动
   */
  async updateGroupBuy(
    id: string,
    updateDto: Partial<GroupBuyCreateDto>,
    updateBy: string
  ): Promise<GroupBuy> {
    const groupBuy = await this.getGroupBuyDetail(id);

    // 如果活动已开始，不能修改某些字段
    if (groupBuy.status === 1) {
      const allowedFields = ['description', 'shareTitle', 'shareImage', 'shareDescription', 'remark'];
      const updateKeys = Object.keys(updateDto);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          throw new CustomException(CodeEnum.GROUP_BUY_CANNOT_UPDATE);
        }
      }
    }

    Object.assign(groupBuy, updateDto, {
      updateBy,
    });

    const savedGroupBuy = await this.groupBuyRepository.save(groupBuy);

    // 更新拼团商品
    if (updateDto.goods) {
      // 先删除原有商品
      await this.groupBuyGoodsRepository.delete({
        groupBuyId: id
      });

      // 创建新商品
      for (const goodsDto of updateDto.goods) {
        const groupBuyGoods = this.groupBuyGoodsRepository.create({
          groupBuyId: id,
          productId: goodsDto.productId,
          productName: goodsDto.productId, // 应该从商品表获取
          productImage: '', // 应该从商品表获取
          originalPrice: 0, // 应该从商品表获取
          groupBuyPrice: goodsDto.groupBuyPrice,
          groupCount: goodsDto.groupCount,
          stock: goodsDto.stock || 0,
          soldCount: 0,
          sortOrder: goodsDto.sortOrder || 1,
          remark: goodsDto.remark,
        });

        await this.groupBuyGoodsRepository.save(groupBuyGoods);
      }
    }

    return savedGroupBuy;
  }

  /**
   * 删除拼团活动
   */
  async deleteGroupBuy(id: string): Promise<void> {
    const groupBuy = await this.groupBuyRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!groupBuy) {
      throw new CustomException(CodeEnum.GROUP_BUY_NOT_FOUND);
    }

    // 如果活动已开始，不能删除
    if (groupBuy.status === 1) {
      throw new CustomException(CodeEnum.GROUP_BUY_CANNOT_DELETE);
    }

    groupBuy.deleteFlag = 1;
    await this.groupBuyRepository.save(groupBuy);
  }

  /**
   * 发起拼团（团长）
   */
  async startGroupBuy(groupBuyGoodsId: string, quantity: number, orderData: {
    orderId: string;
    orderNo: string;
    memberId: string;
    memberName: string;
  }): Promise<GroupBuyOrder> {
    const groupBuyGoods = await this.groupBuyGoodsRepository.findOne({
      where: { id: groupBuyGoodsId, deleteFlag: 0 }
    });

    if (!groupBuyGoods) {
      throw new CustomException(CodeEnum.GROUP_BUY_GOODS_NOT_FOUND);
    }

    // 检查库存
    if (groupBuyGoods.stock < quantity) {
      throw new CustomException(CodeEnum.GROUP_BUY_STOCK_INSUFFICIENT);
    }

    // 检查限购
    if (groupBuyGoods.stock > 0) {
      // 这里应该检查限购逻辑
    }

    // 检查拼团活动是否有效
    const groupBuy = await this.getGroupBuyDetail(groupBuyGoods.groupBuyId);
    if (groupBuy.status !== 1) {
      throw new CustomException(CodeEnum.GROUP_BUY_NOT_ACTIVE);
    }

    // 减少库存
    await this.groupBuyGoodsRepository.decrement(
      { id: groupBuyGoodsId },
      'stock',
      quantity
    );

    // 增加已售数量
    await this.groupBuyGoodsRepository.increment(
      { id: groupBuyGoodsId },
      'soldCount',
      quantity
    );

    // 计算过期时间
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + groupBuy.validHours);

    // 创建拼团订单（团长）
    const groupBuyOrder = this.groupBuyOrderRepository.create({
      groupBuyGoodsId,
      mainOrderId: orderData.orderId,
      orderId: orderData.orderId,
      orderNo: orderData.orderNo,
      memberId: orderData.memberId,
      memberName: orderData.memberName,
      parentId: null,
      role: 1, // 团长
      status: 1, // 待成团
      expireTime,
    });

    return await this.groupBuyOrderRepository.save(groupBuyOrder);
  }

  /**
   * 参与拼团（团员）
   */
  async joinGroupBuy(mainOrderId: string, quantity: number, orderData: {
    orderId: string;
    orderNo: string;
    memberId: string;
    memberName: string;
  }): Promise<GroupBuyOrder> {
    const mainGroupBuyOrder = await this.groupBuyOrderRepository.findOne({
      where: { orderId: mainOrderId, role: 1, status: 1, deleteFlag: 0 }
    });

    if (!mainGroupBuyOrder) {
      throw new CustomException(CodeEnum.GROUP_BUY_MAIN_ORDER_NOT_FOUND);
    }

    // 检查是否已过期
    if (mainGroupBuyOrder.expireTime && new Date() > mainGroupBuyOrder.expireTime) {
      throw new CustomException(CodeEnum.GROUP_BUY_EXPIRED);
    }

    const groupBuyGoods = await this.groupBuyGoodsRepository.findOne({
      where: { id: mainGroupBuyOrder.groupBuyGoodsId, deleteFlag: 0 }
    });

    if (!groupBuyGoods) {
      throw new CustomException(CodeEnum.GROUP_BUY_GOODS_NOT_FOUND);
    }

    // 检查库存
    if (groupBuyGoods.stock < quantity) {
      throw new CustomException(CodeEnum.GROUP_BUY_STOCK_INSUFFICIENT);
    }

    // 检查是否已参与该拼团
    const existingOrder = await this.groupBuyOrderRepository.findOne({
      where: {
        parentId: mainGroupBuyOrder.id,
        memberId: orderData.memberId,
        deleteFlag: 0
      }
    });

    if (existingOrder) {
      throw new CustomException(CodeEnum.GROUP_BUY_ALREADY_JOINED);
    }

    // 减少库存
    await this.groupBuyGoodsRepository.decrement(
      { id: mainGroupBuyOrder.groupBuyGoodsId },
      'stock',
      quantity
    );

    // 增加已售数量
    await this.groupBuyGoodsRepository.increment(
      { id: mainGroupBuyOrder.groupBuyGoodsId },
      'soldCount',
      quantity
    );

    // 创建拼团订单（团员）
    const groupBuyOrder = this.groupBuyOrderRepository.create({
      groupBuyGoodsId: mainGroupBuyOrder.groupBuyGoodsId,
      mainOrderId: mainGroupBuyOrder.orderId,
      orderId: orderData.orderId,
      orderNo: orderData.orderNo,
      memberId: orderData.memberId,
      memberName: orderData.memberName,
      parentId: mainGroupBuyOrder.id,
      role: 2, // 团员
      status: 1, // 待成团
      expireTime: mainGroupBuyOrder.expireTime,
    });

    const savedOrder = await this.groupBuyOrderRepository.save(groupBuyOrder);

    // 检查是否成团
    await this.checkGroupStatus(mainGroupBuyOrder.groupBuyGoodsId, mainGroupBuyOrder.id);

    return savedOrder;
  }

  /**
   * 检查拼团状态
   */
  private async checkGroupStatus(groupBuyGoodsId: string, mainOrderId: string): Promise<void> {
    const groupBuyGoods = await this.groupBuyGoodsRepository.findOne({
      where: { id: groupBuyGoodsId, deleteFlag: 0 }
    });

    if (!groupBuyGoods) {
      return;
    }

    // 获取该拼团的订单数量
    const orderCount = await this.groupBuyOrderRepository.count({
      where: {
        groupBuyGoodsId,
        mainOrderId: { $in: [mainOrderId, null] } as any, // 团长订单的mainOrderId就是自己的orderId
        status: 1,
        deleteFlag: 0
      }
    });

    if (orderCount >= groupBuyGoods.groupCount) {
      // 成团，更新所有相关订单状态
      await this.groupBuyOrderRepository.update(
        {
          groupBuyGoodsId,
          mainOrderId: { $in: [mainOrderId, null] } as any,
          status: 1,
          deleteFlag: 0
        },
        {
          status: 2, // 已成团
          successTime: new Date()
        }
      );
    }
  }

  /**
   * 获取当前进行中的拼团活动
   */
  async getCurrentGroupBuys(): Promise<GroupBuy[]> {
    const now = new Date();
    
    const groupBuys = await this.groupBuyRepository.find({
      where: {
        status: 1,
        deleteFlag: 0,
        startTime: { $lte: now } as any,
        endTime: { $gte: now } as any,
      },
      relations: ['goods'],
      order: { createTime: 'DESC' },
    });

    return groupBuys;
  }

  /**
   * 获取我的拼团订单
   */
  async getMyGroupOrders(memberId: string, query?: {
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: GroupBuyOrder[]; total: number }> {
    const { status, page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const whereCondition: any = { memberId, deleteFlag: 0 };

    if (status !== undefined) {
      whereCondition.status = status;
    }

    const [items, total] = await this.groupBuyOrderRepository.findAndCount({
      where: whereCondition,
      relations: ['groupBuyGoods'],
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 取消拼团订单
   */
  async cancelGroupOrder(orderId: string): Promise<void> {
    const groupOrder = await this.groupBuyOrderRepository.findOne({
      where: { orderId, deleteFlag: 0 }
    });

    if (!groupOrder) {
      throw new CustomException(CodeEnum.GROUP_ORDER_NOT_FOUND);
    }

    // 如果是团长，取消整个拼团
    if (groupOrder.role === 1) {
      // 取消所有团员订单
      await this.groupBuyOrderRepository.update(
        { parentId: groupOrder.id, status: 1, deleteFlag: 0 },
        { status: 4 } // 已取消
      );
    }

    // 更新订单状态
    groupOrder.status = 4; // 已取消
    await this.groupBuyOrderRepository.save(groupOrder);

    // 恢复库存
    await this.groupBuyGoodsRepository.increment(
      { id: groupOrder.groupBuyGoodsId },
      'stock',
      1 // 假设每个订单数量为1
    );

    await this.groupBuyGoodsRepository.decrement(
      { id: groupOrder.groupBuyGoodsId },
      'soldCount',
      1
    );
  }

  /**
   * 获取拼团活动统计
   */
  async getStatistics(query?: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    // 这里应该实现统计逻辑
    return {
      totalCount: 0,
      upcomingCount: 0,
      ongoingCount: 0,
      endedCount: 0,
      totalGroups: 0,
      successGroups: 0,
      totalOrders: 0,
    };
  }
}