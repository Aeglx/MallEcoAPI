const fs = require('fs');
const path = require('path');

// 读取文件内容
const filePath = path.join(__dirname, 'modules', 'client', 'buyer', 'wallet', 'wallet.controller.ts');
const content = fs.readFileSync(filePath, 'utf8');

// 替换所有的Response<any>为ResponseModel<any>
let fixedContent = content.replace(/Promise<Response<any>>/g, 'Promise<ResponseModel<any>>');

// 替换所有的ResponseUtil.success(result)为正确的响应格式
fixedContent = fixedContent.replace(/return ResponseUtil.success\(([^)]+)\);/g, (match, result) => {
  return `return {
      code: 200,
      message: '获取成功',
      data: ${result},
      timestamp: Date.now(),
      traceId: '',
    };`;
});

// 替换其他可能的ResponseUtil.success调用（带不同消息）
fixedContent = fixedContent.replace(/return ResponseUtil.success\(([^,]+),\s*'([^']+)'\);/g, (match, result, message) => {
  return `return {
      code: 200,
      message: '${message}',
      data: ${result},
      timestamp: Date.now(),
      traceId: '',
    };`;
});

// 写入修复后的内容
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('修复完成！');
