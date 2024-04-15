import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const getAllPosts = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID ?? "",
    page_size: 100,
  });

  const allPosts = posts.results;

  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};

// メタデータ取得用の関数
const getPageMetaData = (
  post: any
): {
  id: string;
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: any;
} => {
  const getTags = (tags: any) => {
    const allTags = tags.map((tag: any) => {
      return tag.name;
    });
    return allTags;
  };

  return {
    id: post.id,
    title: post.properties.Name.title[0].plain_text,
    description: post.properties.Text.rich_text[0].text.content,
    date: post.properties.Date.date.start,
    slug: post.properties.Slug.rich_text[0].text.content,
    tags: getTags(post.properties.Tags.multi_select),
  };
};
