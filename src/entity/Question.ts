import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Answer } from './Answer';

@Entity()
export class Question {
  @PrimaryGeneratedColumn() id: number;

  @Column('text', { nullable: true })
  content: string;

  @Column('int', { nullable: true })
  type: number;

  @OneToMany(type => Answer, answer => answer.question, {
    eager: true,
    nullable: true,
  })
  answers: Answer[];

  @Column('simple-array', { nullable: true })
  rightAnswer: number[];

  @ManyToOne(type => Question, q => q.questions, { nullable: true })
  parent: Question;

  @OneToMany(type => Question, q => q.parent, { nullable: true })
  questions: Question[];

  @Column('text', { nullable: true })
  analysis: string;
}
