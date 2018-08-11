import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Question } from './Question';
import { FailAnswer } from './FailAnswer';

@Entity()
export class Performance {
  @PrimaryGeneratedColumn() id: number;

  @Column('uuid') user: string;

  @ManyToMany(type => Question, { eager: true })
  @JoinTable()
  pass: Question[];

  @ManyToMany(type => Question, { eager: true })
  @JoinTable()
  fail: Question[];

  @ManyToMany(type => FailAnswer, { eager: true })
  @JoinTable()
  failAnswers: FailAnswer[];
}
