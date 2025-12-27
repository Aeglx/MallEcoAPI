export class OrderDetailVO {
  orderId: string;
  orderSn: string;
  userId: string;
  consignee: string;
  mobile: string;
  address: string;
  goodsList: Array<{
    goodsId: string;
    goodsName: string;
    goodsNum: number;
    goodsImage: string;
    goodsPrice: number;
    goodsWeight?: number;
  }>;
}
