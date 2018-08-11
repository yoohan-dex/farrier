import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { FailAnswer } from './FailAnswer';

@Entity()
export class Performance {
  @PrimaryGeneratedColumn() id: number;

  @Column('uuid') user: string;

  @Column('simple-array')
  pass: number[];

  @Column('simple-array')
  fail: number[];

  @ManyToMany(type => FailAnswer, { eager: true })
  @JoinTable()
  failAnswers: FailAnswer[];
}
