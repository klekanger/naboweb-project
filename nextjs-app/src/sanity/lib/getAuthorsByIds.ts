import { client } from "@/sanity/lib/client";
import { Authors } from "@/types/sanity.types";

export async function getAuthorsByIds(ids: string[]): Promise<Authors[]> {
  if (!ids.length) return [];

  const query = `*[_type == "authors" && _id in $ids]{ _id, emailSubscription }`;
  return client.fetch(query, { ids });
}
