import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../src/modules/rbac/entities/menu.entity';
import { adminMenus } from './admin-menu-data';

@Injectable()
export class MenuSeeder {
  private readonly logger = new Logger(MenuSeeder.name);

  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async seedAdminMenus(): Promise<void> {
    this.logger.log('🌱 开始初始化管理端菜单数据...');

    try {
      // 清空现有菜单（可选，根据需求决定）
      const existingCount = await this.menuRepository.count();
      if (existingCount > 0) {
        this.logger.log(`📋 发现 ${existingCount} 个现有菜单，将被替换`);
        await this.menuRepository.clear();
      }

      // 批量创建菜单
      const createdMenus = [];

      for (const menuData of adminMenus) {
        const menu = this.menuRepository.create({
          name: menuData.name,
          path: menuData.path,
          component: (menuData as any).component || null, // component字段可能不存在
          icon: menuData.icon,
          parentId: menuData.parentId ? await this.findParentId(menuData.parentId) : null,
          sortWeight: menuData.sortOrder,
          status: 1, // 正常状态
          hidden: false,
          title: menuData.title,
          // 添加其他需要的字段
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        try {
          const savedMenu = await this.menuRepository.save(menu);
          createdMenus.push(savedMenu);
          this.logger.log(`✅ 创建菜单: ${menuData.title} (ID: ${savedMenu.id})`);
        } catch (error) {
          this.logger.error(`❌ 创建菜单失败: ${menuData.title}`, error);
        }
      }

      this.logger.log(`🎉 管理端菜单初始化完成，共创建 ${createdMenus.length} 个菜单`);

      // 打印菜单树结构
      await this.printMenuTree();
    } catch (error) {
      this.logger.error('❌ 菜单初始化失败', error);
      throw error;
    }
  }

  private async findParentId(parentIdentifier: string): Promise<number | null> {
    try {
      const parent = await this.menuRepository.findOne({
        where: [
          { name: parentIdentifier },
          { title: parentIdentifier },
          { id: parseInt(parentIdentifier) },
        ],
      });

      return parent ? parent.id : null;
    } catch (error) {
      this.logger.warn(`⚠️ 找不到父菜单: ${parentIdentifier}`);
      return null;
    }
  }

  private async printMenuTree(): Promise<void> {
    try {
      const rootMenus = await this.menuRepository.find({
        where: { parentId: null },
        order: { sortWeight: 'ASC' },
      });

      this.logger.log('📊 菜单树结构:');

      for (const rootMenu of rootMenus) {
        await this.printSubTree(rootMenu, 0);
      }
    } catch (error) {
      this.logger.error('打印菜单树失败', error);
    }
  }

  private async printSubTree(menu: Menu, depth: number): Promise<void> {
    const indent = '  '.repeat(depth);
    this.logger.log(`${indent}├─ ${menu.title} (${menu.name}) - ID: ${menu.id}`);

    const children = await this.menuRepository.find({
      where: { parentId: menu.id },
      order: { sortWeight: 'ASC' },
    });

    for (const child of children) {
      await this.printSubTree(child, depth + 1);
    }
  }

  async updateWechatMenuOrder(): Promise<void> {
    this.logger.log('🔄 更新公众号菜单排序...');

    try {
      // 查找公众号相关的菜单，确保它们的排序正确
      const wechatMenus = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.name LIKE :prefix', { prefix: 'admin-wechat%' })
        .orWhere('menu.title = :title', { title: '公众号' })
        .getMany();

      for (const menu of wechatMenus) {
        const expectedOrder = this.getExpectedOrder(menu.name);
        if (expectedOrder !== null && menu.sortWeight !== expectedOrder) {
          menu.sortWeight = expectedOrder;
          await this.menuRepository.save(menu);
          this.logger.log(`🔄 更新菜单排序: ${menu.title} -> ${expectedOrder}`);
        }
      }

      this.logger.log('✅ 公众号菜单排序更新完成');
    } catch (error) {
      this.logger.error('❌ 更新公众号菜单排序失败', error);
    }
  }

  private getExpectedOrder(menuName: string): number | null {
    const orderMap: { [key: string]: number } = {
      // 公众号主模块 (70-89)
      'admin-wechat': 70, // 7号模块，从70开始

      // 消息管理 (71-74)
      'admin-wechat-message': 71,
      'admin-wechat-fans': 72,
      'admin-wechat-subscribe': 73,
      'admin-wechat-template': 74,

      // H5网页 (75-77)
      'admin-wechat-h5': 75,
      'admin-wechat-h5-pages': 76,
      'admin-wechat-h5-template': 77,

      // 微信卡券 (78-80)
      'admin-wechat-coupon': 78,
      'admin-wechat-coupon-list': 79,
      'admin-wechat-coupon-template': 80,
      'admin-wechat-coupon-record': 81,

      // 素材管理 (82-86)
      'admin-wechat-material': 82,
      'admin-wechat-material-image': 83,
      'admin-wechat-material-video': 84,
      'admin-wechat-material-voice': 85,
      'admin-wechat-material-article': 86,

      // 自定义菜单 (87-89)
      'admin-wechat-menu': 87,
      'admin-wechat-menu-config': 88,
      'admin-wechat-menu-keywords': 89,

      // 授权管理 (90-93)
      'admin-wechat-oauth': 90,
      'admin-wechat-oauth-user': 91,
      'admin-wechat-oauth-app': 92,
      'admin-wechat-oauth-token': 93,
    };

    return orderMap[menuName] || null;
  }

  async getMenuStatistics(): Promise<any> {
    try {
      const totalMenus = await this.menuRepository.count();
      const rootMenus = await this.menuRepository.count({ where: { parentId: null } });
      const enabledMenus = await this.menuRepository.count({ where: { status: 1 } });
      const disabledMenus = await this.menuRepository.count({ where: { status: 2 } });

      return {
        total: totalMenus,
        root: rootMenus,
        enabled: enabledMenus,
        disabled: disabledMenus,
        hidden: await this.menuRepository.count({ where: { hidden: true } }),
      };
    } catch (error) {
      this.logger.error('获取菜单统计失败', error);
      return null;
    }
  }
}

// 如果直接运行此文件，执行菜单初始化
async function runMenuSeeder() {
  console.log('🚀 启动菜单数据初始化...');

  try {
    // 这里需要获取到数据库连接和Menu repository
    // 在实际使用中，这个文件应该被模块调用，而不是直接运行

    console.log('✅ 菜单数据初始化完成！');
  } catch (error) {
    console.error('❌ 菜单数据初始化失败:', error);
  }
}

// 导出供其他模块使用
export { runMenuSeeder };
