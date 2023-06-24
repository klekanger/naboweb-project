import HeroWide from '@/components/hero-wide';
import * as contentful from 'contentful';

type FrontPageDataSkeleton = {
  contentTypeId: string;
  fields: {
    pageTitle: contentful.EntryFieldTypes.Text;
    excerpt: contentful.EntryFieldTypes.Text;
    pageImage: contentful.EntryFieldTypes.AssetLink;
  };
};

async function getFrontPageData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const data = client.getEntries<FrontPageDataSkeleton>({
    content_type: 'forsidetekst',
  });

  return data;
}

export default async function Home() {
  const frontPageData = await getFrontPageData();
  const { pageTitle, excerpt, pageImage } = frontPageData.items[0].fields;

  return (
    <div>
      <h1>hello</h1>
      <HeroWide pageTitle={pageTitle} excerpt={excerpt} pageImage={pageImage} />
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
      <h1>dfsdfsdf</h1>
    </div>
  );
}
