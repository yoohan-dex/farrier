import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FailAnswer {
  @PrimaryGeneratedColumn() id: number;

  @Column() questionId: number;

  @Column('simple-array') selectedAnswer: number[];
}
