import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MenuService } from '../modules/client/common/auth/services/menu.service';

/**
 * Java版菜单数据结�?
 * 基于Java版的Menu实体和StoreMenu实体结构
 */
interface JavaMenuData {
  id: string;
  title: string;
  name: string;
  path: string;
  level: number;
  frontRoute: string;
  parentId: string;
  sortOrder: number;
  permission: string;
  icon?: string;
  description?: string;
}


const adminMenus: JavaMenuData[] = [
  // 设置模块
  {
    id: '1348810750596767744',
    title: '设置',
    name: 'settings',
    path: '/settings',
    level: 0,
    frontRoute: '1',
    parentId: '0',
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-american-football'
  },
  {
    id: '1349237129847005184',
    title: '系统设置',
    name: 'sys',
    path: '/sys',
    level: 1,
    frontRoute: 'Main',
    parentId: '1348810750596767744',
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-american-football'
  },
  {
    id: '1349246048900243456',
    title: '系统设置',
    name: 'setting',
    path: '/sys/setting',
    level: 2,
    frontRoute: 'sys/setting-manage/settingManage',
    parentId: '1349237129847005184',
    sortOrder: 1.0,
    permission: '/manager/system/setting/get*,/manager/system/setting/put*'
  },
  {
    id: '1349246347597602816',
    title: 'OSS资源',
    name: 'oss-manage',
    path: '/sys/oss-manage',
    level: 2,
    frontRoute: 'sys/oss-manage/ossManage',
    parentId: '1349237129847005184',
    sortOrder: 3.0,
    permission: '/manager/file*'
  },
  {
    id: '1349246468775239680',
    title: '行政地区',
    name: 'region',
    path: '/sys/region',
    level: 2,
    frontRoute: 'region/index',
    parentId: '1349237129847005184',
    sortOrder: 4.0,
    permission: '/manager/region*'
  },
  {
    id: '1349246671158796288',
    title: '物流公司',
    name: 'logistics',
    path: '/sys/logistics',
    level: 2,
    frontRoute: 'logistics/index',
    parentId: '1349237129847005184',
    sortOrder: 5.0,
    permission: '/manager/logistics*'
  },
  {
    id: '1349246896661356544',
    title: '信任登录',
    name: 'authLogin',
    path: '/sys/authLogin',
    level: 2,
    frontRoute: 'sys/setting-manage/settingManage',
    parentId: '1349237129847005184',
    sortOrder: 6.0,
    permission: '/manager/system/setting/get*,/manager/system/setting/put*'
  },
  {
    id: '1349247081504333824',
    title: '支付设置',
    name: 'pay',
    path: '/sys/pay',
    level: 2,
    frontRoute: 'sys/setting-manage/settingManage',
    parentId: '1349237129847005184',
    sortOrder: 7.0,
    permission: '/manager/system/setting/get*,/manager/system/setting/put*,/manager/system/setting*'
  },
  {
    id: '1349247640584085504',
    title: '敏感�?,
    name: 'sensitiveWords',
    path: '/sys/sensitiveWords',
    level: 2,
    frontRoute: 'sensitiveWords/index',
    parentId: '1349237129847005184',
    sortOrder: 8.0,
    permission: '/manager/sensitiveWords*'
  },
  {
    id: '1357584224760102912',
    title: 'APP版本',
    name: 'appVersion',
    path: '/sys/appVersion',
    level: 2,
    frontRoute: 'sys/app-version/appVersion',
    parentId: '1349237129847005184',
    sortOrder: 9.0,
    permission: '/manager/systems/app*'
  },
  {
    id: '1374916594269945856',
    title: '验证�?,
    name: 'slider',
    path: '/sys/slider',
    level: 2,
    frontRoute: 'sys/slider/slider',
    parentId: '1349237129847005184',
    sortOrder: 7.0,
    permission: '/manager/verificationSource*'
  },
  {
    id: '1384035281702748160',
    title: '微信消息',
    name: 'message-manage',
    path: '/sys/message-manage',
    level: 2,
    frontRoute: 'member/message-manage/weChatMessageManager',
    parentId: '1349237129847005184',
    sortOrder: 5.0,
    permission: '/manager/message/wechat*,/manager/message/wechatMPMessage*'
  },

  // 用户管理模块
  {
    id: '1349237207378714624',
    title: '用户管理',
    name: 'member',
    path: '/member',
    level: 1,
    frontRoute: 'Main',
    parentId: '1348810750596767744',
    sortOrder: 0.0,
    permission: '/manager/user*,/manager/department*,/manager/role*,/manager/menu*',
    icon: 'ios-american-football'
  },
  {
    id: '1349254815809298432',
    title: '用户管理',
    name: 'user-manage',
    path: '/member/user-manage',
    level: 2,
    frontRoute: 'sys/user-manage/userManage',
    parentId: '1349237207378714624',
    sortOrder: 1.0,
    permission: null
  },
  {
    id: '1357873097859923969',
    title: '菜单管理',
    name: 'menuManage',
    path: '/member/menu-manage',
    level: 2,
    frontRoute: 'sys/menu-manage/menuManage',
    parentId: '1349237207378714624',
    sortOrder: 2.0,
    permission: null
  },
  {
    id: '1349255214977015808',
    title: '部门管理',
    name: 'department-manage',
    path: '/member/department-manage',
    level: 2,
    frontRoute: 'sys/department-manage/departmentManage',
    parentId: '1349237207378714624',
    sortOrder: 3.0,
    permission: null
  },
  {
    id: '1349255404425338880',
    title: '角色权限',
    name: 'role-manage',
    path: '/member/role-manage',
    level: 2,
    frontRoute: 'sys/role-manage/roleManage',
    parentId: '1349237207378714624',
    sortOrder: 4.0,
    permission: null
  },

  // 日志模块
  {
    id: '1348810864748945408',
    title: '日志',
    name: 'log',
    path: '/log',
    level: 0,
    frontRoute: 'null',
    parentId: '0',
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-american-football'
  },
  {
    id: '1349237928434098176',
    title: '系统监控',
    name: 'log',
    path: '/log',
    level: 1,
    frontRoute: 'Main',
    parentId: '1348810864748945408',
    sortOrder: 1.0,
    permission: '/manager/log*',
    icon: 'ios-american-football'
  },
  {
    id: '1349256082979840000',
    title: '日志管理',
    name: 'log-manage',
    path: '/log/log-manage',
    level: 2,
    frontRoute: 'sys/log-manage/logManage',
    parentId: '1349237928434098176',
    sortOrder: 2.0,
    permission: null
  },

  // 会员模块
  {
    id: '1367038467288072192',
    title: '会员',
    name: 'member',
    path: '/member',
    level: 0,
    frontRoute: 'null',
    parentId: '0',
    sortOrder: 0.0,
    permission: '*',
    icon: 'ios-person-add'
  },
  {
    id: '1367041332861730816',
    title: '会员管理',
    name: 'memberManage',
    path: '/member',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367038467288072192',
    sortOrder: 0.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1367041461194850304',
    title: '会员列表',
    name: 'memberList',
    path: '/member/memberList',
    level: 2,
    frontRoute: 'member/list/index',
    parentId: '1367041332861730816',
    sortOrder: 0.0,
    permission: '/manager/member*,/manager/orders*,/manager/wallet/log*,/manager/receipt*'
  },
  {
    id: '1367041575619657728',
    title: '回收�?,
    name: 'memberRecycle',
    path: '/member/memberRecycle',
    level: 2,
    frontRoute: 'member/list/memberRecycle',
    parentId: '1367041332861730816',
    sortOrder: 1.0,
    permission: '/manager/member*'
  },

  // 预存款模�?
  {
    id: '1367042490443497472',
    title: '预存�?,
    name: 'advance',
    path: '/advance',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367038467288072192',
    sortOrder: 1.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1367042664410644480',
    title: '会员资金',
    name: 'walletLog',
    path: '/advance/walletLog',
    level: 2,
    frontRoute: 'member/advance/walletLog',
    parentId: '1367042490443497472',
    sortOrder: 0.0,
    permission: '/manager/wallet/log*'
  },
  {
    id: '1367042804944994304',
    title: '充值记�?,
    name: 'recharge',
    path: '/advance/recharge',
    level: 2,
    frontRoute: 'member/advance/recharge',
    parentId: '1367042490443497472',
    sortOrder: 1.0,
    permission: '/manager/recharge*'
  },
  {
    id: '1367042804944994305',
    title: '提现申请',
    name: 'withdrawApply',
    path: '/advance/withdrawApply',
    level: 2,
    frontRoute: 'member/advance/withdrawApply',
    parentId: '1367042490443497472',
    sortOrder: 1.0,
    permission: '/manager/members/withdraw-apply*'
  },

  // 评价模块
  {
    id: '1367042917113266176',
    title: '评价',
    name: 'commont',
    path: '/commont',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367038467288072192',
    sortOrder: 0.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1367043020976816128',
    title: '会员评价',
    name: 'goodsReview',
    path: '/commont/goodsReview',
    level: 2,
    frontRoute: 'goods/goods-review/index',
    parentId: '1367042917113266176',
    sortOrder: 0.0,
    permission: '/manager/memberEvaluation*'
  },

  // 积分模块
  {
    id: '1373166892465782784',
    title: '积分',
    name: 'point',
    path: '/point',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367038467288072192',
    sortOrder: 0.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1373167227385151488',
    title: '积分历史',
    name: 'point',
    path: '/point/point',
    level: 2,
    frontRoute: 'member/point/point',
    parentId: '1373166892465782784',
    sortOrder: 0.0,
    permission: '/manager/member/memberPointsHistory*'
  },

  // 订单模块
  {
    id: '1367039534616805376',
    title: '订单',
    name: 'order',
    path: '/order',
    level: 0,
    frontRoute: 'null',
    parentId: '0',
    sortOrder: 0.0,
    permission: '*',
    icon: 'md-reorder'
  },
  {
    id: '1367043443917848576',
    title: '订单',
    name: 'order',
    path: '/order',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367039534616805376',
    sortOrder: 0.0,
    permission: '/manager/orders*',
    icon: 'md-aperture'
  },
  {
    id: '1367043642379730944',
    title: '商品订单',
    name: 'orderList',
    path: '/order/orderList',
    level: 2,
    frontRoute: 'order/order/orderList',
    parentId: '1367043443917848576',
    sortOrder: 0.0,
    permission: null
  },
  {
    id: '1367043791105556480',
    title: '虚拟订单',
    name: 'fictitiousOrderList',
    path: '/order/fictitiousOrderList',
    level: 2,
    frontRoute: 'order/order/fictitiousOrderList',
    parentId: '1367043443917848576',
    sortOrder: 1.0,
    permission: null
  },

  // 售后模块
  {
    id: '1367043505771249664',
    title: '售后',
    name: 'aftersale',
    path: '/aftersale',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367039534616805376',
    sortOrder: 0.0,
    permission: null,
    icon: 'md-aperture'
  },
  {
    id: '1367043980407078912',
    title: '售后管理',
    name: 'afterSaleOrder',
    path: '/aftersale/afterSaleOrder',
    level: 2,
    frontRoute: 'order/after-order/afterSaleOrder',
    parentId: '1367043505771249664',
    sortOrder: 0.0,
    permission: '/manager/afterSale*'
  },
  {
    id: '1367044121163726848',
    title: '交易投诉',
    name: 'orderComplaint',
    path: '/aftersale/orderComplaint',
    level: 2,
    frontRoute: 'order/after-order/orderComplaint',
    parentId: '1367043505771249664',
    sortOrder: 2.0,
    permission: '/manager/complain*'
  },
  {
    id: '1367044247978508288',
    title: '售后原因',
    name: 'afterSaleReason',
    path: '/aftersale/afterSaleReason',
    level: 2,
    frontRoute: 'order/after-order/afterSale',
    parentId: '1367043505771249664',
    sortOrder: 3.0,
    permission: '/manager/afterSaleReason*'
  },

  // 流水模块
  {
    id: '1372807928452481024',
    title: '流水',
    name: 'flow',
    path: '/flow',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367039534616805376',
    sortOrder: 3.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1372808148565360640',
    title: '收款记录',
    name: 'paymentLog',
    path: '/flow/paymentLog',
    level: 2,
    frontRoute: 'order/flow/paymentLog',
    parentId: '1372807928452481024',
    sortOrder: 1.0,
    permission: '/manager/paymentLog*'
  },
  {
    id: '1372808352295288832',
    title: '退款流�?,
    name: 'refundLog',
    path: '/flow/refundLog',
    level: 2,
    frontRoute: 'order/flow/refundLog',
    parentId: '1372807928452481024',
    sortOrder: 2.0,
    permission: '/manager/refundLog*'
  },

  // 商品模块
  {
    id: '1367039950368800768',
    title: '商品',
    name: 'goods',
    path: '/goods',
    level: 0,
    frontRoute: null,
    parentId: '0',
    sortOrder: 0.2,
    permission: '*',
    icon: 'ios-share'
  },
  {
    id: '1367044376391319552',
    title: '商品管理',
    name: 'goodsManager',
    path: '/goods/goodsManager',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367039950368800768',
    sortOrder: 0.0,
    permission: '/manager/goods*',
    icon: 'md-aperture'
  },
  {
    id: '1367045529720061952',
    title: '平台商品',
    name: 'managerGoods',
    path: '/goods/managerGoods',
    level: 2,
    frontRoute: 'goods/goods-info/goods',
    parentId: '1367044376391319552',
    sortOrder: 0.0,
    permission: 'null'
  },
  {
    id: '1367045630710513664',
    title: '商品审核',
    name: 'applyGoods',
    path: '/goods/applyGoods',
    level: 2,
    frontRoute: 'goods/goods-info/goodsApply',
    parentId: '1367044376391319552',
    sortOrder: 1.0,
    permission: 'null'
  },

  // 关联管理模块
  {
    id: '1367044657296441344',
    title: '关联管理',
    name: 'association',
    path: '/association',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367039950368800768',
    sortOrder: 1.0,
    permission: null,
    icon: 'ios-aperture'
  },
  {
    id: '1367045794284175360',
    title: '商品分类',
    name: 'goodsCategory',
    path: '/association/goodsCategory',
    level: 2,
    frontRoute: 'goods/goods-manage/category',
    parentId: '1367044657296441344',
    sortOrder: 0.0,
    permission: '/manager/goods/category*,/manager/goods/brand*,/manager/goods/spec*,/manager/goods/parameters*'
  },
  {
    id: '1367045921434501120',
    title: '品牌列表',
    name: 'goodsBrand',
    path: '/association/goodsBrand',
    level: 2,
    frontRoute: 'goods/goods-manage/brand',
    parentId: '1367044657296441344',
    sortOrder: 1.0,
    permission: '/manager/goods/brand*'
  },
  {
    id: '1367046068369358848',
    title: '规格列表',
    name: 'goodsSpec',
    path: '/association/goodsSpec',
    level: 2,
    frontRoute: 'goods/goods-manage/spec',
    parentId: '1367044657296441344',
    sortOrder: 2.0,
    permission: '/manager/goods/spec*'
  },
  {
    id: '1367046266214678528',
    title: '计量单位',
    name: 'goodsUnit',
    path: '/association/goodsUnit',
    level: 2,
    frontRoute: 'goods-unit/index',
    parentId: '1367044657296441344',
    sortOrder: 4.0,
    permission: '/manager/goods/goodsUnit*'
  },

  // 促销模块
  {
    id: '1367040067201138688',
    title: '促销',
    name: 'promotion',
    path: '/promotion',
    level: 0,
    frontRoute: null,
    parentId: '0',
    sortOrder: 0.3,
    permission: '*',
    icon: 'ios-hammer'
  },
  {
    id: '1367049214198022144',
    title: '促销管理',
    name: 'promotionManager',
    path: '/promotion/promotionManager',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040067201138688',
    sortOrder: 0.0,
    permission: null,
    icon: 'md-aperture'
  },
  {
    id: '1367049384792948736',
    title: '优惠�?,
    name: 'coupon',
    path: '/promotion/coupon',
    level: 2,
    frontRoute: 'promotion/coupon/coupon',
    parentId: '1367049214198022144',
    sortOrder: 0.0,
    permission: '/manager/promotion/coupon*'
  },
  {
    id: '1367049500782231552',
    title: '满额活动',
    name: 'fullCut',
    path: '/promotion/fullCut',
    level: 2,
    frontRoute: 'promotion/fullCut/full-cut',
    parentId: '1367049214198022144',
    sortOrder: 1.0,
    permission: '/manager/promotion/fullDiscount*'
  },
  {
    id: '1367049611578966016',
    title: '秒杀活动',
    name: 'seckill',
    path: '/promotion/seckill',
    level: 2,
    frontRoute: 'promotion/seckill/seckill',
    parentId: '1367049214198022144',
    sortOrder: 2.0,
    permission: '/manager/promotion/seckill*'
  },
  {
    id: '1367049712657498112',
    title: '拼团活动',
    name: 'pintuan',
    path: '/promotion/pintuan',
    level: 2,
    frontRoute: 'promotion/pintuan/pintuan',
    parentId: '1367049214198022144',
    sortOrder: 3.0,
    permission: '/manager/promotion/pintuan*'
  },
  {
    id: '1403988156444962818',
    title: '券活�?,
    name: 'coupon-activity',
    path: '/promotion/coupon-activity',
    level: 2,
    frontRoute: 'promotion/couponActivity/coupon',
    parentId: '1367049214198022144',
    sortOrder: 0.0,
    permission: '/manager/promotion/couponActivity*'
  },

  // 直播管理模块
  {
    id: '1407601962899230721',
    title: '直播管理',
    name: 'liveManage',
    path: '/liveManage',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040067201138688',
    sortOrder: 2.0,
    permission: '/manager/broadcast*',
    icon: null
  },
  {
    id: '1407602049759072258',
    title: '直播管理',
    name: 'live',
    path: '/liveManage/live',
    level: 2,
    frontRoute: 'promotion/live/live',
    parentId: '1407601962899230721',
    sortOrder: 1.0,
    permission: null
  },

  // 积分活动模块
  {
    id: '1407602441964244994',
    title: '积分活动',
    name: 'pointManage',
    path: '/pointManage',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040067201138688',
    sortOrder: 3.0,
    permission: null,
    icon: null
  },
  {
    id: '1407602516912263170',
    title: '积分商品',
    name: 'pointsGoods',
    path: '/pointManage/pointsGoods',
    level: 2,
    frontRoute: 'promotion/pointsGoods/pointsGoods',
    parentId: '1407602441964244994',
    sortOrder: 1.0,
    permission: '/manager/promotion/pointsGoods*,/manager/goods*'
  },
  {
    id: '1407602673334636546',
    title: '积分分类',
    name: 'pointsGoodsCategory',
    path: '/pointManage/pointsGoodsCategory',
    level: 2,
    frontRoute: 'promotion/pointsGoodsCategory/pointsGoodsCategory',
    parentId: '1407602441964244994',
    sortOrder: 2.0,
    permission: '/manager/promotion/pointsGoodsCategory*'
  },

  // 运营模块
  {
    id: '1367040599596728320',
    title: '运营',
    name: 'operate',
    path: '/operate',
    level: 0,
    frontRoute: 'null',
    parentId: '0',
    sortOrder: 0.5,
    permission: '*',
    icon: 'ios-color-palette'
  },
  {
    id: '1367050250249830400',
    title: '文章管理',
    name: 'document',
    path: '/document',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 2.0,
    permission: null,
    icon: 'md-aperture'
  },
  {
    id: '1367050829697122304',
    title: '搜索热词',
    name: 'hotKeyWord',
    path: '/document/hotKeyWord',
    level: 2,
    frontRoute: 'page/article-manage/hotWords',
    parentId: '1367050250249830400',
    sortOrder: 0.0,
    permission: '/manager/hotwords*'
  },
  {
    id: '1367050939084570624',
    title: '文章分类',
    name: 'article-category',
    path: '/document/article-category',
    level: 2,
    frontRoute: 'page/article-manage/ArticleCategory',
    parentId: '1367050250249830400',
    sortOrder: 1.0,
    permission: '/manager/article-category*'
  },
  {
    id: '1367051048232943616',
    title: '文章管理',
    name: 'articleList',
    path: '/document/articleList',
    level: 2,
    frontRoute: 'page/article-manage/articleList',
    parentId: '1367050250249830400',
    sortOrder: 3.0,
    permission: '/manager/article-category*,/manager/article*'
  },
  {
    id: '1419926569920536578',
    title: 'ES分词',
    name: 'customWords',
    path: '/document/customWords',
    level: 2,
    frontRoute: 'customWords/index',
    parentId: '1367050250249830400',
    sortOrder: 4.0,
    permission: '/manager/manager/custom-words*'
  },

  // 楼层装修模块
  {
    id: '1367050320584114176',
    title: '楼层装修',
    name: 'floor',
    path: '/floor',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 0.0,
    permission: '/manager/pageData*,/manager/file*,/manager/article-category*,/manager/article*,/manager/promotion*,/manager/goods*,/manager/store*',
    icon: 'md-aperture'
  },
  {
    id: '1367050530030878720',
    title: 'PC�?,
    name: 'pcFloor',
    path: '/floor/pcFloor',
    level: 2,
    frontRoute: 'lili-floor-renovation/floorList',
    parentId: '1367050320584114176',
    sortOrder: 0.0,
    permission: null
  },
  {
    id: '1367050673312497664',
    title: '移动�?,
    name: 'wapList',
    path: '/floor/wapList',
    level: 2,
    frontRoute: 'lili-floor-renovation/wap/wapList',
    parentId: '1367050320584114176',
    sortOrder: 1.0,
    permission: null
  },

  // 意见反馈模块
  {
    id: '1374154349697040384',
    title: '意见反馈',
    name: 'feedback',
    path: '/feedback',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 3.0,
    permission: '/manager/feedback*',
    icon: 'md-aperture'
  },
  {
    id: '1374155741123837952',
    title: '意见反馈',
    name: 'feedback',
    path: '/feedback/feedback',
    level: 2,
    frontRoute: 'page/feedback/feedback',
    parentId: '1374154349697040384',
    sortOrder: 0.0,
    permission: 'null'
  },

  // 分销管理模块
  {
    id: '1374173575405109248',
    title: '分销管理',
    name: 'distributionManager',
    path: '/distributionManager',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 1.0,
    permission: null,
    icon: 'ios-analytics'
  },
  {
    id: '1374177618072436736',
    title: '分销设置',
    name: 'distributionSetting',
    path: '/distributionManager/distributionSetting',
    level: 2,
    frontRoute: 'distribution/distributionSetting',
    parentId: '1374173575405109248',
    sortOrder: 0.0,
    permission: '/manager/system/setting/put/DISTRIBUTION_SETTING*,/manager/system/setting/get/DISTRIBUTION_SETTING*'
  },
  {
    id: '1374178079181635584',
    title: '分销申请',
    name: 'distributionApply',
    path: '/distributionManager/distributionApply',
    level: 2,
    frontRoute: 'distribution/distributionApply',
    parentId: '1374173575405109248',
    sortOrder: 1.0,
    permission: '/manager/distribution*'
  },
  {
    id: '1374178303975358464',
    title: '分销�?,
    name: 'distribution',
    path: '/distributionManager/distribution',
    level: 2,
    frontRoute: 'distribution/distribution',
    parentId: '1374173575405109248',
    sortOrder: 2.0,
    permission: '/manager/distribution*'
  },
  {
    id: '1374177789581721600',
    title: '分销商品',
    name: 'distributionGoods',
    path: '/distributionManager/distributionGoods',
    level: 2,
    frontRoute: 'distribution/distributionGoods',
    parentId: '1374173575405109248',
    sortOrder: 3.0,
    permission: '/manager/distribution/goods*'
  },
  {
    id: '1374177910411231232',
    title: '分销订单',
    name: 'distributionOrder',
    path: '/distributionManager/distributionOrder',
    level: 2,
    frontRoute: 'distribution/distributionOrder',
    parentId: '1374173575405109248',
    sortOrder: 4.0,
    permission: '/manager/distribution/order*,/manager/store*'
  },
  {
    id: '1410862675914764290',
    title: '分销提现',
    name: 'distributionCash',
    path: '/distributionManager/distributionCash',
    level: 2,
    frontRoute: 'distribution/distributionCash',
    parentId: '1374173575405109248',
    sortOrder: 5.0,
    permission: '/manager/distribution/cash*'
  },

  // 站内信模�?
  {
    id: '1376450531517530112',
    title: '站内�?,
    name: 'notice',
    path: '/notice',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 5.0,
    permission: null,
    icon: 'md-basketball'
  },
  {
    id: '1376450662098796544',
    title: '站内�?,
    name: 'noticeMessageTemplate',
    path: '/notice/noticeMessageTemplate',
    level: 2,
    frontRoute: 'sys/message/noticeMessageTemplate',
    parentId: '1376450531517530112',
    sortOrder: 1.0,
    permission: '/manager/noticeMessage*,/manager/message*,/manager/store*,/manager/member*'
  },

  // 短信管理模块
  {
    id: '1376450766817984512',
    title: '短信管理',
    name: 'sms',
    path: '/sms',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040599596728320',
    sortOrder: 6.0,
    permission: null,
    icon: 'md-checkmark'
  },
  {
    id: '1376450876423536640',
    title: '短信',
    name: 'sms',
    path: '/sms/sms',
    level: 2,
    frontRoute: 'sys/message/sms',
    parentId: '1376450766817984512',
    sortOrder: 1.0,
    permission: '/manager/sms*,/manager/member*'
  },

  // 店铺模块
  {
    id: '1367048084701315072',
    title: '店铺',
    name: 'shop',
    path: '/shop',
    level: 0,
    frontRoute: 'null',
    parentId: '0',
    sortOrder: 0.4,
    permission: '*',
    icon: 'ios-pricetags'
  },
  {
    id: '1367048684339986432',
    title: '店铺管理',
    name: 'shopManager',
    path: '/shop/shopManager',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367048084701315072',
    sortOrder: 0.0,
    permission: null,
    icon: 'md-aperture'
  },
  {
    id: '1367048832210173952',
    title: '店铺列表',
    name: 'shopList',
    path: '/shop/shopList',
    level: 2,
    frontRoute: 'seller/shop/shopList',
    parentId: '1367048684339986432',
    sortOrder: 0.0,
    permission: '/manager/store*'
  },
  {
    id: '1367048967635861504',
    title: '店铺审核',
    name: 'shopAuth',
    path: '/shop/shopAuth',
    level: 2,
    frontRoute: 'seller/shop/shopAuditList',
    parentId: '1367048684339986432',
    sortOrder: 1.0,
    permission: '/manager/store*'
  },

  // 店铺结算模块
  {
    id: '1367048754229673984',
    title: '店铺结算',
    name: 'bill',
    path: '/bill',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367048084701315072',
    sortOrder: 0.0,
    permission: null,
    icon: 'md-aperture'
  },
  {
    id: '1367049068122996736',
    title: '店铺结算',
    name: 'billList',
    path: '/bill/billList',
    level: 2,
    frontRoute: 'seller/bill/bill',
    parentId: '1367048754229673984',
    sortOrder: 0.0,
    permission: '/manager/store/bill*'
  },
  {
    id: '1373791578371391488',
    title: '商家对账',
    name: 'accountStatementBill',
    path: '/bill/accountStatementBill',
    level: 2,
    frontRoute: 'seller/bill/accountStatementBill',
    parentId: '1367048754229673984',
    sortOrder: 0.0,
    permission: '/manager/store/bill*'
  },

  // 统计模块
  {
    id: '1367040819248234496',
    title: '统计',
    name: 'statistics',
    path: '/statistics',
    level: 0,
    frontRoute: null,
    parentId: '0',
    sortOrder: 0.7,
    permission: '*',
    icon: 'ios-stats'
  },
  {
    id: '1367052616634204160',
    title: '统计',
    name: 'statistics',
    path: '/statistics',
    level: 1,
    frontRoute: 'Main',
    parentId: '1367040819248234496',
    sortOrder: 0.0,
    permission: '/manager/store*,/manager/member*',
    icon: 'md-aperture'
  },
  {
    id: '1367052705725415424',
    title: '会员统计',
    name: 'memberStatistics',
    path: '/statistics/memberStatistics',
    level: 2,
    frontRoute: 'statistics/member',
    parentId: '1367052616634204160',
    sortOrder: 0.0,
    permission: null
  },
  {
    id: '1367052805503713280',
    title: '订单统计',
    name: 'orderStatistics',
    path: '/statistics/orderStatistics',
    level: 2,
    frontRoute: 'statistics/order',
    parentId: '1367052616634204160',
    sortOrder: 1.0,
    permission: null
  },
  {
    id: '1367052915314786304',
    title: '商品统计',
    name: 'goodsStatistics',
    path: '/statistics/goodsStatistics',
    level: 2,
    frontRoute: 'statistics/goods',
    parentId: '1367052616634204160',
    sortOrder: 2.0,
    permission: null
  },
  {
    id: '1367053087121866752',
    title: '流量统计',
    name: 'trafficStatistics',
    path: '/statistics/trafficStatistics',
    level: 2,
    frontRoute: 'statistics/traffic',
    parentId: '1367052616634204160',
    sortOrder: 4.0,
    permission: null
  }
];

/**
 * 卖家端菜单数据（基于Java版li_store_menu表完整结构）
 */
const sellerMenus: JavaMenuData[] = [
  // 商品管理模块
  {
    id: '1348810864748945431',
    title: '商品管理',
    name: 'goods-seller',
    path: '/goods-seller',
    level: 1,
    frontRoute: 'goods-seller/index',
    parentId: '0',
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-cube'
  },
  {
    id: '1348810864748945432',
    title: '商品列表',
    name: 'goods-list-seller',
    path: '/goods-seller/list',
    level: 2,
    frontRoute: 'goods/goods-seller/goods-list',
    parentId: '1348810864748945431',
    sortOrder: 1.1,
    permission: 'goods:list:*'
  },
  {
    id: '1348810864748945433',
    title: '发布商品',
    name: 'add-goods-seller',
    path: '/goods-seller/add',
    level: 2,
    frontRoute: 'goods/goods-seller/add-goods',
    parentId: '1348810864748945431',
    sortOrder: 1.2,
    permission: 'goods:add:*'
  },
  {
    id: '1349237928434098177',
    title: '库存预警',
    name: 'alert-goods-quantity',
    path: 'alert-goods-quantity',
    level: 2,
    frontRoute: 'goods/goods-seller/alertQuantity',
    parentId: '1348810864748945431',
    sortOrder: 1.14,
    permission: null,
    icon: 'ios-american-football'
  },

  // 订单管理模块
  {
    id: '1348810864748945434',
    title: '订单管理',
    name: 'order-seller',
    path: '/order-seller',
    level: 1,
    frontRoute: 'order-seller/index',
    parentId: '0',
    sortOrder: 2.0,
    permission: '*',
    icon: 'ios-list-box'
  },
  {
    id: '1348810864748945435',
    title: '订单列表',
    name: 'order-list-seller',
    path: '/order-seller/list',
    level: 2,
    frontRoute: 'order/order-seller/order-list',
    parentId: '1348810864748945434',
    sortOrder: 2.1,
    permission: 'order:list:*'
  },
  {
    id: '1348810864748945436',
    title: '售后管理',
    name: 'after-sale-seller',
    path: '/order-seller/after-sale',
    level: 2,
    frontRoute: 'order/order-seller/after-sale',
    parentId: '1348810864748945434',
    sortOrder: 2.2,
    permission: 'order:after-sale:*'
  },

  // 店铺管理模块
  {
    id: '1348810864748945437',
    title: '店铺管理',
    name: 'store-seller',
    path: '/store-seller',
    level: 1,
    frontRoute: 'store-seller/index',
    parentId: '0',
    sortOrder: 3.0,
    permission: '*',
    icon: 'ios-business'
  },
  {
    id: '1348810864748945438',
    title: '店铺设置',
    name: 'store-setting',
    path: '/store-seller/setting',
    level: 2,
    frontRoute: 'store/store-seller/store-setting',
    parentId: '1348810864748945437',
    sortOrder: 3.1,
    permission: 'store:setting:*'
  },
  {
    id: '1348810864748945439',
    title: '运费模板',
    name: 'freight-template',
    path: '/store-seller/freight',
    level: 2,
    frontRoute: 'store/store-seller/freight-template',
    parentId: '1348810864748945437',
    sortOrder: 3.2,
    permission: 'store:freight:*'
  },

  // 财务管理模块
  {
    id: '1348810864748945440',
    title: '财务管理',
    name: 'finance-seller',
    path: '/finance-seller',
    level: 1,
    frontRoute: 'finance-seller/index',
    parentId: '0',
    sortOrder: 4.0,
    permission: '*',
    icon: 'ios-calculator'
  },
  {
    id: '1348810864748945441',
    title: '账单管理',
    name: 'bill-management-seller',
    path: '/finance-seller/bill',
    level: 2,
    frontRoute: 'finance/finance-seller/bill-management',
    parentId: '1348810864748945440',
    sortOrder: 4.1,
    permission: 'finance:bill:*'
  },
  {
    id: '1348810864748945442',
    title: '提现管理',
    name: 'withdraw-management-seller',
    path: '/finance-seller/withdraw',
    level: 2,
    frontRoute: 'finance/finance-seller/withdraw-management',
    parentId: '1348810864748945440',
    sortOrder: 4.2,
    permission: 'finance:withdraw:*'
  }
];

/**
 * 新增的扩展功能模块（比Java版本更完整的菜单�?
 */
const extendedMenus: JavaMenuData[] = [
  // 数据中心模块
  {
    id: '1500000000000000001',
    title: '数据中心',
    name: 'data-center',
    path: '/data-center',
    level: 0,
    frontRoute: 'data-center/index',
    parentId: '0',
    sortOrder: 0.8,
    permission: '*',
    icon: 'ios-analytics'
  },
  {
    id: '1500000000000000002',
    title: '数据看板',
    name: 'dashboard',
    path: '/data-center/dashboard',
    level: 1,
    frontRoute: 'data-center/dashboard/index',
    parentId: '1500000000000000001',
    sortOrder: 1.0,
    permission: 'data-center:dashboard:*'
  },
  {
    id: '1500000000000000003',
    title: '用户行为分析',
    name: 'user-behavior',
    path: '/data-center/user-behavior',
    level: 1,
    frontRoute: 'data-center/user-behavior/index',
    parentId: '1500000000000000001',
    sortOrder: 1.1,
    permission: 'data-center:user-behavior:*'
  },
  {
    id: '1500000000000000004',
    title: '商品热力�?,
    name: 'product-heatmap',
    path: '/data-center/product-heatmap',
    level: 1,
    frontRoute: 'data-center/product-heatmap/index',
    parentId: '1500000000000000001',
    sortOrder: 1.2,
    permission: 'data-center:product-heatmap:*'
  },

  // 智能运营模块
  {
    id: '1500000000000000005',
    title: '智能运营',
    name: 'intelligent-operations',
    path: '/intelligent-operations',
    level: 0,
    frontRoute: 'intelligent-operations/index',
    parentId: '0',
    sortOrder: 0.9,
    permission: '*',
    icon: 'ios-bulb'
  },
  {
    id: '1500000000000000006',
    title: '智能推荐',
    name: 'smart-recommendation',
    path: '/intelligent-operations/smart-recommendation',
    level: 1,
    frontRoute: 'intelligent-operations/smart-recommendation/index',
    parentId: '1500000000000000005',
    sortOrder: 1.0,
    permission: 'intelligent-operations:smart-recommendation:*'
  },
  {
    id: '1500000000000000007',
    title: '营销自动�?,
    name: 'marketing-automation',
    path: '/intelligent-operations/marketing-automation',
    level: 1,
    frontRoute: 'intelligent-operations/marketing-automation/index',
    parentId: '1500000000000000005',
    sortOrder: 1.1,
    permission: 'intelligent-operations:marketing-automation:*'
  },
  {
    id: '1500000000000000008',
    title: '客户画像',
    name: 'customer-profile',
    path: '/intelligent-operations/customer-profile',
    level: 1,
    frontRoute: 'intelligent-operations/customer-profile/index',
    parentId: '1500000000000000005',
    sortOrder: 1.2,
    permission: 'intelligent-operations:customer-profile:*'
  },

  // 供应链管理模�?
  {
    id: '1500000000000000009',
    title: '供应链管�?,
    name: 'supply-chain',
    path: '/supply-chain',
    level: 0,
    frontRoute: 'supply-chain/index',
    parentId: '0',
    sortOrder: 1.0,
    permission: '*',
    icon: 'ios-cart'
  },
  {
    id: '1500000000000000010',
    title: '供应商管�?,
    name: 'supplier-management',
    path: '/supply-chain/supplier-management',
    level: 1,
    frontRoute: 'supply-chain/supplier-management/index',
    parentId: '1500000000000000009',
    sortOrder: 1.0,
    permission: 'supply-chain:supplier-management:*'
  },
  {
    id: '1500000000000000011',
    title: '采购管理',
    name: 'purchase-management',
    path: '/supply-chain/purchase-management',
    level: 1,
    frontRoute: 'supply-chain/purchase-management/index',
    parentId: '1500000000000000009',
    sortOrder: 1.1,
    permission: 'supply-chain:purchase-management:*'
  },
  {
    id: '1500000000000000012',
    title: '仓储管理',
    name: 'warehouse-management',
    path: '/supply-chain/warehouse-management',
    level: 1,
    frontRoute: 'supply-chain/warehouse-management/index',
    parentId: '1500000000000000009',
    sortOrder: 1.2,
    permission: 'supply-chain:warehouse-management:*'
  },

  // 客户服务模块
  {
    id: '1500000000000000013',
    title: '客户服务',
    name: 'customer-service',
    path: '/customer-service',
    level: 0,
    frontRoute: 'customer-service/index',
    parentId: '0',
    sortOrder: 1.1,
    permission: '*',
    icon: 'ios-headset'
  },
  {
    id: '1500000000000000014',
    title: '在线客服',
    name: 'online-service',
    path: '/customer-service/online-service',
    level: 1,
    frontRoute: 'customer-service/online-service/index',
    parentId: '1500000000000000013',
    sortOrder: 1.0,
    permission: 'customer-service:online-service:*'
  },
  {
    id: '1500000000000000015',
    title: '工单管理',
    name: 'ticket-management',
    path: '/customer-service/ticket-management',
    level: 1,
    frontRoute: 'customer-service/ticket-management/index',
    parentId: '1500000000000000013',
    sortOrder: 1.1,
    permission: 'customer-service:ticket-management:*'
  },
  {
    id: '1500000000000000016',
    title: '满意度调�?,
    name: 'satisfaction-survey',
    path: '/customer-service/satisfaction-survey',
    level: 1,
    frontRoute: 'customer-service/satisfaction-survey/index',
    parentId: '1500000000000000013',
    sortOrder: 1.2,
    permission: 'customer-service:satisfaction-survey:*'
  },

  // 多店铺管理模�?
  {
    id: '1500000000000000017',
    title: '多店铺管�?,
    name: 'multi-store',
    path: '/multi-store',
    level: 0,
    frontRoute: 'multi-store/index',
    parentId: '0',
    sortOrder: 1.2,
    permission: '*',
    icon: 'ios-business'
  },
  {
    id: '1500000000000000018',
    title: '店铺分组',
    name: 'store-group',
    path: '/multi-store/store-group',
    level: 1,
    frontRoute: 'multi-store/store-group/index',
    parentId: '1500000000000000017',
    sortOrder: 1.0,
    permission: 'multi-store:store-group:*'
  },
  {
    id: '1500000000000000019',
    title: '跨店结算',
    name: 'cross-store-settlement',
    path: '/multi-store/cross-store-settlement',
    level: 1,
    frontRoute: 'multi-store/cross-store-settlement/index',
    parentId: '1500000000000000017',
    sortOrder: 1.1,
    permission: 'multi-store:cross-store-settlement:*'
  },
  {
    id: '1500000000000000020',
    title: '店铺权限分配',
    name: 'store-permission',
    path: '/multi-store/store-permission',
    level: 1,
    frontRoute: 'multi-store/store-permission/index',
    parentId: '1500000000000000017',
    sortOrder: 1.2,
    permission: 'multi-store:store-permission:*'
  },

  // 营销工具模块
  {
    id: '1500000000000000021',
    title: '营销工具',
    name: 'marketing-tools',
    path: '/marketing-tools',
    level: 0,
    frontRoute: 'marketing-tools/index',
    parentId: '0',
    sortOrder: 1.3,
    permission: '*',
    icon: 'ios-megaphone'
  },
  {
    id: '1500000000000000022',
    title: '营销素材�?,
    name: 'marketing-materials',
    path: '/marketing-tools/marketing-materials',
    level: 1,
    frontRoute: 'marketing-tools/marketing-materials/index',
    parentId: '1500000000000000021',
    sortOrder: 1.0,
    permission: 'marketing-tools:marketing-materials:*'
  },
  {
    id: '1500000000000000023',
    title: '活动模板',
    name: 'activity-templates',
    path: '/marketing-tools/activity-templates',
    level: 1,
    frontRoute: 'marketing-tools/activity-templates/index',
    parentId: '1500000000000000021',
    sortOrder: 1.1,
    permission: 'marketing-tools:activity-templates:*'
  },
  {
    id: '1500000000000000024',
    title: '营销漏斗',
    name: 'marketing-funnel',
    path: '/marketing-tools/marketing-funnel',
    level: 1,
    frontRoute: 'marketing-tools/marketing-funnel/index',
    parentId: '1500000000000000021',
    sortOrder: 1.2,
    permission: 'marketing-tools:marketing-funnel:*'
  }
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menuService = app.get(MenuService);

  console.log('开始迁移Java版菜单数据到API�?..');

  // 合并所有菜单数据（Java�?+ 扩展功能�?
  const allMenus = [...adminMenus, ...sellerMenus, ...extendedMenus];

  for (const javaMenu of allMenus) {
    try {
      // 转换为API版的菜单格式（与Java版结构保持一致）
      const apiMenuData = {
        title: javaMenu.title,
        name: javaMenu.name,
        path: javaMenu.path,
        level: javaMenu.level,
        frontRoute: javaMenu.frontRoute,
        parentId: javaMenu.parentId === '0' ? null : javaMenu.parentId,
        sortOrder: javaMenu.sortOrder,
        permission: javaMenu.permission,
        icon: javaMenu.icon,
        description: javaMenu.description,
        type: javaMenu.level === 1 ? 0 : 1, // 0-目录 1-菜单
        status: 1, // 启用状�?
        hidden: false
      };

      // 检查菜单是否已存在
      const existingMenu = await menuService.getMenus();
      const existing = existingMenu.items.find(item => item.title === javaMenu.title);

      if (!existing) {
        console.log(`创建菜单: ${javaMenu.title}`);
        await menuService.createMenu(apiMenuData as any);
      } else {
        console.log(`菜单已存�? ${javaMenu.title}`);
      }
    } catch (error) {
      console.error(`创建菜单失败: ${javaMenu.title}`, error);
    }
  }

  console.log('菜单数据迁移完成!');
  await app.close();
}

bootstrap().catch(error => {
  console.error('迁移失败:', error);
  process.exit(1);
});
