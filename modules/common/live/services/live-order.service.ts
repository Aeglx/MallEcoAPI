import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LiveOrder } from '../entities/live-order.entity';
import { LiveRoom } from '../entities/live-room.entity';
import { CreateLiveOrderDto } from '../dto/create-live-order.dto';
import { UpdateLiveOrderDto } from '../dto/update-live-order.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class LiveOrderService {
  constructor(
    @InjectRepository(LiveOrder)
    private readonly liveOrderRepository: Repository<LiveOrder>,
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
  ) {}

  /**
   * 创建直播订单
   */
  async create(createLiveOrderDto: CreateLiveOrderDto): Promise<LiveOrder> {
    // 验证直播间是否存在
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: createLiveOrderDto.liveRoomId }
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播间 ${createLiveOrderDto.liveRoomId} 不存在`);
    }

    const liveOrder = this.liveOrderRepository.create(createLiveOrderDto);
    return await this.liveOrderRepository.save(liveOrder);
  }

  /**
   * 分页查询直播订单列表
   */
  async findAll(paginationDto: PaginationDto): Promise<[LiveOrder[], number]> {
    const { page = 1, limit = 10, liveRoomId, memberId, status, startDate, endDate } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveOrderRepository.createQueryBuilder('liveOrder')
      .leftJoinAndSelect('liveOrder.liveRoom', 'liveRoom');

    if (liveRoomId) {
      queryBuilder.andWhere('liveOrder.liveRoomId = :liveRoomId', { liveRoomId });
    }

    if (memberId) {
      queryBuilder.andWhere('liveOrder.memberId = :memberId', { memberId });
    }

    if (status) {
      queryBuilder.andWhere('liveOrder.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('liveOrder.createTime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    }

    queryBuilder.orderBy('liveOrder.createTime', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 根据ID查询直播订单详情
   */
  async findOne(id: string): Promise<LiveOrder> {
    const liveOrder = await this.liveOrderRepository.findOne({
      where: { id },
      relations: ['liveRoom']
    });

    if (!liveOrder) {
      throw new NotFoundException(`直播订单 ${id} 不存在`);
    }

    return liveOrder;
  }

  /**
   * 更新直播订单信息
   */
  async update(id: string, updateLiveOrderDto: UpdateLiveOrderDto): Promise<LiveOrder> {
    const liveOrder = await this.findOne(id);
    
    Object.assign(liveOrder, updateLiveOrderDto);
    return await this.liveOrderRepository.save(liveOrder);
  }

  /**
   * 删除直播订单
   */
  async remove(id: string): Promise<void> {
    const liveOrder = await this.findOne(id);
    
    if (liveOrder.status === 'PAID' || liveOrder.status === 'SHIPPED') {
      throw new BadRequestException('已支付的订单不能删除');
    }

    await this.liveOrderRepository.remove(liveOrder);
  }

  /**
   * 更新订单状态
   */
  async updateStatus(id: string, status: string, paymentInfo?: {
    paymentMethod?: string;
    paymentTransactionId?: string;
    payTime?: Date;
  }): Promise<LiveOrder> {
    const liveOrder = await this.findOne(id);
    
    if (status === 'PAID' && liveOrder.status !== 'PENDING') {
      throw new BadRequestException('只有待支付订单可以标记为已支付');
    }

    if (status === 'SHIPPED' && liveOrder.status !== 'PAID') {
      throw new BadRequestException('只有已支付订单可以标记为已发货');
    }

    if (status === 'COMPLETED' && liveOrder.status !== 'SHIPPED') {
      throw new BadRequestException('只有已发货订单可以标记为已完成');
    }

    liveOrder.status = status;

    if (status === 'PAID' && paymentInfo) {
      Object.assign(liveOrder, paymentInfo);
    }

    if (status === 'COMPLETED') {
      liveOrder.ratingTime = new Date();
    }

    return await this.liveOrderRepository.save(liveOrder);
  }

  /**
   * 订单退款
   */
  async refund(
    id: string, 
    refundAmount: number, 
    refundReason: string
  ): Promise<LiveOrder> {
    const liveOrder = await this.findOne(id);
    
    if (liveOrder.status !== 'PAID' && liveOrder.status !== 'SHIPPED') {
      throw new BadRequestException('只有已支付或已发货订单可以退款');
    }

    if (refundAmount > liveOrder.totalAmount) {
      throw new BadRequestException('退款金额不能超过订单金额');
    }

    liveOrder.status = 'REFUNDED';
    liveOrder.isRefunded = true;
    liveOrder.refundAmount = refundAmount;
    liveOrder.refundReason = refundReason;
    liveOrder.refundTime = new Date();

    return await this.liveOrderRepository.save(liveOrder);
  }

  /**
   * 订单评价
   */
  async rateOrder(
    id: string, 
    rating: number, 
    ratingComment: string
  ): Promise<LiveOrder> {
    const liveOrder = await this.findOne(id);
    
    if (liveOrder.status !== 'COMPLETED') {
      throw new BadRequestException('只有已完成订单可以评价');
    }

    if (liveOrder.isRated) {
      throw new BadRequestException('订单已经评价过');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('评价分数必须在1-5之间');
    }

    liveOrder.isRated = true;
    liveOrder.rating = rating;
    liveOrder.ratingComment = ratingComment;
    liveOrder.ratingTime = new Date();

    return await this.liveOrderRepository.save(liveOrder);
  }

  /**
   * 根据直播间ID获取订单统计
   */
  async getStatisticsByLiveRoomId(liveRoomId: string): Promise<{
    totalOrders: number;
    totalSales: number;
    paidOrders: number;
    completedOrders: number;
    refundedOrders: number;
    avgRating: number;
  }> {
    const orders = await this.liveOrderRepository.find({
      where: { liveRoomId }
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidOrders = orders.filter(order => order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED').length;
    const completedOrders = orders.filter(order => order.status === 'COMPLETED').length;
    const refundedOrders = orders.filter(order => order.status === 'REFUNDED').length;
    
    const ratedOrders = orders.filter(order => order.isRated && order.rating);
    const avgRating = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length 
      : 0;

    return {
      totalOrders,
      totalSales,
      paidOrders,
      completedOrders,
      refundedOrders,
      avgRating: parseFloat(avgRating.toFixed(2))
    };
  }

  /**
   * 根据会员ID获取订单列表
   */
  async findByMemberId(memberId: string, paginationDto: PaginationDto): Promise<[LiveOrder[], number]> {
    const { page = 1, limit = 10, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveOrderRepository.createQueryBuilder('liveOrder')
      .where('liveOrder.memberId = :memberId', { memberId });

    if (status) {
      queryBuilder.andWhere('liveOrder.status = :status', { status });
    }

    queryBuilder.orderBy('liveOrder.createTime', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 批量更新订单状态
   */
  async batchUpdateStatus(orderIds: string[], status: string): Promise<void> {
    const updateResult = await this.liveOrderRepository
      .createQueryBuilder()
      .update(LiveOrder)
      .set({ status })
      .where('id IN (:...orderIds)', { orderIds })
      .execute();

    if (updateResult.affected === 0) {
      throw new NotFoundException('没有找到匹配的订单');
    }
  }
}