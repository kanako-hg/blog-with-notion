import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

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
  slug: any;
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

export const getSinglePost = async (slug: any) => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID ?? "",
    filter: {
      property: "Slug",
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });

  const page = response.results[0];
  const metadata = getPageMetaData(page);
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    metadata,
    markdown: mdString,
  };
};
