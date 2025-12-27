import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
  // 会员收藏相关服务
  async collectGoods(type: string, id: string) {
    return {
      success: true,
      result: {},
      message: '收藏商品成功',
    };
  }

  async collectStore(type: string, id: string) {
    return {
      success: true,
      result: {},
      message: '收藏店铺成功',
    };
  }

  async cancelCollect(type: string, id: string) {
    return {
      success: true,
      result: {},
      message: '取消收藏成功',
    };
  }

  async cancelStoreCollect(type: string, id: string) {
    return {
      success: true,
      result: {},
      message: '取消店铺收藏成功',
    };
  }

  async isCollection(type: string, goodsId: string) {
    return {
      success: true,
      result: false,
      message: '获取收藏状态成功',
    };
  }

  async isStoreCollection(type: string, goodsId: string) {
    return {
      success: true,
      result: false,
      message: '获取店铺收藏状态成功',
    };
  }

  async collectList(type: string, params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取收藏列表成功',
    };
  }

  async storeCollectList(type: string, params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取店铺收藏列表成功',
    };
  }

  // 会员评价相关服务
  async goodsComment(goodsId: string, params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取商品评价成功',
    };
  }

  async goodsCommentNum(goodsId: string) {
    return {
      success: true,
      result: {
        good: 0,
        moderate: 0,
        bad: 0,
      },
      message: '获取评价数量成功',
    };
  }

  async addEvaluation(params: any) {
    return {
      success: true,
      result: {},
      message: '添加评价成功',
    };
  }

  async evaluationList(params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取评价列表成功',
    };
  }

  async evaluationDetail(id: string) {
    return {
      success: true,
      result: {
        id: parseInt(id),
        content: '评价内容',
        createTime: new Date().toISOString(),
      },
      message: '获取评价详情成功',
    };
  }

  // 会员足迹相关服务
  async tracksList(params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取足迹列表成功',
    };
  }

  async clearTracks() {
    return {
      success: true,
      result: {},
      message: '清空足迹成功',
    };
  }

  async clearTracksById(ids: string) {
    return {
      success: true,
      result: {},
      message: '删除足迹成功',
    };
  }

  // 会员积分相关服务
  async memberPoint(params: any) {
    return {
      success: true,
      result: {
        point: 1000,
        level: 'VIP1',
      },
      message: '获取会员积分成功',
    };
  }

  async memberPointHistory(params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取积分历史成功',
    };
  }

  // 会员消息相关服务
  async memberMsgList(params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取会员消息成功',
    };
  }

  async readMemberMsg(id: string) {
    return {
      success: true,
      result: {},
      message: '标记消息已读成功',
    };
  }

  async delMemberMsg(id: string) {
    return {
      success: true,
      result: {},
      message: '删除消息成功',
    };
  }

  // 提现申请相关服务
  async getWithdrawApply(params: any) {
    return {
      success: true,
      result: {
        records: [],
        total: 0,
      },
      message: '获取提现申请成功',
    };
  }
}
