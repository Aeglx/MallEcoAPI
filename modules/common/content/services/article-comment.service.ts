import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleComment } from '../entities/article-comment.entity';
import { CreateArticleCommentDto } from '../dto/create-article-comment.dto';
import { UpdateArticleCommentDto } from '../dto/update-article-comment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class ArticleCommentService {
  constructor(
    @InjectRepository(ArticleComment)
    private readonly commentRepository: Repository<ArticleComment>,
  ) {}

  async create(createCommentDto: CreateArticleCommentDto): Promise<ArticleComment> {
    const comment = this.commentRepository.create(createCommentDto);
    
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });
      
      if (!parentComment) {
        throw new NotFoundException(`父评论 #${createCommentDto.parentId} 不存在`);
      }
    }

    return await this.commentRepository.save(comment);
  }

  async findByArticle(articleId: number, paginationDto: PaginationDto): Promise<[ArticleComment[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    return await this.commentRepository.findAndCount({
      where: { 
        articleId,
        parentId: null, // 只获取顶级评论
        status: 'approved'
      },
      relations: ['replies'],
      order: { 
        isTop: 'DESC',
        likeCount: 'DESC',
        createdAt: 'DESC'
      },
      skip,
      take: limit,
    });
  }

  async findReplies(parentId: number): Promise<ArticleComment[]> {
    return await this.commentRepository.find({
      where: { 
        parentId,
        status: 'approved'
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<ArticleComment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['article', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException(`评论 #${id} 不存在`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateArticleCommentDto): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    
    // 检查是否有回复
    if (comment.replies && comment.replies.length > 0) {
      throw new NotFoundException('该评论下有回复，无法删除');
    }

    await this.commentRepository.remove(comment);
  }

  async approve(id: number): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    comment.status = 'approved';
    return await this.commentRepository.save(comment);
  }

  async reject(id: number): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    comment.status = 'rejected';
    return await this.commentRepository.save(comment);
  }

  async setTop(id: number, isTop: boolean): Promise<ArticleComment> {
    const comment = await this.findOne(id);
    comment.isTop = isTop;
    return await this.commentRepository.save(comment);
  }

  async incrementLikeCount(id: number): Promise<void> {
    await this.commentRepository.increment({ id }, 'likeCount', 1);
  }

  async decrementLikeCount(id: number): Promise<void> {
    await this.commentRepository.decrement({ id }, 'likeCount', 1);
  }

  async getPendingComments(): Promise<ArticleComment[]> {
    return await this.commentRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getCommentStatistics(): Promise<any> {
    const total = await this.commentRepository.count();
    const approved = await this.commentRepository.count({ where: { status: 'approved' } });
    const pending = await this.commentRepository.count({ where: { status: 'pending' } });
    const rejected = await this.commentRepository.count({ where: { status: 'rejected' } });

    return {
      total,
      approved,
      pending,
      rejected,
    };
  }
}