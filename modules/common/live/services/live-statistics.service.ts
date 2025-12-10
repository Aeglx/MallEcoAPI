import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LiveStatistics } from '../entities/live-statistics.entity';
import { LiveRoom } from '../entities/live-room.entity';
import { LiveOrder } from '../entities/live-order.entity';
import { LiveChat } from '../entities/live-chat.entity';

@Injectable()
export class LiveStatisticsService {
  constructor(
    @InjectRepository(LiveStatistics)
    private readonly liveStatisticsRepository: Repository<LiveStatistics>,
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
    @InjectRepository(LiveOrder)
    private readonly liveOrderRepository: Repository<LiveOrder>,
    @InjectRepository(LiveChat)
    private readonly liveChatRepository: Repository<LiveChat>,
  ) {}

  /**
   * 生成直播间日统计
   */
  async generateDailyStatistics(liveRoomId: string, date: Date): Promise<LiveStatistics> {
    // 检查是否已生成该日期的统计
    const existingStat = await this.liveStatisticsRepository.findOne({
      where: {
        liveRoomId,
        statisticsDate: date
      }
    });

    if (existingStat) {
      return existingStat;
    }

    // 计算统计日期范围
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 获取直播间信息
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: liveRoomId }
    });

    if (!liveRoom) {
      throw new Error(`直播间 ${liveRoomId} 不存在`);
    }

    // 获取订单统计
    const orders = await this.liveOrderRepository.find({
      where: {
        liveRoomId,
        createTime: Between(startOfDay, endOfDay)
      }
    });

    // 获取聊天统计
    const chats = await this.liveChatRepository.find({
      where: {
        liveRoomId,
        createTime: Between(startOfDay, endOfDay)
      }
    });

    // 计算订单统计
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidOrders = orders.filter(order => 
      order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED'
    ).length;
    const completedOrders = orders.filter(order => order.status === 'COMPLETED').length;
    const refundedOrders = orders.filter(order => order.status === 'REFUNDED').length;
    const refundAmount = orders.filter(order => order.status === 'REFUNDED')
      .reduce((sum, order) => sum + order.refundAmount, 0);

    // 计算聊天统计
    const totalMessages = chats.length;
    const giftMessages = chats.filter(chat => chat.messageType === 'GIFT').length;
    const giftIncome = chats.filter(chat => chat.messageType === 'GIFT')
      .reduce((sum, chat) => sum + (chat.giftValue || 0), 0);
    const giftCount = chats.filter(chat => chat.messageType === 'GIFT')
      .reduce((sum, chat) => sum + (chat.giftQuantity || 0), 0);

    // 计算转化率
    const totalViewers = liveRoom.viewerCount;
    const conversionRate = totalViewers > 0 ? (totalOrders / totalViewers) * 100 : 0;

    // 计算客单价
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // 计算退款率
    const refundRate = totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0;

    // 创建统计记录
    const statistics = this.liveStatisticsRepository.create({
      liveRoomId,
      statisticsDate: date,
      totalViewers,
      avgWatchDuration: this.calculateAvgWatchDuration(chats),
      totalLikes: liveRoom.likeCount,
      commentCount: chats.filter(chat => chat.messageType === 'TEXT').length,
      shareCount: 0, // 需要从其他系统获取分享数据
      orderCount: totalOrders,
      totalSales,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      refundOrderCount: refundedOrders,
      refundAmount,
      refundRate: parseFloat(refundRate.toFixed(2)),
      activeUsers: this.calculateActiveUsers(chats),
      newFollowers: 0, // 需要从会员系统获取
      giftIncome,
      giftCount
    });

    return await this.liveStatisticsRepository.save(statistics);
  }

  /**
   * 计算平均观看时长
   */
  private calculateAvgWatchDuration(chats: LiveChat[]): number {
    if (chats.length === 0) return 0;
    
    // 简单实现：假设每条消息代表用户活跃
    // 实际应该基于更精确的用户行为数据
    return Math.min(300, Math.floor(chats.length * 30)); // 最大5分钟
  }

  /**
   * 计算活跃用户数
   */
  private calculateActiveUsers(chats: LiveChat[]): number {
    const uniqueUsers = new Set(chats.map(chat => chat.senderId));
    return uniqueUsers.size;
  }

  /**
   * 获取直播间统计详情
   */
  async getLiveRoomStatistics(liveRoomId: string, startDate: Date, endDate: Date): Promise<LiveStatistics[]> {
    return await this.liveStatisticsRepository.find({
      where: {
        liveRoomId,
        statisticsDate: Between(startDate, endDate)
      },
      order: {
        statisticsDate: 'ASC'
      }
    });
  }

  /**
   * 获取直播间总统计
   */
  async getLiveRoomSummary(liveRoomId: string): Promise<{
    totalViewers: number;
    totalSales: number;
    totalOrders: number;
    avgRating: number;
    totalGiftIncome: number;
    avgWatchDuration: number;
  }> {
    const stats = await this.liveStatisticsRepository.find({
      where: { liveRoomId }
    });

    const totalViewers = stats.reduce((sum, stat) => sum + stat.totalViewers, 0);
    const totalSales = stats.reduce((sum, stat) => sum + stat.totalSales, 0);
    const totalOrders = stats.reduce((sum, stat) => sum + stat.orderCount, 0);
    const totalGiftIncome = stats.reduce((sum, stat) => sum + stat.giftIncome, 0);
    
    const avgWatchDuration = stats.length > 0 
      ? stats.reduce((sum, stat) => sum + stat.avgWatchDuration, 0) / stats.length 
      : 0;

    // 获取订单评价数据
    const orders = await this.liveOrderRepository.find({
      where: { liveRoomId, isRated: true }
    });

    const avgRating = orders.length > 0
      ? orders.reduce((sum, order) => sum + (order.rating || 0), 0) / orders.length
      : 0;

    return {
      totalViewers,
      totalSales,
      totalOrders,
      avgRating: parseFloat(avgRating.toFixed(2)),
      totalGiftIncome,
      avgWatchDuration: parseFloat(avgWatchDuration.toFixed(2))
    };
  }

  /**
   * 获取平台直播统计
   */
  async getPlatformStatistics(startDate: Date, endDate: Date): Promise<{
    totalLiveRooms: number;
    activeLiveRooms: number;
    totalViewers: number;
    totalSales: number;
    totalOrders: number;
    avgConversionRate: number;
    topLiveRooms: Array<{id: string, title: string, sales: number, viewers: number}>;
  }> {
    const stats = await this.liveStatisticsRepository.find({
      where: {
        statisticsDate: Between(startDate, endDate)
      },
      relations: ['liveRoom']
    });

    const liveRooms = await this.liveRoomRepository.find({
      where: {
        createTime: Between(startDate, endDate)
      }
    });

    const activeLiveRooms = liveRooms.filter(room => 
      room.status === 'LIVE' || room.status === 'PENDING'
    ).length;

    const totalViewers = stats.reduce((sum, stat) => sum + stat.totalViewers, 0);
    const totalSales = stats.reduce((sum, stat) => sum + stat.totalSales, 0);
    const totalOrders = stats.reduce((sum, stat) => sum + stat.orderCount, 0);
    
    const avgConversionRate = stats.length > 0
      ? stats.reduce((sum, stat) => sum + stat.conversionRate, 0) / stats.length
      : 0;

    // 获取销售额最高的直播间
    const roomSalesMap = new Map<string, { sales: number, viewers: number, title: string }>();
    
    stats.forEach(stat => {
      if (stat.liveRoom) {
        const current = roomSalesMap.get(stat.liveRoomId) || { sales: 0, viewers: 0, title: stat.liveRoom.title };
        roomSalesMap.set(stat.liveRoomId, {
          sales: current.sales + stat.totalSales,
          viewers: current.viewers + stat.totalViewers,
          title: stat.liveRoom.title
        });
      }
    });

    const topLiveRooms = Array.from(roomSalesMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        sales: data.sales,
        viewers: data.viewers
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return {
      totalLiveRooms: liveRooms.length,
      activeLiveRooms,
      totalViewers,
      totalSales,
      totalOrders,
      avgConversionRate: parseFloat(avgConversionRate.toFixed(2)),
      topLiveRooms
    };
  }

  /**
   * 清理过期的统计记录
   */
  async cleanupOldStatistics(daysToKeep: number = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.liveStatisticsRepository
      .createQueryBuilder()
      .delete()
      .where('statisticsDate < :cutoffDate', { cutoffDate })
      .execute();
  }

  /**
   * 批量生成统计
   */
  async batchGenerateStatistics(liveRoomIds: string[], date: Date): Promise<void> {
    const generatePromises = liveRoomIds.map(async (liveRoomId) => {
      try {
        await this.generateDailyStatistics(liveRoomId, date);
      } catch (error) {
        console.error(`生成直播间 ${liveRoomId} 统计失败:`, error.message);
      }
    });

    await Promise.all(generatePromises);
  }
}