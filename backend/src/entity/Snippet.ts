import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Snippet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  pageId: number;

  @Column()
  reviseAt: Date;

  @Column()
  score: number;

  @Column()
  question: string;
}
