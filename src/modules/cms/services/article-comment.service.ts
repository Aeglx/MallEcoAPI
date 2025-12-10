import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleComment } from '../entities/article-comment.entity';

@Injectable()
export class ArticleCommentService {
  constructor(
    @InjectRepository(ArticleComment)
    private readonly articleCommentRepository: Repository<ArticleComment>,
  ) {}

  async findAll(): Promise<ArticleComment[]> {
    return await this.articleCommentRepository.find({
      relations: ['article', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ArticleComment> {
    const comment = await this.articleCommentRepository.findOne({
      where: { id },
      relations: ['article', 'user'],
    });
    if (!comment) {
      throw new NotFoundException(`评论 #${id} 不存在`);
    }
    return comment;
  }

  async findByArticleId(articleId: number): Promise<ArticleComment[]> {
    return await this.articleCommentRepository.find({
      where: { articleId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createDto: any): Promise<ArticleComment> {
    const comment = this.articleCommentRepository.create(createDto);
    return await this.articleCommentRepository.save(comment);
  }

  async update(id: number, updateDto: any): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    const updatedComment = this.articleCommentRepository.merge(comment, updateDto);
    return await this.articleCommentRepository.save(updatedComment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.articleCommentRepository.remove(comment);
  }

  async approve(id: number): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    comment.status = 1; // 审核通过
    return await this.articleCommentRepository.save(comment);
  }

  async reject(id: number): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    comment.status = 2; // 审核拒绝
    return await this.articleCommentRepository.save(comment);
  }

  async getStatistics(articleId?: number): Promise<any> {
    let query = this.articleCommentRepository.createQueryBuilder('comment');
    
    if (articleId) {
      query = query.where('comment.articleId = :articleId', { articleId });
    }
    
    const total = await query.getCount();
    const pending = await query.where('comment.status = 0').getCount();
    const approved = await query.where('comment.status = 1').getCount();
    const rejected = await query.where('comment.status = 2').getCount();
    
    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}