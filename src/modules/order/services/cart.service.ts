import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { CartEntity } from '../entities';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  // 添加商品到购物车
  async addToCart(cartData: Partial<CartEntity>) {
    // 检查商品是否已在购物车中
    const existingItem = await this.cartRepository.findOne({
      where: {
        memberId: cartData.memberId,
        goodsId: cartData.goodsId,
        skuId: cartData.skuId,
        status: 'ACTIVE',
      },
    });

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.goodsNum + (cartData.goodsNum || 1);
      const newTotalPrice = existingItem.goodsPrice * newQuantity;
      
      await this.cartRepository.update(existingItem.id, {
        goodsNum: newQuantity,
        totalPrice: newTotalPrice,
        updatedAt: new Date(),
      });

      return await this.cartRepository.findOne({ where: { id: existingItem.id } });
    } else {
      // 新增购物车项
      const cart = this.cartRepository.create(cartData);
      cart.status = 'ACTIVE';
      cart.selectedAt = new Date();
      cart.totalPrice = (cart.goodsPrice || 0) * (cart.goodsNum || 1);
      return await this.cartRepository.save(cart);
    }
  }

  // 获取用户购物车列表
  async getCartItems(memberId: string, status: string = 'ACTIVE') {
    return await this.cartRepository.find({
      where: { memberId, status },
      order: { createdAt: 'DESC' },
    });
  }

  // 更新购物车商品数量
  async updateCartItemQuantity(cartId: string, memberId: string, quantity: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, memberId },
    });

    if (!cartItem) {
      throw new Error('购物车商品不存在');
    }

    if (quantity <= 0) {
      throw new Error('商品数量必须大于0');
    }

    const newTotalPrice = cartItem.goodsPrice * quantity;
    
    await this.cartRepository.update(cartId, {
      goodsNum: quantity,
      totalPrice: newTotalPrice,
      updatedAt: new Date(),
    });

    return await this.cartRepository.findOne({ where: { id: cartId } });
  }

  // 删除购物车商品
  async removeCartItem(cartId: string, memberId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, memberId },
    });

    if (!cartItem) {
      throw new Error('购物车商品不存在');
    }

    await this.cartRepository.update(cartId, {
      status: 'DELETED',
      updatedAt: new Date(),
    });

    return { success: true, message: '商品已从购物车移除' };
  }

  // 批量删除购物车商品
  async removeCartItems(cartIds: string[], memberId: string) {
    const result = await this.cartRepository
      .createQueryBuilder()
      .update(CartEntity)
      .set({ status: 'DELETED', updatedAt: new Date() })
      .where('id IN (:...cartIds) AND memberId = :memberId', { cartIds, memberId })
      .execute();

    return { 
      success: true, 
      affected: result.affected,
      message: `已移除${result.affected}个商品` 
    };
  }

  // 清空购物车
  async clearCart(memberId: string) {
    const result = await this.cartRepository
      .createQueryBuilder()
      .update(CartEntity)
      .set({ status: 'DELETED', updatedAt: new Date() })
      .where('memberId = :memberId AND status = :status', { memberId, status: 'ACTIVE' })
      .execute();

    return { 
      success: true, 
      affected: result.affected,
      message: '购物车已清空' 
    };
  }

  // 选中/取消选中购物车商品
  async selectCartItem(cartId: string, memberId: string, selected: boolean) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, memberId },
    });

    if (!cartItem) {
      throw new Error('购物车商品不存在');
    }

    await this.cartRepository.update(cartId, {
      selectedAt: selected ? new Date() : null,
      updatedAt: new Date(),
    });

    return await this.cartRepository.findOne({ where: { id: cartId } });
  }

  // 全选/取消全选购物车商品
  async selectAllCartItems(memberId: string, selected: boolean) {
    const updateData = {
      selectedAt: selected ? new Date() : null,
      updatedAt: new Date(),
    };

    const result = await this.cartRepository
      .createQueryBuilder()
      .update(CartEntity)
      .set(updateData)
      .where('memberId = :memberId AND status = :status', { memberId, status: 'ACTIVE' })
      .execute();

    return { 
      success: true, 
      affected: result.affected,
      message: `已${selected ? '选中' : '取消选中'}${result.affected}个商品` 
    };
  }

  // 获取选中的购物车商品
  async getSelectedCartItems(memberId: string) {
    return await this.cartRepository.find({
      where: { 
        memberId, 
        status: 'ACTIVE',
        selectedAt: { $ne: null } as any,
      },
      order: { selectedAt: 'DESC' },
    });
  }

  // 获取购物车统计信息
  async getCartStatistics(memberId: string) {
    const stats = await this.cartRepository
      .createQueryBuilder('cart')
      .select('COUNT(*)', 'totalItems')
      .addSelect('SUM(cart.goodsNum)', 'totalQuantity')
      .addSelect('SUM(cart.totalPrice)', 'totalAmount')
      .where('cart.memberId = :memberId AND cart.status = :status', { 
        memberId, 
        status: 'ACTIVE' 
      })
      .getRawOne();

    const selectedStats = await this.cartRepository
      .createQueryBuilder('cart')
      .select('COUNT(*)', 'selectedItems')
      .addSelect('SUM(cart.goodsNum)', 'selectedQuantity')
      .addSelect('SUM(cart.totalPrice)', 'selectedAmount')
      .where('cart.memberId = :memberId AND cart.status = :status AND cart.selectedAt IS NOT NULL', { 
        memberId, 
        status: 'ACTIVE' 
      })
      .getRawOne();

    return {
      total: {
        items: parseInt(stats.totalItems) || 0,
        quantity: parseInt(stats.totalQuantity) || 0,
        amount: parseFloat(stats.totalAmount) || 0,
      },
      selected: {
        items: parseInt(selectedStats.selectedItems) || 0,
        quantity: parseInt(selectedStats.selectedQuantity) || 0,
        amount: parseFloat(selectedStats.selectedAmount) || 0,
      },
    };
  }

  // 检查购物车商品库存
  async checkCartStock(memberId: string) {
    const cartItems = await this.getCartItems(memberId);
    const outOfStockItems = [];

    for (const item of cartItems) {
      // 这里应该调用商品服务检查实际库存
      // 暂时用模拟数据
      const availableStock = item.skuStock || 100;
      
      if (item.goodsNum > availableStock) {
        outOfStockItems.push({
          cartId: item.id,
          goodsId: item.goodsId,
          goodsName: item.goodsName,
          requestedQuantity: item.goodsNum,
          availableStock,
          shortage: item.goodsNum - availableStock,
        });
      }
    }

    return {
      hasStockIssue: outOfStockItems.length > 0,
      outOfStockItems,
    };
  }

  // 获取购物车商品用于结算
  async getCartItemsForCheckout(memberId: string, cartIds?: string[]) {
    const whereConditions: any = {
      memberId,
      status: 'ACTIVE',
    };

    if (cartIds && cartIds.length > 0) {
      whereConditions.id = { $in: cartIds } as any;
    } else {
      whereConditions.selectedAt = { $ne: null } as any;
    }

    return await this.cartRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
    });
  }

  // 合并购物车（用于登录后合并游客购物车）
  async mergeCart(memberId: string, guestCartItems: Partial<CartEntity>[]) {
    const mergedItems = [];

    for (const guestItem of guestCartItems) {
      try {
        const mergedItem = await this.addToCart({
          ...guestItem,
          memberId,
        });
        mergedItems.push(mergedItem);
      } catch (error) {
        // 忽略合并过程中的错误，继续处理其他商品
        console.error(`Failed to merge cart item: ${guestItem.goodsId}`, error);
      }
    }

    return mergedItems;
  }

  // 更新购物车商品价格（用于价格变动时同步）
  async updateCartItemPrice(cartId: string, newPrice: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cartItem) {
      throw new Error('购物车商品不存在');
    }

    const newTotalPrice = newPrice * cartItem.goodsNum;

    await this.cartRepository.update(cartId, {
      goodsPrice: newPrice,
      skuPrice: newPrice,
      totalPrice: newTotalPrice,
      updatedAt: new Date(),
    });

    return await this.cartRepository.findOne({ where: { id: cartId } });
  }
}