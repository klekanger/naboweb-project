"use client";

import dynamic from "next/dynamic";
import type { BlogPostData } from "./BlogEditor";

const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false });

type Props = {
  mode: "create" | "edit";
  initialData?: BlogPostData;
  currentAuthorId: string;
  authorDisplayName: string;
  currentUserEmail?: string;
  currentAuthorPortraitUrl?: string | null;
  isAdmin: boolean;
};

export default function BlogEditorClient(props: Props) {
  return <BlogEditor {...props} />;
}
