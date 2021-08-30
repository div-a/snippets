import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity()
export class Page extends BaseEntity {
  @Field(() => Int) // for type-graphql
  @PrimaryGeneratedColumn() // for orm
  id: number;

  @Field()
  @Column()
  name: string;
}
