import { Injectable } from '@nestjs/common';

@Injectable()
export class IMService {
  // 模拟IM配置数据
  private imConfig = {
    httpUrl: 'http://localhost:9000/im',
  };

  getIMUrl() {
    return this.imConfig.httpUrl;
  }
}
