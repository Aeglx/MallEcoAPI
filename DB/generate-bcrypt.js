const bcrypt = require('bcrypt');

// 密码明文
const password = 'dav888';

// 生成盐值
const saltRounds = 12;

bcrypt.genSalt(saltRounds, function (err, salt) {
  if (err) {
    console.error('生成盐值失败:', err);
    process.exit(1);
  }

  // 使用盐值加密密码
  bcrypt.hash(password, salt, function (err, hash) {
    if (err) {
      console.error('加密密码失败:', err);
      process.exit(1);
    }

    console.log('密码明文:', password);
    console.log('bcrypt加密值:', hash);

    // 更新数据库初始化脚本中的密码
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.join(__dirname, 'database-initialization.sql');

    fs.readFile(sqlFilePath, 'utf8', function (err, data) {
      if (err) {
        console.error('读取SQL文件失败:', err);
        process.exit(1);
      }

      // 替换旧的密码哈希值
      const updatedData = data.replace(
        /\$2a\$12\$QJ1Z6W\.94j3x4z2g4F5h6G7i8K9l0M1n2O3p4Q5r6S7t8U9v0W1x2Y3z4/g,
        hash,
      );

      fs.writeFile(sqlFilePath, updatedData, 'utf8', function (err) {
        if (err) {
          console.error('更新SQL文件失败:', err);
          process.exit(1);
        }

        console.log('数据库初始化脚本已更新，使用正确的bcrypt加密值');
      });
    });
  });
});
