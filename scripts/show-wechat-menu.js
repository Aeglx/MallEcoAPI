#!/usr/bin/env node

const { adminMenus } = require('./admin-menu-data.js');

class MenuVisualizer {
  constructor() {
    this.wechatMenus = adminMenus.filter(menu => 
      menu.id.includes('admin-wechat')
    );
  }

  displayMenuTree() {
    console.log('🎯 公众号菜单结构可视化\n');
    console.log('📱 公众号 (admin-wechat)');
    console.log('└── Order: 7 | 权限: | Icon: wechat');
    console.log('');

    const categorizedMenus = this.categorizeMenus();
    
    Object.keys(categorizedMenus).forEach((category, index) => {
      const categoryInfo = categorizedMenus[category];
      console.log(`${this.getCategoryIcon(category)} ${category}`);
      console.log(`└── Order: ${70 + index} | Path: /admin/wechat/${categoryInfo.path}`);
      
      if (categoryInfo.submenus && categoryInfo.submenus.length > 0) {
        categoryInfo.submenus.forEach(submenu => {
          console.log(`    ├── ${submenu.title}`);
          console.log(`    │   └── Order: ${submenu.sortOrder} | Permission: ${submenu.permission}`);
          
          if (submenu.items && submenu.items.length > 0) {
            submenu.items.forEach(item => {
              console.log(`    │       ├── ${item.title}`);
              console.log(`    │       │   └── Order: ${item.sortOrder} | Permission: ${item.permission}`);
            });
          }
        });
      }
      console.log('');
    });

    console.log('📊 统计信息:');
    console.log(`🎯 总模块数: ${Object.keys(categorizedMenus).length}`);
    console.log(`📋 总菜单项: ${this.wechatMenus.length}`);
    console.log(`🔗 权限配置: ${this.wechatMenus.filter(m => m.permission).length} 个`);
    console.log('');
  }

  categorizeMenus() {
    const categories = {};
    
    this.wechatMenus.forEach(menu => {
      const category = this.getCategory(menu);
      
      if (!categories[category]) {
        categories[category] = {
          name: category,
          path: this.getCategoryPath(menu),
          submenus: {}
        };
      }

      if (menu.level === 1) {
        // 一级菜单（如：消息管理、H5网页等）
        if (!categories[category].main) {
          categories[category].main = menu;
        }
      } else if (menu.level === 2) {
        // 二级菜单
        const parentMenu = this.findParentMenu(menu);
        if (parentMenu) {
          if (!categories[category].submenus[parentMenu.title]) {
            categories[category].submenus[parentMenu.title] = {
              title: parentMenu.title,
              sortOrder: parentMenu.sortOrder,
              permission: parentMenu.permission,
              items: []
            };
          }
          categories[category].submenus[parentMenu.title].items.push(menu);
        }
      }
    });

    return categories;
  }

  getCategory(menu) {
    const categoryMap = {
      'admin-wechat-message': '消息管理',
      'admin-wechat-h5': 'H5网页',
      'admin-wechat-coupon': '微信卡券',
      'admin-wechat-material': '素材管理',
      'admin-wechat-menu': '自定义菜单',
      'admin-wechat-oauth': '授权管理'
    };

    if (menu.level === 0) return '公众号';
    if (menu.level === 1) return categoryMap[menu.id] || '其他';
    if (menu.level === 2) {
      const parent = this.findParentMenu(menu);
      if (parent) return categoryMap[parent.id] || '其他';
    }
    
    return '其他';
  }

  getCategoryPath(menu) {
    if (menu.level === 1) {
      return menu.path.split('/').pop();
    }
    const parent = this.findParentMenu(menu);
    if (parent) {
      return parent.path.split('/').pop();
    }
    return 'wechat';
  }

  findParentMenu(menu) {
    return this.wechatMenus.find(m => m.id === menu.parentId);
  }

  getCategoryIcon(category) {
    const iconMap = {
      '消息管理': '📨',
      'H5网页': '🌐',
      '微信卡券': '🎫',
      '素材管理': '📁',
      '自定义菜单': '📋',
      '授权管理': '🔐',
      '公众号': '📱'
    };
    
    return iconMap[category] || '📂';
  }

  displaySummary() {
    console.log('📈 功能模块总结:\n');
    
    const moduleSummary = [
      {
        module: '消息管理',
        features: ['粉丝管理', '订阅通知', '模板消息'],
        description: '管理粉丝、发送通知、模板消息推送'
      },
      {
        module: 'H5网页',
        features: ['页面管理', '模板管理'],
        description: '创建和管理H5页面及模板'
      },
      {
        module: '微信卡券',
        features: ['卡券列表', '卡券模板', '核销记录'],
        description: '微信卡券创建、分发和核销管理'
      },
      {
        module: '素材管理',
        features: ['图片', '视频', '语音', '图文'],
        description: '多媒体素材的统一管理'
      },
      {
        module: '自定义菜单',
        features: ['菜单配置', '关键词回复'],
        description: '微信公众号底部菜单和交互配置'
      },
      {
        module: '授权管理',
        features: ['用户授权', '应用授权', '令牌管理'],
        description: 'OAuth授权和访问控制管理'
      }
    ];

    moduleSummary.forEach((item, index) => {
      console.log(`${index + 1}. ${item.module}`);
      console.log(`   功能: ${item.features.join('、')}`);
      console.log(`   说明: ${item.description}`);
      console.log('');
    });
  }

  generateAPIEndpoints() {
    console.log('🔌 API 端点规划:\n');
    
    const apiEndpoints = {
      '消息管理': [
        'GET    /api/admin/wechat/fans',
        'POST   /api/admin/wechat/template/send',
        'GET    /api/admin/wechat/subscribe'
      ],
      'H5网页': [
        'GET    /api/admin/wechat/h5-pages',
        'POST   /api/admin/wechat/h5-pages',
        'GET    /api/admin/wechat/h5-template'
      ],
      '微信卡券': [
        'GET    /api/admin/wechat/coupon-list',
        'POST   /api/admin/wechat/coupon/use',
        'GET    /api/admin/wechat/coupon-record'
      ],
      '素材管理': [
        'POST   /api/admin/wechat/material-image',
        'GET    /api/admin/wechat/material-video',
        'DELETE /api/admin/wechat/material-voice/:id'
      ],
      '自定义菜单': [
        'GET    /api/admin/wechat/menu-config',
        'POST   /api/admin/wechat/menu/publish',
        'GET    /api/admin/wechat/menu-keywords'
      ],
      '授权管理': [
        'GET    /api/admin/wechat/oauth-user',
        'DELETE /api/admin/wechat/oauth-token/:id',
        'POST   /api/admin/wechat/oauth/refresh'
      ]
    };

    Object.keys(apiEndpoints).forEach(module => {
      console.log(`${module}:`);
      apiEndpoints[module].forEach(endpoint => {
        console.log(`  ${endpoint}`);
      });
      console.log('');
    });
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'tree';

  const visualizer = new MenuVisualizer();

  switch (command) {
    case 'tree':
    case 'show':
      visualizer.displayMenuTree();
      break;
      
    case 'summary':
    case '功能':
      visualizer.displaySummary();
      break;
      
    case 'api':
    case 'endpoints':
      visualizer.generateAPIEndpoints();
      break;
      
    case 'all':
      visualizer.displayMenuTree();
      visualizer.displaySummary();
      visualizer.generateAPIEndpoints();
      break;
      
    default:
      console.log(`
📖 公众号菜单可视化工具使用方法:
  node show-wechat-menu.js [command]

可用命令:
  tree     - 显示菜单树结构 (默认)
  summary  - 显示功能模块总结
  api      - 显示API端点规划
  all      - 显示所有信息

示例:
  node show-wechat-menu.js tree     # 显示菜单树
  node show-wechat-menu.js summary  # 显示功能总结
  node show-wechat-menu.js api      # 显示API规划
  node show-wechat-menu.js all      # 显示全部信息
      `);
      break;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = MenuVisualizer;