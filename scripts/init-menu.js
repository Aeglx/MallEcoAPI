#!/usr/bin/env node

const path = require('path');

// 加载环境变量
require('dotenv').config({
  path: path.join(__dirname, '../config/.env'),
});

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const { adminMenus } = require('./admin-menu-data');

class MenuInitializer {
  constructor() {
    this.connection = null;
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'malleco',
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }

  async createMenuTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS rbac_menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL COMMENT '菜单名称',
        path VARCHAR(500) DEFAULT NULL COMMENT '菜单路径',
        component VARCHAR(255) DEFAULT NULL COMMENT '组件路径',
        icon VARCHAR(100) DEFAULT NULL COMMENT '菜单图标',
        parentId INT DEFAULT NULL COMMENT '父菜单ID',
        sortWeight INT DEFAULT 0 COMMENT '排序权重',
        status INT DEFAULT 1 COMMENT '状态: 1-正常, 2-禁用',
        hidden BOOLEAN DEFAULT FALSE COMMENT '是否隐藏',
        redirect VARCHAR(500) DEFAULT NULL COMMENT '重定向地址',
        title VARCHAR(255) DEFAULT NULL COMMENT '菜单标题',
        affix BOOLEAN DEFAULT NULL COMMENT '是否固定',
        cache BOOLEAN DEFAULT NULL COMMENT '是否缓存',
        breadcrumb BOOLEAN DEFAULT NULL COMMENT '是否显示面包屑',
        activeMenu VARCHAR(255) DEFAULT NULL COMMENT '当前激活的菜单',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        createdBy INT DEFAULT NULL COMMENT '创建者ID',
        updatedBy INT DEFAULT NULL COMMENT '更新者ID',
        remark TEXT COMMENT '备注',
        INDEX idx_parentId (parentId),
        INDEX idx_status (status),
        INDEX idx_sortWeight (sortWeight),
        FOREIGN KEY (parentId) REFERENCES rbac_menus(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='RBAC菜单表';
    `;

    try {
      await this.connection.query(createTableSQL);
      console.log('✅ 菜单表创建成功');
      return true;
    } catch (error) {
      console.error('❌ 创建菜单表失败:', error.message);
      return false;
    }
  }

  async clearExistingMenus() {
    try {
      const [result] = await this.connection.query('DELETE FROM rbac_menus');
      console.log(`🗑️ 清理现有菜单，删除 ${result.affectedRows} 条记录`);
      return true;
    } catch (error) {
      console.error('❌ 清理现有菜单失败:', error.message);
      return false;
    }
  }

  async insertMenu(menu) {
    const insertSQL = `
      INSERT INTO rbac_menus (
        name, path, component, icon, parentId, sortWeight, status, hidden, 
        title, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    try {
      const [result] = await this.connection.query(insertSQL, [
        menu.name,
        menu.path || null,
        menu.component || null,
        menu.icon || null,
        menu.parentId ? await this.getParentId(menu.parentId) : null,
        menu.sortOrder || 0,
        menu.status || 1,
        menu.hidden || false,
        menu.title,
      ]);

      return result.insertId;
    } catch (error) {
      console.error(`❌ 插入菜单失败: ${menu.title}`, error.message);
      return null;
    }
  }

  async getParentId(parentIdentifier) {
    if (!parentIdentifier) return null;

    try {
      const [rows] = await this.connection.query(
        'SELECT id FROM rbac_menus WHERE name = ? OR title = ? OR id = ? LIMIT 1',
        [parentIdentifier, parentIdentifier, parseInt(parentIdentifier) || 0],
      );

      return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
      console.error(`❌ 查找父菜单失败: ${parentIdentifier}`, error.message);
      return null;
    }
  }

  async initializeMenus() {
    console.log('🌱 开始初始化菜单数据...');

    try {
      // 1. 检查并创建菜单表
      if (!(await this.createMenuTable())) {
        return false;
      }

      // 2. 清理现有菜单
      await this.clearExistingMenus();

      // 3. 分批插入菜单（确保父菜单先插入）
      const sortedMenus = this.sortMenusByLevel([...adminMenus]);
      let successCount = 0;

      for (const menu of sortedMenus) {
        const menuId = await this.insertMenu(menu);
        if (menuId) {
          successCount++;
          console.log(`✅ 创建菜单: ${menu.title} (ID: ${menuId})`);
        } else {
          console.error(`❌ 创建菜单失败: ${menu.title}`);
        }
      }

      console.log(`🎉 菜单初始化完成！成功: ${successCount}/${sortedMenus.length}`);

      // 4. 打印菜单树
      await this.printMenuTree();

      return true;
    } catch (error) {
      console.error('❌ 菜单初始化失败:', error.message);
      return false;
    }
  }

  sortMenusByLevel(menus) {
    return menus.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level; // 按层级排序
      }
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder; // 同层级按排序值排序
      }
      return 0;
    });
  }

  async printMenuTree() {
    console.log('\n📊 菜单树结构:');

    try {
      // 获取根菜单
      const [rootMenus] = await this.connection.query(
        'SELECT * FROM rbac_menus WHERE parentId IS NULL ORDER BY sortWeight ASC',
      );

      for (const rootMenu of rootMenus) {
        await this.printSubMenu(rootMenu, 0);
      }
    } catch (error) {
      console.error('❌ 打印菜单树失败:', error.message);
    }
  }

  async printSubMenu(menu, depth) {
    const indent = '  '.repeat(depth);
    console.log(
      `${indent}├─ ${menu.title} (${menu.name}) - [ID: ${menu.id}, Order: ${menu.sortWeight}]`,
    );

    try {
      const [children] = await this.connection.query(
        'SELECT * FROM rbac_menus WHERE parentId = ? ORDER BY sortWeight ASC',
        [menu.id],
      );

      for (const child of children) {
        await this.printSubMenu(child, depth + 1);
      }
    } catch (error) {
      console.error('❌ 获取子菜单失败:', error.message);
    }
  }

  async getMenuStatistics() {
    try {
      const [stats] = await this.connection.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN parentId IS NULL THEN 1 END) as rootMenus,
          COUNT(CASE WHEN status = 1 THEN 1 END) as enabled,
          COUNT(CASE WHEN status = 2 THEN 1 END) as disabled,
          COUNT(CASE WHEN hidden = 1 THEN 1 END) as hidden
        FROM rbac_menus
      `);

      console.log('\n📈 菜单统计信息:');
      console.log(`  总菜单数: ${stats[0].total}`);
      console.log(`  根菜单数: ${stats[0].rootMenus}`);
      console.log(`  启用菜单: ${stats[0].enabled}`);
      console.log(`  禁用菜单: ${stats[0].disabled}`);
      console.log(`  隐藏菜单: ${stats[0].hidden}`);

      return stats[0];
    } catch (error) {
      console.error('❌ 获取菜单统计失败:', error.message);
      return null;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  const menuInit = new MenuInitializer();

  try {
    if (await menuInit.connect()) {
      switch (command) {
        case 'init':
          await menuInit.initializeMenus();
          await menuInit.getMenuStatistics();
          break;

        case 'tree':
          await menuInit.printMenuTree();
          break;

        case 'stats':
          await menuInit.getMenuStatistics();
          break;

        case 'clear':
          await menuInit.clearExistingMenus();
          break;

        default:
          console.log(`
📖 菜单初始化工具使用方法:
  node init-menu.js [command]

可用命令:
  init   - 完整初始化菜单（清理现有数据，插入新数据）
  tree   - 显示菜单树结构
  stats  - 显示菜单统计信息
  clear  - 清理现有菜单数据

示例:
  node init-menu.js init   # 初始化菜单
  node init-menu.js tree   # 查看菜单树
          `);
          break;
      }
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await menuInit.disconnect();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = MenuInitializer;
