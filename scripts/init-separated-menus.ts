import { DataSource } from 'typeorm';
import { Menu } from '../modules/client/common/auth/entities/menu.entity';
import { adminMenus } from './admin-menu-data';
import { sellerMenus } from './seller-menu-data';

/**
 * 初始化分离的管理端和卖家端菜单数�?
 */
async function initSeparatedMenus() {
  try {
    // 创建数据源连�?
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

    // 清空现有菜单数据
    await menuRepository.clear();
    console.log('已清空现有菜单数据\n');

    // 插入管理端菜单数�?
    console.log('正在插入管理端菜单数�?..');
    for (const menuData of adminMenus) {
      const menu = menuRepository.create(menuData);
      await menuRepository.save(menu);
    }
    console.log(`管理端菜单插入完成，�?${adminMenus.length} 个菜单项\n`);

    // 插入卖家端菜单数�?
    console.log('正在插入卖家端菜单数�?..');
    for (const menuData of sellerMenus) {
      const menu = menuRepository.create(menuData);
      await menuRepository.save(menu);
    }
    console.log(`卖家端菜单插入完成，�?${sellerMenus.length} 个菜单项\n`);

    // 统计总数
    const totalMenus = await menuRepository.count();
    console.log(`菜单数据初始化完成！\n`);
    console.log(`管理端菜单数: ${adminMenus.length}`);
    console.log(`卖家端菜单数: ${sellerMenus.length}`);
    console.log(`总菜单数: ${totalMenus}`);

    await dataSource.destroy();
    console.log('\n数据库连接已关闭');

  } catch (error) {
    console.error('菜单数据初始化失�?', error);
  }
}

// 执行初始�?
initSeparatedMenus();
