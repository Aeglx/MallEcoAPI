import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
  ) {}

  // 文章相关方法
  async createArticle(createArticleDto: CreateArticleDto): Promise<Article> {
    const { categoryId, tagIds, ...articleData } = createArticleDto;
    const article = this.articleRepository.create(articleData);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('分类不存在');
      }
      article.category = category;
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.findByIds(tagIds);
      article.tags = tags;
    }

    return await this.articleRepository.save(article);
  }

  async getArticles(paginationDto: PaginationDto): Promise<{ articles: Article[]; total: number }> {
    const { page, pageSize, keyword } = paginationDto;
    const query = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .orderBy('article.createdAt', 'DESC');

    if (keyword) {
      query.where('article.title LIKE :keyword OR article.content LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [articles, total] = await query.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { articles, total };
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    return article;
  }

  async updateArticle(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.getArticleById(id);
    const { categoryId, tagIds, ...articleData } = updateArticleDto;

    Object.assign(article, articleData);

    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new NotFoundException('分类不存在');
        }
        article.category = category;
      } else {
        article.category = null;
      }
    }

    if (tagIds !== undefined) {
      if (tagIds && tagIds.length > 0) {
        const tags = await this.tagRepository.findByIds(tagIds);
        article.tags = tags;
      } else {
        article.tags = [];
      }
    }

    return await this.articleRepository.save(article);
  }

  async deleteArticle(id: string): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('文章不存在');
    }
  }

  // 分类相关方法
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async getCategories(paginationDto: PaginationDto): Promise<{ categories: Category[]; total: number }> {
    const { page, pageSize, keyword } = paginationDto;
    const query = this.categoryRepository.createQueryBuilder('category')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.createdAt', 'DESC');

    if (keyword) {
      query.where('category.categoryName LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [categories, total] = await query.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { categories, total };
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getCategoryById(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const articles = await this.articleRepository.find({ where: { category: { id } } });
    if (articles.length > 0) {
      throw new ConflictException('该分类下有文章，无法删除');
    }

    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('分类不存在');
    }
  }

  // 标签相关方法
  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({ where: { tagName: createTagDto.tagName } });
    if (existingTag) {
      throw new ConflictException('标签名称已存在');
    }

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async getTags(paginationDto: PaginationDto): Promise<{ tags: Tag[]; total: number }> {
    const { page, pageSize, keyword } = paginationDto;
    const query = this.tagRepository.createQueryBuilder('tag')
      .orderBy('tag.createdAt', 'DESC');

    if (keyword) {
      query.where('tag.tagName LIKE :keyword OR tag.description LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [tags, total] = await query.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { tags, total };
  }

  async getTagById(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }
    return tag;
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.getTagById(id);
    
    if (updateTagDto.tagName && updateTagDto.tagName !== tag.tagName) {
      const existingTag = await this.tagRepository.findOne({ where: { tagName: updateTagDto.tagName } });
      if (existingTag) {
        throw new ConflictException('标签名称已存在');
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.getTagById(id);
    await this.tagRepository.remove(tag);
  }
}
