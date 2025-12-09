// 订单号生成器

/**
 * 生成订单号
 * 格式：年(4位)+月(2位)+日(2位)+时(2位)+分(2位)+秒(2位)+毫秒(3位)+随机数(4位)
 * 总共19位
 */
export function generateOrderSn(): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  const millisecond = now.getMilliseconds().toString().padStart(3, '0');
  const random = Math.floor(1000 + Math.random() * 9000).toString(); // 4位随机数
  
  return year + month + day + hour + minute + second + millisecond + random;
}

/**
 * 验证订单号格式
 */
export function validateOrderSn(orderSn: string): boolean {
  if (!orderSn || orderSn.length !== 19) {
    return false;
  }
  
  // 检查是否全为数字
  return /^\d+$/.test(orderSn);
}
