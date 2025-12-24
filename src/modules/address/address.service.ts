import { Injectable } from '@nestjs/common';

@Injectable()
export class AddressService {
  
  // 传给后台citycode 获取城市街道等id
  async handleRegion(params: any) {
    // 实现地址处理逻辑
    return { success: true, data: [], message: '获取地址信息成功' };
  }
}