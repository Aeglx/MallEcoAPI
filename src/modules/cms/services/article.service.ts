import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Article, ArticleStatus, ArticleType } from '../entities/article.entity';
import { ArticleCategory } from '../entities/article-category.entity';
import { ArticleTag } from '../entities/article-tag.entity';

interface ArticleSearchParams {
  title?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: ArticleStatus;
  type?: ArticleType;
  author?: string;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface CreateArticleDto {
  title: string;
  summary?: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  type?: ArticleType;
  author?: string;
  source?: string;
  isFeatured?: boolean;
  allowComments?: boolean;
  scheduledPublishTime?: Date;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  slug?: string;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleCategory)
    private readonly categoryRepository: Repository<ArticleCategory>,
    @InjectRepository(ArticleTag)
    private readonly tagRepository: Repository<ArticleTag>,
  ) {}

  /**
   * 创建文章
   */
  async createArticle(createDto: CreateArticleDto, userId?: string): Promise<Article> {
    const article = this.articleRepository.create({
      ...createDto,
      status: ArticleStatus.DRAFT,
      createdBy: userId,
    });

    // 处理分类
    if (createDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createDto.categoryId },
      });
      if (category) {
        article.category = category;
      }
    }

    // 处理标签
    if (createDto.tagIds && createDto.tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: { id: In(createDto.tagIds) },
      });
      article.tags = tags;
    }

    return await this.articleRepository.save(article);
  }

  /**
   * 获取文章详情
   */
  async getArticleById(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id, deleteTime: null },
      relations: ['category', 'tags', 'comments'],
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return article;
  }

  /**
   * 获取文章列表
   */
  async getArticles(searchParams: ArticleSearchParams): Promise<{
    items: Article[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const {
      title,
      categoryId,
      tagIds,
      status,
      type,
      author,
      isFeatured,
      startDate,
      endDate,
      page = 1,
      size = 10,
      sortBy = 'createTime',
      sortOrder = 'DESC',
    } = searchParams;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.deleteTime IS NULL');

    if (title) {
      queryBuilder.andWhere('article.title LIKE :title', { title: `%${title}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder
        .innerJoin('article.tags', 'tag', 'tag.id IN (:...tagIds)', { tagIds })
        .andWhere('tag.id IN (:...tagIds)', { tagIds });
    }

    if (status) {
      queryBuilder.andWhere('article.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('article.type = :type', { type });
    }

    if (author) {
      queryBuilder.andWhere('article.author LIKE :author', { author: `%${author}%` });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('article.isFeatured = :isFeatured', { isFeatured });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'article.createTime BETWEEN :startDate AND :endDate',
        { startDate, endDate }
      );
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy(`article.${sortBy}`, sortOrder)
      .skip((page - 1) * size)
      .take(size);

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 更新文章
   */
  async updateArticle(id: string, updateData: Partial<CreateArticleDto>, userId?: string): Promise<Article> {
    const article = await this.getArticleById(id);

    // 更新基本字段
    Object.assign(article, updateData);
    article.updatedBy = userId;
    article.updateTime = new Date();

    // 处理分类
    if (updateData.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateData.categoryId },
      });
      if (category) {
        article.category = category;
      }
    }

    // 处理标签
    if (updateData.tagIds) {
      const tags = await this.tagRepository.find({
        where: { id: In(updateData.tagIds) },
      });
      article.tags = tags;
    }

    return await this.articleRepository.save(article);
  }

  /**
   * 删除文章
   */
  async deleteArticle(id: string): Promise<void> {
    const article = await this.getArticleById(id);
    article.deleteTime = new Date();
    await this.articleRepository.save(article);
  }

  /**
   * 发布文章
   */
  async publishArticle(id: string): Promise<Article> {
    const article = await this.getArticleById(id);
    
    article.status = ArticleStatus.PUBLISHED;
    article.publishTime = new Date();

    return await this.articleRepository.save(article);
  }

  /**
   * 取消发布文章
   */
  async unpublishArticle(id: string): Promise<Article> {
    const article = await this.getArticleById(id);
    
    article.status = ArticleStatus.DRAFT;
    article.publishTime = null;

    return await this.articleRepository.save(article);
  }

  /**
   * 增加文章浏览量
   */
  async increaseViewCount(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'viewCount', 1);
  }

  /**
   * 增加文章点赞数
   */
  async increaseLikeCount(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'likeCount', 1);
  }

  /**
   * 获取热门文章
   */
  async getHotArticles(limit: number = 10): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { 
        status: ArticleStatus.PUBLISHED,
        deleteTime: null 
      },
      order: { viewCount: 'DESC', likeCount: 'DESC' },
      take: limit,
      relations: ['category', 'tags'],
    });
  }

  /**
   * 获取推荐文章
   */
  async getFeaturedArticles(limit: number = 10): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { 
        status: ArticleStatus.PUBLISHED,
        isFeatured: true,
        deleteTime: null 
      },
      order: { publishTime: 'DESC' },
      take: limit,
      relations: ['category', 'tags'],
    });
  }

  /**
   * 搜索文章
   */
  async searchArticles(keyword: string, page: number = 1, size: number = 10): Promise<{
    items: Article[];
    total: number;
    page: number;
    size: number;
  }> {
    const [items, total] = await this.articleRepository.findAndCount({
      where: [
        { title: Like(`%${keyword}%`) },
        { summary: Like(`%${keyword}%`) },
        { content: Like(`%${keyword}%`) }
      ],
      relations: ['category', 'tags'],
      order: { createTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items,
      total,
      page,
      size,
    };
  }
}