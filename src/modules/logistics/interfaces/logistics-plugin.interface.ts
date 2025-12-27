import { MallLogistics } from '../entities/logistics.entity';
import { Traces } from '../entities/traces.vo';
import { LabelOrderDTO } from '../dto/label-order.dto';
import { OrderDetailVO } from '../../orders/entities/order-detail.vo';

export interface LogisticsPlugin {
  /**
   * 插件名称
   */
  pluginName(): string;

  /**
   * 实时查询快递
   * @param logistics 物流公司
   * @param expNo 物流单号
   * @param phone 收件人手机号
   * @returns 物流信息
   */
  pollQuery(logistics: MallLogistics, expNo: string, phone?: string): Promise<Traces>;

  /**
   * 实时查询地图轨迹
   * @param logistics 物流公司
   * @param expNo 物流单号
   * @param phone 收件人手机号
   * @param from 出发地信息
   * @param to 目的地信息
   * @returns 物流信息
   */
  pollMapTrack(
    logistics: MallLogistics,
    expNo: string,
    phone?: string,
    from?: string,
    to?: string,
  ): Promise<Traces>;

  /**
   * 电子面单打印
   * @param labelOrderDTO 电子面单DTO
   * @returns 面单信息
   */
  labelOrder(labelOrderDTO: LabelOrderDTO): Promise<Map<string, any>>;

  /**
   * 创建物流订单
   * @param orderDetailVO 订单详情
   * @returns 物流订单号
   */
  createOrder(orderDetailVO: OrderDetailVO): Promise<string>;
}
