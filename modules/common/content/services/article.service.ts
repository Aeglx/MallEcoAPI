import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
    return await this.articleRepository.save(article);
  }

  async findAll(paginationDto: PaginationDto, filters?: any): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.status = :status', { status: 'published' });

    if (filters?.categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.tagIds && filters.tagIds.length > 0) {
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds: filters.tagIds });
    }

    if (filters?.keyword) {
      queryBuilder.andWhere('(article.title LIKE :keyword OR article.content LIKE :keyword)', {
        keyword: `%${filters.keyword}%`,
      });
    }

    if (filters?.isTop !== undefined) {
      queryBuilder.andWhere('article.isTop = :isTop', { isTop: filters.isTop });
    }

    if (filters?.isRecommend !== undefined) {
      queryBuilder.andWhere('article.isRecommend = :isRecommend', { isRecommend: filters.isRecommend });
    }

    queryBuilder.orderBy('article.isTop', 'DESC')
      .addOrderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'comments', 'attachments'],
    });

    if (!article) {
      throw new NotFoundException(`文章 #${id} 不存在`);
    }

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);
    
    if (updateArticleDto.status === 'published' && !article.publishedAt) {
      updateArticleDto.publishedAt = new Date();
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.articleRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementLikeCount(id: number): Promise<void> {
    await this.articleRepository.increment({ id }, 'likeCount', 1);
  }

  async decrementLikeCount(id: number): Promise<void> {
    await this.articleRepository.decrement({ id }, 'likeCount', 1);
  }

  async getTopArticles(limit: number = 5): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { isTop: true, status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getRecommendArticles(limit: number = 10): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { isRecommend: true, status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async getArticleStatistics(): Promise<any> {
    const total = await this.articleRepository.count();
    const published = await this.articleRepository.count({ where: { status: 'published' } });
    const draft = await this.articleRepository.count({ where: { status: 'draft' } });
    const pending = await this.articleRepository.count({ where: { status: 'pending' } });

    const totalViews = await this.articleRepository.createQueryBuilder('article')
      .select('SUM(article.viewCount)', 'totalViews')
      .getRawOne();

    return {
      total,
      published,
      draft,
      pending,
      totalViews: parseInt(totalViews.totalViews) || 0,
    };
  }

  // 买家端方法
  async findPublished(paginationDto: PaginationDto, filters?: any): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.status = :status', { status: 'published' });

    if (filters?.categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.tagId) {
      queryBuilder.andWhere('tags.id = :tagId', { tagId: filters.tagId });
    }

    if (filters?.keyword) {
      queryBuilder.andWhere('(article.title LIKE :keyword OR article.content LIKE :keyword)', {
        keyword: `%${filters.keyword}%`,
      });
    }

    queryBuilder.orderBy('article.isTop', 'DESC')
      .addOrderBy('article.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  async findPublishedOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id, status: 'published' },
      relations: ['category', 'tags', 'comments', 'attachments'],
    });

    if (!article) {
      throw new NotFoundException(`文章 #${id} 不存在或未发布`);
    }

    // 增加阅读量
    await this.incrementViewCount(id);

    return article;
  }

  async like(id: number): Promise<Article> {
    await this.incrementLikeCount(id);
    return await this.findOne(id);
  }

  async share(id: number): Promise<Article> {
    await this.articleRepository.increment({ id }, 'shareCount', 1);
    return await this.findOne(id);
  }

  async search(keyword: string, paginationDto: PaginationDto): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    return await this.articleRepository.findAndCount({
      where: [
        { title: Like(`%${keyword}%`), status: 'published' },
        { content: Like(`%${keyword}%`), status: 'published' },
        { summary: Like(`%${keyword}%`), status: 'published' },
      ],
      relations: ['category', 'tags'],
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async findHot(limit: number = 10): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { status: 'published' },
      order: { viewCount: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  async findRecommended(limit: number = 10): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { isRecommend: true, status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  async findAllTags(): Promise<any[]> {
    // 这里需要实现标签查询逻辑
    return [];
  }

  async findByCategory(categoryId: number, paginationDto: PaginationDto): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    return await this.articleRepository.findAndCount({
      where: { categoryId, status: 'published' },
      relations: ['category', 'tags'],
      order: { publishedAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async findByTag(tagId: number, paginationDto: PaginationDto): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoin('article.tags', 'tag')
      .where('tag.id = :tagId', { tagId })
      .andWhere('article.status = :status', { status: 'published' })
      .leftJoinAndSelect('article.category', 'category')
      .orderBy('article.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  // 卖家端方法
  async findByStore(storeId: number, paginationDto: PaginationDto, filters?: any): Promise<[Article[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.storeId = :storeId', { storeId });

    if (filters?.status) {
      queryBuilder.andWhere('article.status = :status', { status: filters.status });
    }

    if (filters?.categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.keyword) {
      queryBuilder.andWhere('(article.title LIKE :keyword OR article.content LIKE :keyword)', {
        keyword: `%${filters.keyword}%`,
      });
    }

    queryBuilder.orderBy('article.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  async findOneByStore(id: number, storeId: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id, storeId },
      relations: ['category', 'tags', 'comments', 'attachments'],
    });

    if (!article) {
      throw new NotFoundException(`文章 #${id} 不存在`);
    }

    return article;
  }

  async updateByStore(id: number, storeId: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOneByStore(id, storeId);
    
    if (updateArticleDto.status === 'published' && !article.publishedAt) {
      updateArticleDto.publishedAt = new Date();
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async removeByStore(id: number, storeId: number): Promise<void> {
    const article = await this.findOneByStore(id, storeId);
    await this.articleRepository.remove(article);
  }

  async publishByStore(id: number, storeId: number): Promise<Article> {
    return await this.updateByStore(id, storeId, { status: 'published' });
  }

  async unpublishByStore(id: number, storeId: number): Promise<Article> {
    return await this.updateByStore(id, storeId, { status: 'draft' });
  }

  async getArticleStatisticsByStore(storeId: number): Promise<any> {
    const total = await this.articleRepository.count({ where: { storeId } });
    const published = await this.articleRepository.count({ where: { storeId, status: 'published' } });
    const draft = await this.articleRepository.count({ where: { storeId, status: 'draft' } });
    const pending = await this.articleRepository.count({ where: { storeId, status: 'pending' } });

    const totalViews = await this.articleRepository.createQueryBuilder('article')
      .select('SUM(article.viewCount)', 'totalViews')
      .where('article.storeId = :storeId', { storeId })
      .getRawOne();

    return {
      total,
      published,
      draft,
      pending,
      totalViews: parseInt(totalViews.totalViews) || 0,
    };
  }
}