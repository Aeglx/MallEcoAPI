-- MallEco API 数据库性能调优配置
-- 适用于MySQL 8.0+版本

-- =============================================
-- 1. 基础性能参数优化
-- =============================================

-- 设置InnoDB缓冲池大小（根据服务器内存调整）
-- 建议设置为服务器内存的70-80%
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB

-- 设置InnoDB日志文件大小
-- 建议每个日志文件256MB-1GB，总共2-4GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_log_files_in_group = 2; -- 2个日志文件

-- 设置连接数限制
SET GLOBAL max_connections = 1000;
SET GLOBAL thread_cache_size = 100;

-- 设置查询缓存（MySQL 8.0已移除，使用其他缓存策略）
-- SET GLOBAL query_cache_size = 0;
-- SET GLOBAL query_cache_type = 0;

-- =============================================
-- 2. InnoDB引擎优化
-- =============================================

-- 设置InnoDB刷新策略
SET GLOBAL innodb_flush_log_at_trx_commit = 2; -- 每秒刷新，性能更好
SET GLOBAL innodb_flush_method = O_DIRECT; -- 直接I/O
SET GLOBAL innodb_io_capacity = 2000; -- SSD硬盘
SET GLOBAL innodb_io_capacity_max = 4000;

-- 设置InnoDB并发配置
SET GLOBAL innodb_thread_concurrency = 0; -- 自动调整
SET GLOBAL innodb_read_io_threads = 8;
SET GLOBAL innodb_write_io_threads = 8;

-- 设置InnoDB缓冲池实例
SET GLOBAL innodb_buffer_pool_instances = 8; -- 多核CPU优化

-- =============================================
-- 3. 查询优化配置
-- =============================================

-- 设置排序缓冲区大小
SET GLOBAL sort_buffer_size = 2097152; -- 2MB
SET GLOBAL read_buffer_size = 1048576; -- 1MB
SET GLOBAL read_rnd_buffer_size = 1048576; -- 1MB

-- 设置临时表大小
SET GLOBAL tmp_table_size = 67108864; -- 64MB
SET GLOBAL max_heap_table_size = 67108864; -- 64MB

-- 设置连接缓冲区大小
SET GLOBAL join_buffer_size = 1048576; -- 1MB

-- =============================================
-- 4. 慢查询日志配置
-- =============================================

-- 启用慢查询日志
SET GLOBAL slow_query_log = 1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2; -- 2秒以上的查询记录
SET GLOBAL log_queries_not_using_indexes = 1; -- 记录未使用索引的查询

-- =============================================
-- 5. 二进制日志配置
-- =============================================

-- 二进制日志设置
SET GLOBAL log_bin = ON;
SET GLOBAL binlog_format = ROW; -- 行格式，数据一致性更好
SET GLOBAL sync_binlog = 1; -- 每次事务都同步到磁盘
SET GLOBAL expire_logs_days = 7; -- 保留7天日志

-- =============================================
-- 6. 表空间和文件配置
-- =============================================

-- 启用独立表空间
SET GLOBAL innodb_file_per_table = 1;

-- 设置表定义缓存
SET GLOBAL table_definition_cache = 2000;
SET GLOBAL table_open_cache = 2000;

-- =============================================
-- 7. 复制和高可用配置
-- =============================================

-- 如果使用主从复制
SET GLOBAL server_id = 1;
SET GLOBAL gtid_mode = ON;
SET GLOBAL enforce_gtid_consistency = ON;

-- =============================================
-- 8. 安全配置
-- =============================================

-- 设置密码验证策略
SET GLOBAL validate_password.policy = MEDIUM;

-- 设置连接超时
SET GLOBAL wait_timeout = 28800; -- 8小时
SET GLOBAL interactive_timeout = 28800; -- 8小时

-- =============================================
-- 9. 监控和诊断配置
-- =============================================

-- 启用性能模式
SET GLOBAL performance_schema = ON;

-- 设置性能模式内存分配
SET GLOBAL performance_schema_max_table_instances = 10000;
SET GLOBAL performance_schema_max_sql_text_length = 1024;

-- =============================================
-- 10. 特定于MallEco的优化配置
-- =============================================

-- 针对电商场景的特殊优化
SET GLOBAL innodb_adaptive_hash_index = 1; -- 启用自适应哈希索引
SET GLOBAL innodb_stats_persistent = 1; -- 持久化统计信息
SET GLOBAL innodb_stats_auto_recalc = 1; -- 自动重新计算统计信息

-- 设置事务隔离级别（推荐使用READ COMMITTED）
SET GLOBAL transaction_isolation = 'READ-COMMITTED';

-- =============================================
-- 11. 创建性能监控视图
-- =============================================

-- 创建性能监控视图
CREATE OR REPLACE VIEW mall_performance_monitor AS
SELECT 
    'connection_info' as metric_type,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value
FROM information_schema.GLOBAL_STATUS 
WHERE VARIABLE_NAME IN ('Threads_connected', 'Threads_running', 'Max_used_connections')

UNION ALL

SELECT 
    'buffer_pool' as metric_type,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value
FROM information_schema.GLOBAL_STATUS 
WHERE VARIABLE_NAME LIKE 'Innodb_buffer_pool%'

UNION ALL

SELECT 
    'query_performance' as metric_type,
    VARIABLE_NAME as metric_name,
    VARIABLE_VALUE as metric_value
FROM information_schema.GLOBAL_STATUS 
WHERE VARIABLE_NAME IN ('Slow_queries', 'Queries', 'Com_select', 'Com_insert', 'Com_update', 'Com_delete');

-- =============================================
-- 12. 创建索引优化建议视图
-- =============================================

CREATE OR REPLACE VIEW mall_index_optimization_suggestions AS
SELECT 
    TABLE_SCHEMA as database_name,
    TABLE_NAME as table_name,
    INDEX_NAME as index_name,
    COLUMN_NAME as column_name,
    SEQ_IN_INDEX as seq_in_index,
    NON_UNIQUE as non_unique,
    INDEX_TYPE as index_type
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =============================================
-- 13. 创建表空间使用情况视图
-- =============================================

CREATE OR REPLACE VIEW mall_table_space_usage AS
SELECT 
    TABLE_SCHEMA as database_name,
    TABLE_NAME as table_name,
    ENGINE as engine,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as total_size_mb,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) as data_size_mb,
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) as index_size_mb,
    TABLE_ROWS as row_count,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024 / 1024, 2) as total_size_gb
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY total_size_mb DESC;

-- =============================================
-- 14. 创建锁等待监控视图
-- =============================================

CREATE OR REPLACE VIEW mall_lock_wait_monitor AS
SELECT 
    r.trx_id waiting_trx_id,
    r.trx_mysql_thread_id waiting_thread,
    r.trx_query waiting_query,
    b.trx_id blocking_trx_id,
    b.trx_mysql_thread_id blocking_thread,
    b.trx_query blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;

-- =============================================
-- 15. 定期维护脚本
-- =============================================

-- 创建定期优化表的存储过程
DELIMITER //
CREATE PROCEDURE mall_optimize_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE table_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_TYPE = 'BASE TABLE'
        AND ENGINE = 'InnoDB';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN table_cursor;
    
    read_loop: LOOP
        FETCH table_cursor INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 只优化数据量较大的表（超过100MB）
        SET @table_size = (
            SELECT ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2)
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = table_name
        );
        
        IF @table_size > 100 THEN
            SET @sql = CONCAT('OPTIMIZE TABLE `', table_name, '`');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    END LOOP;
    
    CLOSE table_cursor;
END //
DELIMITER ;

-- =============================================
-- 16. 性能监控事件
-- =============================================

-- 创建定期收集统计信息的事件
DELIMITER //
CREATE EVENT IF NOT EXISTS mall_collect_performance_stats
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    -- 更新表统计信息
    ANALYZE TABLE mall_users, mall_orders, mall_products, mall_categories;
    
    -- 记录性能指标到监控表
    INSERT INTO mall_performance_history 
    SELECT NOW(), metric_type, metric_name, metric_value 
    FROM mall_performance_monitor;
    
    -- 清理旧的监控数据（保留7天）
    DELETE FROM mall_performance_history 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END //
DELIMITER ;

-- =============================================
-- 17. 创建性能历史表
-- =============================================

CREATE TABLE IF NOT EXISTS mall_performance_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value VARCHAR(500) NOT NULL,
    INDEX idx_created_at (created_at),
    INDEX idx_metric_type (metric_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 18. 应用配置
-- =============================================

-- 设置应用特定的配置
SET GLOBAL innodb_autoinc_lock_mode = 2; -- 连续锁定模式，适合高并发插入

-- 设置字符集和排序规则
SET GLOBAL character_set_server = 'utf8mb4';
SET GLOBAL collation_server = 'utf8mb4_unicode_ci';

-- =============================================
-- 19. 重启后持久化配置
-- =============================================

-- 注意：以上SET GLOBAL命令在MySQL重启后会失效
-- 需要将重要配置写入my.cnf配置文件：

-- [mysqld]
-- innodb_buffer_pool_size = 2G
-- innodb_log_file_size = 256M
-- innodb_log_files_in_group = 2
-- max_connections = 1000
-- slow_query_log = 1
-- long_query_time = 2
-- innodb_file_per_table = 1
-- character-set-server = utf8mb4
-- collation-server = utf8mb4_unicode_ci

-- =============================================
-- 20. 验证配置
-- =============================================

-- 验证关键配置是否生效
SELECT 
    '关键配置验证' as check_item,
    VARIABLE_NAME as config_name,
    VARIABLE_VALUE as current_value
FROM information_schema.GLOBAL_VARIABLES 
WHERE VARIABLE_NAME IN (
    'innodb_buffer_pool_size',
    'max_connections', 
    'slow_query_log',
    'long_query_time',
    'innodb_file_per_table',
    'character_set_server'
);

-- 显示当前性能状态
SELECT * FROM mall_performance_monitor;

-- 显示表空间使用情况
SELECT * FROM mall_table_space_usage;

-- 显示索引优化建议
SELECT * FROM mall_index_optimization_suggestions;