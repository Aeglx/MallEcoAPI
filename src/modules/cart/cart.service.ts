import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  // 使用内存数组模拟购物车数据存储
  private readonly carts: Cart[] = [];

  /**
   * 获取用户购物车列表
   */
  async findByUserId(userId: string): Promise<Cart[]> {
    return this.carts.filter(cart => cart.userId === userId && cart.isDel === 0);
  }

  /**
   * 根据ID获取购物车商品
   */
  async findById(id: string): Promise<Cart | null> {
    return this.carts.find(cart => cart.id === id && cart.isDel === 0) || null;
  }

  /**
   * 添加商品到购物车
   */
  async addItem(userId: string, addCartItemDto: AddCartItemDto): Promise<Cart> {
    // 检查商品是否已在购物车中
    const existingItem = this.carts.find(
      cart => cart.userId === userId && cart.productId === addCartItemDto.productId && cart.isDel === 0
    );

    if (existingItem) {
      // 商品已存在，更新数量
      existingItem.quantity += addCartItemDto.quantity;
      existingItem.updateTime = new Date();
      return existingItem;
    }

    // 创建新的购物车商品
    const newItem: Cart = {
      id: Date.now().toString(),
      userId,
      productId: addCartItemDto.productId,
      quantity: addCartItemDto.quantity,
      price: addCartItemDto.price,
      discount: addCartItemDto.discount || 0,
      product_name: addCartItemDto.productName || '',
      product_image: addCartItemDto.productImage || '',
      product_attributes: addCartItemDto.productAttributes || {},
      selected: 1,
      createTime: new Date(),
      updateTime: new Date(),
      isDel: 0,
    } as Cart;

    this.carts.push(newItem);
    return newItem;
  }

  /**
   * 更新购物车商品
   */
  async updateItem(id: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cartIndex = this.carts.findIndex(cart => cart.id === id && cart.isDel === 0);

    if (cartIndex === -1) {
      throw new NotFoundException('购物车商品不存在');
    }

    const cart = this.carts[cartIndex];

    // 更新字段
    if (updateCartItemDto.quantity !== undefined) {
      cart.quantity = updateCartItemDto.quantity;
    }

    if (updateCartItemDto.selected !== undefined) {
      cart.selected = updateCartItemDto.selected ? 1 : 0;
    }

    cart.updateTime = new Date();
    this.carts[cartIndex] = cart;

    return cart;
  }

  /**
   * 批量更新购物车商品选中状态
   */
  async updateItemsSelected(userId: string, selected: boolean, ids?: string[]): Promise<void> {
    const filterCondition = ids
      ? { id: (item: Cart) => ids.includes(item.id) }
      : { userId: (item: Cart) => item.userId === userId };

    this.carts.forEach((cart, index) => {
      if (cart.isDel === 0 && cart.userId === userId) {
        const shouldUpdate = ids
          ? ids.includes(cart.id)
          : true;

        if (shouldUpdate) {
          this.carts[index] = {
            ...cart,
            selected: selected ? 1 : 0,
            updateTime: new Date(),
          };
        }
      }
    });
  }

  /**
   * 删除购物车商品
   */
  async removeItem(id: string): Promise<void> {
    const cartIndex = this.carts.findIndex(cart => cart.id === id && cart.isDel === 0);

    if (cartIndex === -1) {
      throw new NotFoundException('购物车商品不存在');
    }

    // 使用软删除
    this.carts[cartIndex] = {
      ...this.carts[cartIndex],
      isDel: 1,
      updateTime: new Date(),
    };
  }

  /**
   * 批量删除购物车商品
   */
  async removeItems(ids: string[]): Promise<void> {
    this.carts.forEach((cart, index) => {
      if (ids.includes(cart.id) && cart.isDel === 0) {
        this.carts[index] = {
          ...cart,
          isDel: 1,
          updateTime: new Date(),
        };
      }
    });
  }

  /**
   * 清空购物车
   */
  async clearCart(userId: string): Promise<void> {
    this.carts.forEach((cart, index) => {
      if (cart.userId === userId && cart.isDel === 0) {
        this.carts[index] = {
          ...cart,
          isDel: 1,
          updateTime: new Date(),
        };
      }
    });
  }

  /**
   * 获取购物车统计信息
   */
  async getCartStatistics(userId: string): Promise<{
    totalItems: number;
    totalPrice: number;
    selectedItems: number;
    selectedPrice: number;
  }> {
    const userCart = this.carts.filter(cart => cart.userId === userId && cart.isDel === 0);

    const totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = userCart.reduce(
      (sum, item) => sum + (item.price - item.discount) * item.quantity,
      0
    );

    const selectedItems = userCart
      .filter(item => item.selected === 1)
      .reduce((sum, item) => sum + item.quantity, 0);

    const selectedPrice = userCart
      .filter(item => item.selected === 1)
      .reduce((sum, item) => sum + (item.price - item.discount) * item.quantity, 0);

    return {
      totalItems,
      totalPrice,
      selectedItems,
      selectedPrice,
    };
  }
}
