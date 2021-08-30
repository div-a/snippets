import { Page } from "../entity/Page";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PageResolver {
  @Mutation(() => Page)
  async createPage(@Arg("name") name: string) {
    const page = await Page.create({
      name,
    }).save();
    return page;
  }

  @Mutation(() => Boolean)
  async updatePage(@Arg("id") id: number, @Arg("newName") newName: string) {
    await Page.update(
      { id },
      {
        name: newName,
      }
    );
    return true;
  }

  @Mutation(() => Boolean)
  async deletePage(@Arg("id") id: number) {
    await Page.delete({ id });
    return true;
  }

  @Query(() => [Page])
  async pages() {
    let res = await Page.find();
    return res;
  }
}
