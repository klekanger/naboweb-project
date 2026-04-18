"use client";

import dynamic from "next/dynamic";
import type { BlogPostData } from "./BlogEditor";

const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false });

type Author = {
  _id: string;
  firstName: string | null;
  lastName: string | null;
};

type Props = {
  mode: "create" | "edit";
  initialData?: BlogPostData;
  authors: Author[];
};

export default function BlogEditorClient(props: Props) {
  return <BlogEditor {...props} />;
}
