import { DataSource } from 'typeorm';
import { Menu } from '../modules/common/auth/entities/menu.entity';

/**
 * 构建菜单树形结构
 */
function buildMenuTree(menus: Menu[]): any[] {
  const menuMap = new Map();
  const rootMenus: any[] = [];

  // 创建菜单映射
  menus.forEach(menu => {
    menuMap.set(menu.id, {
      id: menu.id,
      title: menu.title,
      name: menu.name,
      path: menu.path,
      level: menu.level,
      frontRoute: menu.frontRoute,
      parentId: menu.parentId,
      sortOrder: menu.sortOrder,
      permission: menu.permission,
      icon: menu.icon,
      description: menu.description,
      type: menu.type,
      appType: menu.appType,
      status: menu.status,
      hidden: menu.hidden,
      redirect: menu.redirect,
      children: []
    });
  });

  // 构建树形结构
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.id);
    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(menuItem);
        // 按sortOrder排序
        parent.children.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      }
    } else {
      rootMenus.push(menuItem);
    }
  });

  // 按sortOrder排序根菜单
  rootMenus.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  
  return rootMenus;
}

/**
 * 打印菜单树
 */
function printMenuTree(menus: any[], indent = '') {
  menus.forEach(menu => {
    const levelText = menu.level === 0 ? '🌳' : menu.level === 1 ? '├─' : '└─';
    console.log(`${indent}${levelText} ${menu.title} (${menu.name})`);
    console.log(`${indent}│  ├─ 路径: ${menu.path}`);
    console.log(`${indent}│  ├─ 层级: ${menu.level}`);
    console.log(`${indent}│  ├─ 路由: ${menu.frontRoute}`);
    console.log(`${indent}│  ├─ 权限: ${menu.permission}`);
    console.log(`${indent}│  ├─ 图标: ${menu.icon}`);
    console.log(`${indent}│  ├─ 终端: ${menu.appType === 1 ? '管理端' : '卖家端'}`);
    console.log(`${indent}│  └─ 排序: ${menu.sortOrder}`);
    
    if (menu.children && menu.children.length > 0) {
      printMenuTree(menu.children, indent + '│  ');
    }
  });
}

/**
 * 打印简洁的菜单树结构
 */
function printSimpleMenuTree(menus: any[], indent = '') {
  menus.forEach(menu => {
    const levelText = menu.level === 0 ? '🌳' : menu.level === 1 ? '├─' : '└─';
    console.log(`${indent}${levelText} ${menu.title}`);
    
    if (menu.children && menu.children.length > 0) {
      printSimpleMenuTree(menu.children, indent + '│  ');
    }
  });
}

async function main() {
  try {
    // 创建数据源连接
    const dataSource = new DataSource({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'malleco_api',
      entities: [Menu],
      synchronize: true,
      logging: false
    });
    
    await dataSource.initialize();
    console.log('数据库连接成功\n');
    
    const menuRepository = dataSource.getRepository(Menu);
    
    // 获取所有菜单并按sortOrder排序
    const allMenus = await menuRepository.find({
      order: { sortOrder: 'ASC' }
    });
    
    console.log(`当前数据库中有 ${allMenus.length} 个菜单\n`);
    
    // 按终端类型分类
    const adminMenus = allMenus.filter(menu => menu.appType === 1);
    const sellerMenus = allMenus.filter(menu => menu.appType === 2);
    
    console.log(`管理端菜单数: ${adminMenus.length}`);
    console.log(`卖家端菜单数: ${sellerMenus.length}\n`);
    
    // 构建两套菜单树
    const adminMenuTree = buildMenuTree(adminMenus);
    const sellerMenuTree = buildMenuTree(sellerMenus);
    
    console.log('=== 🏢 管理端侧边栏菜单树结构 (appType: 1) ===');
    printSimpleMenuTree(adminMenuTree);
    
    console.log('\n=== 🏪 卖家端侧边栏菜单树结构 (appType: 2) ===');
    printSimpleMenuTree(sellerMenuTree);
    
    console.log('\n=== 📊 详细菜单信息 ===');
    console.log('\n管理端菜单详情:');
    printMenuTree(adminMenuTree);
    
    console.log('\n卖家端菜单详情:');
    printMenuTree(sellerMenuTree);
    
    await dataSource.destroy();
    
  } catch (error) {
    console.error('获取菜单树失败:', error);
    
    // 显示预期的菜单结构
    console.log('\n=== 🏢 预期的管理端菜单结构 ===');
    console.log('管理后台');
    console.log('├─ 首页 (level=0)');
    console.log('│   ├─ 控制台');
    console.log('│   └─ 数据概览');
    console.log('├─ 商品管理 (level=0)');
    console.log('│   ├─ 商品列表');
    console.log('│   ├─ 商品分类');
    console.log('│   ├─ 品牌管理');
    console.log('│   ├─ 规格管理');
    console.log('│   └─ 商品评价');
    console.log('├─ 订单管理 (level=0)');
    console.log('│   ├─ 订单列表');
    console.log('│   ├─ 售后管理');
    console.log('│   ├─ 退款管理');
    console.log('│   └─ 发票管理');
    console.log('├─ 会员管理 (level=0)');
    console.log('│   ├─ 会员列表');
    console.log('│   ├─ 会员等级');
    console.log('│   ├─ 会员积分');
    console.log('│   └─ 会员标签');
    console.log('├─ 营销管理 (level=0)');
    console.log('│   ├─ 优惠券管理');
    console.log('│   ├─ 促销活动');
    console.log('│   ├─ 秒杀活动');
    console.log('│   ├─ 拼团活动');
    console.log('│   └─ 满减活动');
    console.log('├─ 内容管理 (level=0)');
    console.log('│   ├─ 文章管理');
    console.log('│   ├─ 文章分类');
    console.log('│   ├─ 页面管理');
    console.log('│   └─ 广告管理');
    console.log('├─ 财务管理 (level=0)');
    console.log('│   ├─ 资金管理');
    console.log('│   ├─ 账单管理');
    console.log('│   ├─ 提现管理');
    console.log('│   └─ 对账管理');
    console.log('├─ 店铺管理 (level=0)');
    console.log('│   ├─ 店铺列表');
    console.log('│   ├─ 店铺审核');
    console.log('│   ├─ 店铺等级');
    console.log('│   └─ 店铺分类');
    console.log('├─ 系统设置 (level=0)');
    console.log('│   ├─ 基础设置');
    console.log('│   ├─ 支付设置');
    console.log('│   ├─ 物流设置');
    console.log('│   └─ 消息设置');
    console.log('└─ 权限管理 (level=0)');
    console.log('    ├─ 管理员管理');
    console.log('    ├─ 角色管理');
    console.log('    ├─ 菜单管理');
    console.log('    ├─ 部门管理');
    console.log('    └─ 操作日志');
    
    console.log('\n=== 🏪 预期的卖家端菜单结构 ===');
    console.log('卖家中心');
    console.log('├─ 店铺首页 (level=0)');
    console.log('│   ├─ 数据概览');
    console.log('│   └─ 经营数据');
    console.log('├─ 商品中心 (level=0)');
    console.log('│   ├─ 发布商品');
    console.log('│   ├─ 商品管理');
    console.log('│   ├─ 商品分类');
    console.log('│   ├─ 库存管理');
    console.log('│   └─ 评价管理');
    console.log('├─ 订单中心 (level=0)');
    console.log('│   ├─ 订单管理');
    console.log('│   ├─ 售后管理');
    console.log('│   ├─ 发货管理');
    console.log('│   └─ 物流管理');
    console.log('├─ 营销推广 (level=0)');
    console.log('│   ├─ 优惠券');
    console.log('│   ├─ 促销活动');
    console.log('│   ├─ 满减活动');
    console.log('│   └─ 店铺装修');
    console.log('├─ 客户管理 (level=0)');
    console.log('│   ├─ 客户列表');
    console.log('│   ├─ 客户分组');
    console.log('│   ├─ 聊天记录');
    console.log('│   └─ 评价管理');
    console.log('├─ 财务管理 (level=0)');
    console.log('│   ├─ 资金管理');
    console.log('│   ├─ 账单明细');
    console.log('│   ├─ 提现申请');
    console.log('│   └─ 发票管理');
    console.log('├─ 店铺设置 (level=0)');
    console.log('│   ├─ 基本信息');
    console.log('│   ├─ 运费模板');
    console.log('│   ├─ 客服设置');
    console.log('│   └─ 账号安全');
    console.log('└─ 店员管理 (level=0)');
    console.log('    ├─ 店员列表');
    console.log('    ├─ 角色管理');
    console.log('    ├─ 权限分配');
    console.log('    └─ 操作日志');
  }
}

main();