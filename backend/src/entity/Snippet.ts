import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from "typeorm";
import { Page } from "./Page";

@ObjectType()
@Entity()
export class Snippet extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  text: string;

  @Field(() => Int)
  @Column()
  pageId: number;

  @ManyToOne((_type) => Page, (page) => page.snippets)
  @JoinColumn({ name: "pageId" })
  page: Page;

  @Field(() => Date)
  @Column()
  reviseAt: Date;

  @Field(() => Int)
  @Column()
  score: number;

  @Field()
  @Column()
  question: string;
}
