-- 数据库初始化脚本
-- 自动创建数据库、数据表及初始数据

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `malleco` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `malleco`;

-- ----------------------------
-- RBAC 系统表结构
-- ----------------------------

-- 部门表
CREATE TABLE IF NOT EXISTS `rbac_departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_weight` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 1,
  `leader_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 角色表
CREATE TABLE IF NOT EXISTS `rbac_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `sort_weight` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `rbac_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT 1,
  `parent_id` int(11) DEFAULT NULL,
  `sort_weight` int(11) DEFAULT 0,
  `path` varchar(255) DEFAULT NULL,
  `component` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `api_path` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `is_external` tinyint(1) DEFAULT 0,
  `redirect` varchar(255) DEFAULT NULL,
  `hidden` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户表
CREATE TABLE IF NOT EXISTS `rbac_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `real_name` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `gender` int(11) DEFAULT 0,
  `last_login_ip` varchar(50) DEFAULT NULL,
  `last_login_time` datetime DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_rbac_users_department_id` FOREIGN KEY (`department_id`) REFERENCES `rbac_departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `rbac_user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_rbac_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `rbac_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rbac_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `rbac_role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rbac_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `rbac_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rbac_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `rbac_permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- ----------------------------
-- 核心业务表结构
-- ----------------------------

-- 普通用户表
CREATE TABLE IF NOT EXISTS `mall_user` (
  `id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `last_login_time` datetime DEFAULT NULL,
  `last_login_ip` varchar(50) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `is_vip` int(11) DEFAULT 0,
  `vip_expire_time` datetime DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `balance` decimal(10,2) DEFAULT 0.00,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='普通用户表';

-- 钱包表
CREATE TABLE IF NOT EXISTS `mall_wallet` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `frozen_amount` decimal(15,2) DEFAULT 0.00,
  `total_income` decimal(15,2) DEFAULT 0.00,
  `total_expense` decimal(15,2) DEFAULT 0.00,
  `last_operate_time` datetime DEFAULT NULL,
  `last_operate_desc` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_balance` (`balance`),
  KEY `idx_frozen_amount` (`frozen_amount`),
  CONSTRAINT `fk_mall_wallet_user_id` FOREIGN KEY (`user_id`) REFERENCES `mall_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包表';

-- 钱包交易记录表
CREATE TABLE IF NOT EXISTS `mall_wallet_transaction` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_before` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'success',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_mall_wallet_transaction_user_id` FOREIGN KEY (`user_id`) REFERENCES `mall_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包交易记录表';

-- 文件目录表
CREATE TABLE IF NOT EXISTS `mall_file_directory` (
  `id` varchar(36) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `path` varchar(500) NOT NULL,
  `level` tinyint(4) NOT NULL DEFAULT 1,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件目录表';

-- 文件表
CREATE TABLE IF NOT EXISTS `mall_file` (
  `id` varchar(36) NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `storage_type` varchar(50) NOT NULL DEFAULT 'local',
  `business_type` varchar(50) DEFAULT NULL,
  `business_id` varchar(36) DEFAULT NULL,
  `uploader_id` varchar(36) DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_uploader_id` (`uploader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- ----------------------------
-- 公众号相关表结构
-- ----------------------------

-- 微信基础实体表（所有微信相关表的父类）
CREATE TABLE IF NOT EXISTS `wechat_base` (
  `id` varchar(36) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信基础实体表';

-- 公众号粉丝表
CREATE TABLE IF NOT EXISTS `wechat_fans` (
  `id` varchar(36) NOT NULL,
  `openid` varchar(50) NOT NULL COMMENT 'openid',
  `unionid` varchar(100) NOT NULL COMMENT 'unionid',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `sex` tinyint(4) DEFAULT 1 COMMENT '性别：0-未知，1-男，2-女',
  `city` varchar(200) DEFAULT NULL COMMENT '城市',
  `province` varchar(200) DEFAULT NULL COMMENT '省份',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `headimgurl` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `subscribe_status` tinyint(4) DEFAULT 0 COMMENT '关注状态：0-未关注，1-已关注',
  `subscribe_time` datetime DEFAULT NULL COMMENT '关注时间',
  `unsubscribe_time` datetime DEFAULT NULL COMMENT '取消关注时间',
  `remark` text DEFAULT NULL COMMENT '备注',
  `tag_ids` json DEFAULT NULL COMMENT '标签ID列表',
  `blacklist` tinyint(4) DEFAULT 0 COMMENT '黑名单状态：0-正常，1-黑名单',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_subscribe_status` (`subscribe_status`),
  KEY `idx_blacklist` (`blacklist`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公众号粉丝表';

-- 公众号订阅表
CREATE TABLE IF NOT EXISTS `wechat_subscribe` (
  `id` varchar(36) NOT NULL,
  `openid` varchar(50) NOT NULL COMMENT '用户openid',
  `template_id` varchar(100) NOT NULL COMMENT '模板ID',
  `scene` varchar(100) DEFAULT NULL COMMENT '场景',
  `status` tinyint(4) DEFAULT 1 COMMENT '状态：1-已订阅，2-拒收，3-已发送',
  `content` text DEFAULT NULL COMMENT '订阅内容',
  `template_data` json DEFAULT NULL COMMENT '模板数据',
  `send_time` datetime DEFAULT NULL COMMENT '发送时间',
  `click_time` datetime DEFAULT NULL COMMENT '点击时间',
  `click_url` text DEFAULT NULL COMMENT '点击跳转链接',
  `remark` text DEFAULT NULL COMMENT '备注',
  `retry_count` tinyint(4) DEFAULT 0 COMMENT '重试次数',
  `next_retry_time` datetime DEFAULT NULL COMMENT '下次重试时间',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `business_id` varchar(50) DEFAULT NULL COMMENT '关联业务ID',
  `business_type` varchar(50) DEFAULT NULL COMMENT '关联业务类型',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_openid` (`openid`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_business_type` (`business_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公众号订阅表';

-- 公众号图文素材表
CREATE TABLE IF NOT EXISTS `wechat_material_article` (
  `id` varchar(36) NOT NULL,
  `article_id` varchar(100) NOT NULL COMMENT '图文ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `cover` varchar(500) DEFAULT NULL COMMENT '封面图URL',
  `source_url` varchar(500) DEFAULT NULL COMMENT '原文链接',
  `digest` text DEFAULT NULL COMMENT '摘要',
  `status` tinyint(4) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `read_count` int(11) DEFAULT 0 COMMENT '阅读次数',
  `share_count` int(11) DEFAULT 0 COMMENT '分享次数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_del` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_id` (`article_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公众号图文素材表';

-- ----------------------------
-- 初始数据
-- ----------------------------

-- 插入超级管理员角色
INSERT INTO `rbac_roles` (`id`, `name`, `code`, `description`, `status`, `sort_weight`) 
VALUES (1, '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限', 1, 0) 
ON DUPLICATE KEY UPDATE `name`='超级管理员', `code`='super_admin', `description`='系统超级管理员，拥有所有权限', `status`=1;

-- 插入运营管理员角色
INSERT INTO `rbac_roles` (`id`, `name`, `code`, `description`, `status`, `sort_weight`) 
VALUES (2, '运营管理员', 'operator', '运营管理员，负责日常运营管理工作', 1, 1) 
ON DUPLICATE KEY UPDATE `name`='运营管理员', `code`='operator', `description`='运营管理员，负责日常运营管理工作', `status`=1;

-- 插入管理员用户（密码：dav888，使用bcrypt加密）
-- 注意：bcrypt加密值可能需要根据实际情况调整
INSERT INTO `rbac_users` (`id`, `username`, `password`, `email`, `status`, `real_name`, `phone`) 
VALUES (1, 'admin', '$2b$12$Gq2L8eXyKM3sURvkFiVqy.9.THMoIxo.mbN1PMw.026UeMBA0tAQ2', 'admin@malleco.com', 1, '系统管理员', '13800000001') 
ON DUPLICATE KEY UPDATE `username`='admin', `password`='$2b$12$Gq2L8eXyKM3sURvkFiVqy.9.THMoIxo.mbN1PMw.026UeMBA0tAQ2', `email`='admin@malleco.com', `status`=1, `real_name`='系统管理员', `phone`='13800000001';

-- 插入运营管理员用户（密码：operator123，使用bcrypt加密）
-- 注意：bcrypt加密值需要根据实际情况生成，这里使用示例值
-- 可以使用 node DB/generate-bcrypt.js 生成新的密码哈希值
INSERT INTO `rbac_users` (`id`, `username`, `password`, `email`, `status`, `real_name`, `phone`) 
VALUES (2, 'operator', '$2b$12$Gq2L8eXyKM3sURvkFiVqy.9.THMoIxo.mbN1PMw.026UeMBA0tAQ2', 'operator@malleco.com', 1, '运营管理员', '13800000002') 
ON DUPLICATE KEY UPDATE `username`='operator', `password`='$2b$12$Gq2L8eXyKM3sURvkFiVqy.9.THMoIxo.mbN1PMw.026UeMBA0tAQ2', `email`='operator@malleco.com', `status`=1, `real_name`='运营管理员', `phone`='13800000002';

-- 关联管理员用户与超级管理员角色
INSERT INTO `rbac_user_roles` (`user_id`, `role_id`) 
VALUES (1, 1) 
ON DUPLICATE KEY UPDATE `user_id`=1, `role_id`=1;

-- 关联运营管理员用户与运营管理员角色
INSERT INTO `rbac_user_roles` (`user_id`, `role_id`) 
VALUES (2, 2) 
ON DUPLICATE KEY UPDATE `user_id`=2, `role_id`=2;

-- 插入系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `group` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`),
  KEY `idx_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入基础系统配置
INSERT INTO `system_config` (`key`, `value`, `description`, `group`, `status`) 
VALUES 
('system.name', 'MallEco', '系统名称', 'system', 1),
('system.version', '1.0.0', '系统版本', 'system', 1),
('system.description', '电商生态系统', '系统描述', 'system', 1),
('system.logo', '', '系统Logo', 'system', 1),
('system.favicon', '', '系统图标', 'system', 1),
('system.copyright', '© 2024 MallEco. All rights reserved.', '版权信息', 'system', 1)
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), `description`=VALUES(`description`), `group`=VALUES(`group`), `status`=VALUES(`status`);

-- 输出执行结果
SELECT '数据库初始化完成！' AS `result`;
SELECT '管理员账户：admin' AS `username`, '密码：dav888' AS `password`;
SELECT '运营账户：operator' AS `username`, '密码：dav888' AS `password`;

