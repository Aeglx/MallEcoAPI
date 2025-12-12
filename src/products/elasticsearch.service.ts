import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Product } from './entities/product.entity';

@Injectable()
export class ElasticsearchProductService implements OnModuleInit, OnModuleDestroy {
  private index = 'products';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    // 检查索引是否存在
    const indexExists = await this.elasticsearchService.indices.exists({ index: this.index } as any);
    
    if (!indexExists) {
      // 创建索引
      await this.elasticsearchService.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: {
                type: 'text',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart',
                fields: {
                  suggest: {
                    type: 'completion',
                    analyzer: 'ik_smart',
                    search_analyzer: 'ik_smart'
                  }
                }
              },
              description: { type: 'text', analyzer: 'ik_smart', search_analyzer: 'ik_smart' },
              details: { type: 'text', analyzer: 'ik_smart', search_analyzer: 'ik_smart' },
              categoryId: { type: 'keyword' },
              brandId: { type: 'keyword' },
              price: { type: 'double' },
              isShow: { type: 'integer' },
              isNew: { type: 'integer' },
              isHot: { type: 'integer' },
              recommend: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      } as any);
    }
  }

  async onModuleDestroy() {
    // 模块销毁时不需要删除索引
  }

  /**
   * 创建或更新商品索引
   */
  async indexProduct(product: Product): Promise<void> {
    await this.elasticsearchService.index({
      index: this.index,
      id: product.id,
      body: {
        ...product,
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date(product.updatedAt).toISOString(),
        // 添加搜索建议字段
        'name.suggest': product.name
      },
    } as any);
  }

  /**
   * 删除商品索引
   */
  async deleteProduct(productId: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: this.index,
      id: productId,
    } as any);
  }

  /**
   * 批量创建或更新商品索引
   */
  async bulkIndexProducts(products: Product[]): Promise<void> {
    if (!products || products.length === 0) {
      return;
    }

    const operations = [];
    for (const product of products) {
      operations.push({
        index: {
          _index: this.index,
          _id: product.id,
        },
      });
      operations.push({
        ...product,
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date(product.updatedAt).toISOString(),
        // 添加搜索建议字段
        'name.suggest': product.name
      });
    }

    await this.elasticsearchService.bulk({ body: operations } as any);
  }

  /**
   * 搜索商品
   */
  async search(params: any): Promise<{ data: any[], total: number }> {
    const { keyword, categoryId, brandId, minPrice, maxPrice, isShow, isNew, isHot, recommend, page = 1, limit = 10 } = params;

    const body = {
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      sort: [
        { sortOrder: { order: 'asc' } },
        { createdAt: { order: 'desc' } },
      ],
      from: (page - 1) * limit,
      size: limit,
    } as any;

    // 关键词搜索
    if (keyword) {
      body.query.bool.must.push({
        multi_match: {
          query: keyword,
          fields: ['name^3', 'description^2', 'details'],
          analyzer: 'ik_smart',
        },
      });
    }

    // 分类过滤
    if (categoryId) {
      body.query.bool.filter.push({
        term: { categoryId },
      });
    }

    // 品牌过滤
    if (brandId) {
      body.query.bool.filter.push({
        term: { brandId },
      });
    }

    // 价格范围过滤
    if (minPrice !== undefined && maxPrice !== undefined) {
      body.query.bool.filter.push({
        range: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      });
    } else if (minPrice !== undefined) {
      body.query.bool.filter.push({
        range: {
          price: {
            gte: minPrice,
          },
        },
      });
    } else if (maxPrice !== undefined) {
      body.query.bool.filter.push({
        range: {
          price: {
            lte: maxPrice,
          },
        },
      });
    }

    // 上架状态过滤
    if (isShow !== undefined) {
      body.query.bool.filter.push({
        term: { isShow },
      });
    }

    // 新品过滤
    if (isNew !== undefined) {
      body.query.bool.filter.push({
        term: { isNew },
      });
    }

    // 热门过滤
    if (isHot !== undefined) {
      body.query.bool.filter.push({
        term: { isHot },
      });
    }

    // 推荐过滤
    if (recommend !== undefined) {
      body.query.bool.filter.push({
        term: { recommend },
      });
    }

    // 默认过滤上架商品
    if (!isShow && isShow !== 0) {
      body.query.bool.filter.push({
        term: { isShow: 1 },
      });
    }

    // 执行搜索
    const response = await this.elasticsearchService.search({
      index: this.index,
      body,
    } as any);

    // 处理结果
    const hits = response.hits.hits;
    const data = hits.map(hit => ({
      ...(hit._source as any),
    }));

    return {
      data,
      total: typeof response.hits.total === 'number' ? response.hits.total : response.hits.total.value,
    };
  }

  /**
   * 初始化商品索引（用于将现有商品数据同步到Elasticsearch）
   */
  async initializeProductIndex(products: Product[]): Promise<void> {
    await this.bulkIndexProducts(products);
  }

  /**
   * 获取商品搜索建议
   */
  async getProductSuggestions(keyword: string, limit: number = 10): Promise<string[]> {
    const response = await this.elasticsearchService.search({
      index: this.index,
      body: {
        suggest: {
          product_suggestions: {
            prefix: keyword,
            completion: {
              field: 'name.suggest',
              size: limit,
              skip_duplicates: true
            }
          }
        }
      }
    } as any);

    if (response.suggest && response.suggest.product_suggestions) {
      const options = response.suggest.product_suggestions[0].options;
      // 确保options是数组
      const optionsArray = Array.isArray(options) ? options : [options];
      const suggestions = optionsArray.map((option: any) => option.text);
      return suggestions;
    }

    return [];
  }
}
