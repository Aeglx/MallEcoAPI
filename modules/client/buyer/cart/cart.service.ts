import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto, UpdateCartSelectedDto } from './dto/update-cart.dto';
import { ProductSku } from '../../common/product/entities/product-sku.entity';
import { Product } from '../../common/product/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(ProductSku) private readonly skuRepository: Repository<ProductSku>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 添加商品到购物车
   * @param userId 用户ID
   * @param addToCartDto 添加购物车DTO
   * @returns 添加结果
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    // 检查商品SKU是否存在
    const sku = await this.skuRepository.findOne({ 
      where: { id: addToCartDto.skuId } as any,
      relations: ['product'],
    });
    if (!sku) {
      throw new NotFoundException(`Product SKU with ID ${addToCartDto.skuId} not found`);
    }

    // 检查商品是否上�?
    const product = await this.productRepository.findOne({ 
      where: { id: sku.productId } as any,
    });
    if (!product || !product.isShow) {
      throw new ConflictException('This product is not available');
    }

    // 检查购物车中是否已存在该商�?
    const existingCartItem = await this.cartRepository.findOne({ 
      where: { userId, skuId: addToCartDto.skuId } as any,
    });

    if (existingCartItem) {
      // 如果已存在，则增加数�?
      existingCartItem.quantity += addToCartDto.quantity;
      return await this.cartRepository.save(existingCartItem);
    } else {
      // 如果不存在，则创建新的购物车�?
      const cartItem = this.cartRepository.create({
        userId,
        ...addToCartDto,
      });
      return await this.cartRepository.save(cartItem);
    }
  }

  /**
   * 获取购物车列�?
   * @param userId 用户ID
   * @returns 购物车列�?
   */
  async getCartList(userId: string): Promise<any> {
    const cartItems = await this.cartRepository.find({
      where: { userId } as any,
      relations: ['sku'],
    });

    // 获取购物车商品的详细信息
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const sku = await this.skuRepository.findOne({ 
          where: { id: item.skuId } as any,
          relations: ['product'],
        });
        const product = await this.productRepository.findOne({ 
          where: { id: sku.productId } as any,
        });

        return {
          id: item.id,
          skuId: item.skuId,
          quantity: item.quantity,
          selected: item.selected,
          sku: {
            id: sku.id,
            name: sku.skuCode,
            price: sku.price,
            stock: sku.stock,
            attributes: sku.specValues,
          },
          product: {
            id: product.id,
            name: product.name,
            images: product.mainImage ? [product.mainImage, ...(product.galleryImages || [])] : [],
            brandId: product.brandId,
            categoryId: product.categoryId,
          },
        };
      })
    );

    // 计算购物车总金�?
    const totalAmount = itemsWithDetails
      .filter((item) => item.selected)
      .reduce((total, item) => total + (item.sku.price * item.quantity), 0);

    return {
      items: itemsWithDetails,
      totalAmount,
      totalItems: itemsWithDetails.length,
      selectedItems: itemsWithDetails.filter((item) => item.selected).length,
    };
  }

  /**
   * 更新购物车商�?
   * @param userId 用户ID
   * @param updateCartDto 更新购物车DTO
   * @returns 更新结果
   */
  async updateCart(userId: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    // 检查购物车项是否存在且属于当前用户
    const cartItem = await this.cartRepository.findOne({
      where: { id: updateCartDto.id, userId } as any,
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // 更新购物车项
    if (updateCartDto.quantity !== undefined) {
      cartItem.quantity = updateCartDto.quantity;
    }
    if (updateCartDto.selected !== undefined) {
      cartItem.selected = updateCartDto.selected;
    }

    return await this.cartRepository.save(cartItem);
  }

  /**
   * 更新购物车商品选中状�?
   * @param userId 用户ID
   * @param updateCartSelectedDto 更新购物车选中状态DTO
   * @returns 更新结果
   */
  async updateCartSelected(userId: string, updateCartSelectedDto: UpdateCartSelectedDto): Promise<void> {
    const { selected, ids } = updateCartSelectedDto;
    
    if (ids && ids.length > 0) {
      // 更新指定ID的购物车商品的选中状�?
      await this.cartRepository.update(
        { userId, id: In(ids) } as any,
        { selected }
      );
    } else {
      // 更新所有购物车商品的选中状�?
      await this.cartRepository.update(
        { userId } as any,
        { selected }
      );
    }
  }

  /**
   * 删除购物车商�?
   * @param userId 用户ID
   * @param id 购物车商品ID
   * @returns 删除结果
   */
  async removeFromCart(userId: string, id: string): Promise<void> {
    // 检查购物车项是否存在且属于当前用户
    const cartItem = await this.cartRepository.findOne({
      where: { id, userId } as any,
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  /**
   * 批量删除购物车商�?
   * @param userId 用户ID
   * @param ids 购物车商品ID列表
   * @returns 删除结果
   */
  async batchRemoveFromCart(userId: string, ids: string[]): Promise<void> {
    await this.cartRepository.delete({
      userId,
      id: In(ids),
    } as any);
  }

  /**
   * 清空购物�?
   * @param userId 用户ID
   * @returns 清空结果
   */
  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId } as any);
  }
}

