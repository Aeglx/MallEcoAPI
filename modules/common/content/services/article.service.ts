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
}