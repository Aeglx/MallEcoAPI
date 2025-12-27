import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recommendation_user_preference')
export class UserPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'preference_type', type: 'varchar', length: 50 })
  preferenceType: string;

  @Column({ name: 'preference_data', type: 'json' })
  preferenceData: Record<string, any>;

  @Column({ name: 'score', type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
