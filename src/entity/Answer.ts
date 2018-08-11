import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './Question';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn() id: number;

  @Column() content: string;

  @ManyToOne(type => Question)
  question: Question;
}
