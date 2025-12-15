import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackStatus } from '../entities/feedback.entity';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback) private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async getFeedbackById(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException('反馈记录不存在');
    }
    return feedback;
  }

  async getFeedbacksByUserId(userId: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllFeedbacks(page: number = 1, limit: number = 10): Promise<{ data: Feedback[], total: number }> {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await this.feedbackRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
    return { data: feedbacks, total };
  }

  async replyFeedback(id: number, reply: string, adminId: number): Promise<Feedback> {
    const feedback = await this.getFeedbackById(id);
    feedback.reply = reply;
    feedback.adminId = adminId;
    feedback.status = FeedbackStatus.RESOLVED;
    return this.feedbackRepository.save(feedback);
  }

  async updateFeedbackStatus(id: number, status: FeedbackStatus): Promise<Feedback> {
    const feedback = await this.getFeedbackById(id);
    feedback.status = status;
    return this.feedbackRepository.save(feedback);
  }

  async deleteFeedback(id: number): Promise<void> {
    const result = await this.feedbackRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('反馈记录不存在');
    }
  }
}