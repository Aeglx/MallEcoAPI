import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { SpecialPage } from './special-page.entity';

@Entity('special_page_section')
export class SpecialPageSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 200, nullable: true })
  image: string;

  @Column({ length: 100 })
  sectionType: string; // 'banner', 'product', 'article', 'video', 'custom'

  @Column({ type: 'json', nullable: true })
  config: any;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  specialPageId: number;

  @ManyToOne(() => SpecialPage, specialPage => specialPage.sections)
  specialPage: SpecialPage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}