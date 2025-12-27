import { Injectable } from '@nestjs/common';
import { LogisticsPlugin } from '../interfaces/logistics-plugin.interface';
import { MallLogistics } from '../entities/logistics.entity';
import { Traces } from '../entities/traces.vo';
import { LabelOrderDTO } from '../dto/label-order.dto';

@Injectable()
export class Kuaidi100Plugin implements LogisticsPlugin {
  pluginName(): string {
    return 'kuaidi100';
  }

  async pollQuery(logistics: MallLogistics, expNo: string, phone?: string): Promise<Traces> {
    // 模拟物流查询结果
    // 实际实现中应该调用快递100的API
    return {
      shipperName: '快递100',
      logisticCode: expNo,
      state: '3', // 已签收
      traces: [
        {
          acceptTime: '2024-01-15 10:30:00',
          acceptStation: '【北京市朝阳区】 已签收，签收人：本人',
        },
        {
          acceptTime: '2024-01-15 08:15:00',
          acceptStation: '【北京市朝阳区】 快递员正在派件中（联系电话：138****8888）',
        },
        {
          acceptTime: '2024-01-14 18:30:00',
          acceptStation: '【北京市朝阳区】 已到达朝阳区派送点',
        },
        {
          acceptTime: '2024-01-14 10:20:00',
          acceptStation: '【北京市】 已从北京转运中心发出',
        },
        {
          acceptTime: '2024-01-13 16:45:00',
          acceptStation: '【上海市】 已到达上海转运中心',
        },
        {
          acceptTime: '2024-01-13 09:15:00',
          acceptStation: '【上海市】 已揽件（揽件人：张三，联系电话：136****6666）',
        },
      ],
    };
  }

  async pollMapTrack(
    logistics: MallLogistics,
    expNo: string,
    phone?: string,
    from?: string,
    to?: string,
  ): Promise<Traces> {
    // 模拟地图轨迹查询结果
    // 实际实现中应该调用快递100的地图轨迹API
    return {
      shipperName: '快递100',
      logisticCode: expNo,
      state: '2', // 在途中
      traces: [
        {
          acceptTime: '2024-01-14 18:30:00',
          acceptStation: '【北京市朝阳区】 已到达朝阳区派送点',
        },
        {
          acceptTime: '2024-01-14 10:20:00',
          acceptStation: '【北京市】 已从北京转运中心发出',
        },
        {
          acceptTime: '2024-01-13 23:45:00',
          acceptStation: '【天津市】 已到达天津转运中心',
        },
        {
          acceptTime: '2024-01-13 18:20:00',
          acceptStation: '【河北省】 已从河北转运中心发出',
        },
        {
          acceptTime: '2024-01-13 16:45:00',
          acceptStation: '【上海市】 已到达上海转运中心',
        },
        {
          acceptTime: '2024-01-13 09:15:00',
          acceptStation: '【上海市】 已揽件',
        },
      ],
    };
  }

  async labelOrder(labelOrderDTO: LabelOrderDTO): Promise<Map<string, any>> {
    // 模拟电子面单打印
    // 实际实现中应该调用快递100的电子面单API
    const result = new Map<string, any>();
    result.set('success', true);
    result.set('labelUrl', 'https://example.com/label/123456.pdf');
    result.set('waybillNo', 'YT4567890123456');
    result.set('message', '电子面单打印成功');
    return result;
  }

  async createOrder(orderDetailVO: any): Promise<string> {
    // 模拟创建物流订单
    // 实际实现中应该调用快递100的创建订单API
    return 'LOG1234567890';
  }
}
