const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, '.env'),
});

async function createOrderShardingTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'malleco',
  });

  try {
    // 获取原始表结构
    const [originalColumns] = await connection.execute(
      'SHOW FULL COLUMNS FROM mall_order'
    );

    const [originalIndices] = await connection.execute(
      'SHOW INDEX FROM mall_order'
    );

    // 生成创建表的SQL语句
    for (let i = 0; i < 16; i++) {
      const tableIndex = i.toString().padStart(2, '0');
      const tableName = `mall_order_${tableIndex}`;

      // 创建表
      let createTableSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`;

      // 添加列
      originalColumns.forEach((col, index) => {
        createTableSql += `\`${col.Field}\` ${col.Type}`;
        if (col.Collation) createTableSql += ` COLLATE ${col.Collation}`;
        if (col.Null === 'NO') createTableSql += ' NOT NULL';
        // 处理时间戳字段的默认值
        if (col.Field === 'createTime' || col.Field === 'updateTime') {
          if (col.Field === 'createTime') {
            createTableSql += ' DEFAULT CURRENT_TIMESTAMP';
          } else if (col.Field === 'updateTime') {
            createTableSql += ' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
          }
        } else if (col.Default !== null) {
          if (typeof col.Default === 'string') {
            createTableSql += ` DEFAULT '${col.Default}'`;
          } else {
            createTableSql += ` DEFAULT ${col.Default}`;
          }
        }
        // 修复SQL语法错误，移除所有包含DEFAULT_GENERATED的Extra属性
        if (col.Extra && !col.Extra.includes('DEFAULT_GENERATED')) {
          createTableSql += ` ${col.Extra}`;
        }
        if (index < originalColumns.length - 1) createTableSql += ',';
      });

      // 添加主键
      const primaryKey = originalColumns.find(col => col.Key === 'PRI');
      if (primaryKey) {
        createTableSql += `, PRIMARY KEY (\`${primaryKey.Field}\`)`;
      }

      createTableSql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

      // 执行创建表
      await connection.execute(createTableSql);
      console.log(`Created table: ${tableName}`);

      // 添加索引（跳过主键）
      const uniqueIndices = new Set();
      originalIndices.forEach(idx => {
        if (idx.Key_name !== 'PRIMARY') {
          const indexName = idx.Key_name.replace('mall_order', tableName);
          if (!uniqueIndices.has(indexName)) {
            const isUnique = idx.Non_unique === 0;
            const [indexColumns] = originalIndices
              .filter(i => i.Key_name === idx.Key_name)
              .map(i => `\`${i.Column_name}\``);

            const createIndexSql = `${isUnique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX'} \`${indexName}\` ON \`${tableName}\` (${indexColumns});`;
            connection.execute(createIndexSql);
            uniqueIndices.add(indexName);
            console.log(`Added ${isUnique ? 'unique ' : ''}index: ${indexName} to ${tableName}`);
          }
        }
      });
    }

    console.log('All order sharding tables created successfully!');
  } catch (error) {
    console.error('Error creating order sharding tables:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行脚本
createOrderShardingTables().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
