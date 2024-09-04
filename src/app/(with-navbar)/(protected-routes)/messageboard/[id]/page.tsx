import { countMessages } from "@/sanity/lib/queries";

type MessagePageParams = {
  params: { id: number | undefined };
};

export async function generateStaticParams() {
  const numberOfMessages = await countMessages();

  return Array.from({ length: numberOfMessages }).map((_, i) => ({
    id: `${i + 1}`,
  }));
}

export default function MessagePage({ params }: MessagePageParams) {
  const blogId = params?.id;

  // const data = await fetchMessage(params?.id);

  return (
    <section>
      <h1 className="lg:prose-xl pb-16 font-thin">Melding</h1>
      {params.id}
    </section>
  );
}
