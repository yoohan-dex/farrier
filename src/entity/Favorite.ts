import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from 'typeorm';
import { Question } from './Question';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn() id: number;

  @ManyToMany(type => Question, { eager: true })
  questions: Question[];

  @Column() userId: string;
}
