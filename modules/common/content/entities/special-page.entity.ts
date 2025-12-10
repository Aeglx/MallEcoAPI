import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SpecialPageSection } from './special-page-section.entity';

@Entity('special_page')
export class SpecialPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  coverImage: string;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: false })
  isTop: boolean;

  @Column({ default: false })
  isRecommend: boolean;

  @Column({ length: 100, nullable: true })
  templateType: string;

  @Column({ type: 'json', nullable: true })
  seoConfig: {
    title: string;
    keywords: string;
    description: string;
  };

  @Column({ type: 'json', nullable: true })
  styleConfig: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    fontFamily: string;
  };

  @OneToMany(() => SpecialPageSection, section => section.specialPage)
  sections: SpecialPageSection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}