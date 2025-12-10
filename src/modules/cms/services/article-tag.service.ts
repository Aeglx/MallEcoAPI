import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleTag } from '../entities/article-tag.entity';
import { CreateArticleTagDto } from '../dto/create-article-tag.dto';
import { UpdateArticleTagDto } from '../dto/update-article-tag.dto';

@Injectable()
export class ArticleTagService {
  constructor(
    @InjectRepository(ArticleTag)
    private readonly articleTagRepository: Repository<ArticleTag>,
  ) {}

  async create(createArticleTagDto: CreateArticleTagDto): Promise<ArticleTag> {
    const tag = this.articleTagRepository.create(createArticleTagDto);
    return await this.articleTagRepository.save(tag);
  }

  async findAll(): Promise<ArticleTag[]> {
    return await this.articleTagRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ArticleTag> {
    const tag = await this.articleTagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }
    return tag;
  }

  async update(id: number, updateArticleTagDto: UpdateArticleTagDto): Promise<ArticleTag> {
    const tag = await this.findOne(id);
    const updatedTag = this.articleTagRepository.merge(tag, updateArticleTagDto);
    return await this.articleTagRepository.save(updatedTag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.articleTagRepository.remove(tag);
  }

  async getArticlesByTag(id: number): Promise<any> {
    const tag = await this.articleTagRepository.findOne({
      where: { id },
      relations: ['articles'],
    });
    
    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }
    
    return {
      tag,
      articles: tag.articles,
      total: tag.articles.length,
    };
  }

  async batchCreate(createDtos: CreateArticleTagDto[]): Promise<ArticleTag[]> {
    const tags = this.articleTagRepository.create(createDtos);
    return await this.articleTagRepository.save(tags);
  }

  async findOrCreate(name: string): Promise<ArticleTag> {
    let tag = await this.articleTagRepository.findOne({ where: { name } });
    if (!tag) {
      tag = this.articleTagRepository.create({ name });
      tag = await this.articleTagRepository.save(tag);
    }
    return tag;
  }
}