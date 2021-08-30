import { Page } from "../entity/Page";
import { Arg, Mutation, Resolver } from "type-graphql";

@Resolver()
export class PageResolver {
  @Mutation(() => Boolean)
  async CreatePage(@Arg("name") name: string) {
    const page = new Page();
    page.name = name;
    await page.save();
    return true;
  }
}
