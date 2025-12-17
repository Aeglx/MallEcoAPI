const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建项目...');

try {
  // 删除旧的构建目录
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('📁 删除旧的构建目录...');
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // 使用TypeScript编译器构建
  console.log('🔧 使用TypeScript编译器构建...');
  execSync('npx tsc --project tsconfig.build.json', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  // 检查构建是否成功
  if (fs.existsSync(distPath)) {
    console.log('✅ 构建成功！');
    
    // 列出构建的文件
    function listFiles(dir, prefix = '') {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          console.log(prefix + '📁 ' + file + '/');
          listFiles(fullPath, prefix + '  ');
        } else {
          console.log(prefix + '📄 ' + file);
        }
      });
    }
    
    console.log('\n📦 构建文件列表:');
    listFiles(distPath);
  } else {
    console.log('❌ 构建失败：未找到输出目录');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ 构建过程中出现错误:', error.message);
  process.exit(1);
}