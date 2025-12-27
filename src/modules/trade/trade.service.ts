import { Injectable } from '@nestjs/common';

@Injectable()
export class TradeService {
  // 购物车相关服务
  async cartGoodsAll() {
    return {
      success: true,
      result: {
        cartList: [],
        total: 0,
      },
      message: '获取购物车成功',
    };
  }

  async cartCount() {
    return {
      success: true,
      result: 0,
      message: '获取购物车数量成功',
    };
  }

  async cartGoodsPay(params: any) {
    return {
      success: true,
      result: {
        cartList: [],
        totalPrice: 0,
      },
      message: '获取结算购物车成功',
    };
  }

  async addCartGoods(params: any) {
    return {
      success: true,
      result: {},
      message: '添加购物车成功',
    };
  }

  async clearCart() {
    return {
      success: true,
      result: {},
      message: '清空购物车成功',
    };
  }

  async createTrade(data: any) {
    return {
      success: true,
      result: {
        tradeSn: 'TRADE' + Date.now(),
        totalPrice: 0,
      },
      message: '创建交易成功',
    };
  }

  async selectCoupon(params: any) {
    return {
      success: true,
      result: {},
      message: '选择优惠券成功',
    };
  }

  async couponNum(params: any) {
    return {
      success: true,
      result: 0,
      message: '获取优惠券数量成功',
    };
  }

  async selectAddr(params: any) {
    return {
      success: true,
      result: {},
      message: '选择地址成功',
    };
  }

  async setCheckedAll(params: any) {
    return {
      success: true,
      result: {},
      message: '设置全选成功',
    };
  }

  async setCheckedSeller(storeId: string, params: any) {
    return {
      success: true,
      result: {},
      message: '设置商家选中状态成功',
    };
  }

  async setCheckedGoods(skuId: string, params: any) {
    return {
      success: true,
      result: {},
      message: '设置商品选中状态成功',
    };
  }

  async setCartGoodsNum(skuId: string, params: any) {
    return {
      success: true,
      result: {},
      message: '设置商品数量成功',
    };
  }

  async delCartGoods(params: any) {
    return {
      success: true,
      result: {},
      message: '删除购物车商品成功',
    };
  }

  async shippingMethod(params: any) {
    return {
      success: true,
      result: {
        shippingMethods: ['SELF_PICK_UP', 'LOCAL_TOWN_DELIVERY', 'LOGISTICS'],
      },
      message: '获取配送方式成功',
    };
  }

  async receiptSelect(params: any) {
    return {
      success: true,
      result: {},
      message: '选择发票成功',
    };
  }

  async shippingMethodList(params: any) {
    return {
      success: true,
      result: {
        shippingMethods: ['SELF_PICK_UP', 'LOCAL_TOWN_DELIVERY', 'LOGISTICS'],
      },
      message: '获取配送方式列表成功',
    };
  }

  async setStoreAddressId(params: any) {
    return {
      success: true,
      result: {},
      message: '设置自提地址成功',
    };
  }

  async setShipMethod(params: any) {
    return {
      success: true,
      result: {},
      message: '设置配送方式成功',
    };
  }

  // 发票相关服务
  async receiptList() {
    return {
      success: true,
      result: [],
      message: '获取发票列表成功',
    };
  }

  async saveReceipt(params: any) {
    return {
      success: true,
      result: {},
      message: '保存发票成功',
    };
  }

  // 充值相关服务
  async recharge(params: any) {
    return {
      success: true,
      result: {
        rechargeSn: 'RECHARGE' + Date.now(),
      },
      message: '充值成功',
    };
  }
}
