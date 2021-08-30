import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Snippet } from "./Snippet";

@ObjectType()
@Entity()
export class Page extends BaseEntity {
  @Field(() => Int) // for type-graphql
  @PrimaryGeneratedColumn() // for orm
  id: number;

  @Field()
  @Column()
  name: string;

  @Field((_type) => [Snippet], { nullable: true })
  @OneToMany((_type) => Snippet, (snip) => snip.page, {
    cascade: true,
  })
  snippets: Snippet[];
}
