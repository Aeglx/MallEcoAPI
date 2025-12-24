import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct = {
    id: '1',
    name: '测试商品',
    description: '这是一个测试商品',
    price: 100,
    originalPrice: 150,
    stock: 10,
    sales: 0,
    mainImage: 'http://example.com/image.jpg',
    categoryId: 'category-1',
    brandId: 'brand-1',
    isShow: 1,
    isNew: 0,
    isHot: 0,
    recommend: 0,
    sortOrder: 0,
    specifications: {},
    details: '<p>商品详情</p>',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('应该返回商品列表', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(repository, 'find').mockResolvedValue(mockProducts);

      const result = await service.findAll();
      expect(result).toEqual({ data: mockProducts, total: mockProducts.length });
    });

    it('应该支持分页查询', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(repository, 'find').mockResolvedValue(mockProducts);

      const params = { page: 1, limit: 10 };
      const result = await service.findAll(params);
      expect(result).toEqual({ data: mockProducts, total: mockProducts.length });
    });
  });

  describe('findOne', () => {
    it('应该返回单个商品', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('商品不存在时应该返回null', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne('999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('应该创建新商品', async () => {
      const createDto = {
        name: '新商品',
        price: 200,
        stock: 20,
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockProduct as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockProduct);

      const result = await service.create(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('应该更新商品信息', async () => {
      const updateDto = { name: '更新后的商品' };
      const updatedProduct = { ...mockProduct, ...updateDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('应该删除商品', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockProduct);
      jest.spyOn(repository, 'delete').mockResolvedValue({} as any);

      await expect(service.remove('1')).resolves.not.toThrow();
    });
  });
});