import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfterSales, AfterSalesStatus } from '../entities/after-sales.entity';
import { CreateAfterSalesDto } from '../dto/create-after-sales.dto';
import { UpdateAfterSalesDto } from '../dto/update-after-sales.dto';
import { OrdersService } from '../../orders/orders.service';
import { PaymentService } from '../../payment/services/payment.service';

@Injectable()
export class AfterSalesService {
  constructor(
    @InjectRepository(AfterSales) private readonly afterSalesRepository: Repository<AfterSales>,
    private readonly orderService: OrdersService,
    private readonly paymentService: PaymentService
  ) {}

  /**
   * 创建售后服务申请
   * @param createAfterSalesDto 创建售后服务DTO
   */
  async createAfterSales(createAfterSalesDto: CreateAfterSalesDto): Promise<AfterSales> {
    // 检查订单是否存在
    const order = await this.orderService.getOrderById(createAfterSalesDto.orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态是否允许申请售后服务
    if (order.status !== 4 && order.status !== 2) {
      throw new BadRequestException('只有已完成或已发货的订单才能申请售后服务');
    }

    // 创建售后服务记录
    const afterSales = this.afterSalesRepository.create({
      ...createAfterSalesDto,
      status: AfterSalesStatus.APPLIED
    });

    return await this.afterSalesRepository.save(afterSales);
  }

  /**
   * 审核售后服务申请
   * @param id 售后服务ID
   * @param updateAfterSalesDto 更新售后服务DTO
   */
  async reviewAfterSales(id: number, updateAfterSalesDto: UpdateAfterSalesDto): Promise<AfterSales> {
    const afterSales = await this.findAfterSalesById(id);
    if (afterSales.status !== AfterSalesStatus.APPLIED) {
      throw new BadRequestException('只有待审核的售后服务申请才能被审核');
    }

    if (updateAfterSalesDto.status === AfterSalesStatus.APPROVED) {
      // 审核通过
      afterSales.status = AfterSalesStatus.APPROVED;
      afterSales.reviewReason = updateAfterSalesDto.reviewReason;
      afterSales.adminId = updateAfterSalesDto.adminId;
    } else if (updateAfterSalesDto.status === AfterSalesStatus.REJECTED) {
      // 审核拒绝
      afterSales.status = AfterSalesStatus.REJECTED;
      afterSales.reviewReason = updateAfterSalesDto.reviewReason;
      afterSales.adminId = updateAfterSalesDto.adminId;
    } else {
      throw new BadRequestException('无效的审核状态');
    }

    return await this.afterSalesRepository.save(afterSales);
  }

  /**
   * 用户提交退货物流信息
   * @param id 售后服务ID
   * @param updateAfterSalesDto 更新售后服务DTO
   */
  async submitReturnInfo(id: number, updateAfterSalesDto: UpdateAfterSalesDto): Promise<AfterSales> {
    const afterSales = await this.findAfterSalesById(id);
    if (afterSales.status !== AfterSalesStatus.APPROVED) {
      throw new BadRequestException('只有审核通过的售后服务申请才能提交退货物流信息');
    }

    if (!updateAfterSalesDto.shippingCompany || !updateAfterSalesDto.trackingNumber) {
      throw new BadRequestException('快递公司和快递单号不能为空');
    }

    afterSales.status = AfterSalesStatus.PROCESSING;
    afterSales.shippingCompany = updateAfterSalesDto.shippingCompany;
    afterSales.trackingNumber = updateAfterSalesDto.trackingNumber;

    return await this.afterSalesRepository.save(afterSales);
  }

  /**
   * 确认收货并完成售后服务
   * @param id 售后服务ID
   * @param updateAfterSalesDto 更新售后服务DTO
   */
  async completeAfterSales(id: number, updateAfterSalesDto: UpdateAfterSalesDto): Promise<AfterSales> {
    const afterSales = await this.findAfterSalesById(id);
    if (afterSales.status !== AfterSalesStatus.PROCESSING) {
      throw new BadRequestException('只有处理中的售后服务申请才能完成');
    }

    afterSales.status = AfterSalesStatus.COMPLETED;
    afterSales.adminId = updateAfterSalesDto.adminId;

    // 如果有退款金额，执行退款操作
    if (updateAfterSalesDto.refundAmount && updateAfterSalesDto.refundAmount > 0) {
      afterSales.refundAmount = updateAfterSalesDto.refundAmount;
      // 实际项目中这里应该调用支付服务的退款接口
      // await this.paymentService.refund(afterSales.orderId, updateAfterSalesDto.refundAmount);
    }

    return await this.afterSalesRepository.save(afterSales);
  }

  /**
   * 用户取消售后服务申请
   * @param id 售后服务ID
   * @param userId 用户ID
   */
  async cancelAfterSales(id: number, userId: string): Promise<AfterSales> {
    const afterSales = await this.findAfterSalesById(id);
    if (afterSales.userId !== userId) {
      throw new BadRequestException('您没有权限取消此售后服务申请');
    }

    if (afterSales.status !== AfterSalesStatus.APPLIED) {
      throw new BadRequestException('只有待审核的售后服务申请才能取消');
    }

    afterSales.status = AfterSalesStatus.CANCELLED;

    return await this.afterSalesRepository.save(afterSales);
  }

  /**
   * 获取售后服务详情
   * @param id 售后服务ID
   */
  async findAfterSalesById(id: number): Promise<AfterSales> {
    const afterSales = await this.afterSalesRepository.findOneBy({ id });
    if (!afterSales) {
      throw new NotFoundException('售后服务申请不存在');
    }
    return afterSales;
  }

  /**
   * 获取用户的售后服务列表
   * @param userId 用户ID
   */
  async findAfterSalesByUserId(userId: string): Promise<AfterSales[]> {
    return await this.afterSalesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 获取所有售后服务列表（管理员）
   */
  async findAllAfterSales(): Promise<AfterSales[]> {
    return await this.afterSalesRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 根据状态获取售后服务列表
   * @param status 售后服务状态
   */
  async findAfterSalesByStatus(status: AfterSalesStatus): Promise<AfterSales[]> {
    return await this.afterSalesRepository.find({
      where: { status },
      order: { createdAt: 'DESC' }
    });
  }
}
