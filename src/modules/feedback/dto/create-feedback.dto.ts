import { ApiProperty } from '@nestjs/swagger';
import { FeedbackType } from '../entities/feedback.entity';


export class CreateFeedbackDto {
  @ApiProperty({ description: '用户ID', required: false, example: 1 })
  userId?: number;

  @ApiProperty({ description: '反馈类型', enum: FeedbackType, example: FeedbackType.SUGGESTION })
  type: FeedbackType;

  @ApiProperty({ description: '反馈标题', example: '建议增加商品搜索功能' })
  title: string;

  @ApiProperty({ description: '反馈内容', example: '希望能够增加按商品属性筛选的搜索功能' })
  content: string;

  @ApiProperty({ description: '联系方式', required: false, example: 'user@example.com' })
  contact?: string;

  @ApiProperty({ description: '反馈图片URL列表', required: false, example: ['https://example.com/image1.jpg'] })
  images?: string[];
}
