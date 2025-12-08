import { Injectable } from '@nestjs/common';

@Injectable()
export class StatisticsService {
  // 模拟产品数据
  private products = [
    { id: 1, name: '产品1', price: 100, stock: 100, sales: 50, isShow: 1, isNew: 1, isHot: 1, createdAt: new Date() },
    { id: 2, name: '产品2', price: 200, stock: 200, sales: 20, isShow: 1, isNew: 0, isHot: 1, createdAt: new Date() },
    { id: 3, name: '产品3', price: 300, stock: 300, sales: 0, isShow: 0, isNew: 1, isHot: 0, createdAt: new Date() },
    { id: 4, name: '产品4', price: 400, stock: 400, sales: 100, isShow: 1, isNew: 1, isHot: 1, createdAt: new Date() },
    { id: 5, name: '产品5', price: 500, stock: 500, sales: 10, isShow: 1, isNew: 0, isHot: 0, createdAt: new Date() },
  ];

  /**
   * 获取商品销售统计
   */
  async getProductStatistics() {
    const totalProducts = this.products.length;
    const totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);
    const totalSales = this.products.reduce((sum, p) => sum + p.sales, 0);
    const avgPrice = this.products.reduce((sum, p) => sum + p.price, 0) / totalProducts || 0;

    return {
      totalProducts,
      totalStock,
      totalSales,
      avgPrice,
    };
  }

  /**
   * 获取热门商品
   */
  async getHotProducts(limit: number = 10) {
    return [...this.products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  /**
   * 获取滞销商品
   */
  async getUnsoldProducts(limit: number = 10) {
    return [...this.products]
      .filter(p => p.sales === 0 && p.stock >= 1)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * 获取系统概览数据
   */
  async getSystemOverview() {
    const productStats = await this.getProductStatistics();
    
    return {
      ...productStats,
      activeProducts: this.products.filter(p => p.isShow === 1).length,
      newProducts: this.products.filter(p => p.isNew === 1).length,
      hotProducts: this.products.filter(p => p.isHot === 1).length,
    };
  }
}
