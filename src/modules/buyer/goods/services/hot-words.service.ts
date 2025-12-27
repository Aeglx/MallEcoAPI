import { Injectable } from '@nestjs/common';

@Injectable()
export class HotWordsService {
  getHotWords(count: number = 10) {
    // 返回模拟的热搜词数据
    const allHotWords = [
      '手机',
      '电脑',
      '耳机',
      '平板',
      '手表',
      '键盘',
      '鼠标',
      '显示器',
      '音箱',
      '摄像头',
      '移动电源',
      '数据线',
      '充电器',
      '内存卡',
      'U盘',
    ];

    // 根据count参数返回指定数量的热搜词
    return allHotWords.slice(0, count);
  }
}
