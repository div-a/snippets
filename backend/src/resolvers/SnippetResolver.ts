import { Snippet } from "../entity/Snippet";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class SnippetResolver {
  @Mutation(() => Snippet)
  async createSnippet(
    @Arg("text") text: string,
    @Arg("pageId") pageId: number,
    @Arg("reviseAt", { nullable: true }) reviseAt: Date,
    @Arg("score") score: number,
    @Arg("question") question: string
  ) {
    reviseAt = reviseAt ?? new Date();
    return await Snippet.create({
      text,
      pageId,
      reviseAt,
      score,
      question,
    }).save();
  }

  // @Mutation(() => Boolean)
  // async updateSnippet(@Arg("id") id: number, @Arg("newName") newName: string) {
  //   await Snippet.update(
  //     { id },
  //     {
  //       name: newName,
  //     }
  //   );
  //   return true;
  // }

  @Mutation(() => Boolean)
  async deleteSnippet(@Arg("id") id: number) {
    await Snippet.delete({ id });
    return true;
  }

  @Query(() => [Snippet])
  async snippets() {
    let res = await Snippet.find();

    return res;
  }
}
