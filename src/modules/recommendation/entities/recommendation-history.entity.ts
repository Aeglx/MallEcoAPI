import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendation_history')
export class RecommendationHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'recommendation_type', type: 'varchar', length: 50 })
  recommendationType: string;

  @Column({ name: 'recommendation_items', type: 'jsonb' })
  recommendationItems: Record<string, any>[];

  @Column({ name: 'algorithm_used', type: 'varchar', length: 100 })
  algorithmUsed: string;

  @Column({ name: 'context_data', type: 'jsonb', nullable: true })
  contextData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
